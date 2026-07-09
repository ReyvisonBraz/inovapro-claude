# Fase 5 — Deploy e Infraestrutura (MAJOR)

Hoje coexistem **4 alvos de deploy** conflitantes — `vercel.json` (serverless), `render.yaml` (com resíduo de SQLite: `DB_PATH=.../finance.db`), `Dockerfile` (Cloud Run) e `cloudbuild.yaml` (Cloud Build) — e a arquitetura (Express único servindo API + estático, com rate-limit/cache/logs **em memória**) é incompatível com serverless multi-instância.

**Pré-requisito:** Fases 1–2 (segurança) — não faz sentido consolidar deploy de algo inseguro.

## Arquivos desta fase (ordem)

| # | Arquivo | Achado | Entrega |
|---|---------|--------|---------|
| 01 | `01-escolher-deploy-unico.md` | M8 | Decidir 1 estratégia e remover as demais configs |
| 02 | `02-remover-residuo-sqlite.md` | M8 | Expurgar SQLite morto (`better-sqlite3`, `DB_PATH`, `data/`, textos no Dockerfile) |
| 03 | `03-rate-limit-cache-externo.md` | M8 | Rate-limit/cache/logs duráveis **se** o alvo for multi-instância |

## Decisão central (Tarefa 01)

O app é um **Express único de longa duração** que serve API e front estático. O encaixe natural é um host de processo contínuo (Render ou Cloud Run), **não** serverless (Vercel). Recomendação: **Render** (já há `render.yaml`, free tier, 1 serviço) como primário; **Cloud Run** (Dockerfile) como alternativa de contêiner. Remover Vercel/Cloud Build reduz superfície e confusão.

> Se o front **precisa** ficar na Vercel por algum motivo (CDN/preview), a alternativa é "front estático na Vercel + API única no Render/Cloud Run" — documentada na Tarefa 01. O que **não** pode continuar é ter 4 configs simultâneas.

## Definition of Done da Fase 5

- [ ] Uma única estratégia de deploy ativa e documentada; configs das demais removidas.
- [ ] Nenhuma referência a SQLite (`better-sqlite3`, `finance.db`, `DB_PATH`) no repo.
- [ ] Se multi-instância: rate-limit e cache em store externo; senão, decisão de instância única documentada.
- [ ] Deploy testado (health check verde no host escolhido).
