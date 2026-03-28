# Divida Tecnica

## Problemas Atuais por Prioridade

---

### CRITICO

#### 1. App.tsx Monolitico (3.257 linhas)

- **Problema:** Todo o estado, logica e navegacao centralizados em um unico arquivo
- **Impacto:** Impossivel manter, testar ou escalar
- **Contem:** 50+ hooks useState, funcoes CRUD, renderizacao condicional
- **Solucao:** Migrar para React Router + Context API (Fase 2)

#### 2. ServiceOrders.tsx Gigante (~2.488 linhas)

- **Problema:** Formulario, lista, detalhes e impressao em um so componente
- **Impacto:** Dificil de manter, performance de renderizacao ruim
- **Solucao:** Dividir em ServiceOrderList, ServiceOrderForm, ServiceOrderDetail, ServiceOrderPrint (Fase 3)

#### 3. Sem React Router

- **Problema:** Navegacao por string `activeScreen`, sem URLs reais
- **Impacto:** Sem deep links, sem historico do browser, sem bookmarks
- **Solucao:** Implementar React Router v6 (Fase 2)

---

### ALTO

#### 4. Sem React Context

- **Problema:** 50+ useState no App.tsx, props drilling extensivo
- **Impacto:** Re-renders desnecessarios, codigo dificil de seguir
- **Solucao:** Criar AuthContext, DataContexts, UIContext (Fase 2)

#### 5. Zero Cobertura de Testes

- **Problema:** Nenhum teste unitario, de integracao ou e2e
- **Impacto:** Bugs nao detectados, refatoracao arriscada
- **Solucao:** Vitest + Supertest (Fase 4)

#### 6. Componentes Duplicados

- **Problema:** Mesmos componentes existem na raiz e em subdiretorios
- **Duplicatas:** Dashboard, Customers, Transactions, ClientPayments, ServiceOrders, Inventory, SidebarItem, StatCard, PasswordModal, WarningModal
- **Impacto:** Confusao sobre qual versao usar, codigo duplicado
- **Solucao:** Unificar e remover versoes nao usadas

#### 7. Seguranca Pre-Producao

- **Problemas:**
  - JWT_SECRET padrao no codigo
  - Senha admin/admin padrao
  - Senha configuracoes "1234"
  - CORS configurado como `*`
  - Body limit de 50MB (excessivo)
  - Sem HTTPS
- **Impacto:** Vulnerabilidades de seguranca em producao
- **Solucao:** Configurar valores reais antes do deploy

---

### MEDIO

#### 8. Hooks Criados mas NAO Consumidos

- **Problema:** useAppSettings, useCustomers, useInventory, useTransactions, useUsers existem mas App.tsx nao os usa
- **Impacto:** Codigo morto, investimento sem retorno
- **Solucao:** Integrar com Context API na Fase 2

#### 9. Pastas Vazias

- **Pastas:** src/contexts/, src/pages/, src/layouts/, src/test/
- **Problema:** Criadas como preparacao mas nunca utilizadas
- **Impacto:** Confusao na estrutura do projeto
- **Solucao:** Preencher na Fase 2 ou remover

#### 10. server.ts Legado

- **Problema:** Arquivo monolitico de 1.160 linhas na raiz, ja substituido por server/
- **Impacto:** Confusao sobre qual servidor usar, codigo morto
- **Solucao:** Remover e remover script `dev:legacy` do package.json

#### 11. Sem ESLint/Prettier

- **Problema:** Sem linter ou formatador configurado
- **Impacto:** Inconsistencia de estilo, bugs nao detectados
- **Solucao:** Configurar na Fase 4

#### 12. ClientPayments.tsx Grande (702 linhas)

- **Problema:** Formularios e lista misturados
- **Solucao:** Dividir na Fase 3

---

### BAIXO

#### 13. console.log em Producao

- **Problema:** Statements de debug espalhados pelo codigo
- **Impacto:** Poluicao do console, possivel vazamento de dados
- **Solucao:** Remover ou substituir por logger

#### 14. Uso de `any` em Tipos

- **Problema:** TypeScript com tipos `any` em varios locais
- **Impacto:** Perde beneficios da tipagem
- **Solucao:** Substituir por tipos corretos

#### 15. Fotos em Base64

- **Problema:** Fotos de equipamento armazenadas como base64 no banco
- **Impacto:** Banco de dados cresce rapidamente, queries lentas
- **Solucao:** Migrar para Supabase Storage na Fase 5

#### 16. Sem API Versioning

- **Problema:** Endpoints em /api/ sem versao
- **Impacto:** Breaking changes afetam todos os clientes
- **Solucao:** Implementar /api/v1/ na Fase 5
