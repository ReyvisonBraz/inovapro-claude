const BASE = 'https://inovaproo.vercel.app';
const COLORS = { green: '\x1b[32m', red: '\x1b[31m', yellow: '\x1b[33m', cyan: '\x1b[36m', reset: '\x1b[0m' };
let token = '';
let step = 0;

async function api(method, path, body = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  const start = Date.now();
  try {
    const res = await fetch(`${BASE}${path}`, opts);
    const time = Date.now() - start;
    const data = await res.json().catch(() => ({ raw: '' }));
    return { status: res.status, time, data, ok: res.ok };
  } catch (e) {
    return { status: 0, time: Date.now() - start, data: null, ok: false, error: e.message };
  }
}

function log(status, msg, detail = '') {
  const icon = status === 'ok' ? '✅' : status === 'warn' ? '⚠️' : status === 'info' ? 'ℹ️' : '❌';
  const color = status === 'ok' ? COLORS.green : status === 'warn' ? COLORS.yellow : status === 'info' ? COLORS.cyan : COLORS.red;
  const elapsed = detail ? ` (${detail})` : '';
  console.log(`${color}${icon} ${msg}${elapsed}${COLORS.reset}`);
}

function divider(title) {
  console.log(`\n${COLORS.cyan}━━━ ${title} ${'━'.repeat(50 - title.length)}${COLORS.reset}\n`);
}

