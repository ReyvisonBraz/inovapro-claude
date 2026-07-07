# Fase 5 · Tarefa 01 — Escolher uma estratégia de deploy (M8)

**Goal:** Ter **uma** estratégia de deploy, eliminando a confusão e os riscos das 4 configs atuais ([vercel.json](../../../vercel.json), [render.yaml](../../../render.yaml), [Dockerfile](../../../Dockerfile), [cloudbuild.yaml](../../../cloudbuild.yaml)).

**Architecture:** O app é um Express único de longa duração (serve API + `dist` estático via `express.static`, ver `server.ts`). Isso encaixa em host de processo contínuo. **Decisão recomendada: Render** (single web service; `render.yaml` já existe). Alternativa de contêiner: **Cloud Run** (Dockerfile). Remove-se o que não for escolhido.

> **Decisão do dono do projeto.** Antes de executar esta tarefa, confirme o alvo. As opções abaixo são mutuamente exclusivas.

## Opção A (recomendada) — Render, serviço único

Um web service serve API + front. Simples, 1 instância no free tier (torna o rate-limit/cache em memória **aceitáveis** — ver Tarefa 03).

- [ ] **Step A1: Corrigir o `render.yaml`** (remover resíduo SQLite, ver Tarefa 02) e garantir env corretas:
  - Manter: `NODE_ENV=production`, `JWT_SECRET` (rotacionado na Fase 1), `GEMINI_API_KEY`, `PORT`.
  - **Remover**: `DB_PATH` (SQLite), `ADMIN_PASSWORD`/`APP_URL` órfãos se não usados no código.
  - Adicionar: `DATABASE_URL` (`sync: false`, setado no painel).
  - `buildCommand: npm ci && npm run build` (o build roda `prisma generate`).
  - `startCommand: npx prisma migrate deploy && npm start`.
  - `healthCheckPath: /health`.

- [ ] **Step A2: Remover as configs concorrentes**
```powershell
git rm vercel.json cloudbuild.yaml
git rm -r api          # api/index.ts era o entrypoint serverless da Vercel
git rm -r .vercel 2>$null
```
> Se o Cloud Run for mantido como alternativa de contêiner, **preserve** o `Dockerfile` (limpo na Tarefa 02) e `scripts/deploy-cloud-run.sh`. Se não, remova-os também.

- [ ] **Step A3: Documentar** em `docs/DEPLOY.md`: como fazer deploy no Render, quais env setar, como rodar migrations (via `startCommand`).

## Opção B — Cloud Run (contêiner)

Deploy por imagem Docker. Escala automática (pode ir a múltiplas instâncias → **exige** Tarefa 03 para rate-limit/cache duráveis).

- [ ] **Step B1:** Manter e limpar o `Dockerfile` (Tarefa 02). Manter `cloudbuild.yaml` **ou** `scripts/deploy-cloud-run.sh` (escolha um método de deploy, não os dois).
- [ ] **Step B2:** Remover `vercel.json`, `api/`, `.vercel`, `render.yaml`.
- [ ] **Step B3:** Configurar secrets no Secret Manager (`DATABASE_URL`, `JWT_SECRET`, `GEMINI_API_KEY`) — o `cloudbuild.yaml` já referencia `--update-secrets`.
- [ ] **Step B4:** Documentar em `docs/DEPLOY.md`.

## Opção C — Front na Vercel + API única no Render/Cloud Run

Só se houver motivo forte para o front na Vercel.

- [ ] **Step C1:** `vercel.json` passa a fazer **apenas** build estático do front (remover o build de `api/index.ts` e o rewrite `/api/* → serverless`).
- [ ] **Step C2:** API sobe no Render/Cloud Run (uma das opções acima).
- [ ] **Step C3:** `VITE_API_URL` do front aponta para a URL da API; CORS (Fase 1) inclui o domínio do front; cookies exigem `SameSite=None; Secure` (Fase 3, Tarefa 04).
- [ ] **Step C4:** Remover `cloudbuild.yaml` se não usar Cloud Run.

## Passos comuns (após escolher)

- [ ] **Step 1: Alinhar `PORT`** entre config e código. `server.ts` usa `process.env.PORT || 3001`; Render/Cloud Run injetam `PORT` (Render 10000+, Cloud Run 8080). Não hardcode.

- [ ] **Step 2: Deploy de teste e health check**
Faça um deploy no alvo escolhido e confirme:
```
GET https://<seu-host>/health  → { status: 'ok', ... }
```

- [ ] **Step 3: Smoke em produção** — login, criar uma transação, listar. Verifique logs do host.

- [ ] **Step 4: Commit**
```powershell
git add -A
git commit -m @'
chore(deploy): consolida estrategia unica de deploy (remove configs concorrentes)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
'@
```

## Critério de conclusão da tarefa

- [ ] Apenas a config do alvo escolhido permanece no repo.
- [ ] `docs/DEPLOY.md` descreve o processo.
- [ ] Health check verde em produção.

## Nota sobre serverless

- A escolha de host **determina** a Tarefa 03. Instância única (Render free) → rate-limit/cache em memória seguem OK. Multi-instância/escala (Cloud Run) → mover para store externo é obrigatório para o rate-limit funcionar de verdade.
