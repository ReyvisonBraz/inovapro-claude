# Plano Detalhado de Migração - App.tsx

## Visão Geral

O arquivo `App.tsx` possui **3.262 linhas** com **60+ estados locais** e **40+ funções handler**. Este plano detalha a migração progressiva para usar Contextos sem quebrar funcionalidades.

---

## Análise dos Estados (60+ useState)

### Categoria 1: Estados de Dados (DEVEM IR PARA DataContext)
| # | Estado | Tipo | Linha | Dependências | Prioridade |
|---|--------|------|------|--------------|------------|
| 1 | transactions | object | 110 | fetch, filters | ALTA |
| 2 | transactionsPage | number | 111 | pagination | ALTA |
| 3 | stats | object | 112 | dashboard | ALTA |
| 4 | customers | object | 387 | CRUD | ALTA |
| 5 | customersPage | number | 388 | pagination | ALTA |
| 6 | clientPayments | object | 389 | CRUD | ALTA |
| 7 | paymentsPage | number | 390 | pagination | ALTA |
| 8 | categories | object | 391 | settings | MÉDIA |
| 9 | users | object | 392 | settings | MÉDIA |
| 10 | inventoryItems | object | 393 | CRUD | ALTA |
| 11 | serviceOrders | object | 394 | CRUD | ALTA |
| 12 | serviceOrdersPage | number | 395 | pagination | ALTA |
| 13 | serviceOrderStatuses | object | 396 | OS | MÉDIA |
| 14 | equipmentTypes | object | 397 | OS | MÉDIA |
| 15 | brands | object | 398 | OS | MÉDIA |
| 16 | models | object | 399 | OS | MÉDIA |
| 17 | auditLogs | object | 402 | settings | BAIXA |

### Categoria 2: Estados de Autenticação (DEVEM IR PARA AuthContext)
| # | Estado | Tipo | Linha | Prioridade |
|---|--------|------|------|-------------|
| 18 | currentUser | User \| null | 400 | ALTA |
| 19 | isAuthenticated | boolean | 401 | ALTA |

### Categoria 3: Estados de UI (DEVEM IR PARA UIContext)
| # | Estado | Tipo | Linha | Prioridade |
|---|--------|------|------|-------------|
| 20 | isSidebarOpen | boolean | 118 | ALTA |
| 21 | isSidebarCollapsed | boolean | 119 | ALTA |
| 22 | showNotifications | boolean | 120 | MÉDIA |
| 23 | notificationTab | 'payments' \| 'service-orders' | 121 | MÉDIA |
| 24 | fontSize | number | 122-130 | MÉDIA |

### Categoria 4: Estados de Configurações (DEVEM IR PARA SettingsContext)
| # | Estado | Tipo | Linha | Prioridade |
|---|--------|------|------|-------------|
| 25 | settings | AppSettings | 347 | ALTA |
| 26 | isSettingsUnlocked | boolean | 312 | MÉDIA |

### Categoria 5: Estados de Filtros (Local ou FilterContext)
| # | Estado | Tipo | Linha | Escopo |
|---|--------|------|------|---------|
| 27 | searchTerm | string | 304 | Transactions |
| 28 | filterType | string | 305 | Transactions |
| 29 | filterCategory | string | 306 | Transactions |
| 30 | filterMinAmount | string | 307 | Transactions |
| 31 | filterMaxAmount | string | 308 | Transactions |
| 32 | showFilters | boolean | 309 | Transactions |
| 33 | dateFilterMode | string | 296 | Transactions |
| 34 | selectedDate | string | 295 | Transactions |
| 35 | selectedMonth | string | 297 | Transactions |
| 36 | startDate | string | 298 | Transactions |
| 37 | endDate | string | 299 | Transactions |
| 38 | reportMonth | string | 300 | Reports |
| 39 | reportView | string | 301 | Reports |
| 40 | paymentFilterStatus | string | 285 | Payments |
| 41 | paymentSortMode | string | 289 | Payments |
| 42 | customerSearchTerm | string | 287 | Customers |
| 43 | osSearchTerm | string | 288 | ServiceOrders |

