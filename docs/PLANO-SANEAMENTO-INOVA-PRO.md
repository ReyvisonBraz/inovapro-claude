# Plano de Saneamento - INOVA PRO

Este documento registra o plano inicial para estabilizar, organizar e preparar melhor o projeto INOVA PRO para manutencao e producao.

## Objetivo

Antes de adicionar novos modulos grandes, o foco sera consolidar a base atual do sistema: alinhar documentacao, corrigir problemas visiveis, revisar seguranca, validar producao e garantir que os fluxos principais funcionem bem em desktop e mobile.

## Visao Geral do Projeto

O INOVA PRO e um sistema web de gestao para assistencia tecnica/loja, com foco em:

- Financeiro
- Clientes
- Vendas e contas a receber
- Ordens de servico
- Estoque
- Recibos e impressao
- Rastreio publico de OS
- Usuarios, permissoes e auditoria

Stack atual observada:

- Frontend: React, Vite, TypeScript, Tailwind, Zustand
- Backend: Express, TypeScript
- Banco: Prisma com PostgreSQL
- Deploy/infra: Vercel, Railway/Render, Docker, GitHub Actions
- Testes: Vitest

## Frentes do Plano

### 1. Alinhar Documentacao

Problema observado:

- Alguns documentos ainda mencionam SQLite, mas o schema atual do Prisma usa PostgreSQL.
- O README principal ainda parece vir de um template do AI Studio.
- Existem varios documentos bons, mas eles precisam refletir o estado atual real do projeto.

Meta:

- Atualizar README, arquitetura, roadmap e status para refletir a stack e o momento atual.
- Separar claramente o que esta implementado, o que esta em validacao e o que ainda e plano.

Prioridade: alta.

Arquivos provaveis:

- `README.md`
- `STATUS.md`
- `docs/ARCHITECTURE.md`
- `docs/PRD.md`
- `docs/ROADMAP.md`
- `docs/DEVELOPER_GUIDE.md`
- `docs/MANUAL_USO_LOCAL.md`

Checklist:

- [x] Atualizar o README principal com nome do produto, objetivo, stack, comandos e variaveis principais.
- [x] Remover ou adaptar referencias antigas do AI Studio.
- [x] Atualizar arquitetura para Express + Prisma + PostgreSQL.
- [x] Marcar claramente diferencas entre local, preview e producao.
- [ ] Atualizar roadmap com o que ja foi feito e o que ainda esta pendente.
- [ ] Revisar docs que ainda falam em SQLite como arquitetura atual.
- [x] Criar uma secao de "estado atual" com data da revisao.
- [x] Criar uma secao de "decisoes tecnicas atuais" para evitar duvida futura.

Criterio de pronto:

- Qualquer pessoa consegue abrir o projeto, entender o que ele faz e rodar localmente seguindo o README.
- A documentacao nao contradiz o `package.json`, o `server.ts` e o `prisma/schema.prisma`.

Validacao:

- Conferir manualmente referencias a `SQLite`, `AI Studio`, `Supabase`, `PostgreSQL`, `Railway`, `Render` e `Vercel`.
- Rodar busca textual para localizar docs antigos:
  - `rg "SQLite|AI Studio|PostgreSQL|Supabase|Railway|Render|Vercel" README.md STATUS.md docs`

### 2. Corrigir Encoding e Textos Quebrados

Problema observado:

- Ha textos com caracteres quebrados, como `VocÃª`, `ConcluÃ­do`, `ConfiguraÃ§Ãµes`.
- Isso aparece em documentacao, comentarios e alguns defaults do schema.

Meta:

- Corrigir arquivos para UTF-8 consistente.
- Revisar textos exibidos ao usuario.
- Evitar que valores gravados no banco ou exibidos na interface fiquem com acentuacao quebrada.

Prioridade: alta.

Arquivos provaveis:

- `server.ts`
- `STATUS.md`
- `docs/*.md`
- `src/**/*.tsx`
- `src/**/*.ts`
- `prisma/schema.prisma`

Checklist:

- [ ] Mapear arquivos com caracteres quebrados.
- [ ] Separar textos exibidos ao usuario de comentarios/documentacao.
- [ ] Corrigir primeiro textos de UI e defaults que podem afetar dados.
- [ ] Corrigir comentarios e documentacao depois.
- [ ] Confirmar que os arquivos permanecem em UTF-8.
- [ ] Revisar valores default no schema antes de aplicar qualquer migracao.

Criterio de pronto:

- Nao ha textos quebrados visiveis na interface principal.
- Documentacao principal abre com acentos corretos.
- Defaults do banco nao carregam acentuacao corrompida.

Validacao:

- Buscar padroes comuns de mojibake:
  - `rg "Ã|Â|ð|�" .`
- Abrir telas principais apos build/dev e verificar textos.

### 3. Revisar Seguranca de Producao

Problema observado:

- O Helmet esta com `contentSecurityPolicy: false`.
- O CORS esta permissivo, inclusive em producao.
- Ha arquivo `.env` local na pasta do projeto, exigindo cuidado para nao vazar segredos.

Meta:

