import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { error } from '../lib/server-logger.js';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const settings = await prisma.settings.findUnique({ where: { id: 1 } });
    if (settings) {
      let hiddenCols: string[] = [];
      try { hiddenCols = JSON.parse(settings.hiddenColumns || '[]'); } catch { /* empty */ }
      res.json({
        ...settings,
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

router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      appName, appVersion, fiscalYear, primaryColor, categories,
      incomeCategories, expenseCategories, profileName, profileAvatar, initialBalance,
      showWarnings, hiddenColumns, settingsPassword, receiptLayout, receiptLogo,
      sendPulseClientId, sendPulseClientSecret, sendPulseTemplateId,
    } = req.body;

    await prisma.settings.update({
      where: { id: 1 },
      data: {
        appName, appVersion, fiscalYear, primaryColor, categories,
        incomeCategories, expenseCategories, profileName, profileAvatar,
        initialBalance, showWarnings: showWarnings ? 1 : 0,
        hiddenColumns: JSON.stringify(hiddenColumns || []), settingsPassword,
        receiptLayout: receiptLayout || 'a4', receiptLogo,
        sendPulseClientId, sendPulseClientSecret, sendPulseTemplateId,
      },
    });
    res.json({ success: true });
  } catch (err) {
    error('[SETTINGS POST] Erro ao salvar configurações', err);
    res.status(500).json({ error: 'Falha ao atualizar configurações' });
  }
});

export default router;
