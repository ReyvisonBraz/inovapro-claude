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

export const CustomerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  nickname: z.string().optional().nullable(),
  cpf: z.string().optional().nullable(),
  companyName: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  observation: z.string().optional().nullable(),
  creditLimit: z.coerce.number().nonnegative().optional(),
  createdBy: z.coerce.number().optional(),
  updatedBy: z.coerce.number().optional()
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

export const ServiceOrderSchema = z.object({
  customerId: z.coerce.number(),
  equipmentType: z.string().optional().nullable(),
  equipmentBrand: z.string().optional().nullable(),
  equipmentModel: z.string().optional().nullable(),
  equipmentColor: z.string().optional().nullable(),
  equipmentSerial: z.string().optional().nullable(),
  reportedProblem: z.string().min(1),
  arrivalPhotoUrl: z.string().optional().nullable(),
  arrivalPhotoBase64: z.string().optional().nullable(),
  status: z.string().optional(),
  entryDate: z.string().optional().nullable(),
  analysisPrediction: z.string().optional().nullable(),
  customerPassword: z.string().optional().nullable(),
  accessories: z.string().optional().nullable(),
  ramInfo: z.string().optional().nullable(),
  ssdInfo: z.string().optional().nullable(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  technicalAnalysis: z.string().optional().nullable(),
  servicesPerformed: z.string().optional().nullable(),
  services: z.array(z.object({
    name: z.string(),
    price: z.coerce.number()
  })).optional(),
  partsUsed: z.array(z.object({
    id: z.coerce.number().optional(),
    name: z.string(),
    quantity: z.coerce.number(),
    unitPrice: z.coerce.number(),
    subtotal: z.coerce.number()
  })).optional(),
  serviceFee: z.coerce.number().nonnegative().optional().nullable(),
  totalAmount: z.coerce.number().nonnegative().optional().nullable(),
  finalObservations: z.string().optional().nullable(),
  createdBy: z.coerce.number().optional(),
  updatedBy: z.coerce.number().optional()
});
