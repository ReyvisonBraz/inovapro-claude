# Relacionamentos do Banco de Dados

## Diagrama ER (Textual)

```
┌──────────────┐     ┌──────────────────┐     ┌────────────┐
│    users     │     │   transactions   │     │ categories │
│──────────────│     │──────────────────│     │────────────│
│ id (PK)      │◄────│ createdBy (FK)   │     │ id (PK)    │
│ username     │◄────│ updatedBy (FK)   │     │ name       │
│ password     │     │ description      │     │ type       │
│ role         │     │ category         │     └────────────┘
│ name         │     │ type             │
│ permissions  │     │ amount           │
└──────┬───────┘     └──────────────────┘
       │
       │ 1:N
       │
       ▼
┌──────────────┐
│  audit_logs  │
│──────────────│
│ id (PK)      │
│ userId (FK)──│──► users.id
│ action       │
│ entity       │
│ entityId     │
│ details      │
│ timestamp    │
└──────────────┘


┌──────────────┐     ┌──────────────────┐     ┌────────────┐
│  customers   │     │ client_payments  │     │  receipts  │
│──────────────│     │──────────────────│     │────────────│
│ id (PK)      │◄──┐ │ id (PK)          │◄────│ paymentId  │
│ firstName    │   │ │ customerId (FK)──│──►  │ id (PK)    │
│ lastName     │   │ │ description      │     │ content    │
│ phone        │   │ │ totalAmount      │     │ createdAt  │
│ cpf          │   │ │ paidAmount       │     └────────────┘
│ creditLimit  │   │ │ status           │
└──────┬───────┘   │ │ paymentHistory   │
       │           │ └──────────────────┘
       │ 1:N       │
       │           │
       ▼           │
┌──────────────────┐
│ service_orders   │
│──────────────────│
│ id (PK)          │
│ customerId (FK)──│──► customers.id
│ equipmentType    │
│ equipmentBrand   │
│ reportedProblem  │
│ status           │
│ partsUsed (JSON) │
│ services (JSON)  │
│ totalAmount      │
│ priority         │
└──────────────────┘


┌──────────────┐     ┌──────────────┐
│   brands     │     │   models     │
│──────────────│     │──────────────│
│ id (PK)      │◄────│ brandId (FK) │
│ name (UNIQUE)│     │ id (PK)      │
│ equipmentType│     │ name         │
└──────────────┘     └──────────────┘
                     UNIQUE(brandId, name)


┌──────────────────────┐     ┌──────────────────────┐
│ equipment_types      │     │ service_order_statuses│
│──────────────────────│     │──────────────────────│
│ id (PK)              │     │ id (PK)              │
│ name (UNIQUE)        │     │ name                 │
│ icon                 │     │ color                │
└──────────────────────┘     │ priority             │
                             │ isDefault            │
┌──────────────────────┐     └──────────────────────┘
│ settings (singleton) │
│──────────────────────│     ┌──────────────────────┐
│ id = 1 (PK)          │     │ inventory_items      │
│ appName              │     │──────────────────────│
│ companyCnpj          │     │ id (PK)              │
│ pixKey               │     │ name                 │
│ ...25+ campos        │     │ category             │
└──────────────────────┘     │ sku                  │
                             │ quantity             │
                             │ salePrice            │
                             └──────────────────────┘
```

## Foreign Keys

| Tabela Origem | Coluna | Tabela Destino | Coluna | Tipo |
|---------------|--------|----------------|--------|------|
| client_payments | customerId | customers | id | N:1 |
| receipts | paymentId | client_payments | id | N:1 |
| service_orders | customerId | customers | id | N:1 |
| models | brandId | brands | id | N:1 |
| audit_logs | userId | users | id | N:1 |
| transactions | createdBy | users | id | N:1 |
| transactions | updatedBy | users | id | N:1 |
| service_orders | createdBy | users | id | N:1 |
| service_orders | updatedBy | users | id | N:1 |
| inventory_items | createdBy | users | id | N:1 |
| inventory_items | updatedBy | users | id | N:1 |
| client_payments | createdBy | users | id | N:1 |
| client_payments | updatedBy | users | id | N:1 |
| customers | createdBy | users | id | N:1 |
| customers | updatedBy | users | id | N:1 |

## Unique Constraints

| Tabela | Coluna(s) | Descricao |
|--------|-----------|-----------|
| users | username | Login unico |
| brands | name | Marca unica |
| equipment_types | name | Tipo unico |
| models | (brandId, name) | Modelo unico por marca |
| settings | id CHECK (id = 1) | Apenas 1 registro |

## Comportamento de Exclusao

| Acao | Comportamento |
|------|--------------|
| Excluir cliente | Exclui todos os client_payments do cliente (cascata manual) |
| Excluir marca | Exclui todos os models da marca (cascata manual) |
| Excluir pagamento grupo | Exclui todos os pagamentos com mesmo saleId |
| Excluir status OS | Bloqueado se isDefault = 1 |
| Excluir ultimo owner | Bloqueado pelo sistema |

## Campos JSON

Alguns campos armazenam dados estruturados como JSON string:

| Tabela | Campo | Formato |
|--------|-------|---------|
| users | permissions | `["view_dashboard", "manage_transactions"]` |
| client_payments | paymentHistory | `[{"date": "2026-01-15", "amount": 500}]` |
| service_orders | partsUsed | `[{"name": "SSD", "quantity": 1, "unitPrice": 200}]` |
| service_orders | services | `[{"description": "Formatacao", "quantity": 1, "unitPrice": 100}]` |
| settings | hiddenColumns | `{"transactions": ["status"], "customers": []}` |
