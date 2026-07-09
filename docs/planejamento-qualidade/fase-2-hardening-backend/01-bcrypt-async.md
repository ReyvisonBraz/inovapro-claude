# Fase 2 · Tarefa 01 — bcrypt assíncrono (M1)

**Goal:** Eliminar `bcrypt.compareSync`/`bcrypt.hashSync`, que travam o event loop single-thread do Node durante o hash (custo O(2^rounds)). Sob concorrência, cada login/criação de usuário congela o servidor inteiro.

**Architecture:** Centralizamos hash e verificação em `src/lib/password.ts` (`hashPassword`/`verifyPassword`, ambos `async`, usando `bcrypt.hash`/`bcrypt.compare`). Trocamos os três pontos de uso síncrono ([../../../src/routes/auth.ts](../../../src/routes/auth.ts) e [../../../src/routes/users.ts](../../../src/routes/users.ts)) para awaitar as versões assíncronas. Um único módulo também facilita, no futuro, subir o custo (`rounds`) ou migrar de algoritmo.

## Interfaces

- **Produz:** `src/lib/password.ts`:
  - `export async function hashPassword(plain: string): Promise<string>`
  - `export async function verifyPassword(plain: string, hash: string): Promise<boolean>`
- **Consome:** usado por `auth.ts` (login) e `users.ts` (create/update).

---

- [ ] **Step 1: Teste do módulo de senha (vai FALHAR — módulo não existe)**

Crie `src/test/password.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '../lib/password';

describe('password (bcrypt async)', () => {
  it('hash + verify faz round-trip', async () => {
    const hash = await hashPassword('segredo123');
    expect(hash).not.toBe('segredo123');
    expect(hash.startsWith('$2')).toBe(true);
    expect(await verifyPassword('segredo123', hash)).toBe(true);
  });

  it('senha errada não verifica', async () => {
    const hash = await hashPassword('segredo123');
    expect(await verifyPassword('outra', hash)).toBe(false);
  });
});
```

- [ ] **Step 2: Rodar e ver FALHAR**

Run:
```powershell
npx vitest run src/test/password.test.ts
```
Esperado: erro de import.

- [ ] **Step 3: Criar `src/lib/password.ts`**

```ts
import bcrypt from 'bcryptjs';

const ROUNDS = 10;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
```

- [ ] **Step 4: Rodar e ver PASSAR**

Run:
```powershell
npx vitest run src/test/password.test.ts
```
Esperado: 2 verdes.

- [ ] **Step 5: Usar no login (`auth.ts`)**

Em `src/routes/auth.ts`, remova o import `bcrypt` e a linha `bcrypt.compareSync(...)`. Troque a verificação:

```ts
import { verifyPassword } from '../lib/password.js';

const user = await prisma.user.findUnique({ where: { username } });
if (!user || !(await verifyPassword(password, user.password))) {
  info('Tentativa de login inválida', { details: { username } });
  return res.status(401).json({ error: 'Credenciais inválidas' });
}
```

- [ ] **Step 6: Usar em `users.ts`**

Em `src/routes/users.ts`, troque `bcrypt.hashSync(password, 10)` (POST e PUT) por `await hashPassword(password)`:

```ts
import { hashPassword } from '../lib/password.js';

// POST
const hashedPassword = await hashPassword(password);

// PUT (dentro do if password)
if (password) {
  updateData.password = await hashPassword(password);
}
```
Remova o `import bcrypt from 'bcryptjs'` de `users.ts` se não sobrar uso.

- [ ] **Step 7: Garantir que não sobrou nenhum uso síncrono**

Run:
```powershell
npx grep -rn "compareSync|hashSync" src ; if ($?) { }  # veja abaixo
```
Ou use a busca do editor por `compareSync`/`hashSync` em `src/`. Esperado: **zero** ocorrências.

- [ ] **Step 8: Gate completo**

Run:
```powershell
npm run verify
```
Esperado: `tsc` 0 erros; testes verdes (inclui `password.test.ts`).

- [ ] **Step 9: Commit**

```powershell
git add src/lib/password.ts src/test/password.test.ts src/routes/auth.ts src/routes/users.ts
git commit -m @'
perf(security): bcrypt assincrono (nao bloqueia o event loop)

- src/lib/password.ts: hashPassword/verifyPassword async
- login e users passam a awaitar hash/compare

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
'@
```

## Critério de conclusão da tarefa

- [ ] Zero `compareSync`/`hashSync` em `src/`.
- [ ] Login e criação de usuário funcionam (smoke manual com um login real).
- [ ] `npm run verify` verde.
