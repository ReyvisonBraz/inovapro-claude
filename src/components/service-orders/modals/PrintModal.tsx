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
    const dateFull = format(parseISO(selectedOrder.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    const technician = currentUser?.name || 'Não informado';
    const appUrl = window.location.origin;
    const customerQrUrl = `${appUrl}/?osId=${selectedOrder.id}&mode=status`;
    const techQrUrl = `${appUrl}/?osId=${selectedOrder.id}&mode=tech`;

    const customerQrImg = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(customerQrUrl)}`;
    const techQrImg = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(techQrUrl)}`;

    const hasEquipment = selectedOrder.equipmentType || selectedOrder.equipmentBrand || selectedOrder.equipmentModel;
    const equipmentDisplay = hasEquipment
      ? `${selectedOrder.equipmentType || ''} ${selectedOrder.equipmentBrand || ''} ${selectedOrder.equipmentModel || ''}`.trim()
      : 'Não informado';

    let content = '';

    if (printConfig.format === 'thermal') {
      // Thermal (80mm) - Simplified
      content = `
        <html>
          <head>
            <style>
              @page { margin: 0; }
              body { font-family: 'Courier New', Courier, monospace; width: 80mm; padding: 5mm; font-size: 11px; color: #000; margin: 0; }
              .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 8px; margin-bottom: 10px; }
              .section { margin-bottom: 10px; }
              .label { font-weight: bold; }
              .highlight-box { background: #fff3cd; border: 2px solid #ffc107; padding: 8px; margin: 8px 0; border-radius: 4px; }
              .problem-box { background: #f8d7da; border: 2px solid #dc3545; padding: 8px; margin: 8px 0; border-radius: 4px; font-weight: bold; }
              .footer { border-top: 1px dashed #000; padding-top: 5px; margin-top: 10px; text-align: center; font-size: 10px; }
              table { width: 100%; border-collapse: collapse; }
              th { text-align: left; border-bottom: 1px solid #000; }
              .qr-container { text-align: center; margin-top: 10px; }
              .qr-container img { width: 80px; height: 80px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h3 style="margin: 0; font-size: 14px;">📋 RECIBO - ORDEM DE SERVIÇO</h3>
              <p style="margin: 3px 0; font-size: 12px;">${osNumber}</p>
              <p style="margin: 0; font-size: 10px;">${dateFull}</p>
            </div>

            <div class="highlight-box">
              <div style="font-size: 10px; margin-bottom: 3px;">📞 TELEFONE DO CLIENTE</div>
              <div style="font-size: 14px; font-weight: bold;">${customer.phone || 'Não informado'}</div>
              <div style="font-size: 10px; margin-top: 3px;">👤 ${customer.firstName} ${customer.lastName}</div>
            </div>

            ${selectedOrder.reportedProblem ? `
            <div class="problem-box">
              <div style="font-size: 9px; margin-bottom: 3px;">⚠️ PROBLEMA RELATADO</div>
              <div style="font-size: 11px;">${selectedOrder.reportedProblem}</div>
            </div>
            ` : ''}

            <div class="section">
              <div style="font-size: 10px; font-weight: bold; margin-bottom: 3px;">📱 EQUIPAMENTO</div>
              <div style="font-size: 11px;">${equipmentDisplay}</div>
              ${selectedOrder.equipmentSerial ? `<div style="font-size: 9px;">S/N: ${selectedOrder.equipmentSerial}</div>` : ''}
            </div>

            <div class="qr-container">
              <p style="font-size: 9px; margin: 5px 0;">Escaneie para acompanhar:</p>
              <img src="${customerQrImg}" />
            </div>

            <div class="footer">
              Obrigado pela preferência!
            </div>
            <script>window.onload = () => { window.print(); setTimeout(() => window.close(), 500); }</script>
          </body>
        </html>
      `;
    } else {
      // A4 Layout — dividido em CLIENTE (metade superior) + TÉCNICO (metade inferior)
      // Corte ao meio após impressão
      content = `
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              * { box-sizing: border-box; margin: 0; padding: 0; }
              html { height: 100%; }
              body {
                height: 100%;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                color: #1e293b; line-height: 1.25; background: #fff; font-size: 9.5px;
                display: flex; flex-direction: column;
              }
              @page { size: A4 portrait; margin: 7mm 10mm; }

              @media print { html, body { height: 100%; } }

              .half {
                flex: 1;
                display: flex;
                flex-direction: column;
                overflow: hidden;
              }

              .cut-line {
                flex-shrink: 0;
                border: none;
                border-top: 2px dashed #94a3b8;
                margin: 1mm 50mm;
                position: relative;
              }
              .cut-line::after {
                content: "✂  Corte aqui  ✂";
                position: absolute; top: -6px; left: 50%;
                transform: translateX(-50%);
                background: #fff; padding: 0 8px;
                font-size: 7px; color: #94a3b8;
                font-weight: 700; letter-spacing: 1px;
              }

              /* ===== GERAL ===== */
              .os-num { font-size: 20px; font-weight: 900; color: #1e3a5f; letter-spacing: -0.3px; }
              .os-label { font-size: 7px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
              .date-sm { font-size: 8px; color: #64748b; }

              .flex-row { display: flex; gap: 6px; align-items: center; }
              .flex-between { display: flex; justify-content: space-between; align-items: center; }
              .text-mono { font-family: 'Courier New', monospace; font-weight: 700; }

              /* ===== CLIENTE ===== */
              .cli-phone {
                background: #1e3a5f; color: #fff; border-radius: 6px;
                padding: 7px 14px; display: flex; align-items: center;
                justify-content: space-between; margin-bottom: 5px;
              }
              .cli-phone-label { font-size: 7px; text-transform: uppercase; letter-spacing: 0.8px; opacity: 0.8; }
              .cli-phone-val   { font-size: 24px; font-weight: 900; letter-spacing: 0.5px; }
              .cli-name        { font-weight: 700; font-size: 12px; }

              .cli-equip-label { font-size: 7px; font-weight: 700; text-transform: uppercase; color: #64748b; }
              .cli-equip-val   { font-size: 10px; font-weight: 600; }

              .cli-problem {
                background: #fef2f2; border: 1.5px solid #dc2626; border-radius: 6px;
                padding: 6px 12px; margin-bottom: 4px;
              }
              .cli-problem-label { font-size: 7px; font-weight: 800; text-transform: uppercase; color: #991b1b; letter-spacing: 0.8px; }
              .cli-problem-text { font-size: 11px; font-weight: 600; color: #1e293b; }

              .cli-qr img     { width: 42px; height: 42px; }
              .cli-qr-text    { font-size: 7px; color: #475569; }
              .cli-qr-text strong { font-size: 8px; }

              .cli-sig {
                border-top: 1.5px solid #1e293b; padding-top: 3px;
                margin-top: auto; text-align: center; font-size: 8px; color: #64748b;
              }

              .cli-pred { font-size: 8px; background: #fef3c7; padding: 2px 8px; border-radius: 4px; }

              /* ===== TÉCNICO ===== */
              .tch-status { font-size: 8px; font-weight: 700; padding: 1px 8px; border-radius: 20px; background: #e2e8f0; display: inline-block; }
              .tch-tech   { font-size: 8px; color: #64748b; }

              .tch-grid {
                display: grid; grid-template-columns: 1fr 1fr; gap: 4px; margin-bottom: 4px;
              }
              .tch-field {
                background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 3px 8px;
              }
              .tch-field-label { font-size: 6.5px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.6px; }
              .tch-field-value { font-size: 9px; font-weight: 600; color: #1e293b; word-break: break-word; }

              .tch-sec-title {
                font-size: 7px; font-weight: 800; text-transform: uppercase;
                color: #475569; letter-spacing: 0.8px;
                border-bottom: 1px solid #cbd5e1; padding-bottom: 1px; margin-bottom: 3px;
              }

              .tch-problem {
                background: #fef2f2; border-left: 2px solid #dc2626;
                padding: 3px 8px; font-size: 9px; font-weight: 500;
                border-radius: 0 3px 3px 0; margin-bottom: 3px;
              }
              .tch-text {
                font-size: 8.5px; color: #334155; line-height: 1.3;
                padding: 2px 6px; background: #f8fafc; border-radius: 3px; margin-bottom: 3px;
              }

              .tch-table { width: 100%; border-collapse: collapse; font-size: 7.5px; margin: 2px 0; }
              .tch-table th { background: #f1f5f9; padding: 2px 5px; text-align: left; font-size: 6.5px; text-transform: uppercase; color: #64748b; border-bottom: 1px solid #e2e8f0; }
              .tch-table td { padding: 2px 5px; border-bottom: 1px solid #f1f5f9; }

              .tch-total {
                background: #1e3a5f; color: #fff; padding: 4px 12px; border-radius: 5px;
                display: flex; justify-content: space-between; align-items: center; margin: 3px 0;
              }
              .tch-total-label { font-size: 8px; opacity: 0.9; text-transform: uppercase; letter-spacing: 0.8px; }
              .tch-total-value { font-size: 15px; font-weight: 900; }

              .tch-qr img { width: 38px; height: 38px; }
              .tch-qr-label { font-size: 6.5px; font-weight: 700; text-transform: uppercase; color: #64748b; }

              .tch-sig {
                border-top: 1.5px solid #1e293b; padding-top: 2px;
                text-align: center; font-size: 8px; color: #64748b;
              }

              .gap-1 { gap: 4px; }
              .mb-1 { margin-bottom: 4px; }
              .mb-2 { margin-bottom: 3px; }
              .mt-a { margin-top: auto; }
            </style>
          </head>
          <body>

            <!-- ===================== CLIENTE ===================== -->
            <div class="half" style="padding-bottom: 1mm;">

              <div class="flex-between mb-2">
                <div>
                  <div class="os-label">Ordem de Serviço</div>
                  <div class="os-num">${osNumber}</div>
                </div>
                <div style="text-align:right;">
                  <div class="date-sm">${date}</div>
                </div>
              </div>

              <div class="cli-phone">
                <div>
                  <div class="cli-phone-label">Telefone / WhatsApp</div>
                  <div class="cli-phone-val">${customer.phone || 'Não informado'}</div>
                </div>
                <div style="text-align:right;">
                  <div class="cli-name">${customer.firstName} ${customer.lastName}</div>
                  ${customer.cpf ? `<div style="font-size:8px; opacity:0.7;">CPF: ${customer.cpf}</div>` : ''}
                </div>
              </div>

              <div class="mb-2">
                <div class="cli-equip-label">Equipamento</div>
                <div class="cli-equip-val">${equipmentDisplay}</div>
                <div class="flex-row gap-1" style="font-size:8px; color:#475569;">
                  ${selectedOrder.equipmentSerial ? `<span><strong>Série:</strong> ${selectedOrder.equipmentSerial}</span>` : ''}
                  ${selectedOrder.equipmentColor ? `<span><strong>Cor:</strong> ${selectedOrder.equipmentColor}</span>` : ''}
                </div>
              </div>

              ${selectedOrder.reportedProblem ? `
              <div class="cli-problem">
                <div class="cli-problem-label">Problema Relatado</div>
                <div class="cli-problem-text">${selectedOrder.reportedProblem}</div>
              </div>
              ` : ''}

              <div class="flex-row mt-a">
                <div class="flex-row" style="gap:6px;">
                  <div class="cli-qr"><img src="${customerQrImg}" /></div>
                  <div class="cli-qr-text">
                    <strong>Escaneie para acompanhar</strong><br/>
                    Status do seu equipamento em tempo real
                  </div>
                </div>
                ${selectedOrder.analysisPrediction ? `
                <div style="margin-left:auto;">
                  <div class="cli-pred"><strong>Previsão:</strong> ${selectedOrder.analysisPrediction}</div>
                </div>
                ` : ''}
              </div>

              <div class="cli-sig">
                <strong>${customer.firstName} ${customer.lastName}</strong> — Assinatura do Cliente
              </div>
            </div>

            <!-- ===================== LINHA DE CORTE ===================== -->
            <hr class="cut-line" />

            <!-- ===================== TÉCNICO ===================== -->
            <div class="half" style="padding-top: 1mm;">

              <div class="flex-between mb-2">
                <div>
                  <div class="os-num">${osNumber}</div>
                  <div class="date-sm">${dateFull}</div>
                </div>
                <div style="text-align:right;">
                  <div><span class="tch-status">${selectedOrder.status}</span></div>
                  <div class="tch-tech">Técnico: ${technician}</div>
                </div>
              </div>

              <div class="tch-grid">
                <div class="tch-field">
                  <div class="tch-field-label">Tipo</div>
                  <div class="tch-field-value">${selectedOrder.equipmentType || '—'}</div>
                </div>
                <div class="tch-field">
                  <div class="tch-field-label">Marca</div>
                  <div class="tch-field-value">${selectedOrder.equipmentBrand || '—'}</div>
                </div>
                <div class="tch-field">
                  <div class="tch-field-label">Modelo</div>
                  <div class="tch-field-value">${selectedOrder.equipmentModel || '—'}</div>
                </div>
                <div class="tch-field">
                  <div class="tch-field-label">Nº Série</div>
                  <div class="tch-field-value">${selectedOrder.equipmentSerial || '—'}</div>
                </div>
                ${selectedOrder.customerPassword ? `
                <div class="tch-field">
                  <div class="tch-field-label">Senha</div>
                  <div class="tch-field-value text-mono">${selectedOrder.customerPassword}</div>
                </div>
                ` : ''}
                ${selectedOrder.accessories ? `
                <div class="tch-field">
                  <div class="tch-field-label">Acessórios</div>
                  <div class="tch-field-value">${selectedOrder.accessories}</div>
                </div>
                ` : ''}
                ${selectedOrder.equipmentColor ? `
                <div class="tch-field">
                  <div class="tch-field-label">Cor</div>
                  <div class="tch-field-value">${selectedOrder.equipmentColor}</div>
                </div>
                ` : ''}
                ${selectedOrder.priority ? `
                <div class="tch-field">
                  <div class="tch-field-label">Prioridade</div>
                  <div class="tch-field-value">${selectedOrder.priority}</div>
                </div>
                ` : ''}
              </div>

              ${selectedOrder.ramInfo || selectedOrder.ssdInfo ? `
              <div class="flex-row gap-1 mb-2">
                ${selectedOrder.ramInfo ? `<div class="tch-field" style="flex:1;padding:2px 8px;"><span class="tch-field-label">RAM</span><div class="tch-field-value">${selectedOrder.ramInfo}</div></div>` : ''}
                ${selectedOrder.ssdInfo ? `<div class="tch-field" style="flex:1;padding:2px 8px;"><span class="tch-field-label">SSD</span><div class="tch-field-value">${selectedOrder.ssdInfo}</div></div>` : ''}
              </div>
              ` : ''}

              ${selectedOrder.reportedProblem ? `
              <div class="mb-1">
                <div class="tch-sec-title">Problema Relatado</div>
                <div class="tch-problem">${selectedOrder.reportedProblem}</div>
              </div>
              ` : ''}

              ${printConfig.type === 'complete' && selectedOrder.technicalAnalysis ? `
              <div class="mb-1">
                <div class="tch-sec-title">Análise Técnica</div>
                <div class="tch-text">${selectedOrder.technicalAnalysis}</div>
              </div>
              ` : ''}

              ${printConfig.type === 'complete' && selectedOrder.servicesPerformed ? `
              <div class="mb-1">
                <div class="tch-sec-title">Serviços Realizados</div>
                <div class="tch-text">${selectedOrder.servicesPerformed}</div>
              </div>
              ` : ''}

              ${printConfig.type === 'complete' && selectedOrder.partsUsed && selectedOrder.partsUsed.length > 0 ? `
              <div class="mb-1">
                <div class="tch-sec-title">Peças Utilizadas</div>
                <table class="tch-table">
                  <thead><tr>
                    <th>Descrição</th>
                    <th style="text-align:center;">Qtd</th>
                    <th style="text-align:right;">Unit.</th>
                    <th style="text-align:right;">Subtotal</th>
                  </tr></thead>
                  <tbody>
                    ${selectedOrder.partsUsed.map((p: any) => `
                      <tr>
                        <td>${p.name}</td>
                        <td style="text-align:center;">${p.quantity}</td>
                        <td style="text-align:right;">${formatCurrency(p.unitPrice)}</td>
                        <td style="text-align:right;">${formatCurrency(p.subtotal)}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
              ` : ''}

              ${printConfig.type === 'complete' && selectedOrder.totalAmount ? `
              <div class="tch-total">
                <span class="tch-total-label">Valor Total</span>
                <span class="tch-total-value">${formatCurrency(selectedOrder.totalAmount)}</span>
              </div>
              ` : ''}

              ${selectedOrder.finalObservations ? `
              <div class="mb-1">
                <div class="tch-sec-title">Observações</div>
                <div class="tch-text">${selectedOrder.finalObservations}</div>
              </div>
              ` : ''}

              <div class="flex-between mt-a">
                <div class="flex-row" style="gap:6px;">
                  <div class="tch-qr"><img src="${techQrImg}" /></div>
                  <div>
                    <div class="tch-qr-label">QR Técnico</div>
                    <div style="font-size:6.5px; color:#94a3b8;">Uso interno</div>
                  </div>
                </div>
                <div class="tch-sig" style="flex:1; margin-left:12px;">
                  <strong>${technician}</strong> — Assinatura do Técnico
                </div>
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
