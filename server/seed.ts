import db from "./database.js";
import bcrypt from "bcryptjs";
import { config } from "./config.js";

/**
 * Run all table creation statements and migrations.
 * This is a safe operation — tables and columns are created only if they don't exist.
 */
export function initializeDatabase(): void {
  // --- Create tables ---
  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      type TEXT CHECK(type IN ('income', 'expense')) NOT NULL,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      status TEXT DEFAULT 'Concluído',
      createdBy INTEGER,
      updatedBy INTEGER
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
      pixQrCode TEXT,
      whatsappBillingTemplate TEXT,
      whatsappOSTemplate TEXT,
      sendPulseClientId TEXT,
      sendPulseClientSecret TEXT,
      sendPulseTemplateId TEXT,
      telegramBotToken TEXT,
      telegramChatId TEXT
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
      creditLimit REAL DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      createdBy INTEGER,
      updatedBy INTEGER
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
      paymentHistory TEXT DEFAULT '[]',
      createdBy INTEGER,
      updatedBy INTEGER,
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
      permissions TEXT DEFAULT '[]',
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
      costPrice REAL DEFAULT 0,
      salePrice REAL DEFAULT 0,
      quantity INTEGER DEFAULT 0,
      minQuantity INTEGER DEFAULT 5,
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
      equipmentType TEXT,
      equipmentBrand TEXT,
      equipmentModel TEXT,
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
      name TEXT NOT NULL UNIQUE,
      equipmentType TEXT
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

  // --- Run column migrations ---
  const migrations = [
    { name: "icon", table: "equipment_types", type: "TEXT" },
    { name: "telegramBotToken", table: "settings", type: "TEXT" },
    { name: "telegramChatId", table: "settings", type: "TEXT" },
  ];

  migrations.forEach((m) => {
    try {
      db.prepare(`ALTER TABLE ${m.table} ADD COLUMN ${m.name} ${m.type}`).run();
    } catch {
      // Column already exists
    }
  });

  // --- Seed default data ---
  seedDefaults();
}

async function seedDefaults(): Promise<void> {
  // Default admin user with hashed password
  const usersCount = (
    db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number }
  ).count;

  if (usersCount === 0) {
    const hashedPassword = bcrypt.hashSync("admin", config.bcryptRounds);
    const allPermissions = JSON.stringify([
      "view_dashboard",
      "manage_transactions",
      "view_reports",
      "manage_customers",
      "manage_payments",
      "manage_settings",
      "manage_users",
    ]);
    db.prepare(
      "INSERT INTO users (username, password, role, name, permissions) VALUES (?, ?, ?, ?, ?)"
    ).run("admin", hashedPassword, "owner", "Administrador", allPermissions);
  }

  // Default settings
  const settingsCount = (
    db.prepare("SELECT COUNT(*) as count FROM settings").get() as {
      count: number;
    }
  ).count;
  if (settingsCount === 0) {
    db.prepare("INSERT INTO settings (id) VALUES (1)").run();
  }

  // Default categories
  const categoriesCount = (
    db.prepare("SELECT COUNT(*) as count FROM categories").get() as {
      count: number;
    }
  ).count;
  if (categoriesCount === 0) {
    const insertCat = db.prepare(
      "INSERT INTO categories (name, type) VALUES (?, ?)"
    );
    ["Salário", "Vendas", "Serviços", "Investimentos", "Outros"].forEach((c) =>
      insertCat.run(c, "income")
    );
    [
      "Alimentação",
      "Trabalho",
      "Utilidades",
      "Viagem",
      "Lazer",
      "Outros",
    ].forEach((c) => insertCat.run(c, "expense"));
  }

  // Default service order statuses
  const statusCount = (
    db.prepare("SELECT COUNT(*) as count FROM service_order_statuses").get() as {
      count: number;
    }
  ).count;
  if (statusCount === 0) {
    const insertStatus = db.prepare(
      "INSERT INTO service_order_statuses (name, color, priority, isDefault) VALUES (?, ?, ?, ?)"
    );
    insertStatus.run("Aguardando Análise", "#f59e0b", 1, 1);
    insertStatus.run("Em Manutenção", "#3b82f6", 2, 1);
    insertStatus.run("Urgente", "#f43f5e", 3, 1);
    insertStatus.run("Aguardando Peças", "#f97316", 4, 1);
    insertStatus.run("Pronto para Retirada", "#10b981", 5, 1);
    insertStatus.run("Concluído", "#64748b", 6, 1);
    insertStatus.run("Sem Conserto", "#ef4444", 7, 1);
  }

  // Default equipment types
  const equipmentTypesCount = (
    db.prepare("SELECT COUNT(*) as count FROM equipment_types").get() as {
      count: number;
    }
  ).count;
  if (equipmentTypesCount === 0) {
    const insertType = db.prepare(
      "INSERT INTO equipment_types (name) VALUES (?)"
    );
    [
      "Notebook",
      "Desktop",
      "Smartphone",
      "Tablet",
      "Monitor",
      "Impressora",
      "Console",
    ].forEach((t) => insertType.run(t));
  }

  // Sample transactions (only if empty)
  const txCount = (
    db.prepare("SELECT COUNT(*) as count FROM transactions").get() as {
      count: number;
    }
  ).count;
  if (txCount === 0) {
    const insert = db.prepare(
      "INSERT INTO transactions (description, category, type, amount, date, status) VALUES (?, ?, ?, ?, ?, ?)"
    );
    insert.run("Mercado Whole Foods", "Alimentação", "expense", 142.5, "2024-10-24", "Concluído");
    insert.run("Salário Mensal", "Trabalho", "income", 4500.0, "2024-10-24", "Concluído");
    insert.run("Conta de Luz", "Utilidades", "expense", 85.2, "2024-10-24", "Pendente");
    insert.run("Starbucks Coffee", "Alimentação", "expense", 12.45, "2024-10-24", "Concluído");
    insert.run("Posto de Gasolina Shell", "Viagem", "expense", 55.0, "2024-10-24", "Falhou");
  }
}
