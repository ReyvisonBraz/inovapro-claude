# Visão Geral do Projeto e Arquitetura

Este documento descreve a estrutura atual do projeto, as decisões de arquitetura e o guia para migração futura para Supabase.

## Arquitetura de Software

O projeto segue uma arquitetura **Monolítica Modular** no frontend (React) com um backend **BFF (Backend for Frontend)** leve usando Express e SQLite.

### Estrutura de Pastas (Refatoração)

Para melhorar a manutenibilidade e escalabilidade, o código está sendo dividido da seguinte forma:

```
src/
├── components/         # Componentes reutilizáveis de UI (Botões, Inputs, Cards)
├── features/           # Funcionalidades do sistema divididas por domínio
│   ├── dashboard/      # Widgets e lógica do painel
│   ├── transactions/   # Gestão de transações
│   ├── customers/      # Gestão de clientes
│   ├── reports/        # Relatórios e gráficos
│   └── settings/       # Configurações do sistema
├── hooks/              # Custom Hooks para lógica de estado e API
├── types/              # Definições de tipos TypeScript globais
├── utils/              # Funções utilitárias e formatadores
├── App.tsx             # Componente raiz (Roteamento e Layout principal)
└── main.tsx            # Ponto de entrada
```

### Padrões Adotados

1.  **Separação de Responsabilidades:** Componentes de UI são separados da lógica de negócios (Hooks).
2.  **Tipagem Forte:** Uso extensivo de TypeScript para garantir segurança de tipos.
3.  **Componentização:** Quebra de telas grandes em componentes menores e focados.

## Banco de Dados e Migração para Supabase

Atualmente, o projeto utiliza **SQLite** (`better-sqlite3`) para persistência local. O esquema foi desenhado para ser compatível com SQL padrão, facilitando a migração.

### Esquema Atual (SQLite)

*   `transactions`: Movimentações financeiras.
*   `customers`: Cadastro de clientes.
*   `client_payments`: Contas a receber/pagar de clientes.
*   `settings`: Configurações globais.
*   `users`: (Novo) Controle de usuários e permissões.
*   `audit_logs`: (Novo) Registro de atividades do sistema.

### Guia de Migração para Supabase (PostgreSQL)

O Supabase utiliza PostgreSQL. Para migrar:

1.  **Schema:** As tabelas atuais podem ser recriadas no Postgres com poucas alterações (ex: `INTEGER PRIMARY KEY AUTOINCREMENT` vira `SERIAL PRIMARY KEY` ou `IDENTITY`).
2.  **Tipos de Dados:**
    *   `TEXT` (SQLite) -> `VARCHAR` ou `TEXT` (Postgres).
    *   `REAL` (SQLite) -> `DECIMAL` ou `NUMERIC` (Postgres) para valores monetários.
    *   `DATETIME` (SQLite) -> `TIMESTAMPTZ` (Postgres).
3.  **Conexão:** Substituir `better-sqlite3` pelo cliente oficial `@supabase/supabase-js`.
4.  **Autenticação:** O sistema atual de usuários pode ser substituído pelo **Supabase Auth** para maior segurança, ou mantido como uma tabela customizada se preferir controle total local.

## Funcionalidades de Usuários e Auditoria

O sistema agora suporta múltiplos usuários com níveis de permissão (Dono, Gerente, Funcionário). Todas as ações críticas (criar, editar, excluir) geram um registro em `audit_logs` para rastreabilidade.

---
**Nota:** Este arquivo deve ser mantido atualizado conforme o projeto evolui.
