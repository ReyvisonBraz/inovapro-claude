# Fase 5 — Preparação para Multi-plataforma (Mobile + Web Deploy)

> **Objetivo**: Tornar a API consumível por qualquer client (web, mobile, etc.), migrar para banco de produção, versionar a API, documentar endpoints, e preparar PWA para acesso mobile imediato.

---

## Pré-requisitos

- ✅ Fases 1-4 concluídas
- Backend modular, testado, e com CI passando
- Frontend modular com React Router e Contexts

---

## Etapa 5.1 — CORS Configurável

### Por quê?
Quando o app mobile ou outro frontend tentar acessar a API, o navegador bloqueará se CORS não estiver configurado.

### Dependências
```bash
npm install cors
npm install -D @types/cors
```

### Implementação no `server/index.ts`
```typescript
import cors from 'cors';
import { config } from './config.js';

app.use(cors({
  origin: config.cors.origin,  // '*' para dev, URLs específicas para produção
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
```

### Configuração por ambiente
```env
# .env.development
CORS_ORIGIN=*

# .env.production
CORS_ORIGIN=https://seu-dominio.com,https://app.seu-dominio.com
```

### Verificação
- [ ] API acessível de outro domínio/porta
- [ ] Headers CORS presentes nas respostas
- [ ] Credenciais (cookies/auth) funcionam cross-origin

---

## Etapa 5.2 — Versionamento de API (`/api/v1/`)

### Por quê?
Quando o app mobile e web consumirem a API, qualquer mudança pode quebrar clientes antigos. Versionar permite evolução sem quebra.

### O que fazer

1. **Adicionar prefixo `/v1/`** no `server/routes/index.ts`:
```typescript
// Manter rotas antigas para backward compat
router.use('/api', settingsRoutes);

// Novas rotas versionadas
router.use('/api/v1', settingsRoutes);
router.use('/api/v1/transactions', transactionsRoutes);
// ...
```

2. **Manter `/api/` sem versão** funcionando durante a transição

3. **Gradualmente migrar** o frontend para `/api/v1/`

4. **Documentar** política de deprecação:
   - `/api/` (sem versão) = deprecated, mantido por 6 meses
   - `/api/v1/` = versão estável atual
   - `/api/v2/` = próxima versão (quando necessário)

### Verificação
- [ ] `/api/v1/transactions` funciona igual a `/api/transactions`
- [ ] Frontend pode apontar para `/api/v1/`
- [ ] Rotas sem versão continuam funcionando

---

## Etapa 5.3 — Documentação da API (Swagger/OpenAPI)

### Por quê?
Um dev mobile precisa saber exatamente quais endpoints existem, quais parâmetros aceitar, e quais respostas esperar. Sem docs, é impossível integrar.

### Dependências
```bash
npm install swagger-jsdoc swagger-ui-express
npm install -D @types/swagger-jsdoc @types/swagger-ui-express
```

### Implementação

1. **Criar `server/swagger.ts`**:
```typescript
import swaggerJsdoc from 'swagger-jsdoc';

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FinanceFlow OS API',
      version: '1.0.0',
      description: 'API do sistema FinanceFlow OS para gestão financeira e ordens de serviço',
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Desenvolvimento' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./server/routes/*.ts'],
});
```

2. **Adicionar anotações JSDoc** em cada rota:
```typescript
/**
 * @swagger
 * /api/v1/transactions:
 *   get:
 *     summary: Listar transações (paginado)
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Lista paginada de transações
 */
router.get('/', requireAuth, (req, res, next) => { ... });
```

3. **Montar o Swagger UI** no `server/index.ts`:
```typescript
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger.js';

// Documentação da API (apenas em desenvolvimento)
if (process.env.NODE_ENV !== 'production') {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
```

### Verificação
- [ ] Acessar `http://localhost:3000/api/docs` mostra Swagger UI
- [ ] Todos os endpoints estão documentados
- [ ] É possível testar endpoints pelo Swagger UI
- [ ] Autenticação JWT funciona no Swagger

