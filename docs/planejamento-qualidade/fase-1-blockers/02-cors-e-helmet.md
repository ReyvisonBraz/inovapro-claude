# Fase 1 · Tarefa 02 — Fechar CORS e reativar CSP (B3)

**Goal:** Em produção, negar origens não autorizadas (hoje o código libera **qualquer** origem, com `credentials: true`) e reativar uma Content-Security-Policy sensata no Helmet (hoje `contentSecurityPolicy: false`).

**Architecture:** A decisão "esta origem é permitida?" hoje está embutida no callback do `cors()` em [../../../src/server.ts](../../../src/server.ts), com um `else` que ainda chama `callback(null, true)`. Extraímos essa decisão para uma função pura `isOriginAllowed(origin, nodeEnv)` em um novo módulo `src/lib/cors.ts` — testável sem subir servidor — e a consumimos no `server.ts`. Assim evitamos importar `server.ts` em teste (ele tem efeitos colaterais: `testConnection()` e `app.listen`).

## Interfaces

- **Produz:**
  - `src/lib/cors.ts` → `export const allowedOrigins: string[]` e `export function isOriginAllowed(origin: string | undefined, nodeEnv: string | undefined): boolean`.
- **Consome:** usado por `server.ts` no callback de `cors({ origin })`.

**Contrato de `isOriginAllowed`:**
- `origin` ausente (`undefined`) → `true` (ferramentas server-to-server, curl).
- `origin` na lista `allowedOrigins` ou terminando em `.vercel.app` → `true`.
- caso contrário: `false` (independente do ambiente). *(A permissividade de dev é resolvida por variável de ambiente explícita, não por "vazar por padrão".)*

---

- [ ] **Step 1: Escrever o teste da função de origem (vai FALHAR — módulo não existe)**

Crie `src/test/cors.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { isOriginAllowed } from '../lib/cors';

describe('isOriginAllowed', () => {
  it('permite requisição sem origin (curl/server-to-server)', () => {
    expect(isOriginAllowed(undefined, 'production')).toBe(true);
  });

  it('permite origem explicitamente listada', () => {
    expect(isOriginAllowed('https://inovapro-theta.vercel.app', 'production')).toBe(true);
  });

  it('permite qualquer subdomínio *.vercel.app', () => {
    expect(isOriginAllowed('https://inovapro-pr-42.vercel.app', 'production')).toBe(true);
  });

  it('permite localhost de desenvolvimento', () => {
    expect(isOriginAllowed('http://localhost:5173', 'production')).toBe(true);
  });

  it('NEGA origem desconhecida em produção', () => {
    expect(isOriginAllowed('https://evil.example.com', 'production')).toBe(false);
  });

  it('NEGA origem desconhecida também fora de produção (sem vazar por padrão)', () => {
    expect(isOriginAllowed('https://evil.example.com', 'development')).toBe(false);
  });
});
```

- [ ] **Step 2: Rodar e ver FALHAR**

Run:
```powershell
npx vitest run src/test/cors.test.ts
```
Esperado: falha de import (`Cannot find module '../lib/cors'`).

- [ ] **Step 3: Criar `src/lib/cors.ts`**

```ts
/**
 * Decisão de origem para CORS, isolada para ser testável sem subir o servidor.
 */
export const allowedOrigins: string[] = [
  'https://inovapro-theta.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

export function isOriginAllowed(
  origin: string | undefined,
  _nodeEnv: string | undefined
): boolean {
  // Sem origin: requisições server-to-server / ferramentas (não é navegador).
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  // Deploys de preview do próprio produto.
  if (origin.endsWith('.vercel.app')) return true;
  return false;
}
```

- [ ] **Step 4: Rodar e ver PASSAR**

Run:
```powershell
npx vitest run src/test/cors.test.ts
```
Esperado: 6 testes verdes.

- [ ] **Step 5: Consumir a função no `server.ts` (fechar o `else`)**

Em `src/server.ts`: importe e substitua o bloco de CORS. Remova a lista local `allowedOrigins` (agora vem do módulo) e o callback permissivo.

```ts
import { isOriginAllowed } from './src/lib/cors.js';

app.use(cors({
  origin: (origin, callback) => {
    if (isOriginAllowed(origin, process.env.NODE_ENV)) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Origem bloqueada: ${origin}`);
      callback(new Error('Origem não permitida pelo CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
}));
```

> Remova também o handler manual `app.options('*', ...)` que ecoa `Access-Control-Allow-Origin: origin` incondicionalmente (linhas ~80–91 do `server.ts` atual) — ele reabre o buraco que acabamos de fechar. O middleware `cors()` já responde ao preflight `OPTIONS`.

- [ ] **Step 6: Reativar CSP no Helmet**

Ainda em `server.ts`, troque `contentSecurityPolicy: false` por uma política explícita. Adicione a origem da API (quando o front está em domínio separado) via env:

```ts
const apiOrigin = process.env.PUBLIC_API_ORIGIN; // ex.: https://inovapro.onrender.com (opcional)

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],      // estilos injetados (motion/inline style attrs)
      imgSrc: ["'self'", 'data:', 'https:'],          // avatares/QR/base64/storage
      connectSrc: ["'self'", ...(apiOrigin ? [apiOrigin] : [])],
      fontSrc: ["'self'", 'data:'],
      objectSrc: ["'none'"],
      frameAncestors: ["'self'"],
    },
  },
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
}));
```

- [ ] **Step 7: Gate de tipos e testes**

Run:
```powershell
npm run verify
```
Esperado: `tsc` 0 erros; testes verdes (agora inclui `cors.test.ts`).

- [ ] **Step 8: Smoke manual do CSP (não pule — CSP quebra silencioso)**

```powershell
# build + servir estático como em produção
npm run build
$env:SERVE_STATIC='true'; $env:NODE_ENV='production'; npm start
```
Abra `http://localhost:3001`, faça login e navegue por Dashboard, OS e Relatórios. No DevTools → Console, **não deve haver** erros `Refused to ... because it violates the Content Security Policy`. Se houver, ajuste a diretiva específica (ex.: adicionar origem de imagem/conexão) e re-teste. Registre qualquer origem externa legítima encontrada.

- [ ] **Step 9: Commit**

```powershell
git add src/lib/cors.ts src/test/cors.test.ts server.ts
git commit -m @'
fix(security): CORS nega origens desconhecidas e reativa CSP no Helmet

- extrai isOriginAllowed() testavel; remove fallback permissivo em producao
- remove handler OPTIONS manual que ecoava qualquer Origin
- CSP explicita (self + fontes necessarias)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
'@
```

## Critério de conclusão da tarefa

- [ ] `cors.test.ts` prova que `evil.example.com` é negado em qualquer ambiente.
- [ ] `server.ts` rejeita origem desconhecida (não devolve `Access-Control-Allow-Origin`).
- [ ] App funciona com CSP ativo, sem violações no console.
- [ ] `npm run verify` verde.

## Riscos

- **CSP quebrando produção:** o Step 8 é obrigatório. Se o front está em domínio diferente da API, configure `PUBLIC_API_ORIGIN`. Comece permissivo em `img-src`/`connect-src` e aperte depois.
- **Preview Vercel:** a regra `*.vercel.app` mantém previews funcionando; se usar outro provedor de preview, adicione-o em `allowedOrigins`.
