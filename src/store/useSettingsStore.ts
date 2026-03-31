import { create } from 'zustand';
import { AppSettings, Category } from '../types';

interface SettingsState {
  settings: AppSettings;
  setSettings: (newSettings: Partial<AppSettings> | ((prev: AppSettings) => AppSettings)) => void;
  categories: Category[];
  setCategories: (categories: Category[]) => void;
  fetchSettings: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  saveSettingsAPI: (newSettings: Partial<AppSettings>) => Promise<void>;
}

const defaultSettings: AppSettings = {
  appName: 'Financeiro Pro',
  fiscalYear: '2024',
  primaryColor: '#1152d4',
  categories: 'Alimentação,Trabalho,Utilidades,Viagem,Lazer,Outros',
  incomeCategories: 'Salário,Vendas,Serviços,Investimentos,Outros',
  expenseCategories: 'Alimentação,Trabalho,Utilidades,Viagem,Lazer,Outros',
  profileName: 'Inova Informática',
  profileAvatar: 'https://picsum.photos/seed/inova/100/100',
  appVersion: 'Versão Empresarial',
  initialBalance: 0,
  showWarnings: true,
  currency: 'BRL',
  hiddenColumns: [],
  settingsPassword: '1234',
  receiptLayout: 'a4',
  receiptLogo: '',
  receiptCnpj: '',
  receiptAddress: '',
  receiptPixKey: '',
  receiptQrCode: '',
  receiptTerms: '',
  whatsappBillingTemplate: '',
  whatsappOSTemplate: '',
  sendPulseClientId: '',
  sendPulseClientSecret: '',
  sendPulseTemplateId: ''
};

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: defaultSettings,
  setSettings: (newSettings) => set((state) => ({
    settings: typeof newSettings === 'function' 
      ? newSettings(state.settings) 
      : { ...state.settings, ...newSettings }
  })),
  categories: [],
  setCategories: (categories) => set({ categories }),
  fetchSettings: async () => {
    try {
      const res = await fetch('/api/settings');
      if (!res.ok) throw new Error('Failed to fetch settings');
      const data = await res.json();
      set({ settings: data });
    } catch (err) {
      console.error("Failed to fetch settings", err);
    }
  },
  fetchCategories: async () => {
    try {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('Failed to fetch categories');
      const data = await res.json();
      set({ categories: data });
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  },
  saveSettingsAPI: async (newSettings) => {
    const { settings } = useSettingsStore.getState();
    const updatedSettings = { ...settings, ...newSettings };
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSettings),
      });
      if (!res.ok) throw new Error('Failed to save settings');
      set({ settings: updatedSettings });
    } catch (err) {
      console.error("Failed to save settings", err);
      throw err;
    }
  },
}));
