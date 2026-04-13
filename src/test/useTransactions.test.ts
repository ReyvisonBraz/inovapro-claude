import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useTransactions } from '../hooks/useTransactions';
import { server } from './mocks/server';
import { http, HttpResponse } from 'msw';

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

const showToast = vi.fn();

describe('useTransactions', () => {
  it('busca transações com sucesso', async () => {
    const { result } = renderHook(() => useTransactions(showToast), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => {
      expect(result.current.transactions.data).toHaveLength(2);
    });

    expect(result.current.transactions.data[0].description).toBe('Salário');
    expect(result.current.transactions.data[1].type).toBe('expense');
  });

  it('retorna estrutura padrão enquanto carrega', () => {
    const { result } = renderHook(() => useTransactions(showToast), {
      wrapper: makeWrapper(),
    });

    expect(result.current.transactions.data).toEqual([]);
    expect(result.current.transactions.meta.total).toBe(0);
  });

  it('retorna isLoading true enquanto busca', () => {
    const { result } = renderHook(() => useTransactions(showToast), {
      wrapper: makeWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });

  it('isLoading vira false após dados chegarem', async () => {
    const { result } = renderHook(() => useTransactions(showToast), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });

  it('expõe saveTransactionAPI e deleteTransactionAPI como funções', () => {
    const { result } = renderHook(() => useTransactions(showToast), {
      wrapper: makeWrapper(),
    });

    expect(typeof result.current.saveTransactionAPI).toBe('function');
    expect(typeof result.current.deleteTransactionAPI).toBe('function');
  });

  it('isError fica true quando API falha', async () => {
    server.use(
      http.get('/api/transactions', () => HttpResponse.json({ error: 'server error' }, { status: 500 }))
    );

    const { result } = renderHook(() => useTransactions(showToast), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
