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
      // A4 Layout - New Design with 2 sections
      content = `
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              * { box-sizing: border-box; }
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; color: #1e293b; line-height: 1.4; background: #fff; font-size: 13px; }
              .header { text-align: center; border-bottom: 3px solid #3b82f6; padding-bottom: 15px; margin-bottom: 25px; }
              .header h1 { margin: 0; color: #3b82f6; font-size: 24px; letter-spacing: -0.5px; }
              .header .subtitle { color: #64748b; font-size: 12px; margin-top: 5px; }
              .os-badge { display: inline-block; background: #3b82f6; color: white; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: bold; margin-top: 8px; }
              .date-badge { color: #64748b; font-size: 12px; margin-top: 5px; }

              /* RECIBO Section */
              .recibo-section { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px solid #f59e0b; border-radius: 12px; padding: 20px; margin-bottom: 25px; }
              .recibo-title { font-size: 11px; font-weight: 800; text-transform: uppercase; color: #92400e; letter-spacing: 2px; margin-bottom: 15px; border-bottom: 1px dashed #92400e; padding-bottom: 8px; }
              .recibo-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }

              /* Phone Highlight */
              .phone-box { background: #3b82f6; color: white; padding: 15px; border-radius: 10px; text-align: center; }
              .phone-label { font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; opacity: 0.9; }
              .phone-value { font-size: 20px; font-weight: 800; margin-top: 5px; }
              .phone-hint { font-size: 9px; opacity: 0.8; margin-top: 3px; }

              /* Customer Info */
              .customer-box { background: white; padding: 12px; border-radius: 8px; border: 1px solid #e5e7eb; }
              .customer-name { font-size: 14px; font-weight: 700; color: #1e293b; }

              /* Problem Section - MOST IMPORTANT */
              .problem-section { background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border: 3px solid #dc2626; border-radius: 12px; padding: 20px; margin-bottom: 25px; }
              .problem-header { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
              .problem-icon { font-size: 24px; }
              .problem-title { font-size: 11px; font-weight: 800; text-transform: uppercase; color: #991b1b; letter-spacing: 2px; }
              .problem-content { background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #dc2626; font-size: 15px; font-weight: 600; color: #1e293b; line-height: 1.5; }

              /* Equipment Section */
              .equipment-section { background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border: 2px solid #3b82f6; border-radius: 12px; padding: 20px; margin-bottom: 25px; }
              .equipment-header { display: flex; align-items: center; gap: 10px; margin-bottom: 15px; }
              .equipment-icon { font-size: 24px; }
              .equipment-title { font-size: 11px; font-weight: 800; text-transform: uppercase; color: #1e40af; letter-spacing: 2px; }
              .equipment-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
              .equipment-item { background: white; padding: 12px; border-radius: 8px; text-align: center; border: 1px solid #bfdbfe; }
              .equipment-label { font-size: 9px; font-weight: 600; text-transform: uppercase; color: #64748b; letter-spacing: 1px; }
              .equipment-value { font-size: 13px; font-weight: 700; color: #1e293b; margin-top: 4px; }
              .equipment-value.highlight { color: #3b82f6; font-size: 15px; }

              /* Info Grid */
              .info-section { margin-bottom: 25px; }
              .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
              .info-box { background: #f8fafc; padding: 15px; border-radius: 10px; border: 1px solid #e2e8f0; }
              .info-label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 1px; margin-bottom: 5px; }
              .info-value { font-size: 14px; font-weight: 600; color: #1e293b; }

              /* QR Section */
              .qr-section { display: flex; align-items: center; gap: 20px; padding: 20px; background: #f8fafc; border-radius: 12px; border: 1px dashed #cbd5e1; margin-bottom: 20px; }
              .qr-item { display: flex; flex-direction: column; align-items: center; gap: 5px; }
              .qr-item img { width: 80px; height: 80px; }
              .qr-label { font-size: 9px; font-weight: 700; text-transform: uppercase; color: #64748b; }
              .qr-hint { font-size: 10px; color: #94a3b8; margin-left: auto; }

              /* Signature */
              .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; }
              .sig-line { border-top: 2px solid #1e293b; padding-top: 8px; text-align: center; font-size: 11px; color: #64748b; }

              /* Footer */
              .footer { text-align: center; margin-top: 30px; padding-top: 15px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; }

              /* Complete mode additions */
              .parts-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
              .parts-table th { background: #f1f5f9; padding: 10px; text-align: left; font-size: 11px; text-transform: uppercase; color: #64748b; border-bottom: 2px solid #e2e8f0; }
              .parts-table td { padding: 10px; border-bottom: 1px solid #f1f5f9; font-size: 12px; }
              .total-box { background: #3b82f6; color: white; padding: 15px; border-radius: 10px; text-align: right; margin-top: 15px; }
              .total-label { font-size: 12px; opacity: 0.9; }
              .total-value { font-size: 24px; font-weight: 800; }

              @media print { body { padding: 20px; } }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>ORDEM DE SERVIÇO</h1>
              <p class="subtitle">Assistência Técnica Especializada</p>
              <div class="os-badge">${osNumber}</div>
              <p class="date-badge">📅 ${dateFull}</p>
            </div>

            <!-- RECIBO DO CLIENTE -->
            <div class="recibo-section">
              <div class="recibo-title">📋 RECIBO DO CLIENTE - AGENDAMENTO</div>
              <div class="recibo-grid">
                <div class="phone-box">
                  <div class="phone-label">📞 Ligue Agora</div>
                  <div class="phone-value">${customer.phone || 'Não informado'}</div>
                  <div class="phone-hint">Para acompanhar seu equipamento</div>
                </div>
                <div class="customer-box">
                  <div class="customer-name">👤 ${customer.firstName} ${customer.lastName}</div>
                  ${customer.cpf ? `<div style="font-size: 10px; color: #64748b; margin-top: 3px;">CPF: ${customer.cpf}</div>` : ''}
                </div>
              </div>
            </div>

            <!-- PROBLEMA (MAIS DESTACADO) -->
            ${selectedOrder.reportedProblem ? `
            <div class="problem-section">
              <div class="problem-header">
                <span class="problem-icon">⚠️</span>
                <span class="problem-title">Problema Relatado pelo Cliente</span>
              </div>
              <div class="problem-content">
                ${selectedOrder.reportedProblem}
              </div>
            </div>
            ` : ''}

            <!-- EQUIPAMENTO (DESTACADO) -->
            <div class="equipment-section">
              <div class="equipment-header">
                <span class="equipment-icon">📱</span>
                <span class="equipment-title">Dados do Equipamento</span>
              </div>
              <div class="equipment-grid">
                <div class="equipment-item">
                  <div class="equipment-label">Tipo</div>
                  <div class="equipment-value ${selectedOrder.equipmentType ? 'highlight' : ''}">${selectedOrder.equipmentType || 'Não inf.'}</div>
                </div>
                <div class="equipment-item">
                  <div class="equipment-label">Marca</div>
                  <div class="equipment-value ${selectedOrder.equipmentBrand ? 'highlight' : ''}">${selectedOrder.equipmentBrand || 'Não inf.'}</div>
                </div>
                <div class="equipment-item">
                  <div class="equipment-label">Modelo</div>
                  <div class="equipment-value ${selectedOrder.equipmentModel ? 'highlight' : ''}">${selectedOrder.equipmentModel || 'Não inf.'}</div>
                </div>
              </div>
              ${selectedOrder.equipmentSerial || selectedOrder.equipmentColor ? `
              <div style="margin-top: 12px; display: flex; gap: 15px; font-size: 11px; color: #64748b;">
                ${selectedOrder.equipmentSerial ? `<span><strong>S/N:</strong> ${selectedOrder.equipmentSerial}</span>` : ''}
                ${selectedOrder.equipmentColor ? `<span><strong>Cor:</strong> ${selectedOrder.equipmentColor}</span>` : ''}
              </div>
              ` : ''}
            </div>

            <!-- INFORMAÇÕES EXTRAS -->
            <div class="info-section">
              <div class="info-grid">
                <div class="info-box">
                  <div class="info-label">Status Atual</div>
                  <div class="info-value">${selectedOrder.status}</div>
                </div>
                <div class="info-box">
                  <div class="info-label">Técnico Responsável</div>
                  <div class="info-value">${technician}</div>
                </div>
                ${selectedOrder.customerPassword ? `
                <div class="info-box">
                  <div class="info-label">🔑 Senha do Aparelho</div>
                  <div class="info-value" style="font-family: monospace; font-size: 16px;">${selectedOrder.customerPassword}</div>
                </div>
                ` : ''}
                ${selectedOrder.accessories ? `
                <div class="info-box">
                  <div class="info-label">📦 Acessórios</div>
                  <div class="info-value">${selectedOrder.accessories}</div>
                </div>
                ` : ''}
              </div>
            </div>

            <!-- Complete Mode: Parts and Services -->
            ${printConfig.type === 'complete' ? `
              ${selectedOrder.partsUsed && selectedOrder.partsUsed.length > 0 ? `
              <div style="margin-bottom: 20px;">
                <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 10px;">🔧 Peças Utilizadas</div>
                <table class="parts-table">
                  <thead>
                    <tr>
                      <th>Descrição</th>
                      <th>Qtd</th>
                      <th>Vlr. Unit.</th>
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

              ${selectedOrder.servicesPerformed ? `
              <div style="margin-bottom: 20px;">
                <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 8px;">🛠️ Serviços Realizados</div>
                <div style="background: #f8fafc; padding: 12px; border-radius: 8px; font-size: 13px;">${selectedOrder.servicesPerformed}</div>
              </div>
              ` : ''}

              ${selectedOrder.technicalAnalysis ? `
              <div style="margin-bottom: 20px;">
                <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 8px;">📝 Análise Técnica</div>
                <div style="background: #f8fafc; padding: 12px; border-radius: 8px; font-size: 13px;">${selectedOrder.technicalAnalysis}</div>
              </div>
              ` : ''}

              <div class="total-box">
                <div class="total-label">Valor Total do Serviço</div>
                <div class="total-value">${formatCurrency(selectedOrder.totalAmount || 0)}</div>
              </div>
            ` : ''}

            <!-- QR CODE -->
            <div class="qr-section">
              <div class="qr-item">
                <img src="${customerQrImg}" />
                <div class="qr-label">Cliente</div>
              </div>
              <div class="qr-item">
                <img src="${techQrImg}" />
                <div class="qr-label">Técnico</div>
              </div>
              <div class="qr-hint">
                <strong>Escaneie para acompanhar</strong><br/>
                O QR Code de CLIENTE permite acompanhar o status.<br/>
                O QR Code de TÉCNICO é para uso interno.
              </div>
            </div>

            <!-- ASSINATURAS -->
            <div class="signatures">
              <div class="sig-line">
                <strong>${customer.firstName} ${customer.lastName}</strong><br/>
                Assinatura do Cliente
              </div>
              <div class="sig-line">
                <strong>${technician}</strong><br/>
                Assinatura do Técnico
              </div>
            </div>

            <!-- FOOTER -->
            <div class="footer">
              <p>📍 INOVA PRO - Assistência Técnica Especializada</p>
              <p style="margin-top: 5px;">Obrigado pela preferência! Guarde este comprovante.</p>
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
