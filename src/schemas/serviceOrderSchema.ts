import { z } from 'zod';

export const serviceOrderSchema = z.object({
  customerId: z.number().min(1, 'Cliente é obrigatório'),
  entryDate: z.string().min(1, 'Data de entrada é obrigatória'),
  equipmentType: z.string().min(1, 'Tipo de equipamento é obrigatório'),
  equipmentBrand: z.string().min(1, 'Marca é obrigatória'),
  equipmentModel: z.string().min(1, 'Modelo é obrigatório'),
  equipmentColor: z.string().optional(),
  equipmentSerial: z.string().optional(),
  reportedProblem: z.string().min(1, 'Descrição do problema é obrigatória'),
  technicalAnalysis: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  status: z.string().min(1, 'Status é obrigatório'),
  customerPassword: z.string().optional(),
  accessories: z.string().optional(),
  ramInfo: z.string().optional(),
  ssdInfo: z.string().optional(),
  arrivalPhotoBase64: z.string().optional(),
  servicesPerformed: z.string().optional(),
  serviceFee: z.number().optional(),
  totalAmount: z.number().optional(),
  finalObservations: z.string().optional(),
  services: z.array(z.object({
    name: z.string(),
    price: z.number()
  })).optional(),
  partsUsed: z.array(z.object({
    id: z.number().optional(),
    name: z.string(),
    quantity: z.number(),
    unitPrice: z.number(),
    subtotal: z.number()
  })).optional(),
});

export type ServiceOrderFormData = z.infer<typeof serviceOrderSchema>;
