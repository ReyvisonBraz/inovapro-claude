# Validacao (Zod Schemas)

## Arquivo: server/validators/schemas.ts

Todos os schemas de validacao da API usando Zod v4. Mensagens de erro em portugues.

## Schemas de Entidades

### TransactionSchema

| Campo | Tipo | Obrigatorio | Validacao |
|-------|------|-------------|-----------|
| description | string | Sim | min 1 char |
| category | string | Sim | min 1 char |
| type | enum | Sim | "income" \| "expense" |
| amount | number | Sim | > 0 |
| date | string | Sim | formato de data |
| status | string | Nao | - |

### CustomerSchema

| Campo | Tipo | Obrigatorio | Validacao |
|-------|------|-------------|-----------|
| firstName | string | Sim | min 1 char |
| lastName | string | Sim | min 1 char |
| phone | string | Sim | min 1 char |
| cpf | string | Nao | - |
| nickname | string | Nao | - |
| companyName | string | Nao | - |
| observation | string | Nao | - |
| creditLimit | number | Nao | >= 0 |

### ClientPaymentSchema

| Campo | Tipo | Obrigatorio | Validacao |
|-------|------|-------------|-----------|
| customerId | number | Sim | inteiro |
| description | string | Sim | min 1 char |
| totalAmount | number | Sim | > 0 |
| purchaseDate | string | Sim | - |
| dueDate | string | Sim | - |
| paymentMethod | string | Sim | - |
| status | enum | Sim | "pending" \| "partial" \| "paid" |
| installmentsCount | number | Nao | inteiro >= 1 |
| type | enum | Sim | "income" \| "expense" |
| saleId | string | Nao | - |
| paidAmount | number | Nao | >= 0 |
| paymentHistory | string | Nao | JSON string |

### ClientPaymentUpdateSchema

| Campo | Tipo | Obrigatorio | Validacao |
|-------|------|-------------|-----------|
| paidAmount | number | Nao | >= 0 |
| status | enum | Nao | "pending" \| "partial" \| "paid" |
| paymentHistory | string | Nao | JSON string |

### ServiceOrderSchema

| Campo | Tipo | Obrigatorio | Validacao |
|-------|------|-------------|-----------|
| customerId | number | Sim | inteiro |
| reportedProblem | string | Sim | min 1 char |
| equipmentType | string | Nao | - |
| equipmentBrand | string | Nao | - |
| equipmentModel | string | Nao | - |
| equipmentColor | string | Nao | - |
| equipmentSerial | string | Nao | - |
| arrivalPhotoBase64 | string | Nao | - |
| status | string | Nao | - |
| technicalAnalysis | string | Nao | - |
| servicesPerformed | string | Nao | - |
| services | ServiceItem[] | Nao | array de objetos |
| partsUsed | PartUsed[] | Nao | array de objetos |
| serviceFee | number | Nao | >= 0 |
| totalAmount | number | Nao | >= 0 |
| finalObservations | string | Nao | - |
| entryDate | string | Nao | - |
| analysisPrediction | string | Nao | - |
| customerPassword | string | Nao | - |
| accessories | string | Nao | - |
| ramInfo | string | Nao | - |
| ssdInfo | string | Nao | - |
| priority | enum | Nao | "low" \| "medium" \| "high" \| "urgent" |

### ServiceItemSchema (Aninhado)

| Campo | Tipo | Obrigatorio |
|-------|------|-------------|
| description | string | Sim |
| quantity | number | Nao |
| unitPrice | number | Nao |

### PartUsedSchema (Aninhado)

| Campo | Tipo | Obrigatorio |
|-------|------|-------------|
| name | string | Sim |
| quantity | number | Sim |
| unitPrice | number | Sim |
| inventoryItemId | number | Nao |

## Schemas de Usuarios

### LoginSchema

| Campo | Tipo | Obrigatorio | Validacao |
|-------|------|-------------|-----------|
| username | string | Sim | min 1 char |
| password | string | Sim | min 1 char |

### UserCreateSchema

| Campo | Tipo | Obrigatorio | Validacao |
|-------|------|-------------|-----------|
| username | string | Sim | min 3 chars |
| password | string | Sim | min 4 chars |
| role | enum | Sim | "owner" \| "manager" \| "employee" |
| name | string | Sim | min 1 char |
| permissions | string[] | Nao | array de strings |

### UserUpdateSchema

| Campo | Tipo | Obrigatorio | Validacao |
|-------|------|-------------|-----------|
| name | string | Nao | min 1 char |
| role | enum | Nao | "owner" \| "manager" \| "employee" |
| password | string | Nao | min 4 chars |
| permissions | string[] | Nao | array de strings |

## Schemas de Configuracao

### SettingsSchema

Todos os campos sao opcionais (partial update):

| Campo | Tipo |
|-------|------|
| appName | string |
| appVersion | string |
| fiscalYear | string |
| primaryColor | string |
| profileName | string |
| profileAvatar | string |
| initialBalance | number |
| showWarnings | boolean |
| hiddenColumns | object |
| settingsPassword | string |
| receiptLayout | string |
| receiptLogo | string |
| companyCnpj | string |
| companyAddress | string |
| pixKey | string |
| pixQrCode | string |
| whatsappBillingTemplate | string |
| whatsappOSTemplate | string |
| sendPulseClientId | string |
| sendPulseClientSecret | string |
| sendPulseTemplateId | string |
| telegramBotToken | string |
| telegramChatId | string |

## Schemas de Lookup Tables

### CategorySchema

| Campo | Tipo | Obrigatorio |
|-------|------|-------------|
| name | string | Sim |
| type | enum | Sim ("income" \| "expense") |

### InventoryItemSchema

| Campo | Tipo | Obrigatorio |
|-------|------|-------------|
| name | string | Sim |
| category | enum | Sim ("product" \| "service") |
| sku | string | Nao |
| costPrice | number | Nao |
| salePrice | number | Nao |
| quantity | number | Nao |
| minQuantity | number | Nao |
| unitPrice | number | Nao |
| stockLevel | number | Nao |

### BrandSchema

| Campo | Tipo | Obrigatorio |
|-------|------|-------------|
| name | string | Sim |
| equipmentType | string | Nao |

### ModelSchema

| Campo | Tipo | Obrigatorio |
|-------|------|-------------|
| brandId | number | Sim |
| name | string | Sim |

### EquipmentTypeSchema

| Campo | Tipo | Obrigatorio |
|-------|------|-------------|
| name | string | Sim |
| icon | string | Nao |

### ServiceOrderStatusSchema

| Campo | Tipo | Obrigatorio |
|-------|------|-------------|
| name | string | Sim |
| color | string | Sim |
| priority | number | Nao |
| isDefault | boolean | Nao |

### ReceiptSchema

| Campo | Tipo | Obrigatorio |
|-------|------|-------------|
| paymentId | number | Sim |
| content | string | Sim |

## Schema Utilitario

### PaginationSchema

| Campo | Tipo | Padrao | Validacao |
|-------|------|--------|-----------|
| page | number | 1 | inteiro >= 1 |
| limit | number | 20 | inteiro >= 1, max 100 |
| search | string | "" | - |
