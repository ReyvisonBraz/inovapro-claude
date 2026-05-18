import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { publicOsCache, PUBLIC_OS_KEY } from '../lib/cache.js';

const router = Router();

const safeParseJSON = (str: string | null | undefined, fallback: unknown = []) => {
  try { return str ? JSON.parse(str) : fallback; }
  catch { return fallback; }
};

router.get('/public/os/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const cacheKey = PUBLIC_OS_KEY(id);
    const cached = publicOsCache.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const order = await prisma.serviceOrder.findUnique({
      where: { id },
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
    });

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
    };

    publicOsCache.set(cacheKey, payload);
    res.json(payload);
  } catch (err) {
    console.error('[PUBLIC_OS] Erro ao buscar OS:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