### Categoria 6: Estados de Formulários (Local por componente)
| # | Estado | Tipo | Linha | Escopo |
|---|--------|------|------|---------|
| 44 | newTx | object | 378 | Transaction form |
| 45 | newCustomer | object | 413 | Customer form |
| 46 | newClientPayment | object | 427 | Payment form |

### Categoria 7: Estados de Modais/Edição (Local)
| # | Estado | Tipo | Linha | Escopo |
|---|--------|------|------|---------|
| 47 | isAdding | boolean | 114 | Transaction modal |
| 48 | isAddingCustomer | boolean | 403 | Customer modal |
| 49 | isAddingClientPayment | boolean | 404 | Payment modal |
| 50 | isAddingServiceOrder | boolean | 115 | OS modal |
| 51 | isAddingInventoryItem | number | 116 | Inventory modal |
| 52 | isSaving | boolean | 117 | Global |
| 53 | editingTransaction | object | 373 | Transaction edit |
| 54 | editingCustomer | object | 374 | Customer edit |
| 55 | isRecordingPayment | object | 405 | Payment record |
| 56 | showHistoryModal | boolean | 406 | Customer history |

### Categoria 8: Estados Diversos (Local)
| # | Estado | Tipo | Linha | Escopo |
|---|--------|------|------|---------|
| 57 | activeScreen | Screen | 109 | Navigation |
| 58 | isLoading | boolean | 113 | App init |
| 59 | expandedPayments | array | 284 | Payments |
| 60 | customerToDelete | object | 291 | Customer delete |
| 61 | transactionToDelete | number | 293 | Transaction delete |
| 62 | clientPaymentToDelete | number | 294 | Payment delete |
| 63 | directOsId | number | 410 | OS direct open |
| 64 | directMode | string | 411 | OS direct mode |
| 65 | postCustomerData | object | 424 | Post-customer action |
| 66 | newOsCustomerId | number | 425 | OS new customer |
| 67 | dashboardMonth | string | 375 | Dashboard |

---

## Análise dos UseEffects (15+ useEffect)

| # | Linha | Dependências | Ação |
|---|-------|--------------|------|
| 1 | 516 | isAuthenticated | Fetch inicial (→ DataContext) |
| 2 | 527 | transactionsPage, customersPage, etc | Fetch dados (→ DataContext) |
| 3 | 538 | - | fetchStats (→ DataContext) |
| 4 | 548 | - | fetchEquipmentTypes (→ DataContext) |
| 5 | 559 | - | fetchBrands (→ DataContext) |
| 6 | 570 | - | fetchModels (→ DataContext) |
| 7 | 581 | - | fetchServiceOrderStatuses (→ DataContext) |
| 8 | 592 | - | fetchInventoryItems (→ DataContext) |
| 9 | 603 | - | fetchServiceOrders (→ DataContext) |
| 10 | 614 | - | fetchUsers (→ DataContext) |
| 11 | 625 | - | fetchAuditLogs (→ DataContext) |
| 12 | URL params | - | directOsId (local) |
| 13 | fontSize | fontSize | UI state (→ UIContext) |
| 14 | (outros) | - | Diversos |

---

## Análise das Funções Handler (40+)

### CRUD Operations (podem ir para Services)
- handleAddUser, handleUpdateUser, handleDeleteUser
- handleAddCustomer, handleDeleteCustomer
- handleAddClientPayment
- handleDeleteClientPayment
- handleRecordPayment
- handleAddTransaction, handleUpdateTransaction, handleDeleteTransaction
- handleDuplicateTransaction
- handleAddServiceOrder, handleUpdateServiceOrder, handleDeleteServiceOrder
- handleAddInventoryItem, handleUpdateInventoryItem, handleDeleteInventoryItem

