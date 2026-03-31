# Arquitetura do Projeto

Este documento descreve a estrutura técnica e as decisões arquiteturais do sistema. O projeto é um SPA (Single Page Application) construído com React, TypeScript, Vite e Tailwind CSS.

## 1. Estrutura de Diretórios (`/src`)

A separação de responsabilidades é o pilar desta arquitetura.

*   **`/components/`**: Camada de Apresentação (UI). Componentes React "burros" (dumb components) ou que consomem hooks específicos.
    *   `/modals/`: Janelas sobrepostas (formulários de criação, confirmações de exclusão).
    *   `/settings/`: Componentes relacionados à tela de configurações.
    *   `/ui/`: Componentes base reutilizáveis (Botões, Inputs, Cards, Toasts).
*   **`/hooks/`**: Camada de Lógica de Negócios. Custom hooks que encapsulam chamadas de API, transformações de dados e lógicas complexas (ex: `useCustomers`, `useExportData`, `useDashboardStats`).
*   **`/store/`**: Camada de Estado Global. Utiliza Zustand para gerenciar estados que precisam ser acessados por múltiplos componentes distantes na árvore (ex: `useAppStore` para tema/sidebar, `useModalStore` para controle de modais).
*   **`/lib/`**: Camada de Utilitários. Funções puras, helpers e configurações (ex: `utils.ts` para formatação, `printUtils.ts` para geração de PDFs/impressão).
*   **`/types/`** ou `types.ts`: Contratos de dados. Definições de interfaces TypeScript que garantem a tipagem forte em toda a aplicação.

## 2. Fluxo de Dados (Data Flow)

O projeto segue um fluxo de dados unidirecional, típico do React, mas aprimorado com Zustand e Custom Hooks.

1.  **Ação do Usuário:** O usuário interage com a UI (ex: clica em "Salvar Cliente" no `CustomerModal`).
2.  **Chamada ao Hook/Store:** O componente chama uma função exposta por um custom hook (ex: `addCustomer` do `useCustomers`) ou atualiza um estado no Zustand.
3.  **Processamento/API:** O hook processa a requisição (ex: salva no banco de dados via Firebase/API).
4.  **Atualização de Estado:** O hook atualiza seu estado interno (ou o estado global do Zustand) com os novos dados.
5.  **Re-renderização:** O React detecta a mudança de estado e re-renderiza apenas os componentes que dependem daquela informação.

## 3. O Papel do `App.tsx` (Orquestrador)

Após a refatoração, o `App.tsx` deixou de ser um "faz-tudo" e assumiu o papel de **Orquestrador Principal**:

*   **Auth Wrapper:** Verifica se o usuário está logado. Se não, renderiza o `<Login />`.
*   **Layout Container:** Monta a estrutura base (Sidebar, Header, MobileNav, Área de Conteúdo).
*   **Roteador de Telas:** Decide qual componente principal renderizar com base no estado `activeScreen`.
*   **Contêiner de Modais Globais:** Renderiza os modais que precisam sobrepor toda a aplicação.
*   **Ponto de Integração:** Inicializa os hooks principais e repassa dados/funções para os componentes filhos.
