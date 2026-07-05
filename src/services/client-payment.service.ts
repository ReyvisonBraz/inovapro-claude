import { prisma } from '../lib/prisma.js';
import { BusinessError, ConflictError, NotFoundError } from '../lib/errors.js';

type ClientPaymentData = {
  customerId: number;
  description: string;
  totalAmount: number;
  paidAmount?: number;
  purchaseDate: string;
  dueDate: string;
  paymentMethod: string;
  status?: string;
  installmentsCount?: number;
  type?: string;
  saleId?: string | null;
  createdBy?: number;
};

export class ClientPaymentService {
  async findMany(options: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const { search } = options;
    
    const where: Record<string, unknown> = search ? {
      OR: [
        { description: { contains: search, mode: 'insensitive' } },
        { saleId: { contains: search, mode: 'insensitive' } },
        { customer: { firstName: { contains: search, mode: 'insensitive' } } },
        { customer: { lastName: { contains: search, mode: 'insensitive' } } },
      ],
    } : {};
    
    const [payments, total] = await Promise.all([
      prisma.clientPayment.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { dueDate: 'asc' },
        include: { customer: { select: { firstName: true, lastName: true } } },
      }),
      prisma.clientPayment.count({ where }),
    ]);
    
    const data = payments.map(p => ({ 
      ...p, 
      customerName: `${p.customer.firstName} ${p.customer.lastName}` 
    }));
    
    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async create(data: ClientPaymentData) {
    const { 
      customerId, description, totalAmount, paidAmount, purchaseDate, dueDate, 
      paymentMethod, status, installmentsCount, type, saleId, createdBy 
    } = data;
    
    const initialPaymentHistory = paidAmount && paidAmount > 0
      ? JSON.stringify([{ amount: paidAmount, date: new Date().toISOString() }])
      : '[]';
      
    return prisma.$transaction(async (tx) => {
      const payment = await tx.clientPayment.create({
        data: {
          customerId, 
          description, 
          totalAmount, 
          paidAmount: paidAmount || 0, 
          purchaseDate, 
          dueDate,
          paymentMethod, 
          status: status || 'pending', 
          installmentsCount: installmentsCount || 1,
          type: type || 'income', 
          saleId, 
          paymentHistory: initialPaymentHistory,
        },
      });
      
      if (paidAmount && paidAmount > 0) {
        const customer = await tx.customer.findUnique({ where: { id: customerId } });
        const customerName = customer ? `${customer.firstName} ${customer.lastName}` : 'Cliente';
        
        await tx.transaction.create({
          data: {
            description: `Pagamento: ${description} (${customerName})`, 
            category: 'Vendas',
            type: 'income', 
            amount: paidAmount, 
            date: purchaseDate || new Date().toISOString().split('T')[0],
            createdBy: createdBy || 1, 
            paymentId: payment.id, 
            saleId,
            customerId, 
            customerName, 
            customerPhone: customer?.phone,
          },
        });
      }
      
      return payment;
    });
  }

  async update(
    id: number,
    data: { paidAmount?: number, status?: string, paymentHistory?: any, updatedBy?: number },
    expectedVersion?: number
  ) {
    const { paidAmount, status, paymentHistory, updatedBy } = data;

    const updateData: Record<string, unknown> = {
      updatedBy: updatedBy || 1,
      version: { increment: 1 },
    };

    if (paidAmount !== undefined) updateData.paidAmount = paidAmount;
    if (status !== undefined) updateData.status = status;
    if (paymentHistory) updateData.paymentHistory = JSON.stringify(paymentHistory);

    const result = await prisma.clientPayment.updateMany({
      where: expectedVersion !== undefined ? { id, version: expectedVersion } : { id },
      data: updateData as any,
    });

    if (result.count === 0) {
      const exists = await prisma.clientPayment.findUnique({ where: { id }, select: { id: true } });
      if (!exists) throw new NotFoundError('Pagamento não encontrado');
      throw new ConflictError();
    }

    return prisma.clientPayment.findUniqueOrThrow({ where: { id } });
  }

  async registerPayment(id: number, data: { amount: number, date?: string, updatedBy?: number }) {
    const { date, updatedBy } = data;
    const amount = parseFloat(String(data.amount));

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BusinessError('Valor de pagamento inválido');
    }

    return prisma.$transaction(async (tx) => {
      // Incremento atômico: o UPDATE trava a linha até o commit, então dois
      // recebimentos simultâneos são serializados pelo banco e nenhum valor
      // se perde (sem read-modify-write).
      let payment;
      try {
        payment = await tx.clientPayment.update({
          where: { id },
          data: {
            paidAmount: { increment: amount },
            updatedBy: updatedBy || 1,
            version: { increment: 1 },
          },
        });
      } catch (err: any) {
        if (err?.code === 'P2025') throw new NotFoundError('Pagamento não encontrado');
        throw err;
      }

      const newPaidAmount = payment.paidAmount ?? 0;

      // Tolerância de 1 centavo para ruído de ponto flutuante
      if (newPaidAmount > payment.totalAmount + 0.01) {
        throw new BusinessError('Valor excede o saldo restante deste pagamento');
      }

      const newStatus = newPaidAmount >= payment.totalAmount ? 'paid' : 'partial';

      // A linha está travada desde o UPDATE acima, então este append no
      // histórico não corre com outras transações.
      let history: Array<{ amount: number; date: string }> = [];
      try { history = JSON.parse(payment.paymentHistory || '[]'); } catch { /* empty */ }

      history.push({ amount, date: date || new Date().toISOString() });

      await tx.clientPayment.update({
        where: { id },
        data: {
          status: newStatus,
          paymentHistory: JSON.stringify(history),
        },
      });

      const customer = await tx.customer.findUnique({ where: { id: payment.customerId } });
      const customerName = customer ? `${customer.firstName} ${customer.lastName}` : 'Cliente';
      
      await tx.transaction.create({
        data: {
          description: `Recebimento: ${payment.description} (${customerName})`, 
          category: 'Vendas',
          type: 'income', 
          amount, 
          date: (date || new Date().toISOString()).split('T')[0],
          createdBy: updatedBy || 1, 
          paymentId: id, 
          saleId: payment.saleId || null,
          customerId: payment.customerId, 
          customerName, 
          customerPhone: customer?.phone,
        },
      });
      
      return { newPaidAmount, newStatus };
    });
  }

  async delete(id: number) {
    return prisma.$transaction(async (tx) => {
      await tx.transaction.deleteMany({ where: { paymentId: id } });
      await tx.receipt.deleteMany({ where: { paymentId: id } });
      const deleted = await tx.clientPayment.delete({ where: { id } });
      return deleted;
    });
  }
}

export const clientPaymentService = new ClientPaymentService();
