# Referencia de Endpoints da API

Base URL: `/api`

## Autenticacao

| Metodo | Endpoint | Auth | Descricao |
|--------|----------|------|-----------|
| POST | /login | Nao | Login (retorna JWT token) |
| GET | /users | Sim | Listar usuarios |
| POST | /users | Sim (owner) | Criar usuario |
| PUT | /users/:id | Sim (owner) | Editar usuario |
| DELETE | /users/:id | Sim (owner) | Excluir usuario |

### POST /login

```
Body: { username: string, password: string }
Response: { id, username, name, role, permissions, createdAt, token }
Rate limit: 10 tentativas / 15 minutos
```

### POST /users

```
Body: { username, password, role, name, permissions? }
Roles: "owner" | "manager" | "employee"
Permissoes: array de strings (ex: ["view_dashboard", "manage_transactions"])
```

---

## Transacoes

| Metodo | Endpoint | Auth | Descricao |
|--------|----------|------|-----------|
| GET | /transactions | Sim | Listar transacoes (paginado) |
| POST | /transactions | Sim | Criar transacao |
| PUT | /transactions/:id | Sim | Editar transacao |
| DELETE | /transactions/:id | Sim | Excluir transacao |
| GET | /transactions/stats | Sim | Estatisticas financeiras |

### GET /transactions

```
Query: ?page=1&limit=20&search=texto
Response: { data: Transaction[], meta: { total, page, limit, totalPages } }
```

### POST /transactions

```
Body: { description, category, type: "income"|"expense", amount, date, status? }
```

### GET /transactions/stats

```
Response: { totalIncome, totalExpense, balance, pendingPayments, activeOS }
```

---

## Clientes

| Metodo | Endpoint | Auth | Descricao |
|--------|----------|------|-----------|
| GET | /customers | Sim | Listar clientes (paginado) |
| POST | /customers | Sim | Criar cliente |
| PUT | /customers/:id | Sim | Editar cliente |
| DELETE | /customers/:id | Sim | Excluir cliente (cascata) |
| GET | /customers/:id/payments | Sim | Pagamentos do cliente |

### POST /customers

```
Body: { firstName, lastName, phone, cpf?, nickname?, companyName?, observation?, creditLimit? }
```

### DELETE /customers/:id

Exclui o cliente E todos os pagamentos associados (cascata).

---

## Pagamentos de Clientes

| Metodo | Endpoint | Auth | Descricao |
|--------|----------|------|-----------|
| GET | /client-payments | Sim | Listar pagamentos (paginado) |
| POST | /client-payments | Sim | Criar pagamento |
| PATCH | /client-payments/:id | Sim | Atualizar pagamento |
| DELETE | /client-payments/:id | Sim | Excluir pagamento |
| DELETE | /client-payments/group/:saleId | Sim | Excluir grupo de parcelas |
| GET | /client-payments/receipts/:paymentId | Sim | Buscar recibos |
| POST | /client-payments/receipts | Sim | Criar recibo |

### POST /client-payments

```
Body: {
  customerId, description, totalAmount, purchaseDate, dueDate,
  paymentMethod, status: "pending"|"partial"|"paid",
  installmentsCount?, type: "income"|"expense", saleId?,
  paidAmount?, paymentHistory?
}
```

### PATCH /client-payments/:id

```
Body: { paidAmount?, status?, paymentHistory? }
```

### POST /client-payments/receipts

```
Body: { paymentId, content: "<html>...</html>" }
```

---

## Ordens de Servico

| Metodo | Endpoint | Auth | Descricao |
|--------|----------|------|-----------|
| GET | /service-orders | Sim | Listar OS (paginado) |
| POST | /service-orders | Sim | Criar OS |
| PUT | /service-orders/:id | Sim | Editar OS |
| DELETE | /service-orders/:id | Sim | Excluir OS |
| GET | /service-orders/statuses | Sim | Listar status |
| POST | /service-orders/statuses | Sim | Criar status custom |
| DELETE | /service-orders/statuses/:id | Sim | Excluir status |
| POST | /service-orders/public/:id/status | Nao | Consulta publica |

