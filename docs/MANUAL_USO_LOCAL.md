# Manual de Uso Local - INOVA PRO

## Primeira Configuracao

```bash
git clone https://github.com/ReyvisonBraz/inovapro-claude.git
cd inovapro-claude
npm install
```

Crie o arquivo `.env` a partir de `.env.example`:

```bash
cp .env.example .env
```

Preencha pelo menos:

- `DATABASE_URL` ou as variaveis `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` e `DB_NAME`.
- `JWT_SECRET`.
- `VITE_API_URL`.

## Rodar Localmente

```bash
npm run dev
```

Esse comando sobe backend Express e frontend Vite juntos.

Comandos separados:

```bash
npm run dev:api
npm run dev:frontend
```

## Validar Antes de Entregar Mudancas

```bash
npm run lint
npm test -- --run
npm run build
```

Estado validado em 26 de maio de 2026:

- Lint passou.
- Testes passaram com 4 arquivos e 36 testes.
- Build passou com `prisma generate` e Vite.

## Banco de Dados

O projeto usa PostgreSQL via Prisma.

O schema fica em:

```bash
prisma/schema.prisma
```

A conexao e lida por:

```bash
src/lib/prisma.ts
```

Nao versionar senhas, dumps reais ou arquivos `.env` com credenciais.

## Fluxo Diario

Antes de trabalhar:

```bash
git pull origin main
```

Depois de trabalhar:

```bash
git status --short
git add .
git commit -m "descricao do que foi feito"
git push origin main
```

## Credenciais

Credenciais de desenvolvimento dependem dos dados existentes no PostgreSQL usado localmente. Se nao houver usuario, crie ou restaure dados de teste antes de validar login.

## Observacoes

- O terminal PowerShell pode exibir acentos quebrados em alguns comandos mesmo quando os arquivos estao em UTF-8 correto.
- Para investigar encoding, prefira leitura UTF-8 via Node ou editor configurado para UTF-8.
- O aviso de chunk grande do Vite no build nao bloqueia a geracao, mas esta registrado como otimizacao futura.
