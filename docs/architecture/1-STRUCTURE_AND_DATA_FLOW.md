# Estrutura e Fluxo de Dados

Este documento descreve a organização técnica e como as informações circulam no sistema FinanceFlow.

## 1. Estrutura de Diretórios (`/src`)

A separação de responsabilidades é o pilar desta arquitetura, garantindo manutenibilidade e escalabilidade.

### Frontend (`/src`)

*   **`/components/`**: Camada de Apresentação (UI).
    *   `/modals/`: Janelas sobrepostas (formulários de criação, confirmações de exclusão, avisos).
    *   `/settings/`: Componentes específicos da tela de configurações.
    *   `/ui/`: Componentes base reutilizáveis (Botões, Inputs, Cards, Toasts, Paginação).
    *   `/service-orders/`: Sub-componentes para a gestão de Ordens de Serviço (Filtros, Listas, Modais específicos).
*   **`/hooks/`**: Camada de Lógica de Negócios. Custom hooks que encapsulam chamadas de API, transformações de dados e lógicas complexas (ex: `useCustomers`, `useTransactions`, `useExportData`).
*   **`/store/`**: Camada de Estado Global. Utiliza **Zustand** para gerenciar estados compartilhados (ex: `useAppStore` para UI, `useFormStore` para dados temporários de formulários, `useModalStore` para controle de modais).
*   **`/lib/`**: Camada de Utilitários. Funções puras, helpers e configurações (ex: `utils.ts` para formatação, `printUtils.ts` para impressão).
*   **`/services/`**: (Opcional) Camada para integrações externas (ex: Gemini API).
*   **`types.ts`**: Contratos de dados. Definições de interfaces TypeScript globais.

### Backend (Raiz)

*   **`server.ts`**: Ponto de entrada do servidor Express. Gerencia rotas da API, conexão com SQLite (`better-sqlite3`) e serve o frontend em produção.
*   **`prisma/`**: (Se presente) Esquema e migrações do banco de dados.

## 2. Fluxo de Dados (Data Flow)

O projeto segue um fluxo unidirecional e previsível:

1.  **Ação do Usuário:** Interação na UI (ex: clica em "Salvar").
2.  **Chamada ao Hook/Store:** O componente dispara uma função de lógica (ex: `addCustomer` do hook `useCustomers`).
3.  **Requisição API:** O hook faz uma chamada HTTP para o backend (`/api/...`).
4.  **Processamento no Servidor:** O `server.ts` valida os dados e executa a operação no SQLite.
5.  **Resposta e Atualização:** O servidor retorna o resultado; o hook atualiza o estado local ou global (Zustand).
6.  **Re-renderização:** O React atualiza apenas os componentes afetados pela mudança de estado.

## 3. O Papel do `App.tsx` (Orquestrador)

Após a refatoração, o `App.tsx` atua como o **Orquestrador Principal**:

*   **Auth Wrapper:** Gerencia o estado de login e renderiza o `<Login />` se necessário.
*   **Layout Container:** Define a estrutura base (Sidebar, Header, MobileNav).
*   **Roteador:** Gerencia a navegação entre as telas principais via `activeScreen`.
*   **Contêiner de Modais Globais:** Centraliza modais que precisam de visibilidade em todo o sistema.
*   **Ponto de Integração:** Inicializa hooks globais e sincroniza estados entre componentes.
