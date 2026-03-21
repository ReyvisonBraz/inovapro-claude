## Plano Detalhado de Refatoração - FinanceFlow OS

### Fase 1: Higiene Estrutural - Remoção de Duplicatas
**Objetivo**: Eliminar componentes duplicados mantendo apenas as versões de subpasta.

**Passos Específicos**:
1. **Análise Comparativa Detalhada**:
   - `src/components/Customers.tsx` (74 linhas) vs `src/components/customers/Customers.tsx` (155 linhas)
     - Verificar se a versão subpasta contém todas as funcionalidades da raiz
     - Identificar diferenças em props, hooks e imports
   - `src/components/Dashboard.tsx` vs `src/components/dashboard/Dashboard.tsx`
     - Comparar implementations de gráficos e filtros
   - `src/components/ServiceOrders.tsx` (2361 linhas) vs `src/components/service-orders/ServiceOrders.tsx` (226 linhas)
     - Confirmar que a subpasta é apenas um stub (excluir completamente)
   - Repetir para: Inventory, ClientPayments, Transactions, StatCard, SidebarItem, modais

2. **Ações de Remoção/Atualização**:
   - Excluir stubs grandes em subpastas: ServiceOrders, Inventory, ClientPayments, Transactions
   - Atualizar imports em App.tsx para apontar para subpastas válidas (customers/, dashboard/)
   - Para componentes UI pequenos:
     * `SidebarItem`: adicionar prop `collapsed` em `layout/SidebarItem.tsx`, atualizar App.tsx, excluir raiz
     * `StatCard`: adicionar named export em `ui/StatCard.tsx`, atualizar App.tsx, excluir raiz
   - Excluir modais duplicados: `ui/PasswordModal.tsx` e `ui/WarningModal.tsx` (manter apenas versões raiz se idênticos)

3. **Validação Pós-Remoção**:
   - Verificar que nenhuma importação quebrada permanece
   - Confirmar que todos os componentes renderizam corretamente em telas principais

### Fase 2: Segurança - Migração de Validação de Senha
**Objetivo**: Mover validação de senha do cliente para backend seguro.

**Passos Específicos**:
1. **Backend Implementation**:
   - Criar endpoint `/api/auth/verify-password` em `server.js` ou novo arquivo de rotas
   - Implementar comparação segura usando bcrypt ou similar (nunca armazenar/plaintext)
   - Retornar apenas boolean de sucesso/falha (sem vaziar informações)
   - Adicionar rate limiting básico para prevenção de brute force

2. **Frontend Changes**:
   - Remover estado `settingsPassword` do App.tsx
   - Substituir comparação client-side por chamada ao novo endpoint
   - Implementar loading state durante verificação
   - Tratar respostas de erro (senha incorreta, servidor indisponível)
   - Remover qualquer referência à senha em DevTools/localStorage

3. **Considerações de Segurança**:
   - Garantir que a senha nunca seja armazenada em estado React ou localStorage
   - Usar HTTPS em produção (mesmo que atualmente seja local)
   - Considerar hash do lado cliente apenas para transmissão (não substitui verificação backend)

### Fase 3: Qualidade de Tipagem - Eliminando `any`
**Objetivo**: Substituir todas as instâncias de `any` por tipos específicos.

**Passos Específicos**:
1. **Mapeamento de Ocorrências Críticas**:
   - Buscar por `: any` e `any` em:
     * `src/App.tsx` (especialmente em funções de fetch e callbacks)
     * `src/types.ts` (verificar se interfaces existentes cobrem todos os casos)
     * Componentes de dados (Transactions, Customers, etc.)
     * Funções de utilidade (formatters, calculators)

2. **Estratégia de Tipagem**:
   - Criar tipos genéricos reutilizáveis em `types.ts`:
     ```typescript
     interface PaginatedResponse<T> {
       data: T[];
       total: number;
       page: number;
       limit: number;
     }
     ```
   - Tipar respostas de API usando interfaces existentes:
     * `Transaction`, `Customer`, `ServiceOrder` etc.
   - Substituir `any` em:
     * Hooks de estado (`useState<any> → useState<Transaction[]>`)
     * Parâmetros de funções (`fetchData(any) → fetchData(filters: TransactionFilters)`)
     * Valores de retorno de funções utilitárias

3. **Validação**:
   - Executar `tsc --noEmit` para garantir zero erros de tipo
   - Verificar que autocomplete do TypeScript funciona em todos os pontos de uso

### Fase 4: Centralização de API - Expansão de services/api.ts
**Objetivo**: Substituir chamadas fetch() diretas por serviço centralizado tipado.