### Settings Handlers
- addCategory, deleteCategory
- addBrand, deleteBrand, addModel, deleteModel
- addEquipmentType, deleteEquipmentType
- handleUnlockSettings

### UI Handlers
- handlePrintBlankForm
- openConfirm

---

## PLANO DE MIGRAÇÃO (7 Etapas)

### ETAPA 1: Preparar Contextos Existentes (1 dia)
**Objetivo:** Garantir que os contextos tenham todos os dados necessários

- [ ] 1.1. Expandir DataContext com todas as funções fetch
- [ ] 1.2. Adicionar estados de filtros ao DataContext
- [ ] 1.3. Criarhook `useAuth` completamente funcional
- [ ] 1.4. Criar `useFilter` para estados de filtro

### ETAPA 2: Substituir Estados de Dados (2 dias)
**Objetivo:** Migrar estados de dados para DataContext

- [ ] 2.1. Substituir `transactions` e `transactionsPage` por contexto
- [ ] 2.2. Substituir `customers` e `customersPage` por contexto
- [ ] 2.3. Substituir `clientPayments` e `paymentsPage` por contexto
- [ ] 2.4. Substituir `inventoryItems` por contexto
- [ ] 2.5. Substituir `serviceOrders` e `serviceOrdersPage` por contexto
- [ ] 2.6. Substituir `serviceOrderStatuses`, `equipmentTypes`, `brands`, `models` por contexto
- [ ] 2.7. Substituir `categories`, `users`, `auditLogs` por contexto
- [ ] 2.8. Substituir `stats` por contexto

### ETAPA 3: Substituir Estados de Autenticação (1 dia)
**Objetivo:** Migrar autenticação para AuthContext

- [ ] 3.1. Integrar login/logout do App.tsx com AuthContext
- [ ] 3.2. Substituir `currentUser` por contexto
- [ ] 3.3. Substituir `isAuthenticated` por contexto

### ETAPA 4: Substituir Estados de UI (1 dia)
**Objetivo:** Migrar estados de interface para UIContext

- [ ] 4.1. Expandir UIContext com todos os estados
- [ ] 4.2. Substituir `isSidebarOpen`, `isSidebarCollapsed` por contexto
- [ ] 4.3. Substituir `showNotifications`, `notificationTab` por contexto
- [ ] 4.4. Substituir `fontSize` por contexto

### ETAPA 5: Substituir Estados de Configurações (1 dia)
**Objetivo:** Migrar configurações para SettingsContext

- [ ] 5.1. Integrar `settings` com SettingsContext
- [ ] 5.2. Substituir `isSettingsUnlocked` por contexto
- [ ] 5.3. Mover handlers de settings para contexto

### ETAPA 6: Criar Context de Filtros (1 dia)
**Objetivo:** Organizar estados de filtros

- [ ] 6.1. Criar `FilterContext` para estados de filtro
- [ ] 6.2. Migrar estados de Transactions
- [ ] 6.3. Migrar estados de Payments
- [ ] 6.4. Migrar estados de Customers
- [ ] 6.5. Migrar estados de ServiceOrders

### ETAPA 7: Limpeza Final (1 dia)
**Objetivo:** Remover código redundante

- [ ] 7.1. Remover imports não usados
- [ ] 7.2. Consolidar fetch functions
- [ ] 7.3. Testar todas funcionalidades
- [ ] 7.4. Documentar mudanças

---

## Estratégia de Migração

### Abordagem: "Strangler Fig Pattern"

1. **Não remover código existente de uma vez**
2. **Adicionar contexto e usar gradualmente**
3. **Quando todas as referênciasMigrarem, remover estado local**
4. **Testar a cada etapa**

### Exemplo de Migração - transactions

```typescript
// ANTES (estado local)
const [transactions, setTransactions] = useState(...);
const [transactionsPage, setTransactionsPage] = useState(1);

useEffect(() => {
  fetchTransactions(); // função local
}, [transactionsPage]);

// DEPOIS (usando DataContext)
const { transactions, transactionsPage, setTransactionsPage, fetchTransactions } = useData();

// O useEffect já está no DataContext, não precisa duplicar
```

