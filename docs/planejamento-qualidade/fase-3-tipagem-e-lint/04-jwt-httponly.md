# Fase 3 · Tarefa 04 — JWT em cookie httpOnly (M10)

**Goal:** Tirar o token do `localStorage` (ver [../../../src/lib/api.ts](../../../src/lib/api.ts) e [../../../src/store/useAuthStore.ts](../../../src/store/useAuthStore.ts)), onde qualquer XSS o rouba, e passá-lo para um cookie `httpOnly` + `Secure` + `SameSite`, inacessível a JavaScript.

**Architecture:** O login passa a setar um cookie httpOnly com o JWT. `requireAuth` lê o token do cookie (com fallback para o header `Authorization`, para transição suave). O frontend usa `withCredentials: true` e não injeta mais o header nem lê `localStorage`. Como o cookie é invisível ao JS, adicionamos `GET /api/me` para o app reidratar o estado de auth no reload, e `POST /api/logout` para limpar o cookie.

> **Risco/decisão:** é a mudança mais arriscada da fase (mexe no fluxo de auth e depende de CORS com credenciais — já habilitado na Fase 1). Se preferir, pode ser adiada sem bloquear o resto. Requer que front e API estejam em domínios compatíveis com cookies cross-site (`SameSite=None; Secure` em produção HTTPS).

## Interfaces

- **Consome:** `generateToken` (existe), `requireAuth` (será estendido), CORS `credentials: true` (Fase 1).
- **Produz:** cookie `token`; `GET /api/me`; `POST /api/logout`; `requireAuth` lendo cookie.

---

- [ ] **Step 1: Instalar cookie-parser**

Run:
```powershell
npm install cookie-parser
npm install -D @types/cookie-parser
```

- [ ] **Step 2: Teste — `requireAuth` aceita token via cookie (vai FALHAR)**

Crie `src/test/auth-cookie.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import express from 'express';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { requireAuth } from '../middleware/auth';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

function makeApp() {
  const app = express();
  app.use(cookieParser());
  app.get('/protegido', requireAuth, (req: any, res) => res.json({ userId: req.user.userId }));
  return app;
}

const token = jwt.sign({ userId: 42, username: 'a', role: 'owner' }, process.env.JWT_SECRET!);

describe('requireAuth via cookie', () => {
  it('aceita token no cookie', async () => {
    const res = await request(makeApp()).get('/protegido').set('Cookie', `token=${token}`);
    expect(res.status).toBe(200);
    expect(res.body.userId).toBe(42);
  });

  it('aceita token no header Authorization (compatibilidade)', async () => {
    const res = await request(makeApp()).get('/protegido').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('sem token → 401', async () => {
    const res = await request(makeApp()).get('/protegido');
    expect(res.status).toBe(401);
  });
});
```

- [ ] **Step 3: Rodar e ver FALHAR**

Run:
```powershell
npx vitest run src/test/auth-cookie.test.ts
```
Esperado: o caso do cookie falha (hoje só lê o header).

- [ ] **Step 4: Estender `requireAuth` para ler o cookie**

Em `src/middleware/auth.ts`, aceite as duas fontes:

```ts
export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const header = req.headers.authorization;
  const fromHeader = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
  const fromCookie = (req as any).cookies?.token as string | undefined;
  const token = fromCookie || fromHeader;

  if (!token) {
    res.status(401).json({ error: 'Token de autenticação necessário' });
    return;
  }
  try {
    req.user = jwt.verify(token, JWT_SECRET) as JwtPayload;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido ou expirado' });
  }
};
```

- [ ] **Step 5: Rodar e ver PASSAR**

Run:
```powershell
npx vitest run src/test/auth-cookie.test.ts
```
Esperado: 3 verdes.

- [ ] **Step 6: Montar cookie-parser no servidor**

Em `src/server.ts`, após `express.json()`:
```ts
import cookieParser from 'cookie-parser';
app.use(cookieParser());
```

- [ ] **Step 7: Login seta o cookie httpOnly**