**Passos Específicos**:
1. **Análise de Endpoints Existentes**:
   - Mapear todas chamadas fetch() em App.tsx:
     * `/api/transactions`, `/api/customers`, `/api/service-orders`, etc.
     * Métodos HTTP utilizados (GET, POST, PUT, DELETE)
     * Parâmetros de query e bodies típicos

2. **Implementação do Serviço**:
   - Expandir `src/services/api.ts` com funções tipadas:
     ```typescript
     export const api = {
       transactions: {
         getAll: (params?: TransactionParams): Promise<PaginatedResponse<Transaction>>,
         create: (data: TransactionCreateDTO): Promise<Transaction>,
         // ... outros métodos
       },
       // semelhante para customers, service-orders, etc.
     };
     ```
   - Implementar tratamento centralizado de erros
   - Adicionar interceptors para loading states globais (opcional)
   - Configurar base URL e headers de autenticação

3. **Migração Gradual**:
   - Substituir uma chamada fetch() por vez em App.tsx
   - Manter versão antiga comentada temporariamente para comparação
   - Testar cada substituição antes de prosseguir
   - Remover completamente as chamadas fetch() diretas após validação

### Fase 5: Otimização de Performance - useMemo Aplicado
**Objetivo**: Adicionar memoização em computações pesadas para evitar recalculações desnecessárias.

**Passos Específicos**:
1. **Identificação de Computações Pesadas**:
   - `filteredTransactions` (dependente de filtros e transações)
   - `chartData` para gráficos de receitas/despesas
   - `getAllMovements()` (agregação complexa)
   - `sortedIncomeRanking` (ordenamento grande)
   - Qualquer cálculo que rode em cada render sem mudar dependências

2. **Aplicação de useMemo**:
   - Envolver cada computação em `useMemo(() => { ... }, [deps])`
   - Definir dependências precisas:
     * `filteredTransactions`: depender de `transactions` array e filtros ativos
     * `chartData`: depender de dados agregados necessários para o gráfico
   - Evitar dependências muito amplas (que causariam recalculo frequente)
   - Considerar uso de `useCallback` para funções passadas como props

3. **Validação de Impacto**:
   - Medir rerenders com React DevTools Profiler
   - Verificar que valores memoizados atualizam apenas quando necessário
   - Confirmar que não há stale closures em dependências

### Fase 6: Modularização via Contextos - Simplificação do App.tsx
**Objetivo**: Quebrar o App.tsx em múltiplos contextos React para isolar preocupações.

**Passos Específicos**:
1. **Definição de Contextos Necessários**:
   - `AuthContext`: gerencia usuário logado, permissões, token
   - `TransactionsContext`: estado das transações, filtros, operações CRUD
   - `CustomersContext`: dados de clientes, seleção, busca
   - `UIStateContext`: loading states, modais abertos, notificações
   - `SettingsContext`: configurações do sistema (excluindo senha)

2. **Implementação de Cada Contexto**:
   - Criar pasta `src/contexts/` com arquivos individuais
   - Para cada contexto:
     * Definir interface do estado inicial
     * Implementar reducer (se complexo) ou useState simples
     * Criar provider com valor tipado
     * Exportar hook customizado (`useTransactions`, etc.)
   - Mover lógica relacionada de App.tsx para os contextos

3. **Refatoração do App.tsx**:
   - Remover 40+ useState hooks distribuindo pelos contextos
   - Substituir funções fetch por métodos dos contextos
   - Manter apenas:
     * Roteamento (quando implementado)
     * Estado deUI global muito geral (ex: tema escuro/claro)
     * Composição de providers e rotas principais
   - Reduzir de >2500 linhas para <500 linhas focadas em orquestração

### Fase 7: Extração de Templates de Impressão
**Objetivo**: Mover HTML hardcoded para componentes React separados.

**Passos Específicos**:
1. **Identificação de Templates**:
   - `generateReceipt()` - recibo de pagamento
   - `handlePrintBlankForm()` - formulário em branco
   - `printCustomerStatement()` - extrato de cliente
   - Qualquer outra função com string HTML >50 linhas

2. **Criação de Componentes de Impressão**:
   - Pasta `src/components/print/` com:
     * `ReceiptTemplate.tsx` - recebe dados do pagamento como props
     * `BlankFormTemplate.tsx` - configurável por tipo de formulário
     * `CustomerStatementTemplate.tsx` - recebe histórico do cliente
   - Usar Tailwind classes diretamente (não inline styles)
   - Evitar perigos de XSS usando apenas dados confiáveis ou sanitização

