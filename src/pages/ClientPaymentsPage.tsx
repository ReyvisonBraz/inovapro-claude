import React, { useState, useEffect } from 'react';
import { ClientPayments } from '../components/ClientPayments';
import { useClientPayments } from '../hooks/useClientPayments';
import { useCustomers } from '../hooks/useCustomers';
import { useToast } from '../components/ui/Toast';
import { useFilterStore } from '../store/useFilterStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { useAuthStore } from '../store/useAuthStore';
import { useModalStore } from '../store/useModalStore';
import { useFormStore } from '../store/useFormStore';
import { useAppStore } from '../store/useAppStore';
import { format, parseISO } from 'date-fns';
import { formatCurrency } from '../lib/utils';
import { ClientPayment } from '../types';

export const ClientPaymentsPage: React.FC = () => {
  const { showToast } = useToast();
  const { 
    clientPayments, 
    paymentsPage,
    setPaymentsPage, 
    fetchClientPayments,
    saveClientPaymentAPI, 
    deleteClientPaymentAPI,
    recordPaymentAPI
  } = useClientPayments(showToast);
  const { customers } = useCustomers();
  const { settings } = useSettingsStore();
  const { currentUser } = useAuthStore();
  const { 
    paymentSearchTerm, 
    paymentFilterStatus, 
    paymentSortMode 
  } = useFilterStore();
  const {
    setClientPaymentToDelete,
    setIsRecordingPayment,
    isRecordingPayment,
    paymentAmount,
    setPaymentAmount,
    paymentDate,
    setPaymentDate,
    openConfirm
  } = useModalStore();
  const { newClientPayment, setNewClientPayment } = useFormStore();
  const { 
    isAddingClientPayment, setIsAddingClientPayment,
    expandedPayments, togglePaymentExpansion
  } = useAppStore();
  const {
    setPaymentSearchTerm,
    setPaymentFilterStatus,
    setPaymentSortMode
  } = useFilterStore();

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchClientPayments(paymentsPage, paymentSearchTerm);
  }, [fetchClientPayments, paymentsPage, paymentSearchTerm]);

  const filteredClientPayments = clientPayments.data.filter(payment => {
    const matchesSearch = payment.customerName.toLowerCase().includes(paymentSearchTerm.toLowerCase()) || 
                          payment.description.toLowerCase().includes(paymentSearchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    const isOverdue = new Date(payment.dueDate) < new Date() && payment.status !== 'paid';

    switch (paymentFilterStatus) {
      case 'paid': return payment.status === 'paid';
      case 'partial': return payment.status === 'partial';
      case 'pending': return payment.status === 'pending' && !isOverdue;
      case 'overdue': return isOverdue;
      default: return true;
    }
  }).sort((a, b) => {
    if (paymentSortMode === 'amount') {
      return b.totalAmount - a.totalAmount;
    } else if (paymentSortMode === 'alphabetical') {
      return a.customerName.localeCompare(b.customerName);
    } else {
      return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
    }
  });

  const handleAddClientPayment = async () => {
    if (isSaving) return;
    if (!newClientPayment.customerId || !newClientPayment.totalAmount) return;
    
    setIsSaving(true);
    try {
      const total = parseFloat(newClientPayment.totalAmount.toString().replace(',', '.'));
      const paid = parseFloat((newClientPayment.paidAmount || '0').toString().replace(',', '.'));
      const installmentsCount = newClientPayment.installmentsCount || 1;
      const interval = newClientPayment.installmentInterval || 'monthly';
      const saleId = `SALE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const promises = [];

      if (paid > 0) {
        promises.push(saveClientPaymentAPI({
          ...newClientPayment,
          description: `ENTRADA: ${newClientPayment.description}`,
          totalAmount: paid,
          paidAmount: paid,
          dueDate: newClientPayment.purchaseDate,
          status: 'paid',
          installmentsCount: 1,
          saleId,
          createdBy: currentUser?.id
        }));
      }

      const remainingAmount = total - paid;
      if (remainingAmount > 0) {
        const installmentAmount = remainingAmount / installmentsCount;

        for (let i = 0; i < installmentsCount; i++) {
          let dueDate = new Date(newClientPayment.dueDate + 'T12:00:00');
          if (interval === 'monthly') {
            dueDate.setMonth(dueDate.getMonth() + i);
          } else if (interval === 'biweekly') {
            dueDate.setDate(dueDate.getDate() + (i * 15));
          } else if (interval === 'weekly') {
            dueDate.setDate(dueDate.getDate() + (i * 7));
          } else if (interval === 'daily') {
            dueDate.setDate(dueDate.getDate() + i);
          }

          const description = installmentsCount > 1 
            ? `${newClientPayment.description} (Parcela ${i + 1}/${installmentsCount})`
            : newClientPayment.description;

          promises.push(saveClientPaymentAPI({
            ...newClientPayment,
            description,
            totalAmount: installmentAmount,
            paidAmount: 0,
            dueDate: format(dueDate, 'yyyy-MM-dd'),
            status: 'pending',
            installmentsCount: 1,
            saleId,
            createdBy: currentUser?.id
          }));
        }
      }

      await Promise.all(promises);

      setIsAddingClientPayment(false);
      setNewClientPayment({
        customerId: 0,
        description: '',
        totalAmount: '',
        paidAmount: '',
        purchaseDate: format(new Date(), 'yyyy-MM-dd'),
        dueDate: format(new Date(), 'yyyy-MM-dd'),
        paymentMethod: 'Dinheiro',
        installmentsCount: 1,
        installmentInterval: 'monthly',
        type: 'income'
      });
      fetchClientPayments(paymentsPage, paymentSearchTerm);
      showToast('Pagamento adicionado com sucesso!', 'success');
    } catch (err) {
      console.error("Failed to add client payment", err);
      showToast('Erro ao adicionar pagamento de cliente.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRecordPayment = async () => {
    if (!isRecordingPayment || !paymentAmount) return;
    
    const amount = parseFloat(paymentAmount.toString().replace(',', '.'));
    const newPaidAmount = isRecordingPayment.paidAmount + amount;
    const newStatus = newPaidAmount >= isRecordingPayment.totalAmount ? 'paid' : 'partial';

    let currentHistory = [];
    try {
      if (isRecordingPayment.paymentHistory) {
        currentHistory = JSON.parse(isRecordingPayment.paymentHistory);
      }
    } catch (e) {}

    const [y, m, d] = paymentDate.split('-');
    const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    const now = new Date();
    dateObj.setHours(now.getHours(), now.getMinutes(), now.getSeconds());

    const newHistory = [...currentHistory, {
      amount: amount,
      date: dateObj.toISOString()
    }];

    try {
      await saveClientPaymentAPI({
        paidAmount: newPaidAmount,
        status: newStatus,
        paymentHistory: JSON.stringify(newHistory),
        updatedBy: currentUser?.id
      }, isRecordingPayment.id);
      setIsRecordingPayment(null);
      setPaymentAmount('');
      fetchClientPayments(paymentsPage, paymentSearchTerm);
      showToast('Pagamento registrado com sucesso!', 'success');
    } catch (err) {
      console.error("Failed to record payment", err);
      showToast('Erro ao registrar pagamento.', 'error');
    }
  };

  const generateReceipt = async (payment: ClientPayment, layoutOverride?: 'simple' | 'a4') => {
    const customer = customers.data.find(c => c.id === payment.customerId);
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const layout = layoutOverride || settings.receiptLayout;

    let historyHtml = '';
    try {
      if (payment.paymentHistory) {
        const history = JSON.parse(payment.paymentHistory);
        if (history.length > 0) {
          historyHtml = layout === 'a4' ? `
            <div class="section" style="margin-top: 30px;">
              <div class="section-title">Histórico de Pagamentos</div>
              <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                <thead>
                  <tr style="border-bottom: 1px solid #eee; text-align: left;">
                    <th style="padding: 8px 0; color: #666;">Data/Hora</th>
                    <th style="padding: 8px 0; color: #666; text-align: right;">Valor Pago</th>
                  </tr>
                </thead>
                <tbody>
                  ${history.map((h: any) => `
                    <tr style="border-bottom: 1px solid #f5f5f5;">
                      <td style="padding: 8px 0;">${format(parseISO(h.date), 'dd/MM/yyyy HH:mm')}</td>
                      <td style="padding: 8px 0; text-align: right; font-weight: bold;">${formatCurrency(h.amount)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : `
            <div class="divider"></div>
            <p class="center bold">HISTÓRICO DE PAGAMENTOS</p>
            ${history.map((h: any) => `
              <div style="display: flex; justify-content: space-between; font-size: 10px;">
                <span>${format(parseISO(h.date), 'dd/MM/yyyy HH:mm')}</span>
                <span>${formatCurrency(h.amount)}</span>
              </div>
            `).join('')}
          `;
        }
      }
    } catch (e) {}

    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`Recibo #${payment.id} - ${customer?.firstName} - ${formatCurrency(payment.totalAmount)}`)}`;

    const content = layout === 'a4' ? `
      <html>
        <head>
          <title>Recibo - ${settings.appName}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;800&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 20mm; color: #1e293b; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid ${settings.primaryColor}; padding-bottom: 20px; margin-bottom: 30px; }
            .company-info { flex: 1; }
            .receipt-info { text-align: right; }
            .title { font-size: 28px; font-weight: 800; color: ${settings.primaryColor}; margin: 0; }
            .section { margin-bottom: 25px; }
            .section-title { font-size: 12px; font-weight: 800; text-transform: uppercase; color: #64748b; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 10px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .amount-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; text-align: center; margin-top: 30px; }
            .amount-label { font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b; }
            .amount-value { font-size: 32px; font-weight: 800; color: ${settings.primaryColor}; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
            .signature { margin-top: 60px; border-top: 1px solid #cbd5e1; width: 250px; margin-left: auto; margin-right: auto; padding-top: 10px; font-weight: 700; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-info">
              <h1 class="title">${settings.appName}</h1>
              <div style="font-weight: 700; margin-top: 5px;">${settings.profileName}</div>
              ${settings.receiptCnpj ? `<div>CNPJ: ${settings.receiptCnpj}</div>` : ''}
              ${settings.receiptAddress ? `<div>${settings.receiptAddress}</div>` : ''}
            </div>
            <div class="receipt-info">
              <div style="font-size: 18px; font-weight: 800;">RECIBO DE PAGAMENTO</div>
              <div style="color: #64748b; font-weight: 700;">#${payment.id.toString().padStart(6, '0')}</div>
              <div style="margin-top: 10px;">${format(new Date(), 'dd/MM/yyyy')}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Dados do Cliente</div>
            <div class="grid">
              <div>
                <div style="font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase;">Nome / Razão Social</div>
                <div style="font-weight: 700; font-size: 16px;">${customer?.firstName} ${customer?.lastName}</div>
              </div>
              <div>
                <div style="font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase;">CPF / CNPJ</div>
                <div style="font-weight: 700; font-size: 16px;">${customer?.cpf || '---'}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Descrição do Pagamento</div>
            <div style="font-size: 16px; line-height: 1.6;">${payment.description}</div>
            <div style="margin-top: 10px; font-size: 14px; color: #64748b;">
              <strong>Método:</strong> ${payment.paymentMethod} | 
              <strong>Vencimento:</strong> ${format(parseISO(payment.dueDate), 'dd/MM/yyyy')}
            </div>
          </div>

          ${historyHtml}

          <div class="amount-box">
            <div class="amount-label">Valor Total Recebido</div>
            <div class="amount-value">${formatCurrency(payment.paidAmount)}</div>
            ${payment.totalAmount > payment.paidAmount ? `
              <div style="margin-top: 10px; font-size: 14px; color: #ef4444; font-weight: 700;">
                Saldo Devedor: ${formatCurrency(payment.totalAmount - payment.paidAmount)}
              </div>
            ` : ''}
          </div>

          <div style="margin-top: 40px; display: flex; justify-content: space-between; align-items: flex-end;">
            <div style="text-align: center;">
              <img src="${qrCodeUrl}" style="width: 100px; height: 100px; margin-bottom: 5px;" />
              <div style="font-size: 10px; color: #94a3b8; font-weight: 700;">AUTENTICIDADE DIGITAL</div>
            </div>
            <div style="text-align: center;">
              <div class="signature">Assinatura do Responsável</div>
              <div style="font-size: 11px; color: #64748b;">${settings.profileName}</div>
            </div>
          </div>

          <div class="footer">
            Este recibo é um comprovante de pagamento. Guarde-o para sua segurança.<br>
            Gerado em ${format(new Date(), 'dd/MM/yyyy HH:mm:ss')} • ${settings.appName}
          </div>

          <script>window.print();</script>
        </body>
      </html>
    ` : `
      <html>
        <head>
          <title>Recibo Térmico</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; width: 80mm; padding: 5mm; margin: 0; color: #000; font-size: 12px; line-height: 1.2; }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .divider { border-top: 1px dashed #000; margin: 5px 0; }
            .title { font-size: 16px; margin: 5px 0; }
            .flex { display: flex; justify-content: space-between; }
            .big-amount { font-size: 18px; margin: 10px 0; }
            @media print { body { width: 80mm; } }
          </style>
        </head>
        <body>
          <div class="center bold title">${settings.appName}</div>
          <div class="center">${settings.profileName}</div>
          ${settings.receiptCnpj ? `<div class="center">CNPJ: ${settings.receiptCnpj}</div>` : ''}
          <div class="divider"></div>
          <div class="center bold">COMPROVANTE DE PAGAMENTO</div>
          <div class="center">Nº ${payment.id.toString().padStart(6, '0')}</div>
          <div class="divider"></div>
          <div class="flex"><span>DATA:</span> <span>${format(new Date(), 'dd/MM/yyyy')}</span></div>
          <div class="flex"><span>HORA:</span> <span>${format(new Date(), 'HH:mm:ss')}</span></div>
          <div class="divider"></div>
          <div class="bold">CLIENTE:</div>
          <div>${customer?.firstName} ${customer?.lastName}</div>
          <div class="divider"></div>
          <div class="bold">DESCRIÇÃO:</div>
          <div>${payment.description}</div>
          <div class="divider"></div>
          
          ${historyHtml}
          
          <div class="divider"></div>
          <div class="flex bold big-amount">
            <span>TOTAL PAGO:</span>
            <span>${formatCurrency(payment.paidAmount)}</span>
          </div>
          ${payment.totalAmount > payment.paidAmount ? `
            <div class="flex">
              <span>SALDO DEVEDOR:</span>
              <span>${formatCurrency(payment.totalAmount - payment.paidAmount)}</span>
            </div>
          ` : ''}
          <div class="divider"></div>
          <div class="center">Obrigado pela preferência!</div>
          <div class="center" style="margin-top: 10px;">
            <img src="${qrCodeUrl}" style="width: 80px; height: 80px;" />
          </div>
          <div class="center" style="font-size: 8px; margin-top: 5px;">${payment.id}-${Date.now()}</div>
          <script>window.print();</script>
        </body>
      </html>
    `;
    
    printWindow.document.write(content);
    printWindow.document.close();
  };

  const sendWhatsAppReminder = (payment: ClientPayment) => {
    const customer = customers.data.find(c => c.id === payment.customerId);
    if (!customer) return;
    
    const isPaid = payment.status === 'paid';
    const balance = payment.totalAmount - payment.paidAmount;
    
    const message = 
      `*${isPaid ? '✅ COMPROVANTE DE PAGAMENTO' : '⏳ LEMBRETE DE COBRANÇA'}*\n\n` +
      `Olá, *${customer.firstName}*! 👋\n\n` +
      `Segue o resumo da sua conta em *${settings.appName}*:\n\n` +
      `📝 *Descrição:* ${payment.description}\n` +
      `📅 *Data da Compra:* ${format(parseISO(payment.purchaseDate), 'dd/MM/yyyy')}\n` +
      `📌 *Status:* ${payment.status === 'paid' ? 'PAGO' : payment.status === 'partial' ? 'PARCIAL' : 'PENDENTE'}\n\n` +
      `----------------------------------\n` +
      `💰 *Valor Total:* ${formatCurrency(payment.totalAmount)}\n` +
      `💵 *Valor Pago:* ${formatCurrency(payment.paidAmount)}\n` +
      `${balance > 0 ? `🛑 *Saldo Devedor:* ${formatCurrency(balance)}\n` : ''}` +
      `----------------------------------\n\n` +
      `${balance > 0 ? `👉 *Vencimento:* ${format(parseISO(payment.dueDate), 'dd/MM/yyyy')}\n\n` : ''}` +
      `*${isPaid ? 'Agradecemos pela preferência! 🙏' : 'Ficamos no aguardo do seu pagamento. Qualquer dúvida, estamos à disposição! 😊'}*`;
      
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${customer.phone.replace(/\D/g, '')}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleDeleteClientPaymentGroup = async (saleId: string) => {
    openConfirm(
      'Excluir Venda Completa',
      'Deseja excluir todos os lançamentos desta venda agrupada? Esta ação não pode ser desfeita.',
      async () => {
        try {
          const res = await fetch(`/api/client-payments/group/${saleId}`, { method: 'DELETE' });
          if (res.ok) {
            fetchClientPayments(paymentsPage, paymentSearchTerm);
            showToast('Venda excluída com sucesso.', 'success');
          }
        } catch (err) {
          console.error("Failed to delete client payment group", err);
          showToast('Erro ao excluir venda.', 'error');
        }
      },
      'danger'
    );
  };

  return (
    <ClientPayments 
      filteredClientPayments={filteredClientPayments}
      generateReceipt={generateReceipt}
      sendWhatsAppReminder={sendWhatsAppReminder}
      handleDeleteClientPayment={(payment) => setClientPaymentToDelete(payment.id)}
      handleDeleteClientPaymentGroup={handleDeleteClientPaymentGroup}
      handleRecordPayment={handleRecordPayment}
      customers={customers.data}
      handleAddClientPayment={handleAddClientPayment}
      isSaving={isSaving}
      pagination={{
        currentPage: clientPayments.meta.page,
        totalPages: clientPayments.meta.totalPages,
        totalItems: clientPayments.meta.total,
        limit: clientPayments.meta.limit
      }}
      onPageChange={setPaymentsPage}
      isAddingClientPayment={isAddingClientPayment}
      setIsAddingClientPayment={setIsAddingClientPayment}
      expandedPayments={expandedPayments}
      togglePaymentExpansion={togglePaymentExpansion}
      paymentSearchTerm={paymentSearchTerm}
      setPaymentSearchTerm={setPaymentSearchTerm}
      paymentFilterStatus={paymentFilterStatus}
      setPaymentFilterStatus={setPaymentFilterStatus}
      paymentSortMode={paymentSortMode}
      setPaymentSortMode={setPaymentSortMode}
      isRecordingPayment={isRecordingPayment}
      setIsRecordingPayment={setIsRecordingPayment}
      paymentAmount={paymentAmount}
      setPaymentAmount={setPaymentAmount}
      paymentDate={paymentDate}
      setPaymentDate={setPaymentDate}
      newClientPayment={newClientPayment}
      setNewClientPayment={setNewClientPayment}
    />
  );
};

export default ClientPaymentsPage;
