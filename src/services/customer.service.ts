import { prisma } from '../lib/prisma.js';
import type { CustomerFormData } from '../schemas/index.js';
import { ConflictError, NotFoundError } from '../lib/errors.js';

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

  async update(id: number, data: Partial<CustomerFormData>, expectedVersion?: number) {
    const fields = ['firstName', 'lastName', 'nickname', 'cpf', 'companyName', 'phone', 'observation', 'creditLimit', 'updatedBy'] as const;
    const updateData: Record<string, unknown> = {};

    for (const field of fields) {
      const value = (data as Record<string, unknown>)[field];
      if (value !== undefined) {
        updateData[field] = value;
      }
    }

    return prisma.$transaction(async (tx) => {
      updateData.version = { increment: 1 };

      const result = await tx.customer.updateMany({
        where: expectedVersion !== undefined ? { id, version: expectedVersion } : { id },
        data: updateData,
      });

      if (result.count === 0) {
        const exists = await tx.customer.findUnique({ where: { id }, select: { id: true } });
        if (!exists) throw new NotFoundError('Cliente não encontrado');
        throw new ConflictError();
      }

      if (updateData.firstName !== undefined || updateData.lastName !== undefined || updateData.phone !== undefined) {
        const customer = await tx.customer.findUniqueOrThrow({ where: { id }, select: { firstName: true, lastName: true, phone: true } });
        const fullName = `${customer.firstName} ${customer.lastName}`;
        await tx.serviceOrder.updateMany({
          where: { customerId: id },
          data: { firstName: customer.firstName, lastName: customer.lastName, phone: customer.phone },
        });
        await tx.transaction.updateMany({
          where: { customerId: id },
          data: { customerName: fullName, customerPhone: customer.phone },
        });
      }

      return tx.customer.findUniqueOrThrow({ where: { id } });
    });
  }

  async getPayments(customerId: number) {
    return prisma.clientPayment.findMany({
      where: { customerId },
    });
  }

  async delete(customerId: number) {
    return prisma.$transaction(async (tx) => {
      const paymentIds = await tx.clientPayment.findMany({
        where: { customerId },
        select: { id: true },
      }).then(payments => payments.map(p => p.id));

      if (paymentIds.length > 0) {
        await Promise.all([
          tx.transaction.deleteMany({ where: { paymentId: { in: paymentIds } } }),
          tx.receipt.deleteMany({ where: { paymentId: { in: paymentIds } } }),
        ]);
      }

      await tx.clientPayment.deleteMany({ where: { customerId } });
      await tx.serviceOrder.deleteMany({ where: { customerId } });
      await tx.customer.delete({ where: { id: customerId } });

      return true;
    });
  }
}

export const customerService = new CustomerService();