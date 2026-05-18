import { z } from 'zod';

export const serviceOrderSchema = z.object({
  id: z.coerce.number().optional(),
  customerId: z.coerce.number().min(1, 'Cliente é obrigatório'),
  entryDate: z.string().min(1, 'Data de entrada é obrigatória'),
  equipmentType: z.string().optional().nullable(),
  equipmentBrand: z.string().optional().nullable(),
  equipmentModel: z.string().optional().nullable(),
  equipmentColor: z.string().optional().nullable(),
  equipmentSerial: z.string().optional().nullable(),
  reportedProblem: z.string().optional().nullable(),
  technicalAnalysis: z.string().optional().nullable(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  status: z.string().min(1, 'Status é obrigatório').optional(),
  customerPassword: z.string().optional().nullable(),
  accessories: z.string().optional().nullable(),
  ramInfo: z.string().optional().nullable(),
  ssdInfo: z.string().optional().nullable(),
  arrivalPhotoBase64: z.string().optional().nullable(),
  arrivalPhotoUrl: z.string().optional().nullable(),
  analysisPrediction: z.string().optional().nullable(),
  servicesPerformed: z.string().optional().nullable(),
  serviceFee: z.coerce.number().optional().nullable(),
  totalAmount: z.coerce.number().optional().nullable(),
  finalObservations: z.string().optional().nullable(),
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
  createdBy: z.coerce.number().optional(),
  updatedBy: z.coerce.number().optional(),
  arrivalPhotoUrls: z.string().optional().nullable(),
});

export type ServiceOrderFormData = z.infer<typeof serviceOrderSchema>;
