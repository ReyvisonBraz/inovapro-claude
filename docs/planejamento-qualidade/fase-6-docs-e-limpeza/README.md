# Fase 6 — Documentação e Limpeza (MINOR)

Polimento final: dependências mortas, prop drilling, datas como `String` e documentação desatualizada. Nada aqui bloqueia produção, mas reduz dívida e atrito de manutenção.

**Pré-requisito:** idealmente após as Fases 1–5 (para docs refletirem o estado final).

## Arquivos desta fase (ordem sugerida)

| # | Arquivo | Achado | Entrega |
|---|---------|--------|---------|
| 01 | `01-deps-mortas.md` | Minors | Remove `vite` duplicado, `ts-morph` não usado e outras deps órfãs |
| 02 | `02-prop-drilling.md` | Minors | Reduz prop drilling (ex.: `ClientPayments` com ~28 props) consumindo stores/hooks |
| 03 | `03-datas-string-para-datetime.md` | Minors | Migra colunas de data `String → DateTime` |
| 04 | `04-docs-e-readme.md` | Docs | Corrige links quebrados, atualiza README/.env.example, documenta denormalização |

## Definition of Done da Fase 6

- [ ] `npx depcheck` sem dependências não usadas relevantes; sem duplicatas em `package.json`.
- [ ] `ClientPayments` (e picos similares) sem receber estado/setters que já vivem em stores.
- [ ] Colunas de data em `DateTime` (ou decisão consciente de manter `String`, documentada).
- [ ] README/docs sem links quebrados; `.env.example` cobrindo todas as env em uso.
- [ ] `npm run verify` verde.
