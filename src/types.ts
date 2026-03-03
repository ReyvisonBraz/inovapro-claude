export interface Transaction {
  id: number;
  description: string;
  category: string;
  type: 'income' | 'expense';
  amount: number;
  date: string;
  status: string;
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
}

export interface AppSettings {
  appName: string;
  fiscalYear: string;
  primaryColor: string;
  categories: string; // Comma separated
  profileName: string;
  profileAvatar: string;
  appVersion: string;
  initialBalance: number;
  showWarnings: boolean;
  hiddenColumns: string[];
  settingsPassword?: string;
}

export type Screen = 'dashboard' | 'transactions' | 'reports' | 'settings' | 'customers' | 'client-payments';
