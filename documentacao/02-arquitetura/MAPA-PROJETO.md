# Mapa do Projeto

## Arvore de Diretorios Completa

```
FINANCEIRO-INOVA/
│
├── index.html                     # Ponto de entrada HTML (carrega React)
├── package.json                   # Dependencias e scripts npm
├── package-lock.json              # Lock de versoes
├── vite.config.ts                 # Configuracao do Vite (build, plugins, aliases)
├── tsconfig.json                  # Configuracao TypeScript
├── .env                           # Variaveis de ambiente (ativas)
├── .env.example                   # Template de variaveis
├── .gitignore                     # Arquivos ignorados pelo Git
├── finance.db                     # Banco de dados SQLite (arquivo principal)
├── finance.db-shm                 # SQLite shared memory
├── finance.db-wal                 # SQLite write-ahead log
├── metadata.json                  # Metadados do projeto
├── server.ts                      # [LEGADO] Servidor monolitico (1160 linhas)
│
├── server/                        # === BACKEND (Express.js) ===
│   ├── index.ts                   # Entrada do servidor (Express + Vite)
│   ├── config.ts                  # Variaveis de ambiente centralizadas
│   ├── database.ts                # Conexao SQLite (WAL mode, foreign keys)
│   ├── seed.ts                    # Criacao de tabelas, migrations, dados padrao
│   ├── helpers.ts                 # Paginacao e log de auditoria
│   │
│   ├── middleware/
│   │   ├── auth.ts                # JWT: generateToken, verifyToken, requireAuth, requireRole, requirePermission
│   │   ├── errorHandler.ts        # Tratamento global de erros (ZodError, AppError)
│   │   └── rateLimiter.ts         # Rate limiting: login (10/15min), API (200/min)
│   │
│   ├── routes/
│   │   ├── index.ts               # Agregador de todas as rotas
│   │   ├── auth.routes.ts         # POST /login, CRUD /users
│   │   ├── transactions.routes.ts # CRUD /transactions, GET /stats
│   │   ├── customers.routes.ts    # CRUD /customers, GET /:id/payments
│   │   ├── payments.routes.ts     # CRUD /client-payments, receipts
│   │   ├── serviceOrders.routes.ts# CRUD /service-orders, statuses, public status
│   │   ├── inventory.routes.ts    # CRUD /inventory
│   │   └── settings.routes.ts     # Settings, categories, brands, models, equipment-types, audit-logs
│   │
│   └── validators/
│       └── schemas.ts             # Todos os Zod schemas de validacao
│
├── src/                           # === FRONTEND (React) ===
│   ├── App.tsx                    # Componente principal (3257 linhas - MONOLITICO)
│   ├── main.tsx                   # Ponto de entrada React (ErrorBoundary + Toast)
│   ├── index.css                  # Tailwind CSS + estilos custom (glass, neon)
│   ├── types.ts                   # Interfaces TypeScript de todos os modelos
│   │
│   ├── components/                # Componentes React
│   │   ├── Login.tsx              # Tela de login
│   │   ├── Dashboard.tsx          # Dashboard financeiro
│   │   ├── Customers.tsx          # Gestao de clientes
│   │   ├── Transactions.tsx       # Gestao de transacoes
│   │   ├── ServiceOrders.tsx      # Ordens de servico (2488 linhas)
│   │   ├── ClientPayments.tsx     # Pagamentos de clientes (702 linhas)
│   │   ├── Inventory.tsx          # Controle de estoque
│   │   ├── Reports.tsx            # Relatorios
│   │   ├── StatusPage.tsx         # Pagina publica de status de OS
│   │   ├── ErrorBoundary.tsx      # Tratamento de erros React
│   │   ├── CustomerSearchSelect.tsx # Select de cliente com busca
│   │   ├── SearchableSelect.tsx   # Select generico com busca
│   │   ├── SidebarItem.tsx        # Item do menu lateral
│   │   ├── StatCard.tsx           # Card de estatistica
│   │   │
│   │   ├── audit/
│   │   │   └── AuditLogs.tsx      # Visualizador de logs de auditoria
│   │   │
│   │   ├── customers/
│   │   │   ├── Customers.tsx      # Componente modularizado de clientes
│   │   │   ├── CustomerList.tsx   # Lista de clientes
│   │   │   └── WhatsAppModal.tsx  # Modal de integracao WhatsApp
│   │   │
│   │   ├── dashboard/
│   │   │   └── Dashboard.tsx      # Dashboard modularizado
│   │   │
│   │   ├── inventory/
│   │   │   └── Inventory.tsx      # Estoque modularizado
│   │   │
│   │   ├── layout/
│   │   │   └── SidebarItem.tsx    # Item da sidebar modularizado
│   │   │
│   │   ├── modals/                # 12 componentes de modal
│   │   │   ├── AddClientPaymentModal.tsx
│   │   │   ├── AddTransactionModal.tsx
│   │   │   ├── CustomerDeleteWarningModal.tsx
│   │   │   ├── CustomerHistoryModal.tsx
│   │   │   ├── CustomerModal.tsx
│   │   │   ├── CustomerWarningModal.tsx
│   │   │   ├── DeleteConfirmationModal.tsx
│   │   │   ├── FeedbackModal.tsx
│   │   │   ├── PasswordModal.tsx
│   │   │   ├── PostCustomerActionModal.tsx
│   │   │   ├── RecordPaymentModal.tsx
│   │   │   └── WarningModal.tsx
│   │   │
│   │   ├── payments/
│   │   │   └── ClientPayments.tsx # Pagamentos modularizado
│   │   │
│   │   ├── service-orders/
│   │   │   └── ServiceOrders.tsx  # OS modularizado
│   │   │
│   │   ├── settings/              # 10 paginas de configuracao
│   │   │   ├── Settings.tsx       # Pagina principal de configuracoes
│   │   │   ├── SettingsLayout.tsx # Layout com menu lateral
│   │   │   ├── CategorySettings.tsx    # Categorias de receita/despesa
│   │   │   ├── EquipmentSettings.tsx   # Tipos de equipamento, marcas, modelos
│   │   │   ├── InterfaceSettings.tsx   # Tema, cores, tamanho da fonte
│   │   │   ├── PrintLayout.tsx         # Layout de recibos e impressao
│   │   │   ├── ProjectOverview.tsx     # Dados da empresa (CNPJ, endereco)
│   │   │   ├── SystemUpdate.tsx        # Versao e info do sistema
│   │   │   ├── UserManagement.tsx      # CRUD de usuarios e permissoes
│   │   │   └── WhatsAppSettings.tsx    # Config WhatsApp/Telegram/SendPulse
│   │   │
│   │   ├── transactions/
│   │   │   └── Transactions.tsx   # Transacoes modularizado
│   │   │
│   │   └── ui/                    # 7 componentes de UI genericos
│   │       ├── ConfirmModal.tsx   # Modal de confirmacao
│   │       ├── FeedbackBubble.tsx # Indicador de feedback IA
│   │       ├── Pagination.tsx     # Componente de paginacao
│   │       ├── PasswordModal.tsx  # Modal de senha
│   │       ├── StatCard.tsx       # Card de KPI
│   │       ├── Toast.tsx          # Notificacoes toast
│   │       └── WarningModal.tsx   # Modal de aviso
│   │
│   ├── hooks/                     # Custom hooks React
│   │   ├── useAppSettings.ts      # Estado de configuracoes
│   │   ├── useCustomers.ts        # Dados de clientes
│   │   ├── useInventory.ts        # Dados de estoque
│   │   ├── useTransactions.ts     # Dados de transacoes
│   │   └── useUsers.ts            # Dados de usuarios
│   │
│   ├── services/
│   │   └── api.ts                 # Cliente HTTP centralizado (fetch + JWT)
│   │
│   ├── lib/
│   │   ├── utils.ts               # cn(), formatCurrency(), formatMonthYear()
│   │   ├── logger.ts              # Log de erros
│   │   └── supabase-standby.ts    # Preparacao para Supabase (futuro)
│   │
│   ├── contexts/                  # [VAZIO] Preparado para React Context (Fase 2)
│   ├── pages/                     # [VAZIO] Preparado para React Router (Fase 2)
│   ├── layouts/                   # [VAZIO] Preparado para layouts (Fase 2)
│   └── test/                      # [VAZIO] Preparado para testes (Fase 4)
│
├── prisma/
│   └── schema.prisma              # Schema Prisma (preparado para PostgreSQL)
│
├── docs/                          # Documentacao anterior
│   ├── ROADMAP.md
│   ├── FASE-02-FRONTEND-ROUTER-CONTEXTS.md
│   ├── FASE-03-MODULARIZACAO-COMPONENTES.md
│   ├── FASE-04-QUALIDADE-TESTES-DEVOPS.md
│   ├── FASE-05-MULTIPLATAFORMA-DEPLOY.md
│   └── docsx/                     # Documentacao detalhada
│       ├── README.md
│       ├── ESTRUTURA.md
│       ├── PROJECT_OVERVIEW.md
│       ├── OVERVIEW.md
│       ├── implementation_plan.md
│       └── walkthrough.md
│
└── dist/                          # Build de producao (gerado pelo Vite)
```

## Estatisticas do Projeto

| Metrica | Valor |
|---------|-------|
| Componentes frontend | 53+ arquivos |
| Modulos de rota backend | 7 arquivos |
| Tabelas no banco | 14 |
| Endpoints API | 50+ |
| Custom hooks | 5 |
| Modais | 12 |
| Paginas de configuracao | 10 |
| Componentes UI | 7 |
| Linhas no App.tsx | 3.257 |
