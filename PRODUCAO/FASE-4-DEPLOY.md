# Fase 4 — Build de Produção & Deploy

**Status:** ⏳ Pendente  
**Prioridade:** 🟡 Alto  
**Estimativa:** 1-2 horas

## Problema Atual

- Não existe script `"start"` em `package.json`
- O backend roda via `tsx` (devDependency) sem compilação
- Sem Dockerfile, sem `.dockerignore`, sem `render.yaml`
- Path do banco hardcoded como `"finance.db"` (relativo ao CWD)
- Sem endpoint `/health` para load balancer e monitoramento

## O que será feito

### 4.1 Atualizar `package.json`

Mover `tsx` de `devDependencies` para `dependencies` e adicionar scripts:

```json
"scripts": {
  "dev": "tsx server.ts",
  "build": "vite build",
  "start": "NODE_ENV=production tsx server.ts",
  "build:all": "npm run build",
  "clean": "rm -rf dist",
  "lint": "tsc --noEmit",
  "test": "vitest",
  "test:ui": "vitest --ui",
  "test:coverage": "vitest run --coverage"
}
```

### 4.2 Criar `Dockerfile`

```dockerfile
# Stage 1: build do frontend
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: runtime mínimo
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
COPY server.ts ./
COPY src/middleware ./src/middleware
RUN mkdir -p /app/data
EXPOSE 3000
CMD ["npx", "tsx", "server.ts"]
```

### 4.3 Criar `.dockerignore`

```
node_modules
dist
.env
.env.local
finance.db
data/
*.log
.git
PRODUCAO
IMPLEMENTAÇÃO
docs
```

### 4.4 Corrigir path do banco em `server.ts` (linha ~20)

```typescript
// De:
const db = new Database("finance.db");

// Para:
const dbPath = process.env.DB_PATH || path.resolve(process.cwd(), 'data/finance.db');
const db = new Database(dbPath);
```

> Criar o diretório `data/` no projeto e adicionar `data/*.db` ao `.gitignore`.

### 4.5 Adicionar `/health` endpoint em `server.ts`

Adicionar logo após os middlewares globais (antes das rotas de API):

```typescript
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});
```

### 4.6 Criar `render.yaml`

```yaml
services:
  - type: web
    name: inovapro
    env: node
    region: oregon
    plan: free
    buildCommand: npm ci && npm run build
    startCommand: npm start
    healthCheckPath: /health
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3000
      - key: JWT_SECRET
        generateValue: true
      - key: GEMINI_API_KEY
        sync: false
      - key: ADMIN_PASSWORD
        sync: false
      - key: APP_URL
        sync: false
      - key: DB_PATH
        value: /opt/render/project/src/data/finance.db
```

### 4.7 Atualizar `.gitignore`

Adicionar:
```
data/
*.db
```

## Arquivos Criados/Modificados

| Arquivo | Tipo |
|---------|------|
| `package.json` | Adicionar `"start"` script + mover `tsx` para deps |
| `Dockerfile` | Criar |
| `.dockerignore` | Criar |
| `render.yaml` | Criar |
| `server.ts` | Path do banco via env var + endpoint `/health` |
| `.gitignore` | Adicionar `data/` e `*.db` |

## Verificação

```bash
# 1. Build local completo
npm run build
NODE_ENV=production npm start
# App deve responder em http://localhost:3000

# 2. Health check
curl http://localhost:3000/health
# { "status": "ok", "timestamp": "...", "version": "1.0.0" }

# 3. Build Docker
docker build -t inovapro .
docker run -p 3000:3000 \
  -e JWT_SECRET=teste123 \
  -e GEMINI_API_KEY=fake \
  -e ADMIN_PASSWORD=admin123 \
  inovapro
curl http://localhost:3000/health
```

## Status de Conclusão

- [ ] Script `"start"` adicionado ao `package.json`
- [ ] `tsx` movido para `dependencies`
- [ ] `Dockerfile` criado e testado
- [ ] `.dockerignore` criado
- [ ] `render.yaml` criado
- [ ] Path do banco usa `DB_PATH` env var
- [ ] Diretório `data/` criado e no `.gitignore`
- [ ] Endpoint `/health` retorna 200 com JSON
- [ ] `NODE_ENV=production npm start` funciona localmente
