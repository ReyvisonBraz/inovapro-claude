/**
 * Seed idempotente do usuário admin (owner).
 *
 * Segurança: a senha NUNCA é hardcoded em produção — vem de SEED_ADMIN_PASSWORD
 * quando definida. O fallback 'admin2021' existe apenas para o ambiente local
 * Docker (dev) e para os pipelines de CI (base descartável).
 */
import bcrypt from 'bcryptjs';
import { prisma } from '../src/lib/prisma.js';

const username = process.env.SEED_ADMIN_USERNAME || 'admin';
const password = process.env.SEED_ADMIN_PASSWORD || 'admin2021';
const hash = await bcrypt.hash(password, 10);

const existing = await prisma.user.findUnique({ where: { username } });
if (existing) {
  await prisma.user.update({ where: { username }, data: { password: hash, role: 'owner' } });
  console.log(`Usuário ${username} atualizado para owner com senha resetada`);
} else {
  await prisma.user.create({
    data: { username, password: hash, role: 'owner', name: 'Administrador', permissions: [] },
  });
  console.log(`Usuário ${username} criado (owner)`);
}
await prisma.$disconnect();