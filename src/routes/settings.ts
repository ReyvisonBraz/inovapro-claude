import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { validate } from '../middleware/validate.js';
import { SettingsSchema } from '../schemas/index.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { hashPassword, verifyPassword } from '../lib/password.js';
import { encrypt } from '../lib/crypto-util.js';
import { AuthRequest } from '../middleware/auth.js';
import { writeAudit } from '../lib/audit.js';

const router = Router();

router.get('/', asyncHandler(async (_req: Request, res: Response) => {
  const settings = await prisma.settings.findUnique({ where: { id: 1 } });
  if (settings) {
    const { settingsPassword, sendPulseClientSecret, ...safeSettings } = settings;
    const hiddenCols: string[] = Array.isArray(settings.hiddenColumns) ? settings.hiddenColumns as string[] : [];
    const deductStatuses: string[] = Array.isArray(settings.deductStockStatuses) ? settings.deductStockStatuses as string[] : [];
    res.json({
      ...safeSettings,
      showWarnings: settings.showWarnings ? true : false,
      hiddenColumns: hiddenCols,
      deductStockStatuses: deductStatuses,
    });
  } else {
    res.json(null);
  }
}));

router.post('/', validate(SettingsSchema), asyncHandler(async (req: AuthRequest, res: Response) => {
  const {
    appName, appVersion, fiscalYear, primaryColor, categories,
    incomeCategories, expenseCategories, profileName, profileAvatar, initialBalance,
    showWarnings, hiddenColumns, receiptLayout, receiptLogo,
    shopWhatsapp, sendPulseClientId, sendPulseTemplateId,
  } = req.body;

  const updateData: Record<string, unknown> = {
    appName, appVersion, fiscalYear, primaryColor, categories,
    incomeCategories, expenseCategories, profileName, profileAvatar,
    initialBalance, showWarnings: showWarnings ? 1 : 0,
    hiddenColumns: hiddenColumns || [],
    receiptLayout: receiptLayout || 'a4', receiptLogo,
    shopWhatsapp: shopWhatsapp ?? undefined,
    sendPulseClientId, sendPulseTemplateId,
    osPrintConfig: req.body.osPrintConfig ?? undefined,
    checklistTemplate: req.body.checklistTemplate ?? undefined,
    deductStockStatuses: req.body.deductStockStatuses ?? undefined,
    warrantyDefaultMonths: req.body.warrantyDefaultMonths ?? undefined,
  };

  if (req.body.settingsPassword) updateData.settingsPassword = await hashPassword(req.body.settingsPassword);
  if (req.body.sendPulseClientSecret) updateData.sendPulseClientSecret = encrypt(req.body.sendPulseClientSecret);

  updateData.version = { increment: 1 };

  await prisma.settings.update({
    where: { id: 1 },
    data: updateData,
  });
  await writeAudit(req, 'settings-update', 'settings', 1, { fields: Object.keys(req.body) });
  res.json({ success: true });
}));

router.post('/verify-password', asyncHandler(async (req: Request, res: Response) => {
  const { password } = req.body;
  if (typeof password !== 'string') {
    return res.status(400).json({ error: 'Senha não fornecida' });
  }

  const settings = await prisma.settings.findUnique({ where: { id: 1 } });
  const stored = settings?.settingsPassword || '';

  // Se nenhuma senha foi definida (campo vazio), aceita qualquer senha
  if (!stored) {
    return res.json({ valid: true });
  }

  // Se o valor armazenado parece um hash bcrypt ($2a$, $2b$, $2y$), usa bcrypt
  if (/^\$2[aby]\$\d+\$/.test(stored)) {
    const valid = await verifyPassword(password, stored);
    return res.json({ valid });
  }

  // Fallback: senha em texto plano (migração — aceita e re-hashes para o futuro)
  if (password === stored) {
    const hashed = await hashPassword(password);
    await prisma.settings.update({ where: { id: 1 }, data: { settingsPassword: hashed } });
    return res.json({ valid: true });
  }

  return res.json({ valid: false });
}));

export default router;
