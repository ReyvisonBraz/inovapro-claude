# Arquitetura Técnica - FINANCEIRO INOVA

## 1. Visão Geral da Arquitetura
O sistema segue uma arquitetura **Monolítica Modular** no frontend (React) com um backend **BFF (Backend for Frontend)** leve usando Express e SQLite.

---

## 2. Estrutura do Projeto

### 2.1 Frontend (`/src`)
A organização segue o princípio de **Separação de Responsabilidades (SoC)**:

- **`/pages/`**: Telas principais da aplicação (Dashboard, Vendas, Clientes, etc.).
- **`/components/`**: Camada de Apresentação (UI).
    - `/layout/`: Componentes de estrutura (Sidebar, Header, MobileNav, **GlobalModals**).
    - `/modals/`: Janelas sobrepostas (formulários de criação, confirmações de exclusão, avisos).
    - `/settings/`: Componentes específicos da tela de configurações.
    - `/ui/`: Componentes base reutilizáveis (Botões, Inputs, Cards, Toasts, Paginação).
    - `/service-orders/`: Sub-componentes para a gestão de Ordens de Serviço (Filtros, Listas, Modais específicos).
- **`/hooks/`**: Camada de Lógica de Negócios. Custom hooks que encapsulam chamadas de API, transformações de dados e lógicas complexas (ex: `useCustomers`, `useTransactions`, `useExportData`).
- **`/store/`**: Camada de Estado Global. Utiliza **Zustand** para gerenciar estados compartilhados (ex: `useAppStore` para UI, `useFormStore` para dados temporários de formulários, `useModalStore` para controle de modais).
- **`/lib/`**: Camada de Utilitários. Funções puras, helpers e configurações (ex: `utils.ts` para formatação, `printUtils.ts` para impressão).
- **`/services/`**: Camada para integrações externas (ex: Gemini API).
- **`types.ts`**: Contratos de dados. Definições de interfaces TypeScript globais.

### 2.2 Backend (Raiz)
- **`server.ts`**: Ponto de entrada do servidor Express. Gerencia rotas da API, conexão com SQLite (`better-sqlite3`) e serve o frontend em produção.
- **`prisma/`**: Esquema e migrações do banco de dados (se aplicável).

---

## 3. Fluxo de Dados (Data Flow)
O projeto segue um fluxo unidirecional e previsível:

1.  **Ação do Usuário:** Interação na UI (ex: clica em "Salvar").
2.  **Chamada ao Hook/Store:** O componente dispara uma função de lógica (ex: `addCustomer` do hook `useCustomers`).
3.  **Requisição API:** O hook faz uma chamada HTTP para o backend (`/api/...`).
4.  **Processamento no Servidor:** O `server.ts` valida os dados via **Zod** e executa a operação no SQLite.
5.  **Resposta e Atualização:** O servidor retorna o resultado; o hook atualiza o estado local ou global (Zustand).
6.  **Re-renderização:** O React atualiza apenas os componentes afetados pela mudança de estado.

---

## 4. Banco de Dados e Persistência
Atualmente, o projeto utiliza **SQLite** (`better-sqlite3`) para persistência local. O esquema foi desenhado para ser compatível com SQL padrão, facilitando a migração futura para PostgreSQL (Supabase).

### Principais Tabelas:
- `transactions`: Movimentações financeiras.
- `customers`: Cadastro de clientes.
- `client_payments`: Contas a receber/pagar de clientes.
- `service_orders`: Gestão de Ordens de Serviço.
- `inventory_items`: Controle de estoque.
- `users`: Controle de usuários e permissões.
- `audit_logs`: Registro de atividades do sistema.
- `settings`: Configurações globais da aplicação.

---

## 5. Segurança e Auditoria
- **Autenticação:** Sistema de login baseado em usuários locais com níveis de permissão (Dono, Gerente, Funcionário).
- **Auditoria:** Todas as ações críticas (criar, editar, excluir) geram um registro em `audit_logs` para rastreabilidade.
- **Validação:** Todas as entradas de dados na API são validadas via **Zod** no servidor.

---
**Versão:** 1.0.0
**Data:** Abril de 2026
