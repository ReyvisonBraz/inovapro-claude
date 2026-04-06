import { format, parseISO } from 'date-fns';
import { AppSettings, ClientPayment, Customer } from '../types';
import { formatCurrency } from './utils';

export const getA4ReceiptTemplate = (
  settings: AppSettings,
  payment: ClientPayment,
  customer: Customer | undefined,
  qrCodeUrl: string
) => {
  let historyHtml = '';
  try {
    if (payment.paymentHistory) {
      const history = JSON.parse(payment.paymentHistory);
      if (history.length > 0) {
        historyHtml = `
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
        `;
      }
    }
  } catch (e) {}

  return `
    <html>
      <head>
        <title>Recibo - ${settings.appName}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
          @page { size: A4; margin: 0; }
          body { 
            font-family: 'Inter', sans-serif; 
            background-color: #f8fafc; 
            margin: 0; 
            padding: 40px;
            color: #1e293b;
          }
          .page {
            background: white;
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            padding: 60px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.05);
            box-sizing: border-box;
            position: relative;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #f1f5f9;
            padding-bottom: 30px;
            margin-bottom: 40px;
          }
          .company-info { display: flex; align-items: center; gap: 20px; }
          .logo { height: 60px; width: auto; object-fit: contain; }
          .company-info h1 { margin: 0; font-size: 24px; font-weight: 800; color: ${settings.primaryColor}; }
          .company-info p { margin: 2px 0 0 0; font-size: 14px; color: #64748b; font-weight: 500; }
          
          .receipt-badge {
            background: ${settings.primaryColor}10;
            color: ${settings.primaryColor};
            padding: 6px 16px;
            border-radius: 99px;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            display: inline-block;
          }
          .receipt-no { font-size: 14px; font-weight: 700; color: #1e293b; margin-top: 10px; }
          
          .main-title { font-size: 32px; font-weight: 800; margin-bottom: 40px; letter-spacing: -1px; }
          
          .section { margin-bottom: 35px; }
          .section-title { 
            font-size: 11px; 
            font-weight: 800; 
            text-transform: uppercase; 
            letter-spacing: 1.5px; 
            color: #94a3b8; 
            margin-bottom: 15px;
            border-bottom: 1px solid #f1f5f9;
            padding-bottom: 8px;
          }
          
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 25px; }
          .info-item { display: flex; flex-direction: column; gap: 4px; }
          .label { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; }
          .value { font-size: 14px; font-weight: 600; color: #1e293b; }
          
          .table-container { margin-top: 10px; border: 1px solid #f1f5f9; border-radius: 12px; overflow: hidden; }
          table { width: 100%; border-collapse: collapse; }
          th { background: #f8fafc; text-align: left; padding: 12px 20px; font-size: 10px; font-weight: 800; text-transform: uppercase; color: #64748b; }
          td { padding: 12px 20px; font-size: 13px; border-top: 1px solid #f1f5f9; }
          
          .summary-card {
            margin-top: 50px;
            background: #f8fafc;
            border-radius: 20px;
            padding: 30px;
            position: relative;
          }
          .summary-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
          .summary-label { font-size: 13px; font-weight: 600; color: #64748b; }
          .summary-value { font-size: 16px; font-weight: 700; color: #1e293b; }
          .grand-total { 
            margin-top: 15px; 
            padding-top: 20px;
            border-top: 2px dashed #cbd5e1;
            font-size: 24px; 
            color: ${settings.primaryColor};
          }
          
          .qr-code-container {
            position: absolute;
            right: 30px;
            top: 30px;
            text-align: center;
          }
          .qr-code { width: 80px; height: 80px; border: 4px solid white; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
          .qr-label { font-size: 8px; font-weight: bold; color: #94a3b8; margin-top: 5px; text-transform: uppercase; }

          .footer { 
            margin-top: 80px; 
            text-align: center; 
            font-size: 11px; 
            color: #94a3b8; 
            border-top: 1px solid #e2e8f0;
            padding-top: 30px;
          }
          .signature {
            margin-top: 100px;
            display: flex;
            justify-content: space-around;
          }
          .sig-line {
            width: 200px;
            border-top: 1px solid #1e293b;
            text-align: center;
            padding-top: 10px;
            font-size: 12px;
            font-weight: bold;
          }
          @media print {
            body { background: white; padding: 0; }
            .page { margin: 0; box-shadow: none; width: 100%; height: auto; min-height: 0; }
          }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="header">
            <div class="company-info">
              ${settings.receiptLogo ? `<img src="${settings.receiptLogo}" class="logo" />` : ''}
              <div>
                <h1>${settings.appName}</h1>
                <p>${settings.profileName}</p>
                ${settings.receiptCnpj ? `<p style="font-size: 12px; margin-top: 2px;">CNPJ: ${settings.receiptCnpj}</p>` : ''}
                ${settings.receiptAddress ? `<p style="font-size: 12px; margin-top: 2px;">${settings.receiptAddress}</p>` : ''}
              </div>
            </div>
            <div style="text-align: right;">
              <div class="receipt-badge">Recibo de Pagamento</div>
              <div class="receipt-no">Nº #${payment.id.toString().padStart(6, '0')}</div>
              <div class="receipt-no" style="margin-top: 5px;">Data: ${format(new Date(), 'dd/MM/yyyy')}</div>
            </div>
          </div>
          
          <h2 class="main-title">Comprovante de Transação</h2>
          
          <div class="section">
            <div class="section-title">Informações do Cliente</div>
            <div class="grid">
              <div class="info-item">
                <span class="label">Cliente</span>
                <span class="value">${customer?.firstName} ${customer?.lastName}</span>
              </div>
              <div class="info-item">
                <span class="label">CPF / CNPJ</span>
                <span class="value">${customer?.cpf || '---'}</span>
              </div>
              <div class="info-item">
                <span class="label">Empresa</span>
                <span class="value">${customer?.companyName || '---'}</span>
              </div>
              <div class="info-item">
                <span class="label">Contato</span>
                <span class="value">${customer?.phone}</span>
              </div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Detalhes do Lançamento</div>
            <div class="grid">
              <div class="info-item">
                <span class="label">Descrição</span>
                <span class="value">${payment.description}</span>
              </div>
              <div class="info-item">
                <span class="label">Data da Compra</span>
                <span class="value">${format(parseISO(payment.purchaseDate), 'dd/MM/yyyy')}</span>
              </div>
              <div class="info-item">
                <span class="label">Vencimento Original</span>
                <span class="value">${format(parseISO(payment.dueDate), 'dd/MM/yyyy')}</span>
              </div>
              <div class="info-item">
                <span class="label">Meio de Pagamento</span>
                <span class="value">${payment.paymentMethod}</span>
              </div>
            </div>
          </div>
          
          ${historyHtml ? `
            <div class="section">
              <div class="section-title">Histórico de Amortização</div>
              <div class="table-container">
                ${historyHtml}
              </div>
            </div>
          ` : ''}
          
          <div class="summary-card">
            <div class="qr-code-container">
              <img src="${settings.receiptQrCode || qrCodeUrl}" class="qr-code" />
              <div class="qr-label">Validar Recibo</div>
            </div>
            <div class="summary-row" style="width: 70%;">
              <span class="summary-label">Valor Total do Débito</span>
              <span class="summary-value">${formatCurrency(payment.totalAmount)}</span>
            </div>
            <div class="summary-row" style="width: 70%;">
              <span class="summary-label">Total Amortizado</span>
              <span class="summary-value" style="color: #10b981;">- ${formatCurrency(payment.paidAmount)}</span>
            </div>
            <div class="summary-row grand-total" style="width: 70%;">
              <span class="summary-label" style="color: #1e293b;">Saldo Devedor Atual</span>
              <span class="summary-value">${formatCurrency(payment.totalAmount - payment.paidAmount)}</span>
            </div>
            ${settings.receiptPixKey ? `
              <div style="margin-top: 20px; padding-top: 15px; border-top: 1px dashed #cbd5e1; width: 70%;">
                <span class="summary-label" style="font-size: 10px; display: block;">CHAVE PIX PARA PAGAMENTO</span>
                <span style="font-weight: bold; color: #1e293b; font-size: 14px;">${settings.receiptPixKey}</span>
              </div>
            ` : ''}
          </div>
          
          <div class="signature">
            <div class="sig-line">Assinatura do Responsável</div>
            <div class="sig-line">Assinatura do Cliente</div>
          </div>
          
          <div class="footer">
            <p>Este documento é um comprovante oficial de transação financeira.</p>
            <p>Gerado eletronicamente por <strong>${settings.appName}</strong> em ${format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
          </div>
        </div>
        <script>window.print();</script>
      </body>
    </html>
  `;
};

