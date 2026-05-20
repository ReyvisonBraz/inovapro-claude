import { OSSection, OSLayoutConfig } from '../../../types';
import {
  DEFAULT_A4_COMPLETE_CONFIG,
  DEFAULT_A4_SIMPLIFIED_CONFIG,
  DEFAULT_A5_CONFIG,
  DEFAULT_THERMAL_CONFIG,
  substituteTemplate,
} from '../../../lib/osTemplateConfig';

export interface PrintData {
  osNumber: string;
  date: string;
  dateFull: string;
  technician: string;
  customer: {
    firstName: string;
    lastName: string;
    phone?: string | null;
    cpf?: string | null;
  };
  selectedOrder: any;
  equipmentDisplay: string;
  customerQrImg: string;
  techQrImg: string;
  printType: 'simplified' | 'complete';
  formatCurrency: (amount: number) => string;
  config?: OSLayoutConfig;
}

interface Colors { primary: string; accent: string; font: string; }

function getColors(config?: OSLayoutConfig): Colors {
  return {
    primary: config?.primaryColor || DEFAULT_A4_COMPLETE_CONFIG.primaryColor,
    accent:  config?.accentColor  || DEFAULT_A4_COMPLETE_CONFIG.accentColor,
    font:    config?.fontFamily   || DEFAULT_A4_COMPLETE_CONFIG.fontFamily,
  };
}

function resolveStatusStyle(status: string): string {
  const s = status.toLowerCase();
  if (s.includes('conclu') || s.includes('pronto') || s.includes('entregue'))
    return 'background:#d1fae5;color:#065f46;border:1px solid #6ee7b7;';
  if (s.includes('andamento') || s.includes('analise') || s.includes('análise') || s.includes('manuten') || s.includes('reparo'))
    return 'background:#dbeafe;color:#1e40af;border:1px solid #93c5fd;';
  if (s.includes('cancel'))
    return 'background:#f1f5f9;color:#475569;border:1px solid #cbd5e1;';
  return 'background:#fef3c7;color:#92400e;border:1px solid #fbbf24;';
}

// ─── Build substitution values from PrintData ─────────────────────────────────
function buildSubstValues(data: PrintData): Record<string, string> {
  const so = data.selectedOrder;
  return {
    numero_os:             data.osNumber,
    data:                  data.date,
    data_extenso:          data.dateFull,
    tecnico:               data.technician,
    cliente_nome:          `${data.customer.firstName} ${data.customer.lastName}`.trim(),
    cliente_primeiro_nome: data.customer.firstName,
    cliente_sobrenome:     data.customer.lastName,
    cliente_telefone:      data.customer.phone  || '',
    cliente_cpf:           data.customer.cpf    || '',
    equipamento:           data.equipmentDisplay,
    equipamento_tipo:      so.equipmentType     || '',
    equipamento_marca:     so.equipmentBrand    || '',
    equipamento_modelo:    so.equipmentModel    || '',
    equipamento_serial:    so.equipmentSerial   || '',
    equipamento_cor:       so.equipmentColor    || '',
    senha:                 so.customerPassword  || '',
    acessorios:            so.accessories       || '',
    ram:                   so.ramInfo           || '',
    ssd:                   so.ssdInfo           || '',
    problema:              so.reportedProblem   || '',
    analise:               so.technicalAnalysis  || '',
    servicos:              so.servicesPerformed  || '',
    valor_total:           data.formatCurrency(so.totalAmount  ?? 0),
    taxa_servico:          data.formatCurrency(so.serviceFee   ?? 0),
    observacoes:           so.finalObservations || '',
    status:                so.status            || '',
  };
}

const FONT_SCALE_MAP = { small: 0.82, normal: 1.0, large: 1.22 } as const;
const SPACING_MAP    = { compact: 0.72, normal: 1.0, spacious: 1.32 } as const;

