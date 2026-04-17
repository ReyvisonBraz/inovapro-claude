import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  category: z.enum(['product', 'service']),
  sku: z.string().optional(),
  unitPrice: z.union([z.string(), z.number()]).optional(),
  stockLevel: z.union([z.string(), z.number()]).optional(),
});

export type ProductFormData = {
  name: string;
  category: 'product' | 'service';
  sku?: string;
  unitPrice?: string | number;
  stockLevel?: string | number;
};
