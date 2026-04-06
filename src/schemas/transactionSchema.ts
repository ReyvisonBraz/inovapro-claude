import { z } from 'zod';

export const transactionSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  type: z.enum(['income', 'expense']),
  amount: z.string().transform((val) => Number(val.replace(',', '.'))).refine((val) => val > 0, 'Valor deve ser maior que zero'),
  date: z.string().min(1, 'Data é obrigatória'),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;
