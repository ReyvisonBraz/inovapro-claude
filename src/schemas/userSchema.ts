import { z } from 'zod';

export const userSchema = z.object({
  username: z.string().min(3, 'O login deve ter pelo menos 3 caracteres'),
  password: z.string().optional().refine((val) => {
    // Password is required for new users, but optional for editing
    return true; // We'll handle this in the component or with a more complex refinement
  }, 'A senha é obrigatória'),
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  role: z.enum(['owner', 'manager', 'employee']),
  permissions: z.array(z.string()).default([]),
});

export type UserFormData = z.infer<typeof userSchema>;
