import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireRole } from '../middleware/roles.js';
import { validate } from '../middleware/validate.js';
import { CategorySchema } from './schemas.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { BusinessError, NotFoundError } from '../lib/errors.js';

const router = Router();

router.get('/', asyncHandler(async (_req: Request, res: Response) => {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  res.json(categories);
}));

router.post('/', requireRole('owner', 'manager'), validate(CategorySchema), asyncHandler(async (req: Request, res: Response) => {
  const { name, type } = req.body;
  try {
    const category = await prisma.category.create({ data: { name, type } });
    res.status(201).json({ id: category.id });
  } catch (err: unknown) {
    const code = (err as { code?: string }).code;
    if (code === 'P2002') throw new BusinessError(`Categoria "${name}" já existe.`);
    throw err;
  }
}));

router.delete('/:id', requireRole('owner', 'manager'), asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) throw new NotFoundError('Categoria não encontrada.');

  const txCount = await prisma.transaction.count({ where: { category: category.name } });
  if (txCount > 0) {
    throw new BusinessError(
      `Categoria "${category.name}" está em uso por ${txCount} transação(ões). ` +
      `Altere a categoria dessas transações antes de excluí-la.`
    );
  }

  await prisma.category.delete({ where: { id } });
  res.status(204).end();
}));

export default router;