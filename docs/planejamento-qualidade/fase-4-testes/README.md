# Fase 4 — Testes (cobertura honesta, integração e E2E)

Hoje a cobertura mede só `src/hooks`, `src/lib`, `src/store` — justamente a camada com os bugs de segurança (routes/services) fica **fora da métrica**. Não há teste de integração de rota nem E2E, apesar de `playwright` estar instalado.

**Pré-requisito:** Fases 1–2 concluídas (autorização e validação estáveis — o que os testes de rota vão exercitar). As tarefas de Fase 1/2 já introduziram `supertest` e vários testes de rota; aqui consolidamos.

## Arquivos desta fase (ordem)

| # | Arquivo | Achado | Entrega |
|---|---------|--------|---------|
| 01 | `01-cobertura-honesta.md` | M7 | `coverage.include` cobre routes/services/middleware; thresholds mínimos; CI publica cobertura |
| 02 | `02-integracao-rotas.md` | M7 | Helper de app de teste + suíte de integração por grupo de rotas (auth, validação, happy-path) |
| 03 | `03-e2e-playwright.md` | M7 | Playwright: smoke E2E (login → navegar → criar OS → rastreio público) |

## Definition of Done da Fase 4

- [ ] `coverage.include` inclui `src/routes/**`, `src/services/**`, `src/middleware/**`.
- [ ] Thresholds de cobertura configurados e atingidos (começar modestos e subir).
- [ ] Cada grupo de rotas tem teste de integração (auth + validação + happy-path).
- [ ] Ao menos 1 fluxo E2E verde no Playwright.
- [ ] CI roda `test:coverage` e falha se abaixo do threshold.
