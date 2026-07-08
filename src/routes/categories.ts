import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { error } from '../lib/server-logger.js';
import { requireRole } from '../middleware/roles.js';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
    res.json(categories);
  } catch (err) {
    error('[CATEGORIES GET] Erro ao listar categorias', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.post('/', requireRole('owner', 'manager'), async (req: Request, res: Response) => {
  try {
    const { name, type } = req.body;
    const category = await prisma.category.create({ data: { name, type } });
    res.json({ id: category.id });
  } catch (err) {
    error('[CATEGORIES POST] Erro ao criar categoria', err, { details: { name: req.body.name } });
    res.status(400).json({ error: 'Falha ao criar categoria' });
  }
});

router.delete('/:id', requireRole('owner', 'manager'), async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) return res.status(404).json({ error: 'Categoria não encontrada.' });

    const txCount = await prisma.transaction.count({ where: { category: category.name } });
    if (txCount > 0) {
      return res.status(400).json({
        error: `Categoria "${category.name}" está em uso por ${txCount} transação(ões). ` +
          `Altere a categoria dessas transações antes de excluí-la.`
      });
    }

    await prisma.category.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    error('[CATEGORIES DELETE] Erro ao excluir categoria', err, { details: { id: req.params.id } });
    res.status(400).json({ error: 'Falha ao excluir categoria' });
  }
});

export default router;
