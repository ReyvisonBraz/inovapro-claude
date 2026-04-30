# Bug Report - INOVA PRO

## 📋 Resumo dos Bugs Encontrados

### 1. **CRÍTICO: Dashboard - Gráficos com dados errados**
- **Local:** `src/components/dashboard/Dashboard.tsx`
- **Problema:** Os gráficos usam `dataKey="renda"` e `dataKey="despesa"`, mas a API retorna `income` e `expense`
- **Impacto:** Gráficos não exibem dados corretamente
- **Screenshot:** N/A (requer verificação visual)
- **Status:** Bug confirmado via API inspection

---

### 2. **CRÍTICO: Inventory - Validação muito restritiva**
- **Local:** `server.ts` endpoint `/api/inventory`
- **Problema:** CHECK constraint `category IN ('product', 'service')` não aceita os valores mostrados na UI
- **Impacto:** Não consegue criar itens de inventário pela interface
- **Mensagem:** `{"error":"CHECK constraint failed: category IN ('product', 'service')"}`
- **Status:** Bug confirmado - campo aceita apenas 'product' ou 'service'

---

### 3. **MODERADO: .env duplicado**
- **Local:** `.env` linhas 45-50
- **Problema:** Variáveis duplicadas causam conflito de configuração
- **Impacto:** Variáveis de ambiente podem ser sobrescritas incorretamente
- **Status:** Corrigido (limpei o arquivo)

---

### 4. **MODERADO: Servidor não inicia em localhost**
- **Local:** `server.ts`
- **Problema:** Erro `EADDRINUSE: address already in use 0.0.0.0:3000` impede reinicialização
- **Impacto:** Não é possível restartar o servidor sem matar o processo antigo
- **Status:** Comportamento esperado em ambiente de desenvolvimento

---

### 5. **BAIXO: Nome de categoria duplicado**
- **Local:** Categorias no banco de dados
- **Problema:** Existe "Outros" para income e "Outros" para expense
- **Impacto:** Pode causar confusão na UI
- **Status:** Observação - não é bug critico

---

### 6. **BAIXO: WebSocket port conflict**
- **Local:** Server startup
- **Problema:** `WebSocket server error: Port 24678 is already in use`
- **Impacto:** Não afeta funcionalidademas polui logs
- **Status:** Comportamento esperado - Vite HMR

---

## 🔍 Notas de Análise do Sistema

### Arquitetura
- **Backend:** Express + better-sqlite3 (banco local SQLite)
- **Frontend:** React 19 + Vite + React Router v7
- **State Management:** Zustand (múltiplos stores)
- **Styling:** Tailwind CSS
- **Charts:** Recharts

### Fluxo de Dados
1. Login → `/api/login` → JWT token
2. Token salvo em `localStorage` 
3. Todas requisições incluem `Authorization: Bearer {token}`
4. API validation com Zod schemas
5. Auto-logout em 401 com redirect para `/login`

### Estrutura de Stores Zustand
- `useAuthStore` - autenticação
- `useAppStore` - estado global da app
- `useFilterStore` - filtros de todas páginas
- `useSettingsStore` - configurações
- `useModalStore` - modais
- `useFormStore` - formulários

### Tabelas do Banco
- `users` - autenticação
- `transactions` - entradas/saídas
- `customers` - clientes
- `client_payments` - pagamentos a prazo
- `service_orders` - ordens de serviço
- `inventory_items` - estoque
- `categories` - categorias transações
- `service_order_statuses` - status OS
- `brands`, `models`, `equipment_types` - cadastros técnicos
- `settings` - configurações
- `audit_logs` - log de ações

---

## 📝 Bugs a Corrigir Prioritariamente

1. **[ALTA] Corrigir dataKeys dos gráficos do Dashboard**
   - Mudar `renda` → `income` e `despesa` → `expense`

2. **[ALTA] Ajustar validação de categoria do inventory**
   - ouaceitar mais valores ou ajustar UI para usar 'product'/'service'

3. **[MÉDIA] Limpar logs de WebSocket**
   - Configurar Vite para não logar erro do port 24678

---

## ✅ Testes Realizados

| Funcionalidade | Status | Notas |
|---------------|--------|-------|
| Login admin/admin2021 | ✅ OK | Funcionando |
| API /api/login | ✅ OK | Retorna token JWT |
| API /api/stats | ✅ OK | Retorna dados corretos |
| API /api/transactions | ✅ OK | CRUD funcionando |
| API /api/customers | ✅ OK | Criação OK |
| API /api/client-payments | ✅ OK | Criação OK |
| API /api/service-orders | ✅ OK | Criação OK |
| API /api/inventory | ⚠️ PARCIAL | Error na criação |
| API /api/categories | ✅ OK | Retorna categorias |
| API /api/settings | ✅ OK | Retorna configurações |
| API /api/users | ✅ OK | CRUD funcionando |
| API /api/audit-logs | ✅ OK | Retorna logs |
| Dashboard charts | ❌ ERRO | dataKeys errados |

---

*Documento gerado em: 2026-04-28*