# Fase 3 — Tipagem e Lint (qualidade de código)

Transforma o "lint" de fachada (hoje `lint = tsc`) em verificação real e endurece o TypeScript. Reduz dívida crônica: 219 `any`, 64 `console.*`, `strict` desligado, JWT em `localStorage`.

**Pré-requisito:** Fase 2 concluída (backend estável). Pode correr em paralelo à Fase 4 se houver dois executores.

## Arquivos desta fase (ordem)

| # | Arquivo | Achado | Natureza |
|---|---------|--------|----------|
| 01 | `01-eslint-setup.md` | M9 | Instala ESLint (flat config) com regras de hooks e imports; separa `lint` de `typecheck` |
| 02 | `02-remover-console-e-any.md` | Minors | Zera `console.*` de produção e reduz `any` guiado pelas regras do ESLint |
| 03 | `03-typescript-strict.md` | Tipagem | Liga a família `strict` incrementalmente até `tsc` verde |
| 04 | `04-jwt-httponly.md` | M10 | Move o token para cookie httpOnly (mitiga roubo por XSS) |

> **Realismo:** a tarefa 03 (`strict`) é o **maior** esforço isolado do projeto — provavelmente centenas de erros a resolver. Ela é fatiada por diretório, com commit por lote. Não tente fazê-la de uma vez; trate cada lote como uma sub-entrega.

## Definition of Done da Fase 3

- [ ] `npm run lint` roda ESLint (não `tsc`) e passa; `npm run typecheck` continua sendo o `tsc`.
- [ ] Zero `console.*` em código de produção (permitido em `src/lib/logger.ts` e `server-logger.ts`).
- [ ] `strict: true` no `tsconfig.json` com `tsc` verde.
- [ ] Login/logout via cookie httpOnly; `localStorage` não guarda mais o token.
- [ ] CI roda lint + typecheck + testes.