// ─── Render a single section using its template ───────────────────────────────
function renderSection(
  section: OSSection,
  substValues: Record<string, string>,
  so: any,
  printType: string,
  fmt: (n: number) => string,
  fs: number,
): string {
  const { id, label, template } = section;
  const scale = FONT_SCALE_MAP[section.fontScale ?? 'normal'];

  // Parts: engine-generated table — template not applicable
  if (id === 'parts') {
    if (printType !== 'complete' || !so.partsUsed?.length) return '';
    return `<div class="sec">
      <div class="st">${label}</div>
      <div class="ptbl-wrap">
        <table class="ptbl">
          <thead><tr>
            <th style="width:50%">Descricao</th>
            <th style="width:10%">Qtd</th>
            <th style="width:20%">Unit.</th>
            <th style="width:20%">Subtotal</th>
          </tr></thead>
          <tbody>${so.partsUsed.map((p: any) => `
            <tr>
              <td style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:0">${p.name}</td>
              <td>${p.quantity}</td>
              <td>${fmt(p.unitPrice)}</td>
              <td>${fmt(p.subtotal)}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
  }

  // Values: engine-generated total bar — template not applicable
  if (id === 'values') {
    if (printType !== 'complete' || !so.totalAmount) return '';
    return `<div class="total">
      <span class="total-lbl">${label}</span>
      <span class="total-val">${fmt(so.totalAmount)}</span>
    </div>`;
  }

  // All other sections: render via template
  if (!template) return '';
  const content = substituteTemplate(template, substValues).trim();
  if (!content) return '';

  const containerCls = id === 'problem' ? 'pbox' : 'tblock';
  const textCls      = id === 'problem' ? 'ptext' : 'ttext';
  const scaledSize   = id === 'problem'
    ? (fs * 0.92 * scale).toFixed(2)
    : (fs * 0.90 * scale).toFixed(2);
  const scaledMaxH   = id === 'problem'
    ? (fs * 0.92 * scale * 1.55 * 6).toFixed(1)
    : (fs * 0.90 * scale * 1.55 * 5).toFixed(1);

  return `<div class="sec">
    <div class="st">${label}</div>
    <div class="${containerCls}"><div class="${textCls}" style="white-space:pre-line;font-size:${scaledSize}px;max-height:${scaledMaxH}px">${content}</div></div>
  </div>`;
}