- Revisar politicas de CORS por ambiente.
- Reativar ou configurar CSP de forma compativel com o frontend.
- Conferir `.gitignore` e garantir que segredos nao sejam versionados.
- Revisar endpoints publicos e protegidos.

Prioridade: alta.

Arquivos provaveis:

- `server.ts`
- `.gitignore`
- `.env.example`
- `.env.production`
- `.env.preview`
- `src/middleware/auth.ts`
- `src/routes/public.ts`
- `src/routes/index.ts`
- `vercel.json`
- `render.yaml`
- `Dockerfile`

Checklist:

- [ ] Confirmar que `.env` esta ignorado pelo Git.
- [ ] Revisar variaveis expostas em `.env.example`.
- [ ] Separar configuracao de CORS para desenvolvimento e producao.
- [ ] Definir lista explicita de dominios permitidos em producao.
- [ ] Revisar se `origin.endsWith('.vercel.app')` deve continuar liberado.
- [ ] Criar politica CSP minima compativel com Vite/React em producao.
- [ ] Conferir endpoints sem auth: login, public tracking, health e diagnosticos.
- [ ] Avaliar se `/api/db-test` e `/api/ping` devem existir em producao.
- [ ] Revisar armazenamento do token no frontend.
- [ ] Confirmar se logs nao exibem dados sensiveis.

Criterio de pronto:

- Producao aceita apenas origens conhecidas.
- Endpoints de diagnostico perigosos nao vazam informacoes em producao.
- Segredos locais nao entram no versionamento.
- A aplicacao continua funcionando em desktop e mobile depois da politica de seguranca.

Validacao:

- `git status --short`
- `git check-ignore .env`
- Testar login e chamadas autenticadas em local.
- Testar rota publica de rastreio.
- Verificar headers de resposta em `/health` e `/api/*`.

### 4. Validar Build, Testes e CI

Problema observado:

- O projeto tem Vitest e GitHub Actions configurados.
- Ainda falta confirmar se `npm run lint`, `npm test` e `npm run build` passam no estado atual.

Meta:

- Rodar typecheck.
- Rodar testes.
- Rodar build.
- Corrigir erros encontrados.
- Garantir que o CI represente o fluxo real do projeto.

Prioridade: alta.

Arquivos provaveis:

- `package.json`
- `vitest.config.ts`
- `vite.config.ts`
- `.github/workflows/ci.yml`
- `src/test/*`
- `tsconfig.json`
- `prisma/schema.prisma`

Checklist:

- [x] Rodar `npm run lint`.
- [x] Rodar `npm test -- --run`.
- [x] Rodar `npm run build`.
- [x] Registrar erros encontrados.
- [x] Corrigir erros de tipo antes de erros esteticos.
- [ ] Confirmar se o CI precisa de variaveis de ambiente mockadas.
- [ ] Confirmar se `prisma generate` funciona no ambiente do CI.
- [ ] Verificar se testes cobrem pelo menos hooks principais e modais globais.
- [x] Adicionar testes apenas onde houver risco real ou bug corrigido.

Criterio de pronto:

- Typecheck, testes e build passam localmente.
- O fluxo do GitHub Actions corresponde ao fluxo local.
- Falhas futuras do CI devem indicar problema real, nao configuracao quebrada.

Validacao:

- `npm run lint`
- `npm test -- --run`
- `npm run build`

Registro de execucao - 2026-05-26:

- `npm.cmd run lint`: passou.
- `npm.cmd test -- --run`: passou com 4 arquivos e 36 testes.
- `npm.cmd run build`: passou com `prisma generate` e `vite build`.
- Corrigido conflito de tipo no modal de registro de pagamento causado por `z.coerce.number()`.
- Ajustados mocks MSW para interceptar a API usando URLs absolutas e relativas.
- Ajustados testes de transacoes para ativar o estado autenticado exigido pelo hook.
- Observacao: o build ainda mostra aviso de chunk grande do Vite, sem falhar.

### 5. Validar Fluxos Principais

Fluxos prioritarios:

- Login e permissao de usuario
- Cadastro/edicao de cliente
- Criacao de venda/conta a receber
- Criacao e edicao de ordem de servico
- Impressao/recibo
- Rastreio publico de OS
- Estoque e uso de pecas/servicos

Meta:

- Mapear problemas por fluxo.
- Testar desktop e mobile.
- Priorizar bugs que bloqueiam uso real.

Prioridade: alta.

Arquivos provaveis:

- `src/App.tsx`
- `src/components/auth/Login.tsx`
- `src/hooks/useAuth.ts`
- `src/pages/CustomersPage.tsx`
- `src/pages/ClientPaymentsPage.tsx`
- `src/pages/ServiceOrdersPage.tsx`
- `src/pages/PublicTrackingPage.tsx`
- `src/pages/PrintPreviewPage.tsx`
- `src/routes/*.ts`
- `src/services/*.ts`

Checklist:

