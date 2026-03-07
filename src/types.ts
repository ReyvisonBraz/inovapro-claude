export interface User {
  id: number;
  username: string;
  name: string;
  role: 'owner' | 'manager' | 'employee';
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
  hiddenColumns: string[];
  settingsPassword?: string;
  receiptLayout: 'simple' | 'a4';
  receiptLogo?: string;
  receiptCnpj?: string;
  receiptAddress?: string;
  receiptPixKey?: string;
  receiptQrCode?: string;
}

export type Screen = 'dashboard' | 'transactions' | 'reports' | 'settings' | 'customers' | 'client-payments';