async function run() {
  console.log(`${COLORS.cyan}╔══════════════════════════════════════════════════════╗`);
  console.log(`║        INOVA PRO — Simulação de Uso Completo          ║`);
  console.log(`╚══════════════════════════════════════════════════════╝${COLORS.reset}\n`);

  // ── 1. LOGIN ──
  divider('1. LOGIN');
  const login = await api('POST', '/api/login', { username: 'admin', password: 'admin2021' });
  if (!login.ok) { log('err', `Falha no login: ${JSON.stringify(login.data)}`); return; }
  token = login.data.token;
  log('ok', `Login como ${login.data.user.name} (${login.data.user.role})`, `${login.time}ms`);
  log('info', `Token JWT: ${token.substring(0, 50)}...`);

  // ── 2. DASHBOARD — Carregar dados iniciais ──
  divider('2. CARREGANDO DASHBOARD');
  const stats = await api('GET', '/api/stats');
  log(stats.ok ? 'ok' : 'err', `Estatísticas do dashboard`, `${stats.time}ms`);

  const categories = await api('GET', '/api/categories');
  log(categories.ok ? 'ok' : 'err', `Lista de categorias (${categories.data?.length || 0} encontradas)`, `${categories.time}ms`);

  const settings = await api('GET', '/api/settings');
  log(settings.ok ? 'ok' : 'err', `Configurações carregadas`, `${settings.time}ms`);

  // ── 3. NAVEGAR — Clientes ──
  divider('3. CLIENTES');
  const customers = await api('GET', '/api/customers');
  log(customers.ok ? 'ok' : 'err', `Lista de clientes (${customers.data?.length || 0} encontrados)`, `${customers.time}ms`);

  // Criar cliente
  log('info', 'Criando novo cliente...');
  const newCustomer = await api('POST', '/api/customers', {
    firstName: 'Maria', lastName: 'Santos', phone: '11988887777',
    nickname: 'Mariazinha', cpf: '98765432100',
    observation: 'Cliente gerado pelo teste de simulação',
    creditLimit: 3000, createdBy: 1
  });
  const customerId = newCustomer.data?.id;
  if (customerId) {
    log('ok', `Cliente criado ID ${customerId}`, `${newCustomer.time}ms`);

    // Editar cliente
    log('info', 'Editando cliente...');
    const editCustomer = await api('PUT', `/api/customers/${customerId}`, {
      firstName: 'Maria', lastName: 'Santos Updated', phone: '11988887777',
      creditLimit: 5000, updatedBy: 1
    });
    log(editCustomer.ok ? 'ok' : 'err', `Cliente ID ${customerId} atualizado`, `${editCustomer.time}ms`);
  } else {
    log('warn', `Cliente não foi criado (pode já existir): ${JSON.stringify(newCustomer.data)}`);
  }

  // ── 4. TRANSAÇÕES ──
  divider('4. TRANSAÇÕES');
  const transactions = await api('GET', '/api/transactions');
  log(transactions.ok ? 'ok' : 'err', `Lista de transações (${transactions.data?.length || 0} encontradas)`, `${transactions.time}ms`);

  log('info', 'Criando nova transação...');
  const newTransaction = await api('POST', '/api/transactions', {
    description: 'Venda de monitor', category: 'Vendas',
    type: 'income', amount: 899.90, date: '2026-05-11',
    customerId: customerId || 1, customerName: 'Maria Santos',
    createdBy: 1
  });
  const transactionId = newTransaction.data?.id;
  if (transactionId) {
    log('ok', `Transação ID ${transactionId} criada`, `${newTransaction.time}ms`);
  } else {
    log('warn', `Transação não criada: ${JSON.stringify(newTransaction.data)}`);
  }

  // ── 5. ORDEM DE SERVIÇO ──
  divider('5. ORDEM DE SERVIÇO');
  const serviceOrders = await api('GET', '/api/service-orders');
  log(serviceOrders.ok ? 'ok' : 'err', `Lista de OS (${serviceOrders.data?.length || 0} encontradas)`, `${serviceOrders.time}ms`);

  log('info', 'Abrindo nova ordem de serviço...');
  const newOS = await api('POST', '/api/service-orders', {
    customerId: customerId || 1,
    entryDate: '2026-05-11',
    equipmentType: 'Notebook', equipmentBrand: 'Lenovo',
    equipmentModel: 'ThinkPad X1', equipmentColor: 'Preto',
    equipmentSerial: 'SN-TEST-001',
    reportedProblem: 'Tela piscando e superaquecimento',
    priority: 'high',
    accessories: 'Carregador, Mouse sem fio',
    services: [
      { name: 'Diagnóstico completo', price: 0 },
      { name: 'Troca de tela', price: 450.00 },
      { name: 'Limpeza interna', price: 80.00 }
    ],
    partsUsed: [
      { name: 'Tela 14 polegadas', quantity: 1, unitPrice: 320.00, subtotal: 320.00 },
      { name: 'Pasta térmica', quantity: 1, unitPrice: 25.00, subtotal: 25.00 }
    ],
    serviceFee: 530.00,
    totalAmount: 875.00,
    createdBy: 1
  });
  const osId = newOS.data?.id;
  if (osId) {
    log('ok', `OS ID ${osId} criada com sucesso`, `${newOS.time}ms`);
  } else {
    log('warn', `OS não criada: ${JSON.stringify(newOS.data)}`);
  }

  // ── 6. PAGAMENTO DE CLIENTE ──
  divider('6. PAGAMENTO DE CLIENTE');
  log('info', 'Registrando pagamento...');
  const newPayment = await api('POST', '/api/client-payments', {
    customerId: customerId || 1,
    description: 'Pagamento da OS - Troca de tela',
    totalAmount: 875.00,
    paidAmount: 500.00,
    purchaseDate: '2026-05-11',
    dueDate: '2026-06-10',
    paymentMethod: 'Pix',
    status: 'partial',
    installmentsCount: 2,
    type: 'income',
    createdBy: 1
  });
  const paymentId = newPayment.data?.id;
  if (paymentId) {
    log('ok', `Pagamento ID ${paymentId} registrado`, `${newPayment.time}ms`);
  } else {
    log('warn', `Pagamento não criado: ${JSON.stringify(newPayment.data)}`);
  }

  // ── 7. CATEGORIA — Criar e Deletar ──
  divider('7. CATEGORIA (CRIAR + DELETAR)');
  log('info', 'Criando categoria de teste...');
  const newCategory = await api('POST', '/api/categories', {
    name: 'Categoria Teste Temp', type: 'expense'
  });
  const catId = newCategory.data?.id;
  if (catId) {
    log('ok', `Categoria ID ${catId} criada`, `${newCategory.time}ms`);
    log('info', `Deletando categoria ID ${catId}...`);
    const delCategory = await api('DELETE', `/api/categories/${catId}`);
    log(delCategory.ok ? 'ok' : 'err', `Categoria ID ${catId} deletada`, `${delCategory.time}ms`);
  } else {
    log('warn', `Categoria não criada: ${JSON.stringify(newCategory.data)}`);
  }

  // ── 8. RELATÓRIO FINAL ──
  divider('8. VERIFICAÇÃO FINAL');
  const finalStats = await api('GET', '/api/stats');
  if (finalStats.ok) {
    log('ok', 'Dashboard atualizado com os novos dados');
    console.log(`   ${COLORS.cyan}Resumo:${COLORS.reset}`, JSON.stringify(finalStats.data, null, 2));
  }

  const finalTransactions = await api('GET', '/api/transactions');
  const finalCustomers = await api('GET', '/api/customers');
  const finalOS = await api('GET', '/api/service-orders');

  console.log(`\n${COLORS.green}════════════════════════════════════════════════════════${COLORS.reset}`);
  console.log(`${COLORS.green}  SIMULAÇÃO FINALIZADA — Resumo final:${COLORS.reset}`);
  console.log(`  📊 Transações: ${finalTransactions.data?.length || 0}`);
  console.log(`  👥 Clientes:    ${finalCustomers.data?.length || 0}`);
  console.log(`  🔧 Ordens Serv.: ${finalOS.data?.length || 0}`);
  if (transactionId) console.log(`  💰 Transação criada: ID ${transactionId}`);
  if (customerId) console.log(`  👤 Cliente criado: ID ${customerId}`);
  if (osId) console.log(`  🔧 OS criada: ID ${osId}`);
  if (paymentId) console.log(`  💳 Pagamento criado: ID ${paymentId}`);
  if (catId) console.log(`  🏷️  Categoria criada/deletada: ID ${catId}`);
  console.log(`${COLORS.green}════════════════════════════════════════════════════════${COLORS.reset}`);
}

run().catch(e => console.error('Fatal:', e));
