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
      // A4 Layout - Split into CLIENTE (top) + TÉCNICO (bottom) — cut at the middle
      content = `
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              * { box-sizing: border-box; margin: 0; padding: 0; }
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; line-height: 1.3; background: #fff; font-size: 11px; }

              @page { size: A4 portrait; margin: 12mm 15mm; }

              /* ===== TOP HALF — CLIENTE ===== */
              .half { height: 48%; display: flex; flex-direction: column; }
              .half-cliente { padding-bottom: 6mm; }

              .cut-line { border: none; border-top: 2px dashed #94a3b8; margin: 2mm 0 6mm 0; position: relative; }
              .cut-line::after { content: "✂  Corte aqui  ✂"; position: absolute; top: -7px; left: 50%; transform: translateX(-50%); background: #fff; padding: 0 12px; font-size: 9px; color: #94a3b8; font-weight: 700; letter-spacing: 1px; }

              .os-number { font-size: 26px; font-weight: 900; color: #1e3a5f; letter-spacing: -0.5px; }
              .os-label { font-size: 8px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1.5px; }
              .date-info { font-size: 10px; color: #64748b; }

              /* CLIENTE — Telefone gigante */
              .cliente-phone-box { background: #1e3a5f; color: #fff; border-radius: 8px; padding: 10px 16px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
              .cliente-phone-label { font-size: 8px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.8; }
              .cliente-phone-value { font-size: 28px; font-weight: 900; letter-spacing: 1px; }
              .cliente-name { font-weight: 700; font-size: 14px; }

              /* CLIENTE — Problem highlight */
              .cliente-problem { background: #fef2f2; border: 2px solid #dc2626; border-radius: 8px; padding: 10px 14px; margin-bottom: 6px; }
              .cliente-problem-label { font-size: 8px; font-weight: 800; text-transform: uppercase; color: #991b1b; letter-spacing: 1px; margin-bottom: 4px; }
              .cliente-problem-text { font-size: 13px; font-weight: 600; color: #1e293b; }

              .cliente-equip { font-size: 12px; font-weight: 600; }
              .cliente-equip-label { font-size: 8px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 1px; }

              .cliente-qr { display: flex; align-items: center; gap: 10px; }
              .cliente-qr img { width: 55px; height: 55px; }
              .cliente-qr-text { font-size: 8px; color: #475569; }
              .cliente-qr-text strong { font-size: 9px; }

              .cliente-sig { border-top: 1.5px solid #1e293b; padding-top: 4px; margin-top: auto; text-align: center; font-size: 9px; color: #64748b; }

              /* ===== BOTTOM HALF — TÉCNICO ===== */
              .half-tecnico { padding-top: 2mm; }

              .tech-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px; }
              .tech-os { font-size: 20px; font-weight: 900; color: #1e3a5f; }
              .tech-status { font-size: 9px; font-weight: 700; padding: 2px 10px; border-radius: 20px; background: #e2e8f0; }

              .tech-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 6px; }
              .tech-field { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 10px; }
              .tech-field-label { font-size: 7px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 1px; }
              .tech-field-value { font-size: 11px; font-weight: 600; color: #1e293b; margin-top: 1px; word-break: break-word; }

              .tech-section { margin-bottom: 5px; }
              .tech-section-title { font-size: 8px; font-weight: 800; text-transform: uppercase; color: #475569; letter-spacing: 1.2px; border-bottom: 1.5px solid #cbd5e1; padding-bottom: 2px; margin-bottom: 4px; }

              .tech-problem { background: #fef2f2; border-left: 3px solid #dc2626; padding: 5px 10px; font-size: 11px; font-weight: 500; border-radius: 0 4px 4px 0; margin-bottom: 5px; }

              .tech-text { font-size: 10px; color: #334155; line-height: 1.4; padding: 3px 8px; background: #f8fafc; border-radius: 4px; margin-bottom: 4px; }

              .tech-parts-table { width: 100%; border-collapse: collapse; font-size: 9px; margin: 4px 0; }
              .tech-parts-table th { background: #f1f5f9; padding: 4px 6px; text-align: left; font-size: 7px; text-transform: uppercase; color: #64748b; border-bottom: 1.5px solid #e2e8f0; }
              .tech-parts-table td { padding: 3px 6px; border-bottom: 1px solid #f1f5f9; }

              .tech-total { background: #1e3a5f; color: #fff; padding: 6px 14px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; margin: 4px 0; }
              .tech-total-label { font-size: 9px; opacity: 0.9; text-transform: uppercase; letter-spacing: 1px; }
              .tech-total-value { font-size: 18px; font-weight: 900; }

              .tech-footer-info { display: flex; justify-content: space-between; font-size: 8px; color: #94a3b8; margin-top: auto; }
              .tech-sig { border-top: 1.5px solid #1e293b; padding-top: 3px; text-align: center; font-size: 9px; color: #64748b; }

              .tech-qr img { width: 48px; height: 48px; }
              .tech-qr-label { font-size: 7px; font-weight: 700; text-transform: uppercase; color: #64748b; }

              .flex-row { display: flex; gap: 10px; align-items: center; }
              .flex-between { display: flex; justify-content: space-between; align-items: center; }
              .flex-1 { flex: 1; }
              .mt-auto { margin-top: auto; }

              .text-mono { font-family: 'Courier New', monospace; font-weight: 700; }

              @media print { body { padding: 0; } }
            </style>
          </head>
          <body>

            <!-- ============================================================ -->
            <!-- TOPO — CLIENTE (leva para casa)                              -->
            <!-- ============================================================ -->
            <div class="half half-cliente">

              <div class="flex-between" style="margin-bottom: 6px;">
                <div>
                  <div class="os-label">Ordem de Serviço</div>
                  <div class="os-number">${osNumber}</div>
                </div>
                <div style="text-align: right;">
                  <div class="date-info">${date}</div>
                </div>
              </div>

              <!-- TELEFONE EM DESTAQUE -->
              <div class="cliente-phone-box">
                <div>
                  <div class="cliente-phone-label">Telefone / WhatsApp</div>
                  <div class="cliente-phone-value">${customer.phone || 'Não informado'}</div>
                </div>
                <div style="text-align: right;">
                  <div class="cliente-name">${customer.firstName} ${customer.lastName}</div>
                  ${customer.cpf ? `<div style="font-size: 9px; opacity: 0.7;">CPF: ${customer.cpf}</div>` : ''}
                </div>
              </div>

              <!-- EQUIPAMENTO -->
              <div style="margin-bottom: 6px;">
                <div class="cliente-equip-label">Equipamento</div>
                <div class="cliente-equip">${equipmentDisplay}</div>
                <div class="flex-row" style="gap: 15px; font-size: 10px; color: #475569;">
                  ${selectedOrder.equipmentSerial ? `<span><strong>Série:</strong> ${selectedOrder.equipmentSerial}</span>` : ''}
                  ${selectedOrder.equipmentColor ? `<span><strong>Cor:</strong> ${selectedOrder.equipmentColor}</span>` : ''}
                </div>
              </div>

              <!-- PROBLEMA RELATADO -->
              ${selectedOrder.reportedProblem ? `
              <div class="cliente-problem">
                <div class="cliente-problem-label">Problema Relatado</div>
                <div class="cliente-problem-text">${selectedOrder.reportedProblem}</div>
              </div>
              ` : ''}

              <!-- QR + OBS -->
              <div class="flex-row" style="margin-top: auto;">
                <div class="cliente-qr">
                  <img src="${customerQrImg}" />
                  <div class="cliente-qr-text">
                    <strong>Escaneie para acompanhar</strong><br/>
                    Status do seu equipamento em tempo real
                  </div>
                </div>
                ${selectedOrder.analysisPrediction ? `
                <div style="margin-left: auto; text-align: right; font-size: 10px; background: #fef3c7; padding: 4px 10px; border-radius: 6px;">
                  <strong>Previsão:</strong> ${selectedOrder.analysisPrediction}
                </div>
                ` : ''}
              </div>

              <!-- ASSINATURA CLIENTE -->
              <div class="cliente-sig">
                <strong>${customer.firstName} ${customer.lastName}</strong> — Assinatura do Cliente
              </div>

            </div>

            <!-- ============================================================ -->
            <!-- LINHA DE CORTE                                               -->
            <!-- ============================================================ -->
            <hr class="cut-line" />

            <!-- ============================================================ -->
            <!-- INFERIOR — TÉCNICO (fica na assistência)                     -->
            <!-- ============================================================ -->
            <div class="half half-tecnico">

              <div class="tech-header">
                <div>
                  <div class="tech-os">${osNumber}</div>
                  <div class="date-info">${dateFull}</div>
                </div>
                <div style="text-align: right;">
                  <div class="tech-status" style="background: #e2e8f0; display: inline-block;">${selectedOrder.status}</div>
                  <div style="font-size: 9px; color: #64748b; margin-top: 3px;">Técnico: ${technician}</div>
                </div>
              </div>

              <!-- DADOS COMPLETOS DO EQUIPAMENTO -->
              <div class="tech-grid">
                <div class="tech-field">
                  <div class="tech-field-label">Tipo</div>
                  <div class="tech-field-value">${selectedOrder.equipmentType || '—'}</div>
                </div>
                <div class="tech-field">
                  <div class="tech-field-label">Marca</div>
                  <div class="tech-field-value">${selectedOrder.equipmentBrand || '—'}</div>
                </div>
                <div class="tech-field">
                  <div class="tech-field-label">Modelo</div>
                  <div class="tech-field-value">${selectedOrder.equipmentModel || '—'}</div>
                </div>
                <div class="tech-field">
                  <div class="tech-field-label">Nº Série</div>
                  <div class="tech-field-value">${selectedOrder.equipmentSerial || '—'}</div>
                </div>
                ${selectedOrder.customerPassword ? `
                <div class="tech-field">
                  <div class="tech-field-label">Senha do Aparelho</div>
                  <div class="tech-field-value text-mono">${selectedOrder.customerPassword}</div>
                </div>
                ` : ''}
                ${selectedOrder.accessories ? `
                <div class="tech-field">
                  <div class="tech-field-label">Acessórios</div>
                  <div class="tech-field-value">${selectedOrder.accessories}</div>
                </div>
                ` : ''}
                ${selectedOrder.equipmentColor ? `
                <div class="tech-field">
                  <div class="tech-field-label">Cor</div>
                  <div class="tech-field-value">${selectedOrder.equipmentColor}</div>
                </div>
                ` : ''}
                ${selectedOrder.priority ? `
                <div class="tech-field">
                  <div class="tech-field-label">Prioridade</div>
                  <div class="tech-field-value">${selectedOrder.priority}</div>
                </div>
                ` : ''}
              </div>

              <!-- RAM / SSD -->
              ${selectedOrder.ramInfo || selectedOrder.ssdInfo ? `
              <div class="flex-row" style="gap: 10px; margin-bottom: 5px;">
                ${selectedOrder.ramInfo ? `<div class="tech-field" style="flex:1; padding:4px 10px;"><span class="tech-field-label">RAM</span><div class="tech-field-value" style="font-size:10px;">${selectedOrder.ramInfo}</div></div>` : ''}
                ${selectedOrder.ssdInfo ? `<div class="tech-field" style="flex:1; padding:4px 10px;"><span class="tech-field-label">SSD / Armazenamento</span><div class="tech-field-value" style="font-size:10px;">${selectedOrder.ssdInfo}</div></div>` : ''}
              </div>
              ` : ''}

              <!-- PROBLEMA RELATADO -->
              ${selectedOrder.reportedProblem ? `
              <div class="tech-section">
                <div class="tech-section-title">Problema Relatado</div>
                <div class="tech-problem">${selectedOrder.reportedProblem}</div>
              </div>
              ` : ''}

              <!-- ANÁLISE TÉCNICA -->
              ${printConfig.type === 'complete' && selectedOrder.technicalAnalysis ? `
              <div class="tech-section">
                <div class="tech-section-title">Análise Técnica</div>
                <div class="tech-text">${selectedOrder.technicalAnalysis}</div>
              </div>
              ` : ''}

              <!-- SERVIÇOS REALIZADOS -->
              ${printConfig.type === 'complete' && selectedOrder.servicesPerformed ? `
              <div class="tech-section">
                <div class="tech-section-title">Serviços Realizados</div>
                <div class="tech-text">${selectedOrder.servicesPerformed}</div>
              </div>
              ` : ''}

              <!-- PEÇAS UTILIZADAS (Complete) -->
              ${printConfig.type === 'complete' && selectedOrder.partsUsed && selectedOrder.partsUsed.length > 0 ? `
              <div class="tech-section">
                <div class="tech-section-title">Peças Utilizadas</div>
                <table class="tech-parts-table">
                  <thead>
                    <tr>
                      <th>Descrição</th>
                      <th style="text-align:center;">Qtd</th>
                      <th style="text-align:right;">Unit.</th>
                      <th style="text-align:right;">Subtotal</th>
                    </tr>
                  </thead>
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

              <!-- VALOR TOTAL -->
              ${printConfig.type === 'complete' && selectedOrder.totalAmount ? `
              <div class="tech-total">
                <span class="tech-total-label">Valor Total</span>
                <span class="tech-total-value">${formatCurrency(selectedOrder.totalAmount)}</span>
              </div>
              ` : ''}

              <!-- OBSERVAÇÕES FINAIS -->
              ${selectedOrder.finalObservations ? `
              <div class="tech-section">
                <div class="tech-section-title">Observações</div>
                <div class="tech-text">${selectedOrder.finalObservations}</div>
              </div>
              ` : ''}

              <!-- RODAPÉ TÉCNICO: QR + ASSINATURA -->
              <div class="flex-between" style="margin-top: auto;">
                <div style="display:flex; align-items:center; gap:8px;">
                  <div class="tech-qr">
                    <img src="${techQrImg}" />
                  </div>
                  <div>
                    <div class="tech-qr-label">QR Técnico</div>
                    <div style="font-size:7px; color:#94a3b8;">Uso interno</div>
                  </div>
                </div>
                <div class="tech-sig" style="flex:1; margin-left:20px; border-top-color:#1e293b;">
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
