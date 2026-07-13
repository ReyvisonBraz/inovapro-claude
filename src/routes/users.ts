import { Router, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { info } from '../lib/server-logger.js';
import { hashPassword } from '../lib/password.js';
import { validate } from '../middleware/validate.js';
import { UserCreateSchema, UserUpdateSchema } from '../schemas/index.js';
import { AuthRequest } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { BusinessError } from '../lib/errors.js';
import { isPrismaUniqueConstraintError } from '../lib/prisma-error.js';

const router = Router();

router.get('/', asyncHandler(async (_req: AuthRequest, res: Response) => {
  const users = await prisma.user.findMany({
    select: { id: true, username: true, role: true, name: true, permissions: true, createdAt: true },
    orderBy: { name: 'asc' },
  });
  const usersWithPermissions = users.map(u => ({
    ...u,
    permissions: Array.isArray(u.permissions) ? u.permissions as string[] : [],
  }));
  res.json(usersWithPermissions);
}));

router.post('/', validate(UserCreateSchema), asyncHandler(async (req: AuthRequest, res: Response) => {
  const { username, password, role, name, permissions } = req.body;
  const hashedPassword = await hashPassword(password);
  try {
    const user = await prisma.user.create({
      data: { username, password: hashedPassword, role, name, permissions: permissions || [] },
    });
    info('Usuário criado', { details: { username, role } });
    res.status(201).json({ id: user.id });
  } catch (err: unknown) {
    if (isPrismaUniqueConstraintError(err)) {
      throw new BusinessError(`Nome de usuário "${username}" já existe.`);
    }
    throw err;
  }
}));

router.put('/:id', validate(UserUpdateSchema), asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, role, password, permissions } = req.body;
  const userId = parseInt(req.params.id ?? '');
  if (isNaN(userId)) { res.status(400).json({ error: 'ID inválido' }); return; }
  const updateData: Record<string, unknown> = { name, role, permissions: permissions || [] };
  if (password) {
    updateData.password = await hashPassword(password);
  }
  if (role !== undefined) {
    updateData.tokenVersion = { increment: 1 };
  }
  await prisma.user.update({ where: { id: userId }, data: updateData as Record<string, unknown> });
  info('Usuário atualizado', { details: { id: userId, name } });
  res.json({ success: true });
}));

router.delete('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = parseInt(req.params.id ?? '');
  if (isNaN(userId)) { res.status(400).json({ error: 'ID inválido' }); return; }
  await prisma.auditLog.updateMany({ where: { userId }, data: { userId: null } });
  await prisma.user.delete({ where: { id: userId } });
  info('Usuário excluído', { details: { id: userId } });
  res.status(204).end();
}));

export default router;