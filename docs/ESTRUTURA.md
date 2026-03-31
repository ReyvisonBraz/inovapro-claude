# Estrutura do Projeto

O projeto segue uma arquitetura baseada em React com Vite, utilizando TypeScript e Tailwind CSS. A separação de responsabilidades é um princípio chave.

## Diretórios Principais (`/src`)

- `/components/`: Componentes visuais da aplicação.
  - `/modals/`: Modais do sistema (confirmações, formulários, avisos).
  - `/settings/`: Componentes relacionados às configurações do sistema.
  - `/ui/`: Componentes base e reutilizáveis (ex: botões, inputs, toasts).
- `/hooks/`: Hooks customizados contendo a lógica de negócios e chamadas de dados (ex: `useCustomers`, `useTransactions`, `useExportData`).
- `/store/`: Gerenciamento de estado global utilizando Zustand (ex: `useAppStore`, `useModalStore`).
- `/lib/`: Funções utilitárias e helpers (ex: `utils.ts`, formatação de moeda, `printUtils.ts`).
- `types.ts`: Definições de interfaces e tipos globais do TypeScript.

## Fluxo de Dados
1. **Estado Global:** Gerenciado pelo Zustand (`/store`).
2. **Lógica de Negócios:** Isolada em Custom Hooks (`/hooks`).
3. **Apresentação:** Componentes React puros que consomem os hooks e stores (`/components`).
