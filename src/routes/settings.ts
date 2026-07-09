import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { error } from '../lib/server-logger.js';
import { validate } from '../middleware/validate.js';
import { SettingsSchema } from './schemas.js';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const settings = await prisma.settings.findUnique({ where: { id: 1 } });
    if (settings) {
      const { settingsPassword, sendPulseClientSecret, ...safeSettings } = settings;
      let hiddenCols: string[] = [];
      try { hiddenCols = JSON.parse(settings.hiddenColumns || '[]'); } catch { /* empty */ }
      res.json({
        ...safeSettings,
        showWarnings: settings.showWarnings ? true : false,
        hiddenColumns: hiddenCols,
      });
    } else {
      res.json(null);
    }
  } catch (err) {
    error('[SETTINGS GET] Erro ao buscar configurações', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.post('/', validate(SettingsSchema), async (req: Request, res: Response) => {
  try {
    const {
      appName, appVersion, fiscalYear, primaryColor, categories,
      incomeCategories, expenseCategories, profileName, profileAvatar, initialBalance,
      showWarnings, hiddenColumns, settingsPassword, receiptLayout, receiptLogo,
      shopWhatsapp, sendPulseClientId, sendPulseClientSecret, sendPulseTemplateId,
    } = req.body;

    const updateData: any = {
      appName, appVersion, fiscalYear, primaryColor, categories,
      incomeCategories, expenseCategories, profileName, profileAvatar,
      initialBalance, showWarnings: showWarnings ? 1 : 0,
      hiddenColumns: JSON.stringify(hiddenColumns || []),
      receiptLayout: receiptLayout || 'a4', receiptLogo,
      shopWhatsapp: shopWhatsapp ?? undefined,
      sendPulseClientId, sendPulseTemplateId,
      osPrintConfig: req.body.osPrintConfig ?? undefined,
    };

    if (settingsPassword) updateData.settingsPassword = settingsPassword;
    if (sendPulseClientSecret) updateData.sendPulseClientSecret = sendPulseClientSecret;

    updateData.version = { increment: 1 };

    await prisma.settings.update({
      where: { id: 1 },
      data: updateData,
    });
    res.json({ success: true });
  } catch (err) {
    error('[SETTINGS POST] Erro ao salvar configurações', err);
    res.status(500).json({ error: 'Falha ao atualizar configurações' });
  }
});

export default router;
