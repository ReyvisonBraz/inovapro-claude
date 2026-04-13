import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClientPayment } from '../types';
import api from '../lib/api';
import { useToast } from '../components/ui/Toast';
import { useClientPaymentStore } from '../store/useClientPaymentStore';
import { useFilterStore } from '../store/useFilterStore';

export function useClientPayments() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const { paymentsPage, setPaymentsPage } = useClientPaymentStore();
  const { paymentSearchTerm } = useFilterStore();

  const fetchClientPayments = async (page: number, searchTerm: string = '') => {
    const res = await api.get(`/client-payments?page=${page}&limit=20&search=${searchTerm}`);
    return res.data;
  };

  const clientPaymentsQuery = useQuery({
    queryKey: ['clientPayments', paymentsPage, paymentSearchTerm],
    queryFn: () => fetchClientPayments(paymentsPage, paymentSearchTerm),
  });

  const addPaymentMutation = useMutation({
    mutationFn: async (payment: Partial<ClientPayment>) => {
      const res = await api.post('/client-payments', payment);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientPayments'] });
      showToast('Pagamento salvo com sucesso!', 'success');
    },
    onError: (error: any) => {
      console.error('Failed to save payment', error);
      showToast(error.message || 'Erro ao salvar pagamento.', 'error');
    },
  });

  const savePaymentMutation = useMutation({
    mutationFn: async ({ payment, id }: { payment: Partial<ClientPayment>; id?: number }) => {
      const url = id ? `/client-payments/${id}` : '/client-payments';
      const method = id ? 'PUT' : 'POST';

      if (method === 'PUT') {
        const res = await api.put(url, payment);
        return res.data;
      } else {
        const res = await api.post(url, payment);
        return res.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientPayments'] });
      showToast('Pagamento salvo com sucesso!', 'success');
    },
    onError: (error: any) => {
      console.error('Failed to save payment', error);
      showToast(error.message || 'Erro ao salvar pagamento.', 'error');
    },
  });

  const deletePaymentMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/client-payments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientPayments'] });
      showToast('Pagamento excluído com sucesso!', 'success');
    },
    onError: (error: any) => {
      console.error('Failed to delete payment', error);
      showToast('Erro ao excluir pagamento.', 'error');
    },
  });

  const recordPaymentMutation = useMutation({
    mutationFn: async ({ id, amount, date, updatedBy }: { id: number; amount: number; date: string; updatedBy?: number }) => {
      const res = await api.post(`/client-payments/${id}/pay`, { amount, date, updatedBy });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientPayments'] });
      showToast('Pagamento registrado com sucesso!', 'success');
    },
    onError: (error: any) => {
      console.error('Failed to record payment', error);
      showToast(error.message || 'Erro ao registrar pagamento.', 'error');
    },
  });

  return {
    clientPaymentsQuery,
    clientPayments: clientPaymentsQuery.data || { data: [], meta: { page: 1, totalPages: 1, total: 0, limit: 20 } },
    paymentsPage,
    setPaymentsPage,
    addPaymentMutation,
    savePaymentMutation,
    deletePaymentMutation,
    recordPaymentMutation,
    saveClientPaymentAPI: (payment: any, id?: number) => savePaymentMutation.mutateAsync({ payment, id }),
    deleteClientPaymentAPI: (id: number) => deletePaymentMutation.mutateAsync(id),
  };
}
