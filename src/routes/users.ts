import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import { error, info } from '../lib/server-logger.js';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, username: true, role: true, name: true, permissions: true, createdAt: true },
      orderBy: { name: 'asc' },
    });
    const usersWithPermissions = users.map(u => {
      try { return { ...u, permissions: JSON.parse(u.permissions || '[]') }; }
      catch { return { ...u, permissions: [] }; }
    });
    res.json(usersWithPermissions);
  } catch (err) {
    error('[USERS GET] Erro ao listar usuários', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { username, password, role, name, permissions } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const user = await prisma.user.create({
      data: { username, password: hashedPassword, role, name, permissions: JSON.stringify(permissions || []) },
    });
    info('Usuário criado', { details: { username, role } });
    res.json({ id: user.id });
  } catch (err: any) {
    error('[USERS POST] Erro ao criar usuário', err, { details: { username: req.body.username } });
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { name, role, password, permissions } = req.body;
    const userId = parseInt(req.params.id);
    const updateData: Record<string, unknown> = { name, role, permissions: JSON.stringify(permissions || []) };
    if (password) {
      updateData.password = bcrypt.hashSync(password, 10);
    }
    await prisma.user.update({ where: { id: userId }, data: updateData as any });
    info('Usuário atualizado', { details: { id: userId, name } });
    res.json({ success: true });
  } catch (err: any) {
    error('[USERS PUT] Erro ao atualizar usuário', err, { details: { id: req.params.id } });
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    await prisma.auditLog.updateMany({ where: { userId }, data: { userId: null } });
    await prisma.user.delete({ where: { id: userId } });
    info('Usuário excluído', { details: { id: userId } });
    res.json({ success: true });
  } catch (err: any) {
    error('[USERS DELETE] Erro ao excluir usuário', err, { details: { id: req.params.id } });
    res.status(400).json({ error: err.message });
  }
});

export default router;
