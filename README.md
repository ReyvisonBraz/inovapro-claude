# INOVA PRO

Sistema web de gestao para assistencia tecnica e loja, cobrindo financeiro, clientes, contas a receber, ordens de servico, estoque, recibos, impressao e rastreio publico de OS.

## Stack Atual

- Frontend: React, Vite, TypeScript, Tailwind e Zustand.
- Backend: Express, TypeScript e Prisma.
- Banco: PostgreSQL.
- Testes: Vitest, Testing Library e MSW.
- Build/PWA: Vite + vite-plugin-pwa.

## Requisitos

- Node.js instalado.
- Um banco PostgreSQL acessivel.
- Variaveis de ambiente configuradas em `.env`.

## Configuracao Local

1. Instale as dependencias:

```bash
npm install
```

2. Crie o arquivo `.env` a partir de `.env.example` e preencha os valores principais:

```bash
cp .env.example .env
```

Variaveis essenciais:

- `DATABASE_URL`: URL completa do PostgreSQL usada pelo Prisma.
- `JWT_SECRET`: segredo para assinatura de tokens.
- `VITE_API_URL`: URL base da API usada pelo frontend.

Tambem e possivel configurar a conexao PostgreSQL por partes com `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` e `DB_NAME`, conforme `.env.example`.

## Comandos

```bash
npm run dev
```

Sobe API e frontend em modo desenvolvimento.

```bash
npm run dev:api
```

Sobe apenas o backend Express.

```bash
npm run dev:frontend
```

Sobe apenas o frontend Vite.

```bash
npm run lint
```

Executa typecheck com `tsc --noEmit`.

```bash
npm test -- --run
```

Executa a suite automatizada em modo nao interativo.

```bash
npm run build
```

Gera Prisma Client e cria o build de producao do frontend.

## Qualidade e verificacao

- `npm run lint`: ESLint (flat config; react-hooks + unused-imports).
- `npm run typecheck`: `tsc --noEmit` com **strict mode** ativado.
- `npm run test:coverage`: Vitest com cobertura e thresholds (catraca).
- `npm run verify`: lint + typecheck + testes (gate local).
- `npm run e2e`: smoke E2E do login com Playwright (requer `E2E_PASS`).

Um saneamento de qualidade esta em andamento (seguranca, tipagem, testes). O
plano e o progresso vivem em [docs/planejamento-qualidade/](./docs/planejamento-qualidade/)
(indice em `README.md`, estado em `PROGRESSO.md`).

## Documentacao

- [Planejamento de qualidade](./docs/planejamento-qualidade/README.md) — plano e progresso do saneamento.
- [Documentacao tecnica](./docs/README.md)

Alguns documentos antigos ainda podem mencionar SQLite ou Supabase como plano de migracao. A referencia atual do projeto e Express + Prisma + PostgreSQL.
