import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import { z } from "zod";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("finance.db");

// --- Zod Schemas for Validation ---
const TransactionSchema = z.object({
  description: z.string().min(1),
  category: z.string().min(1),
  type: z.enum(['income', 'expense']),
  amount: z.number().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}/),
  createdBy: z.number().optional(),
  updatedBy: z.number().optional()
});

const CustomerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  nickname: z.string().optional().nullable(),
  cpf: z.string().optional().nullable(),
  companyName: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  observation: z.string().optional().nullable(),
  creditLimit: z.number().nonnegative().optional(),
  createdBy: z.number().optional(),
  updatedBy: z.number().optional()
});

const ClientPaymentSchema = z.object({
  customerId: z.number(),
  description: z.string().min(1),
  totalAmount: z.number().positive(),
  paidAmount: z.number().nonnegative().optional(),
  purchaseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}/),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}/),
  paymentMethod: z.string().min(1),
  status: z.enum(['pending', 'partial', 'paid']).optional(),
  installmentsCount: z.number().int().positive().optional(),
  type: z.enum(['income', 'expense']).optional(),
  saleId: z.string().optional().nullable(),
  paymentHistory: z.string().optional(), // JSON string
  createdBy: z.number().optional(),
  updatedBy: z.number().optional()
});

const ServiceOrderSchema = z.object({
  customerId: z.number(),
  equipmentType: z.string().optional().nullable(),
  equipmentBrand: z.string().optional().nullable(),
  equipmentModel: z.string().optional().nullable(),
  equipmentColor: z.string().optional().nullable(),
  equipmentSerial: z.string().optional().nullable(),
  reportedProblem: z.string().min(1),
  arrivalPhotoUrl: z.string().optional().nullable(),
  arrivalPhotoBase64: z.string().optional().nullable(),
  status: z.string().optional(),
  entryDate: z.string().optional().nullable(),
  analysisPrediction: z.string().optional().nullable(),
  customerPassword: z.string().optional().nullable(),
  accessories: z.string().optional().nullable(),
  ramInfo: z.string().optional().nullable(),
  ssdInfo: z.string().optional().nullable(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  technicalAnalysis: z.string().optional().nullable(),
  servicesPerformed: z.string().optional().nullable(),
  services: z.any().optional(), // JSON array
  partsUsed: z.any().optional(), // JSON array
  serviceFee: z.number().nonnegative().optional().nullable(),
  totalAmount: z.number().nonnegative().optional().nullable(),
  finalObservations: z.string().optional().nullable(),
  createdBy: z.number().optional(),
  updatedBy: z.number().optional()
});

// --- Helper for Paginated Responses ---
function getPaginatedData(tableName: string, page: number = 1, limit: number = 20, options: { 
  where?: string, 
  params?: any[], 
  orderBy?: string,
  join?: string,
  select?: string
} = {}) {
  const offset = (page - 1) * limit;
  const whereClause = options.where ? `WHERE ${options.where}` : "";
  const params = options.params || [];
  const orderBy = options.orderBy || "id DESC";
  const join = options.join || "";
  const select = options.select || "*";
  
  const countQuery = `SELECT COUNT(*) as total FROM ${tableName} ${join} ${whereClause}`;
  const total = db.prepare(countQuery).get(...params).total;
  
  const dataQuery = `SELECT ${select} FROM ${tableName} ${join} ${whereClause} ORDER BY ${orderBy} LIMIT ? OFFSET ?`;
  const data = db.prepare(dataQuery).all(...params, limit, offset);
  
  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
}

// Inicializar o banco de dados SQLite
db.exec(`
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    type TEXT CHECK(type IN ('income', 'expense')) NOT NULL,
    amount REAL NOT NULL,
    date TEXT NOT NULL,
    status TEXT DEFAULT 'Concluído'
  );

  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    appName TEXT DEFAULT 'Financeiro Pro',
    appVersion TEXT DEFAULT 'Versão Empresarial',
    fiscalYear TEXT DEFAULT '2024',
    primaryColor TEXT DEFAULT '#1152d4',
    categories TEXT DEFAULT 'Alimentação,Trabalho,Utilidades,Viagem,Lazer,Outros',
    incomeCategories TEXT DEFAULT 'Salário,Vendas,Serviços,Investimentos,Outros',
    expenseCategories TEXT DEFAULT 'Alimentação,Trabalho,Utilidades,Viagem,Lazer,Outros',
    profileName TEXT DEFAULT 'Inova Informática',
    profileAvatar TEXT DEFAULT 'https://picsum.photos/seed/inova/100/100',
    initialBalance REAL DEFAULT 0,
    showWarnings INTEGER DEFAULT 1,
    hiddenColumns TEXT DEFAULT '[]',
    settingsPassword TEXT DEFAULT '1234',
    receiptLayout TEXT DEFAULT 'a4',
    receiptLogo TEXT,
    companyCnpj TEXT,
    companyAddress TEXT,
    pixKey TEXT,
    pixQrCode TEXT
  );

  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    nickname TEXT,
    cpf TEXT,
    companyName TEXT,
    phone TEXT NOT NULL,
    observation TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS client_payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customerId INTEGER NOT NULL,
    description TEXT NOT NULL,
    totalAmount REAL NOT NULL,
    paidAmount REAL DEFAULT 0,
    purchaseDate TEXT NOT NULL,
    dueDate TEXT NOT NULL,
    paymentMethod TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    installmentsCount INTEGER DEFAULT 1,
    type TEXT DEFAULT 'income',
    saleId TEXT,
    FOREIGN KEY (customerId) REFERENCES customers(id)
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT CHECK(type IN ('income', 'expense')) NOT NULL
  );

  CREATE TABLE IF NOT EXISTS receipts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    paymentId INTEGER NOT NULL,
    content TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (paymentId) REFERENCES client_payments(id)
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT CHECK(role IN ('owner', 'manager', 'employee')) NOT NULL DEFAULT 'employee',
    name TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    entityId INTEGER,
    details TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS inventory_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT CHECK(category IN ('product', 'service')) NOT NULL,
    sku TEXT,
    unitPrice REAL NOT NULL,
    stockLevel INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    createdBy INTEGER,
    updatedBy INTEGER,
    FOREIGN KEY (createdBy) REFERENCES users(id),
    FOREIGN KEY (updatedBy) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS service_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customerId INTEGER NOT NULL,
    equipmentBrand TEXT,
    equipmentModel TEXT,
    equipmentType TEXT,
    equipmentColor TEXT,
    equipmentSerial TEXT,
    reportedProblem TEXT,
    arrivalPhotoUrl TEXT,
    arrivalPhotoBase64 TEXT,
    status TEXT DEFAULT 'Aguardando Análise',
    technicalAnalysis TEXT,
    servicesPerformed TEXT,
    services TEXT DEFAULT '[]',
    partsUsed TEXT DEFAULT '[]',
    serviceFee REAL DEFAULT 0,
    totalAmount REAL DEFAULT 0,
    finalObservations TEXT,
    entryDate TEXT,
    analysisPrediction TEXT,
    customerPassword TEXT,
    accessories TEXT,
    ramInfo TEXT,
    ssdInfo TEXT,
    priority TEXT DEFAULT 'medium',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    createdBy INTEGER,
    updatedBy INTEGER,
    FOREIGN KEY (customerId) REFERENCES customers(id),
    FOREIGN KEY (createdBy) REFERENCES users(id),
    FOREIGN KEY (updatedBy) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS service_order_statuses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    priority INTEGER DEFAULT 0,
    isDefault INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS brands (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS models (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    brandId INTEGER NOT NULL,
    name TEXT NOT NULL,
    FOREIGN KEY (brandId) REFERENCES brands(id),
    UNIQUE(brandId, name)
  );

  CREATE TABLE IF NOT EXISTS equipment_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    icon TEXT
  );
`);

// Garantir que as colunas novas existem (migrações simples)
const migrations = [
  { name: 'incomeCategories', table: 'settings', type: "TEXT DEFAULT 'Salário,Vendas,Serviços,Investimentos,Outros'" },
  { name: 'expenseCategories', table: 'settings', type: "TEXT DEFAULT 'Alimentação,Trabalho,Utilidades,Viagem,Lazer,Outros'" },
  { name: 'appVersion', table: 'settings', type: "TEXT DEFAULT 'Versão Empresarial'" },
  { name: 'initialBalance', table: 'settings', type: "REAL DEFAULT 0" },
  { name: 'showWarnings', table: 'settings', type: "INTEGER DEFAULT 1" },
  { name: 'hiddenColumns', table: 'settings', type: "TEXT DEFAULT '[]'" },
  { name: 'settingsPassword', table: 'settings', type: "TEXT DEFAULT '1234'" },
  { name: 'receiptLayout', table: 'settings', type: "TEXT DEFAULT 'a4'" },
  { name: 'receiptLogo', table: 'settings', type: "TEXT" },
  { name: 'companyCnpj', table: 'settings', type: "TEXT" },
  { name: 'companyAddress', table: 'settings', type: "TEXT" },
  { name: 'pixKey', table: 'settings', type: "TEXT" },
  { name: 'pixQrCode', table: 'settings', type: "TEXT" },
  { name: 'whatsappBillingTemplate', table: 'settings', type: "TEXT DEFAULT 'Olá {nome_cliente}, gostaríamos de lembrar sobre o débito pendente de {valor_divida}. Podemos ajudar com algo?'" },
  { name: 'whatsappOSTemplate', table: 'settings', type: "TEXT DEFAULT 'Olá {nome_cliente}, sua Ordem de Serviço #{os_id} ({equipamento}) está com o status: {status}.'" },
  { name: 'equipmentType', table: 'service_orders', type: "TEXT" },
  { name: 'equipmentColor', table: 'service_orders', type: "TEXT" },
  { name: 'equipmentType', table: 'brands', type: "TEXT" },
  { name: 'sendPulseClientId', table: 'settings', type: "TEXT" },
  { name: 'sendPulseClientSecret', table: 'settings', type: "TEXT" },
  { name: 'sendPulseTemplateId', table: 'settings', type: "TEXT" },
  { name: 'nickname', table: 'customers', type: "TEXT" },
  { name: 'cpf', table: 'customers', type: "TEXT" },
  { name: 'companyName', table: 'customers', type: "TEXT" },
  { name: 'observation', table: 'customers', type: "TEXT" },
  { name: 'creditLimit', table: 'customers', type: "REAL DEFAULT 0" },
  { name: 'paymentHistory', table: 'client_payments', type: "TEXT DEFAULT '[]'" },
  { name: 'createdBy', table: 'transactions', type: "INTEGER" },
  { name: 'updatedBy', table: 'transactions', type: "INTEGER" },
  { name: 'createdBy', table: 'client_payments', type: "INTEGER" },
  { name: 'updatedBy', table: 'client_payments', type: "INTEGER" },
  { name: 'createdBy', table: 'customers', type: "INTEGER" },
  { name: 'updatedBy', table: 'customers', type: "INTEGER" },
  { name: 'permissions', table: 'users', type: "TEXT DEFAULT '[]'" },
  { name: 'entryDate', table: 'service_orders', type: "TEXT" },
  { name: 'analysisPrediction', table: 'service_orders', type: "TEXT" },
  { name: 'customerPassword', table: 'service_orders', type: "TEXT" },
  { name: 'accessories', table: 'service_orders', type: "TEXT" },
  { name: 'ramInfo', table: 'service_orders', type: "TEXT" },
  { name: 'ssdInfo', table: 'service_orders', type: "TEXT" },
  { name: 'priority', table: 'service_orders', type: "TEXT DEFAULT 'medium'" },
  { name: 'arrivalPhotoBase64', table: 'service_orders', type: "TEXT" },
  { name: 'equipmentColor', table: 'service_orders', type: "TEXT" },
  { name: 'minQuantity', table: 'inventory_items', type: "INTEGER DEFAULT 5" },
  { name: 'costPrice', table: 'inventory_items', type: "REAL DEFAULT 0" },
  { name: 'salePrice', table: 'inventory_items', type: "REAL DEFAULT 0" },
  { name: 'quantity', table: 'inventory_items', type: "INTEGER DEFAULT 0" },
  { name: 'saleId', table: 'client_payments', type: "TEXT" },
  { name: 'icon', table: 'equipment_types', type: "TEXT" },
  { name: 'services', table: 'service_orders', type: "TEXT DEFAULT '[]'" },
  { name: 'paymentId', table: 'transactions', type: "INTEGER" },
  { name: 'saleId', table: 'transactions', type: "TEXT" }
];

migrations.forEach(m => {
  try {
    db.prepare(`ALTER TABLE ${m.table} ADD COLUMN ${m.name} ${m.type}`).run();
  } catch (e) {
    // Coluna já existe ou outro erro
  }
});

// Inserir usuário Admin padrão se não existir
const usersCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
if (usersCount.count === 0) {
  // Admin tem todas as permissões por padrão
  const allPermissions = JSON.stringify(['view_dashboard', 'manage_transactions', 'view_reports', 'manage_customers', 'manage_payments', 'manage_settings', 'manage_users']);
  db.prepare("INSERT INTO users (username, password, role, name, permissions) VALUES (?, ?, ?, ?, ?)").run('admin', 'admin', 'owner', 'Administrador', allPermissions);
}

// Inserir configurações padrão se não existirem
const settingsCount = db.prepare("SELECT COUNT(*) as count FROM settings").get() as { count: number };
if (settingsCount.count === 0) {
  db.prepare("INSERT INTO settings (id) VALUES (1)").run();
}

// Inserir categorias padrão se não existirem
const categoriesCount = db.prepare("SELECT COUNT(*) as count FROM categories").get() as { count: number };
if (categoriesCount.count === 0) {
  const insertCat = db.prepare("INSERT INTO categories (name, type) VALUES (?, ?)");
  const income = ['Salário', 'Vendas', 'Serviços', 'Investimentos', 'Outros'];
  const expense = ['Alimentação', 'Trabalho', 'Utilidades', 'Viagem', 'Lazer', 'Outros'];
  
  income.forEach(c => insertCat.run(c, 'income'));
  expense.forEach(c => insertCat.run(c, 'expense'));
}

// Inserir status de OS padrão se não existirem
const statusCount = db.prepare("SELECT COUNT(*) as count FROM service_order_statuses").get() as { count: number };
if (statusCount.count === 0) {
  const insertStatus = db.prepare("INSERT INTO service_order_statuses (name, color, priority, isDefault) VALUES (?, ?, ?, ?)");
  insertStatus.run('Aguardando Análise', '#f59e0b', 1, 1);
  insertStatus.run('Em Manutenção', '#3b82f6', 2, 1);
  insertStatus.run('Urgente', '#f43f5e', 3, 1);
  insertStatus.run('Aguardando Peças', '#f97316', 4, 1);
  insertStatus.run('Pronto para Retirada', '#10b981', 5, 1);
  insertStatus.run('Concluído', '#64748b', 6, 1);
  insertStatus.run('Sem Conserto', '#ef4444', 7, 1);
}

// Inserir tipos de equipamento padrão se não existirem
const equipmentTypesCount = db.prepare("SELECT COUNT(*) as count FROM equipment_types").get() as { count: number };
if (equipmentTypesCount.count === 0) {
  const insertType = db.prepare("INSERT INTO equipment_types (name) VALUES (?)");
  const defaultTypes = ['Notebook', 'Desktop', 'Smartphone', 'Tablet', 'Monitor', 'Impressora', 'Console'];
  defaultTypes.forEach(t => insertType.run(t));
}

// Inserir dados iniciais se o banco estiver vazio
const count = db.prepare("SELECT COUNT(*) as count FROM transactions").get() as { count: number };
if (count.count === 0) {
  const insert = db.prepare("INSERT INTO transactions (description, category, type, amount, date, status) VALUES (?, ?, ?, ?, ?, ?)");
  insert.run("Mercado Whole Foods", "Alimentação", "expense", 142.50, "2024-10-24", "Concluído");
  insert.run("Salário Mensal", "Trabalho", "income", 4500.00, "2024-10-24", "Concluído");
  insert.run("Conta de Luz", "Utilidades", "expense", 85.20, "2024-10-24", "Pendente");
  insert.run("Starbucks Coffee", "Alimentação", "expense", 12.45, "2024-10-24", "Concluído");
  insert.run("Posto de Gasolina Shell", "Viagem", "expense", 55.00, "2024-10-24", "Falhou");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Rotas da API

  // Buscar todas as transações
  app.get("/api/transactions", (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const type = req.query.type as string;
    const category = req.query.category as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const minAmount = parseFloat(req.query.minAmount as string);
    const maxAmount = parseFloat(req.query.maxAmount as string);
    
    let whereConditions = [];
    let params = [];

    if (search) {
      whereConditions.push("(description LIKE ? OR category LIKE ? OR CAST(amount AS TEXT) LIKE ?)");
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (type && type !== 'all') {
      whereConditions.push("type = ?");
      params.push(type);
    }

    if (category && category !== 'all') {
      whereConditions.push("category = ?");
      params.push(category);
    }

    if (startDate) {
      whereConditions.push("date >= ?");
      params.push(startDate);
    }

    if (endDate) {
      whereConditions.push("date <= ?");
      params.push(endDate);
    }

    if (!isNaN(minAmount)) {
      whereConditions.push("amount >= ?");
      params.push(minAmount);
    }

    if (!isNaN(maxAmount)) {
      whereConditions.push("amount <= ?");
      params.push(maxAmount);
    }

    let options: any = { 
      orderBy: "t.date DESC, t.id DESC",
      select: "t.*, c.firstName || ' ' || c.lastName as customerName, c.phone as customerPhone",
      join: "LEFT JOIN client_payments cp ON t.paymentId = cp.id LEFT JOIN customers c ON cp.customerId = c.id"
    };
    if (whereConditions.length > 0) {
      options.where = whereConditions.map(c => c.startsWith('(') ? c : `t.${c}`).join(" AND ");
      options.params = params;
    }
    
    const result = getPaginatedData("transactions t", page, limit, options);
    res.json(result);
  });

  // Adicionar uma nova transação
  app.post("/api/transactions", (req, res) => {
    try {
      console.log('[TRANSACTION POST] Received body:', req.body);
      const validatedData = TransactionSchema.parse(req.body);
      const { description, category, type, amount, date, createdBy } = validatedData;
      const info = db.prepare(
        "INSERT INTO transactions (description, category, type, amount, date, createdBy) VALUES (?, ?, ?, ?, ?, ?)"
      ).run(description, category, type, amount, date, createdBy || 1);
      
      // Audit Log
      db.prepare("INSERT INTO audit_logs (userId, action, entity, entityId, details) VALUES (?, ?, ?, ?, ?)").run(createdBy || 1, 'create', 'transaction', info.lastInsertRowid, `Created transaction: ${description}`);
      
      res.json({ id: info.lastInsertRowid });
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.log('[TRANSACTION POST] Validation error:', error.issues);
        return res.status(400).json({ error: "Validation failed", details: error.issues });
      }
      console.log('[TRANSACTION POST] Server error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Deletar uma transação
  app.delete("/api/transactions/:id", (req, res) => {
    const txId = req.params.id;
    const tx = db.prepare("SELECT * FROM transactions WHERE id = ?").get(txId) as any;
    
    if (tx) {
      // Se a transação estiver vinculada a um pagamento, atualiza o valor pago no pagamento
      if (tx.paymentId) {
        const payment = db.prepare("SELECT * FROM client_payments WHERE id = ?").get(tx.paymentId) as any;
        if (payment) {
          const newPaidAmount = Math.max(0, payment.paidAmount - tx.amount);
          const newStatus = newPaidAmount >= payment.totalAmount ? 'paid' : 'pending';
          db.prepare("UPDATE client_payments SET paidAmount = ?, status = ? WHERE id = ?")
            .run(newPaidAmount, newStatus, tx.paymentId);
        }
      }

      db.prepare("DELETE FROM transactions WHERE id = ?").run(txId);
      db.prepare("INSERT INTO audit_logs (userId, action, entity, entityId, details) VALUES (?, ?, ?, ?, ?)").run(1, 'delete', 'transaction', txId, `Deleted transaction: ${tx.description}`);
    }
    
    res.json({ success: true });
  });

  // Atualizar uma transação
  app.put("/api/transactions/:id", (req, res) => {
    const { description, category, type, amount, date, updatedBy } = req.body;
    db.prepare(`
      UPDATE transactions 
      SET description = ?, category = ?, type = ?, amount = ?, date = ?, updatedBy = ?
      WHERE id = ?
    `).run(description, category, type, amount, date, updatedBy || 1, req.params.id);
    
    db.prepare("INSERT INTO audit_logs (userId, action, entity, entityId, details) VALUES (?, ?, ?, ?, ?)").run(updatedBy || 1, 'update', 'transaction', req.params.id, `Updated transaction: ${description}`);

    res.json({ success: true });
  });

  // Rota de Estatísticas
  app.get("/api/stats", (req, res) => {
    const totalIncome = db.prepare("SELECT SUM(amount) as total FROM transactions WHERE type = 'income'").get().total || 0;
    const totalExpenses = db.prepare("SELECT SUM(amount) as total FROM transactions WHERE type = 'expense'").get().total || 0;
    const pendingPayments = db.prepare("SELECT COUNT(*) as count FROM client_payments WHERE status != 'paid'").get().count || 0;
    const activeOS = db.prepare("SELECT COUNT(*) as count FROM service_orders WHERE status NOT IN ('completed', 'delivered', 'cancelled')").get().count || 0;
    
    // Dados para o gráfico (últimos 12 meses)
    const chartData = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const month = d.toISOString().slice(0, 7); // YYYY-MM
      const name = d.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase();
      
      const income = db.prepare("SELECT SUM(amount) as total FROM transactions WHERE type = 'income' AND date LIKE ?").get(`${month}%`).total || 0;
      const expense = db.prepare("SELECT SUM(amount) as total FROM transactions WHERE type = 'expense' AND date LIKE ?").get(`${month}%`).total || 0;
      
      chartData.push({ name, income, expense });
    }

    // Ranking de categorias
    const incomeRanking = db.prepare("SELECT category, SUM(amount) as total FROM transactions WHERE type = 'income' GROUP BY category ORDER BY total DESC").all() as any[];
    const expenseRanking = db.prepare("SELECT category, SUM(amount) as total FROM transactions WHERE type = 'expense' GROUP BY category ORDER BY total DESC").all() as any[];

    res.json({
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
      pendingPayments,
      activeOS,
      chartData,
      sortedIncomeRanking: incomeRanking.map(r => [r.category, r.total]),
      sortedExpenseRanking: expenseRanking.map(r => [r.category, r.total])
    });
  });

  // Rotas de Configurações
  app.get("/api/settings", (req, res) => {
    const settings = db.prepare("SELECT * FROM settings WHERE id = 1").get() as any;
    if (settings) {
      // Converter tipos do SQLite para o Frontend
      settings.showWarnings = !!settings.showWarnings;
      try {
        settings.hiddenColumns = JSON.parse(settings.hiddenColumns || '[]');
      } catch (e) {
        settings.hiddenColumns = [];
      }
    }
    res.json(settings);
  });

  app.post("/api/settings", (req, res) => {
    const { 
      appName, appVersion, fiscalYear, primaryColor, categories, 
      incomeCategories, expenseCategories,
      profileName, profileAvatar, initialBalance, showWarnings, 
      hiddenColumns, settingsPassword, receiptLayout, receiptLogo,
      sendPulseClientId, sendPulseClientSecret, sendPulseTemplateId
    } = req.body;
    
    db.prepare(`
      UPDATE settings 
      SET appName = ?, appVersion = ?, fiscalYear = ?, primaryColor = ?, 
          categories = ?, incomeCategories = ?, expenseCategories = ?, profileName = ?, profileAvatar = ?, 
          initialBalance = ?, showWarnings = ?, hiddenColumns = ?, 
          settingsPassword = ?, receiptLayout = ?, receiptLogo = ?,
          sendPulseClientId = ?, sendPulseClientSecret = ?, sendPulseTemplateId = ?
      WHERE id = 1
    `).run(
      appName, appVersion, fiscalYear, primaryColor, 
      categories, incomeCategories, expenseCategories, profileName, profileAvatar, initialBalance, 
      showWarnings ? 1 : 0, JSON.stringify(hiddenColumns || []), 
      settingsPassword, receiptLayout || 'a4', receiptLogo || '',
      sendPulseClientId || '', sendPulseClientSecret || '', sendPulseTemplateId || ''
    );
    res.json({ success: true });
  });

  // Rotas de Clientes
  app.get("/api/customers", (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    
    let options: any = { orderBy: "firstName ASC" };
    if (search) {
      options.where = "firstName LIKE ? OR lastName LIKE ? OR nickname LIKE ? OR phone LIKE ? OR companyName LIKE ?";
      options.params = [`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%` ];
    }
    
    const result = getPaginatedData("customers", page, limit, options);
    res.json(result);
  });

  app.post("/api/customers", (req, res) => {
    try {
      const validatedData = CustomerSchema.parse(req.body);
      const { firstName, lastName, nickname, cpf, companyName, phone, observation, creditLimit, createdBy } = validatedData;
      const result = db.prepare(`
        INSERT INTO customers (firstName, lastName, nickname, cpf, companyName, phone, observation, creditLimit, createdBy) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(firstName, lastName, nickname || null, cpf || null, companyName || null, phone || '', observation || null, creditLimit || 0, createdBy || 1);
      
      db.prepare("INSERT INTO audit_logs (userId, action, entity, entityId, details) VALUES (?, ?, ?, ?, ?)").run(createdBy || 1, 'create', 'customer', result.lastInsertRowid, `Created customer: ${firstName} ${lastName}`);

      res.json({ id: result.lastInsertRowid });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.issues });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/customers/:id", (req, res) => {
    try {
      const validatedData = CustomerSchema.parse(req.body);
      const { firstName, lastName, nickname, cpf, companyName, phone, observation, creditLimit, updatedBy } = validatedData;
      db.prepare(`
        UPDATE customers 
        SET firstName = ?, lastName = ?, nickname = ?, cpf = ?, companyName = ?, phone = ?, observation = ?, creditLimit = ?, updatedBy = ?
        WHERE id = ?
      `).run(firstName, lastName, nickname || null, cpf || null, companyName || null, phone || '', observation || null, creditLimit || 0, updatedBy || 1, req.params.id);
      
      db.prepare("INSERT INTO audit_logs (userId, action, entity, entityId, details) VALUES (?, ?, ?, ?, ?)").run(updatedBy || 1, 'update', 'customer', req.params.id, `Updated customer: ${firstName} ${lastName}`);

      res.json({ success: true });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.issues });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/customers/:id/payments", (req, res) => {
    const payments = db.prepare("SELECT * FROM client_payments WHERE customerId = ?").all(req.params.id);
    res.json(payments);
  });

  app.delete("/api/customers/:id", (req, res) => {
    db.prepare("DELETE FROM transactions WHERE paymentId IN (SELECT id FROM client_payments WHERE customerId = ?)").run(req.params.id);
    db.prepare("DELETE FROM client_payments WHERE customerId = ?").run(req.params.id);
    db.prepare("DELETE FROM customers WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Rotas de Pagamentos de Clientes
  app.get("/api/client-payments", (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    
    let options: any = {
      select: "cp.*, c.firstName || ' ' || c.lastName as customerName",
      join: "cp JOIN customers c ON cp.customerId = c.id",
      orderBy: "cp.dueDate ASC"
    };
    
    if (search) {
      options.where = "c.firstName LIKE ? OR c.lastName LIKE ? OR cp.description LIKE ? OR cp.saleId LIKE ?";
      options.params = [`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%` ];
    }
    
    const result = getPaginatedData("client_payments", page, limit, options);
    res.json(result);
  });

  app.post("/api/client-payments", (req, res) => {
    try {
      const validatedData = ClientPaymentSchema.parse(req.body);
      const { 
        customerId, description, totalAmount, paidAmount, 
        purchaseDate, dueDate, paymentMethod, status, installmentsCount, type, saleId, createdBy 
      } = validatedData;
      
      // Initialize payment history if there's an initial payment
      const initialPaymentHistory = paidAmount && paidAmount > 0 ? JSON.stringify([{
        amount: paidAmount,
        date: new Date().toISOString()
      }]) : '[]';

      const result = db.prepare(`
        INSERT INTO client_payments 
        (customerId, description, totalAmount, paidAmount, purchaseDate, dueDate, paymentMethod, status, installmentsCount, type, paymentHistory, saleId, createdBy)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        customerId, description, totalAmount, paidAmount || 0, 
        purchaseDate, dueDate, paymentMethod, status || 'pending', 
        installmentsCount || 1, type || 'income', initialPaymentHistory, saleId || null, createdBy || 1
      );
      
      // Se houver um valor pago inicialmente, cria uma transação financeira
      if (paidAmount && paidAmount > 0) {
        const customer = db.prepare("SELECT firstName, lastName FROM customers WHERE id = ?").get(customerId) as any;
        const customerName = customer ? `${customer.firstName} ${customer.lastName}` : 'Cliente';
        
        db.prepare(`
          INSERT INTO transactions (description, category, type, amount, date, createdBy, paymentId, saleId)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          `Pagamento: ${description} (${customerName})`,
          'Vendas',
          'income',
          paidAmount,
          purchaseDate || new Date().toISOString().split('T')[0],
          createdBy || 1,
          result.lastInsertRowid,
          saleId || null
        );
      }

      db.prepare("INSERT INTO audit_logs (userId, action, entity, entityId, details) VALUES (?, ?, ?, ?, ?)").run(createdBy || 1, 'create', 'client_payment', result.lastInsertRowid, `Created payment: ${description}`);

      res.json({ id: result.lastInsertRowid });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.issues });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/client-payments/:id", (req, res) => {
    const { paidAmount, status, paymentHistory, updatedBy } = req.body;
    
    if (paymentHistory) {
      db.prepare("UPDATE client_payments SET paidAmount = ?, status = ?, paymentHistory = ?, updatedBy = ? WHERE id = ?").run(paidAmount, status, JSON.stringify(paymentHistory), updatedBy || 1, req.params.id);
    } else {
      db.prepare("UPDATE client_payments SET paidAmount = ?, status = ?, updatedBy = ? WHERE id = ?").run(paidAmount, status, updatedBy || 1, req.params.id);
    }
    
    db.prepare("INSERT INTO audit_logs (userId, action, entity, entityId, details) VALUES (?, ?, ?, ?, ?)").run(updatedBy || 1, 'update', 'client_payment', req.params.id, `Updated payment status: ${status}`);

    res.json({ success: true });
  });

  app.put("/api/client-payments/:id", (req, res) => {
    // Alias para PATCH para compatibilidade com o frontend
    const { paidAmount, status, paymentHistory, updatedBy } = req.body;
    
    if (paymentHistory) {
      db.prepare("UPDATE client_payments SET paidAmount = ?, status = ?, paymentHistory = ?, updatedBy = ? WHERE id = ?").run(paidAmount, status, JSON.stringify(paymentHistory), updatedBy || 1, req.params.id);
    } else {
      db.prepare("UPDATE client_payments SET paidAmount = ?, status = ?, updatedBy = ? WHERE id = ?").run(paidAmount, status, updatedBy || 1, req.params.id);
    }
    
    db.prepare("INSERT INTO audit_logs (userId, action, entity, entityId, details) VALUES (?, ?, ?, ?, ?)").run(updatedBy || 1, 'update', 'client_payment', req.params.id, `Updated payment (PUT) status: ${status}`);

    res.json({ success: true });
  });

  app.post("/api/client-payments/:id/pay", (req, res) => {
    const { amount, date, updatedBy } = req.body;
    const paymentId = req.params.id;

    const payment = db.prepare("SELECT * FROM client_payments WHERE id = ?").get(paymentId) as any;
    if (!payment) return res.status(404).json({ error: "Payment not found" });

    const newPaidAmount = payment.paidAmount + amount;
    const newStatus = newPaidAmount >= payment.totalAmount ? 'paid' : 'partial';
    
    let history = [];
    try {
      history = JSON.parse(payment.paymentHistory || '[]');
    } catch (e) {}
    
    history.push({ amount, date: date || new Date().toISOString() });

    db.prepare(`
      UPDATE client_payments 
      SET paidAmount = ?, status = ?, paymentHistory = ?, updatedBy = ?
      WHERE id = ?
    `).run(newPaidAmount, newStatus, JSON.stringify(history), updatedBy || 1, paymentId);

    // Criar transação financeira
    const customer = db.prepare("SELECT firstName, lastName FROM customers WHERE id = ?").get(payment.customerId) as any;
    const customerName = customer ? `${customer.firstName} ${customer.lastName}` : 'Cliente';

    db.prepare(`
      INSERT INTO transactions (description, category, type, amount, date, createdBy, paymentId, saleId)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      `Recebimento: ${payment.description} (${customerName})`,
      'Vendas',
      'income',
      amount,
      (date || new Date().toISOString()).split('T')[0],
      updatedBy || 1,
      paymentId,
      payment.saleId || null
    );

    db.prepare("INSERT INTO audit_logs (userId, action, entity, entityId, details) VALUES (?, ?, ?, ?, ?)").run(updatedBy || 1, 'update', 'client_payment', paymentId, `Recorded payment of ${amount}`);

    res.json({ success: true, newPaidAmount, newStatus });
  });

  app.delete("/api/client-payments/:id", (req, res) => {
    db.prepare("DELETE FROM transactions WHERE paymentId = ?").run(req.params.id);
    db.prepare("DELETE FROM client_payments WHERE id = ?").run(req.params.id);
    db.prepare("INSERT INTO audit_logs (userId, action, entity, entityId, details) VALUES (?, ?, ?, ?, ?)").run(1, 'delete', 'client_payment', req.params.id, `Deleted payment ID: ${req.params.id}`);
    res.json({ success: true });
  });

  app.delete("/api/client-payments/group/:saleId", (req, res) => {
    const { saleId } = req.params;
    db.prepare("DELETE FROM transactions WHERE saleId = ?").run(saleId);
    db.prepare("DELETE FROM client_payments WHERE saleId = ?").run(saleId);
    db.prepare("INSERT INTO audit_logs (userId, action, entity, entityId, details) VALUES (?, ?, ?, ?, ?)").run(1, 'delete', 'client_payment_group', 0, `Deleted payment group: ${saleId}`);
    res.json({ success: true });
  });

  // Rotas de Categorias
  app.get("/api/categories", (req, res) => {
    const categories = db.prepare("SELECT * FROM categories ORDER BY name ASC").all();
    res.json(categories);
  });

  app.post("/api/categories", (req, res) => {
    const { name, type } = req.body;
    const result = db.prepare("INSERT INTO categories (name, type) VALUES (?, ?)").run(name, type);
    res.json({ id: result.lastInsertRowid });
  });

  app.delete("/api/categories/:id", (req, res) => {
    db.prepare("DELETE FROM categories WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Rotas de Recibos
  app.get("/api/receipts/:paymentId", (req, res) => {
    const receipts = db.prepare("SELECT * FROM receipts WHERE paymentId = ? ORDER BY createdAt DESC").all();
    res.json(receipts);
  });

  app.post("/api/receipts", (req, res) => {
    const { paymentId, content } = req.body;
    const result = db.prepare("INSERT INTO receipts (paymentId, content) VALUES (?, ?)").run(paymentId, content);
    res.json({ id: result.lastInsertRowid });
  });

  // Rotas de Autenticação
  app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE username = ? AND password = ?").get(username, password) as any;
    
    if (user) {
      // Parse permissions
      try {
        user.permissions = JSON.parse(user.permissions || '[]');
      } catch (e) {
        user.permissions = [];
      }
      
      // Se for owner, garante todas as permissões
      if (user.role === 'owner') {
        user.permissions = ['view_dashboard', 'manage_transactions', 'view_reports', 'manage_customers', 'manage_payments', 'manage_settings', 'manage_users'];
      }

      res.json(user);
    } else {
      res.status(401).json({ error: "Credenciais inválidas" });
    }
  });

  // Rotas de Usuários
  app.get("/api/users", (req, res) => {
    const users = db.prepare("SELECT id, username, role, name, permissions, createdAt FROM users ORDER BY name ASC").all();
    
    // Parse permissions for each user
    const usersWithPermissions = users.map((u: any) => {
      try {
        u.permissions = JSON.parse(u.permissions || '[]');
      } catch (e) {
        u.permissions = [];
      }
      return u;
    });

    res.json(usersWithPermissions);
  });

  app.post("/api/users", (req, res) => {
    const { username, password, role, name, permissions } = req.body;
    try {
      const permsString = JSON.stringify(permissions || []);
      const result = db.prepare("INSERT INTO users (username, password, role, name, permissions) VALUES (?, ?, ?, ?, ?)").run(username, password, role, name, permsString);
      
      // Log action
      db.prepare("INSERT INTO audit_logs (userId, action, entity, entityId, details) VALUES (?, ?, ?, ?, ?)").run(1, 'create', 'user', result.lastInsertRowid, `Created user ${username}`);
      
      res.json({ id: result.lastInsertRowid });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put("/api/users/:id", (req, res) => {
    const { name, role, password, permissions } = req.body;
    
    try {
      const permsString = JSON.stringify(permissions || []);
      
      if (password) {
        db.prepare("UPDATE users SET name = ?, role = ?, password = ?, permissions = ? WHERE id = ?").run(name, role, password, permsString, req.params.id);
      } else {
        db.prepare("UPDATE users SET name = ?, role = ?, permissions = ? WHERE id = ?").run(name, role, permsString, req.params.id);
      }
      
      db.prepare("INSERT INTO audit_logs (userId, action, entity, entityId, details) VALUES (?, ?, ?, ?, ?)").run(1, 'update', 'user', req.params.id, `Updated user ${name}`);
      
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.delete("/api/users/:id", (req, res) => {
    try {
      const userId = req.params.id;
      
      // Remove foreign key references to avoid constraint errors
      db.prepare("UPDATE audit_logs SET userId = NULL WHERE userId = ?").run(userId);
      db.prepare("UPDATE inventory_items SET createdBy = NULL WHERE createdBy = ?").run(userId);
      db.prepare("UPDATE inventory_items SET updatedBy = NULL WHERE updatedBy = ?").run(userId);
      db.prepare("UPDATE service_orders SET createdBy = NULL WHERE createdBy = ?").run(userId);
      db.prepare("UPDATE service_orders SET updatedBy = NULL WHERE updatedBy = ?").run(userId);
      
      db.prepare("DELETE FROM users WHERE id = ?").run(userId);
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // Rotas de Auditoria
  app.get("/api/audit-logs", (req, res) => {
    const logs = db.prepare(`
      SELECT l.*, u.name as userName 
      FROM audit_logs l 
      LEFT JOIN users u ON l.userId = u.id 
      ORDER BY l.timestamp DESC 
      LIMIT 100
    `).all();
    res.json(logs);
  });

  // Rotas de Inventário
  app.get("/api/inventory", (req, res) => {
    const items = db.prepare("SELECT * FROM inventory_items ORDER BY name ASC").all();
    res.json(items);
  });

  app.post("/api/inventory", (req, res) => {
    const { name, category, sku, costPrice, salePrice, quantity, minQuantity, unitPrice, stockLevel, createdBy } = req.body;
    try {
      const finalUnitPrice = unitPrice !== undefined ? unitPrice : (salePrice || 0);
      const finalStockLevel = stockLevel !== undefined ? stockLevel : (quantity || 0);
      
      const result = db.prepare("INSERT INTO inventory_items (name, category, sku, costPrice, salePrice, quantity, minQuantity, unitPrice, stockLevel, createdBy) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(
        name, category, sku, costPrice || 0, finalUnitPrice, finalStockLevel, minQuantity || 5, finalUnitPrice, finalStockLevel, createdBy || 1
      );
      
      db.prepare("INSERT INTO audit_logs (userId, action, entity, entityId, details) VALUES (?, ?, ?, ?, ?)").run(createdBy || 1, 'create', 'InventoryItem', result.lastInsertRowid, `Created item ${name}`);
      
      res.json({ id: result.lastInsertRowid });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put("/api/inventory/:id", (req, res) => {
    const { name, category, sku, costPrice, salePrice, quantity, minQuantity, unitPrice, stockLevel, updatedBy } = req.body;
    try {
      const finalUnitPrice = unitPrice !== undefined ? unitPrice : (salePrice || 0);
      const finalStockLevel = stockLevel !== undefined ? stockLevel : (quantity || 0);
      
      db.prepare("UPDATE inventory_items SET name = ?, category = ?, sku = ?, costPrice = ?, salePrice = ?, quantity = ?, minQuantity = ?, unitPrice = ?, stockLevel = ?, updatedBy = ? WHERE id = ?").run(
        name, category, sku, costPrice || 0, finalUnitPrice, finalStockLevel, minQuantity || 5, finalUnitPrice, finalStockLevel, updatedBy || 1, req.params.id
      );
      
      db.prepare("INSERT INTO audit_logs (userId, action, entity, entityId, details) VALUES (?, ?, ?, ?, ?)").run(updatedBy || 1, 'update', 'InventoryItem', req.params.id, `Updated item ${name}`);
      
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.delete("/api/inventory/:id", (req, res) => {
    try {
      db.prepare("DELETE FROM inventory_items WHERE id = ?").run(req.params.id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // Rotas de Ordens de Serviço (OS)
  app.get("/api/service-orders", (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const status = req.query.status as string;
    const priority = req.query.priority as string;
    const sortByQuery = req.query.sortBy as string || 'newest';
    
    let orderBy = 'so.createdAt DESC';
    if (sortByQuery === 'oldest') orderBy = 'so.createdAt ASC';
    if (sortByQuery === 'priority') orderBy = "CASE WHEN so.priority = 'urgent' THEN 1 WHEN so.priority = 'high' THEN 2 WHEN so.priority = 'medium' THEN 3 ELSE 4 END, so.createdAt DESC";
    if (sortByQuery === 'prediction') orderBy = 'so.analysisPrediction ASC, so.createdAt DESC';
    if (sortByQuery === 'amount-desc') orderBy = 'CAST(so.totalAmount AS REAL) DESC, so.createdAt DESC';
    if (sortByQuery === 'amount-asc') orderBy = 'CAST(so.totalAmount AS REAL) ASC, so.createdAt DESC';
    
    let options: any = {
      select: "so.*, c.firstName, c.lastName, c.phone",
      join: "so LEFT JOIN customers c ON so.customerId = c.id",
      orderBy: orderBy,
      where: [],
      params: []
    };
    
    if (search) {
      const searchLower = search.toLowerCase().trim();
      const osIdMatch = searchLower.match(/^(?:#?os-?)?(\d+)$/i);
      
      if (osIdMatch) {
        const osId = osIdMatch[1];
        options.where.push("(CAST(so.id AS TEXT) = ? OR CAST(so.id AS TEXT) LIKE ? OR c.firstName LIKE ? OR c.lastName LIKE ? OR so.equipmentBrand LIKE ? OR so.equipmentModel LIKE ? OR so.equipmentType LIKE ?)");
        options.params.push(osId, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
      } else {
        options.where.push("(c.firstName LIKE ? OR c.lastName LIKE ? OR so.equipmentBrand LIKE ? OR so.equipmentModel LIKE ? OR so.equipmentType LIKE ? OR so.equipmentSerial LIKE ? OR CAST(so.id AS TEXT) LIKE ?)");
        options.params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
      }
    }

    if (status && status !== 'all') {
      options.where.push("so.status = ?");
      options.params.push(status);
    }

    if (priority && priority !== 'all') {
      options.where.push("so.priority = ?");
      options.params.push(priority);
    }

    const dateFilter = req.query.dateFilter as string;
    if (dateFilter && dateFilter !== 'all') {
      const now = new Date();
      if (dateFilter === 'today') {
        options.where.push("date(so.createdAt) = date('now', 'localtime')");
      } else if (dateFilter === 'week') {
        options.where.push("date(so.createdAt) >= date('now', 'localtime', '-7 days')");
      } else if (dateFilter === 'month') {
        options.where.push("date(so.createdAt) >= date('now', 'localtime', 'start of month')");
      }
    }

    if (options.where.length > 0) {
      options.where = options.where.join(" AND ");
    } else {
      delete options.where;
    }
    
    const result = getPaginatedData("service_orders", page, limit, options);
    
    // Calculate status counts for all orders (not just the current page)
    const counts = db.prepare(`
      SELECT 
        COUNT(CASE WHEN status IN ('Aguardando Análise', 'Aguardando Peças') THEN 1 END) as awaiting,
        COUNT(CASE WHEN status IN ('Em Manutenção', 'Em Reparo', 'Aprovado') THEN 1 END) as active,
        COUNT(CASE WHEN status IN ('Pronto para Retirada', 'Pronto', 'Concluído') THEN 1 END) as ready,
        COUNT(CASE WHEN status = 'Urgente' OR (priority = 'high' AND status NOT IN ('Pronto para Retirada', 'Pronto', 'Concluído', 'Entregue')) THEN 1 END) as urgent
      FROM service_orders
    `).get() as any;

    (result.meta as any).counts = counts;
    
    result.data = result.data.map((o: any) => {
      try {
        o.partsUsed = JSON.parse(o.partsUsed || '[]');
      } catch (e) {
        o.partsUsed = [];
      }
      try {
        o.services = JSON.parse(o.services || '[]');
      } catch (e) {
        o.services = [];
      }
      return o;
    });
    
    res.json(result);
  });

  app.post("/api/service-orders", (req, res) => {
    try {
      const validatedData = ServiceOrderSchema.parse(req.body);
      const { 
        customerId, equipmentType, equipmentBrand, equipmentModel, equipmentColor, equipmentSerial, 
        reportedProblem, arrivalPhotoUrl, arrivalPhotoBase64, status, entryDate, analysisPrediction, 
        customerPassword, accessories, ramInfo, ssdInfo, priority, createdBy,
        technicalAnalysis, servicesPerformed, services, partsUsed, serviceFee, totalAmount, finalObservations
      } = validatedData;
      
      const partsString = JSON.stringify(partsUsed || []);
      const servicesString = JSON.stringify(services || []);
      
      const result = db.prepare(`
        INSERT INTO service_orders (
          customerId, equipmentType, equipmentBrand, equipmentModel, equipmentColor, equipmentSerial, 
          reportedProblem, arrivalPhotoUrl, arrivalPhotoBase64, status, entryDate, analysisPrediction, 
          customerPassword, accessories, ramInfo, ssdInfo, priority, createdBy,
          technicalAnalysis, servicesPerformed, services, partsUsed, serviceFee, totalAmount, finalObservations
        ) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        customerId, equipmentType || null, equipmentBrand || null, equipmentModel || null, equipmentColor || null, equipmentSerial || null, 
        reportedProblem, arrivalPhotoUrl || null, arrivalPhotoBase64 || null, status || 'Aguardando Análise', 
        entryDate || null, analysisPrediction || null, customerPassword || null, accessories || null, 
        ramInfo || null, ssdInfo || null, priority || 'medium', createdBy || 1,
        technicalAnalysis || null, servicesPerformed || null, servicesString, partsString, 
        serviceFee || 0, totalAmount || 0, finalObservations || null
      );
      
      db.prepare("INSERT INTO audit_logs (userId, action, entity, entityId, details) VALUES (?, ?, ?, ?, ?)").run(createdBy || 1, 'create', 'ServiceOrder', result.lastInsertRowid, `Created OS for customer ${customerId}`);
      
      res.json({ id: result.lastInsertRowid });
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation failed for Service Order:", error.issues);
        return res.status(400).json({ error: "Validation failed", details: error.issues });
      }
      console.error("Internal server error in POST /api/service-orders:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/service-orders/:id", (req, res) => {
    try {
      const validatedData = ServiceOrderSchema.partial().parse(req.body);
      const { 
        status, technicalAnalysis, servicesPerformed, services, partsUsed, 
        serviceFee, totalAmount, finalObservations, entryDate, analysisPrediction, 
        customerPassword, accessories, ramInfo, ssdInfo, priority, 
        equipmentType, equipmentBrand, equipmentModel, equipmentColor, equipmentSerial, arrivalPhotoBase64, updatedBy 
      } = validatedData as any;
      
      // Fetch old OS to compare parts and update inventory
      const oldOs = db.prepare("SELECT partsUsed FROM service_orders WHERE id = ?").get(req.params.id) as any;
      let oldParts: any[] = [];
      try {
        oldParts = JSON.parse(oldOs?.partsUsed || '[]');
      } catch (e) {}

      const newParts = partsUsed ? (typeof partsUsed === 'string' ? JSON.parse(partsUsed) : partsUsed) : null;
      const newServices = services ? (typeof services === 'string' ? JSON.parse(services) : services) : null;
      
      // Update inventory based on parts changes if partsUsed was provided
      if (newParts) {
        // 1. Add back old parts
        oldParts.forEach((p: any) => {
          if (p.id) {
            db.prepare("UPDATE inventory_items SET stockLevel = stockLevel + ? WHERE id = ?").run(p.quantity, p.id);
          }
        });
        
        // 2. Deduct new parts
        newParts.forEach((p: any) => {
          if (p.id) {
            db.prepare("UPDATE inventory_items SET stockLevel = stockLevel - ? WHERE id = ?").run(p.quantity, p.id);
          }
        });
      }

      const partsString = newParts ? JSON.stringify(newParts) : null;
      const servicesString = newServices ? JSON.stringify(newServices) : null;
      
      db.prepare(`
        UPDATE service_orders 
        SET status = COALESCE(?, status), 
            technicalAnalysis = COALESCE(?, technicalAnalysis), 
            servicesPerformed = COALESCE(?, servicesPerformed), 
            services = COALESCE(?, services),
            partsUsed = COALESCE(?, partsUsed), 
            serviceFee = COALESCE(?, serviceFee), 
            totalAmount = COALESCE(?, totalAmount), 
            finalObservations = COALESCE(?, finalObservations), 
            entryDate = COALESCE(?, entryDate), 
            analysisPrediction = COALESCE(?, analysisPrediction), 
            customerPassword = COALESCE(?, customerPassword), 
            accessories = COALESCE(?, accessories), 
            ramInfo = COALESCE(?, ramInfo), 
            ssdInfo = COALESCE(?, ssdInfo), 
            priority = COALESCE(?, priority), 
            equipmentType = COALESCE(?, equipmentType), 
            equipmentBrand = COALESCE(?, equipmentBrand), 
            equipmentModel = COALESCE(?, equipmentModel), 
            equipmentColor = COALESCE(?, equipmentColor), 
            equipmentSerial = COALESCE(?, equipmentSerial), 
            arrivalPhotoBase64 = COALESCE(?, arrivalPhotoBase64), 
            updatedBy = ? 
        WHERE id = ?
      `).run(
        status ?? null, technicalAnalysis ?? null, servicesPerformed ?? null, servicesString, partsString, 
        serviceFee ?? null, totalAmount ?? null, finalObservations ?? null, entryDate ?? null, 
        analysisPrediction ?? null, customerPassword ?? null, accessories ?? null, 
        ramInfo ?? null, ssdInfo ?? null, priority ?? null, 
        equipmentType ?? null, equipmentBrand ?? null, equipmentModel ?? null, equipmentColor ?? null, equipmentSerial ?? null, 
        arrivalPhotoBase64 ?? null, updatedBy || 1, req.params.id
      );
      
      db.prepare("INSERT INTO audit_logs (userId, action, entity, entityId, details) VALUES (?, ?, ?, ?, ?)").run(updatedBy || 1, 'update', 'ServiceOrder', req.params.id, `Updated OS #${req.params.id}`);
      
      res.json({ success: true });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.issues });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/service-orders/:id", (req, res) => {
    try {
      // When deleting an OS, should we return parts to stock?
      // For now, let's just delete.
      db.prepare("DELETE FROM service_orders WHERE id = ?").run(req.params.id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // Rotas de Status de OS
  app.get("/api/service-order-statuses", (req, res) => {
    const statuses = db.prepare("SELECT * FROM service_order_statuses ORDER BY priority ASC").all();
    res.json(statuses);
  });

  app.post("/api/service-order-statuses", (req, res) => {
    const { name, color, priority, isDefault } = req.body;
    const result = db.prepare("INSERT INTO service_order_statuses (name, color, priority, isDefault) VALUES (?, ?, ?, ?)").run(name, color, priority || 0, isDefault ? 1 : 0);
    res.json({ id: result.lastInsertRowid });
  });

  app.delete("/api/service-order-statuses/:id", (req, res) => {
    db.prepare("DELETE FROM service_order_statuses WHERE id = ? AND isDefault = 0").run(req.params.id);
    res.json({ success: true });
  });

  // Rotas de Marcas e Modelos
  app.get("/api/brands", (req, res) => {
    const brands = db.prepare("SELECT * FROM brands ORDER BY name ASC").all();
    res.json(brands);
  });

  app.post("/api/brands", (req, res) => {
    const { name, equipmentType } = req.body;
    try {
      const result = db.prepare("INSERT INTO brands (name, equipmentType) VALUES (?, ?)").run(name, equipmentType);
      res.json({ id: result.lastInsertRowid });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.delete("/api/brands/:id", (req, res) => {
    try {
      db.prepare("DELETE FROM brands WHERE id = ?").run(req.params.id);
      db.prepare("DELETE FROM models WHERE brandId = ?").run(req.params.id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.get("/api/models", (req, res) => {
    const models = db.prepare("SELECT * FROM models ORDER BY name ASC").all();
    res.json(models);
  });

  app.post("/api/models", (req, res) => {
    const { brandId, name } = req.body;
    try {
      const result = db.prepare("INSERT INTO models (brandId, name) VALUES (?, ?)").run(brandId, name);
      res.json({ id: result.lastInsertRowid });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.delete("/api/models/:id", (req, res) => {
    try {
      db.prepare("DELETE FROM models WHERE id = ?").run(req.params.id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // Rotas de Tipos de Equipamento
  app.get("/api/equipment-types", (req, res) => {
    const types = db.prepare("SELECT * FROM equipment_types ORDER BY name ASC").all();
    res.json(types);
  });

  app.post("/api/equipment-types", (req, res) => {
    const { name, icon } = req.body;
    try {
      const result = db.prepare("INSERT INTO equipment_types (name, icon) VALUES (?, ?)").run(name, icon);
      res.json({ id: result.lastInsertRowid });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.delete("/api/equipment-types/:id", (req, res) => {
    try {
      db.prepare("DELETE FROM equipment_types WHERE id = ?").run(req.params.id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // Configuração do Vite para desenvolvimento
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Servir arquivos estáticos em produção
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
}

startServer();
