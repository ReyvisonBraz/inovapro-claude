# Stack Tecnologica

## Frontend

| Tecnologia | Versao | Proposito |
|------------|--------|-----------|
| React | 19.0.0 | Biblioteca de UI |
| TypeScript | 5.8.2 | Tipagem estatica |
| Vite | 6.2.0 | Build tool e dev server |
| Tailwind CSS | 4.1.14 | Estilizacao utility-first |
| Motion (Framer) | 12.23.24 | Animacoes e transicoes |
| Lucide React | 0.546.0 | Biblioteca de icones |
| Recharts | 3.7.0 | Graficos e dashboards |
| date-fns | 4.1.0 | Manipulacao de datas |
| clsx | 2.1.1 | Composicao de classes CSS |
| tailwind-merge | 3.5.0 | Merge de classes Tailwind |
| html2canvas | 1.4.1 | Captura de tela / impressao |
| qrcode.react | 4.2.0 | Geracao de QR code PIX |

## Backend

| Tecnologia | Versao | Proposito |
|------------|--------|-----------|
| Express.js | 4.21.2 | Framework HTTP |
| better-sqlite3 | 12.4.1 | Banco de dados embarcado |
| jsonwebtoken | 9.0.3 | Autenticacao JWT |
| bcryptjs | 3.0.3 | Hash de senhas |
| express-rate-limit | 8.3.1 | Protecao contra brute-force |
| Zod | 4.3.6 | Validacao de schemas |
| dotenv | 17.2.3 | Variaveis de ambiente |

## Inteligencia Artificial

| Tecnologia | Versao | Proposito |
|------------|--------|-----------|
| @google/genai | 1.45.0 | Google Gemini AI para analise tecnica |

## Ferramentas de Desenvolvimento

| Tecnologia | Versao | Proposito |
|------------|--------|-----------|
| tsx | 4.21.0 | Execucao TypeScript direto |
| @vitejs/plugin-react | 5.0.4 | Suporte React no Vite |
| @tailwindcss/vite | 4.1.14 | Integracao Tailwind com Vite |
| autoprefixer | 10.4.21 | Prefixos CSS automaticos |

## Banco de Dados

| Atual | Futuro |
|-------|--------|
| SQLite (better-sqlite3) | PostgreSQL (Supabase) |
| Arquivo local `finance.db` | Cloud sa-east-1 (Sao Paulo) |
| WAL mode habilitado | Row Level Security |
| Foreign keys ativas | Prisma ORM |

## Scripts Disponiveis

```bash
npm run dev        # Inicia servidor de desenvolvimento (Express + Vite)
npm run build      # Build de producao (Vite gera /dist)
npm run preview    # Preview do build
npm run clean      # Remove /dist
npm run lint       # Verifica tipos TypeScript (tsc --noEmit)
```

## Fontes e Estilo Visual

- **Fonte principal:** Manrope (Google Fonts)
- **Tema:** Escuro com acentos neon
- **Cor primaria:** #1152d4 (azul)
- **Efeitos:** Glass-morphism, neon glow, bordas luminosas
- **Classes customizadas:** `.glass`, `.glass-card`, `.glass-input`, `.glass-modal`, `.neon-glow`, `.neon-border`
