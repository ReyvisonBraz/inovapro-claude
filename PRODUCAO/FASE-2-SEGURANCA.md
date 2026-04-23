# Fase 2 — Segurança HTTP

**Status:** ⏳ Pendente  
**Prioridade:** 🔴 Crítico  
**Estimativa:** 30 minutos

## Problema Atual

- Sem CORS: a API aceita requisições de qualquer domínio
- Sem Helmet: nenhum header de segurança HTTP (X-Frame-Options, CSP, etc.)
- Sem rate limiting: login pode ser atacado por força bruta ilimitada
- Limite de body em 50MB: risco de DoS

## O que será feito

### 2.1 Instalar dependências
```bash
npm install cors helmet express-rate-limit
npm install --save-dev @types/cors
```

### 2.2 Adicionar em `server.ts` (logo no início, antes de qualquer rota)

```typescript
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Headers de segurança HTTP
app.use(helmet());

// CORS: apenas a origin do app em produção
app.use(cors({
  origin: process.env.APP_URL || 'http://localhost:3000',
  credentials: true,
}));

// Rate limit no login: 10 tentativas por 15 min por IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Muitas tentativas. Tente novamente em 15 minutos.' },
});
```

### 2.3 Reduzir body size limit

No `server.ts`, linha ~434:
```typescript
// De:
app.use(express.json({ limit: '50mb' }));

// Para:
app.use(express.json({ limit: '5mb' }));
```

> Imagens base64 de equipamentos devem ter validação de tamanho separada ou migrar para upload de arquivos.

## Arquivos Modificados

| Arquivo | Tipo de Mudança |
|---------|----------------|
| `server.ts` | CORS, Helmet, rate limit no login, body limit reduzido |

## Verificação

```bash
# Verificar headers de segurança na resposta
curl -I http://localhost:3000/health

# Deve aparecer headers como:
# X-Frame-Options: SAMEORIGIN
# X-Content-Type-Options: nosniff
# Strict-Transport-Security: ...

# Testar rate limit (após 10 tentativas em 15 min)
for i in {1..11}; do
  curl -X POST http://localhost:3000/api/login \
    -H "Content-Type: application/json" \
    -d '{"username":"wrong","password":"wrong"}'
done
# 11ª tentativa deve retornar 429
```

## Status de Conclusão

- [ ] `cors`, `helmet`, `express-rate-limit` instalados
- [ ] `helmet()` aplicado globalmente
- [ ] `cors()` configurado com `APP_URL`
- [ ] `loginLimiter` aplicado no `POST /api/login`
- [ ] Body limit reduzido de 50MB para 5MB
- [ ] Headers de segurança verificados com curl
