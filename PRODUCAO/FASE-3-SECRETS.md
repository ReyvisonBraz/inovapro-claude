# Fase 3 — Secrets & Proxy Gemini

**Status:** ⏳ Pendente  
**Prioridade:** 🔴 Crítico  
**Estimativa:** 1-2 horas

## Problema Atual

- `vite.config.ts` injeta `GEMINI_API_KEY` no bundle JavaScript via `define`. Qualquer usuário pode ver a chave abrindo o DevTools.
- Não há validação de variáveis de ambiente obrigatórias no startup em produção.
- `.env.example` não menciona `JWT_SECRET` nem `ADMIN_PASSWORD`.

## O que será feito

### 3.1 Remover Gemini key do frontend

Em `vite.config.ts`, remover o bloco `define` completamente:

```typescript
// ANTES (inseguro):
define: {
  'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
},

// DEPOIS: bloco removido
```

### 3.2 Criar rota proxy no backend `server.ts`

A chave fica apenas no servidor. O frontend chama o proxy:

```typescript
app.post('/api/ai/generate', requireAuth, async (req, res) => {
  try {
    const { prompt, model = 'gemini-2.0-flash' } = req.body;
    if (!prompt) return res.status(400).json({ error: 'prompt é obrigatório' });

    const { GoogleGenerativeAI } = await import('@google/genai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const genModel = genAI.getGenerativeModel({ model });
    const result = await genModel.generateContent(prompt);
    const text = result.response.text();

    res.json({ text });
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao chamar Gemini', detail: err.message });
  }
});
```

### 3.3 Atualizar chamadas frontend

Buscar arquivos que usam `@google/genai` diretamente:
```bash
grep -r "@google/genai\|GEMINI_API_KEY\|process\.env\.GEMINI" src/
```

Substituir chamadas diretas por:
```typescript
import api from '@/src/lib/api';

const { data } = await api.post('/ai/generate', { prompt: '...' });
const text = data.text;
```

### 3.4 Validar env vars obrigatórias no startup `server.ts`

Logo no início do arquivo, após os imports:
```typescript
if (process.env.NODE_ENV === 'production') {
  const required = ['JWT_SECRET', 'GEMINI_API_KEY', 'ADMIN_PASSWORD'];
  for (const v of required) {
    if (!process.env[v]) {
      console.error(`[STARTUP] Env var obrigatória ausente: ${v}`);
      process.exit(1);
    }
  }
}
```

### 3.5 Atualizar `.env.example`

```env
# === OBRIGATÓRIAS EM PRODUÇÃO ===

# Segredo para assinar tokens JWT (gere com: openssl rand -hex 32)
JWT_SECRET=seu-segredo-aqui-minimo-32-chars

# Senha do administrador padrão (criada no primeiro boot)
ADMIN_PASSWORD=sua-senha-segura-aqui

# Chave da API Gemini — APENAS NO BACKEND, nunca no frontend
GEMINI_API_KEY=sua-chave-gemini-aqui

# URL base do app em produção (para CORS)
APP_URL=https://seu-app.onrender.com

# === OPCIONAIS ===
PORT=3000
NODE_ENV=production
DB_PATH=/opt/render/project/data/finance.db
```

## Arquivos Modificados

| Arquivo | Tipo de Mudança |
|---------|----------------|
| `vite.config.ts` | Remover bloco `define` com GEMINI_API_KEY |
| `server.ts` | Adicionar rota `/api/ai/generate` + validação de env vars |
| `.env.example` | Documentar todas as vars obrigatórias |
| Arquivos frontend com Gemini | Substituir chamadas diretas pelo proxy |

## Verificação

```bash
# 1. Após build, verificar que a key NÃO está no bundle:
npm run build
grep -r "GEMINI\|AIza" dist/assets/*.js
# Não deve retornar nada

# 2. Testar proxy (com token válido):
curl -X POST http://localhost:3000/api/ai/generate \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Diga olá em uma frase"}'
# Deve retornar { text: "..." }

# 3. Testar startup sem env vars:
JWT_SECRET="" NODE_ENV=production tsx server.ts
# Deve falhar com mensagem de erro clara
```

## Status de Conclusão

- [ ] Bloco `define` removido de `vite.config.ts`
- [ ] Rota `/api/ai/generate` criada no backend
- [ ] Frontend atualizado para usar proxy (grep confirma 0 ocorrências de `@google/genai` em src/)
- [ ] Validação de env vars no startup implementada
- [ ] `.env.example` atualizado com todas as vars
- [ ] Build verificado: chave Gemini não aparece no bundle
