import { z } from 'zod';

export const clientPaymentSchema = z.object({
  customerId: z.union([z.number(), z.string()]).optional(),
  description: z.string().min(1, 'A descrição é obrigatória'),
  totalAmount: z.union([z.number(), z.string()]).optional(),
  paidAmount: z.union([z.number(), z.string()]).optional(),
  purchaseDate: z.string().min(1, 'A data da compra é obrigatória'),
  dueDate: z.string().min(1, 'A data de vencimento é obrigatória'),
  paymentMethod: z.string().min(1, 'A forma de pagamento é obrigatória'),
  installmentsCount: z.union([z.number(), z.string()]).optional(),
  installmentInterval: z.string().optional(),
  status: z.enum(['pending', 'paid', 'overdue']).optional(),
  serviceOrderId: z.union([z.number(), z.string()]).optional(),
});

export type ClientPaymentFormData = {
  customerId?: string | number;
  description: string;
  totalAmount?: string | number;
  paidAmount?: string | number;
  purchaseDate: string;
  dueDate: string;
  paymentMethod: string;
  installmentsCount?: string | number;
  installmentInterval?: string;
  status?: 'pending' | 'paid' | 'overdue';
  serviceOrderId?: string | number;
};

export const recordPaymentSchema = z.object({
  amount: z.union([z.number(), z.string()]).optional(),
  date: z.string().min(1, 'A data do pagamento é obrigatória'),
});

export type RecordPaymentFormData = {
  amount?: string | number;
  date: string;
};
