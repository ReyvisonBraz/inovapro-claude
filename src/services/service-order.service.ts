import { prisma } from '../lib/prisma.js';
import { Prisma } from '@prisma/client';
import type { ServiceOrderFormData } from '../schemas/index.js';
import { uploadPhotoToStorage, isStorageConfigured } from '../lib/storage.js';
import { ConflictError, NotFoundError } from '../lib/errors.js';

const safeParseJSON = (str: string | null | undefined, fallback: unknown = []) => {
  try { return str ? JSON.parse(str) : fallback; }
  catch { return fallback; }
};

async function migratePhotosToStorage(
  rawBase64: string | null | undefined,
  osId: number
): Promise<string[] | null> {
  if (!rawBase64 || !isStorageConfigured()) return null;

  const photos: Array<{ base64: string; timestamp: string }> = safeParseJSON(rawBase64, []);
  if (!photos.length) return null;

  try {
    const urls = await Promise.all(
      photos.map((p, i) => uploadPhotoToStorage(p.base64, osId, i))
    );
    return urls;
  } catch {
    return null;
  }
}

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
    
    const where: Prisma.ServiceOrderWhereInput = {};
    
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
    
    let orderBy: Prisma.ServiceOrderOrderByWithRelationInput | Prisma.ServiceOrderOrderByWithRelationInput[] = { createdAt: 'desc' };
    if (sortBy === 'oldest') orderBy = { createdAt: 'asc' };
    if (sortBy === 'priority') orderBy = [{ priority: 'asc' }, { createdAt: 'desc' }];
    if (sortBy === 'amount-desc') orderBy = { totalAmount: 'desc' };
    if (sortBy === 'amount-asc') orderBy = { totalAmount: 'asc' };

    const [orders, total, statusGroups] = await Promise.all([
      prisma.serviceOrder.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
        include: { customer: { select: { firstName: true, lastName: true, phone: true } } },
      }),
      prisma.serviceOrder.count({ where }),
      prisma.serviceOrder.groupBy({ by: ['status'], _count: { status: true } }),
    ]);

    const statusCounts: Record<string, number> = {};
    for (const group of statusGroups) {
      if (group.status) statusCounts[group.status] = group._count.status;
    }

    const data = orders.map(o => ({
      ...o,
      firstName: o.customer.firstName,
      lastName: o.customer.lastName,
      phone: o.customer.phone,
      partsUsed: (o.partsUsed as unknown[]) ?? [],
      services: (o.services as unknown[]) ?? [],
    }));

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        statusCounts,
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
      partsUsed: (order.partsUsed as unknown[]) ?? [],
      services: (order.services as unknown[]) ?? [],
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

    const created = await prisma.serviceOrder.create({
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
        services: services || [],
        partsUsed: partsUsed || [],
        serviceFee: serviceFee || 0,
        totalAmount: totalAmount || 0,
        finalObservations,
      },
    });

    if (arrivalPhotoBase64 && isStorageConfigured()) {
      const photoUrls = await migratePhotosToStorage(arrivalPhotoBase64, created.id);
      if (photoUrls) {
        return prisma.serviceOrder.update({
          where: { id: created.id },
          data: { arrivalPhotoUrls: photoUrls, arrivalPhotoBase64: null },
        });
      }
    }

    return created;
  }

  async update(id: number, data: Partial<ServiceOrderFormData>, expectedVersion?: number) {
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
          updateData[field] = value ?? [];
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

    if (updateData.arrivalPhotoBase64 && isStorageConfigured()) {
      const photoUrls = await migratePhotosToStorage(updateData.arrivalPhotoBase64 as string, id);
      if (photoUrls) {
        updateData.arrivalPhotoUrls = photoUrls;
        updateData.arrivalPhotoBase64 = null;
      }
    }

    // Update condicional atômico: o WHERE inclui a versão que o cliente
    // conhecia. Se outro usuário salvou nesse meio-tempo, count === 0 e
    // nada é sobrescrito (lock otimista sem janela de corrida).
    updateData.version = { increment: 1 };

    const result = await prisma.serviceOrder.updateMany({
      where: expectedVersion !== undefined ? { id, version: expectedVersion } : { id },
      data: updateData as Prisma.ServiceOrderUncheckedUpdateInput,
    });

    if (result.count === 0) {
      const exists = await prisma.serviceOrder.findUnique({ where: { id }, select: { id: true } });
      if (!exists) throw new NotFoundError('Ordem de serviço não encontrada');
      throw new ConflictError();
    }

    const updated = await prisma.serviceOrder.findUniqueOrThrow({ where: { id } });

    return {
      ...updated,
      services: (updated.services as unknown[]) ?? [],
      partsUsed: (updated.partsUsed as unknown[]) ?? [],
    };
  }

  async delete(id: number) {
    return prisma.serviceOrder.delete({ where: { id } });
  }
}

export const serviceOrderService = new ServiceOrderService();
