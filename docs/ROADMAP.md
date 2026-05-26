# Roadmap - INOVA PRO

## 1. Status Atual

O projeto esta em fase de saneamento tecnico, documentacao e validacao operacional. A base atual usa React/Vite no frontend, Express no backend, Prisma e PostgreSQL.

Validacao local concluida em 26 de maio de 2026:

- `npm.cmd run lint`: passou.
- `npm.cmd test -- --run`: passou com 4 arquivos e 36 testes.
- `npm.cmd run build`: passou.

## 2. Prioridade Imediata

### 2.1 Documentacao e Estado Real

- [x] Substituir README raiz antigo.
- [x] Atualizar `STATUS.md`.
- [x] Atualizar `docs/README.md`.
- [x] Atualizar `docs/ARCHITECTURE.md`.
- [x] Atualizar `docs/PRD.md`.
- [x] Atualizar `docs/ROADMAP.md`.
- [ ] Revisar documentos historicos e marcar claramente o que nao e mais referencia atual.

### 2.2 Seguranca de Producao

- [ ] Confirmar `.env` ignorado pelo Git.
- [ ] Revisar variaveis expostas em `.env.example`.
- [ ] Ajustar CORS para aceitar apenas origens conhecidas em producao.
- [ ] Definir uma politica CSP compativel com o frontend.
- [ ] Avaliar endpoints como `/api/ping` e `/api/db-test` em producao.
- [ ] Confirmar que logs nao exibem dados sensiveis.

### 2.3 Validacao dos Fluxos Principais

- [ ] Login valido e invalido.
- [ ] Cadastro e edicao de cliente.
- [ ] Criacao de venda/conta a receber.
- [ ] Registro de pagamento parcial e total.
- [ ] Criacao e edicao de ordem de servico.
- [ ] Impressao/preview.
- [ ] Rastreio publico de OS.
- [ ] Estoque e uso de pecas/servicos.
- [ ] Permissoes por perfil.

### 2.4 Mobile e PWA

- [ ] Testar app em viewport mobile.
- [ ] Revisar navegacao inferior e menus.
- [ ] Validar modais longos em telas pequenas.
- [ ] Confirmar que Service Worker/cache nao prende versoes antigas.
- [ ] Testar instalacao PWA limpa quando possivel.

## 3. Melhorias Futuras

- Painel administrativo para visualizacao operacional de dados.
- PDV/vendas diretas mais rapido.
- Relatorios avancados por tecnico, servico e periodo.
- Integracao WhatsApp mais completa.
- Melhor separacao de chunks no build Vite.
- Mais testes de regressao para fluxos de OS, pagamentos e permissoes.

## 4. Decisoes Pendentes

- Estrategia final de deploy: Vercel + backend separado, Railway, Render ou outra composicao.
- Politica final de armazenamento de fotos/anexos.
- Nivel de uso futuro de Supabase ou outro servico externo.
- Estrategia de backup e restauracao do PostgreSQL.

**Ultima atualizacao:** 26 de maio de 2026
