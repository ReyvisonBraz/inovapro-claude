# Fase 2 — Hardening do Backend (MAJORS)

Correções de segurança e robustez que não são exploráveis tão trivialmente quanto os BLOCKERS, mas degradam segurança, privacidade e desempenho.

**Pré-requisito:** Fase 1 concluída (RBAC ativo, `req.user` confiável).

## Arquivos desta fase (ordem recomendada)

| # | Arquivo | Achado | Impacto |
|---|---------|--------|---------|
| 01 | `01-bcrypt-async.md` | M1 | `bcrypt` síncrono bloqueia o event loop single-thread sob carga |
| 02 | `02-idor-token-os.md` | M2 | Rastreio público enumerável por id sequencial expõe dados de todos os clientes |
| 03 | `03-indices-db.md` | M3 | Sem índices: filtros/ordenações/`groupBy` fazem full scan |
| 04 | `04-validacao-zod.md` | M6 | `users`, `inventory`, `settings`, `categories`, `catalog` aceitam body cru |
| 05 | `05-endpoints-diagnostico.md` | M4 | `/api/db-test` e `/api/ping` vazam ambiente e stack sem auth |

> 01, 04 e 05 são independentes entre si. 02 e 03 mexem no schema Prisma (cada um cria sua migration) — rode-os um de cada vez e aplique a migration antes de seguir.

## Definition of Done da Fase 2

- [ ] Nenhum `bcrypt.*Sync` no código de produção.
- [ ] Rastreio público responde só por token não-adivinhável; id sequencial retorna 404.
- [ ] `prisma migrate status` sem pendências; índices criados nas FKs e campos de filtro/ordenação.
- [ ] Toda rota de escrita valida o body com Zod (400 em body inválido, provado por teste).
- [ ] `/api/db-test` removido/travado; `/api/ping` sem vazar `DB_HOST`.
- [ ] `npm run verify` verde.
