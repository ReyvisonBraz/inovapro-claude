import { Router, Request, Response } from 'express';
import { error, info } from '../lib/server-logger.js';

const router = Router();

router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { prompt, model = 'gemini-2.0-flash' } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'prompt é obrigatório' });
    }
    const { GoogleGenAI } = await import('@google/genai');
    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    const result = await genAI.models.generateContent({ model, contents: prompt });
    info('AI generate concluído', { details: { model, promptLength: prompt.length } });
    res.json({ text: result.text });
  } catch (err: any) {
    error('[AI] Erro ao chamar Gemini', err);
    res.status(500).json({ error: 'Erro ao chamar Gemini', detail: err.message });
  }
});

export default router;