export const getThermalReceiptTemplate = (
  settings: AppSettings,
  payment: ClientPayment,
  customer: Customer | undefined,
  qrCodeUrl: string
) => {
  let historyHtml = '';
  try {
    if (payment.paymentHistory) {
      const history = JSON.parse(payment.paymentHistory);
      if (history.length > 0) {
        historyHtml = `
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

  return `
    <html>
      <head>
        <title>Recibo Térmico</title>
        <style>
          body { 
            font-family: 'Courier New', Courier, monospace; 
            width: 80mm; 
            margin: 0; 
            padding: 5mm; 
            font-size: 12px;
            color: #000;
          }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .divider { border-top: 1px dashed #000; margin: 5mm 0; }
          .logo { width: 40mm; height: auto; margin-bottom: 3mm; }
          .row { display: flex; justify-content: space-between; margin-bottom: 1mm; }
          .qr-code { width: 30mm; height: 30mm; margin: 5mm auto; display: block; }
          @media print {
            body { width: 80mm; }
          }
        </style>
      </head>
      <body>
        <div class="center">
          ${settings.receiptLogo ? `<img src="${settings.receiptLogo}" class="logo" />` : ''}
          <div class="bold" style="font-size: 16px;">${settings.appName}</div>
          <div>${settings.profileName}</div>
          ${settings.receiptCnpj ? `<div>CNPJ: ${settings.receiptCnpj}</div>` : ''}
          ${settings.receiptAddress ? `<div>${settings.receiptAddress}</div>` : ''}
          <div class="divider"></div>
          <div class="bold">RECIBO DE PAGAMENTO</div>
          <div>Nº #${payment.id.toString().padStart(6, '0')}</div>
          <div>Data: ${format(new Date(), 'dd/MM/yyyy HH:mm')}</div>
        </div>
        
        <div class="divider"></div>
        
        <div class="bold">CLIENTE:</div>
        <div>${customer?.firstName} ${customer?.lastName}</div>
        ${customer?.cpf ? `<div>CPF: ${customer?.cpf}</div>` : ''}
        
        <div class="divider"></div>
        
        <div class="bold">DESCRIÇÃO:</div>
        <div>${payment.description}</div>
        <div class="row" style="margin-top: 2mm;">
          <span>Data Compra:</span>
          <span>${format(parseISO(payment.purchaseDate), 'dd/MM/yyyy')}</span>
        </div>
        <div class="row">
          <span>Vencimento:</span>
          <span>${format(parseISO(payment.dueDate), 'dd/MM/yyyy')}</span>
        </div>
        
        <div class="divider"></div>

        ${historyHtml}
        
        <div class="row bold">
          <span>VALOR TOTAL:</span>
          <span>${formatCurrency(payment.totalAmount)}</span>
        </div>
        <div class="row">
          <span>VALOR PAGO:</span>
          <span>${formatCurrency(payment.paidAmount)}</span>
        </div>
        <div class="row bold" style="font-size: 14px; margin-top: 2mm;">
          <span>SALDO DEVEDOR:</span>
          <span>${formatCurrency(payment.totalAmount - payment.paidAmount)}</span>
        </div>
        
        <div class="divider"></div>
        
        <div class="center">
          ${settings.receiptPixKey ? `
            <div class="bold" style="margin-bottom: 2mm;">CHAVE PIX:</div>
            <div style="margin-bottom: 3mm; word-break: break-all;">${settings.receiptPixKey}</div>
          ` : ''}
          <img src="${settings.receiptQrCode || qrCodeUrl}" class="qr-code" />
          <div style="font-size: 10px;">Obrigado pela preferência!</div>
          <div style="font-size: 8px; margin-top: 2mm;">Gerado por ${settings.appName}</div>
        </div>
        
        <script>window.print();</script>
      </body>
    </html>
  `;
};
