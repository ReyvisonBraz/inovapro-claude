import { prisma } from '../lib/prisma.js';
import { ServiceOrderFormData } from '../schemas/serviceOrderSchema.js';

const safeParseJSON = (str: string | null | undefined, fallback: unknown = []) => {
  try { return str ? JSON.parse(str) : fallback; }
  catch { return fallback; }
};

export class ServiceOrderService {
  async findMany(options: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    priority?: string;
    sortBy?: string;
  }) {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const { search, status, priority, sortBy } = options;
    
    const where: Record<string, unknown> = {};
    
    if (search) {
      where.OR = [
        { id: parseInt(search) || 0 },
        { equipmentBrand: { contains: search, mode: 'insensitive' } },
        { equipmentModel: { contains: search, mode: 'insensitive' } },
        { equipmentType: { contains: search, mode: 'insensitive' } },
        { equipmentSerial: { contains: search, mode: 'insensitive' } },
        { customer: { firstName: { contains: search, mode: 'insensitive' } } },
        { customer: { lastName: { contains: search, mode: 'insensitive' } } },
      ];
    }
    
    if (status && status !== 'all') where.status = status;
    if (priority && priority !== 'all') where.priority = priority;
    
    let orderBy: Record<string, string> | Array<Record<string, string>> = { createdAt: 'desc' };
    if (sortBy === 'oldest') orderBy = { createdAt: 'asc' };
    if (sortBy === 'priority') orderBy = [{ priority: 'asc' }, { createdAt: 'desc' }];
    if (sortBy === 'amount-desc') orderBy = { totalAmount: 'desc' };
    if (sortBy === 'amount-asc') orderBy = { totalAmount: 'asc' };

    const [orders, total] = await Promise.all([
      prisma.serviceOrder.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
        include: { customer: { select: { firstName: true, lastName: true, phone: true } } },
      }),
      prisma.serviceOrder.count({ where }),
    ]);

    const data = orders.map(o => ({
      ...o,
      firstName: o.customer.firstName,
      lastName: o.customer.lastName,
      phone: o.customer.phone,
      partsUsed: safeParseJSON(o.partsUsed as string, []),
      services: safeParseJSON(o.services as string, []),
    }));

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: number) {
    const order = await prisma.serviceOrder.findUnique({
      where: { id },
      include: { customer: { select: { firstName: true, lastName: true, phone: true } } },
    });

    if (!order) return null;

    return {
      ...order,
      firstName: order.customer.firstName,
      lastName: order.customer.lastName,
      phone: order.customer.phone,
      partsUsed: safeParseJSON(order.partsUsed as string, []),
      services: safeParseJSON(order.services as string, []),
    };
  }

  async create(data: ServiceOrderFormData) {
    const { 
      customerId, equipmentType, equipmentBrand, equipmentModel, equipmentColor, equipmentSerial,
      reportedProblem, arrivalPhotoUrl, arrivalPhotoBase64, status, entryDate, analysisPrediction,
      customerPassword, accessories, ramInfo, ssdInfo, priority, createdBy, technicalAnalysis,
      servicesPerformed, services, partsUsed, serviceFee, totalAmount, finalObservations 
    } = data;
    
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    
    return prisma.serviceOrder.create({
      data: {
        customerId, 
        firstName: customer?.firstName, 
        lastName: customer?.lastName, 
        phone: customer?.phone,
        equipmentType, 
        equipmentBrand, 
        equipmentModel, 
        equipmentColor, 
        equipmentSerial, 
        reportedProblem,
        arrivalPhotoUrl, 
        arrivalPhotoBase64, 
        status: status || 'Aguardando Análise', 
        entryDate,
        analysisPrediction, 
        customerPassword, 
        accessories, 
        ramInfo, 
        ssdInfo, 
        priority: priority || 'medium',
        createdBy: createdBy || 1, 
        technicalAnalysis, 
        servicesPerformed,
        services: JSON.stringify(services || []), 
        partsUsed: JSON.stringify(partsUsed || []),
        serviceFee: serviceFee || 0, 
        totalAmount: totalAmount || 0, 
        finalObservations,
      },
    });
  }

  async update(id: number, data: Partial<ServiceOrderFormData>) {
    const fields = [
      'status', 'technicalAnalysis', 'servicesPerformed', 'services', 'partsUsed',
      'serviceFee', 'totalAmount', 'finalObservations', 'entryDate', 'analysisPrediction',
      'customerPassword', 'accessories', 'ramInfo', 'ssdInfo', 'priority', 'equipmentType',
      'equipmentBrand', 'equipmentModel', 'equipmentColor', 'equipmentSerial', 'arrivalPhotoBase64',
      'reportedProblem', 'updatedBy', 'firstName', 'lastName', 'phone'
    ] as const;
    
    const updateData: Record<string, unknown> = {};
    
    for (const field of fields) {
      const value = (data as any)[field];
      if (value !== undefined) {
        if (field === 'services' || field === 'partsUsed') {
          updateData[field] = JSON.stringify(value ?? []);
        } else if (
          typeof value === 'string' && 
          value === '' && 
          [
            'equipmentType', 'equipmentBrand', 'equipmentModel', 'equipmentColor', 
            'equipmentSerial', 'reportedProblem', 'technicalAnalysis', 'arrivalPhotoBase64', 
            'customerPassword', 'accessories', 'ramInfo', 'ssdInfo', 'servicesPerformed', 
            'finalObservations', 'analysisPrediction'
          ].includes(field)
        ) {
          updateData[field] = null;
        } else {
          updateData[field] = value;
        }
      }
    }
    
    if (Object.keys(updateData).length === 0) {
      throw new Error('Nenhum campo para atualizar');
    }
    
    const updated = await prisma.serviceOrder.update({ 
      where: { id }, 
      data: updateData as any 
    });
    
    return {
      ...updated,
      services: safeParseJSON(updated.services as string, []),
      partsUsed: safeParseJSON(updated.partsUsed as string, []),
    };
  }

  async delete(id: number) {
    return prisma.serviceOrder.delete({ where: { id } });
  }
}

export const serviceOrderService = new ServiceOrderService();
