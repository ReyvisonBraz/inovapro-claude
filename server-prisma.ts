import express from "express";
import 'dotenv/config';
import path from "path";
import { fileURLToPath } from "url";
import { z } from "zod";
import bcrypt from "bcryptjs";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { generateToken, requireAuth } from "./src/middleware/auth.js";
import { prisma, testConnection, disconnect } from "./src/lib/prisma.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

process.on('uncaughtException', (err) => {
  console.error('[FATAL] uncaughtException:', err.message, err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('[FATAL] unhandledRejection:', reason);
  process.exit(1);
});

// Zod Schemas
const TransactionSchema = z.object({
  description: z.string().min(0),
  category: z.string().min(1),
  type: z.enum(['income', 'expense']),
  amount: z.coerce.number().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}/),
  createdBy: z.coerce.number().optional(),
  updatedBy: z.coerce.number().optional()
});

const CustomerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  nickname: z.string().optional().nullable(),
  cpf: z.string().optional().nullable(),
  companyName: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  observation: z.string().optional().nullable(),
  creditLimit: z.coerce.number().nonnegative().optional(),
  createdBy: z.coerce.number().optional(),
  updatedBy: z.coerce.number().optional()
});

const ClientPaymentSchema = z.object({
  customerId: z.coerce.number(),
  description: z.string().min(1),
  totalAmount: z.coerce.number().positive(),
  paidAmount: z.coerce.number().nonnegative().optional(),
  purchaseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}/),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}/),
  paymentMethod: z.string().min(1),
  status: z.enum(['pending', 'partial', 'paid']).optional(),
  installmentsCount: z.coerce.number().int().positive().optional(),
  type: z.enum(['income', 'expense']).optional(),
  saleId: z.string().optional().nullable(),
  paymentHistory: z.string().optional(),
  createdBy: z.coerce.number().optional(),
  updatedBy: z.coerce.number().optional()
});

