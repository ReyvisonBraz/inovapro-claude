# Documentação de Estrutura do Sistema - FinanceFlow OS

Este documento descreve a arquitetura, tecnologias e padrões de desenvolvimento aplicados no projeto **FinanceFlow OS**.

## 1. Tecnologias e Linguagens

O sistema é construído utilizando uma stack moderna e performática:

- **Linguagem Principal:** [TypeScript](https://www.typescriptlang.org/) (TSX) - Garante segurança de tipos e melhor experiência de desenvolvimento.
- **Framework Frontend:** [React](https://react.dev/) (Vite) - Biblioteca base para construção da interface reativa.
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/) - Framework CSS utilitário para design rápido, consistente e responsivo.
- **Animações:** [Framer Motion](https://www.framer.com/motion/) - Utilizado para transições de tela, modais e feedback visual fluido.
- **Ícones:** [Lucide React](https://lucide.dev/) - Conjunto de ícones SVG consistentes e leves.
- **Manipulação de Datas:** [date-fns](https://date-fns.org/) - Biblioteca robusta para formatação e cálculos de datas.
- **Backend (API):** [Express](https://expressjs.com/) (Node.js) - Servidor para persistência de dados e lógica de negócio.

## 2. Arquitetura de Pastas

A estrutura segue o padrão de organização por responsabilidades:

```text
/
├── src/
│   ├── components/         # Componentes UI reutilizáveis e módulos específicos
│   │   ├── customers/      # Módulo de Clientes
│   │   ├── settings/       # Módulo de Configurações e Usuários
│   │   ├── Inventory.tsx   # Gerenciamento de Estoque
│   │   └── ServiceOrders.tsx # Gestão de Ordens de Serviço
│   ├── lib/                # Funções utilitárias e configurações de bibliotecas
│   │   └── utils.ts        # Utilitários de formatação e Tailwind Merge
│   ├── types.ts            # Definições globais de interfaces TypeScript
│   ├── App.tsx             # Componente Raiz (Orquestrador de Estado e Telas)
│   ├── main.tsx            # Ponto de entrada do React
│   └── index.css           # Estilos globais e diretivas Tailwind
├── server.ts               # Servidor Express (API Backend)
└── package.json            # Dependências e scripts do projeto
```

## 3. Lógica e Fluxo de Dados

### Gestão de Estado (State Management)
O sistema utiliza o estado local do React (`useState`, `useEffect`) de forma centralizada no `App.tsx`. Este componente atua como o "Cérebro" da aplicação, mantendo as listas globais de:
- Transações Financeiras
- Clientes
- Pagamentos/Parcelamentos
- Estoque
- Configurações do Sistema

### Comunicação entre Componentes
A comunicação segue o padrão **Props Down, Callbacks Up**:
1. **Dados:** O `App.tsx` passa os dados necessários para os componentes filhos via `props`.
2. **Ações:** Os componentes filhos (ex: `Inventory`) recebem funções de callback (ex: `onAddItem`, `onDeleteItem`) para notificar o pai sobre mudanças, que então atualiza o estado global e a API.

### Navegação (Screen Switching)
Em vez de uma biblioteca de rotas complexa, o sistema utiliza um estado simples de `activeScreen`. Isso permite transições instantâneas e mantém o estado da aplicação preservado entre as trocas de tela, ideal para um sistema de gestão interna (ERP/OS).

## 4. Integração com API

O frontend comunica-se com o `server.ts` através de chamadas `fetch`.
- **Persistência:** Toda criação, edição ou exclusão é enviada ao servidor para garantir que os dados sejam salvos permanentemente.
- **Sincronização:** Ao carregar a aplicação ou realizar ações críticas, o estado é sincronizado com o banco de dados via endpoints `/api/*`.

## 5. Boas Práticas Aplicadas

- **Tipagem Estrita:** Uso exaustivo de `interfaces` no `types.ts` para evitar erros de runtime e facilitar refatorações.
- **Componentização:** Divisão da interface em partes menores e especializadas, facilitando a manutenção.
- **DRY (Don't Repeat Yourself):** Funções de formatação de moeda (`formatCurrency`) e datas são centralizadas no `lib/utils.ts`.
- **Design Responsivo:** Uso de classes utilitárias do Tailwind com prefixos `sm:`, `md:`, `lg:` para garantir que o sistema funcione em desktops, tablets e smartphones.
- **Acessibilidade e UX:**
    - Feedback visual em botões (hover, active).
    - Modais com backdrop blur para foco na tarefa.
    - Skeleton loaders ou estados de carregamento para melhor percepção de performance.
- **Segurança:**
    - Proteção de áreas críticas (Configurações) via senha.
    - Controle de permissões baseado em cargos (`owner`, `manager`, `employee`).

## 6. Padrões de UI/UX

O sistema adota uma estética **"Glassmorphism Dark"**:
- **Cores:** Paleta baseada em tons de Slate e Zinc com acentos em Primary (Azul/Indigo).
- **Bordas:** Arredondamento generoso (`rounded-2xl`) para um visual moderno e amigável.
- **Transparência:** Uso de `bg-white/5` e `backdrop-blur` para criar profundidade e hierarquia visual.
