import { useState, useCallback } from 'react';
import { AppSettings } from '../types';
import { api } from '../services/api';

export const useAppSettings = () => {
  const [settings, setSettings] = useState<AppSettings>({
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
    receiptQrCode: ''
  });

  const fetchSettings = useCallback(async () => {
    try {
      const data = await api.get('/api/settings');
      if (data) setSettings(data);
    } catch (err) {
      console.error("Failed to fetch settings", err);
    }
  }, []);

  const updateSettings = useCallback(async (newSettings: AppSettings) => {
    try {
      await api.put('/api/settings', newSettings);
      setSettings(newSettings);
      return true;
    } catch (err) {
      console.error("Failed to update settings", err);
      return false;
    }
  }, []);

  return { settings, setSettings, fetchSettings, updateSettings };
};
