import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Printer } from 'lucide-react';
import { cn, formatCurrency } from '../../../lib/utils';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PrintModalProps {
  show: boolean;
  onClose: () => void;
  selectedOrder: any;
  customers: any[];
  currentUser: any;
}

export const PrintModal: React.FC<PrintModalProps> = ({
  show,
  onClose,
  selectedOrder,
  customers,
  currentUser
}) => {
  const [printConfig, setPrintConfig] = React.useState({ type: 'simplified', format: 'a4' });

  const handlePrint = () => {
    if (!selectedOrder) return;
    const customer = customers.find(c => c.id === selectedOrder.customerId);
    if (!customer) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const osNumber = `#OS-${selectedOrder.id.toString().padStart(4, '0')}`;
    const date = selectedOrder.entryDate || format(parseISO(selectedOrder.createdAt), 'dd/MM/yyyy');
    const technician = currentUser?.name || 'Não informado';
    const appUrl = window.location.origin;
    const customerQrUrl = `${appUrl}/?osId=${selectedOrder.id}&mode=status`;
    const techQrUrl = `${appUrl}/?osId=${selectedOrder.id}&mode=tech`;
    
    const customerQrImg = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(customerQrUrl)}`;
    const techQrImg = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(techQrUrl)}`;

    let content = '';

    if (printConfig.format === 'thermal') {
      content = `
        <html>
          <head>
            <style>
              @page { margin: 0; }
              body { font-family: 'Courier New', Courier, monospace; width: 80mm; padding: 5mm; font-size: 12px; color: #000; margin: 0; }
              .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 5px; margin-bottom: 10px; }
              .section { margin-bottom: 10px; }
              .label { font-weight: bold; }
              .footer { border-top: 1px dashed #000; padding-top: 5px; margin-top: 10px; text-align: center; font-size: 10px; }
              .signature { margin-top: 30px; border-top: 1px solid #000; text-align: center; padding-top: 5px; }
              table { width: 100%; border-collapse: collapse; }
              th { text-align: left; border-bottom: 1px solid #000; }
              .qr-container { text-align: center; margin-top: 10px; }
              .qr-container img { width: 100px; height: 100px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h3 style="margin: 0;">ORDEM DE SERVIÇO</h3>
              <p style="margin: 5px 0;">${osNumber}</p>
            </div>
            <div class="section">
              <p style="margin: 2px 0;"><span class="label">Data:</span> ${date}</p>
              <p style="margin: 2px 0;"><span class="label">Cliente:</span> ${customer.firstName} ${customer.lastName}</p>
              <p style="margin: 2px 0;"><span class="label">Equipamento:</span> ${selectedOrder.equipmentBrand} ${selectedOrder.equipmentModel}</p>
              <p style="margin: 2px 0;"><span class="label">S/N:</span> ${selectedOrder.equipmentSerial || 'N/A'}</p>
            </div>
            <div class="section">
              <p style="margin: 2px 0;"><span class="label">Status:</span> ${selectedOrder.status}</p>
              <p style="margin: 2px 0;"><span class="label">Problema:</span> ${selectedOrder.reportedProblem || 'N/A'}</p>
            </div>
            ${printConfig.type === 'complete' ? `
              <div class="section">
                <p style="margin: 2px 0;"><span class="label">Análise:</span> ${selectedOrder.technicalAnalysis || 'N/A'}</p>
                <p style="margin: 2px 0;"><span class="label">Serviços:</span> ${selectedOrder.servicesPerformed || 'N/A'}</p>
              </div>
              ${selectedOrder.partsUsed && selectedOrder.partsUsed.length > 0 ? `
                <div class="section">
                  <p class="label" style="margin-bottom: 5px;">Peças:</p>
                  <table>
                    <thead><tr><th>Item</th><th>Qtd</th><th>Sub</th></tr></thead>
                    <tbody>
                      ${selectedOrder.partsUsed.map((p: any) => `<tr><td>${p.name}</td><td>${p.quantity}</td><td>${formatCurrency(p.subtotal)}</td></tr>`).join('')}
                    </tbody>
                  </table>
                </div>
              ` : ''}
              <div class="section" style="text-align: right; margin-top: 10px;">
                <p style="margin: 0;"><span class="label">Total:</span> ${formatCurrency(selectedOrder.totalAmount || 0)}</p>
              </div>
            ` : ''}
            <div class="section">
              <p style="margin: 5px 0;"><span class="label">Técnico:</span> ${technician}</p>
            </div>
            <div class="qr-container">
              <p style="font-size: 10px; margin-bottom: 5px;">Acompanhe sua OS (CLIENTE):</p>
              <img src="${customerQrImg}" />
            </div>
            <div class="qr-container" style="margin-top: 10px; border-top: 1px dashed #000; padding-top: 10px;">
              <p style="font-size: 10px; margin-bottom: 5px;">Área do Técnico (Anexar Fotos):</p>
              <img src="${techQrImg}" />
            </div>
            <div class="signature">
              Assinatura do Cliente
            </div>
            <div class="footer">
              Obrigado pela preferência!
            </div>
            <script>window.onload = () => { window.print(); setTimeout(() => window.close(), 500); }</script>
          </body>
        </html>
      `;
    } else {
      // A4 Layout
      content = `
        <html>
          <head>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; line-height: 1.5; background: #fff; }
              .header { display: flex; justify-content: space-between; border-bottom: 3px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }
              .logo-area h1 { margin: 0; color: #3b82f6; font-size: 28px; letter-spacing: -1px; }
              .logo-area p { margin: 5px 0 0 0; color: #64748b; font-size: 14px; }
              .os-info { text-align: right; }
              .os-number { font-size: 32px; font-weight: 800; color: #3b82f6; line-height: 1; }
              .os-date { color: #64748b; font-size: 14px; margin-top: 5px; }
              .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
              .box { border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; background: #f8fafc; }
              .box-title { font-weight: 800; text-transform: uppercase; font-size: 11px; color: #3b82f6; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; letter-spacing: 1px; }
              .box p { margin: 6px 0; font-size: 14px; }
              .box p strong { color: #475569; width: 100px; display: inline-block; }
              .full-box { border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; margin-bottom: 30px; }
              table { width: 100%; border-collapse: collapse; margin-top: 15px; }
              th { background: #f1f5f9; padding: 12px; text-align: left; border-bottom: 2px solid #e2e8f0; font-size: 12px; text-transform: uppercase; color: #64748b; }
              td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
              .total-section { text-align: right; margin-top: 30px; padding: 20px; background: #f8fafc; border-radius: 12px; }
              .total-label { font-size: 14px; color: #64748b; }
              .total-value { font-size: 24px; font-weight: 800; color: #3b82f6; display: block; }
              .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; margin-top: 80px; }
              .sig-box { border-top: 2px solid #cbd5e1; text-align: center; padding-top: 15px; font-size: 13px; color: #64748b; }
              .qr-area { display: flex; align-items: center; gap: 20px; margin-top: 40px; padding: 20px; border: 1px dashed #e2e8f0; border-radius: 12px; }
              .qr-text { flex: 1; }
              .qr-text h4 { margin: 0; color: #3b82f6; }
              .qr-text p { margin: 5px 0 0 0; font-size: 12px; color: #64748b; }
              @media print { body { padding: 0; } .no-print { display: none; } }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="logo-area">
                <h1>ORDEM DE SERVIÇO</h1>
                <p>Assistência Técnica Especializada</p>
              </div>
              <div class="os-info">
                <div class="os-number">${osNumber}</div>
                <div class="os-date">Entrada: ${date}</div>
              </div>
            </div>

            <div class="grid">
              <div class="box">
                <div class="box-title">Dados do Cliente</div>
                <p><strong>Nome:</strong> ${customer.firstName} ${customer.lastName}</p>
                <p><strong>Telefone:</strong> ${customer.phone}</p>
                <p><strong>CPF:</strong> ${customer.cpf || 'Não informado'}</p>
              </div>
              <div class="box">
                <div class="box-title">Dados do Equipamento</div>
                <p><strong>Marca:</strong> ${selectedOrder.equipmentBrand}</p>
                <p><strong>Modelo:</strong> ${selectedOrder.equipmentModel}</p>
                <p><strong>Série:</strong> ${selectedOrder.equipmentSerial || 'N/A'}</p>
                <p><strong>Senha:</strong> ${selectedOrder.customerPassword || 'N/A'}</p>
              </div>
            </div>

            <div class="full-box">
              <div class="box-title">Informações do Serviço</div>
              <p><strong>Status Atual:</strong> ${selectedOrder.status}</p>
              <p><strong>Problema Relatado:</strong> ${selectedOrder.reportedProblem || 'Não informado'}</p>
              ${printConfig.type === 'complete' ? `
                <p><strong>Análise Técnica:</strong> ${selectedOrder.technicalAnalysis || 'Pendente'}</p>
                <p><strong>Serviços Realizados:</strong> ${selectedOrder.servicesPerformed || 'Pendente'}</p>
              ` : ''}
            </div>

            ${printConfig.type === 'complete' && selectedOrder.partsUsed && selectedOrder.partsUsed.length > 0 ? `
              <div class="full-box">
                <div class="box-title">Peças e Componentes</div>
                <table>
                  <thead>
                    <tr>
                      <th>Descrição</th>
                      <th>Quantidade</th>
                      <th>Vlr. Unitário</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${selectedOrder.partsUsed.map((p: any) => `
                      <tr>
                        <td>${p.name}</td>
                        <td>${p.quantity}</td>
                        <td>${formatCurrency(p.unitPrice)}</td>
                        <td>${formatCurrency(p.subtotal)}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            ` : ''}

            <div class="total-section">
              <span class="total-label">Valor Total do Serviço</span>
              <span class="total-value">${formatCurrency(selectedOrder.totalAmount || 0)}</span>
              <p style="font-size: 12px; color: #64748b; margin-top: 10px;">Técnico Responsável: ${technician}</p>
            </div>

            <div class="qr-area">
              <div style="display: flex; flex-direction: column; align-items: center; gap: 10px; border-right: 1px dashed #e2e8f0; padding-right: 20px;">
                <img src="${customerQrImg}" width="100" height="100" />
                <div class="qr-text" style="text-align: center;">
                  <h4 style="font-size: 12px;">CLIENTE</h4>
                  <p style="font-size: 10px;">Acompanhe o Status</p>
                </div>
              </div>
              <div style="display: flex; flex-direction: column; align-items: center; gap: 10px; padding-left: 20px;">
                <img src="${techQrImg}" width="100" height="100" />
                <div class="qr-text" style="text-align: center;">
                  <h4 style="font-size: 12px;">TÉCNICO</h4>
                  <p style="font-size: 10px;">Anexar Fotos Rápido</p>
                </div>
              </div>
              <div class="qr-text" style="margin-left: 20px;">
                <h4>Acompanhe seu Serviço</h4>
                <p>Escaneie o código de CLIENTE para ver o status em tempo real. O código de TÉCNICO é para uso interno da equipe.</p>
              </div>
            </div>

            <div class="signatures">
              <div class="sig-box">
                <strong>${customer.firstName} ${customer.lastName}</strong><br/>
                Assinatura do Cliente
              </div>
              <div class="sig-box">
                <strong>${technician}</strong><br/>
                Assinatura do Técnico
              </div>
            </div>

            <script>window.onload = () => { window.print(); setTimeout(() => window.close(), 500); }</script>
          </body>
        </html>
      `;
    }

    printWindow.document.write(content);
    printWindow.document.close();
  };

  return (
    <AnimatePresence>
      {show && selectedOrder && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-bg-dark/90 backdrop-blur-md"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md glass-modal p-8"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Imprimir Ordem</h3>
              <button onClick={onClose} className="text-slate-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Tipo de Ordem</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setPrintConfig({ ...printConfig, type: 'simplified' })}
                    className={cn(
                      "h-12 rounded-xl border font-bold text-xs transition-all",
                      printConfig.type === 'simplified' ? "bg-primary/10 border-primary text-primary" : "bg-white/5 border-white/10 text-slate-400"
                    )}
                  >
                    Simplificada
                  </button>
                  <button 
                    onClick={() => setPrintConfig({ ...printConfig, type: 'complete' })}
                    className={cn(
                      "h-12 rounded-xl border font-bold text-xs transition-all",
                      printConfig.type === 'complete' ? "bg-primary/10 border-primary text-primary" : "bg-white/5 border-white/10 text-slate-400"
                    )}
                  >
                    Completa
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Formato de Impressão</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setPrintConfig({ ...printConfig, format: 'a4' })}
                    className={cn(
                      "h-12 rounded-xl border font-bold text-xs transition-all",
                      printConfig.format === 'a4' ? "bg-primary/10 border-primary text-primary" : "bg-white/5 border-white/10 text-slate-400"
                    )}
                  >
                    Folha A4
                  </button>
                  <button 
                    onClick={() => setPrintConfig({ ...printConfig, format: 'thermal' })}
                    className={cn(
                      "h-12 rounded-xl border font-bold text-xs transition-all",
                      printConfig.format === 'thermal' ? "bg-primary/10 border-primary text-primary" : "bg-white/5 border-white/10 text-slate-400"
                    )}
                  >
                    Térmica (80mm)
                  </button>
                </div>
              </div>

              <button 
                onClick={() => {
                  handlePrint();
                  onClose();
                }}
                className="w-full h-14 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-3 group"
              >
                <Printer size={24} className="group-hover:scale-110 transition-transform" />
                Imprimir Agora
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
