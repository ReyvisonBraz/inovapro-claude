# Roadmap de Fases

## Visao Geral

| Fase | Nome | Status | Prioridade |
|------|------|--------|------------|
| 1 | Backend Modular | CONCLUIDA | - |
| 2 | Frontend Router + Contexts | INTEGRADA | - |
| 3 | Modularizacao de Componentes | PENDENTE | ALTA |
| 4 | Qualidade e Testes | PENDENTE | ALTA |
| 5 | Cloud Deploy + PostgreSQL | PENDENTE | MEDIA |

---

## Fase 1: Backend Modular (CONCLUIDA)

### O Que Foi Feito

- Servidor monolitico (server.ts, 1160 linhas) refatorado para estrutura modular (server/)
- JWT implementado com generateToken, verifyToken, requireAuth
- bcryptjs para hash de senhas (com auto-upgrade de plaintext)
- Rate limiting no login (10 tentativas / 15 min)
- Schemas Zod para todas as entidades
- AppError para tratamento padronizado de erros
- Middleware de role e permissao
- Audit logging em operacoes criticas
- Rotas separadas por dominio (7 arquivos)

### Resultado

```
server.ts (1160 linhas) → server/ (17 arquivos organizados)
```

---

## Fase 2: Frontend Router + Contexts (INTEGRADA)

### O Que Foi Feito

- React Router v6 configurado em main.tsx
- AppRoutes.tsx criado com todas as rotas (487 linhas):
  - /login, /dashboard, /transactions, /reports, /customers
  - /client-payments, /service-orders, /inventory, /settings/*
  - /status/:osNumber (pagina publica)
- ProtectedRoute e PublicRoute implementados
- AuthContext criado (login, logout, token, user)
- DataContext criado (fetch de dados: customers, transactions, payments, inventory, OS, audit)
- SettingsContext criado (fetch e update de settings)
- App.tsx integrado com Providers via main.tsx
- DataLoader automatico ao autenticar

### Resultado

```
App.tsx (monolitico) → AppRoutes + Contexts (navegacao real)
```

### Observacoes

- Fase 2 INTEGRADA (funcionando), mas app continua com props drilling
- Fase 3 (Modularizacao) ira eliminar props desnecessarios
- AppRoutes faz a ponte entre Contexts e componentes existentes

### Dependencias

- Nenhuma (proximo: Fase 3)

### Documentacao Detalhada

- docs/FASE-02-FRONTEND-ROUTER-CONTEXTS.md

---

## Fase 3: Modularizacao de Componentes (PENDENTE)

### Objetivo

Quebrar componentes gigantes em partes menores e reutilizaveis.

### Tarefas

- [ ] Dividir ServiceOrders.tsx (~2488 linhas) em:
  - [ ] ServiceOrderList
  - [ ] ServiceOrderForm
  - [ ] ServiceOrderDetail
  - [ ] ServiceOrderPrint
- [ ] Dividir ClientPayments.tsx (~702 linhas) em:
  - [ ] PaymentList
  - [ ] PaymentForm
  - [ ] PaymentReceipt
- [ ] Dividir Transactions.tsx (~606 linhas)
- [ ] Eliminar componentes duplicados (raiz vs subdiretorios)
- [ ] Extrair templates de impressao em componentes separados
- [ ] Remover server.ts legado

### Dependencias

- Fase 2 (precisa de Router e Contexts primeiro)

### Documentacao Detalhada

- docs/FASE-03-MODULARIZACAO-COMPONENTES.md

---

## Fase 4: Qualidade e Testes (PENDENTE)

### Objetivo

Garantir qualidade do codigo com testes e ferramentas de analise.

### Tarefas

- [ ] Configurar Vitest para testes unitarios
- [ ] Testes unitarios nos hooks customizados
- [ ] Testes unitarios nos utilitarios (formatCurrency, etc.)
- [ ] Configurar Supertest para testes de API
- [ ] Testes de integracao nos endpoints criticos:
  - [ ] Login e autenticacao
  - [ ] CRUD de transacoes
  - [ ] CRUD de ordens de servico
  - [ ] Pagamentos e parcelas
- [ ] Configurar ESLint com regras TypeScript
- [ ] Configurar Prettier para formatacao
- [ ] Remover console.logs do codigo
- [ ] Corrigir tipos `any` por tipos corretos
- [ ] Configurar .env.local para desenvolvimento

### Dependencias

- Fase 3 (testar componentes ja modularizados)

### Documentacao Detalhada

- docs/FASE-04-QUALIDADE-TESTES-DEVOPS.md

---

## Fase 5: Cloud Deploy + PostgreSQL (PENDENTE)

### Objetivo

Publicar o sistema online com banco na nuvem.

### Tarefas

- [ ] Criar projeto Supabase (regiao sa-east-1)
- [ ] Migrar schema SQLite para PostgreSQL via Prisma
- [ ] Migrar dados existentes
- [ ] Substituir better-sqlite3 por Prisma Client
- [ ] Migrar fotos base64 para Supabase Storage
- [ ] Implementar API versioning (/api/v1/)
- [ ] Configurar CORS restritivo
- [ ] Configurar HTTPS
- [ ] Implementar PWA basico (service worker, manifest)
- [ ] Deploy backend (Render, Railway ou VPS)
- [ ] Deploy frontend (Vercel ou junto com backend)
- [ ] Gerar documentacao API (Swagger/OpenAPI)
- [ ] Criar pacote de tipos compartilhados (frontend + backend)

### Dependencias

- Fase 4 (ir para producao com testes)

### Documentacao Detalhada

- docs/FASE-05-MULTIPLATAFORMA-DEPLOY.md

---

## Ordem Recomendada de Execucao

```
Fase 2 (Router + Contexts)
    └── Fase 3 (Modularizacao)
         └── Fase 4 (Testes)
              └── Fase 5 (Deploy)
```

Cada fase depende da anterior. A Fase 2 e o ponto de partida critico pois desbloqueia todo o restante.
