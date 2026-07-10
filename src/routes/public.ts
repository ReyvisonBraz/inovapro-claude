import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

const safeParseJSON = (str: string | null | undefined, fallback: unknown = []) => {
  try { return str ? JSON.parse(str) : fallback; }
  catch { return fallback; }
};

router.get('/public/os/:token', asyncHandler(async (req: Request, res: Response) => {
  const token = req.params.token;
  if (!token || token.length < 8) {
    return res.status(404).json({ error: 'Ordem de serviço não encontrada' });
  }

  const [order, settings] = await Promise.all([
    prisma.serviceOrder.findUnique({
      where: { publicToken: token },
      select: {
        id: true,
        status: true,
        equipmentType: true,
        equipmentBrand: true,
        equipmentModel: true,
        equipmentColor: true,
        equipmentSerial: true,
        reportedProblem: true,
        entryDate: true,
        analysisPrediction: true,
        arrivalPhotoBase64: true,
        arrivalPhotoUrls: true,
        partsUsed: true,
        totalAmount: true,
        serviceFee: true,
      },
    }),
    prisma.settings.findUnique({
      where: { id: 1 },
      select: { shopWhatsapp: true, profileName: true },
    }),
  ]);

  if (!order) {
    return res.status(404).json({ error: 'Ordem de serviço não encontrada' });
  }

  const photos = safeParseJSON(order.arrivalPhotoUrls || order.arrivalPhotoBase64, []);

  const payload = {
    id: order.id,
    status: order.status,
    equipmentType: order.equipmentType,
    equipmentBrand: order.equipmentBrand,
    equipmentModel: order.equipmentModel,
    equipmentColor: order.equipmentColor,
    equipmentSerial: order.equipmentSerial,
    reportedProblem: order.reportedProblem,
    entryDate: order.entryDate,
    analysisPrediction: order.analysisPrediction,
    arrivalPhotos: photos,
    totalAmount: order.totalAmount,
    serviceFee: order.serviceFee,
    shopWhatsapp: settings?.shopWhatsapp ?? null,
    shopName: settings?.profileName ?? 'Inova Pro',
  };

  // Cache HTTP delega ao CDN/browser (TTL 2 min). Em serverless multi-instância,
  // o node-cache era por-instância e não invalidava entre instâncias; o
  // Cache-Control public funciona igualmente em todas as instâncias.
  res.set('Cache-Control', 'public, max-age=120');
  res.json(payload);
}));

export default router;