### Mantendo Compatibilidade

```typescript
// App.tsx pode importar de ambos os lugares durante transição
import { useData } from './contexts/DataContext';

// Temporariamente manter estado local se necessário
const transactions = transactionsFromContext; // ou estado local

// Gradualmente remover fallback
```

---

## Riscos e Mitigações

| Risco | Mitigação |
|-------|-----------|
| Quebrar funcionalidade | Testar cada etapa manualmente |
| Props drilling continuar | Refatorar componentes filhos gradualmente |
| Performance piorar | Usar React.memo onde necessário |
| Conflitos de merge | Fazer uma feature por vez |
| Regressões | Manter backup antes de cada etapa |

---

## Estimativa de Tempo

| Etapa | Tempo | Acumulado |
|-------|-------|-----------|
| Etapa 1: Preparar Contextos | 1 dia | 1 dia |
| Etapa 2: Dados | 2 dias | 3 dias |
| Etapa 3: Auth | 1 dia | 4 dias |
| Etapa 4: UI | 1 dia | 5 dias |
| Etapa 5: Settings | 1 dia | 6 dias |
| Etapa 6: Filtros | 1 dia | 7 dias |
| Etapa 7: Limpeza | 1 dia | 8 dias |

**Total: ~8 dias úteis**

---

## Ordem Recomendada de Migração

1. **Começar por dados que mudam menos** (categories, users, settings)
2. **Depois dados que mudam muito** (transactions, payments, OS)
3. **Por último UI** (sidebar, modais)
4. **Testar sempre** após cada mudança

---

## Verificação de Funcionamento

Após cada etapa, verificar:
- [ ] Login continua funcionando
- [ ] Dashboard exibe dados corretos
- [ ] CRUD de todas entidades funciona
- [ ] Navegação entre telas funciona
- [ ] Modais abrem/fechem corretamente
- [ ] Filtros funcionam
- [ ] Não há erros no console

---

## Status da Migração (30/03/2026)

### ✅ Concluído:
- [x] Etapa 1: Contextos preparados
  - [x] DataContext criado com todos os dados
  - [x] FilterContext criado com todos os filtros
  - [x] AuthContext criado
  - [x] SettingsContext criado
  - [x] UIContext criado
  - [x] Providers configurados em main.tsx

- [x] Etapa 2: Dados migrados (PARCIAL)
  - [x] `stats` migrado para DataContext
  - [x] `categories` migrado para DataContext
  - [ ] `transactions` - pendente (muitas dependências)
  - [ ] `customers` - pendente
  - [ ] `clientPayments` - pendente
  - [ ] `users` - pendente (21+ referências)
  - [ ] `auditLogs` - pendente

### 📋 Arquivos Criados:
- `src/contexts/AuthContext.tsx`
- `src/contexts/DataContext.tsx`
- `src/contexts/SettingsContext.tsx`
- `src/contexts/UIContext.tsx`
- `src/contexts/FilterContext.tsx`
- `src/routes/AppRoutes.tsx`
- `src/routes/ProtectedRoute.tsx`
- `eslint.config.js`
- `.prettierrc`

### 📋 Melhorias de Segurança:
- JWT_SECRET configurável via .env
- CORS restritivo (padrão: localhost:5173)
- Body limit: 5MB

### 📋 Correções de Tipos:
- useTransactions.ts - tipos corrigidos
- useCustomers.ts - tipos corrigidos
- useInventory.ts - tipos corrigidos
- logger.ts - tipos corrigidos

---

## Próximos Passos (Recomendação)

1. **Continuar migração gradual** - Um estado por vez, testando sempre
2. **Evitar migrar estados com muitas referências** - Como users e auditLogs por enquanto
3. **Focar em estados menores de filtros** - Mais fácil de migrar
4. **Testar frequentemente** - Após cada mudança de estado

---

##build: ✅ OK
##testes: ✅ OK
