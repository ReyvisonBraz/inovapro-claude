import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { Customer } from '../types';
import { useToast } from '../components/ui/Toast';
import { useCustomerStore } from '../store/useCustomerStore';
import { useFilterStore } from '../store/useFilterStore';

export const useCustomers = () => {
  const queryClient = useQueryClient();
  const { customersPage, setCustomersPage } = useCustomerStore();
  const { customerSearchTerm, setCustomerSearchTerm } = useFilterStore();
  const { showToast } = useToast();

  // Query para buscar clientes
  const { data: customersData, isLoading, isError, refetch } = useQuery({
    queryKey: ['customers', customersPage, customerSearchTerm],
    queryFn: async () => {
      const { data } = await api.get(`/customers?page=${customersPage}&limit=20&search=${customerSearchTerm}`);
      return data;
    },
  });

  // Mutação para salvar/editar cliente
  const saveMutation = useMutation({
    mutationFn: async ({ customer, id }: { customer: Partial<Customer>; id?: number }) => {
      if (id) {
        const { data } = await api.put(`/customers/${id}`, customer);
        return data;
      } else {
        const { data } = await api.post('/customers', customer);
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      showToast('Cliente salvo com sucesso!', 'success');
    },
    onError: (error: any) => {
      console.error('Failed to save customer', error);
      showToast(error.response?.data?.error || 'Erro ao salvar cliente.', 'error');
    },
  });

  // Mutação para excluir cliente
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/customers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      showToast('Cliente excluído com sucesso!', 'success');
    },
    onError: (error: any) => {
      console.error('Failed to delete customer', error);
      showToast(error.response?.data?.error || 'Erro ao excluir cliente.', 'error');
    },
  });

  // Função para verificar pagamentos (pode ser uma query também, mas mantendo como função por enquanto)
  const checkCustomerPaymentsAPI = async (id: number) => {
    const { data } = await api.get(`/customers/${id}/payments`);
    return data;
  };

  return { 
    customers: customersData || { data: [], meta: { total: 0, page: 1, totalPages: 1, limit: 20 } }, 
    customersPage,
    setCustomersPage,
    customerSearchTerm,
    setCustomerSearchTerm,
    isLoading,
    isError,
    fetchCustomers: refetch, 
    saveCustomerAPI: (customer: Partial<Customer>, id?: number) => saveMutation.mutateAsync({ customer, id }),
    deleteCustomerAPI: (id: number) => deleteMutation.mutateAsync(id),
    checkCustomerPaymentsAPI
  };
};