### POST /service-orders

```
Body: {
  customerId, reportedProblem,
  equipmentType?, equipmentBrand?, equipmentModel?,
  equipmentColor?, equipmentSerial?,
  arrivalPhotoBase64?, status?,
  technicalAnalysis?, servicesPerformed?,
  services?, partsUsed?,
  serviceFee?, totalAmount?,
  finalObservations?, entryDate?,
  analysisPrediction?, customerPassword?,
  accessories?, ramInfo?, ssdInfo?, priority?
}
```

### POST /service-orders/public/:id/status (PUBLICO)

```
Body: { cpf: "1234" } // Primeiros 4 digitos do CPF
Response: { status, reportedProblem, technicalAnalysis, equipmentType, ... }
Erro 403: CPF nao confere
Erro 404: OS nao encontrada
```

### PUT /service-orders/:id

Ao editar, o sistema reconcilia pecas do estoque:
1. Devolve quantidade das pecas antigas ao estoque
2. Deduz quantidade das pecas novas do estoque

---

## Estoque

| Metodo | Endpoint | Auth | Descricao |
|--------|----------|------|-----------|
| GET | /inventory | Sim | Listar itens |
| POST | /inventory | Sim | Criar item |
| PUT | /inventory/:id | Sim | Editar item |
| DELETE | /inventory/:id | Sim | Excluir item |

### POST /inventory

```
Body: {
  name, category: "product"|"service",
  sku?, costPrice?, salePrice?, quantity?,
  minQuantity?, unitPrice?, stockLevel?
}
```

---

## Configuracoes e Lookup Tables

| Metodo | Endpoint | Auth | Descricao |
|--------|----------|------|-----------|
| GET | /settings | Sim | Buscar configuracoes |
| POST | /settings | Sim | Salvar configuracoes |
| GET | /categories | Sim | Listar categorias |
| POST | /categories | Sim | Criar categoria |
| DELETE | /categories/:id | Sim | Excluir categoria |
| GET | /brands | Sim | Listar marcas |
| POST | /brands | Sim | Criar marca |
| DELETE | /brands/:id | Sim | Excluir marca (cascata modelos) |
| GET | /models | Sim | Listar modelos |
| POST | /models | Sim | Criar modelo |
| DELETE | /models/:id | Sim | Excluir modelo |
| GET | /equipment-types | Sim | Listar tipos equipamento |
| POST | /equipment-types | Sim | Criar tipo equipamento |
| DELETE | /equipment-types/:id | Sim | Excluir tipo equipamento |
| GET | /service-order-statuses | Sim | Listar status OS |
| POST | /service-order-statuses | Sim | Criar status OS |
| DELETE | /service-order-statuses/:id | Sim | Excluir status (nao padrao) |
| GET | /audit-logs | Sim | Listar ultimos 100 logs |

### POST /settings

```
Body: {
  appName?, appVersion?, fiscalYear?, primaryColor?,
  profileName?, profileAvatar?, initialBalance?,
  showWarnings?, hiddenColumns?, settingsPassword?,
  receiptLayout?, receiptLogo?,
  companyCnpj?, companyAddress?,
  pixKey?, pixQrCode?,
  whatsappBillingTemplate?, whatsappOSTemplate?,
  sendPulseClientId?, sendPulseClientSecret?, sendPulseTemplateId?,
  telegramBotToken?, telegramChatId?
}
```

---

## Formato de Resposta Padrao

### Sucesso (Paginado)

```json
{
  "data": [...],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

### Sucesso (Simples)

```json
{ "id": 1, "campo": "valor", ... }
```

### Erro de Validacao (400)

```json
{
  "error": "Dados invalidos",
  "details": [
    { "field": "amount", "message": "Valor e obrigatorio" }
  ]
}
```

### Erro de Autenticacao (401)

```json
{ "error": "Token invalido ou expirado" }
```

### Erro de Permissao (403)

```json
{ "error": "Acesso negado" }
```

### Erro Interno (500)

```json
{ "error": "Erro interno do servidor" }
```
