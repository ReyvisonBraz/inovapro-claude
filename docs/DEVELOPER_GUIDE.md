# Guia do Desenvolvedor - INOVA PRO

## 1. Requisitos

- Node.js instalado.
- npm.
- PostgreSQL acessivel localmente ou em servico externo.
- Arquivo `.env` criado a partir de `.env.example`.

## 2. Instalacao

```bash
npm install
```

## 3. Variaveis Principais

- `DATABASE_URL`: URL completa do PostgreSQL usada pelo Prisma.
- `JWT_SECRET`: segredo para tokens JWT.
- `VITE_API_URL`: URL base da API para o frontend.
- `PORT`: porta do backend Express.

Tambem e possivel configurar o banco por partes com `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` e `DB_NAME`.

## 4. Desenvolvimento

```bash
npm run dev
```

Sobe frontend e backend juntos.

```bash
npm run dev:api
```

Sobe apenas o backend Express.

```bash
npm run dev:frontend
```

Sobe apenas o frontend Vite.

## 5. Validacao

```bash
npm run lint
```

Executa typecheck com `tsc --noEmit`.

```bash
npm test -- --run
```

Executa os testes automatizados em modo nao interativo.

```bash
npm run build
```

Executa `prisma generate` e gera o build de producao do frontend.

## 6. Banco de Dados

O schema fica em `prisma/schema.prisma` e usa provider `postgresql`.

O Prisma Client e configurado em `src/lib/prisma.ts` com `@prisma/adapter-pg`. A conexao pode vir de `DATABASE_URL` ou das variaveis `DB_*`.

### 6.1 Migrations (Prisma Migrate)

O projeto usa `prisma migrate` (a pasta `prisma/migrations/` e versionada). Nao use mais `prisma db push`.

Fluxo para alterar o schema:

1. Edite `prisma/schema.prisma`.
2. Rode `npx prisma migrate dev --name descricao-da-mudanca` (gera e aplica a migration no banco de dev).
3. Commite a pasta `prisma/migrations/` junto com o schema.
4. Em producao, `npx prisma migrate deploy` aplica as migrations pendentes — o Dockerfile e o `render.yaml` ja fazem isso automaticamente na inicializacao.

Banco existente (primeira adocao das migrations): o banco de producao ja tem as tabelas do baseline, entao marque o baseline como aplicado UMA unica vez antes do primeiro deploy:

```
npx prisma migrate resolve --applied 0_baseline
```

Depois disso, `npx prisma migrate deploy` aplica somente as migrations novas (a primeira delas e `20260704120000_add_version_columns`).

### 6.2 Concorrencia (lock otimista)

Todas as entidades editaveis tem a coluna `version Int @default(0)`:

- Todo update de service DEVE ser condicional e atomico: `updateMany({ where: { id, version: versaoDoCliente }, data: { ..., version: { increment: 1 } } })`; `count === 0` vira `ConflictError` (HTTP 409) via `src/lib/errors.ts`.
- Valores numericos compartilhados (paidAmount, quantity/stockLevel) NUNCA usam ler-somar-gravar; sempre `increment`/`decrement` atomico, com guarda no `where` quando o valor nao pode ficar negativo (ex.: estoque).
- Operacoes financeiras compostas rodam dentro de `prisma.$transaction`.
- Os testes dessas garantias estao em `src/test/concurrency.service.test.ts`.

Antes de mudancas estruturais no banco:

- Revise o impacto em rotas, hooks e tipos.
- Confira defaults do schema.
- Registre a decisao na documentacao.
- Valide `npm run build`, pois ele executa `prisma generate`.

## 7. Padroes de Codigo

- Preferir TypeScript forte e evitar `any` em codigo novo.
- Manter regras de negocio em hooks, services ou rotas, nao espalhadas em componentes grandes.
- Usar stores Zustand apenas para estado realmente compartilhado.
- Usar Zod para validacao de entrada.
- Usar React Query para dados remotos.
- Usar componentes existentes antes de criar novos padroes visuais.

## 8. Testes

Os testes usam Vitest, Testing Library e MSW.

Ao adicionar ou corrigir comportamento de API no frontend:

- Atualize handlers em `src/test/mocks/handlers.ts`.
- Use URLs que funcionem para chamadas absolutas e relativas quando necessario.
- Simule estado autenticado quando o hook depender de login.

## 9. Manutencao

- Atualize `README.md` quando comandos ou requisitos mudarem.
- Atualize `docs/ARCHITECTURE.md` quando a estrutura tecnica mudar.
- Atualize `docs/ROADMAP.md` quando prioridades mudarem.
- Evite misturar refatoracao ampla com correcao pontual.

**Ultima atualizacao:** 26 de maio de 2026
