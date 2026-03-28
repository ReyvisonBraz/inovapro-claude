# Fluxo de Dados

## Fluxo Completo de uma Operacao CRUD

### Exemplo: Criar uma Transacao

```
1. Usuario clica "Nova Transacao" no frontend
   └── Modal AddTransactionModal abre

2. Usuario preenche formulario e clica "Salvar"
   └── Componente chama funcao handleAddTransaction (prop do App.tsx)

3. App.tsx executa fetch via api.ts
   └── POST /api/transactions
       Body: { description, category, type, amount, date }
       Header: Authorization: Bearer <jwt_token>

4. Express recebe a requisicao
   └── Middleware pipeline:
       4a. express.json() → parseia body JSON
       4b. apiLimiter → verifica rate limit
       4c. requireAuth → valida JWT, seta req.user

5. Route handler (transactions.routes.ts)
   └── TransactionSchema.parse(req.body) → valida com Zod
       └── Se invalido: ZodError → errorHandler → 400

6. Logica de negocio
   └── db.prepare("INSERT INTO transactions ...").run(...)
       └── better-sqlite3 executa no finance.db

7. Audit log
   └── logAudit(userId, "CREATE", "transaction", id, description)

8. Response
   └── 201 { id, description, category, type, amount, date, ... }

9. Frontend recebe resposta
   └── App.tsx atualiza estado: setTransactions([...transactions, nova])

10. React re-renderiza
    └── Componente Transactions mostra nova transacao na lista
```

## Fluxo de Autenticacao

```
1. Usuario acessa o sistema
   └── App.tsx verifica localStorage("financeflow_token")
       ├── Token existe → valida no backend → mostra dashboard
       └── Token nao existe → mostra tela de login

2. Login
   └── POST /api/login { username, password }
       ├── loginLimiter (10 tentativas / 15 min)
       ├── Busca usuario no banco
       ├── Compara senha (bcrypt ou plaintext legado)
       │   └── Se plaintext: auto-upgrade para bcrypt
       ├── Gera JWT { userId, role, permissions }
       └── Retorna { id, username, name, role, permissions, token }

3. Frontend salva token
   └── localStorage.setItem("financeflow_token", token)

4. Requisicoes subsequentes
   └── api.ts adiciona header automaticamente:
       Authorization: Bearer <token>

5. Token expirado (401)
   └── api.ts detecta 401
       └── Remove token do localStorage
           └── Recarrega pagina → mostra login
```

## Fluxo de Ordem de Servico

```
1. ENTRADA DO EQUIPAMENTO
   └── Tecnico cria OS com dados do equipamento
       ├── Cliente (obrigatorio)
       ├── Tipo, marca, modelo, serial, cor
       ├── Problema relatado
       ├── Foto de chegada (base64)
       ├── Acessorios, senha do equipamento
       └── Prioridade (baixa/media/alta/urgente)
   └── Status: "Aguardando Analise"

2. ANALISE TECNICA
   └── Tecnico registra diagnostico
       ├── Analise tecnica (texto)
       ├── Previsao de analise por IA (Gemini)
       └── Status: "Em Manutencao"

3. MANUTENCAO
   └── Tecnico registra servicos e pecas
       ├── Servicos realizados
       ├── Pecas usadas (do estoque)
       │   └── Estoque atualizado automaticamente
       ├── Valor do servico
       └── Status: "Em Manutencao" ou "Aguardando Pecas"

4. CONCLUSAO
   └── Tecnico finaliza OS
       ├── Observacoes finais
       ├── Valor total
       └── Status: "Pronto para Retirada"

5. ENTREGA
   └── Cliente retira equipamento
       └── Status: "Concluido"

6. ACOMPANHAMENTO PUBLICO
   └── Cliente acessa pagina publica
       └── POST /api/service-orders/public/:id/status
           ├── Informa CPF (primeiros 4 digitos)
           └── Ve: status, problema, analise, equipamento
```

## Fluxo de Pagamentos com Parcelas

```
1. CRIACAO DA VENDA
   └── Registra pagamento com parcelas
       ├── Cliente, descricao, valor total
       ├── Numero de parcelas
       ├── Data de vencimento
       ├── Metodo de pagamento
       └── Gera saleId para agrupar parcelas

2. REGISTRO DE PAGAMENTO
   └── Cliente paga uma parcela
       ├── Valor pago adicionado ao historico (JSON)
       ├── paidAmount atualizado
       ├── Status recalculado:
       │   ├── paidAmount = 0 → "pending"
       │   ├── paidAmount < totalAmount → "partial"
       │   └── paidAmount >= totalAmount → "paid"
       └── Data e valor do pagamento registrados

3. RECIBO
   └── Gera recibo em HTML
       ├── Dados da empresa (nome, CNPJ, endereco)
       ├── Dados do cliente
       ├── Detalhes do pagamento
       ├── QR code PIX (se configurado)
       └── Pode imprimir via html2canvas
```

## Fluxo de Dados no Frontend (Estado Atual)

```
App.tsx (estado centralizado)
│
├── user ──────────────> Login, Header, Sidebar
├── transactions ──────> Transactions, Dashboard, Reports
├── customers ─────────> Customers, ServiceOrders, ClientPayments
├── clientPayments ────> ClientPayments
├── serviceOrders ─────> ServiceOrders
├── inventoryItems ────> Inventory, ServiceOrders (pecas)
├── settings ──────────> Settings, toda a aplicacao
├── categories ────────> Settings, AddTransactionModal
├── brands ────────────> Settings, ServiceOrders
├── models ────────────> Settings, ServiceOrders
└── equipmentTypes ────> Settings, ServiceOrders

Problema: Tudo passa por props drilling do App.tsx
Solucao planejada: React Context API (Fase 2)
```
