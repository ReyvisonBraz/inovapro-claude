import { prisma } from '../lib/prisma.js';
import { CustomerFormData } from '../schemas/customerSchema.js';

export class CustomerService {
  async findMany(options: { page?: number; limit?: number; search?: string }) {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const search = options.search;

    const where = search ? {
      OR: [
        { firstName: { contains: search, mode: 'insensitive' as const } },
        { lastName: { contains: search, mode: 'insensitive' as const } },
        { nickname: { contains: search, mode: 'insensitive' as const } },
        { phone: { contains: search, mode: 'insensitive' as const } },
        { companyName: { contains: search, mode: 'insensitive' as const } },
      ],
    } : {};

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { firstName: 'asc' },
      }),
      prisma.customer.count({ where }),
    ]);

    return {
      data: customers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByPhone(phone: string, excludeId?: number) {
    return prisma.customer.findFirst({
      where: { phone, ...(excludeId ? { id: { not: excludeId } } : {}) },
    });
  }

  async create(data: CustomerFormData) {
    const { firstName, lastName, nickname, cpf, companyName, phone, observation, creditLimit, createdBy, updatedBy } = data;
    
    return prisma.customer.create({
      data: { 
        firstName, 
        lastName, 
        nickname, 
        cpf, 
        companyName, 
        phone, 
        observation, 
        creditLimit,
        createdBy,
        updatedBy
      },
    });
  }

  async update(id: number, data: CustomerFormData) {
    const { firstName, lastName, nickname, cpf, companyName, phone, observation, creditLimit, updatedBy } = data;
    const fullName = `${firstName} ${lastName}`;

    return prisma.$transaction(async (tx) => {
      // 1. Atualiza o cliente
      const customer = await tx.customer.update({
        where: { id },
        data: { firstName, lastName, nickname, cpf, companyName, phone, observation, creditLimit, updatedBy },
      });

      // 2. Cascata em ordens de serviço e transações (desnormalização)
      await tx.serviceOrder.updateMany({ 
        where: { customerId: id }, 
        data: { firstName, lastName, phone } 
      });
      
      await tx.transaction.updateMany({ 
        where: { customerId: id }, 
        data: { customerName: fullName, customerPhone: phone } 
      });

      return customer;
    });
  }

  async getPayments(customerId: number) {
    return prisma.clientPayment.findMany({
      where: { customerId },
    });
  }

  async delete(customerId: number) {
    return prisma.$transaction(async (tx) => {
      const payments = await tx.clientPayment.findMany({ where: { customerId } });
      
      for (const p of payments) {
        await tx.transaction.deleteMany({ where: { paymentId: p.id } });
        await tx.receipt.deleteMany({ where: { paymentId: p.id } });
      }
      
      await tx.clientPayment.deleteMany({ where: { customerId } });
      await tx.serviceOrder.deleteMany({ where: { customerId } });
      await tx.customer.delete({ where: { id: customerId } });
      
      return true;
    });
  }
}

export const customerService = new CustomerService();
