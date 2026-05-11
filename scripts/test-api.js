const BASE = 'https://inovaproo.vercel.app';

async function test() {
  const results = [];
  let token = '';

  async function req(method, path, body = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const opts = { method, headers };
    if (body) opts.body = JSON.stringify(body);
    const start = Date.now();
    try {
      const res = await fetch(`${BASE}${path}`, opts);
      const time = Date.now() - start;
      const data = await res.json().catch(() => null);
      return { status: res.status, time, data, ok: res.ok, headers: Object.fromEntries(res.headers) };
    } catch (e) {
      return { status: 0, time: Date.now() - start, data: null, ok: false, error: e.message };
    }
  }

  // 1. Health (sempre retorna HTML no Vercel, ignorar)
  results.push({ route: 'GET /health', ...await req('GET', '/health') });

  // 2. Ping
  results.push({ route: 'GET /api/ping', ...await req('GET', '/api/ping') });

  // 3. Login com credenciais erradas
  results.push({ route: 'POST /api/login (wrong)', ...await req('POST', '/api/login', { username: 'admin', password: 'errada' }) });

  // 4. Login correto
  const loginRes = await req('POST', '/api/login', { username: 'admin', password: 'admin2021' });
  results.push({ route: 'POST /api/login (ok)', ...loginRes });
  if (loginRes.ok && loginRes.data?.token) {
    token = loginRes.data.token;
  }

  if (token) {
    // 5. Rotas protegidas
    const protectedRoutes = [
      'GET /api/categories', 'GET /api/settings', 'GET /api/users',
      'GET /api/customers', 'GET /api/transactions',
      'GET /api/service-orders', 'GET /api/inventory', 'GET /api/stats',
      'GET /api/audit-logs',
    ];
    for (const route of protectedRoutes) {
      const [method, path] = route.split(' ');
      results.push({ route, ...await req(method, path) });
    }
  }

  console.log('\n=== RESULTADO DOS TESTES ===\n');
  let erros = 0;
  for (const r of results) {
    const status = r.ok ? '✅' : r.status === 401 ? '🔒' : '❌';
    if (!r.ok && r.status !== 401 && r.status !== 0) erros++;
    if (r.status === 0) erros++;
    const statusStr = r.status ? `${r.status}` : 'NETWORK';
    console.log(`${status} ${r.route} → ${statusStr} (${r.time}ms)`);
    if (!r.ok && r.status !== 401 && r.status !== 0 && r.status !== 200) {
      console.log(`   Erro: ${JSON.stringify(r.data)?.substring(0, 200)}`);
    }
  }

  console.log(`\n${erros === 0 ? '✅ Nenhum erro crítico!' : `❌ ${erros} erro(s) encontrado(s)`}`);
}

test().catch(console.error);
