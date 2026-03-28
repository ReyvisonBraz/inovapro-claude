# Estrutura do Frontend

## Ponto de Entrada

### main.tsx
- Renderiza `<App />` dentro de `ErrorBoundary` e provedor de Toast
- Monta no elemento `#root` do `index.html`

### App.tsx (Componente Principal)
- **3.257 linhas** - arquivo monolitico que centraliza toda a aplicacao
- Gerencia 50+ estados via `useState`
- Controla navegacao via `activeScreen` (string)
- Passa dados para componentes filhos via props drilling
- Contem funcoes de CRUD para todas as entidades

## Organizacao de Pastas

```
src/
├── App.tsx              # Orquestrador central (MONOLITICO)
├── main.tsx             # Entry point React
├── index.css            # Tailwind + estilos custom
├── types.ts             # Interfaces TypeScript
│
├── components/          # 53+ componentes
│   ├── [raiz]           # Componentes de tela principais
│   ├── audit/           # Logs de auditoria
│   ├── customers/       # Modulo de clientes
│   ├── dashboard/       # Modulo de dashboard
│   ├── inventory/       # Modulo de estoque
│   ├── layout/          # Layout (sidebar)
│   ├── modals/          # 12 modais
│   ├── payments/        # Modulo de pagamentos
│   ├── service-orders/  # Modulo de OS
│   ├── settings/        # 10 paginas de configuracao
│   ├── transactions/    # Modulo de transacoes
│   └── ui/              # 7 componentes UI genericos
│
├── hooks/               # 5 custom hooks (NAO consumidos)
├── services/            # Cliente HTTP (api.ts)
├── lib/                 # Utilitarios
├── contexts/            # [VAZIO - Fase 2]
├── pages/               # [VAZIO - Fase 2]
├── layouts/             # [VAZIO - Fase 2]
└── test/                # [VAZIO - Fase 4]
```

## Navegacao

### Sistema Atual

A navegacao usa uma string `activeScreen` no estado do App.tsx:

```typescript
type Screen = "dashboard" | "transactions" | "customers" | "payments"
            | "serviceOrders" | "inventory" | "reports" | "settings"
            | "statusPage" | "auditLogs";
```

- Sidebar muda `activeScreen` ao clicar
- App.tsx renderiza o componente correspondente via condicional
- **Sem URLs reais** (tudo e `/`)
- **Sem deep links** (nao da para compartilhar link direto)
- **Botao voltar do browser nao funciona**

### Sistema Planejado (Fase 2)

- React Router v6 com rotas definidas
- URLs reais (`/dashboard`, `/clientes`, `/os/123`)
- Deep links funcionais
- Historico do browser funcional

## Estilizacao

### Tailwind CSS 4

- Configurado via `@tailwindcss/vite` plugin
- Classes utility-first em todos os componentes
- `clsx` + `tailwind-merge` para composicao de classes

### Classes Customizadas (index.css)

| Classe | Efeito |
|--------|--------|
| `.glass` | Fundo translucido com blur |
| `.glass-card` | Card com efeito glass |
| `.glass-input` | Input com efeito glass |
| `.glass-modal` | Modal com efeito glass |
| `.neon-glow` | Brilho neon no texto |
| `.neon-border` | Borda com efeito neon |

### Tema

- **Fundo:** Escuro (dark theme)
- **Cor primaria:** #1152d4 (azul)
- **Fonte:** Manrope (Google Fonts)
- **Tamanho da fonte:** Customizavel via localStorage

## Estado Global

### Problema Atual

Todo o estado da aplicacao esta centralizado no App.tsx com useState:

```typescript
// Exemplos dos 50+ estados no App.tsx
const [user, setUser] = useState(null);
const [transactions, setTransactions] = useState([]);
const [customers, setCustomers] = useState([]);
const [clientPayments, setClientPayments] = useState([]);
const [serviceOrders, setServiceOrders] = useState([]);
const [inventoryItems, setInventoryItems] = useState([]);
const [settings, setSettings] = useState({});
const [activeScreen, setActiveScreen] = useState("dashboard");
// ... e muitos mais
```

### Consequencias

- App.tsx tem 3.257 linhas
- Qualquer mudanca de estado re-renderiza muitos componentes
- Props drilling profundo (App > Tela > Subtela > Modal)
- Dificil de testar e manter

### Solucao Planejada (Fase 2)

Migrar para React Context API:
- `AuthContext` - usuario, token, permissoes
- `TransactionsContext` - dados de transacoes
- `CustomersContext` - dados de clientes
- `UIStateContext` - tema, navegacao, modais
- `SettingsContext` - configuracoes da aplicacao
