import { test, expect } from '@playwright/test';

// A senha vem do ambiente (nunca commitada). Sem ela, o smoke é pulado.
const USER = process.env.E2E_USER || 'admin';
const PASS = process.env.E2E_PASS || '';

test.describe('smoke de autenticação', () => {
  test.skip(!PASS, 'defina E2E_PASS para rodar o E2E (ex.: E2E_PASS=... npm run e2e)');

  test('login leva ao dashboard e a sessão usa cookie httpOnly', async ({ page, context }) => {
    // Vai direto a /login (em /, o bootstrap /me sem sessão redireciona e
    // corre com o preenchimento). networkidle garante o SPA hidratado.
    await page.goto('/login', { waitUntil: 'networkidle' });
    await page.getByPlaceholder(/usu[áa]rio/i).fill(USER);
    await page.getByPlaceholder(/senha/i).fill(PASS);
    await page.locator('button[type="submit"]').click();

    // 1) login redireciona ao dashboard
    await page.waitForURL(/dashboard/);
    await expect(page).toHaveURL(/dashboard/);

    // 2) o token NÃO é legível por JS (cookie httpOnly) e não fica no localStorage
    const docCookie = await page.evaluate(() => document.cookie);
    expect(docCookie).not.toContain('token=');
    const lsToken = await page.evaluate(() => localStorage.getItem('token'));
    expect(lsToken).toBeNull();

    // 3) o cookie de sessão existe e é httpOnly
    const cookies = await context.cookies();
    const session = cookies.find((c) => c.name === 'token');
    expect(session?.httpOnly).toBe(true);

    // 4) reload mantém a sessão (reidratação via GET /api/me)
    await page.reload();
    await expect(page).toHaveURL(/dashboard/);
  });
});
