import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useClientPayments } from '../hooks/useClientPayments';
import { server } from './mocks/server';
import { http, HttpResponse } from 'msw';

// Mock do ToastProvider — useClientPayments usa useToast internamente
vi.mock('../components/ui/Toast', () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useClientPayments', () => {
  it('busca pagamentos com sucesso', async () => {
    const { result } = renderHook(() => useClientPayments(), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => {
      expect(result.current.clientPayments.data).toHaveLength(1);
    });

    expect(result.current.clientPayments.data[0].description).toBe('Compra #001');
    expect(result.current.clientPayments.data[0].status).toBe('pending');
  });

  it('estado default tem limit=20', () => {
    const { result } = renderHook(() => useClientPayments(), {
      wrapper: makeWrapper(),
    });

    expect(result.current.clientPayments.meta.limit).toBe(20);
  });

  it('retorna array vazio antes dos dados chegarem', () => {
    const { result } = renderHook(() => useClientPayments(), {
      wrapper: makeWrapper(),
    });

    expect(result.current.clientPayments.data).toEqual([]);
  });

  it('expõe deleteClientPaymentAPI como função', () => {
    const { result } = renderHook(() => useClientPayments(), {
      wrapper: makeWrapper(),
    });

    expect(typeof result.current.deleteClientPaymentAPI).toBe('function');
  });

  it('expõe saveClientPaymentAPI como função', () => {
    const { result } = renderHook(() => useClientPayments(), {
      wrapper: makeWrapper(),
    });

    expect(typeof result.current.saveClientPaymentAPI).toBe('function');
  });

  it('deleteClientPaymentAPI chama endpoint correto', async () => {
    let deletedId: string | undefined;
    server.use(
      http.delete('/api/client-payments/:id', ({ params }) => {
        deletedId = params.id as string;
        return HttpResponse.json({ success: true });
      })
    );

    const { result } = renderHook(() => useClientPayments(), {
      wrapper: makeWrapper(),
    });

    await result.current.deleteClientPaymentAPI(42);

    expect(deletedId).toBe('42');
  });

  it('saveClientPaymentAPI usa POST para novo pagamento', async () => {
    let method: string | undefined;
    server.use(
      http.post('/api/client-payments', ({ request }) => {
        method = request.method;
        return HttpResponse.json({ id: 99 });
      })
    );

    const { result } = renderHook(() => useClientPayments(), {
      wrapper: makeWrapper(),
    });

    await result.current.saveClientPaymentAPI({
      customerId: 1,
      description: 'Novo pagamento',
      totalAmount: 300,
      paidAmount: 0,
      purchaseDate: '2024-01-01',
      dueDate: '2024-02-01',
      paymentMethod: 'Crediário',
      status: 'pending',
      installmentsCount: 1,
      type: 'income',
    });

    expect(method).toBe('POST');
  });
});