// ─── Shared CSS — A4 landscape at fs px base ─────────────────────────────────
const sharedCSS = (fs: number, c: Colors, sp = 1.0) => `
  *, *::before, *::after {
    box-sizing: border-box; margin: 0; padding: 0;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    color-adjust: exact !important;
  }
  @media print {
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
  }
  body {
    font-family: ${c.font};
    background: #fff;
    color: #1e293b;
    font-size: ${fs}px;
    line-height: 1.5;
    overflow: hidden;
  }

  .col {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1.5px solid #e2e8f0;
    border-radius: 6px;
  }

  .hd {
    background: ${c.primary} !important;
    color: #fff !important;
    padding: ${(10 * sp).toFixed(1)}px ${(14 * sp).toFixed(1)}px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-shrink: 0;
    border-radius: 5px 5px 0 0;
  }
  .hd-via  { font-size: ${fs * 0.72}px; text-transform: uppercase; letter-spacing: 1px; opacity: .7; margin-bottom: 2px; font-weight: 700; }
  .hd-num  { font-size: ${fs * 2.6}px; font-weight: 900; letter-spacing: -1px; line-height: 1; }
  .hd-right { text-align: right; }
  .hd-sub  { font-size: ${fs * 0.85}px; opacity: .85; margin-top: 3px; }

  .hd-client-info { margin-top: 5px; border-top: 1px solid rgba(255,255,255,0.25); padding-top: 5px; }
  .hd-client-name  { font-size: ${fs * 1.65}px; font-weight: 900; line-height: 1.2; opacity: .97; }
  .hd-client-phone { font-size: ${fs * 1.05}px; font-weight: 700; opacity: .80; margin-top: 2px; letter-spacing: .3px; }

  .badge {
    display: inline-block;
    font-size: ${fs * 0.77}px;
    font-weight: 800;
    padding: 3px 10px;
    border-radius: 20px;
    text-transform: uppercase;
    letter-spacing: .5px;
    margin-top: 5px;
  }

  .bd {
    flex: 1;
    overflow: hidden;
    padding: ${(10 * sp).toFixed(1)}px ${(14 * sp).toFixed(1)}px;
    display: flex;
    flex-direction: column;
    gap: ${(8 * sp).toFixed(1)}px;
    min-height: 0;
  }

  .ft {
    flex-shrink: 0;
    padding: ${(7 * sp).toFixed(1)}px ${(14 * sp).toFixed(1)}px;
    border-top: 1.5px solid #e2e8f0;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .sec { flex-shrink: 0; }
  .st {
    font-size: ${fs * 0.76}px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: ${c.accent};
    padding-bottom: 3px;
    border-bottom: 1.5px solid ${c.accent}45;
    margin-bottom: 6px;
  }

  .fg2 { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 16px; }
  .fg3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 5px 10px; margin-top: 5px; }
  .fc  { min-width: 0; overflow: hidden; }
  .fl  {
    display: block;
    font-size: ${fs * 0.68}px;
    font-weight: 700;
    text-transform: uppercase;
    color: #64748b;
    letter-spacing: .5px;
    margin-bottom: 2px;
  }
  .fv  {
    display: block;
    font-size: ${fs}px;
    font-weight: 700;
    color: #0f172a;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .mono { font-family: 'Courier New', monospace; letter-spacing: .3px; }

  .pbox {
    background: #fef2f2 !important;
    border-left: 3.5px solid #dc2626 !important;
    padding: ${(7 * sp).toFixed(1)}px ${(11 * sp).toFixed(1)}px;
    border-radius: 0 4px 4px 0;
    overflow: hidden;
  }
  .ptext {
    font-size: ${fs * 0.92}px;
    font-weight: 600;
    color: #1e293b;
    line-height: 1.55;
    overflow: hidden;
    max-height: ${fs * 0.92 * 1.55 * 6}px;
  }

  .tblock {
    background: #f8fafc !important;
    border: 1px solid #e8edf3;
    padding: ${(7 * sp).toFixed(1)}px ${(11 * sp).toFixed(1)}px;
    border-radius: 4px;
    overflow: hidden;
  }
  .ttext {
    font-size: ${fs * 0.9}px;
    color: #334155;
    line-height: 1.55;
    overflow: hidden;
    max-height: ${fs * 0.9 * 1.55 * 5}px;
  }

  .ptbl-wrap { overflow: hidden; max-height: 26mm; }
  .ptbl { width: 100%; border-collapse: collapse; }
  .ptbl th {
    background: #f1f5f9 !important;
    padding: 5px 7px;
    font-size: ${fs * 0.7}px;
    text-transform: uppercase;
    color: #64748b;
    border-bottom: 1.5px solid #e2e8f0;
    text-align: left;
    font-weight: 800;
    letter-spacing: .5px;
  }
  .ptbl td {
    padding: 5px 7px;
    border-bottom: 1px solid #f1f5f9;
    font-size: ${fs * 0.92}px;
    font-weight: 600;
    color: #1e293b;
  }
  .ptbl td:last-child,      .ptbl th:last-child      { text-align: right; }
  .ptbl td:nth-child(2),    .ptbl th:nth-child(2)    { text-align: center; }
  .ptbl td:nth-child(3),    .ptbl th:nth-child(3)    { text-align: right; }

  .total {
    background: ${c.primary} !important;
    color: #fff !important;
    padding: 9px 14px;
    border-radius: 5px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;
  }
  .total-lbl { font-size: ${fs * 0.74}px; text-transform: uppercase; letter-spacing: .6px; opacity: .8; font-weight: 700; }
  .total-val { font-size: ${fs * 1.9}px; font-weight: 900; }

  .wbox {
    background: #fff7ed !important;
    border-left: 3.5px solid #f97316 !important;
    padding: 7px 11px;
    border-radius: 0 4px 4px 0;
    flex-shrink: 0;
  }
  .wtext { font-size: ${fs * 0.76}px; font-weight: 700; color: #7c2d12; line-height: 1.5; }

  .pbar {
    background: ${c.primary} !important;
    color: #fff !important;
    border-radius: 5px;
    padding: 9px 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;
  }
  .pbar-lbl  { font-size: ${fs * 0.64}px; text-transform: uppercase; letter-spacing: .6px; opacity: .72; margin-bottom: 3px; font-weight: 700; }
  .pbar-val  { font-size: ${fs * 2.1}px; font-weight: 900; letter-spacing: .1px; line-height: 1; }
  .pbar-name { font-weight: 800; font-size: ${fs * 1.3}px; margin-top: 4px; }
  .pbar-cpf  { font-size: ${fs * 0.74}px; opacity: .72; margin-top: 2px; }

  .urg {
    background: #fefce8 !important;
    border: 1px solid #fde047;
    border-radius: 4px;
    padding: 7px 11px;
    flex-shrink: 0;
  }
  .urg-text { font-size: ${fs * 0.76}px; font-weight: 700; color: #713f12; line-height: 1.5; }

  .qrw     { display: flex; align-items: center; gap: 9px; flex-shrink: 0; }
  .qrw img { width: 40px; height: 40px; }
  .qr-lbl  { font-size: ${fs * 0.7}px; font-weight: 800; text-transform: uppercase; color: #64748b; letter-spacing: .4px; }
  .qr-sub  { font-size: ${fs * 0.66}px; color: #94a3b8; margin-top: 2px; }
  .sig     {
    flex: 1;
    border-top: 1.5px solid #94a3b8;
    padding-top: 4px;
    text-align: center;
    font-size: ${fs * 0.8}px;
    color: #64748b;
    font-weight: 700;
    margin-left: 8px;
  }
`;

