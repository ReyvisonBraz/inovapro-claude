import { Router, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireRole } from '../middleware/roles.js';
import { validate } from '../middleware/validate.js';
import { CategorySchema } from '../schemas/index.js';
import { AuthRequest } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { BusinessError, NotFoundError } from '../lib/errors.js';
import { isPrismaUniqueConstraintError } from '../lib/prisma-error.js';
import { writeAudit } from '../lib/audit.js';

const router = Router();

router.get('/', asyncHandler(async (_req: AuthRequest, res: Response) => {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  res.json(categories);
}));

router.post('/', requireRole('owner', 'manager'), validate(CategorySchema), asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, type } = req.body;
  try {
    const category = await prisma.category.create({ data: { name, type } });
    await writeAudit(req, 'create', 'category', category.id, { name, type });
    res.status(201).json({ id: category.id });
  } catch (err: unknown) {
    if (isPrismaUniqueConstraintError(err)) throw new BusinessError(`Categoria "${name}" já existe.`);
    throw err;
  }
}));

router.delete('/:id', requireRole('owner', 'manager'), asyncHandler(async (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id ?? '');
  if (isNaN(id)) { res.status(400).json({ error: 'ID inválido' }); return; }
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
  await writeAudit(req, 'delete', 'category', id, { name: category.name });
  res.status(204).end();
}));

export default router;
