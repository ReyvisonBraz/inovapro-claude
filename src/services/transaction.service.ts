import { prisma } from '../lib/prisma.js';
import { z } from 'zod';

// Tipagem parcial compatível com o TransactionSchema das rotas
type TransactionData = {
  description?: string;
  category: string;
  type: 'income' | 'expense';
  amount: number;
  date: string;
  createdBy?: number;
  updatedBy?: number;
  customerId?: number | null;
  customerName?: string | null;
  customerPhone?: string | null;
};

export class TransactionService {
  async findMany(options: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
    minAmount?: number;
    maxAmount?: number;
  }) {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const { search, type, category, startDate, endDate, minAmount, maxAmount } = options;
    
    const where: Record<string, unknown> = {};
    
    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (type && type !== 'all') where.type = type;
    if (category && category !== 'all') where.category = category;
    if (startDate) where.date = { ...(where.date as object || {}), gte: startDate };
    if (endDate) where.date = { ...(where.date as object || {}), lte: endDate };
    if (minAmount !== undefined && !isNaN(minAmount)) where.amount = { ...(where.amount as object || {}), gte: minAmount };
    if (maxAmount !== undefined && !isNaN(maxAmount)) where.amount = { ...(where.amount as object || {}), lte: maxAmount };

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ date: 'desc' }, { id: 'desc' }],
      }),
      prisma.transaction.count({ where }),
    ]);

    return {
      data: transactions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async create(data: TransactionData) {
    const { description, category, type, amount, date, createdBy, customerId, customerName, customerPhone } = data;
    
    let finalCustomerId = customerId;
    let finalCustomerName = customerName;
    let finalCustomerPhone = customerPhone;
    
    if (customerId && !customerName) {
      const customer = await prisma.customer.findUnique({ where: { id: customerId } });
      if (customer) {
        finalCustomerName = `${customer.firstName} ${customer.lastName}`;
        finalCustomerPhone = customer.phone;
      }
    }
    
    return prisma.transaction.create({
      data: {
        description: description || 'Sem descrição',
        category,
        type,
        amount,
        date,
        createdBy: createdBy || 1,
        customerId: finalCustomerId,
        customerName: finalCustomerName,
        customerPhone: finalCustomerPhone,
      },
    });
  }

  async update(id: number, data: TransactionData) {
    const { description, category, type, amount, date, updatedBy } = data;
    
    return prisma.transaction.update({
      where: { id },
      data: {
        description: description || 'Sem descrição',
        category,
        type,
        amount,
        date,
        updatedBy: updatedBy || 1,
      },
    });
  }

  async delete(id: number) {
    return prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.findUnique({ where: { id } });
      if (!transaction) throw new Error('Transação não encontrada.');

      if (transaction.paymentId) {
        const payment = await tx.clientPayment.findUnique({ where: { id: transaction.paymentId } });
        if (payment) {
          const newPaidAmount = Math.max(0, payment.paidAmount - transaction.amount);
          const newStatus = newPaidAmount >= payment.totalAmount ? 'paid' : 'pending';

          await tx.clientPayment.update({
            where: { id: transaction.paymentId },
            data: { paidAmount: newPaidAmount, status: newStatus },
          });
        }
      }

      await tx.transaction.delete({ where: { id } });
      return transaction;
    });
  }
}

export const transactionService = new TransactionService();