// ─── Tech column ──────────────────────────────────────────────────────────────
function techBody(data: PrintData, config: OSLayoutConfig, substValues: Record<string, string>, fs: number): string {
  const { osNumber, date, technician, customer, selectedOrder: so, techQrImg, printType, formatCurrency } = data;
  const statusStyle = resolveStatusStyle(so.status || '');
  const sections = config.sections
    .filter(s => s.visible)
    .map(s => renderSection(s, substValues, so, printType, formatCurrency, fs))
    .join('');

  const clientName = `${customer.firstName} ${customer.lastName}`.trim();
  const clientPhone = customer.phone || '';

  return `
  <div class="hd">
    <div>
      <div class="hd-via">Ordem de Servico &mdash; Via Tecnico</div>
      <div class="hd-num">${osNumber}</div>
      <div class="hd-client-info">
        <div class="hd-client-name">${clientName}</div>
        ${clientPhone ? `<div class="hd-client-phone">&#128222; ${clientPhone}</div>` : ''}
      </div>
    </div>
    <div class="hd-right">
      <div class="badge" style="${statusStyle}">${so.status || 'Pendente'}</div>
      <div class="hd-sub">Tecnico: ${technician}</div>
      <div class="hd-sub">Data: ${date}</div>
    </div>
  </div>
  <div class="bd">${sections}</div>
  ${config.showQrTech !== false ? `
  <div class="ft">
    <div class="qrw">
      <img src="${techQrImg}" />
      <div>
        <div class="qr-lbl">QR Tecnico</div>
        <div class="qr-sub">Acesso rapido a OS</div>
      </div>
    </div>
    <div class="sig">${technician} &mdash; Assinatura do Tecnico</div>
  </div>` : ''}`;
}

// ─── Client column ────────────────────────────────────────────────────────────
function clientBody(data: PrintData, config: OSLayoutConfig, substValues: Record<string, string>): string {
  const { osNumber, customer, dateFull, selectedOrder: so, customerQrImg } = data;

  const getSection   = (id: OSSection['id']) => config.sections.find(s => s.id === id);
  const isVisible    = (id: OSSection['id']) => getSection(id)?.visible !== false;
  const getContent   = (id: OSSection['id']) => {
    const s = getSection(id);
    return s?.template ? substituteTemplate(s.template, substValues).trim() : '';
  };

  const equipContent = getContent('equipment');
  const probContent  = getContent('problem');
  const obsContent   = getContent('observations');

  return `
  <div class="hd">
    <div>
      <div class="hd-via">Comprovante de Entrada &mdash; Via Cliente</div>
      <div class="hd-num">${osNumber}</div>
    </div>
    <div class="hd-right">
      <div class="hd-sub">${dateFull}</div>
    </div>
  </div>
  <div class="bd">
    ${config.showWarning !== false ? `
    <div class="wbox">
      <div class="wtext">
        <strong>AVISO DE RETIRADA:</strong> Apos a conclusao do servico, o equipamento deve ser retirado
        em ate <strong>30 dias corridos</strong>. Apos este prazo serao cobradas taxas de armazenamento
        diarias. Equipamentos nao retirados apos 90 dias poderao ser descartados conforme legislacao vigente.
      </div>
    </div>` : ''}

    <div class="pbar">
      <div>
        <div class="pbar-lbl">Telefone / WhatsApp</div>
        <div class="pbar-val">${customer.phone || 'Nao informado'}</div>
        <div class="pbar-name">${customer.firstName} ${customer.lastName}</div>
        ${customer.cpf ? `<div class="pbar-cpf">CPF: ${customer.cpf}</div>` : ''}
      </div>
    </div>

    ${equipContent ? `
    <div class="sec">
      <div class="st">Dados do Equipamento</div>
      <div class="tblock"><div class="ttext" style="white-space:pre-line">${equipContent}</div></div>
    </div>` : ''}

    ${isVisible('problem') && probContent ? `
    <div class="sec">
      <div class="st">Problema Relatado</div>
      <div class="pbox"><div class="ptext" style="white-space:pre-line">${probContent}</div></div>
    </div>` : ''}

    ${isVisible('observations') && obsContent ? `
    <div class="sec">
      <div class="st">Observacoes</div>
      <div class="tblock"><div class="ttext" style="white-space:pre-line">${obsContent}</div></div>
    </div>` : ''}

    <div class="urg">
      <div class="urg-text">
        <strong>Analise prioritaria</strong> disponivel mediante taxa adicional. Consulte o atendimento.
        Este comprovante e necessario para a retirada do equipamento.
      </div>
    </div>
  </div>
  ${config.showQrClient !== false ? `
  <div class="ft">
    <div class="qrw">
      <img src="${customerQrImg}" />
      <div>
        <div class="qr-lbl">Acompanhe pelo celular</div>
        <div class="qr-sub">Escaneie para ver o status</div>
      </div>
    </div>
    <div class="sig">${customer.firstName} ${customer.lastName} &mdash; Assinatura do Cliente</div>
  </div>` : ''}`;
}

// ─── A4 Landscape — 2 colunas lado a lado ────────────────────────────────────
export function getA4EnhancedLayout(data: PrintData): string {
  const config = data.config ?? (data.printType === 'simplified' ? DEFAULT_A4_SIMPLIFIED_CONFIG : DEFAULT_A4_COMPLETE_CONFIG);
  const c = getColors(config);
  const substValues = buildSubstValues(data);
  const fs = config.fontSize ?? 12.5;
  const sp = SPACING_MAP[config.spacing ?? 'normal'];

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${data.osNumber}</title>
<style>
@page { size: A4 landscape; margin: 6mm; }
${sharedCSS(fs, c, sp)}
body {
  width: 285mm;
  height: 198mm;
  display: flex;
  flex-direction: row;
  gap: 0;
}
.col { flex: 1; min-width: 0; }
.divider {
  flex-shrink: 0;
  width: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.dline { flex: 1; border-left: 1.5px dashed #cbd5e1; }
.dcut {
  flex-shrink: 0;
  font-size: 8px;
  color: #94a3b8;
  writing-mode: vertical-rl;
  letter-spacing: 2px;
  padding: 6px 0;
  white-space: nowrap;
}
</style>
</head>
<body>

<div class="col">${techBody(data, config, substValues, fs)}</div>

<div class="divider">
  <div class="dline"></div>
  <div class="dcut">&#x2702; CORTE</div>
  <div class="dline"></div>
</div>

<div class="col">${clientBody(data, config, substValues)}</div>

<script>window.onload=function(){window.print();setTimeout(function(){window.close();},500);}</script>
</body>
</html>`;
}

