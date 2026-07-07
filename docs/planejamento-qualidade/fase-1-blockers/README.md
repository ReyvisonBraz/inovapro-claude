# Fase 1 — BLOCKERS (segurança que impede produção)

Os quatro itens desta fase são exploráveis ou já perigosos no estado atual. Nenhum deploy deve ir ao ar sem os quatro resolvidos.

**Pré-requisito:** Fase 0 concluída (build verde, banco com `version`).

## Arquivos desta fase (ordem recomendada)

| # | Arquivo | Achado | Risco se não corrigido |
|---|---------|--------|------------------------|
| 01 | `01-autorizacao-rbac.md` | B1 | Escalada de privilégio: um `employee` cria usuário `owner`, apaga usuários e deleta qualquer registro |
| 02 | `02-cors-e-helmet.md` | B3 | Qualquer site faz requisições autenticadas cross-origin (CORS libera tudo + CSP off) |
| 03 | `03-purgar-segredos-git.md` | B4 | Hashes de senha, `pixKey`, `sendPulseClientSecret` e PII (CPF) versionados no git |
| 04 | `04-audit-trail-req-user.md` | M5 | `createdBy`/`updatedBy` vêm do body → auditoria falsificável e sem valor forense |

> A ordem 01→04 é recomendada, mas 03 (purga de git) é independente e pode ser feita a qualquer momento por quem tiver o histórico do repositório em mãos. Faça 04 **depois** de 01, porque ambas mexem na cadeia de middlewares/`req.user`.

## Convenção de teste desta fase

Introduzimos testes de **autorização em nível HTTP** com `supertest` (instalado na Tarefa 01). Eles montam um app Express mínimo com um `requireAuth` stub que injeta um `req.user` configurável, e afirmam os códigos 401/403/200 corretos. Isso não depende de banco: os 403 são retornados pelo middleware antes de qualquer handler.

## Definition of Done da Fase 1

- [ ] Nenhuma rota de escrita responde 2xx para uma role sem permissão (provado por teste).
- [ ] `/api/users` e `/api/settings` exigem `owner` (403 para `manager`/`employee`).
- [ ] Origem não permitida em produção recebe erro de CORS (não `Access-Control-Allow-Origin`).
- [ ] `helmet` com CSP ativo.
- [ ] `git log --all -- backups/` vazio; segredos rotacionados; `.gitignore` cobre `backups/`.
- [ ] `createdBy`/`updatedBy` derivam de `req.user.userId`, nunca do body.
- [ ] `npm run verify` verde.
