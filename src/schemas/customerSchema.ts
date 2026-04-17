import { z } from 'zod';

export const customerSchema = z.object({
  firstName: z.string().min(1, 'Nome é obrigatório'),
  lastName: z.string().min(1, 'Sobrenome é obrigatório'),
  nickname: z.string().optional(),
  cpf: z.string().optional(),
  companyName: z.string().optional(),
  phone: z.string().min(10, 'Telefone inválido'),
  observation: z.string().optional(),
  creditLimit: z.union([z.string(), z.number()]).optional(),
});

export type CustomerFormData = {
  firstName: string;
  lastName: string;
  nickname?: string;
  cpf?: string;
  companyName?: string;
  phone: string;
  observation?: string;
  creditLimit?: string | number;
};
