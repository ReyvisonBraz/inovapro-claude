import { create } from 'zustand';
import { AppSettings, Category } from '../types';
import api from '../lib/api';

interface SettingsState {
  settings: AppSettings;
  setSettings: (newSettings: Partial<AppSettings> | ((prev: AppSettings) => AppSettings)) => void;
  categories: Category[];
  setCategories: (categories: Category[]) => void;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
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
  isLoading: false,
  isError: false,
  errorMessage: null,
  fetchSettings: async () => {
    set({ isLoading: true, isError: false, errorMessage: null });
    try {
      const { data } = await api.get('/settings');
      set({ settings: data, isLoading: false });
    } catch (err: any) {
      const message = err?.response?.data?.error || 'Erro ao carregar configurações';
      set({ isLoading: false, isError: true, errorMessage: message });
      console.error('[useSettingsStore] fetchSettings failed:', message);
    }
  },
  fetchCategories: async () => {
    set({ isLoading: true, isError: false, errorMessage: null });
    try {
      const { data } = await api.get('/categories');
      set({ categories: data, isLoading: false });
    } catch (err: any) {
      const message = err?.response?.data?.error || 'Erro ao carregar categorias';
      set({ isLoading: false, isError: true, errorMessage: message });
      console.error('[useSettingsStore] fetchCategories failed:', message);
    }
  },
  saveSettingsAPI: async (newSettings) => {
    const { settings } = useSettingsStore.getState();
    const updatedSettings = { ...settings, ...newSettings };
    set({ isLoading: true, isError: false, errorMessage: null });
    try {
      await api.post('/settings', updatedSettings);
      set({ settings: updatedSettings, isLoading: false });
    } catch (err: any) {
      const message = err?.response?.data?.error || 'Erro ao salvar configurações';
      set({ isLoading: false, isError: true, errorMessage: message });
      console.error('[useSettingsStore] saveSettingsAPI failed:', message);
      throw err;
    }
  },
}));
