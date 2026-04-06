import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  category: z.enum(['product', 'service']),
  sku: z.string().optional(),
  unitPrice: z.string().transform((val) => Number(val.replace(',', '.'))).refine((val) => val >= 0, 'Preço deve ser maior ou igual a zero'),
  stockLevel: z.string().transform((val) => parseInt(val) || 0).optional(),
});

export type ProductFormData = z.infer<typeof productSchema>;
