import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClientPayment } from '../types';
import api from '../lib/api';
import { useToast } from '../components/ui/Toast';
import { useDataStore } from '../store/useDataStore';
import { useFilterStore } from '../store/useFilterStore';
import { useAuthStore } from '../store/useAuthStore';
import { useCrudApi } from './useCrudApi';
import { mergeSavedRecord, upsertCachedRecord, scheduleInvalidate } from '../lib/query-cache';

export function useClientPayments() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const { clientPaymentsPage: paymentsPage, setClientPaymentsPage: setPaymentsPage } = useDataStore();
  const { paymentSearchTerm } = useFilterStore();
  const { isAuthenticated } = useAuthStore();

  const fetchClientPayments = async (page: number, searchTerm: string = '') => {
    const res = await api.get(`/client-payments?page=${page}&limit=20&search=${searchTerm}`);
    return res.data;
  };

  const clientPaymentsQuery = useQuery({
    queryKey: ['clientPayments', paymentsPage, paymentSearchTerm],
    staleTime: 30_000,
    enabled: isAuthenticated,
    queryFn: () => fetchClientPayments(paymentsPage, paymentSearchTerm),
  });

  const addPaymentMutation = useMutation({
    mutationFn: async (payment: Partial<ClientPayment>) => {
      const res = await api.post('/client-payments', payment);
      return res.data;
    },
    onSuccess: (data, payment) => {
      const saved = mergeSavedRecord(payment, data);
      queryClient.setQueriesData(
        { queryKey: ['clientPayments'] },
        current => upsertCachedRecord(current, saved),
      );
      scheduleInvalidate(queryClient, 'clientPayments');
      showToast('Pagamento salvo com sucesso!', 'success');
    },
    onError: (error: any) => {
      console.error('Failed to save payment', error);
      showToast(error.response?.data?.error || error.message || 'Erro ao salvar pagamento.', 'error');
    },
  });

  const { saveMutation: savePaymentMutation, deleteMutation: deletePaymentMutation } = useCrudApi({
    baseKey: 'clientPayments',
    endpoint: '/client-payments',
    saveSuccessMessage: 'Pagamento salvo com sucesso!',
    deleteSuccessMessage: 'Pagamento excluído com sucesso!',
    showToast,
  });

  const recordPaymentMutation = useMutation({
    mutationFn: async ({ id, amount, date, updatedBy }: { id: number; amount: number; date: string; updatedBy?: number }) => {
      const res = await api.post(`/client-payments/${id}/pay`, { amount, date, updatedBy });
      return res.data;
    },
    onSuccess: (data, variables) => {
      queryClient.setQueriesData(
        { queryKey: ['clientPayments'] },
        current => upsertCachedRecord(current, {
          id: variables.id,
          paidAmount: data.newPaidAmount,
          status: data.newStatus,
        }),
      );
      scheduleInvalidate(queryClient, 'clientPayments');
      showToast('Pagamento registrado com sucesso!', 'success');
    },
    onError: (error: any) => {
      console.error('Failed to record payment', error);
      showToast(error.response?.data?.error || error.message || 'Erro ao registrar pagamento.', 'error');
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
    saveClientPaymentAPI: (payment: Partial<ClientPayment>, id?: number) => savePaymentMutation.mutateAsync({ item: payment, id }),
    deleteClientPaymentAPI: (id: number) => deletePaymentMutation.mutateAsync(id),
  };
}
