import { format, parseISO } from 'date-fns';
import { formatCurrency } from './utils';

export const sendWhatsAppPaymentReminder = (payment: any, customer: any, appName: string) => {
  if (!customer || !customer.phone) return;
  
  const isPaid = payment.status === 'paid';
  const balance = payment.totalAmount - payment.paidAmount;
  
  const message = 
    `*${isPaid ? '✅ COMPROVANTE DE PAGAMENTO' : '⏳ LEMBRETE DE COBRANÇA'}*\n\n` +
    `Olá, *${customer.firstName || customer.name}*! 👋\n\n` +
    `Segue o resumo da sua conta em *${appName}*:\n\n` +
    `📝 *Descrição:* ${payment.description}\n` +
    `📅 *Data da Compra:* ${format(parseISO(payment.purchaseDate || payment.date), 'dd/MM/yyyy')}\n` +
    `📌 *Status:* ${payment.status === 'paid' ? 'PAGO' : payment.status === 'partial' ? 'PARCIAL' : 'PENDENTE'}\n\n` +
    `----------------------------------\n` +
    `💰 *Valor Total:* ${formatCurrency(payment.totalAmount || payment.amount)}\n` +
    `💵 *Valor Pago:* ${formatCurrency(payment.paidAmount || (payment.status === 'paid' ? payment.amount : 0))}\n` +
    `${balance > 0 ? `🛑 *Saldo Devedor:* ${formatCurrency(balance)}\n` : ''}` +
    `----------------------------------\n\n` +
    `${balance > 0 ? `👉 *Vencimento:* ${format(parseISO(payment.dueDate || payment.date), 'dd/MM/yyyy')}\n\n` : ''}` +
    `*${isPaid ? 'Agradecemos pela preferência! 🙏' : 'Ficamos no aguardo do seu pagamento. Qualquer dúvida, estamos à disposição! 😊'}*`;
    
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${customer.phone.replace(/\D/g, '')}?text=${encodedMessage}`;
  window.open(whatsappUrl, '_blank');
};
