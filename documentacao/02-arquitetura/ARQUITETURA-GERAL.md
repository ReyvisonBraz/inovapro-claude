# Arquitetura Geral

## Visao em Camadas

```
┌─────────────────────────────────────────────────┐
│                   BROWSER                        │
│                                                  │
│  ┌────────────────────────────────────────────┐  │
│  │           React SPA (src/)                  │  │
│  │                                             │  │
│  │  App.tsx (orquestrador central)             │  │
│  │    ├── Componentes de tela                  │  │
│  │    ├── Modais                               │  │
│  │    └── Hooks customizados                   │  │
│  │                                             │  │
│  │  services/api.ts (cliente HTTP)             │  │
│  │    └── fetch() + Bearer JWT token           │  │
│  └──────────────┬─────────────────────────────┘  │
│                 │ HTTP (JSON)                     │
└─────────────────┼────────────────────────────────┘
                  │
┌─────────────────┼────────────────────────────────┐
│                 │     EXPRESS SERVER              │
│                 ▼                                 │
│  ┌──────────────────────────────────────────┐    │
│  │          Middleware Pipeline              │    │
│  │  1. express.json() (50MB limit)          │    │
│  │  2. apiLimiter (200 req/min)             │    │
│  │  3. requireAuth (JWT validation)         │    │
│  │  4. requireRole / requirePermission      │    │
│  └──────────────┬───────────────────────────┘    │
│                 │                                 │
│  ┌──────────────▼───────────────────────────┐    │
│  │          Routes (server/routes/)         │    │
│  │  auth, transactions, customers,          │    │
│  │  payments, serviceOrders, inventory,     │    │
│  │  settings                                │    │
│  └──────────────┬───────────────────────────┘    │
│                 │                                 │
│  ┌──────────────▼───────────────────────────┐    │
│  │       Validators (Zod schemas)           │    │
│  └──────────────┬───────────────────────────┘    │
│                 │                                 │
│  ┌──────────────▼───────────────────────────┐    │
│  │       Helpers (pagination, audit)        │    │
│  └──────────────┬───────────────────────────┘    │
│                 │                                 │
└─────────────────┼────────────────────────────────┘
                  │
┌─────────────────┼────────────────────────────────┐
│                 ▼                                 │
│  ┌──────────────────────────────────────────┐    │
│  │          SQLite (finance.db)             │    │
│  │  WAL mode | Foreign keys ON              │    │
│  │  14 tabelas                              │    │
│  └──────────────────────────────────────────┘    │
│                                                   │
│                 DATABASE                          │
└───────────────────────────────────────────────────┘
```

## Modo Desenvolvimento vs Producao

### Desenvolvimento (`npm run dev`)

```
Browser ──> Express (porta 3000)
               ├── /api/* ──> Rotas do backend
               └── /* ──> Vite Dev Server (middleware mode)
                          ├── HMR (Hot Module Replacement)
                          └── Compila TypeScript/JSX em tempo real
```

- Vite roda como middleware dentro do Express
- HMR ativo para mudancas instantaneas no frontend
- Banco SQLite no arquivo local `finance.db`

### Producao (`npm run build` + `NODE_ENV=production`)

```
Browser ──> Express (porta 3000)
               ├── /api/* ──> Rotas do backend
               └── /* ──> Arquivos estaticos (dist/)
                          └── SPA fallback (index.html)
```

- Vite gera bundle otimizado em `/dist`
- Express serve arquivos estaticos
- Todas as rotas nao-API retornam `index.html` (SPA)

## Autenticacao

```
Login ──> POST /api/login
              │
              ▼
         Valida usuario/senha (bcrypt)
              │
              ▼
         Gera JWT token (8h expiracao)
              │
              ▼
         Token salvo no localStorage
              │
              ▼
         Toda requisicao inclui:
         Authorization: Bearer <token>
              │
              ▼
         requireAuth middleware valida
              │
              ▼
         requireRole/requirePermission verifica acesso
```

## Organizacao de Codigo

### Backend (Separacao de Responsabilidades)

```
Requisicao HTTP
    └── Route handler (recebe request)
         └── Zod schema (valida input)
              └── Logica de negocio (SQL direto)
                   └── better-sqlite3 (executa query)
                        └── helpers.ts (paginacao, auditoria)
```

### Frontend (Estado Atual - Monolitico)

```
App.tsx (3257 linhas)
    ├── 50+ useState hooks (estado global)
    ├── Funcoes de CRUD (fetch para API)
    ├── Renderizacao condicional (activeScreen)
    └── Props drilling para componentes filhos
```

### Frontend (Estado Futuro - Planejado)

```
React Router (URLs reais)
    ├── AuthContext (usuario, token, permissoes)
    ├── DataContexts (transacoes, clientes, etc.)
    ├── Pages (componentes de rota)
    │    └── Componentes de feature
    │         └── Componentes de UI
    └── Hooks customizados (logica reutilizavel)
```
