import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { ClientPaymentsPage } from '../pages/ClientPaymentsPage';
import { useAppStore } from '../store/useAppStore';
import { useFilterStore } from '../store/useFilterStore';
import { useModalStore } from '../store/useModalStore';

/**
 * Teste de caracterização da página de Pagamentos (Fase 6·02 — prop drilling).
 * Fixa o comportamento observável ANTES e DEPOIS de mover props de estado de UI
 * (que hoje o pai repassa) para consumo direto dos stores dentro de ClientPayments.
 * Como os dados fluem pelos mesmos hooks/stores nos dois cenários, estes testes
 * devem permanecer verdes durante todo o refactor — é a rede de segurança.
 */

// useToast lança fora do provider; sobrescreve só ele, mantendo o resto do módulo.
vi.mock('../components/ui/Toast', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../components/ui/Toast')>();
  return { ...actual, useToast: () => ({ showToast: vi.fn() }) };
});

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <ClientPaymentsPage />
    </QueryClientProvider>
  );
}

beforeEach(() => {
  cleanup();
  // Stores Zustand são singletons globais — reseta o estado de UI entre testes.
  useAppStore.setState({ expandedPayments: [] });
  useModalStore.setState({ isAddingClientPayment: false });
  useFilterStore.setState({ paymentSearchTerm: '', paymentFilterStatus: 'all', paymentSortMode: 'date' });
  useModalStore.setState({ isRecordingPayment: null });
});

describe('ClientPaymentsPage — comportamento (caracterização)', () => {
  it('renderiza a lista de pagamentos vinda da API', async () => {
    renderPage();
    // "Compra #001" aparece nas views mobile e desktop (ambas no DOM).
    const rows = await screen.findAllByText('Compra #001');
    expect(rows.length).toBeGreaterThan(0);
  });

  it('botão "Novo Registro" abre o modal de cadastro', async () => {
    renderPage();
    await screen.findAllByText('Compra #001'); // espera carregar

    // Modal fechado no início.
    expect(screen.queryByText('Novo Registro de Venda/Pagamento')).toBeNull();

    await userEvent.click(screen.getByRole('button', { name: /Novo Registro/i }));

    expect(await screen.findByText('Novo Registro de Venda/Pagamento')).toBeInTheDocument();
    expect(useModalStore.getState().isAddingClientPayment).toBe(true);
  });

  it('reflete isAddingClientPayment do store abrindo o modal já aberto', async () => {
    // Estado de UI vindo do store (o que o refactor passa a consumir direto).
    useModalStore.setState({ isAddingClientPayment: true });
    renderPage();
    expect(await screen.findByText('Novo Registro de Venda/Pagamento')).toBeInTheDocument();
  });
});
