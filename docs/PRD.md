# Product Requirements Document - INOVA PRO

## 1. Visao Geral

O INOVA PRO e um sistema web de gestao financeira e operacional para assistencias tecnicas, lojas e pequenas empresas que precisam controlar clientes, contas, ordens de servico, estoque e comprovantes em um unico lugar.

## 2. Objetivo

Centralizar operacoes do dia a dia em uma plataforma rapida, segura e simples de operar, reduzindo dependencia de planilhas, controles manuais e historicos dispersos em conversas.

## 3. Publico-Alvo

- Proprietarios de assistencias tecnicas e lojas.
- Gerentes financeiros ou operacionais.
- Tecnicos que acompanham ordens de servico.
- Equipes pequenas que precisam de controle sem ERP complexo.

## 4. Funcionalidades Principais

### 4.1 Financeiro

- Registro de entradas e saidas.
- Categorias por tipo de movimentacao.
- Filtros por data, tipo, categoria e valor.
- Paginacao para volumes maiores de dados.

### 4.2 Clientes

- Cadastro com nome, telefone, CPF/CNPJ, apelido, observacao e limite de credito.
- Historico relacionado a vendas, pagamentos e ordens de servico.
- Verificacao de similaridade para reduzir cadastros duplicados.

### 4.3 Vendas e Contas a Receber

- Registro de compras/vendas vinculadas a clientes.
- Controle de status pendente, parcial e pago.
- Registro de pagamentos parciais ou totais.
- Historico de recebimentos.
- Mensagens de cobranca e comprovantes via WhatsApp.

### 4.4 Ordens de Servico

- Cadastro de equipamento, problema relatado, analise tecnica, servicos, pecas e valores.
- Status customizaveis.
- Fotos de entrada quando configurado.
- Impressao/preview de OS.
- Rastreio publico para o cliente acompanhar a OS sem login.

### 4.5 Estoque

- Cadastro de produtos e servicos.
- Controle de quantidade, custo, preco e estoque minimo.
- Uso de pecas em ordens de servico.
- Alertas de baixo estoque.

### 4.6 Relatorios e Dashboard

- Indicadores financeiros.
- Comparativos de receitas e despesas.
- Pagamentos pendentes.
- Exportacao de dados quando disponivel.

### 4.7 Usuarios, Permissoes e Auditoria

- Login com usuarios locais.
- Papeis e permissoes.
- Registro de acoes relevantes em auditoria.

## 5. Arquitetura Atual

- Frontend: React, Vite, TypeScript, Tailwind e Zustand.
- Backend: Express, TypeScript e Prisma.
- Banco: PostgreSQL.
- Testes: Vitest, Testing Library e MSW.
- Build/PWA: Vite + vite-plugin-pwa.

## 6. Fluxo de Dados

1. A interface chama hooks ou stores.
2. Hooks usam o cliente HTTP para acessar `/api/...`.
3. O backend Express valida autenticacao e regras.
4. Prisma executa operacoes no PostgreSQL.
5. A resposta volta para React Query/Zustand e atualiza a tela.

## 7. Requisitos Nao Funcionais

- Interface funcional em desktop e mobile.
- Mensagens de erro compreensiveis.
- Rotas protegidas por autenticacao.
- Dados sensiveis fora do versionamento.
- Build e testes locais sempre verdes antes de mudancas maiores.

## 8. Estado Atual

Validado localmente em 26 de maio de 2026:

- `npm.cmd run lint`: passou.
- `npm.cmd test -- --run`: passou com 4 arquivos e 36 testes.
- `npm.cmd run build`: passou.

## 9. Proximas Prioridades

- Revisar seguranca de producao: CORS, CSP e endpoints de diagnostico.
- Validar fluxos principais em navegador real.
- Revisar PWA/cache em mobile.
- Consolidar estrategia final de deploy.
- Melhorar cobertura de testes nos fluxos mais criticos.

**Ultima atualizacao:** 26 de maio de 2026
