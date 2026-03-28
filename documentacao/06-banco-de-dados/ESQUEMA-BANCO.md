# Esquema do Banco de Dados

## Visao Geral

- **Motor:** SQLite (better-sqlite3)
- **Arquivo:** `finance.db` (raiz do projeto)
- **Modo WAL:** Habilitado (leituras concorrentes)
- **Foreign Keys:** Ativadas
- **Total de tabelas:** 14

---

## Tabela: users

Usuarios do sistema com roles e permissoes.

| Coluna | Tipo | Restricao | Descricao |
|--------|------|-----------|-----------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | ID unico |
| username | TEXT | UNIQUE, NOT NULL | Nome de login |
| password | TEXT | NOT NULL | Hash bcrypt da senha |
| role | TEXT | NOT NULL | owner, manager, employee |
| name | TEXT | | Nome completo |
| permissions | TEXT | | JSON array de permissoes |
| createdAt | DATETIME | DEFAULT CURRENT_TIMESTAMP | Data de criacao |

---

## Tabela: transactions

Transacoes financeiras (receitas e despesas).

| Coluna | Tipo | Restricao | Descricao |
|--------|------|-----------|-----------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | ID unico |
| description | TEXT | NOT NULL | Descricao da transacao |
| category | TEXT | NOT NULL | Categoria (Vendas, Servicos, etc.) |
| type | TEXT | CHECK (income/expense) | Tipo: receita ou despesa |
| amount | REAL | NOT NULL | Valor monetario |
| date | TEXT | NOT NULL | Data da transacao |
| status | TEXT | DEFAULT "Concluido" | Status |
| createdBy | INTEGER | | ID do usuario criador |
| updatedBy | INTEGER | | ID do ultimo editor |

---

## Tabela: customers

Clientes cadastrados.

| Coluna | Tipo | Restricao | Descricao |
|--------|------|-----------|-----------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | ID unico |
| firstName | TEXT | NOT NULL | Nome |
| lastName | TEXT | NOT NULL | Sobrenome |
| nickname | TEXT | | Apelido |
| cpf | TEXT | | CPF do cliente |
| companyName | TEXT | | Nome da empresa |
| phone | TEXT | NOT NULL | Telefone |
| observation | TEXT | | Observacoes |
| creditLimit | REAL | DEFAULT 0 | Limite de credito |
| createdAt | DATETIME | DEFAULT CURRENT_TIMESTAMP | Data de criacao |
| createdBy | INTEGER | | ID do usuario criador |
| updatedBy | INTEGER | | ID do ultimo editor |

---

## Tabela: client_payments

Pagamentos de clientes (contas a receber/pagar).

| Coluna | Tipo | Restricao | Descricao |
|--------|------|-----------|-----------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | ID unico |
| customerId | INTEGER | FK → customers.id | Cliente associado |
| description | TEXT | NOT NULL | Descricao do pagamento |
| totalAmount | REAL | NOT NULL | Valor total |
| paidAmount | REAL | DEFAULT 0 | Valor ja pago |
| purchaseDate | TEXT | | Data da compra |
| dueDate | TEXT | | Data de vencimento |
| paymentMethod | TEXT | | Metodo (PIX, cartao, etc.) |
| status | TEXT | | pending, partial, paid |
| installmentsCount | INTEGER | DEFAULT 1 | Numero de parcelas |
| type | TEXT | | income ou expense |
| saleId | TEXT | | ID do grupo de venda |
| paymentHistory | TEXT | | JSON: [{date, amount}] |
| createdBy | INTEGER | | ID do usuario criador |
| updatedBy | INTEGER | | ID do ultimo editor |

---

## Tabela: receipts

Recibos gerados para pagamentos.

| Coluna | Tipo | Restricao | Descricao |
|--------|------|-----------|-----------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | ID unico |
| paymentId | INTEGER | FK → client_payments.id | Pagamento associado |
| content | TEXT | | HTML do recibo |
| createdAt | DATETIME | DEFAULT CURRENT_TIMESTAMP | Data de criacao |

---

## Tabela: service_orders

Ordens de servico para manutencao de equipamentos.

| Coluna | Tipo | Restricao | Descricao |
|--------|------|-----------|-----------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | ID unico |
| customerId | INTEGER | FK → customers.id | Cliente associado |
| equipmentType | TEXT | | Tipo do equipamento |
| equipmentBrand | TEXT | | Marca |
| equipmentModel | TEXT | | Modelo |
| equipmentColor | TEXT | | Cor |
| equipmentSerial | TEXT | | Numero de serie |
| reportedProblem | TEXT | NOT NULL | Problema relatado |
| arrivalPhotoUrl | TEXT | | URL da foto (futuro) |
| arrivalPhotoBase64 | TEXT | | Foto em base64 |
| status | TEXT | DEFAULT "Aguardando Analise" | Status atual |
| technicalAnalysis | TEXT | | Diagnostico do tecnico |
| servicesPerformed | TEXT | | Servicos realizados |
| services | TEXT | | JSON: [{description, qty, price}] |
| partsUsed | TEXT | | JSON: [{name, qty, price, id}] |
| serviceFee | REAL | | Valor do servico |
| totalAmount | REAL | | Valor total |
| finalObservations | TEXT | | Observacoes finais |
| entryDate | TEXT | | Data de entrada |
| analysisPrediction | TEXT | | Previsao IA |
| customerPassword | TEXT | | Senha do equipamento |
| accessories | TEXT | | Acessorios entregues |
| ramInfo | TEXT | | Info de RAM |
| ssdInfo | TEXT | | Info de SSD |
| priority | TEXT | DEFAULT "medium" | low, medium, high, urgent |
| createdAt | DATETIME | DEFAULT CURRENT_TIMESTAMP | Data de criacao |
| createdBy | INTEGER | | ID do usuario criador |
| updatedBy | INTEGER | | ID do ultimo editor |

