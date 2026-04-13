import { useState, useCallback } from 'react';
import { AppSettings } from '../types';
import api from '../lib/api';
import { useToast } from '../components/ui/Toast';

export const useAppSettings = () => {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<AppSettings>({
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
    receiptQrCode: ''
  });

  const fetchSettings = useCallback(async () => {
    try {
      const res = await api.get('/settings');
      if (res.data) setSettings(res.data);
    } catch (err) {
      console.error("Failed to fetch settings", err);
      showToast("Erro ao carregar configurações.", "error");
    }
  }, [showToast]);

  const updateSettings = useCallback(async (newSettings: AppSettings) => {
    try {
      await api.put('/settings', newSettings);
      setSettings(newSettings);
      return true;
    } catch (err) {
      console.error("Failed to update settings", err);
      showToast("Erro ao atualizar configurações.", "error");
      return false;
    }
  }, [showToast]);

  return { settings, setSettings, fetchSettings, updateSettings };
};
