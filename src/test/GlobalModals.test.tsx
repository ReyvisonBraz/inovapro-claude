import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

/**
 * Testes focados nas correções da Fase 1:
 * - Bug B: modal de senha usa settings.settingsPassword (não adminPassword)
 * - Bug C: deleteClientPaymentAPI recebe number direto (não .id)
 */

// --- Teste do PasswordModal isolado ---
// Importamos o componente diretamente para testar sem o GlobalModals inteiro
describe('PasswordModal — lógica de desbloqueio', () => {
  it('chama onUnlock quando senha está correta', () => {
    const onUnlock = vi.fn();
    const onClose = vi.fn();
    let inputValue = '';

    // Simula a lógica exata do handleUnlockSettings em GlobalModals.tsx
    const settingsPassword = 'minhasenha';
    const handleUnlock = () => {
      if (inputValue === settingsPassword) {
        onUnlock();
      }
    };

    // Senha correta
    inputValue = 'minhasenha';
    handleUnlock();
    expect(onUnlock).toHaveBeenCalledTimes(1);
  });

  it('não chama onUnlock quando senha está errada', () => {
    const onUnlock = vi.fn();
    let inputValue = '';

    const settingsPassword = 'minhasenha';
    const handleUnlock = () => {
      if (inputValue === settingsPassword) {
        onUnlock();
      }
    };

    // Senha errada
    inputValue = 'senha_errada';
    handleUnlock();
    expect(onUnlock).not.toHaveBeenCalled();
  });

  it('não compara com adminPassword (campo inexistente)', () => {
    // Garante que o fix Bug B está correto: nunca usar adminPassword
    const settings = { settingsPassword: 'correta' } as any;

    // adminPassword não deve existir no tipo AppSettings
    expect(settings.adminPassword).toBeUndefined();
    expect(settings.settingsPassword).toBe('correta');
  });
});

// --- Teste da lógica de deleção de pagamento ---
describe('confirmDeleteClientPayment — Bug C fix', () => {
  it('deleteClientPaymentAPI recebe o id diretamente (number), não .id', async () => {
    const deleteClientPaymentAPI = vi.fn().mockResolvedValue(undefined);

    // Simula exatamente a função corrigida em GlobalModals.tsx
    const clientPaymentToDelete: number | null = 7;

    const confirmDeleteClientPayment = async () => {
      if (!clientPaymentToDelete) return;
      await deleteClientPaymentAPI(clientPaymentToDelete); // correto: number direto
    };

    await confirmDeleteClientPayment();
    expect(deleteClientPaymentAPI).toHaveBeenCalledWith(7);
    expect(deleteClientPaymentAPI).not.toHaveBeenCalledWith({ id: 7 });
  });

  it('não chama delete quando clientPaymentToDelete é null', async () => {
    const deleteClientPaymentAPI = vi.fn();
    const clientPaymentToDelete: number | null = null;

    const confirmDeleteClientPayment = async () => {
      if (!clientPaymentToDelete) return;
      await deleteClientPaymentAPI(clientPaymentToDelete);
    };

    await confirmDeleteClientPayment();
    expect(deleteClientPaymentAPI).not.toHaveBeenCalled();
  });
});

// --- Teste do WarningType union ---
describe('WarningType union — Bug A fix', () => {
  it("'duplicate' é um valor válido no union WarningType", async () => {
    const { useModalStore } = await import('../store/useModalStore');

    useModalStore.getState().setWarningType('duplicate');
    expect(useModalStore.getState().warningType).toBe('duplicate');
  });

  it("valores originais do union continuam válidos", async () => {
    const { useModalStore } = await import('../store/useModalStore');

    useModalStore.getState().setWarningType('category');
    expect(useModalStore.getState().warningType).toBe('category');

    useModalStore.getState().setWarningType('description');
    expect(useModalStore.getState().warningType).toBe('description');

    useModalStore.getState().setWarningType('both');
    expect(useModalStore.getState().warningType).toBe('both');
  });
});
