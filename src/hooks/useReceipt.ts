import { useCallback } from 'react';
import { ClientPayment, Customer, AppSettings } from '../types';
import { getA4ReceiptTemplate, getThermalReceiptTemplate } from '../lib/receiptTemplates';
import { formatCurrency } from '../lib/utils';
import { useToast } from '../components/ui/Toast';

export function useReceipt(settings: AppSettings, customers: Customer[]) {
  const { showToast } = useToast();

  const generateReceipt = useCallback(async (payment: ClientPayment, layoutOverride?: 'simple' | 'a4') => {
    const customer = customers.find(c => c.id === payment.customerId);
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const layout = layoutOverride || settings.receiptLayout;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`Recibo #${payment.id} - ${customer?.firstName} - ${formatCurrency(payment.totalAmount)}`)}`;

    const content = layout === 'a4' 
      ? getA4ReceiptTemplate(settings, payment, customer, qrCodeUrl)
      : getThermalReceiptTemplate(settings, payment, customer, qrCodeUrl);

    // Salvar recibo no banco de dados
    try {
      await fetch('/api/receipts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: payment.id,
          content: content
        })
      });
    } catch (err) {
      console.error("Failed to save receipt", err);
      showToast('Erro ao salvar recibo.', 'error');
    }

    printWindow.document.write(content);
    printWindow.document.close();
  }, [settings, customers, showToast]);

  return { generateReceipt };
}