// ─── A5 Portrait — 2 metades empilhadas ──────────────────────────────────────
export function getA5Layout(data: PrintData): string {
  const config = data.config ?? DEFAULT_A5_CONFIG;
  const c = getColors(config);
  const substValues = buildSubstValues(data);
  const fs = config.fontSize ?? 9;
  const sp = SPACING_MAP[config.spacing ?? 'normal'];

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${data.osNumber}</title>
<style>
@page { size: A5 portrait; margin: 4mm; }
${sharedCSS(fs, c, sp)}
body {
  width: 140mm;
  height: 202mm;
  display: flex;
  flex-direction: column;
}
.col { flex: 1; min-height: 0; overflow: hidden; }
.divider {
  flex-shrink: 0;
  height: 14px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.dline { flex: 1; border-top: 1.5px dashed #94a3b8; }
.dcut  { font-size: 7px; color: #94a3b8; white-space: nowrap; letter-spacing: 1px; }
/* A5 compact overrides */
.hd      { padding: 7px 10px; }
.hd-num  { font-size: 18px; }
.bd      { padding: 7px 10px; gap: 6px; }
.ft      { padding: 6px 10px; }
.qrw img { width: 30px; height: 30px; }
.pbar-val { font-size: 16px; }
.fg2     { gap: 4px 12px; }
</style>
</head>
<body>

<div class="col">${clientBody(data, config, substValues)}</div>

<div class="divider">
  <div class="dline"></div>
  <div class="dcut">&#x2702; CORTE AQUI &#x2702;</div>
  <div class="dline"></div>
</div>

<div class="col">${techBody(data, config, substValues, fs)}</div>

<script>window.onload=function(){window.print();setTimeout(function(){window.close();},500);}</script>
</body>
</html>`;
}

// ─── Térmica 80mm ─────────────────────────────────────────────────────────────
export function getThermalLayout(data: PrintData): string {
  const config = data.config ?? DEFAULT_THERMAL_CONFIG;
  const c = getColors(config);
  const substValues = buildSubstValues(data);
  const { osNumber, dateFull, customer, selectedOrder: so, customerQrImg } = data;
  const statusStyle = resolveStatusStyle(so.status || '');

  const getSection  = (id: OSSection['id']) => config.sections.find(s => s.id === id);
  const isVisible   = (id: OSSection['id']) => getSection(id)?.visible !== false;
  const getContent  = (id: OSSection['id']) => {
    const s = getSection(id);
    return s?.template ? substituteTemplate(s.template, substValues).trim() : '';
  };

  const equipContent = getContent('equipment');
  const probContent  = isVisible('problem') ? getContent('problem') : '';

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${osNumber}</title>
<style>
@page { size: 80mm auto; margin: 3mm 4mm; }
*, *::before, *::after {
  box-sizing: border-box; margin: 0; padding: 0;
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
  color-adjust: exact !important;
}
@media print {
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
}
body { font-family: ${c.font}; width: 72mm; color: #1e293b; font-size: 9px; line-height: 1.45; }
.thd { text-align: center; padding-bottom: 7px; margin-bottom: 10px; border-bottom: 2px solid ${c.primary}; }
.thd-brand { font-size: 8px; font-weight: 800; color: ${c.primary} !important; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 2px; }
.thd-title { font-size: 11px; font-weight: 900; color: #1e293b; }
.thd-os    { font-size: 20px; font-weight: 900; color: ${c.primary} !important; line-height: 1; margin: 4px 0; }
.thd-date  { font-size: 8px; color: #64748b; }
.tbadge { display: inline-block; font-size: 8px; font-weight: 800; padding: 3px 10px; border-radius: 12px; text-transform: uppercase; letter-spacing: .4px; margin: 5px 0; }
.tst { font-size: 7px; font-weight: 800; text-transform: uppercase; letter-spacing: .8px; color: ${c.accent} !important; border-bottom: 1px solid ${c.accent}50; padding-bottom: 2px; margin-bottom: 6px; margin-top: 9px; }
.tclient { background: ${c.primary} !important; color: #fff !important; border-radius: 5px; padding: 8px 10px; margin-bottom: 9px; }
.tclient-lbl   { font-size: 7px; text-transform: uppercase; letter-spacing: .6px; opacity: .72; margin-bottom: 2px; font-weight: 700; }
.tclient-phone { font-size: 18px; font-weight: 900; letter-spacing: .2px; line-height: 1; margin-bottom: 3px; }
.tclient-name  { font-size: 10px; font-weight: 800; }
.tclient-cpf   { font-size: 7.5px; opacity: .72; margin-top: 2px; }
.tprob { background: #fef2f2 !important; border-left: 3px solid #dc2626 !important; padding: 5px 8px; border-radius: 0 4px 4px 0; margin-bottom: 8px; }
.tprob-lbl  { font-size: 7px; font-weight: 800; text-transform: uppercase; color: #dc2626 !important; margin-bottom: 3px; }
.tprob-text { font-size: 9px; font-weight: 600; color: #1e293b; line-height: 1.45; white-space: pre-line; }
.tequip      { margin-bottom: 8px; }
.tequip-text { font-size: 10px; font-weight: 800; color: #0f172a; white-space: pre-line; line-height: 1.5; }
.twbox  { background: #fff7ed !important; border-left: 3px solid #f97316 !important; padding: 5px 8px; border-radius: 0 4px 4px 0; margin-bottom: 8px; }
.twtext { font-size: 7.5px; font-weight: 700; color: #7c2d12; line-height: 1.45; }
.tqr     { text-align: center; margin: 12px 0 8px; }
.tqr img { width: 72px; height: 72px; }
.tqr-lbl { font-size: 8px; font-weight: 800; text-transform: uppercase; color: ${c.accent} !important; margin-bottom: 4px; }
.tqr-sub { font-size: 7.5px; color: #64748b; margin-top: 3px; }
.tdiv    { border: none; border-top: 1px dashed #cbd5e1; margin: 9px 0; }
.tfooter { text-align: center; font-size: 7.5px; color: #94a3b8; letter-spacing: .5px; padding-top: 5px; }
</style>
</head>
<body>

  <div class="thd">
    <div class="thd-brand">Assistencia Tecnica</div>
    <div class="thd-title">Comprovante de Entrada</div>
    <div class="thd-os">${osNumber}</div>
    <div class="thd-date">${dateFull}</div>
    <div><span class="tbadge" style="${statusStyle}">${so.status || 'Pendente'}</span></div>
  </div>

  <div class="tclient">
    <div class="tclient-lbl">Telefone / WhatsApp</div>
    <div class="tclient-phone">${customer.phone || 'Nao informado'}</div>
    <div class="tclient-name">${customer.firstName} ${customer.lastName}</div>
    ${customer.cpf ? `<div class="tclient-cpf">CPF: ${customer.cpf}</div>` : ''}
  </div>

  ${equipContent ? `
  <div class="tequip">
    <div class="tst">Equipamento</div>
    <div class="tequip-text">${equipContent}</div>
  </div>` : ''}

  ${probContent ? `
  <div class="tprob">
    <div class="tprob-lbl">Problema Relatado</div>
    <div class="tprob-text">${probContent}</div>
  </div>` : ''}

  ${config.showWarning !== false ? `
  <div class="twbox">
    <div class="twtext"><strong>RETIRADA:</strong> Retire o equipamento em ate 30 dias apos a conclusao. Taxa de armazenamento diaria apos este prazo.</div>
  </div>` : ''}

  <hr class="tdiv" />

  ${config.showQrClient !== false ? `
  <div class="tqr">
    <div class="tqr-lbl">Acompanhe pelo celular</div>
    <img src="${customerQrImg}" />
    <div class="tqr-sub">Escaneie para ver o status da sua OS</div>
  </div>
  <hr class="tdiv" />` : ''}

  <div class="tfooter">
    Obrigado pela preferencia!<br>
    Guarde este comprovante para a retirada.
  </div>

  <script>window.onload=function(){window.print();setTimeout(function(){window.close();},500);}</script>
</body>
</html>`;
}
