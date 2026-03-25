# Walkthrough — Fase 1: Backend Modularizado

## O que foi feito

O [server.ts](file:///c:/Users/reyvison/Desktop/ANTIGRAVITY/FINANCEIRO-INOVA/server.ts) monolítico (1160 linhas) foi substituído por uma arquitetura modular em `server/` com 14 arquivos organizados por responsabilidade.

### Estrutura criada

```
server/
├── index.ts              ← Entry point (50 linhas vs 1160 original)
├── config.ts             ← ENV vars centralizadas
├── database.ts           ← Conexão SQLite com WAL mode
├── seed.ts               ← Criação de tabelas, migrações e dados padrão
├── helpers.ts            ← Paginação reutilizável + audit logger
├── middleware/
│   ├── auth.ts           ← JWT: geração, verificação, requireAuth, requireRole, requirePermission
│   ├── errorHandler.ts   ← AppError class + handler global (Zod + app errors)
│   └── rateLimiter.ts    ← Rate limiting para login e API geral
├── validators/
│   └── schemas.ts        ← Todos os Zod schemas (z.any() eliminados)
└── routes/
    ├── index.ts           ← Monta todas as rotas com paths backward-compatible
    ├── auth.routes.ts     ← Login (bcrypt + JWT) + Users CRUD
    ├── transactions.routes.ts
    ├── customers.routes.ts
    ├── payments.routes.ts ← Inclui receipts
    ├── serviceOrders.routes.ts ← Inclui statuses + reconciliação de inventário
    ├── inventory.routes.ts
    └── settings.routes.ts ← Settings + categories/brands/models/equipment-types/audit-logs
```

### Melhorias de segurança implementadas

| Antes | Depois |
|-------|--------|
| Senhas em plaintext | bcrypt hash (auto-upgrade de senhas legadas no login) |
| Sem autenticação por sessão | JWT tokens com expiração configurável |
| Sem rate limiting | Rate limiter no login (10 tentativas/15min) |
| `z.any()` para services/parts | Schemas tipados `ServiceItemSchema` e `PartUsedSchema` |
| Erros inconsistentes | [AppError](file:///c:/Users/reyvison/Desktop/ANTIGRAVITY/FINANCEIRO-INOVA/server/middleware/errorHandler.ts#7-17) class + handler global |
| Sem proteção de roles | [requireRole()](file:///c:/Users/reyvison/Desktop/ANTIGRAVITY/FINANCEIRO-INOVA/server/middleware/auth.ts#63-78) e [requirePermission()](file:///c:/Users/reyvison/Desktop/ANTIGRAVITY/FINANCEIRO-INOVA/server/middleware/auth.ts#79-102) middleware |

### Backward Compatibility

Todas as URLs da API permanecem as mesmas (`/api/transactions`, `/api/customers`, etc.). O frontend não precisa mudar suas chamadas.

## ⚠️ Ação necessária do usuário

O `npm` não está no PATH do sistema. Para completar a instalação, execute no terminal:

```bash
npm install bcryptjs jsonwebtoken express-rate-limit
npm install -D @types/bcryptjs @types/jsonwebtoken
```

Depois, valide com:

```bash
npm run dev
```

> O [server.ts](file:///c:/Users/reyvison/Desktop/ANTIGRAVITY/FINANCEIRO-INOVA/server.ts) original foi mantido como backup. O script `npm run dev:legacy` pode ser usado para rodar a versão antiga se necessário.