---

## Tabela: service_order_statuses

Status configuraveis para ordens de servico.

| Coluna | Tipo | Restricao | Descricao |
|--------|------|-----------|-----------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | ID unico |
| name | TEXT | NOT NULL | Nome do status |
| color | TEXT | NOT NULL | Cor hex (#f59e0b) |
| priority | INTEGER | DEFAULT 0 | Prioridade de exibicao |
| isDefault | INTEGER | DEFAULT 0 | 1 = padrao do sistema |

---

## Tabela: inventory_items

Produtos e servicos do estoque.

| Coluna | Tipo | Restricao | Descricao |
|--------|------|-----------|-----------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | ID unico |
| name | TEXT | NOT NULL | Nome do item |
| category | TEXT | CHECK (product/service) | Tipo do item |
| sku | TEXT | | Codigo SKU |
| costPrice | REAL | | Preco de custo |
| salePrice | REAL | | Preco de venda |
| quantity | INTEGER | DEFAULT 0 | Quantidade em estoque |
| minQuantity | INTEGER | DEFAULT 5 | Quantidade minima |
| unitPrice | REAL | | Preco unitario |
| stockLevel | INTEGER | | Nivel de estoque |
| createdAt | DATETIME | DEFAULT CURRENT_TIMESTAMP | Data de criacao |
| createdBy | INTEGER | | ID do usuario criador |
| updatedBy | INTEGER | | ID do ultimo editor |

---

## Tabela: categories

Categorias de receita e despesa.

| Coluna | Tipo | Restricao | Descricao |
|--------|------|-----------|-----------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | ID unico |
| name | TEXT | NOT NULL | Nome da categoria |
| type | TEXT | NOT NULL | income ou expense |

---

## Tabela: brands

Marcas de equipamentos.

| Coluna | Tipo | Restricao | Descricao |
|--------|------|-----------|-----------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | ID unico |
| name | TEXT | UNIQUE, NOT NULL | Nome da marca |
| equipmentType | TEXT | | Tipo de equipamento |

---

## Tabela: models

Modelos de equipamentos (vinculados a marcas).

| Coluna | Tipo | Restricao | Descricao |
|--------|------|-----------|-----------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | ID unico |
| brandId | INTEGER | FK → brands.id | Marca associada |
| name | TEXT | NOT NULL | Nome do modelo |

**Constraint:** UNIQUE(brandId, name) - mesmo modelo nao pode repetir na mesma marca.

---

## Tabela: equipment_types

Tipos de equipamento (Notebook, Desktop, Smartphone, etc.).

| Coluna | Tipo | Restricao | Descricao |
|--------|------|-----------|-----------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | ID unico |
| name | TEXT | UNIQUE, NOT NULL | Nome do tipo |
| icon | TEXT | | Nome do icone (Lucide) |

---

## Tabela: settings

Configuracoes globais do sistema (singleton - sempre id=1).

| Coluna | Tipo | Restricao | Descricao |
|--------|------|-----------|-----------|
| id | INTEGER | PRIMARY KEY CHECK (id = 1) | Sempre 1 |
| appName | TEXT | | Nome do app |
| appVersion | TEXT | | Versao |
| fiscalYear | TEXT | | Ano fiscal |
| primaryColor | TEXT | | Cor primaria hex |
| profileName | TEXT | | Nome do perfil |
| profileAvatar | TEXT | | Avatar base64 |
| initialBalance | REAL | | Saldo inicial |
| showWarnings | INTEGER | | 1 = mostrar avisos |
| hiddenColumns | TEXT | | JSON: colunas ocultas |
| settingsPassword | TEXT | | Senha das configuracoes |
| receiptLayout | TEXT | | Template HTML do recibo |
| receiptLogo | TEXT | | Logo do recibo base64 |
| companyCnpj | TEXT | | CNPJ da empresa |
| companyAddress | TEXT | | Endereco da empresa |
| pixKey | TEXT | | Chave PIX |
| pixQrCode | TEXT | | QR code PIX |
| whatsappBillingTemplate | TEXT | | Template cobranca WhatsApp |
| whatsappOSTemplate | TEXT | | Template OS WhatsApp |
| sendPulseClientId | TEXT | | SendPulse client ID |
| sendPulseClientSecret | TEXT | | SendPulse client secret |
| sendPulseTemplateId | TEXT | | SendPulse template ID |
| telegramBotToken | TEXT | | Token do bot Telegram |
| telegramChatId | TEXT | | Chat ID do Telegram |

---

## Tabela: audit_logs

Log de auditoria de todas as operacoes.

| Coluna | Tipo | Restricao | Descricao |
|--------|------|-----------|-----------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | ID unico |
| userId | INTEGER | FK → users.id | Usuario que executou |
| action | TEXT | NOT NULL | CREATE, UPDATE, DELETE |
| entity | TEXT | NOT NULL | Nome da tabela |
| entityId | INTEGER | | ID do registro afetado |
| details | TEXT | | Descricao da acao |
| timestamp | DATETIME | DEFAULT CURRENT_TIMESTAMP | Momento da acao |
