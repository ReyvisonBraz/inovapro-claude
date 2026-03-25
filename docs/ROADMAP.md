# 🗺️ Roadmap de Refatoração — FinanceFlow OS

> Este documento é o índice geral das fases de refatoração do projeto. Cada fase tem seu próprio arquivo `.md` com detalhes completos.

---

## Status Geral

| Fase | Descrição | Status | Documento |
|------|-----------|--------|-----------|
| **1** | Backend Modular + Segurança | ✅ **Concluída** | *(executada diretamente)* |
| **2** | Frontend: React Router + Contexts | ⏳ Pendente | [FASE-02](./FASE-02-FRONTEND-ROUTER-CONTEXTS.md) |
| **3** | Modularização de Componentes | ⏳ Pendente | [FASE-03](./FASE-03-MODULARIZACAO-COMPONENTES.md) |
| **4** | Qualidade, Testes e DevOps | ⏳ Pendente | [FASE-04](./FASE-04-QUALIDADE-TESTES-DEVOPS.md) |
| **5** | Multi-plataforma + Deploy | ⏳ Pendente | [FASE-05](./FASE-05-MULTIPLATAFORMA-DEPLOY.md) |

---

## Fase 1 — ✅ Concluída

O `server.ts` monolítico (1.160 linhas) foi substituído por 14 arquivos em `server/`:
- JWT auth com bcrypt (auto-upgrade de senhas legadas)
- Rate limiting no login
- Error handler global
- Zod schemas tipados (sem `z.any()`)
- Rotas modulares por domínio

---

## Fase 2 — React Router + Context API
📄 **[Detalhes completos →](./FASE-02-FRONTEND-ROUTER-CONTEXTS.md)**

**5 etapas** | Meta: reduzir `App.tsx` de 3.200 → ~200 linhas

1. Instalar e configurar React Router (URLs reais, deep links)
2. Criar Contexts (AuthContext, SettingsContext, UIContext)
3. Consumir hooks existentes (já criados mas não usados)
4. Expandir API Service tipado (serviços por domínio)
5. Eliminar componentes duplicados

---

## Fase 3 — Modularização de Componentes
📄 **[Detalhes completos →](./FASE-03-MODULARIZACAO-COMPONENTES.md)**

**6 etapas** | Meta: quebrar componentes gigantes em peças testáveis

1. Quebrar `ServiceOrders.tsx` (129 KB → 8+ sub-componentes)
2. Quebrar `ClientPayments.tsx` (39 KB → 6+ sub-componentes)
3. Quebrar `Transactions.tsx` (31 KB → 5+ sub-componentes)
4. Quebrar `Inventory.tsx` (16 KB → 3+ sub-componentes)
5. Extrair templates de impressão (HTML strings → React components)
6. Refatorar Dashboard em widgets

---

## Fase 4 — Qualidade, Testes e DevOps
📄 **[Detalhes completos →](./FASE-04-QUALIDADE-TESTES-DEVOPS.md)**

**6 etapas** | Meta: cobertura de testes + CI/CD

1. Configurar Vitest + Testing Library
2. Testes unitários do frontend (hooks, utils, componentes)
3. Testes de API (Supertest para todas as rotas)
4. ESLint + Prettier configurados
5. Variáveis de ambiente seguras
6. Docker (opcional)

---

## Fase 5 — Multi-plataforma + Deploy
📄 **[Detalhes completos →](./FASE-05-MULTIPLATAFORMA-DEPLOY.md)**

**8 etapas** | Meta: API pronta para web, mobile e produção

1. CORS configurável
2. Versionamento de API (`/api/v1/`)
3. Documentação Swagger/OpenAPI
4. Migração para PostgreSQL (Supabase/Render)
5. Shared Types package
6. PWA (Progressive Web App)
7. Deploy em produção
8. Preparação para React Native

---

## Recomendações

- **Cada fase pode ser executada em sessões separadas**
- **Sempre testar** antes de avançar para a próxima fase
- **Validar** com `npm run build` ao final de cada fase
- **Commitar** ao final de cada fase (um commit por fase)
