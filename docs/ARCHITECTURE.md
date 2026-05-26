# Arquitetura Tecnica - INOVA PRO

## 1. Visao Geral

O INOVA PRO usa frontend React/Vite com backend Express e persistencia via Prisma em PostgreSQL. A aplicacao concentra os fluxos operacionais de uma assistencia tecnica/loja: financeiro, clientes, contas a receber, ordens de servico, estoque, recibos e rastreio publico.

## 2. Camadas Principais

### Frontend

Local: `src/`

- `pages/`: telas principais da aplicacao.
- `components/`: componentes de UI, layout, modais e partes especificas dos modulos.
- `hooks/`: regras de interacao com API, React Query e transformacoes usadas pela UI.
- `store/`: estado global com Zustand.
- `lib/`: utilitarios, cliente HTTP, helpers de impressao e integracoes base.
- `schemas/`: validacoes compartilhadas com Zod.
- `types.ts`: contratos TypeScript usados pela aplicacao.

### Backend

Entrada principal: `server.ts`

- Express exposto como API HTTP.
- Rotas publicas em `src/routes/public.ts`.
- Rotas protegidas em `src/routes/index.ts`.
- Autenticacao JWT em `src/middleware/auth.ts`.
- Prisma Client configurado em `src/lib/prisma.ts`.
- Logs e tratamento de erro em `src/lib/server-logger.ts`.

### Banco de Dados

Schema principal: `prisma/schema.prisma`

- Provider atual: `postgresql`.
- Cliente Prisma gerado no build por `npm run build`.
- Conexao configurada por `DATABASE_URL` ou variaveis `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` e `DB_NAME`.

## 3. Fluxo de Dados

1. O usuario executa uma acao na interface.
2. Um componente chama um hook ou uma store.
3. O hook dispara uma requisicao HTTP para `/api/...`.
4. O backend valida permissao, processa a regra e acessa o banco via Prisma.
5. A API retorna os dados.
6. React Query/Zustand atualizam a UI.

## 4. Modulos Funcionais

- `transactions`: movimentacoes financeiras.
- `customers`: cadastro de clientes.
- `client_payments`: contas a receber/pagar.
- `service_orders`: ordens de servico.
- `inventory_items`: estoque, pecas e servicos.
- `users`: usuarios e permissoes.
- `audit_logs`: auditoria.
- `settings`: configuracoes globais.

## 5. Seguranca

- Login baseado em usuarios locais e JWT.
- Rotas protegidas passam por `requireAuth`.
- Permissoes sao avaliadas pela store de autenticacao no frontend e pelas rotas protegidas no backend.
- Auditoria registra acoes relevantes.

Pontos ainda pendentes no plano de saneamento:

- Revisar CORS para producao.
- Definir CSP compativel com o frontend.
- Avaliar endpoints de diagnostico em ambiente produtivo.
- Confirmar se logs nao expõem dados sensiveis.

## 6. Ambientes

- Desenvolvimento local: Vite no frontend e Express no backend.
- Producao/preview: ainda precisa de decisao final documentada entre Vercel, Railway, Render ou outra composicao.
- Banco: PostgreSQL.

## 7. Validacao Atual

Executado em 26 de maio de 2026:

- `npm.cmd run lint`: passou.
- `npm.cmd test -- --run`: passou.
- `npm.cmd run build`: passou.

**Ultima atualizacao:** 26 de maio de 2026
