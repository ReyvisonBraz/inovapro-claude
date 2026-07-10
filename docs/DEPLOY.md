# Deploy — INOVA PRO (Vercel)

Estratégia **única**: tudo na **Vercel**. O `vercel.json` faz dois builds no mesmo domínio:

- **Frontend** (estático): `@vercel/static-build` a partir do `package.json` (`npm run build` → `dist/`).
- **API** (serverless): `@vercel/node` a partir de `api/index.ts`, que importa o app Express de `server.ts`.

Rewrites: `/api/*` → função serverless; `/*` → `index.html` (SPA).

> As configs de Render/Cloud Run/Cloud Build foram removidas (o app roda na Vercel). Se um dia precisar containerizar, o histórico do git tem o Dockerfile.

## Variáveis de ambiente (Vercel → Settings → Environment Variables)

Obrigatórias:
- `DATABASE_URL` — Postgres (Supabase pooler).
- `JWT_SECRET` — segredo de assinatura do JWT.
- `ENCRYPTION_KEY` — chave de criptografia AES-256 para credenciais no banco (sendPulseClientSecret). Mínimo 32 caracteres.
- `NODE_ENV=production` (a Vercel já define).

Recomendadas/opcionais:
- `GEMINI_API_KEY` — rota de IA.
- `PUBLIC_API_ORIGIN` — só se o front e a API ficarem em domínios diferentes (aqui é o mesmo, então dispensável) — usada na CSP.
- `SENDPULSE_CLIENT_ID` / `SENDPULSE_CLIENT_SECRET` / `SENDPULSE_TEMPLATE_ID` — WhatsApp.
- `REDIS_URL` — **recomendado** (ver "Serverless" abaixo). Passo a passo: [`REDIS-SETUP.md`](./REDIS-SETUP.md).

`VITE_API_URL` deve ficar **vazio** (front e API no mesmo domínio → `api.ts` usa `/api`).

## Migrations

`npx prisma migrate deploy` deve rodar contra a `DATABASE_URL` de produção ao publicar mudanças de schema. Como funções serverless não têm um passo de "start", rode as migrations manualmente (localmente com a `DATABASE_URL` de prod) ou num passo de CI antes do deploy.

## Cookies de sessão (JWT httpOnly)

O login seta um cookie `httpOnly` + `Secure` + `SameSite=None` em produção. Como front e API estão no **mesmo domínio** Vercel (HTTPS), o cookie funciona. Se um dia separar o front da API em domínios distintos, `SameSite=None`+`Secure` continua necessário e o CORS precisa listar o domínio do front (já com `credentials: true`).

## ⚠️ Serverless: implicações (importante)

Cada invocação serverless é um processo isolado e efêmero. Por isso, o que é **em memória** não é confiável entre instâncias:

- **Rate-limit do login** (`express-rate-limit` in-memory) — **fica fraco**: o contador não é compartilhado entre instâncias, então a proteção contra brute-force de login é parcial. **Solução:** provisionar Redis (ex.: Upstash, free tier) e definir `REDIS_URL` — **passo a passo em [`REDIS-SETUP.md`](./REDIS-SETUP.md)**. O código usa Redis quando `REDIS_URL` existe e cai para memória quando não (ver `src/lib/rate-limit.ts`).
- **Cache do rastreio público** (`node-cache`) — por-instância; funciona, apenas com menos acerto de cache entre instâncias. TTL de 2 min, então o impacto é pequeno; mantido em memória de propósito.
- **Logs em memória** (`/api/debug/logs`) — refletem só a instância atual. Para logs completos, use o painel de logs da Vercel (stdout já vai pra lá).

## Checklist de deploy

- [ ] Env vars setadas na Vercel (acima).
- [ ] `REDIS_URL` configurada (rate-limit de login confiável).
- [ ] Migrations aplicadas (`prisma migrate status` limpo).
- [ ] Smoke: `GET /health` → 200; login → cookie httpOnly; navegar autenticado.
- [ ] Após atualizar usuários existentes (role/password) no post-deploy, as sessões antigas expiram em até 15min (tokenVersion).
