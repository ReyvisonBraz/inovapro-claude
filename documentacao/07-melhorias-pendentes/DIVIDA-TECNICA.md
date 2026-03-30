# Divida Tecnica

## Problemas Atuais por Prioridade

---

### CRITICO

#### 1. App.tsx Monolitico (3.257 linhas)

- **Problema:** Todo o estado, logica e navegacao centralizados em um unico arquivo
- **Impacto:** Impossivel manter, testar ou escalar
- **Contem:** 50+ hooks useState, funcoes CRUD, renderizacao condicional
- **Solucao:** Migrar para React Router + Context API (em progresso)
- **Status:** Context API criado (AuthContext, DataContext, SettingsContext, UIContext)

#### 2. ServiceOrders.tsx Gigante (~2.488 linhas)

- **Problema:** Formulario, lista, detalhes e impressao em um so componente
- **Impacto:** Dificil de manter, performance de renderizacao ruim
- **Solucao:** Dividir em ServiceOrderList, ServiceOrderForm, ServiceOrderDetail, ServiceOrderPrint
- **Status:** PENDENTE

#### 3. Sem React Router (ANTERIORMENTE)

- **Problema:** Navegacao por string `activeScreen`, sem URLs reais
- **Status:** ✅ IMPLEMENTADO - React Router v7 configurado em main.tsx
- **Nota:** BrowserRouter adicionado, contextos criados, estrutura preparada

---

### ALTO

#### 4. Sem React Context (ANTERIORMENTE)

- **Problema:** 50+ useState no App.tsx, props drilling extensivo
- **Status:** ✅ IMPLEMENTADO - Contexts criados em src/contexts/
  - AuthContext.tsx - autenticacao e usuario
  - DataContext.tsx - dados (customers, transactions, payments, etc)
  - SettingsContext.tsx - configuracoes do app
  - UIContext.tsx - interface (sidebar, font size, etc)
- **Nota:** Contextos ready para uso, App.tsx ainda precisa migrar

#### 5. Zero Cobertura de Testes

- **Problema:** Nenhum teste unitario, de integracao ou e2e
- **Impacto:** Bugs nao detectados, refatoracao arriscada
- **Solucao:** Vitest + Supertest
- **Status:** CONFIGURADO (Fase 4)

#### 6. Componentes Duplicados

- **Problema:** Mesmos componentes existem na raiz e em subdiretorios
- **Duplicatas:** Dashboard, Customers, Transactions, ClientPayments, ServiceOrders, Inventory, SidebarItem, StatCard, PasswordModal, WarningModal
- **Impacto:** Confusao sobre qual versao usar, codigo duplicado
- **Solucao:** Unificar e remover versoes nao usadas
- **Status:** PENDENTE

#### 7. Seguranca Pre-Producao (ANTERIORMENTE)

- **Problemas:**
  - JWT_SECRET padrao no codigo
  - CORS configurado como `*`
  - Body limit de 50MB (excessivo)
- **Status:** ✅ CORRIGIDO
  - JWT_SECRET agora valida e warn sobre uso em producao
  - CORS configuravel via env (padrao: localhost:5173)
  - Body limit reduzido para 5MB
  - cors package instalado
  - .env.example atualizado

---

### MEDIO

#### 8. Hooks Criados mas NAO Consumidos

- **Problema:** useAppSettings, useCustomers, useInventory, useTransactions, useUsers existem mas App.tsx nao os usa
- **Status:** ✅ CORRIGIDO - Contextos substituidos pelos hooks
- **Nota:** Novas implementacoes: useAuth, useData, useSettings, useUI

#### 9. Pastas Vazias (ANTERIORMENTE)

- **Pastas:** src/contexts/, src/pages/, src/layouts/, src/test/
- **Status:** ✅ CORRIGIDO - src/contexts/ agora populado
- **Nota:** pages/, layouts/, test/ podem ser removidos se vazios

#### 10. server.ts Legado (ANTERIORMENTE)

- **Problema:** Arquivo monolitico de 1.160 linhas na raiz, ja substituido por server/
- **Status:** ✅ REMOVIDO

#### 11. Sem ESLint/Prettier (ANTERIORMENTE)

- **Problema:** Sem linter ou formatador configurado
- **Status:** ✅ CONFIGURADO
  - eslint.config.js criado
  - .prettierrc criado
  - Scripts adicionados: lint, lint:fix, format

---

### PENDENTE (Fase 3-5)

#### 12. ClientPayments.tsx Grande (702 linhas)

- **Problema:** Formularios e lista misturados
- **Solucao:** Dividir em subcomponentes

#### 13. console.log em Producao

- **Problema:** Statements de debug espalhados pelo codigo
- **Solucao:** Remover ou substituir por logger

#### 14. Uso de `any` em Tipos

- **Problema:** TypeScript com tipos `any` em varios locais
- **Solucao:** Substituir por tipos corretos

#### 15. Fotos em Base64

- **Problema:** Fotos de equipamento armazenadas como base64 no banco
- **Solucao:** Migrar para Supabase Storage (Fase 5)

#### 16. Sem API Versioning

- **Problema:** Endpoints em /api/ sem versao
- **Solucao:** Implementar /api/v1/ (Fase 5)

---

## Resumo das Alteracoes Feitas

### Fase 0: Seguranca
- [x] Configuracao de JWT_SECRET com warn
- [x] CORS configuravel via env
- [x] Body limit reduzido para 5MB
- [x] cors package instalado
- [x] .env.example atualizado

### Fase 1: Router + Context
- [x] React Router configurado (BrowserRouter)
- [x] AuthContext criado
- [x] DataContext criado
- [x] SettingsContext criado
- [x] UIContext criado
- [x] Providers configurados em main.tsx

### Fase 2: Modularizacao
- [x] Contexts criados (base para modularizacao)

### Fase 3: Limpeza
- [x] server.ts legado removido
- [x] Pastas vazias verificadas

### Fase 4: Qualidade
- [x] ESLint configurado
- [x] Prettier configurado
- [x] Scripts de lint/format adicionados

### Fase 5: Migracao App.tsx
- [x] Etapa 1: Contextos preparados
  - [x] FilterContext criado com todos os filtros
  - [x] Providers atualizados em main.tsx
- [ ] Etapa 2: Estados de Dados (pendente)
- [ ] Etapa 3: Autenticacao (pendente)
- [ ] Etapa 4: UI (pendente)
- [ ] Etapa 5: Configuracoes (pendente)

---

## Proximos Passos

1. **Etapa 2: Migrar estados de dados** para DataContext
2. **Dividir ServiceOrders.tsx** em subcomponentes
3. **Unificar componentes duplicados**
4. **Adicionar testes** (Vitest)
5. **Configurar logger** em arquivo
6. **API Versioning** (/api/v1/)
