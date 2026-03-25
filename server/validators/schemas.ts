import { z } from "zod";

// --- Transactions ---
export const TransactionSchema = z.object({
  description: z.string().min(1, "Descrição é obrigatória"),
  category: z.string().min(1, "Categoria é obrigatória"),
  type: z.enum(["income", "expense"]),
  amount: z.number().positive("Valor deve ser positivo"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}/, "Data inválida"),
});

// --- Customers ---
export const CustomerSchema = z.object({
  firstName: z.string().min(1, "Nome é obrigatório"),
  lastName: z.string().min(1, "Sobrenome é obrigatório"),
  nickname: z.string().optional().nullable(),
  cpf: z.string().optional().nullable(),
  companyName: z.string().optional().nullable(),
  phone: z.string().min(1, "Telefone é obrigatório"),
  observation: z.string().optional().nullable(),
  creditLimit: z.number().nonnegative().optional(),
});

// --- Client Payments ---
export const ClientPaymentSchema = z.object({
  customerId: z.number().int().positive(),
  description: z.string().min(1, "Descrição é obrigatória"),
  totalAmount: z.number().positive("Valor total deve ser positivo"),
  paidAmount: z.number().nonnegative().optional(),
  purchaseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}/),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}/),
  paymentMethod: z.string().min(1, "Método de pagamento é obrigatório"),
  status: z.enum(["pending", "partial", "paid"]).optional(),
  installmentsCount: z.number().int().positive().optional(),
  type: z.enum(["income", "expense"]).optional(),
  saleId: z.string().optional().nullable(),
  paymentHistory: z.string().optional(),
});

export const ClientPaymentUpdateSchema = z.object({
  paidAmount: z.number().nonnegative().optional(),
  status: z.enum(["pending", "partial", "paid"]).optional(),
  paymentHistory: z.array(z.object({
    amount: z.number(),
    date: z.string(),
  })).optional(),
});

// --- Service Orders ---
const ServiceItemSchema = z.object({
  name: z.string(),
  price: z.number().nonnegative(),
});

const PartUsedSchema = z.object({
  id: z.number().optional(),
  name: z.string(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().nonnegative(),
  subtotal: z.number().nonnegative(),
});

export const ServiceOrderSchema = z.object({
  customerId: z.number().int().positive(),
  equipmentType: z.string().optional().nullable(),
  equipmentBrand: z.string().optional().nullable(),
  equipmentModel: z.string().optional().nullable(),
  equipmentColor: z.string().optional().nullable(),
  equipmentSerial: z.string().optional().nullable(),
  reportedProblem: z.string().min(1, "Problema relatado é obrigatório"),
  arrivalPhotoUrl: z.string().optional().nullable(),
  arrivalPhotoBase64: z.string().optional().nullable(),
  status: z.string().optional(),
  entryDate: z.string().optional().nullable(),
  analysisPrediction: z.string().optional().nullable(),
  customerPassword: z.string().optional().nullable(),
  accessories: z.string().optional().nullable(),
  ramInfo: z.string().optional().nullable(),
  ssdInfo: z.string().optional().nullable(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  technicalAnalysis: z.string().optional().nullable(),
  servicesPerformed: z.string().optional().nullable(),
  services: z.array(ServiceItemSchema).optional(),
  partsUsed: z.array(PartUsedSchema).optional(),
  serviceFee: z.number().nonnegative().optional(),
  totalAmount: z.number().nonnegative().optional(),
  finalObservations: z.string().optional().nullable(),
});

// --- Users ---
export const UserCreateSchema = z.object({
  username: z.string().min(3, "Usuário deve ter pelo menos 3 caracteres"),
  password: z.string().min(4, "Senha deve ter pelo menos 4 caracteres"),
  role: z.enum(["owner", "manager", "employee"]),
  name: z.string().min(1, "Nome é obrigatório"),
  permissions: z.array(z.string()).optional(),
});

export const UserUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.enum(["owner", "manager", "employee"]).optional(),
  password: z.string().min(4).optional(),
  permissions: z.array(z.string()).optional(),
});

// --- Auth ---
export const LoginSchema = z.object({
  username: z.string().min(1, "Usuário é obrigatório"),
  password: z.string().min(1, "Senha é obrigatória"),
});

// --- Settings (partial update) ---
export const SettingsSchema = z.object({
  appName: z.string().optional(),
  appVersion: z.string().optional(),
  fiscalYear: z.string().optional(),
  primaryColor: z.string().optional(),
  categories: z.string().optional(),
  incomeCategories: z.string().optional(),
  expenseCategories: z.string().optional(),
  profileName: z.string().optional(),
  profileAvatar: z.string().optional(),
  initialBalance: z.number().optional(),
  showWarnings: z.boolean().optional(),
  hiddenColumns: z.array(z.string()).optional(),
  settingsPassword: z.string().optional(),
  receiptLayout: z.string().optional(),
  receiptLogo: z.string().optional(),
  sendPulseClientId: z.string().optional(),
  sendPulseClientSecret: z.string().optional(),
  sendPulseTemplateId: z.string().optional(),
  telegramBotToken: z.string().optional(),
  telegramChatId: z.string().optional(),
});

// --- Categories ---
export const CategorySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  type: z.enum(["income", "expense"]),
});

// --- Inventory ---
export const InventoryItemSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  category: z.enum(["product", "service"]),
  sku: z.string().optional().nullable(),
  costPrice: z.number().nonnegative().optional(),
  salePrice: z.number().nonnegative().optional(),
  quantity: z.number().int().nonnegative().optional(),
  minQuantity: z.number().int().nonnegative().optional(),
  unitPrice: z.number().nonnegative().optional(),
  stockLevel: z.number().int().nonnegative().optional(),
});

// --- Brands / Models / Equipment ---
export const BrandSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  equipmentType: z.string().optional(),
});

export const ModelSchema = z.object({
  brandId: z.number().int().positive(),
  name: z.string().min(1, "Nome é obrigatório"),
});

export const EquipmentTypeSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  icon: z.string().optional(),
});

export const ServiceOrderStatusSchema = z.object({
  name: z.string().min(1),
  color: z.string().min(1),
  priority: z.number().int().optional(),
  isDefault: z.boolean().optional(),
});

// --- Helpers ---
export const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  search: z.string().optional().default(""),
});

// --- Receipts ---
export const ReceiptSchema = z.object({
  paymentId: z.number().int().positive(),
  content: z.string().min(1),
});
