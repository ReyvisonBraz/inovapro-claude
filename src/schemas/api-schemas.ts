import { z } from 'zod';

export const TransactionSchema = z.object({
  description: z.string().min(0),
  category: z.string().min(1),
  type: z.enum(['income', 'expense']),
  amount: z.coerce.number().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}/),
  customerId: z.coerce.number().optional().nullable(),
  customerName: z.string().optional().nullable(),
  customerPhone: z.string().optional().nullable(),
  version: z.number().int().nonnegative().optional(),
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
});

export const UserCreateSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
  name: z.string().min(1),
  role: z.enum(['owner', 'manager', 'employee']),
  permissions: z.array(z.string()).optional().default([]),
});

export const UserUpdateSchema = z.object({
  name: z.string().min(1),
  role: z.enum(['owner', 'manager', 'employee']),
  password: z.string().min(6).optional(),
  permissions: z.array(z.string()).optional().default([]),
});

export const InventoryItemSchema = z.object({
  name: z.string().min(1),
  category: z.enum(['product', 'service']),
  sku: z.string().optional().nullable(),
  costPrice: z.coerce.number().nonnegative().optional(),
  salePrice: z.coerce.number().nonnegative().optional(),
  unitPrice: z.coerce.number().nonnegative().optional(),
  quantity: z.coerce.number().int().optional(),
  stockLevel: z.coerce.number().int().optional(),
  minQuantity: z.coerce.number().int().optional(),
  version: z.number().int().nonnegative().optional(),
});

export const SettingsSchema = z.object({
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  showWarnings: z.boolean().optional(),
  hiddenColumns: z.array(z.string()).optional(),
  initialBalance: z.coerce.number().optional(),
}).passthrough();

export const CategorySchema = z.object({
  name: z.string().min(1),
  type: z.enum(['income', 'expense']),
});

export const BrandSchema = z.object({
  name: z.string().min(1),
  equipmentType: z.string().optional().nullable(),
});

export const ModelSchema = z.object({
  brandId: z.coerce.number().int().positive(),
  name: z.string().min(1),
});

export const EquipmentTypeSchema = z.object({
  name: z.string().min(1),
  icon: z.string().optional().nullable(),
});

export const ServiceOrderStatusSchema = z.object({
  name: z.string().min(1),
  color: z.string().optional(),
  priority: z.coerce.number().optional(),
  isDefault: z.coerce.number().optional(),
});

export const PaymentRegisterSchema = z.object({
  amount: z.coerce.number().positive('Valor deve ser positivo'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}/).optional(),
});