const ServiceOrderSchema = z.object({
  customerId: z.coerce.number(),
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
  services: z.array(z.object({
    name: z.string(),
    price: z.coerce.number()
  })).optional(),
  partsUsed: z.array(z.object({
    id: z.coerce.number().optional(),
    name: z.string(),
    quantity: z.coerce.number(),
    unitPrice: z.coerce.number(),
    subtotal: z.coerce.number()
  })).optional(),
  serviceFee: z.coerce.number().nonnegative().optional().nullable(),
  totalAmount: z.coerce.number().nonnegative().optional().nullable(),
  finalObservations: z.string().optional().nullable(),
  createdBy: z.coerce.number().optional(),
  updatedBy: z.coerce.number().optional()
});

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001; // Different port for testing

  // Test database connection
  const connected = await testConnection();
  if (!connected) {
    console.error('[STARTUP] Failed to connect to database');
    process.exit(1);
  }

  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }));

  const allowedOrigins = [
    process.env.APP_URL,
    /^https:\/\/.*\.vercel\.app$/,
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
  ].filter(Boolean);

  app.use(cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const allowed = allowedOrigins.some((o) =>
        typeof o === 'string' ? o === origin : (o as RegExp).test(origin)
      );
      if (allowed) return callback(null, true);
      return callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  }));
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ limit: '5mb', extended: true }));

  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: 'Muitas tentativas. Tente novamente em 15 minutos.' },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0-prisma' });
  });

  // Login
  app.post("/api/login", loginLimiter, async (req, res) => {
    try {
      const { username, password } = req.body;

      const user = await prisma.user.findUnique({ where: { username } });

      if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ error: "Credenciais inválidas" });
      }

      let permissions = [];
      try {
        permissions = JSON.parse(user.permissions || '[]');
      } catch (e) {
        permissions = [];
      }

      if (user.role === 'owner') {
        permissions = ['view_dashboard', 'manage_transactions', 'view_reports', 'manage_customers', 'manage_payments', 'manage_settings', 'manage_users'];
      }

      const token = generateToken({ userId: user.id, username: user.username, role: user.role });

      const { password: _, ...userWithoutPassword } = user;
      res.json({ token, user: { ...userWithoutPassword, permissions } });
    } catch (error) {
      console.error('[LOGIN] Error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // All routes below require auth
  app.use('/api', requireAuth);

  // ============================================
  // CATEGORIES (Migrated to Prisma)
  // ============================================
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await prisma.category.findMany({
        orderBy: { name: 'asc' }
      });
      res.json(categories);
    } catch (error) {
      console.error('[CATEGORIES GET] Error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const { name, type } = req.body;
      const category = await prisma.category.create({
        data: { name, type }
      });
      res.json({ id: category.id });
    } catch (error) {
      console.error('[CATEGORIES POST] Error:', error);
      res.status(400).json({ error: "Failed to create category" });
    }
  });

  app.delete("/api/categories/:id", async (req, res) => {
    try {
      await prisma.category.delete({
        where: { id: parseInt(req.params.id) }
      });
      res.json({ success: true });
    } catch (error) {
      console.error('[CATEGORIES DELETE] Error:', error);
      res.status(400).json({ error: "Failed to delete category" });
    }
  });

  // ============================================
  // SETTINGS (Migrated to Prisma)
  // ============================================
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await prisma.settings.findUnique({
        where: { id: 1 }
      });
      if (settings) {
        let hiddenCols: string[] = [];
        try {
          hiddenCols = JSON.parse(settings.hiddenColumns || '[]');
        } catch (e) {
          // keep empty array
        }
        const response = {
          ...settings,
          showWarnings: settings.showWarnings ? true : false,
          hiddenColumns: hiddenCols
        };
        res.json(response);
      } else {
        res.json(null);
      }
    } catch (error) {
      console.error('[SETTINGS GET] Error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/settings", async (req, res) => {
    try {
      const {
        appName, appVersion, fiscalYear, primaryColor, categories,
        incomeCategories, expenseCategories, profileName, profileAvatar, initialBalance, showWarnings,
        hiddenColumns, settingsPassword, receiptLayout, receiptLogo,
        sendPulseClientId, sendPulseClientSecret, sendPulseTemplateId
      } = req.body;

      await prisma.settings.update({
        where: { id: 1 },
        data: {
          appName,
          appVersion,
          fiscalYear,
          primaryColor,
          categories,
          incomeCategories,
          expenseCategories,
          profileName,
          profileAvatar,
          initialBalance,
          showWarnings: showWarnings ? 1 : 0,
          hiddenColumns: JSON.stringify(hiddenColumns || []),
          settingsPassword,
          receiptLayout: receiptLayout || 'a4',
          receiptLogo,
          sendPulseClientId,
          sendPulseClientSecret,
          sendPulseTemplateId
        }
      });
      res.json({ success: true });
    } catch (error) {
      console.error('[SETTINGS POST] Error:', error);
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  // ============================================
  // USERS (Migrated to Prisma)
  // ============================================
  app.get("/api/users", async (req, res) => {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          username: true,
          role: true,
          name: true,
          permissions: true,
          createdAt: true
        },
        orderBy: { name: 'asc' }
      });

      const usersWithPermissions = users.map(u => {
        try {
          return { ...u, permissions: JSON.parse(u.permissions || '[]') };
        } catch (e) {
          return { ...u, permissions: [] };
        }
      });

      res.json(usersWithPermissions);
    } catch (error) {
      console.error('[USERS GET] Error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const { username, password, role, name, permissions } = req.body;
      const hashedPassword = bcrypt.hashSync(password, 10);

      const user = await prisma.user.create({
        data: {
          username,
          password: hashedPassword,
          role,
          name,
          permissions: JSON.stringify(permissions || [])
        }
      });

      await prisma.auditLog.create({
        data: {
          userId: undefined,
          action: 'create',
          entity: 'user',
          entityId: user.id,
          details: `Created user ${username}`
        }
      });

      res.json({ id: user.id });
    } catch (error: any) {
      console.error('[USERS POST] Error:', error);
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const { name, role, password, permissions } = req.body;
      const userId = parseInt(req.params.id);

      const updateData: any = {
        name,
        role,
        permissions: JSON.stringify(permissions || [])
      };

      if (password) {
        updateData.password = bcrypt.hashSync(password, 10);
      }

      await prisma.user.update({
        where: { id: userId },
        data: updateData
      });

      await prisma.auditLog.create({
        data: {
          userId: undefined,
          action: 'update',
          entity: 'user',
          entityId: userId,
          details: `Updated user ${name}`
        }
      });

      res.json({ success: true });
    } catch (error: any) {
      console.error('[USERS PUT] Error:', error);
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);

      // Clear FK references
      await prisma.auditLog.updateMany({
        where: { userId },
        data: { userId: null }
      });

      await prisma.user.delete({
        where: { id: userId }
      });

      res.json({ success: true });
    } catch (error: any) {
      console.error('[USERS DELETE] Error:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // ============================================
  // CUSTOMERS (Migrated to Prisma)
  // ============================================
  app.get("/api/customers", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string;

      const where = search ? {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' as const } },
          { lastName: { contains: search, mode: 'insensitive' as const } },
          { nickname: { contains: search, mode: 'insensitive' as const } },
          { phone: { contains: search, mode: 'insensitive' as const } },
          { companyName: { contains: search, mode: 'insensitive' as const } }
        ]
      } : {};

      const [customers, total] = await Promise.all([
        prisma.customer.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { firstName: 'asc' }
        }),
        prisma.customer.count({ where })
      ]);

      res.json({
        data: customers,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('[CUSTOMERS GET] Error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const validatedData = CustomerSchema.parse(req.body);
      const { firstName, lastName, nickname, cpf, companyName, phone, observation, creditLimit, createdBy } = validatedData;

      const customer = await prisma.customer.create({
        data: {
          firstName,
          lastName,
          nickname,
          cpf,
          companyName,
          phone,
          observation,
          creditLimit
        }
      });

      await prisma.auditLog.create({
        data: {
          action: 'create',
          entity: 'customer',
          entityId: customer.id,
          details: `Created customer: ${firstName} ${lastName}`
        }
      });

      res.json({ id: customer.id });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.issues });
      }
      console.error('[CUSTOMERS POST] Error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/customers/:id", async (req, res) => {
    try {
      const validatedData = CustomerSchema.parse(req.body);
      const { firstName, lastName, nickname, cpf, companyName, phone, observation, creditLimit, updatedBy } = validatedData;

      await prisma.customer.update({
        where: { id: parseInt(req.params.id) },
        data: {
          firstName,
          lastName,
          nickname,
          cpf,
          companyName,
          phone,
          observation,
          creditLimit
        }
      });

      await prisma.auditLog.create({
        data: {
          userId: updatedBy || undefined,
          action: 'update',
          entity: 'customer',
          entityId: parseInt(req.params.id),
          details: `Updated customer: ${firstName} ${lastName}`
        }
      });

      res.json({ success: true });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.issues });
      }
      console.error('[CUSTOMERS PUT] Error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/customers/:id/payments", async (req, res) => {
    try {
      const payments = await prisma.clientPayment.findMany({
        where: { customerId: parseInt(req.params.id) }
      });
      res.json(payments);
    } catch (error) {
      console.error('[CUSTOMERS/:id/payments] Error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/customers/:id", async (req, res) => {
    try {
      // Delete related records first
      const payments = await prisma.clientPayment.findMany({
        where: { customerId: parseInt(req.params.id) }
      });

      for (const p of payments) {
        await prisma.transaction.deleteMany({
          where: { paymentId: p.id }
        });
        await prisma.receipt.deleteMany({
          where: { paymentId: p.id }
        });
      }

      await prisma.clientPayment.deleteMany({
        where: { customerId: parseInt(req.params.id) }
      });

      await prisma.serviceOrder.deleteMany({
        where: { customerId: parseInt(req.params.id) }
      });

      await prisma.customer.delete({
        where: { id: parseInt(req.params.id) }
      });

      res.json({ success: true });
    } catch (error: any) {
      console.error('[CUSTOMERS DELETE] Error:', error);
      res.status(400).json({ error: "Não foi possível excluir cliente" });
    }
  });

  // ============================================
  // TRANSACTIONS (Migrated to Prisma)
  // ============================================
  app.get("/api/transactions", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string;
      const type = req.query.type as string;
      const category = req.query.category as string;
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;
      const minAmount = parseFloat(req.query.minAmount as string);
      const maxAmount = parseFloat(req.query.maxAmount as string);

      const where: any = {};

      if (search) {
        where.OR = [
          { description: { contains: search, mode: 'insensitive' } },
          { category: { contains: search, mode: 'insensitive' } }
        ];
      }

      if (type && type !== 'all') {
        where.type = type;
      }

      if (category && category !== 'all') {
        where.category = category;
      }

      if (startDate) {
        where.date = { ...where.date, gte: startDate };
      }

      if (endDate) {
        where.date = { ...where.date, lte: endDate };
      }

      if (!isNaN(minAmount)) {
        where.amount = { ...where.amount, gte: minAmount };
      }

      if (!isNaN(maxAmount)) {
        where.amount = { ...where.amount, lte: maxAmount };
      }

      const [transactions, total] = await Promise.all([
        prisma.transaction.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: [
            { date: 'desc' },
            { id: 'desc' }
          ]
        }),
        prisma.transaction.count({ where })
      ]);

      // Transform to match expected format (no customer relation in this schema)
      const data = transactions;

      res.json({
        data,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('[TRANSACTIONS GET] Error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      const validatedData = TransactionSchema.parse(req.body);
      const { description, category, type, amount, date, createdBy } = validatedData;

      const transaction = await prisma.transaction.create({
        data: {
          description,
          category,
          type,
          amount,
          date,
          createdBy: createdBy || 1
        }
      });

      await prisma.auditLog.create({
        data: {
          userId: createdBy || undefined,
          action: 'create',
          entity: 'transaction',
          entityId: transaction.id,
          details: `Created transaction: ${description}`
        }
      });

      res.json({ id: transaction.id });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.issues });
      }
      console.error('[TRANSACTIONS POST] Error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/transactions/:id", async (req, res) => {
    try {
      const validatedData = TransactionSchema.parse(req.body);
      const { description, category, type, amount, date, updatedBy } = validatedData;

      await prisma.transaction.update({
        where: { id: parseInt(req.params.id) },
        data: {
          description: description || 'Sem descrição',
          category,
          type,
          amount,
          date,
          updatedBy: updatedBy || 1
        }
      });

      await prisma.auditLog.create({
        data: {
          userId: updatedBy || undefined,
          action: 'update',
          entity: 'transaction',
          entityId: parseInt(req.params.id),
          details: `Updated transaction: ${description || 'Sem descrição'}`
        }
      });

      res.json({ success: true });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.issues });
      }
      console.error('[TRANSACTIONS PUT] Error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/transactions/:id", async (req, res) => {
    try {
      const txId = parseInt(req.params.id);
      const tx = await prisma.transaction.findUnique({
        where: { id: txId }
      });

      if (tx?.paymentId) {
        const payment = await prisma.clientPayment.findUnique({
          where: { id: tx.paymentId }
        });
        if (payment) {
          const newPaidAmount = Math.max(0, payment.paidAmount - tx.amount);
          const newStatus = newPaidAmount >= payment.totalAmount ? 'paid' : 'pending';
          await prisma.clientPayment.update({
            where: { id: tx.paymentId },
            data: { paidAmount: newPaidAmount, status: newStatus }
          });
        }
      }

      await prisma.transaction.delete({
        where: { id: txId }
      });

      await prisma.auditLog.create({
        data: {
          userId: undefined,
          action: 'delete',
          entity: 'transaction',
          entityId: txId,
          details: `Deleted transaction: ${tx?.description || ''}`
        }
      });

      res.json({ success: true });
    } catch (error) {
      console.error('[TRANSACTIONS DELETE] Error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // ============================================
  // STATS (Migrated to Prisma)
  // ============================================
  app.get("/api/stats", async (req, res) => {
    try {
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
      const twelveMonthsAgoStr = twelveMonthsAgo.toISOString().split('T')[0];

      const [totalIncome, totalExpenses, pendingPayments, activeOS] = await Promise.all([
        prisma.transaction.aggregate({
          where: { type: 'income' },
          _sum: { amount: true }
        }),
        prisma.transaction.aggregate({
          where: { type: 'expense' },
          _sum: { amount: true }
        }),
        prisma.clientPayment.count({
          where: { status: { not: 'paid' } }
        }),
        prisma.serviceOrder.count({
          where: {
            status: { notIn: ['Concluído', 'Entregue', 'canceled'] }
          }
        })
      ]);

      // Monthly chart data
      const monthlyTransactions = await prisma.transaction.findMany({
        where: {
          date: { gte: twelveMonthsAgoStr }
        },
        select: {
          date: true,
          type: true,
          amount: true
        }
      });

      // Group by month
      const byMonth: Record<string, { income: number; expense: number }> = {};
      for (const tx of monthlyTransactions) {
        const month = tx.date.substring(0, 7);
        if (!byMonth[month]) byMonth[month] = { income: 0, expense: 0 };
        if (tx.type === 'income') byMonth[month].income += Number(tx.amount);
        else byMonth[month].expense += Number(tx.amount);
      }

      // Ensure all 12 months
      const chartData = [];
      for (let i = 11; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const month = d.toISOString().slice(0, 7);
        const name = d.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase();
        const { income = 0, expense = 0 } = byMonth[month] || {};
        chartData.push({ name, income, expense });
      }

      // Category rankings
      const incomeRanking = await prisma.transaction.groupBy({
        by: ['category'],
        where: { type: 'income' },
        _sum: { amount: true },
        orderBy: { _sum: { amount: 'desc' } }
      });

      const expenseRanking = await prisma.transaction.groupBy({
        by: ['category'],
        where: { type: 'expense' },
        _sum: { amount: true },
        orderBy: { _sum: { amount: 'desc' } }
      });

      res.json({
        totalIncome: totalIncome._sum.amount || 0,
        totalExpenses: totalExpenses._sum.amount || 0,
        netBalance: (totalIncome._sum.amount || 0) - (totalExpenses._sum.amount || 0),
        pendingPayments,
        activeOS,
        chartData,
        sortedIncomeRanking: incomeRanking.map(r => [r.category, r._sum.amount || 0]),
        sortedExpenseRanking: expenseRanking.map(r => [r.category, r._sum.amount || 0])
      });
    } catch (error) {
      console.error('[STATS] Error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // ============================================
  // CLIENT PAYMENTS (Migrated to Prisma)
  // ============================================
  app.get("/api/client-payments", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string;

      const where: any = search ? {
        OR: [
          { description: { contains: search, mode: 'insensitive' } },
          { saleId: { contains: search, mode: 'insensitive' } },
          { customer: { firstName: { contains: search, mode: 'insensitive' } } },
          { customer: { lastName: { contains: search, mode: 'insensitive' } } }
        ]
      } : {};

      const [payments, total] = await Promise.all([
        prisma.clientPayment.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { dueDate: 'asc' },
          include: {
            customer: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }),
        prisma.clientPayment.count({ where })
      ]);

      const data = payments.map(p => ({
        ...p,
        customerName: `${p.customer.firstName} ${p.customer.lastName}`
      }));

      res.json({
        data,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('[CLIENT_PAYMENTS GET] Error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/client-payments", async (req, res) => {
    try {
      const validatedData = ClientPaymentSchema.parse(req.body);
      const {
        customerId, description, totalAmount, paidAmount,
        purchaseDate, dueDate, paymentMethod, status, installmentsCount, type, saleId, createdBy
      } = validatedData;

      const initialPaymentHistory = paidAmount && paidAmount > 0 ? JSON.stringify([{
        amount: paidAmount,
        date: new Date().toISOString()
      }]) : '[]';

      const payment = await prisma.clientPayment.create({
        data: {
          customerId,
          description,
          totalAmount,
          paidAmount: paidAmount || 0,
          purchaseDate,
          dueDate,
          paymentMethod,
          status: status || 'pending',
          installmentsCount: installmentsCount || 1,
          type: type || 'income',
          saleId,
          paymentHistory: initialPaymentHistory
        }
      });

      // Create transaction if there's initial payment
      if (paidAmount && paidAmount > 0) {
        const customer = await prisma.customer.findUnique({
          where: { id: customerId }
        });
        const customerName = customer ? `${customer.firstName} ${customer.lastName}` : 'Cliente';

        await prisma.transaction.create({
          data: {
            description: `Pagamento: ${description} (${customerName})`,
            category: 'Vendas',
            type: 'income',
            amount: paidAmount,
            date: purchaseDate || new Date().toISOString().split('T')[0],
            createdBy: createdBy || 1,
            paymentId: payment.id,
            saleId
          }
        });
      }

      await prisma.auditLog.create({
        data: {
          userId: createdBy || undefined,
          action: 'create',
          entity: 'client_payment',
          entityId: payment.id,
          details: `Created payment: ${description}`
        }
      });

      res.json({ id: payment.id });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.issues });
      }
      console.error('[CLIENT_PAYMENTS POST] Error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/client-payments/:id", async (req, res) => {
    try {
      const { paidAmount, status, paymentHistory, updatedBy } = req.body;

      const updateData: any = {
        paidAmount,
        status,
        updatedBy: updatedBy || 1
      };

      if (paymentHistory) {
        updateData.paymentHistory = JSON.stringify(paymentHistory);
      }

      await prisma.clientPayment.update({
        where: { id: parseInt(req.params.id) },
        data: updateData
      });

      await prisma.auditLog.create({
        data: {
          userId: updatedBy || undefined,
          action: 'update',
          entity: 'client_payment',
          entityId: parseInt(req.params.id),
          details: `Updated payment status: ${status}`
        }
      });

      res.json({ success: true });
    } catch (error) {
      console.error('[CLIENT_PAYMENTS PATCH] Error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/client-payments/:id/pay", async (req, res) => {
    try {
      const { amount, date, updatedBy } = req.body;
      const paymentId = parseInt(req.params.id);

      const payment = await prisma.clientPayment.findUnique({
        where: { id: paymentId }
      });

      if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
      }

      const newPaidAmount = payment.paidAmount + amount;
      const newStatus = newPaidAmount >= payment.totalAmount ? 'paid' : 'partial';

      let history = [];
      try {
        history = JSON.parse(payment.paymentHistory || '[]');
      } catch (e) {}

      history.push({ amount, date: date || new Date().toISOString() });

      await prisma.clientPayment.update({
        where: { id: paymentId },
        data: {
          paidAmount: newPaidAmount,
          status: newStatus,
          paymentHistory: JSON.stringify(history),
          updatedBy: updatedBy || 1
        }
      });

      // Create transaction
      const customer = await prisma.customer.findUnique({
        where: { id: payment.customerId }
      });
      const customerName = customer ? `${customer.firstName} ${customer.lastName}` : 'Cliente';

      await prisma.transaction.create({
        data: {
          description: `Recebimento: ${payment.description} (${customerName})`,
          category: 'Vendas',
          type: 'income',
          amount,
          date: (date || new Date().toISOString()).split('T')[0],
          createdBy: updatedBy || 1,
          paymentId,
          saleId: payment.saleId || null
        }
      });

      await prisma.auditLog.create({
        data: {
          userId: updatedBy || undefined,
          action: 'update',
          entity: 'client_payment',
          entityId: paymentId,
          details: `Recorded payment of ${amount}`
        }
      });

      res.json({ success: true, newPaidAmount, newStatus });
    } catch (error) {
      console.error('[CLIENT_PAYMENTS PAY] Error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/client-payments/:id", async (req, res) => {
    try {
      const paymentId = parseInt(req.params.id);

      await prisma.transaction.deleteMany({
        where: { paymentId }
      });

      await prisma.clientPayment.delete({
        where: { id: paymentId }
      });

      await prisma.auditLog.create({
        data: {
          userId: undefined,
          action: 'delete',
          entity: 'client_payment',
          entityId: paymentId,
          details: `Deleted payment ID: ${paymentId}`
        }
      });

      res.json({ success: true });
    } catch (error) {
      console.error('[CLIENT_PAYMENTS DELETE] Error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // ============================================
  // AUDIT LOGS
  // ============================================
  app.get("/api/audit-logs", async (req, res) => {
    try {
      const logs = await prisma.auditLog.findMany({
        take: 100,
        orderBy: { timestamp: 'desc' },
        include: {
          user: {
            select: { name: true }
          }
        }
      });

      const logsWithUserName = logs.map(l => ({
        ...l,
        userName: l.user?.name || null
      }));

      res.json(logsWithUserName);
    } catch (error) {
      console.error('[AUDIT_LOGS] Error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // ============================================
  // INVENTORY
  // ============================================
  app.get("/api/inventory", async (req, res) => {
    try {
      const items = await prisma.inventoryItem.findMany({
        orderBy: { name: 'asc' }
      });
      res.json(items);
    } catch (error) {
      console.error('[INVENTORY GET] Error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/inventory", async (req, res) => {
    try {
      const { name, category, sku, costPrice, salePrice, quantity, minQuantity, unitPrice, stockLevel, createdBy } = req.body;

      const finalUnitPrice = unitPrice !== undefined ? unitPrice : (salePrice || 0);
      const finalStockLevel = stockLevel !== undefined ? stockLevel : (quantity || 0);

      const item = await prisma.inventoryItem.create({
        data: {
          name,
          category,
          sku,
          costPrice: costPrice || 0,
          salePrice: finalUnitPrice,
          quantity: finalStockLevel,
          minQuantity: minQuantity || 5,
          unitPrice: finalUnitPrice,
          stockLevel: finalStockLevel,
          createdBy: createdBy || 1
        }
      });

      await prisma.auditLog.create({
        data: {
          userId: createdBy || undefined,
          action: 'create',
          entity: 'InventoryItem',
          entityId: item.id,
          details: `Created item ${name}`
        }
      });

      res.json({ id: item.id });
    } catch (error: any) {
      console.error('[INVENTORY POST] Error:', error);
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/inventory/:id", async (req, res) => {
    try {
      const { name, category, sku, costPrice, salePrice, quantity, minQuantity, unitPrice, stockLevel, updatedBy } = req.body;

      const finalUnitPrice = unitPrice !== undefined ? unitPrice : (salePrice || 0);
      const finalStockLevel = stockLevel !== undefined ? stockLevel : (quantity || 0);

      await prisma.inventoryItem.update({
        where: { id: parseInt(req.params.id) },
        data: {
          name,
          category,
          sku,
          costPrice: costPrice || 0,
          salePrice: finalUnitPrice,
          quantity: finalStockLevel,
          minQuantity: minQuantity || 5,
          unitPrice: finalUnitPrice,
          stockLevel: finalStockLevel,
          updatedBy: updatedBy || 1
        }
      });

      await prisma.auditLog.create({
        data: {
          userId: updatedBy || undefined,
          action: 'update',
          entity: 'InventoryItem',
          entityId: parseInt(req.params.id),
          details: `Updated item ${name}`
        }
      });

      res.json({ success: true });
    } catch (error: any) {
      console.error('[INVENTORY PUT] Error:', error);
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/inventory/:id", async (req, res) => {
    try {
      await prisma.inventoryItem.delete({
        where: { id: parseInt(req.params.id) }
      });
      res.json({ success: true });
    } catch (error: any) {
      console.error('[INVENTORY DELETE] Error:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // ============================================
  // SERVICE ORDERS (Migrated to Prisma)
  // ============================================
  app.get("/api/service-orders", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string;
      const status = req.query.status as string;
      const priority = req.query.priority as string;
      const sortBy = req.query.sortBy as string || 'newest';

      const where: any = {};

      if (search) {
        where.OR = [
          { id: parseInt(search) || 0 },
          { equipmentBrand: { contains: search, mode: 'insensitive' } },
          { equipmentModel: { contains: search, mode: 'insensitive' } },
          { equipmentType: { contains: search, mode: 'insensitive' } },
          { equipmentSerial: { contains: search, mode: 'insensitive' } },
          { customer: { firstName: { contains: search, mode: 'insensitive' } } },
          { customer: { lastName: { contains: search, mode: 'insensitive' } } }
        ];
      }

      if (status && status !== 'all') {
        where.status = status;
      }

      if (priority && priority !== 'all') {
        where.priority = priority;
      }

      let orderBy: any = { createdAt: 'desc' };
      if (sortBy === 'oldest') orderBy = { createdAt: 'asc' };
      if (sortBy === 'priority') orderBy = [
        { priority: 'asc' },
        { createdAt: 'desc' }
      ];
      if (sortBy === 'amount-desc') orderBy = { totalAmount: 'desc' };
      if (sortBy === 'amount-asc') orderBy = { totalAmount: 'asc' };

      const [orders, total] = await Promise.all([
        prisma.serviceOrder.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy,
          include: {
            customer: {
              select: {
                firstName: true,
                lastName: true,
                phone: true
              }
            }
          }
        }),
        prisma.serviceOrder.count({ where })
      ]);

      // Get status counts
      const counts = await prisma.serviceOrder.aggregate({
        _count: true,
        where: {
          status: { in: ['Aguardando Análise', 'Aguardando Peças'] }
        }
      });
      const activeCount = await prisma.serviceOrder.aggregate({
        _count: true,
        where: {
          status: { in: ['Em Manutenção', 'Em Reparo', 'Aprovado'] }
        }
      });
      const readyCount = await prisma.serviceOrder.aggregate({
        _count: true,
        where: {
          status: { in: ['Pronto para Retirada', 'Pronto', 'Concluído'] }
        }
      });
      const urgentCount = await prisma.serviceOrder.aggregate({
        _count: true,
        where: {
          OR: [
            { status: 'Urgente' },
            { AND: [{ priority: 'high' }, { status: { notIn: ['Pronto para Retirada', 'Pronto', 'Concluído', 'Entregue'] } }] }
          ]
        }
      });

      const data = orders.map(o => ({
        ...o,
        firstName: o.customer.firstName,
        lastName: o.customer.lastName,
        phone: o.customer.phone,
        partsUsed: o.partsUsed ? JSON.parse(o.partsUsed as string || '[]') : [],
        services: o.services ? JSON.parse(o.services as string || '[]') : []
      }));

      res.json({
        data,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          counts: {
            awaiting: counts._count,
            active: activeCount._count,
            ready: readyCount._count,
            urgent: urgentCount._count
          }
        }
      });
    } catch (error) {
      console.error('[SERVICE_ORDERS GET] Error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/service-orders", async (req, res) => {
    try {
      const validatedData = ServiceOrderSchema.parse(req.body);
      const {
        customerId, equipmentType, equipmentBrand, equipmentModel, equipmentColor, equipmentSerial,
        reportedProblem, arrivalPhotoUrl, arrivalPhotoBase64, status, entryDate, analysisPrediction,
        customerPassword, accessories, ramInfo, ssdInfo, priority, createdBy,
        technicalAnalysis, servicesPerformed, services, partsUsed, serviceFee, totalAmount, finalObservations
      } = validatedData;

      const order = await prisma.serviceOrder.create({
        data: {
          customerId,
          equipmentType,
          equipmentBrand,
          equipmentModel,
          equipmentColor,
          equipmentSerial,
          reportedProblem,
          arrivalPhotoUrl,
          arrivalPhotoBase64,
          status: status || 'Aguardando Análise',
          entryDate,
          analysisPrediction,
          customerPassword,
          accessories,
          ramInfo,
          ssdInfo,
          priority: priority || 'medium',
          createdBy: createdBy || 1,
          technicalAnalysis,
          servicesPerformed,
          services: JSON.stringify(services || []),
          partsUsed: JSON.stringify(partsUsed || []),
          serviceFee: serviceFee || 0,
          totalAmount: totalAmount || 0,
          finalObservations
        }
      });

      await prisma.auditLog.create({
        data: {
          userId: createdBy || undefined,
          action: 'create',
          entity: 'ServiceOrder',
          entityId: order.id,
          details: `Created OS for customer ${customerId}`
        }
      });

      res.json({ id: order.id });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.issues });
      }
      console.error('[SERVICE_ORDERS POST] Error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/service-orders/:id", async (req, res) => {
    try {
      const validatedData = ServiceOrderSchema.partial().parse(req.body);
      const {
        status, technicalAnalysis, servicesPerformed, services, partsUsed,
        serviceFee, totalAmount, finalObservations, entryDate, analysisPrediction,
        customerPassword, accessories, ramInfo, ssdInfo, priority,
        equipmentType, equipmentBrand, equipmentModel, equipmentColor, equipmentSerial, arrivalPhotoBase64, updatedBy
      } = validatedData as any;

      const updateData: any = {};

      if (status !== undefined) updateData.status = status;
      if (technicalAnalysis !== undefined) updateData.technicalAnalysis = technicalAnalysis;
      if (servicesPerformed !== undefined) updateData.servicesPerformed = servicesPerformed;
      if (services !== undefined) updateData.services = JSON.stringify(services);
      if (partsUsed !== undefined) updateData.partsUsed = JSON.stringify(partsUsed);
      if (serviceFee !== undefined) updateData.serviceFee = serviceFee;
      if (totalAmount !== undefined) updateData.totalAmount = totalAmount;
      if (finalObservations !== undefined) updateData.finalObservations = finalObservations;
      if (entryDate !== undefined) updateData.entryDate = entryDate;
      if (analysisPrediction !== undefined) updateData.analysisPrediction = analysisPrediction;
      if (customerPassword !== undefined) updateData.customerPassword = customerPassword;
      if (accessories !== undefined) updateData.accessories = accessories;
      if (ramInfo !== undefined) updateData.ramInfo = ramInfo;
      if (ssdInfo !== undefined) updateData.ssdInfo = ssdInfo;
      if (priority !== undefined) updateData.priority = priority;
      if (equipmentType !== undefined) updateData.equipmentType = equipmentType;
      if (equipmentBrand !== undefined) updateData.equipmentBrand = equipmentBrand;
      if (equipmentModel !== undefined) updateData.equipmentModel = equipmentModel;
      if (equipmentColor !== undefined) updateData.equipmentColor = equipmentColor;
      if (equipmentSerial !== undefined) updateData.equipmentSerial = equipmentSerial;
      if (arrivalPhotoBase64 !== undefined) updateData.arrivalPhotoBase64 = arrivalPhotoBase64;
      if (updatedBy !== undefined) updateData.updatedBy = updatedBy;

      await prisma.serviceOrder.update({
        where: { id: parseInt(req.params.id) },
        data: updateData
      });

      await prisma.auditLog.create({
        data: {
          userId: updatedBy || undefined,
          action: 'update',
          entity: 'ServiceOrder',
          entityId: parseInt(req.params.id),
          details: `Updated OS #${req.params.id}`
        }
      });

      res.json({ success: true });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.issues });
      }
      console.error('[SERVICE_ORDERS PUT] Error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/service-orders/:id", async (req, res) => {
    try {
      await prisma.serviceOrder.delete({
        where: { id: parseInt(req.params.id) }
      });
      res.json({ success: true });
    } catch (error: any) {
      console.error('[SERVICE_ORDERS DELETE] Error:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // ============================================
  // SERVICE ORDER STATUSES
  // ============================================
  app.get("/api/service-order-statuses", async (req, res) => {
    try {
      const statuses = await prisma.serviceOrderStatus.findMany({
        orderBy: { priority: 'asc' }
      });
      res.json(statuses);
    } catch (error) {
      console.error('[SERVICE_ORDER_STATUSES GET] Error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/service-order-statuses", async (req, res) => {
    try {
      const { name, color, priority, isDefault } = req.body;
      const status = await prisma.serviceOrderStatus.create({
        data: { name, color, priority, isDefault }
      });
      res.json({ id: status.id });
    } catch (error: any) {
      console.error('[SERVICE_ORDER_STATUSES POST] Error:', error);
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/service-order-statuses/:id", async (req, res) => {
    try {
      const { name, color, priority, isDefault } = req.body;
      await prisma.serviceOrderStatus.update({
        where: { id: parseInt(req.params.id) },
        data: { name, color, priority, isDefault }
      });
      res.json({ success: true });
    } catch (error: any) {
      console.error('[SERVICE_ORDER_STATUSES PUT] Error:', error);
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/service-order-statuses/:id", async (req, res) => {
    try {
      await prisma.serviceOrderStatus.delete({
        where: { id: parseInt(req.params.id) }
      });
      res.json({ success: true });
    } catch (error: any) {
      console.error('[SERVICE_ORDER_STATUSES DELETE] Error:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // ============================================
  // BRANDS & MODELS
  // ============================================
  app.get("/api/brands", async (req, res) => {
    try {
      const brands = await prisma.brand.findMany({
        include: { Models: true },
        orderBy: { name: 'asc' }
      });
      res.json(brands);
    } catch (error) {
      console.error('[BRANDS GET] Error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/brands", async (req, res) => {
    try {
      const { name, equipmentType } = req.body;
      const brand = await prisma.brand.create({
        data: { name, equipmentType }
      });
      res.json({ id: brand.id });
    } catch (error: any) {
      console.error('[BRANDS POST] Error:', error);
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/brands/:id", async (req, res) => {
    try {
      const { name, equipmentType } = req.body;
      await prisma.brand.update({
        where: { id: parseInt(req.params.id) },
        data: { name, equipmentType }
      });
      res.json({ success: true });
    } catch (error: any) {
      console.error('[BRANDS PUT] Error:', error);
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/brands/:id", async (req, res) => {
    try {
      await prisma.brand.delete({
        where: { id: parseInt(req.params.id) }
      });
      res.json({ success: true });
    } catch (error: any) {
      console.error('[BRANDS DELETE] Error:', error);
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/models", async (req, res) => {
    try {
      const models = await prisma.model.findMany({
        include: { brand: true },
        orderBy: { name: 'asc' }
      });
      res.json(models);
    } catch (error) {
      console.error('[MODELS GET] Error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/models", async (req, res) => {
    try {
      const { brandId, name } = req.body;
      const model = await prisma.model.create({
        data: { brandId, name }
      });
      res.json({ id: model.id });
    } catch (error: any) {
      console.error('[MODELS POST] Error:', error);
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/models/:id", async (req, res) => {
    try {
      await prisma.model.delete({
        where: { id: parseInt(req.params.id) }
      });
      res.json({ success: true });
    } catch (error: any) {
      console.error('[MODELS DELETE] Error:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // ============================================
  // EQUIPMENT TYPES
  // ============================================
  app.get("/api/equipment-types", async (req, res) => {
    try {
      const types = await prisma.equipmentType.findMany({
        orderBy: { name: 'asc' }
      });
      res.json(types);
    } catch (error) {
      console.error('[EQUIPMENT_TYPES GET] Error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/equipment-types", async (req, res) => {
    try {
      const { name, icon } = req.body;
      const type = await prisma.equipmentType.create({
        data: { name, icon }
      });
      res.json({ id: type.id });
    } catch (error: any) {
      console.error('[EQUIPMENT_TYPES POST] Error:', error);
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/equipment-types/:id", async (req, res) => {
    try {
      const { name, icon } = req.body;
      const oldType = await prisma.equipmentType.findUnique({
        where: { id: parseInt(req.params.id) }
      });

      await prisma.equipmentType.update({
        where: { id: parseInt(req.params.id) },
        data: { name, icon }
      });

      if (oldType && oldType.name !== name) {
        await prisma.serviceOrder.updateMany({
          where: { equipmentType: oldType.name },
          data: { equipmentType: name }
        });
        await prisma.brand.updateMany({
          where: { equipmentType: oldType.name },
          data: { equipmentType: name }
        });
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error('[EQUIPMENT_TYPES PUT] Error:', error);
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/equipment-types/:id", async (req, res) => {
    try {
      await prisma.equipmentType.delete({
        where: { id: parseInt(req.params.id) }
      });
      res.json({ success: true });
    } catch (error: any) {
      console.error('[EQUIPMENT_TYPES DELETE] Error:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // ============================================
  // RECEIPTS
  // ============================================
  app.get("/api/receipts/:paymentId", async (req, res) => {
    try {
      const receipts = await prisma.receipt.findMany({
        where: { paymentId: parseInt(req.params.paymentId) },
        orderBy: { createdAt: 'desc' }
      });
      res.json(receipts);
    } catch (error) {
      console.error('[RECEIPTS GET] Error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/receipts", async (req, res) => {
    try {
      const { paymentId, content } = req.body;
      const receipt = await prisma.receipt.create({
        data: { paymentId, content }
      });
      res.json({ id: receipt.id });
    } catch (error: any) {
      console.error('[RECEIPTS POST] Error:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // ============================================
  // AI PROXY
  // ============================================
  app.post('/api/ai/generate', async (req, res) => {
    try {
      const { prompt, model = 'gemini-2.0-flash' } = req.body;
      if (!prompt) return res.status(400).json({ error: 'prompt é obrigatório' });

      const { GoogleGenAI } = await import('@google/genai');
      const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const result = await genAI.models.generateContent({ model, contents: prompt });
      const text = result.text;

      res.json({ text });
    } catch (err: any) {
      console.error('[AI] Error:', err);
      res.status(500).json({ error: 'Erro ao chamar Gemini', detail: err.message });
    }
  });

  // ============================================
  // ERROR HANDLER
  // ============================================
  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('[ERROR]', new Date().toISOString(), err.message);
    if (process.env.NODE_ENV !== 'production') console.error(err.stack);
    res.status(500).json({ error: 'Erro interno do servidor' });
  });

  // ============================================
  // SERVER START
  // ============================================
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[PRISMA SERVER] Rodando em http://localhost:${PORT}`);
    console.log(`[PRISMA SERVER] Conectado ao Supabase`);
  });
}

startServer().catch((err) => {
  console.error('[FATAL]', err);
  process.exit(1);
});