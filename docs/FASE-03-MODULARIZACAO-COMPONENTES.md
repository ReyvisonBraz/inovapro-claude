# Fase 3 — Modularização de Componentes Gigantes

> **Objetivo**: Quebrar os componentes monolíticos em peças menores, reutilizáveis e testáveis. Extrair templates de impressão de strings HTML para componentes React.

---

## Pré-requisitos

- ✅ Fase 1 concluída (backend modular)
- ✅ Fase 2 concluída (Router + Contexts + App.tsx reduzido)

---

## Componentes Alvo

| Componente Atual | Tamanho | Problema |
|-----------------|---------|----------|
| `ServiceOrders.tsx` | 129 KB (~3.500 linhas) | Lista, formulário, detalhe, impressão, modais, tudo junto |
| `ClientPayments.tsx` | 39 KB (~1.000 linhas) | Lista, filtros, formulário de venda, registro de pagamento |
| `Transactions.tsx` | 31 KB (~800 linhas) | Tabela, filtros, exportação, formulário, tudo junto |
| `Dashboard.tsx` | 12 KB (~350 linhas) | Pode ser extraído em sub-widgets |
| `Inventory.tsx` | 16 KB (~450 linhas) | Lista + formulário misturados |
| `Customers.tsx` | 9 KB (~250 linhas) | Relativamente ok, mas pode melhorar |

---

## Etapa 3.1 — Quebrar `ServiceOrders.tsx` (Prioridade Máxima)

Este é o maior componente do projeto. Deve ser dividido em **pelo menos 6 arquivos**.

### Estrutura proposta
```
src/components/service-orders/
├── ServiceOrdersPage.tsx          ← Componente principal (orquestra os sub-componentes)
├── ServiceOrderList.tsx           ← Lista/tabela de OS com filtros e paginação
├── ServiceOrderCard.tsx           ← Card individual de OS na lista
├── ServiceOrderForm.tsx           ← Formulário de criação/edição de OS
├── ServiceOrderDetail.tsx         ← Visualização detalhada de uma OS
├── ServiceOrderPrint.tsx          ← Template de impressão (comprovante OS)
├── ServiceOrderStatusBadge.tsx    ← Badge de status com cores
├── ServiceOrderFilters.tsx        ← Barra de filtros (status, busca, datas)
├── ServiceOrderPartsTable.tsx     ← Tabela de peças usadas
├── ServiceOrderServicesTable.tsx  ← Tabela de serviços realizados
├── hooks/
│   └── useServiceOrders.ts        ← Hook de dados (fetch, create, update, delete)
└── types.ts                       ← Tipos específicos de OS (se necessário)
```

### Passo a passo detalhado

1. **Criar a pasta** `src/components/service-orders/`

2. **Extrair o hook de dados** — Mover toda a lógica de fetch/create/update/delete para `hooks/useServiceOrders.ts`:
   - `fetchServiceOrders(page, search)`
   - `handleAddServiceOrder(order)`
   - `handleUpdateServiceOrder(id, order)`
   - `handleDeleteServiceOrder(id)`
   - `fetchServiceOrderStatuses()`
   - Estado: `serviceOrders`, `serviceOrderStatuses`, `isLoading`, `pagination`

3. **Extrair `ServiceOrderCard.tsx`** — O card/linha que mostra info resumida de uma OS:
   - Props: `order`, `onView`, `onEdit`, `onDelete`, `onPrint`
   - Mostra: #id, cliente, equipamento, status badge, data, total

4. **Extrair `ServiceOrderList.tsx`** — Lista com filtros:
   - Props: `orders[]`, `onSelect`, `onAdd`, `filters`
   - Contém: barra de busca, filtros de status, grid/lista de cards, paginação

5. **Extrair `ServiceOrderForm.tsx`** — Formulário completo:
   - Props: `order?` (para edição), `onSave`, `onCancel`, `customers[]`, `inventoryItems[]`
   - Contém: campos do equipamento, problema relatado, serviços, peças, valores
   - Sub-componentes: `ServiceOrderPartsTable`, `ServiceOrderServicesTable`

6. **Extrair `ServiceOrderDetail.tsx`** — Visualização detalhada:
   - Props: `order`, `onEdit`, `onPrint`, `onStatusChange`
   - Timeline de status, foto do equipamento, dados técnicos

7. **Extrair `ServiceOrderPrint.tsx`** — Template de impressão:
   - Props: `order`, `settings` (logo, dados da empresa)
   - Template limpo sem estilos do app (CSS de impressão)
   - **IMPORTANTE**: Substituir strings HTML por componentes React com `@media print`

8. **Criar `ServiceOrdersPage.tsx`** — Orquestra tudo:
   - Usa `useServiceOrders()` hook
   - Controla qual sub-view está ativa (lista/form/detail)
   - Coordena navegação entre sub-views

### Verificação
- [ ] Cada sub-componente renderiza corretamente isolado
- [ ] Criar/editar/excluir OS funciona
- [ ] Impressão de OS funciona
- [ ] Filtros e busca funcionam
- [ ] Paginação funciona

---

## Etapa 3.2 — Quebrar `ClientPayments.tsx`