---

## Etapa 5.4 — Migração para PostgreSQL

### Por quê?
SQLite é ótimo para desenvolvimento local, mas não escala para produção multi-usuário:
- Sem conexões concorrentes reais
- Arquivo local (impossível em Cloud Functions/Serverless)
- Sem backups automáticos

### Estratégia: Dual-database

Manter SQLite para dev local e PostgreSQL para produção.

### Opções de PostgreSQL gerenciado

| Serviço | Free Tier | Recomendação |
|---------|-----------|-------------|
| **Supabase** | 500MB, 50K rows | Melhor para projetos pequenos |
| **Neon** | 512MB | Ótimo free tier com branching |
| **Render** | 256MB (90 dias) | Bom para testar |
| **Railway** | $5/mês trial | Fácil de usar |
| **PlanetScale** | 5GB leitura | Bom para escala |

### Migração com Prisma

O projeto JÁ TEM um `prisma/schema.prisma` que NÃO é usado. A migração seria:

1. **Atualizar `prisma/schema.prisma`** para suportar dual datasource:
```prisma
datasource db {
  provider = "postgresql"  // Ou "sqlite" para dev local
  url      = env("DATABASE_URL")
}
```

2. **Gerar migrations**:
```bash
npx prisma migrate dev --name init
```

3. **Substituir queries SQL raw** por Prisma Client:
```typescript
// ANTES (raw SQL)
db.prepare("SELECT * FROM transactions WHERE id = ?").get(id);

// DEPOIS (Prisma)
await prisma.transaction.findUnique({ where: { id } });
```

4. **Migrar dados**:
```bash
# Exportar SQLite
sqlite3 finance.db .dump > backup.sql

# Importar para PostgreSQL (adaptar SQL)
psql $DATABASE_URL < backup_adapted.sql
```

### Variáveis de ambiente
```env
# Desenvolvimento (SQLite)
DATABASE_URL="file:../finance.db"

# Produção (PostgreSQL)
DATABASE_URL="postgresql://user:pass@host:5432/financeflow?schema=public"
```

### Verificação
- [ ] `npx prisma migrate dev` roda sem erros
- [ ] Queries Prisma retornam dados corretos
- [ ] SQLite funciona localmente
- [ ] PostgreSQL funciona com URL remota
- [ ] Dados migrados corretamente

---

## Etapa 5.5 — Shared Types Package

### Por quê?
Quando o mobile (React Native) precisar consumir a API, ele precisa dos mesmos tipos TypeScript. Duplicar tipos é erro garantido.

### Estrutura
```
packages/
├── shared-types/
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts           ← Re-exporta tudo
│       ├── transaction.ts
│       ├── customer.ts
│       ├── payment.ts
│       ├── serviceOrder.ts
│       ├── settings.ts
│       ├── user.ts
│       └── api.ts             ← Tipos de request/response
```

### Alternativa simples (sem monorepo)
Apenas manter `src/types.ts` como source of truth e copiar para o projeto mobile quando necessário. O monorepo é ideal mas adiciona complexidade.

---

## Etapa 5.6 — PWA (Progressive Web App)

### Por quê?
Um PWA é basicamente um "app mobile de graça" — funciona offline, tem ícone na home screen, e se comporta como um app nativo.

### Dependências
```bash
npm install -D vite-plugin-pwa
```

### Configuração

1. **Atualizar `vite.config.ts`**:
```typescript
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'logo.png'],
      manifest: {
        name: 'FinanceFlow OS',
        short_name: 'FinanceFlow',
        description: 'Sistema de Gestão Financeira e Ordens de Serviço',
        theme_color: '#1152d4',
        background_color: '#0a0e1a',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
          {
            urlPattern: /\/api\/.*/i,
            handler: 'NetworkFirst',
            options: { cacheName: 'api-cache', expiration: { maxEntries: 50, maxAgeSeconds: 60 * 5 } },
          },
        ],
      },
    }),
  ],
});
```

