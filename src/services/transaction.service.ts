import { prisma } from '../lib/prisma.js';
import { ConflictError, NotFoundError } from '../lib/errors.js';
import { buildTransactionFilters, toPrismaDate } from '../lib/prisma-helpers.js';
import { isPrismaNotFoundError } from '../lib/prisma-error.js';

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
    
    const where = buildTransactionFilters(options);

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
    
    const finalCustomerId = customerId;
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
        date: toPrismaDate(date),
        createdBy: createdBy || 1,
        customerId: finalCustomerId,
        customerName: finalCustomerName,
        customerPhone: finalCustomerPhone,
      },
    });
  }

  async update(id: number, data: TransactionData, expectedVersion?: number) {
    const { description, category, type, amount, date, updatedBy } = data;

    const result = await prisma.transaction.updateMany({
      where: expectedVersion !== undefined ? { id, version: expectedVersion } : { id },
      data: {
        description: description || 'Sem descrição',
        category,
        type,
        amount,
        date: toPrismaDate(date),
        updatedBy: updatedBy || 1,
        version: { increment: 1 },
      },
    });

    if (result.count === 0) {
      const exists = await prisma.transaction.findUnique({ where: { id }, select: { id: true } });
      if (!exists) throw new NotFoundError('Transação não encontrada');
      throw new ConflictError();
    }

    return prisma.transaction.findUniqueOrThrow({ where: { id } });
  }

  async delete(id: number) {
    return prisma.$transaction(async (tx) => {
      // Exclui primeiro: se duas exclusões simultâneas correrem, apenas uma
      // consegue deletar a linha; a outra falha aqui e a transação inteira
      // (incluindo o estorno abaixo) é revertida — sem estorno duplicado.
      let transaction;
      try {
        transaction = await tx.transaction.delete({ where: { id } });
      } catch (err: unknown) {
        if (isPrismaNotFoundError(err)) throw new NotFoundError('Transação não encontrada.');
        throw err;
      }

      if (transaction.paymentId) {
        let payment = null;
        try {
          payment = await tx.clientPayment.update({
            where: { id: transaction.paymentId },
            data: {
              paidAmount: { decrement: transaction.amount },
              version: { increment: 1 },
            },
          });
        } catch (err: unknown) {
          if (!isPrismaNotFoundError(err)) throw err;
        }

        if (payment) {
          const clamped = Math.max(0, Number(payment.paidAmount ?? 0));
          const newStatus = clamped >= Number(payment.totalAmount) ? 'paid' : 'pending';
          await tx.clientPayment.update({
            where: { id: transaction.paymentId },
            data: { paidAmount: clamped, status: newStatus },
          });
        }
      }

      return transaction;
    });
  }
}

export const transactionService = new TransactionService();
