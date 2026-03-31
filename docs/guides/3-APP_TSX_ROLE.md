# Guia Rápido: O Papel do App.tsx

Mesmo após a grande refatoração que fizemos para reduzir o tamanho do `App.tsx`, ele ainda possui um papel fundamental e indispensável no projeto.

Ele deixou de ser um arquivo "faz-tudo" (onde ficavam as lógicas de exportação, cálculos, etc.) e passou a atuar como o **Orquestrador Principal** (ou *Controller* principal) da aplicação.

Aqui estão as **5 funções principais** que o `App.tsx` ainda desempenha no projeto atual:

### 1. Gerenciador de Autenticação (Auth Wrapper)
Ele é a primeira barreira da aplicação. O `App.tsx` verifica se o usuário está autenticado (`isAuthenticated`). Se não estiver, ele bloqueia o acesso ao sistema e renderiza a tela de `Login`. Se estiver, ele libera o acesso ao layout principal.

### 2. Orquestrador de Layout (Layout Container)
Ele define a estrutura "casca" da sua aplicação. É no `App.tsx` que montamos o esqueleto da interface, posicionando:
* A `Sidebar` (menu lateral para desktop).
* O `Header` (cabeçalho superior).
* O `MobileNav` (menu inferior para celulares).
* A área central dinâmica onde o conteúdo muda.

### 3. Roteamento de Telas (Screen Management)
Como o projeto parece usar um roteamento baseado em estado (através da variável `activeScreen` do Zustand ou hook), o `App.tsx` atua como o **Roteador**. Ele possui um grande `switch` ou blocos de `if/else` (ou um dicionário de componentes) que decide qual tela renderizar no centro do layout:
* Se `activeScreen === 'dashboard'`, renderiza o `<Dashboard />`.
* Se `activeScreen === 'customers'`, renderiza o `<Customers />`.
* E assim por diante para Inventário, Ordens de Serviço, Configurações, etc.

### 4. Contêiner de Modais Globais
Existem modais (janelas sobrepostas) que precisam ser chamados de qualquer lugar do sistema, como:
* `<DeleteConfirmationModal />` (Confirmar exclusão de algo).
* `<AddTransactionModal />` (Nova transação).
* `<CustomerModal />` (Adicionar/Editar cliente).
* `<PasswordModal />` ou `<WarningModal />`.

Esses modais ficam no `App.tsx` porque eles precisam estar no nível mais alto da árvore do React (DOM) para sobrepor toda a interface corretamente e manter o estado global (gerenciado pelo `useModalStore`).

### 5. Ponto de Integração de Estados Globais
Ele é o ponto onde os principais *Hooks* de dados (`useCustomers`, `useTransactions`, `useServiceOrders`) e *Stores* do Zustand (`useAppStore`, `useModalStore`) se encontram para inicializar a aplicação. Ele escuta as mudanças globais e repassa as informações ou funções necessárias para os componentes filhos.

---

**Resumo:**
Antes, o `App.tsx` era o "operário" que fazia todo o trabalho pesado (cálculos, formatações, exportações). Agora, ele atua como o **"Maestro"**: ele não toca os instrumentos, mas organiza onde cada componente deve ficar, quem pode entrar (Login) e qual "música" (Tela) deve ser tocada no momento.