- [ ] Criar usuario/admin local de teste ou confirmar credenciais de desenvolvimento.
- [ ] Testar login valido e invalido.
- [ ] Testar redirecionamento apos token expirado ou ausente.
- [ ] Criar cliente novo.
- [ ] Editar cliente existente.
- [ ] Criar venda/conta a receber.
- [ ] Registrar pagamento parcial e pagamento completo.
- [ ] Criar OS com cliente, equipamento, problema relatado e status inicial.
- [ ] Editar status da OS.
- [ ] Adicionar servicos e pecas na OS.
- [ ] Testar impressao/preview.
- [ ] Testar rastreio publico da OS sem login.
- [ ] Testar permissao negada para usuario sem acesso.
- [ ] Testar estoque baixo e cadastro de item/servico.

Criterio de pronto:

- Um fluxo operacional real consegue ser executado do inicio ao fim sem erro bloqueante.
- As mensagens de erro sao compreensiveis.
- O estado da tela atualiza sem precisar recarregar manualmente.
- O mesmo fluxo funciona em largura desktop e mobile.

Validacao:

- Rodar servidor local.
- Testar manualmente no navegador.
- Quando possivel, criar checklist de regressao com dados de exemplo.

### 6. Refinar Mobile e PWA

Problema observado:

- O projeto tem PWA e historico de problema com Service Worker/cache.
- O STATUS menciona loop de recarregamento em mobile.

Meta:

- Revisar configuracao do Service Worker.
- Confirmar comportamento em mobile.
- Ajustar layout, tamanhos, paddings e navegacao onde houver quebra.
- Garantir que atualizacoes nao fiquem presas em cache antigo.

Prioridade: media/alta.

Arquivos provaveis:

- `vite.config.ts`
- `index.html`
- `src/App.tsx`
- `src/components/layout/MobileNav.tsx`
- `src/components/layout/Sidebar.tsx`
- `src/components/layout/Header.tsx`
- `src/index.css`
- `public/icons/*`

Checklist:

- [ ] Revisar configuracao do `VitePWA`.
- [ ] Confirmar se o runtime caching aponta para o dominio correto da API.
- [ ] Revisar script de limpeza/desinstalacao de Service Worker antigo.
- [ ] Testar login em mobile.
- [ ] Testar navegacao inferior mobile.
- [ ] Testar formularios longos em mobile, especialmente OS.
- [ ] Verificar se modais cabem na tela pequena.
- [ ] Verificar se botoes de acao ficam acessiveis.
- [ ] Confirmar que atualizacao nova chega sem cache preso.

Criterio de pronto:

- O app abre em mobile sem loop de reload.
- Telas principais nao quebram horizontalmente.
- Modais e formularios podem ser usados em tela pequena.
- Cache/PWA nao impede atualizacao critica.

Validacao:

- Testar viewport mobile no navegador.
- Testar uma instalacao PWA limpa quando possivel.
- Conferir console do navegador para erros de Service Worker.

### 7. Organizar Infra e Artefatos Locais

Problema observado:

- A pasta contem `dist`, `node_modules`, `.vercel`, `backups` e outros artefatos locais.
- Isso nao e necessariamente erro, mas exige clareza sobre o que deve ou nao entrar no Git.

Meta:

- Revisar `.gitignore`.
- Separar arquivos de trabalho local de arquivos do projeto.
- Documentar comandos de desenvolvimento, build e deploy.

Prioridade: media.

Arquivos provaveis:

- `.gitignore`
- `.dockerignore`
- `Dockerfile`
- `cloudbuild.yaml`
- `render.yaml`
- `vercel.json`
- `.github/workflows/ci.yml`
- `package.json`

Checklist:

- [ ] Confirmar que `node_modules` nao esta versionado.
- [ ] Confirmar que `dist` deve ou nao ser versionado.
- [ ] Confirmar que `.vercel` nao deve ir para o repositorio.
- [ ] Confirmar que `backups` nao contem dados sensiveis.
- [ ] Revisar `.dockerignore`.
- [ ] Documentar estrategia de deploy: frontend, backend e banco.
- [ ] Decidir oficialmente entre Railway, Render, Vercel serverless ou outra composicao.
- [ ] Registrar variaveis necessarias por ambiente.

Criterio de pronto:

- O repositorio fica limpo e previsivel.
- Arquivos gerados/local-only nao confundem manutencao.
- Deploy tem caminho documentado e repetivel.

Validacao:

- `git status --short`
- `git check-ignore node_modules dist .vercel .env`
- Conferir arquivos de deploy contra README atualizado.

## Ordem Sugerida

1. Rodar diagnostico tecnico: status do Git, lint, testes e build.
2. Corrigir encoding dos textos mais importantes.
3. Atualizar documentacao principal.
4. Revisar seguranca basica de producao.
5. Testar fluxos principais.
6. Refinar mobile/PWA.
7. Consolidar roadmap de novas funcionalidades.

## Detalhamento Futuro

Cada frente acima pode virar uma checklist propria com:

- arquivos envolvidos
- risco
- prioridade
- criterio de pronto
- comandos de validacao
- observacoes de produto

## Decisao de Produto

Neste momento, a recomendacao e estabilizar a base atual antes de criar modulos grandes novos. O sistema ja tem valor operacional; o melhor ganho agora esta em confiabilidade, clareza e acabamento dos fluxos principais.
