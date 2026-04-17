import { create } from 'zustand';
import { AppSettings, Category } from '../types';
import api from '../lib/api';

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
  appName: 'INOVA PRO',
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
  settingsPassword: '',
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
      const { data } = await api.get('/settings');
      set({ settings: data });
    } catch (err) {
      console.error("Failed to fetch settings", err);
    }
  },
  fetchCategories: async () => {
    try {
      const { data } = await api.get('/categories');
      set({ categories: data });
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  },
  saveSettingsAPI: async (newSettings) => {
    const { settings } = useSettingsStore.getState();
    const updatedSettings = { ...settings, ...newSettings };
    try {
      await api.post('/settings', updatedSettings);
      set({ settings: updatedSettings });
    } catch (err) {
      console.error("Failed to save settings", err);
      throw err;
    }
  },
}));