3. **Integração com window.print()**:
   - Criar utilitário `src/utils/printUtils.ts`:
     ```typescript
     export const printComponent = (component: React.ReactElement) => {
       const printWindow = window.open('', '', 'width=800,height=600');
       printWindow.document.write(`
         <html>
           <head>
             <link href="/src/index.css" rel="stylesheet">
             <title>Impressão</title>
           </head>
           <body>
             ${ReactDOM.renderToStaticMarkup(component)}
           </body>
         </html>
       `);
       printWindow.document.close();
       printWindow.focus();
       printWindow.print();
       printWindow.close();
     };
     ```
   - Substituir funções HTML string por chamadas a este utilitário com componentes JSX

4. **Benefícios Adicionais**:
   - Templates agora são testáveis unitariamente
   - Estilos podem ser desenvolvidos com HMR
   - Maior reusabilidade (mesmo template para tela e impressão)
   - Eliminação de riscos de XSS através de JSX seguro

### Fase 8: Implementação de Roteamento
**Objetivo**: Substituir controle de tela por string por roteamento adequado.

**Passos Específicos**:
1. **Seleção da Biblioteca**:
   - React Router v6 (mais compatível com React 19)
   - Alternativa: TanStack Router se preferir tipo-safe

2. **Configuração Básica**:
   - Criar `src/routes.tsx` com definição de rotas:
     ```typescript
     const routes = [
       { path: '/', element: <Dashboard /> },
       { path: '/customers', element: <CustomersLayout /> },
       { path: '/customers/:id', element: <CustomerDetail /> },
       // ... outras rotas
     ];
     ```
   - Envolver App em `<BrowserRouter>` no main.tsx
   - Substituir controle `activeScreen` por `useNavigate()` e `<Outlet />`

3. **Migração de Estado de Navegação**:
   - Remover estado `activeScreen` do App.tsx
   - Usar `useLocation()` para determinar tela atual quando necessário
   - Implementar navegação programática com `navigate('/path')`
   - Preservar estado de rolagem/scroll se necessário (useScrollRestoration)

4. **Benefícios**:
   - URLs compartilháveis e bookmarkáveis
   - Botão voltar/avançar do navegador funcionando
   - Melhor experiência para deep links
   - Preparação para code splitting por rota

### Fase 9: Limpeza Final
**Objetivo**: Remover artefatos de desenvolvimento e melhorar qualidade geral.

**Passos Específicos**:
1. **Remoção de console.log**:
   - Busca global por `console.log` (excluir intencionalmente deixados para debug)
   - Substituir por logger condicional se necessário (ex: apenas em desenvolvimento)
   - Verificar especialmente em:
     * Funções de fetch
     * Event handlers
     * Efeitos useEffect

2. **Padronização de Imports**:
   - Ordenar imports alphabetically por tipo (React, bibliotecas, componentes locais)
   - Remover imports não utilizados com `npm run lint` (se ESLint configurado)

3. **Verificação de Build**:
   - Executar `npm run build` para garantir produção sem erros
   - Verificar tamanho do bundle não aumentou significativamente
   - Testar rotas críticas em modo de produção local

### Ordem de Execução Recomendada
1. **Fase 1** (Higiene Estrutural) - Base segura para outras mudanças
2. **Fase 9** (Limpeza console.log) - Reduz ruido durante desenvolvimento
3. **Fase 2** (Segurança) - Crítica para proteção do sistema
4. **Fase 3** (Tipagem) - Facilita todas as mudanças subsequentes
5. **Fase 4** (API Centralizada) - Simplifica Fase 5 e 6
6. **Fase 5** (Performance) - Melhor experiência imediata
7. **Fase 6** (Contextos) - Reduz drasticamente complexidade do App.tsx
8. **Fase 7** (Templates) - Remove código frágil e perigoso
9. **Fase 8** (Roteamento) - Melhora usabilidade e prepara para crescimento
10. **Fase 9** (Build final) - Validação completa

### Dependências e Riscos
- **Dependência Crítica**: Fase 1 deve ser concluída antes de Fase 6 (contextos) para evitar importações quebradas
- **Risco de Regressão**: Fase 2 requer teste cuidadoso para não quebrar fluxo de configuração
- **Esforço Concentrado**: Fases 3, 4 e 6 são as mais trabalhosas mas trazem maior retorno
- **Validação Contínua**: Cada fase deve incluir teste manual das funcionalidades afetadas
- **Backup Recomendado**: Criar branch no git antes de cada fase maior para facilitar rollback se necessário

Este plano fornece um roteamento detalhado, passo a passo, para abordar os problemas identificados mantendo a funcionalidade existente. Cada fase pode ser validada independentemente antes de prosseguir para a próxima, minimizando riscos e permitindo ajustes conforme o avanço.