import { http, HttpResponse } from 'msw';

const mockTransactions = {
  data: [
    { id: 1, description: 'Salário', category: 'Salário', type: 'income', amount: 5000, date: '2024-01-15', status: 'Concluído' },
    { id: 2, description: 'Aluguel', category: 'Utilidades', type: 'expense', amount: 1200, date: '2024-01-10', status: 'Concluído' },
  ],
  meta: { total: 2, page: 1, totalPages: 1, limit: 20 },
};

const mockClientPayments = {
  data: [
    { id: 1, customerId: 1, description: 'Compra #001', totalAmount: 500, paidAmount: 0, purchaseDate: '2024-01-10', dueDate: '2024-02-10', paymentMethod: 'Crediário', status: 'pending', installmentsCount: 1, type: 'income' },
  ],
  meta: { total: 1, page: 1, totalPages: 1, limit: 20 },
};

const mockCustomers = [
  { id: 1, firstName: 'João', lastName: 'Silva', phone: '11999990000', createdAt: '2024-01-01' },
  { id: 2, firstName: 'Maria', lastName: 'Santos', cpf: '123.456.789-00', phone: '11888880000', createdAt: '2024-01-02' },
];

export const handlers = [
  http.get('/api/transactions', () => HttpResponse.json(mockTransactions)),
  http.post('/api/transactions', () => HttpResponse.json({ id: 3 })),
  http.put('/api/transactions/:id', () => HttpResponse.json({ success: true })),
  http.delete('/api/transactions/:id', () => HttpResponse.json({ success: true })),

  http.get('/api/client-payments', () => HttpResponse.json(mockClientPayments)),
  http.post('/api/client-payments', () => HttpResponse.json({ id: 2 })),
  http.put('/api/client-payments/:id', () => HttpResponse.json({ success: true })),
  http.delete('/api/client-payments/:id', () => HttpResponse.json({ success: true })),
  http.post('/api/client-payments/:id/pay', () => HttpResponse.json({ success: true })),

  http.get('/api/customers', () => HttpResponse.json(mockCustomers)),
  http.post('/api/customers', () => HttpResponse.json({ id: 3 })),
  http.put('/api/customers/:id', () => HttpResponse.json({ success: true })),
  http.delete('/api/customers/:id', () => HttpResponse.json({ success: true })),

  http.post('/api/login', async ({ request }) => {
    const body = await request.json() as { username: string; password: string };
    if (body.username === 'admin' && body.password === 'admin') {
      return HttpResponse.json({ id: 1, username: 'admin', name: 'Administrador', role: 'owner', permissions: ['manage_settings'], createdAt: '2024-01-01' });
    }
    return HttpResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
  }),

  http.get('/api/settings', () => HttpResponse.json({
    appName: 'INOVA PRO', settingsPassword: '', showWarnings: true, primaryColor: '#1152d4',
    fiscalYear: '2024', profileName: 'Inova', profileAvatar: '', appVersion: '1.0',
    initialBalance: 0, currency: 'BRL', hiddenColumns: [], receiptLayout: 'a4',
    categories: '', incomeCategories: '', expenseCategories: '',
  })),

  http.get('/api/categories', () => HttpResponse.json([
    { id: 1, name: 'Salário', type: 'income' },
    { id: 2, name: 'Alimentação', type: 'expense' },
  ])),

  http.get('/api/audit-logs', () => HttpResponse.json([])),
  http.get('/api/users', () => HttpResponse.json([])),
];