Em `src/routes/auth.ts`, depois de gerar o token, seta o cookie e devolve o usuário (não precisa mais devolver o token no corpo, mas pode manter por transição):

```ts
const token = generateToken({ userId: user.id, username: user.username, role: user.role });
res.cookie('token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7d, igual à expiração do JWT
});
res.json({ user: { ...userWithoutPassword, permissions } });
```

- [ ] **Step 8: Endpoints `/api/me` e `/api/logout`**

Adicione a um router protegido (ex.: novo `src/routes/me.ts`, montado sob `requireAuth`):

```ts
// GET /api/me — reidrata o estado de auth no reload (cookie é invisivel ao JS)
router.get('/me', async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: { id: true, username: true, role: true, name: true, permissions: true },
  });
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
  let permissions: string[] = [];
  try { permissions = JSON.parse(user.permissions || '[]'); } catch { /* */ }
  if (user.role === 'owner') permissions = [...OWNER_PERMISSIONS];
  res.json({ user: { ...user, permissions } });
});
```
E o logout (pode ficar em `auth.ts`, público):
```ts
router.post('/logout', (_req, res) => {
  res.clearCookie('token', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' });
  res.json({ success: true });
});
```

- [ ] **Step 9: Frontend — usar credenciais e parar de ler localStorage**

Em `src/lib/api.ts`:
```ts
const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL?.replace(/\/$/, '') || '') + '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,  // envia/recebe o cookie httpOnly
});
// remova o interceptor que injeta Authorization a partir de localStorage
```
Mantenha o interceptor de resposta 401 (redireciona para /login), mas sem mexer em `localStorage.token`.

- [ ] **Step 10: Frontend — estado de auth via `/me`**

Em `src/store/useAuthStore.ts` e no bootstrap do `App`:
- `login(user)` guarda só o `currentUser` em memória (e, se quiser persistência de UI, `currentUser` em `localStorage` **sem** token).
- No load do app, chame `GET /api/me`: sucesso → autenticado; 401 → não autenticado. Substitui o `!!localStorage.getItem('token')`.
- `logout()` chama `POST /api/logout` e limpa o `currentUser`.

> Ajuste `Login.tsx`/`useAuth.ts` para o novo `login(user)` (sem token). O componente de login hoje recebe `(token, user)`; passe a receber só `user`.

- [ ] **Step 11: Gate + smoke**

Run:
```powershell
npm run verify
```
Smoke manual (produção-like, HTTPS ou localhost): login → recarregar a página mantém logado (via `/me`) → logout limpa o cookie → rotas protegidas dão 401. No DevTools → Application → Cookies, o cookie `token` aparece com flag `HttpOnly`.

- [ ] **Step 12: Commit**

```powershell
git add src/middleware/auth.ts src/routes/auth.ts src/routes/me.ts src/routes/index.ts server.ts src/lib/api.ts src/store/useAuthStore.ts src/hooks/useAuth.ts src/components/auth/Login.tsx src/test/auth-cookie.test.ts package.json package-lock.json
git commit -m @'
feat(security): JWT em cookie httpOnly (mitiga roubo por XSS)

- requireAuth le cookie (fallback header); login seta cookie httpOnly+Secure
- /api/me reidrata estado; /api/logout limpa cookie
- front usa withCredentials e nao guarda token no localStorage

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
'@
```

## Critério de conclusão da tarefa

- [ ] Cookie `token` com `HttpOnly` (verificável no DevTools); `localStorage` sem token.
- [ ] Reload mantém sessão via `/api/me`; logout limpa cookie.
- [ ] `npm run verify` verde.

## Riscos

- **Cross-site cookies:** se front e API estão em domínios diferentes, exige `SameSite=None; Secure` e HTTPS em ambos, e o CORS com `credentials: true` (já feito). Em `localhost`, `SameSite=Lax` funciona.
- **Transição:** o fallback para header `Authorization` mantém sessões antigas funcionando durante o deploy; remova-o numa limpeza posterior.
