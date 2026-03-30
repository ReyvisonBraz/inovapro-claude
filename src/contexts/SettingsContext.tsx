import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { AppSettings } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  isSettingsUnlocked: boolean;
  unlockSettings: (password: string) => boolean;
  lockSettings: () => void;
  isLoading: boolean;
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
  sendPulseClientId: '',
  sendPulseClientSecret: '',
  sendPulseTemplateId: ''
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isSettingsUnlocked, setIsSettingsUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSettings = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setIsLoading(true);
      const data = await api.get('/api/settings');
      if (data && Object.keys(data).length > 0) {
        setSettings({ ...defaultSettings, ...data });
      }
    } catch (err) {
      console.error('Failed to fetch settings', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSettings = useCallback(async (newSettings: Partial<AppSettings>) => {
    try {
      const updated = { ...settings, ...newSettings };
      await api.put('/api/settings', updated);
      setSettings(updated);
    } catch (err) {
      console.error('Failed to update settings', err);
      throw err;
    }
  }, [settings]);

  const unlockSettings = useCallback((password: string): boolean => {
    if (password === settings.settingsPassword) {
      setIsSettingsUnlocked(true);
      return true;
    }
    return false;
  }, [settings.settingsPassword]);

  const lockSettings = useCallback(() => {
    setIsSettingsUnlocked(false);
  }, []);

  return (
    <SettingsContext.Provider value={{
      settings,
      updateSettings,
      isSettingsUnlocked,
      unlockSettings,
      lockSettings,
      isLoading
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
