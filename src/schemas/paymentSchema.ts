import { z } from 'zod';

export const clientPaymentSchema = z.object({
  customerId: z.number().min(1, 'Selecione um cliente'),
  description: z.string().min(1, 'A descrição é obrigatória'),
  totalAmount: z.coerce.number().min(0.01, 'O valor total deve ser maior que zero'),
  paidAmount: z.coerce.number().min(0, 'O valor pago não pode ser negativo'),
  purchaseDate: z.string().min(1, 'A data da compra é obrigatória'),
  dueDate: z.string().min(1, 'A data de vencimento é obrigatória'),
  paymentMethod: z.string().min(1, 'A forma de pagamento é obrigatória'),
  installmentsCount: z.coerce.number().min(1, 'O número de parcelas deve ser pelo menos 1'),
  installmentInterval: z.string().optional(),
  status: z.enum(['pending', 'paid', 'overdue']).default('pending'),
  serviceOrderId: z.number().optional(),
});

export type ClientPaymentFormData = z.infer<typeof clientPaymentSchema>;

export const recordPaymentSchema = z.object({
  amount: z.coerce.number().min(0.01, 'O valor deve ser maior que zero'),
  date: z.string().min(1, 'A data do pagamento é obrigatória'),
});

export type RecordPaymentFormData = z.infer<typeof recordPaymentSchema>;
