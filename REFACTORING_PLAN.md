# Plano de Refatoração: Projeto FinanceFlow (App.tsx Monolítico)

Este documento detalha a estratégia passo a passo para refatorar o arquivo `App.tsx` (atualmente com mais de 3.200 linhas) de forma segura, incremental e sem quebrar as funcionalidades existentes.

## Princípios da Refatoração
1. **Um passo de cada vez:** Nenhuma mudança drástica será feita de uma só vez.
2. **Testes contínuos:** Após cada fase (ou subfase), o aplicativo deve ser testado para garantir que a interface renderiza e as funções continuam operando.
3. **TypeScript como guia:** Usaremos os erros de tipagem do TypeScript para garantir que todas as propriedades (`props`) e importações estejam corretas após movermos o código.

---

## Fase 1: Limpeza Inicial e Extração de Utilitários (Risco: Baixo)
**Objetivo:** Reduzir o tamanho do `App.tsx` removendo código estático, tipagens e funções puras que não dependem do estado do React.

*   **Passo 1.1:** Mover a função gigante `handlePrintBlankForm` (que contém muito HTML/CSS em template string) para um arquivo utilitário dedicado, ex: `src/lib/printUtils.ts`.
*   **Passo 1.2:** Verificar se todas as interfaces (ex: `Transaction`, `Screen`, `Customer`, etc.) estão devidamente isoladas no arquivo `src/types.ts` (já existente) e remover qualquer tipagem solta no `App.tsx`.
*   **Passo 1.3:** Mover lógicas de formatação ou cálculos puros para `src/lib/utils.ts`.
*   **Momento de Teste:** Verificar se a aplicação compila sem erros de importação e testar a função de "Imprimir Ficha em Branco".

## Fase 2: Extração de Custom Hooks (Risco: Médio)
**Objetivo:** O `App.tsx` possui dezenas de `useState` e funções `fetch...` (ex: `fetchCustomers`, `fetchTransactions`, `fetchServiceOrders`). Vamos separar a lógica de negócio (estado + chamadas de API) da camada visual.

*   **Passo 2.1:** Criar `src/hooks/useCustomers.ts` para gerenciar `customers`, `customersPage`, `fetchCustomers`, `handleAddCustomer`, etc.
*   **Passo 2.2:** Criar `src/hooks/useServiceOrders.ts` para gerenciar OS, status, marcas, modelos e tipos de equipamento.
*   **Passo 2.3:** Criar `src/hooks/useTransactions.ts` para gerenciar transações e pagamentos de clientes.
*   **Passo 2.4:** Criar `src/hooks/useAuth.ts` para gerenciar `currentUser`, `isAuthenticated`, `users` e `auditLogs`.
*   **Momento de Teste:** Após extrair cada hook, injetá-lo no `App.tsx` (ex: `const { customers, fetchCustomers } = useCustomers();`). Testar o carregamento de dados e as operações de CRUD (Criar, Ler, Atualizar, Deletar) da respectiva entidade.

## Fase 3: Gerenciamento de Estado Global (Risco: Médio-Alto)
**Objetivo:** Evitar o "Prop Drilling" (passar propriedades por múltiplos níveis de componentes). Estados como `settings`, `fontSize`, `isSidebarOpen` e `currentUser` são usados em quase todo o app.

*   **Passo 3.1:** Criar um contexto global usando a Context API do React ou Zustand (ex: `src/contexts/AppContext.tsx` ou `src/store/useAppStore.ts`).
*   **Passo 3.2:** Mover os estados de UI globais (`isSidebarOpen`, `showNotifications`, `fontSize`, `settings`) para este estado global.
*   **Momento de Teste:** Navegar pelo app, abrir/fechar a sidebar, alterar o tamanho da fonte e verificar se as configurações globais refletem em todos os componentes.

## Fase 4: Componentização de Modais e Filtros (Risco: Médio)
**Objetivo:** O `App.tsx` provavelmente gerencia a abertura, fechamento e o estado interno de dezenas de modais.

*   **Passo 4.1:** Consolidar o gerenciamento de modais. Em vez de ter dezenas de `isAddingCustomer`, `isAddingServiceOrder`, criar um gerenciador de modais centralizado ou mover o controle de abertura para dentro dos próprios componentes de página.
*   **Passo 4.2:** Extrair componentes de filtro complexos que estão soltos no `App.tsx`.
*   **Momento de Teste:** Abrir, preencher e fechar cada modal afetado para garantir que o estado é limpo corretamente e a ação (salvar/excluir) funciona.

## Fase 5: Roteamento e Divisão de Páginas (Risco: Alto)
**Objetivo:** Substituir o roteamento manual (`activeScreen === 'dashboard'`) por uma biblioteca de roteamento real, dividindo o monólito em páginas independentes.

*   **Passo 5.1:** Instalar e configurar o `react-router-dom`.
*   **Passo 5.2:** Criar a pasta `src/pages/` e mover o conteúdo principal de cada tela (Dashboard, Clientes, OS, Estoque, Configurações) para arquivos dedicados.
*   **Passo 5.3:** Transformar o `App.tsx` em um simples provedor de rotas e layouts (Sidebar + Topbar + `<Outlet />`).
*   **Momento de Teste:** Navegar por todas as rotas da aplicação usando a barra lateral. Verificar se os parâmetros de URL (ex: `?osId=123`) funcionam corretamente no novo sistema de rotas.

---

## Como vamos prosseguir?
Trabalharemos de forma iterativa. Eu farei as modificações de um passo, avisarei você, e você poderá testar no preview. Só avançaremos para o próximo passo quando você confirmar que a etapa atual está 100% funcional.