### Estrutura proposta
```
src/components/payments/
├── PaymentsPage.tsx              ← Orquestrador
├── PaymentList.tsx               ← Lista com filtros e paginação
├── PaymentCard.tsx               ← Card individual de pagamento
├── PaymentSaleForm.tsx           ← Formulário de nova venda/parcelas
├── PaymentRecordModal.tsx        ← Modal de registrar pagamento
├── PaymentReceiptPrint.tsx       ← Template de recibo para impressão
├── PaymentFilters.tsx            ← Filtros de status/data/busca
├── PaymentGroupActions.tsx       ← Ações em grupo (deletar venda inteira)
└── hooks/
    └── usePayments.ts            ← Hook de dados
```

### O que extrair
- **PaymentList**: Grid/tabela com agrupamento por `saleId`, filtros, busca
- **PaymentSaleForm**: Formulário completo de venda com parcelas, método de pagamento, cliente
- **PaymentRecordModal**: Modal que permite registrar pagamento parcial ou total
- **PaymentReceiptPrint**: Template de recibo (deve usar componentes React ao invés de HTML string)

### Verificação
- [ ] Criar nova venda com parcelas funciona
- [ ] Registrar pagamento parcial/total funciona
- [ ] Excluir pagamento individual e em grupo funciona
- [ ] Impressão de recibo funciona
- [ ] Filtros de status (pendente/parcial/pago) funcionam

---

## Etapa 3.3 — Quebrar `Transactions.tsx`

### Estrutura proposta
```
src/components/transactions/
├── TransactionsPage.tsx          ← Orquestrador
├── TransactionTable.tsx          ← Tabela com colunas configuráveis
├── TransactionRow.tsx            ← Linha individual (editar, duplicar, excluir)
├── TransactionForm.tsx           ← Formulário add/edit
├── TransactionFilters.tsx        ← Filtros (tipo, categoria, data, busca)
├── TransactionExport.tsx         ← Botões de exportar (CSV, PDF)
└── hooks/
    └── useTransactions.ts        ← Hook de dados
```

### Verificação
- [ ] CRUD de transações funciona
- [ ] Filtros por tipo/categoria/data funcionam
- [ ] Duplicar transação funciona
- [ ] Exportação funciona

---

## Etapa 3.4 — Quebrar `Inventory.tsx`

### Estrutura proposta
```
src/components/inventory/
├── InventoryPage.tsx
├── InventoryList.tsx             ← Lista/grid com busca e filtros
├── InventoryForm.tsx             ← Formulário add/edit item
├── InventoryStockAlert.tsx       ← Alerta de estoque baixo
└── hooks/
    └── useInventory.ts
```

---

## Etapa 3.5 — Extrair Templates de Impressão

### Problema Atual
O `App.tsx` (e possivelmente outros componentes) tem funções como `handlePrintBlankForm` que constroem HTML como strings:

```tsx
// RUIM — XSS potencial, impossível de testar, impossível de estilizar
const html = `<html><body>
  <h1>${settings.profileName}</h1>
  <table>...</table>
</body></html>`;
window.open()?.document.write(html);
```

### Solução
Criar componentes React dedicados para impressão:

```
src/components/print/
├── PrintLayout.tsx               ← Layout base de impressão (header, footer empresa)
├── ServiceOrderReceipt.tsx       ← Comprovante de OS
├── PaymentReceipt.tsx            ← Recibo de pagamento
├── BlankForm.tsx                 ← Formulário em branco
└── print.css                     ← Estilos @media print
```

### Padrão de impressão recomendado
```tsx
// Em vez de window.open() + document.write():
function handlePrint(order: ServiceOrder) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  
  // Renderizar React component para HTML estático
  const html = ReactDOMServer.renderToStaticMarkup(
    <ServiceOrderReceipt order={order} settings={settings} />
  );
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head><style>${printStyles}</style></head>
      <body>${html}</body>
    </html>
  `);
  printWindow.document.close();
  printWindow.print();
}
```

### Verificação
- [ ] Todos os templates de impressão são componentes React
- [ ] Zero strings HTML concatenadas
- [ ] Impressão visualmente idêntica à versão anterior
- [ ] Logo e dados da empresa aparecem corretamente

---

## Etapa 3.6 — Refatorar Dashboard

### Estrutura proposta
```
src/components/dashboard/
├── DashboardPage.tsx             ← Página principal
├── StatCards.tsx                  ← Grid de cards de estatísticas
├── CashFlowChart.tsx             ← Gráfico de fluxo de caixa
├── MonthlyComparison.tsx         ← Gráfico de comparação mensal
├── IncomeRanking.tsx             ← Ranking de entradas por categoria
├── ExpenseRanking.tsx            ← Ranking de saídas por categoria
├── RecentTransactions.tsx        ← Lista de transações recentes
└── NotificationsPanel.tsx        ← Painel de notificações (débitos, OS)
```

---

## Checklist geral da Fase 3

- [ ] `ServiceOrders.tsx` dividido em 8+ sub-componentes
- [ ] `ClientPayments.tsx` dividido em 6+ sub-componentes
- [ ] `Transactions.tsx` dividido em 5+ sub-componentes
- [ ] `Inventory.tsx` dividido em 3+ sub-componentes
- [ ] Templates de impressão extraídos para componentes React
- [ ] Dashboard refatorado em widgets
- [ ] Cada sub-componente tem props tipadas (sem `any`)
- [ ] Build sem erros
- [ ] Todas as funcionalidades existentes continuam funcionando
