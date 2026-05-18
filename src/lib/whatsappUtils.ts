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

export const sendWhatsAppStatusUpdate = (
  order: any,
  customer: any,
  appName: string,
  appUrl: string,
) => {
  if (!customer?.phone) return false;

  const osNumber = `#OS-${order.id.toString().padStart(4, '0')}`;
  const equipment = `${order.equipmentType || ''} ${order.equipmentBrand || ''} ${order.equipmentModel || ''}`.trim() || 'Equipamento';
  const trackingUrl = `${appUrl}/rastreio?osId=${order.id}`;

  const isComplete = order.status === 'Concluído' || order.status === 'Pronto';
  const isPendingAuth = order.status === 'Aguardando Autorização' || order.status === 'Aguardando Aprovação';

  let message = '';

  if (isComplete) {
    message =
      `✅ *SEU EQUIPAMENTO ESTÁ PRONTO!*\n\n` +
      `Olá, *${customer.firstName}*! 🎉\n\n` +
      `Seu equipamento já foi concluído:\n\n` +
      `📋 *OS:* ${osNumber}\n` +
      `📱 *Equipamento:* ${equipment}\n\n` +
      `📍 *Já pode retirar na assistência!*\n\n` +
      `📲 *Acompanhe pelo link:* ${trackingUrl}\n\n` +
      `_Agradecemos pela preferência!_ 🙏`;
  } else if (isPendingAuth) {
    const amount = order.totalAmount ? `\n💰 *Valor estimado:* ${formatCurrency(order.totalAmount)}` : '';
    message =
      `⚠️ *AUTORIZAÇÃO NECESSÁRIA*\n\n` +
      `Olá, *${customer.firstName}*!\n\n` +
      `Encontramos algumas observações no seu equipamento *${equipment}* (${osNumber}) que precisam da sua autorização para prosseguirmos.${amount}\n\n` +
      `📲 *Veja os detalhes:* ${trackingUrl}\n\n` +
      `🛠️ *Para autorizar, responda esta mensagem ou nos ligue.*\n\n` +
      `Aguardamos seu retorno!`;
  } else {
    return false;
  }

  const phone = customer.phone.replace(/\D/g, '');
  const finalPhone = phone.length === 10 || phone.length === 11 ? '55' + phone : phone;
  window.open(`https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`, '_blank');
  return true;
};
