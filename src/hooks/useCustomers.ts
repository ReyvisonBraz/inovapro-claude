import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { Customer } from '../types';
import { useToast } from '../components/ui/Toast';
import { useCustomerStore } from '../store/useCustomerStore';
import { useFilterStore } from '../store/useFilterStore';
import { useCrudApi } from './useCrudApi';

export const useCustomers = () => {
  const { customersPage, setCustomersPage } = useCustomerStore();
  const { customerSearchTerm, setCustomerSearchTerm } = useFilterStore();
  const { showToast } = useToast();

  // Query para buscar clientes
  const { data: customersData, isLoading, isError, refetch } = useQuery({
    queryKey: ['customers', customersPage, customerSearchTerm],
    staleTime: 30_000,
    queryFn: async () => {
      const { data } = await api.get(`/customers?page=${customersPage}&limit=20&search=${customerSearchTerm}`);
      return data;
    },
  });

  const { data: allCustomersData } = useQuery({
    queryKey: ['customers', 'all'],
    staleTime: 60_000,
    queryFn: async () => {
      const { data } = await api.get('/customers?page=1&limit=9999');
      return data;
    },
  });

  const { saveMutation, deleteMutation } = useCrudApi({
    baseKey: 'customers',
    endpoint: '/customers',
    saveSuccessMessage: 'Cliente salvo com sucesso!',
    deleteSuccessMessage: 'Cliente excluído com sucesso!',
    showToast,
  });

  // Função para verificar pagamentos (pode ser uma query também, mas mantendo como função por enquanto)
  const checkCustomerPaymentsAPI = async (id: number) => {
    const { data } = await api.get(`/customers/${id}/payments`);
    return data;
  };

  return {
    customers: customersData || { data: [], meta: { total: 0, page: 1, totalPages: 1, limit: 20 } },
    allCustomers: (allCustomersData?.data || []) as Customer[],
    customersPage,
    setCustomersPage,
    customerSearchTerm,
    setCustomerSearchTerm,
    isLoading,
    isError,
    fetchCustomers: refetch,
    isCustomerSaving: saveMutation.isPending,
    saveCustomerAPI: (customer: Partial<Customer>, id?: number) => saveMutation.mutateAsync({ item: customer, id }),
    deleteCustomerAPI: (id: number) => deleteMutation.mutateAsync(id),
    checkCustomerPaymentsAPI
  };
};
