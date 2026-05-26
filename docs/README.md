# Documentacao do Projeto - INOVA PRO

Este diretorio concentra a documentacao tecnica, produto, operacao e planejamento do INOVA PRO.

## Estrutura

1. [PRD.md](./PRD.md): requisitos de produto e escopo funcional.
2. [ARCHITECTURE.md](./ARCHITECTURE.md): arquitetura tecnica vigente do frontend, backend e banco.
3. [ROADMAP.md](./ROADMAP.md): plano de evolucao e prioridades.
4. [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md): guia de desenvolvimento.
5. [PLANO-SANEAMENTO-INOVA-PRO.md](./PLANO-SANEAMENTO-INOVA-PRO.md): plano de saneamento tecnico e documental em andamento.

## Stack Atual

- Frontend: React 19, TypeScript, Vite, Tailwind CSS e Zustand.
- Backend: Express, TypeScript e Prisma.
- Banco: PostgreSQL.
- Testes: Vitest, Testing Library e MSW.
- Build/PWA: Vite + vite-plugin-pwa.

## Estado da Documentacao

A documentacao esta em saneamento. Os arquivos `README.md`, `STATUS.md`, `docs/README.md`, `docs/ARCHITECTURE.md`, `docs/PRD.md`, `docs/ROADMAP.md`, `docs/DEVELOPER_GUIDE.md` e `docs/MANUAL_USO_LOCAL.md` foram atualizados primeiro por serem os pontos de entrada mais importantes.

Ainda existem documentos historicos que mencionam SQLite, Supabase ou Render como plano antigo. Esses arquivos devem ser revisados antes de serem usados como referencia operacional.

## Regras de Manutencao

- Mudancas estruturais no codigo ou banco devem ser refletidas em `ARCHITECTURE.md`.
- Mudancas de escopo e prioridade devem ser refletidas em `ROADMAP.md`.
- Bugs e riscos ativos devem aparecer em `STATUS.md` ou no plano de saneamento.
- Novas instrucoes operacionais devem evitar contradizer `package.json`, `server.ts` e `prisma/schema.prisma`.

**Ultima atualizacao:** 26 de maio de 2026
