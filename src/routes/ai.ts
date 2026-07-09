import { Router, Request, Response } from 'express';
import { info } from '../lib/server-logger.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { BusinessError } from '../lib/errors.js';

const router = Router();

router.post('/generate', asyncHandler(async (req: Request, res: Response) => {
  const { prompt, model = 'gemini-2.0-flash' } = req.body;
  if (!prompt) {
    throw new BusinessError('prompt é obrigatório');
  }
  try {
    const { GoogleGenAI } = await import('@google/genai');
    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    const result = await genAI.models.generateContent({ model, contents: prompt });
    info('AI generate concluído', { details: { model, promptLength: prompt.length } });
    res.json({ text: result.text });
  } catch {
    throw new BusinessError('Erro ao chamar o modelo de IA. Tente novamente.');
  }
}));

export default router;