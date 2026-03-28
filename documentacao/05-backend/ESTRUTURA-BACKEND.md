# Estrutura do Backend

## Visao Geral

O backend e uma API REST construida com Express.js que serve tanto a API quanto o frontend (em producao).

## Ponto de Entrada: server/index.ts

```
1. Carrega variaveis de ambiente (dotenv)
2. Inicializa banco de dados (initializeDatabase)
3. Configura Express:
   - express.json() com limite de 50MB
   - express.urlencoded() com limite de 50MB
   - apiLimiter (rate limiting global)
   - Monta rotas da API em /api
4. Modo desenvolvimento:
   - Cria Vite dev server em modo middleware
   - HMR ativo para frontend
5. Modo producao:
   - Serve arquivos estaticos de /dist
   - SPA fallback (todas as rotas retornam index.html)
6. Registra errorHandler global
7. Inicia servidor na porta configurada (padrao: 3000)
```

## Organizacao dos Arquivos

```
server/
├── index.ts              # Entrada do servidor Express
├── config.ts             # Configuracao centralizada (env vars)
├── database.ts           # Conexao SQLite (WAL mode)
├── seed.ts               # Criacao de tabelas + dados padrao
├── helpers.ts            # Paginacao e auditoria
│
├── middleware/
│   ├── auth.ts           # JWT + controle de acesso
│   ├── errorHandler.ts   # Tratamento global de erros
│   └── rateLimiter.ts    # Rate limiting
│
├── routes/
│   ├── index.ts          # Agregador de todas as rotas
│   ├── auth.routes.ts    # Login e usuarios
│   ├── transactions.routes.ts  # Transacoes
│   ├── customers.routes.ts     # Clientes
│   ├── payments.routes.ts      # Pagamentos e recibos
│   ├── serviceOrders.routes.ts # Ordens de servico
│   ├── inventory.routes.ts     # Estoque
│   └── settings.routes.ts      # Configuracoes e lookup tables
│
└── validators/
    └── schemas.ts        # Schemas Zod de validacao
```

## Configuracao (config.ts)

| Variavel | Padrao | Env Var |
|----------|--------|---------|
| Porta | 3000 | `PORT` |
| JWT Secret | `financeflow-dev-secret...` | `JWT_SECRET` |
| JWT Expiracao | 8h | `JWT_EXPIRES_IN` |
| Bcrypt Rounds | 10 | `BCRYPT_ROUNDS` |
| Rate Limit Window | 15 min | - |
| Rate Limit Login | 10 tentativas | - |
| CORS Origin | `*` | `CORS_ORIGIN` |

## Banco de Dados (database.ts)

- **Driver:** better-sqlite3 (sincrono, alta performance)
- **Arquivo:** `finance.db` na raiz do projeto
- **WAL mode:** Habilitado (leituras concorrentes)
- **Foreign keys:** Ativadas via PRAGMA
- **Exporta:** instancia `db` do Database

## Inicializacao (seed.ts)

### Funcao `initializeDatabase()`

1. Cria todas as 14 tabelas (IF NOT EXISTS)
2. Executa migrations inline (ALTER TABLE para colunas novas)
3. Insere dados padrao:
   - Usuario admin (admin/admin, role: owner)
   - Configuracoes padrao (settings id=1)
   - 11 categorias (5 receita + 6 despesa)
   - 7 status de OS com cores
   - 7 tipos de equipamento
   - 5 transacoes exemplo

## Helpers (helpers.ts)

### getPaginatedData()

Funcao generica de paginacao para qualquer tabela:

```typescript
getPaginatedData(tableName, page, limit, {
  where: "type = ?",        // Filtro WHERE
  params: ["income"],       // Parametros do filtro
  orderBy: "date DESC",     // Ordenacao
  join: "LEFT JOIN ...",    // JOINs opcionais
  select: "t.*, c.name"    // Campos selecionados
})
// Retorna: { data: [...], meta: { total, page, limit, totalPages } }
```

### logAudit()

Registra acoes no log de auditoria:

```typescript
logAudit(userId, "CREATE", "transaction", entityId, "Descricao da acao")
```

## Arquivo Legado: server.ts

- **1.160 linhas** na raiz do projeto
- Versao monolitica anterior a modularizacao
- Todas as rotas, middleware e logica em um unico arquivo
- **NAO e usado** (substituido por server/)
- Script: `npm run dev:legacy` (ainda funciona)
- **Deve ser removido** antes de ir para producao
