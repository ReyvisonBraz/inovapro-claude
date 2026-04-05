# Checklist de Refatoração

Este documento serve para acompanharmos o progresso da refatoração do `App.tsx`. Marcaremos com `[x]` conforme formos concluindo e testando cada etapa.

## Fase 1: Limpeza Inicial e Extração de Utilitários
- [x] **1.1 Extrair `handlePrintBlankForm` para `src/lib/printUtils.ts`**
- [x] 1.2 Limpar tipagens soltas no `App.tsx` (mover para `src/types.ts`)
- [x] 1.3 Extrair funções puras de formatação/cálculo para `src/lib/utils.ts`

## Fase 2: Extração de Custom Hooks
- [x] 2.1 Criar `useCustomers` (Clientes)
- [x] 2.2 Criar `useServiceOrders` (Ordens de Serviço, Marcas, Modelos)
- [x] 2.3 Criar `useTransactions` (Transações e Pagamentos)
- [x] 2.4 Criar `useAuth` (Usuários, Autenticação, Logs)
- [x] 2.5 Criar `useClientPayments` (Pagamentos de Clientes)
- [x] 2.6 Criar `useInventory` (Estoque)
- [x] 2.7 Criar `useSettings` (Configurações)

## Fase 3: Gerenciamento de Estado Global
- [x] 3.1 Criar Contexto Global (`AppContext` ou `Zustand`)
- [x] 3.2 Mover estados de UI (`isSidebarOpen`, `fontSize`, `settings`)

## Fase 4: Componentização de Modais e Filtros
- [x] 4.1 Centralizar gerenciamento de Modais
- [ ] 4.2 Extrair componentes de Filtro complexos

## Fase 5: Roteamento e Divisão de Páginas
- [x] 5.1 Configurar `react-router-dom` (Dependência instalada)
- [x] 5.2 Criar páginas (`src/pages/`) e mover o conteúdo do `App.tsx` (Em andamento)
- [ ] 5.3 Transformar `App.tsx` no provedor de rotas e layout principal
