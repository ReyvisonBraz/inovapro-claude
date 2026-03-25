export interface User {
  id: number;
  username: string;
  name: string;
  role: 'owner' | 'manager' | 'employee';
  permissions: string[];
  createdAt: string;
}

export interface AuditLog {
  id: number;
  userId: number;
  userName?: string;
  action: string;
  entity: string;
  entityId?: number;
  details?: string;
  timestamp: string;
}

export interface Transaction {
  id: number;
  description: string;
  category: string;
  type: 'income' | 'expense';
  amount: number;
  date: string;
  status: string;
  paymentMethod?: string;
  createdBy?: number;
  updatedBy?: number;
}

export interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  nickname?: string;
  cpf?: string;
  companyName?: string;
  phone: string;
  observation?: string;
  creditLimit?: number;
  createdAt: string;
  createdBy?: number;
  updatedBy?: number;
}

export interface ClientPayment {
  id: number;
  customerId: number;
  description: string;
  totalAmount: number;
  paidAmount: number;
  purchaseDate: string;
  dueDate: string;
  paymentMethod: string;
  status: 'pending' | 'partial' | 'paid';
  installmentsCount: number;
  type: 'income' | 'expense';
  saleId?: string;
  customerName?: string;
  paymentHistory?: string; // JSON string of { amount: number, date: string }[]
  createdBy?: number;
  updatedBy?: number;
}

export interface Category {
  id: number;
  name: string;
  type: 'income' | 'expense';
}

export interface AppSettings {
  appName: string;
  fiscalYear: string;
  primaryColor: string;
  categories: string; // Comma separated (legacy)
  incomeCategories: string; // Comma separated
  expenseCategories: string; // Comma separated
  profileName: string;
  profileAvatar: string;
  appVersion: string;
  initialBalance: number;
  showWarnings: boolean;
  currency: string;
  hiddenColumns: string[];
  settingsPassword?: string;
  receiptLayout: 'simple' | 'a4';
  receiptLogo?: string;
  receiptCnpj?: string;
  receiptAddress?: string;
  receiptPixKey?: string;
  receiptQrCode?: string;
  whatsappBillingTemplate?: string;
  whatsappOSTemplate?: string;
  sendPulseClientId?: string;
  sendPulseClientSecret?: string;
  sendPulseTemplateId?: string;
  showPostCustomerActionPrompt?: boolean;
  showWhatsAppPrompt?: boolean;
  telegramBotToken?: string;
  telegramChatId?: string;
}

export interface InventoryItem {
  id: number;
  name: string;
  category: 'product' | 'service';
  sku?: string;
  unitPrice: number;
  stockLevel: number;
  createdAt: string;
  createdBy?: number;
  updatedBy?: number;
}

export interface ServiceOrderPart {
  id?: number; // Inventory item ID
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface ServiceOrderStatus {
  id: number;
  name: string;
  color: string;
  priority: number;
  isDefault?: boolean;
}

export interface ServiceOrderItem {
  name: string;
  price: number;
}

export interface ServiceOrder {
  id: number;
  customerId: number;
  firstName?: string;
  lastName?: string;
  phone?: string;
  equipmentType?: string;
  equipmentBrand?: string;
  equipmentModel?: string;
  equipmentColor?: string;
  equipmentSerial?: string;
  reportedProblem?: string;
  arrivalPhotoUrl?: string;
  arrivalPhotoBase64?: string;
  status: string;
  technicalAnalysis?: string;
  servicesPerformed?: string;
  services?: ServiceOrderItem[];
  partsUsed: ServiceOrderPart[];
  serviceFee: number;
  totalAmount: number;
  finalObservations?: string;
  entryDate?: string;
  analysisPrediction?: string;
  customerPassword?: string;
  accessories?: string;
  ramInfo?: string;
  ssdInfo?: string;
  priority?: 'low' | 'medium' | 'high';
  createdAt: string;
  createdBy?: number;
  updatedBy?: number;
}

export interface EquipmentType {
  id: number;
  name: string;
  icon?: string;
}

export interface Brand {
  id: number;
  name: string;
  equipmentType?: string;
}

export interface Model {
  id: number;
  brandId: number;
  name: string;
}

export type Screen = 'dashboard' | 'transactions' | 'reports' | 'settings' | 'customers' | 'client-payments' | 'service-orders' | 'inventory';
