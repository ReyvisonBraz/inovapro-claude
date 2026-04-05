# Guia de Configuração para VS Code - iFix Pro

Este documento resume todas as configurações, dependências e padrões de design necessários para manter a integridade do projeto ao editá-lo localmente no VS Code.

## 🚀 Como Iniciar o Projeto Localmente

1. **Clone o projeto** e abra a pasta no VS Code.
2. **Instale as dependências**:
   ```bash
   npm install
   ```
3. **Configure as variáveis de ambiente**:
   Crie um arquivo `.env` na raiz com as chaves necessárias (ex: `GEMINI_API_KEY`).
4. **Inicie o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```

---

## 📦 Dependências Principais

### Frontend
- **React 19**: Framework principal.
- **Lucide React**: Biblioteca de ícones.
- **Motion (Framer Motion)**: Animações e transições.
- **Tailwind CSS 4**: Estilização via utilitários.
- **Zustand**: Gerenciamento de estado global.
- **Date-fns**: Manipulação de datas.
- **Recharts**: Gráficos e dashboards.
- **React Router Dom**: Navegação SPA.
- **QRCode.react**: Geração de QRCodes para ordens de serviço.

### Backend (Full-Stack)
- **Express**: Servidor API.
- **Better-SQLite3**: Banco de dados local rápido e leve.
- **TSX**: Executor de TypeScript para o servidor.
- **Zod**: Validação de esquemas e tipos.

---

## 🎨 Design System (UI/UX)

### Fontes
- **Principal**: `Manrope` (Importada via Google Fonts no `index.css`).
- **Configuração Tailwind**: `--font-sans: "Manrope", ui-sans-serif, system-ui, sans-serif;`

### Cores (Tailwind Theme)
- **Primary**: `#1152d4` (Azul vibrante para ações principais).
- **Background Dark**: `#0a0f18` (Fundo profundo).
- **Card Dark**: `#121a2b` (Fundo de cartões e modais).
- **Slate**: Tons de cinza padrão do Tailwind para textos secundários.

### Efeitos e Classes Customizadas
O projeto utiliza um estilo **Glassmorphism** e **Neon**:
- `.glass-card`: Cartões com desfoque de fundo (16px) e bordas sutis.
- `.glass-modal`: Modais com desfoque intenso (24px) e cantos arredondados (`2.5rem`).
- `.neon-glow`: Sombra externa azul suave para destaque.
- `.neon-border`: Borda com brilho sutil.

---

## 📂 Estrutura de Pastas

```text
/
├── src/
│   ├── components/       # Componentes React reutilizáveis
│   │   ├── service-orders/ # Componentes específicos de OS
│   │   └── ui/           # Componentes de interface base
│   ├── lib/              # Utilitários (ex: cn helper para Tailwind)
│   ├── services/         # Lógica de API e Banco de Dados (Frontend)
│   ├── types/            # Definições de tipos TypeScript
│   ├── App.tsx           # Componente raiz e rotas
│   ├── index.css         # Estilos globais e tema Tailwind
│   └── main.tsx          # Ponto de entrada React
├── server.ts             # Servidor Express (Backend)
├── database.sqlite       # Arquivo do banco de dados (gerado automaticamente)
├── package.json          # Scripts e dependências
└── vite.config.ts        # Configuração do Vite e Tailwind
```

---

## 🛠️ Dicas para o VS Code

1. **Extensões Recomendadas**:
   - `Tailwind CSS IntelliSense`
   - `ESLint`
   - `Prettier - Code formatter`
   - `Prisma` (opcional, para visualizar o SQLite se usar ORM, embora usemos better-sqlite3 diretamente).
2. **Configuração de Cor**: O tema do editor recomendado para combinar com o projeto é o `One Dark Pro` ou `Tokyo Night`.

---

*Documento gerado automaticamente para suporte ao desenvolvimento local.*