2. **Criar ícones PWA** (192x192 e 512x512 pixels)

3. **Adicionar meta tags no `index.html`**:
```html
<meta name="theme-color" content="#1152d4" />
<link rel="apple-touch-icon" href="/pwa-192x192.png" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
```

### Verificação
- [ ] App instalável pelo Chrome (ícone na barra de endereço)
- [ ] Funciona offline (dados em cache)
- [ ] Ícone aparece na home screen do celular
- [ ] Abre como app standalone (sem barra do navegador)
- [ ] Service Worker registrado corretamente

---

## Etapa 5.7 — Deploy em Produção

### Opção A: Render (Recomendada para começar)

1. **Criar conta** em [render.com](https://render.com)
2. **Conectar repositório** GitHub
3. **Configurar Web Service**:
   - Build: `npm install && npm run build`
   - Start: `node --loader tsx server/index.ts`
   - Environment: `NODE_ENV=production`, `JWT_SECRET=...`, `DATABASE_URL=...`
4. **Configurar PostgreSQL** (Render oferece PostgreSQL gratuito por 90 dias)

### Opção B: Supabase + Vercel

1. **Supabase** — Banco de dados PostgreSQL
2. **Vercel** — Deploy do frontend (Vite build estático)
3. **Serverless functions** — API em `api/` folder do Vercel

### Opção C: VPS (DigitalOcean/Hetzner)

1. **Servidor VPS** — $4-6/mês
2. **Docker Compose** — App + PostgreSQL
3. **Nginx** — Reverse proxy com SSL (Let's Encrypt)
4. **PM2** — Process manager para Node.js

### Variáveis de produção necessárias
```env
NODE_ENV=production
PORT=3000
JWT_SECRET=gerar-string-aleatoria-64-chars-aqui
JWT_EXPIRES_IN=8h
BCRYPT_ROUNDS=12
CORS_ORIGIN=https://seu-dominio.com
DATABASE_URL=postgresql://user:pass@host:5432/financeflow
```

---

## Etapa 5.8 — Preparação para React Native (Futuro)

### Arquitetura Mobile
```
financeflow-mobile/
├── src/
│   ├── screens/              ← Telas (equivalente às pages web)
│   ├── components/           ← Componentes nativos
│   ├── services/            ← Reutiliza mesma API service (fetch com JWT)
│   ├── contexts/            ← Mesmos contexts (AuthContext, etc.)
│   ├── hooks/               ← Mesmos hooks de dados
│   └── types/               ← Tipos compartilhados (do shared-types package)
```

### O que é reutilizável do projeto web
| Camada | Reutilizável? | Como |
|--------|--------------|------|
| API Services | ✅ Sim | Copiar `services/*.ts` (fetch funciona no RN) |
| Types | ✅ Sim | Copiar `types.ts` ou shared package |
| Hooks de dados | ✅ Sim | Context + hooks são React puro |
| Contexts | ✅ Sim | AuthContext, SettingsContext funcionam no RN |
| Lógica de negócio | ✅ Sim | Toda a lógica em hooks/services |
| Componentes UI | ❌ Não | RN usa componentes nativos |
| CSS/Tailwind | ❌ Não | RN usa StyleSheet |
| React Router | ❌ Não | RN usa React Navigation |

### Estimativa de reutilização: **~60% do código**

---

## Checklist geral da Fase 5

- [ ] CORS configurado e testado
- [ ] API versionada com `/api/v1/`
- [ ] Swagger UI funcionando em `/api/docs`
- [ ] Todos os endpoints documentados
- [ ] PostgreSQL configurado (Supabase/Render/outro)
- [ ] Dados migrados do SQLite para PostgreSQL
- [ ] PWA configurado (manifest + service worker + ícones)
- [ ] App instalável no celular via Chrome
- [ ] Deploy em produção funcionando
- [ ] Variáveis de ambiente seguras em produção
- [ ] SSL/HTTPS configurado
- [ ] README atualizado com instruções de deploy
