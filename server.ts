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
  { name: 'paymentHistory', table: 'client_payments', type: "TEXT DEFAULT '[]'" }
];

migrations.forEach(m => {
  try {
    db.prepare(`ALTER TABLE ${m.table} ADD COLUMN ${m.name} ${m.type}`).run();
  } catch (e) {
    // Coluna já existe ou outro erro
  }
});

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
    const { description, category, type, amount, date } = req.body;
    const info = db.prepare(
      "INSERT INTO transactions (description, category, type, amount, date) VALUES (?, ?, ?, ?, ?)"
    ).run(description, category, type, amount, date);
    res.json({ id: info.lastInsertRowid });
  });

  // Deletar uma transação
  app.delete("/api/transactions/:id", (req, res) => {
    db.prepare("DELETE FROM transactions WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Atualizar uma transação
  app.put("/api/transactions/:id", (req, res) => {
    const { description, category, type, amount, date } = req.body;
    db.prepare(`
      UPDATE transactions 
      SET description = ?, category = ?, type = ?, amount = ?, date = ?
      WHERE id = ?
    `).run(description, category, type, amount, date, req.params.id);
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
    const { firstName, lastName, nickname, cpf, companyName, phone, observation, creditLimit } = req.body;
    const result = db.prepare(`
      INSERT INTO customers (firstName, lastName, nickname, cpf, companyName, phone, observation, creditLimit) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(firstName, lastName, nickname, cpf, companyName, phone, observation, creditLimit || 0);
    res.json({ id: result.lastInsertRowid });
  });

  app.put("/api/customers/:id", (req, res) => {
    const { firstName, lastName, nickname, cpf, companyName, phone, observation, creditLimit } = req.body;
    db.prepare(`
      UPDATE customers 
      SET firstName = ?, lastName = ?, nickname = ?, cpf = ?, companyName = ?, phone = ?, observation = ?, creditLimit = ?
      WHERE id = ?
    `).run(firstName, lastName, nickname, cpf, companyName, phone, observation, creditLimit || 0, req.params.id);
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
      purchaseDate, dueDate, paymentMethod, status, installmentsCount, type 
    } = req.body;
    
    // Initialize payment history if there's an initial payment
    const initialPaymentHistory = paidAmount > 0 ? JSON.stringify([{
      amount: paidAmount,
      date: new Date().toISOString()
    }]) : '[]';

    const result = db.prepare(`
      INSERT INTO client_payments 
      (customerId, description, totalAmount, paidAmount, purchaseDate, dueDate, paymentMethod, status, installmentsCount, type, paymentHistory)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      customerId, description, totalAmount, paidAmount || 0, 
      purchaseDate, dueDate, paymentMethod, status || 'pending', 
      installmentsCount || 1, type || 'income', initialPaymentHistory
    );
    res.json({ id: result.lastInsertRowid });
  });

  app.patch("/api/client-payments/:id", (req, res) => {
    const { paidAmount, status, paymentHistory } = req.body;
    
    if (paymentHistory) {
      db.prepare("UPDATE client_payments SET paidAmount = ?, status = ?, paymentHistory = ? WHERE id = ?").run(paidAmount, status, JSON.stringify(paymentHistory), req.params.id);
    } else {
      db.prepare("UPDATE client_payments SET paidAmount = ?, status = ? WHERE id = ?").run(paidAmount, status, req.params.id);
    }
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
