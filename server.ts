import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("finance.db");

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
    equipmentSerial TEXT,
    reportedProblem TEXT,
    arrivalPhotoUrl TEXT,
    status TEXT DEFAULT 'awaiting_diagnosis',
    technicalAnalysis TEXT,
    servicesPerformed TEXT,
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
  { name: 'equipmentColor', table: 'service_orders', type: "TEXT" }
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

  app.use(express.json());

  // Rotas da API

  // Buscar todas as transações
  app.get("/api/transactions", (req, res) => {
    const transactions = db.prepare("SELECT * FROM transactions ORDER BY date DESC, id DESC").all();
    res.json(transactions);
  });

  // Adicionar uma nova transação
  app.post("/api/transactions", (req, res) => {
    const { description, category, type, amount, date, createdBy } = req.body;
    const info = db.prepare(
      "INSERT INTO transactions (description, category, type, amount, date, createdBy) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(description, category, type, amount, date, createdBy || 1);
    
    // Audit Log
    db.prepare("INSERT INTO audit_logs (userId, action, entity, entityId, details) VALUES (?, ?, ?, ?, ?)").run(createdBy || 1, 'create', 'transaction', info.lastInsertRowid, `Created transaction: ${description}`);
    
    res.json({ id: info.lastInsertRowid });
  });

  // Deletar uma transação
  app.delete("/api/transactions/:id", (req, res) => {
    const { userId } = req.body; // Pass userId in body or query if possible, but delete usually doesn't have body in some clients. 
    // For simplicity, we might miss the user here unless we change how delete is called.
    // Let's assume userId 1 for now if not provided.
    const tx = db.prepare("SELECT * FROM transactions WHERE id = ?").get(req.params.id) as any;
    db.prepare("DELETE FROM transactions WHERE id = ?").run(req.params.id);
    
    if (tx) {
       db.prepare("INSERT INTO audit_logs (userId, action, entity, entityId, details) VALUES (?, ?, ?, ?, ?)").run(1, 'delete', 'transaction', req.params.id, `Deleted transaction: ${tx.description}`);
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
      hiddenColumns, settingsPassword, receiptLayout, receiptLogo
    } = req.body;
    
    db.prepare(`
      UPDATE settings 
      SET appName = ?, appVersion = ?, fiscalYear = ?, primaryColor = ?, 
          categories = ?, incomeCategories = ?, expenseCategories = ?, profileName = ?, profileAvatar = ?, 
          initialBalance = ?, showWarnings = ?, hiddenColumns = ?, 
          settingsPassword = ?, receiptLayout = ?, receiptLogo = ?
      WHERE id = 1
    `).run(
      appName, appVersion, fiscalYear, primaryColor, 
      categories, incomeCategories, expenseCategories, profileName, profileAvatar, initialBalance, 
      showWarnings ? 1 : 0, JSON.stringify(hiddenColumns || []), 
      settingsPassword, receiptLayout || 'a4', receiptLogo || ''
    );
    res.json({ success: true });
  });

  // Rotas de Clientes
  app.get("/api/customers", (req, res) => {
    const customers = db.prepare("SELECT * FROM customers ORDER BY firstName ASC").all();
    res.json(customers);
  });

  app.post("/api/customers", (req, res) => {
    const { firstName, lastName, nickname, cpf, companyName, phone, observation, creditLimit, createdBy } = req.body;
    const result = db.prepare(`
      INSERT INTO customers (firstName, lastName, nickname, cpf, companyName, phone, observation, creditLimit, createdBy) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(firstName, lastName, nickname, cpf, companyName, phone, observation, creditLimit || 0, createdBy || 1);
    
    db.prepare("INSERT INTO audit_logs (userId, action, entity, entityId, details) VALUES (?, ?, ?, ?, ?)").run(createdBy || 1, 'create', 'customer', result.lastInsertRowid, `Created customer: ${firstName} ${lastName}`);

    res.json({ id: result.lastInsertRowid });
  });

  app.put("/api/customers/:id", (req, res) => {
    const { firstName, lastName, nickname, cpf, companyName, phone, observation, creditLimit, updatedBy } = req.body;
    db.prepare(`
      UPDATE customers 
      SET firstName = ?, lastName = ?, nickname = ?, cpf = ?, companyName = ?, phone = ?, observation = ?, creditLimit = ?, updatedBy = ?
      WHERE id = ?
    `).run(firstName, lastName, nickname, cpf, companyName, phone, observation, creditLimit || 0, updatedBy || 1, req.params.id);
    
    db.prepare("INSERT INTO audit_logs (userId, action, entity, entityId, details) VALUES (?, ?, ?, ?, ?)").run(updatedBy || 1, 'update', 'customer', req.params.id, `Updated customer: ${firstName} ${lastName}`);

    res.json({ success: true });
  });

  app.get("/api/customers/:id/payments", (req, res) => {
    const payments = db.prepare("SELECT * FROM client_payments WHERE customerId = ?").all(req.params.id);
    res.json(payments);
  });

  app.delete("/api/customers/:id", (req, res) => {
    db.prepare("DELETE FROM client_payments WHERE customerId = ?").run(req.params.id);
    db.prepare("DELETE FROM customers WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Rotas de Pagamentos de Clientes
  app.get("/api/client-payments", (req, res) => {
    const payments = db.prepare(`
      SELECT cp.*, c.firstName || ' ' || c.lastName as customerName 
      FROM client_payments cp
      JOIN customers c ON cp.customerId = c.id
      ORDER BY cp.dueDate ASC
    `).all();
    res.json(payments);
  });

  app.post("/api/client-payments", (req, res) => {
    const { 
      customerId, description, totalAmount, paidAmount, 
      purchaseDate, dueDate, paymentMethod, status, installmentsCount, type, createdBy 
    } = req.body;
    
    // Initialize payment history if there's an initial payment
    const initialPaymentHistory = paidAmount > 0 ? JSON.stringify([{
      amount: paidAmount,
      date: new Date().toISOString()
    }]) : '[]';

    const result = db.prepare(`
      INSERT INTO client_payments 
      (customerId, description, totalAmount, paidAmount, purchaseDate, dueDate, paymentMethod, status, installmentsCount, type, paymentHistory, createdBy)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      customerId, description, totalAmount, paidAmount || 0, 
      purchaseDate, dueDate, paymentMethod, status || 'pending', 
      installmentsCount || 1, type || 'income', initialPaymentHistory, createdBy || 1
    );
    
    db.prepare("INSERT INTO audit_logs (userId, action, entity, entityId, details) VALUES (?, ?, ?, ?, ?)").run(createdBy || 1, 'create', 'client_payment', result.lastInsertRowid, `Created payment: ${description}`);

    res.json({ id: result.lastInsertRowid });
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

  app.delete("/api/client-payments/:id", (req, res) => {
    db.prepare("DELETE FROM client_payments WHERE id = ?").run(req.params.id);
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
    db.prepare("DELETE FROM users WHERE id = ?").run(req.params.id);
    res.json({ success: true });
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
    const { name, category, sku, unitPrice, stockLevel, createdBy } = req.body;
    try {
      const result = db.prepare("INSERT INTO inventory_items (name, category, sku, unitPrice, stockLevel, createdBy) VALUES (?, ?, ?, ?, ?, ?)").run(name, category, sku, unitPrice, stockLevel, createdBy);
      
      db.prepare("INSERT INTO audit_logs (userId, action, entity, entityId, details) VALUES (?, ?, ?, ?, ?)").run(createdBy || 1, 'create', 'InventoryItem', result.lastInsertRowid, `Created item ${name}`);
      
      res.json({ id: result.lastInsertRowid });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put("/api/inventory/:id", (req, res) => {
    const { name, category, sku, unitPrice, stockLevel, updatedBy } = req.body;
    try {
      db.prepare("UPDATE inventory_items SET name = ?, category = ?, sku = ?, unitPrice = ?, stockLevel = ?, updatedBy = ? WHERE id = ?").run(name, category, sku, unitPrice, stockLevel, updatedBy, req.params.id);
      
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
    const orders = db.prepare(`
      SELECT so.*, c.firstName, c.lastName, c.phone 
      FROM service_orders so 
      LEFT JOIN customers c ON so.customerId = c.id 
      ORDER BY so.createdAt DESC
    `).all();
    
    const parsedOrders = orders.map((o: any) => {
      try {
        o.partsUsed = JSON.parse(o.partsUsed || '[]');
      } catch (e) {
        o.partsUsed = [];
      }
      return o;
    });
    
    res.json(parsedOrders);
  });

  app.post("/api/service-orders", (req, res) => {
    const { 
      customerId, equipmentBrand, equipmentModel, equipmentColor, equipmentSerial, 
      reportedProblem, arrivalPhotoUrl, status, entryDate, analysisPrediction, 
      customerPassword, accessories, ramInfo, ssdInfo, priority, createdBy 
    } = req.body;
    
    try {
      const result = db.prepare(`
        INSERT INTO service_orders (
          customerId, equipmentBrand, equipmentModel, equipmentColor, equipmentSerial, 
          reportedProblem, arrivalPhotoUrl, status, entryDate, analysisPrediction, 
          customerPassword, accessories, ramInfo, ssdInfo, priority, createdBy
        ) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        customerId, equipmentBrand, equipmentModel, equipmentColor, equipmentSerial, 
        reportedProblem, arrivalPhotoUrl, status || 'Aguardando Análise', 
        entryDate, analysisPrediction, customerPassword, accessories, 
        ramInfo, ssdInfo, priority || 'medium', createdBy || 1
      );
      
      db.prepare("INSERT INTO audit_logs (userId, action, entity, entityId, details) VALUES (?, ?, ?, ?, ?)").run(createdBy || 1, 'create', 'ServiceOrder', result.lastInsertRowid, `Created OS for customer ${customerId}`);
      
      res.json({ id: result.lastInsertRowid });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put("/api/service-orders/:id", (req, res) => {
    const { 
      status, technicalAnalysis, servicesPerformed, partsUsed, 
      serviceFee, totalAmount, finalObservations, entryDate, analysisPrediction, 
      customerPassword, accessories, ramInfo, ssdInfo, priority, 
      equipmentBrand, equipmentModel, equipmentColor, equipmentSerial, updatedBy 
    } = req.body;
    
    try {
      // Fetch old OS to compare parts and update inventory
      const oldOs = db.prepare("SELECT partsUsed FROM service_orders WHERE id = ?").get(req.params.id) as any;
      let oldParts: any[] = [];
      try {
        oldParts = JSON.parse(oldOs?.partsUsed || '[]');
      } catch (e) {}

      const newParts = partsUsed || [];
      
      // Update inventory based on parts changes
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

      const partsString = JSON.stringify(newParts);
      
      db.prepare(`
        UPDATE service_orders 
        SET status = ?, technicalAnalysis = ?, servicesPerformed = ?, partsUsed = ?, 
            serviceFee = ?, totalAmount = ?, finalObservations = ?, entryDate = ?, 
            analysisPrediction = ?, customerPassword = ?, accessories = ?, 
            ramInfo = ?, ssdInfo = ?, priority = ?, 
            equipmentBrand = ?, equipmentModel = ?, equipmentColor = ?, equipmentSerial = ?, 
            updatedBy = ? 
        WHERE id = ?
      `).run(
        status, technicalAnalysis, servicesPerformed, partsString, 
        serviceFee, totalAmount, finalObservations, entryDate, 
        analysisPrediction, customerPassword, accessories, 
        ramInfo, ssdInfo, priority, 
        equipmentBrand, equipmentModel, equipmentColor, equipmentSerial, 
        updatedBy || 1, req.params.id
      );
      
      db.prepare("INSERT INTO audit_logs (userId, action, entity, entityId, details) VALUES (?, ?, ?, ?, ?)").run(updatedBy || 1, 'update', 'ServiceOrder', req.params.id, `Updated OS #${req.params.id}`);
      
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
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
    const { name } = req.body;
    try {
      const result = db.prepare("INSERT INTO brands (name) VALUES (?)").run(name);
      res.json({ id: result.lastInsertRowid });
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
