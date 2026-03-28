# Catalogo de Componentes

## Telas Principais (components/)

| Componente | Arquivo | Linhas | Responsabilidade |
|------------|---------|--------|-----------------|
| Login | Login.tsx | ~200 | Tela de autenticacao |
| Dashboard | Dashboard.tsx | ~300 | Visao geral financeira com graficos |
| Transactions | Transactions.tsx | ~606 | CRUD de transacoes |
| Customers | Customers.tsx | ~400 | CRUD de clientes |
| ClientPayments | ClientPayments.tsx | ~702 | Gestao de pagamentos e parcelas |
| ServiceOrders | ServiceOrders.tsx | ~2488 | Gestao completa de OS |
| Inventory | Inventory.tsx | ~300 | Controle de estoque |
| Reports | Reports.tsx | ~250 | Relatorios financeiros |
| StatusPage | StatusPage.tsx | ~150 | Pagina publica de status de OS |
| ErrorBoundary | ErrorBoundary.tsx | ~50 | Captura erros React |

### Componentes Criticos (necessitam refatoracao)

- **ServiceOrders.tsx (2.488 linhas):** Contem formulario, lista, detalhes, impressao e logica tudo junto
- **ClientPayments.tsx (702 linhas):** Formularios e lista no mesmo arquivo
- **Transactions.tsx (606 linhas):** Poderia ser dividido

## Componentes Modularizados (subdiretorios)

> Nota: Alguns componentes existem tanto na raiz quanto em subdiretorios (duplicatas).

### customers/

| Componente | Responsabilidade |
|------------|-----------------|
| Customers.tsx | Versao modularizada do CRUD de clientes |
| CustomerList.tsx | Lista de clientes com busca e paginacao |
| WhatsAppModal.tsx | Modal de envio de mensagem WhatsApp |

### dashboard/

| Componente | Responsabilidade |
|------------|-----------------|
| Dashboard.tsx | Versao modularizada do dashboard |

### inventory/

| Componente | Responsabilidade |
|------------|-----------------|
| Inventory.tsx | Versao modularizada do estoque |

### payments/

| Componente | Responsabilidade |
|------------|-----------------|
| ClientPayments.tsx | Versao modularizada de pagamentos |

### service-orders/

| Componente | Responsabilidade |
|------------|-----------------|
| ServiceOrders.tsx | Versao modularizada de OS |

### transactions/

| Componente | Responsabilidade |
|------------|-----------------|
| Transactions.tsx | Versao modularizada de transacoes |

### audit/

| Componente | Responsabilidade |
|------------|-----------------|
| AuditLogs.tsx | Visualizador de logs de auditoria |

### layout/

| Componente | Responsabilidade |
|------------|-----------------|
| SidebarItem.tsx | Item do menu lateral com animacao |

## Modais (components/modals/)

| Componente | Proposito |
|------------|-----------|
| AddTransactionModal | Formulario de nova transacao |
| AddClientPaymentModal | Formulario de novo pagamento |
| CustomerModal | Formulario de cliente (criar/editar) |
| CustomerHistoryModal | Historico de pagamentos do cliente |
| CustomerDeleteWarningModal | Aviso ao excluir cliente com dados |
| CustomerWarningModal | Avisos sobre cliente (credito, etc.) |
| DeleteConfirmationModal | Confirmacao generica de exclusao |
| RecordPaymentModal | Registrar pagamento em parcela |
| PostCustomerActionModal | Acao pos-criacao de cliente |
| FeedbackModal | Formulario de feedback com IA |
| PasswordModal | Solicitar senha das configuracoes |
| WarningModal | Modal de aviso generico |

## Componentes UI (components/ui/)

| Componente | Proposito |
|------------|-----------|
| Toast | Sistema de notificacoes temporarias |
| ConfirmModal | Dialog de confirmacao reutilizavel |
| Pagination | Controle de paginacao |
| StatCard | Card de metrica/KPI |
| FeedbackBubble | Bolha de feedback flutuante |
| PasswordModal | Modal de senha (UI generico) |
| WarningModal | Modal de aviso (UI generico) |

## Configuracoes (components/settings/)

| Componente | Proposito |
|------------|-----------|
| Settings | Pagina principal de configuracoes |
| SettingsLayout | Layout com menu lateral de configuracoes |
| InterfaceSettings | Tema, cores, tamanho da fonte |
| UserManagement | CRUD de usuarios e permissoes |
| CategorySettings | Categorias de receita/despesa |
| EquipmentSettings | Tipos, marcas e modelos de equipamento |
| PrintLayout | Layout de recibos e impressao |
| ProjectOverview | Dados da empresa (CNPJ, endereco) |
| WhatsAppSettings | Configuracao WhatsApp/Telegram/SendPulse |
| SystemUpdate | Versao e informacoes do sistema |

## Componentes Utilitarios (components/)

| Componente | Proposito |
|------------|-----------|
| CustomerSearchSelect | Select de cliente com busca integrada |
| SearchableSelect | Select generico com busca |
| SidebarItem | Item do menu lateral (raiz) |
| StatCard | Card de estatistica (raiz) |

## Duplicatas Identificadas

Os seguintes componentes existem em dois locais:

| Componente | Local 1 (raiz) | Local 2 (subdiretorio) |
|------------|----------------|----------------------|
| Dashboard | components/Dashboard.tsx | components/dashboard/Dashboard.tsx |
| Customers | components/Customers.tsx | components/customers/Customers.tsx |
| Transactions | components/Transactions.tsx | components/transactions/Transactions.tsx |
| ClientPayments | components/ClientPayments.tsx | components/payments/ClientPayments.tsx |
| ServiceOrders | components/ServiceOrders.tsx | components/service-orders/ServiceOrders.tsx |
| Inventory | components/Inventory.tsx | components/inventory/Inventory.tsx |
| SidebarItem | components/SidebarItem.tsx | components/layout/SidebarItem.tsx |
| StatCard | components/StatCard.tsx | components/ui/StatCard.tsx |
| PasswordModal | components/modals/PasswordModal.tsx | components/ui/PasswordModal.tsx |
| WarningModal | components/modals/WarningModal.tsx | components/ui/WarningModal.tsx |

**Acao necessaria:** Unificar e remover duplicatas antes de ir para producao.
