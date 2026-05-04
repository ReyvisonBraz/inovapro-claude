import { z } from 'zod';

export const customerSchema = z.object({
  firstName: z.string().min(1, 'Nome é obrigatório'),
  lastName: z.string().min(1, 'Sobrenome é obrigatório'),
  nickname: z.string().optional().nullable(),
  cpf: z.string().optional().nullable(),
  companyName: z.string().optional().nullable(),
  phone: z.string().min(10, 'Telefone inválido'),
  observation: z.string().optional().nullable(),
  creditLimit: z.coerce.number().nonnegative().optional(),
  createdBy: z.coerce.number().optional(),
  updatedBy: z.coerce.number().optional(),
});

export type CustomerFormData = z.infer<typeof customerSchema>;
