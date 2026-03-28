# Estado e Navegacao

## Estado Global (Situacao Atual)

Todo o estado da aplicacao e gerenciado no `App.tsx` via hooks `useState`.

### Estados Principais

| Estado | Tipo | Descricao |
|--------|------|-----------|
| `user` | User \| null | Usuario autenticado |
| `activeScreen` | Screen | Tela ativa (navegacao) |
| `transactions` | Transaction[] | Lista de transacoes |
| `customers` | Customer[] | Lista de clientes |
| `clientPayments` | ClientPayment[] | Lista de pagamentos |
| `serviceOrders` | ServiceOrder[] | Lista de ordens de servico |
| `inventoryItems` | InventoryItem[] | Lista de itens do estoque |
| `settings` | Settings | Configuracoes do app |
| `categories` | Category[] | Categorias de transacao |
| `brands` | Brand[] | Marcas de equipamento |
| `models` | Model[] | Modelos de equipamento |
| `equipmentTypes` | EquipmentType[] | Tipos de equipamento |
| `serviceOrderStatuses` | ServiceOrderStatus[] | Status de OS |

### Estados de UI

| Estado | Tipo | Descricao |
|--------|------|-----------|
| `sidebarOpen` | boolean | Sidebar aberta/fechada |
| `showAddModal` | boolean | Modal de adicionar visivel |
| `editingItem` | any | Item sendo editado |
| `searchTerm` | string | Termo de busca |
| `currentPage` | number | Pagina atual da paginacao |
| `isLoading` | boolean | Indicador de carregamento |

## Navegacao

### Sistema Atual (activeScreen)

```typescript
type Screen =
  | "dashboard"
  | "transactions"
  | "customers"
  | "payments"
  | "serviceOrders"
  | "inventory"
  | "reports"
  | "settings"
  | "statusPage"
  | "auditLogs";
```

### Como Funciona

1. Sidebar renderiza itens de menu
2. Clicar em um item chama `setActiveScreen("nome")`
3. App.tsx renderiza o componente correspondente:

```tsx
{activeScreen === "dashboard" && <Dashboard {...props} />}
{activeScreen === "transactions" && <Transactions {...props} />}
{activeScreen === "customers" && <Customers {...props} />}
// ... etc
```

### Limitacoes

| Problema | Impacto |
|----------|---------|
| Sem URLs reais | Todas as telas sao `localhost:3000/` |
| Sem deep links | Impossivel compartilhar link para uma tela |
| Sem historico | Botao voltar do browser nao funciona |
| Sem bookmarks | Nao da para salvar favorito de uma tela |
| Sem SEO | Irrelevante para SPA interno, mas limita expansao |

## Custom Hooks (Existentes mas NAO Consumidos)

Os hooks foram criados para substituir o estado do App.tsx, mas ainda nao foram integrados.

### useAppSettings

```typescript
// Gerencia configuracoes do app
const { settings, updateSettings, loading } = useAppSettings();
```

### useCustomers

```typescript
// Gerencia dados de clientes
const { customers, addCustomer, updateCustomer, deleteCustomer, loading } = useCustomers();
```

### useTransactions

```typescript
// Gerencia dados de transacoes
const { transactions, addTransaction, updateTransaction, deleteTransaction, loading } = useTransactions();
```

### useInventory

```typescript
// Gerencia dados de estoque
const { items, addItem, updateItem, deleteItem, loading } = useInventory();
```

### useUsers

```typescript
// Gerencia dados de usuarios
const { users, addUser, updateUser, deleteUser, loading } = useUsers();
```

### Por Que Nao Foram Consumidos?

- Criados como preparacao para a Fase 2 (React Context)
- App.tsx ainda controla tudo via useState
- Precisam ser integrados com Context providers
- Fase 2 do roadmap deve resolver isso

## Props Drilling

### Problema

O App.tsx passa dezenas de props para cada componente filho:

```tsx
<ServiceOrders
  serviceOrders={serviceOrders}
  customers={customers}
  inventoryItems={inventoryItems}
  settings={settings}
  brands={brands}
  models={models}
  equipmentTypes={equipmentTypes}
  serviceOrderStatuses={serviceOrderStatuses}
  onAdd={handleAddServiceOrder}
  onUpdate={handleUpdateServiceOrder}
  onDelete={handleDeleteServiceOrder}
  user={user}
  // ... muitas mais props
/>
```

### Consequencias

- Componentes recebem props que nao usam (passam para filhos)
- Dificil rastrear de onde vem cada dado
- Renomear uma prop exige mudancas em varios arquivos
- Cada novo campo exige modificacao no App.tsx e em toda a cadeia

### Solucao (Fase 2)

```tsx
// Ao inves de props drilling:
<ServiceOrders /> // consome dados via Context

// Dentro do componente:
const { serviceOrders } = useServiceOrders();
const { customers } = useCustomers();
const { settings } = useAppSettings();
```

## Tipos TypeScript (types.ts)

### Interfaces Principais

| Interface | Campos Principais |
|-----------|------------------|
| `User` | id, username, name, role, permissions, token |
| `Transaction` | id, description, category, type, amount, date, status |
| `Customer` | id, firstName, lastName, nickname, cpf, phone, creditLimit |
| `ClientPayment` | id, customerId, description, totalAmount, paidAmount, status, installments |
| `ServiceOrder` | id, customerId, equipmentType/Brand/Model, reportedProblem, status, partsUsed |
| `InventoryItem` | id, name, category, sku, costPrice, salePrice, quantity |
| `Settings` | appName, primaryColor, companyCnpj, pixKey, templates |
| `Category` | id, name, type |
| `Brand` | id, name, equipmentType |
| `Model` | id, brandId, name |
| `EquipmentType` | id, name, icon |
| `ServiceOrderStatus` | id, name, color, priority, isDefault |
