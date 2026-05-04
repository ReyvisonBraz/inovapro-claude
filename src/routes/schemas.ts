import { z } from 'zod';

export const TransactionSchema = z.object({
  description: z.string().min(0),
  category: z.string().min(1),
  type: z.enum(['income', 'expense']),
  amount: z.coerce.number().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}/),
  createdBy: z.coerce.number().optional(),
  updatedBy: z.coerce.number().optional(),
  customerId: z.coerce.number().optional().nullable(),
  customerName: z.string().optional().nullable(),
  customerPhone: z.string().optional().nullable()
});



export const ClientPaymentSchema = z.object({
  customerId: z.coerce.number(),
  description: z.string().min(1),
  totalAmount: z.coerce.number().positive(),
  paidAmount: z.coerce.number().nonnegative().optional(),
  purchaseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}/),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}/),
  paymentMethod: z.string().min(1),
  status: z.enum(['pending', 'partial', 'paid']).optional(),
  installmentsCount: z.coerce.number().int().positive().optional(),
  type: z.enum(['income', 'expense']).optional(),
  saleId: z.string().optional().nullable(),
  paymentHistory: z.string().optional(),
  createdBy: z.coerce.number().optional(),
  updatedBy: z.coerce.number().optional()
});


