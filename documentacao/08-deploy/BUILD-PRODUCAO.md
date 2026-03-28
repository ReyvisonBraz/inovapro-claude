# Build de Producao

## Processo de Build

### 1. Build do Frontend

```bash
npm run build
```

O Vite compila o React + TypeScript e gera arquivos otimizados em `/dist`:

```
dist/
├── index.html          # HTML principal
├── assets/
│   ├── index-[hash].js  # JavaScript minificado
│   └── index-[hash].css # CSS minificado
└── ...
```

### 2. Executar em Producao

```bash
NODE_ENV=production tsx server/index.ts
```

Ou com um process manager:

```bash
NODE_ENV=production npx pm2 start server/index.ts --interpreter tsx
```

### Diferenca Dev vs Producao

| Aspecto | Desenvolvimento | Producao |
|---------|-----------------|----------|
| Frontend | Vite middleware (HMR) | Static files de /dist |
| Build | On-the-fly | Pre-compilado |
| Source maps | Sim | Nao |
| Minificacao | Nao | Sim |
| Erro detalhado | Sim | Generico |
| Performance | Normal | Otimizada |

## Fluxo em Producao

```
Browser → Express (porta 3000)
            ├── /api/* → Rotas do backend
            └── /* → express.static("dist")
                      └── Fallback → dist/index.html (SPA)
```

O Express detecta `NODE_ENV=production` e:
1. Nao cria Vite dev server
2. Serve arquivos estaticos de `/dist`
3. Retorna `index.html` para todas as rotas nao-API (SPA routing)

## Verificacao do Build

```bash
# 1. Build
npm run build

# 2. Verificar se /dist foi criado
ls dist/

# 3. Preview (teste local do build)
npm run preview

# 4. Testar em modo producao real
NODE_ENV=production tsx server/index.ts
```

## Otimizacoes do Vite

O build de producao inclui:
- **Tree shaking** - Remove codigo nao utilizado
- **Code splitting** - Divide em chunks otimizados
- **Minificacao** - JavaScript e CSS compactados
- **Hash nos nomes** - Cache busting automatico
- **Compressao** - Arquivos menores para transferencia

## Configuracao do Vite (vite.config.ts)

- Plugin React para JSX
- Plugin Tailwind CSS
- Alias `@/*` para `./` (imports mais limpos)
- Variavel `GEMINI_API_KEY` injetada no build
