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

// ─── Shared base CSS for A4 / A5 ─────────────────────────────────────────────
const sharedCSS = (fs: number) => `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; color: #1e293b; font-size: ${fs}px; line-height: 1.35; overflow: hidden; }

  /* Column structure */
  .col { display: flex; flex-direction: column; overflow: hidden; border: 1px solid #e2e8f0; border-radius: 4px; }
  .hd { background: #0f2d52; color: #fff; padding: 5px 9px; display: flex; justify-content: space-between; align-items: flex-start; flex-shrink: 0; border-radius: 3px 3px 0 0; }
  .hd-tag { font-size: ${fs * 0.72}px; text-transform: uppercase; letter-spacing: .9px; opacity: .6; margin-bottom: 2px; }
  .hd-num { font-size: ${fs * 2}px; font-weight: 900; letter-spacing: -.5px; }
  .hd-right { text-align: right; }
  .hd-sub { font-size: ${fs * 0.78}px; opacity: .75; margin-top: 1px; }
  .badge { display: inline-block; font-size: ${fs * 0.72}px; font-weight: 800; padding: 2px 7px; border-radius: 10px; text-transform: uppercase; letter-spacing: .4px; margin-bottom: 3px; }

  /* Body scrolls internally if needed, but is clipped by overflow:hidden */
  .bd { flex: 1; overflow: hidden; padding: 5px 9px; display: flex; flex-direction: column; gap: 4px; min-height: 0; }
  .ft { flex-shrink: 0; padding: 4px 9px; border-top: 1px solid #e2e8f0; display: flex; align-items: center; gap: 8px; }

  /* Sections */
  .sec { flex-shrink: 0; }
  .st { font-size: ${fs * 0.7}px; font-weight: 800; text-transform: uppercase; letter-spacing: .8px; color: #1d4ed8; padding-bottom: 2px; border-bottom: 1px solid #bfdbfe; margin-bottom: 3px; }

  /* Field grids */
  .fg2 { display: grid; grid-template-columns: 1fr 1fr; gap: 2px 8px; }
  .fg3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 2px 6px; margin-top: 2px; }
  .fc { min-width: 0; overflow: hidden; }
  .fl { display: block; font-size: ${fs * 0.63}px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: .3px; margin-bottom: .5px; }
  .fv { display: block; font-size: ${fs}px; font-weight: 700; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .mono { font-family: 'Courier New', monospace; }

  /* Problem box */
  .pbox { background: #fef2f2; border-left: 3px solid #dc2626; padding: 3px 7px; border-radius: 0 3px 3px 0; }
  .ptext { font-size: ${fs * 0.88}px; font-weight: 600; color: #1e293b; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; }

  /* Generic text block */
  .tblock { background: #f8fafc; padding: 3px 7px; border-radius: 3px; }
  .ttext { font-size: ${fs * 0.84}px; color: #334155; line-height: 1.35; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; }

  /* Parts table */
  .ptbl-wrap { overflow: hidden; max-height: 22mm; }
  .ptbl { width: 100%; border-collapse: collapse; }
  .ptbl th { background: #f1f5f9; padding: 2px 4px; font-size: ${fs * 0.65}px; text-transform: uppercase; color: #64748b; border-bottom: 1px solid #e2e8f0; text-align: left; }
  .ptbl td { padding: 2px 4px; border-bottom: 1px solid #f1f5f9; font-size: ${fs * 0.84}px; }
  .ptbl td:last-child, .ptbl th:last-child { text-align: right; }
  .ptbl td:nth-child(2), .ptbl th:nth-child(2) { text-align: center; }
  .ptbl td:nth-child(3), .ptbl th:nth-child(3) { text-align: right; }

  /* Total */
  .total { background: #0f2d52; color: #fff; padding: 4px 9px; border-radius: 3px; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; }
  .total-lbl { font-size: ${fs * 0.7}px; text-transform: uppercase; letter-spacing: .5px; opacity: .8; }
  .total-val { font-size: ${fs * 1.5}px; font-weight: 900; }

  /* Warning */
  .wbox { background: #fff7ed; border-left: 3px solid #f97316; padding: 3px 7px; border-radius: 0 3px 3px 0; flex-shrink: 0; }
  .wtext { font-size: ${fs * 0.7}px; font-weight: 700; color: #7c2d12; line-height: 1.4; }

  /* Phone bar */
  .pbar { background: #0f2d52; color: #fff; border-radius: 3px; padding: 5px 9px; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; }
  .pbar-lbl { font-size: ${fs * 0.6}px; text-transform: uppercase; letter-spacing: .5px; opacity: .7; margin-bottom: 1px; }
  .pbar-val { font-size: ${fs * 1.7}px; font-weight: 900; letter-spacing: .1px; }
  .pbar-name { font-weight: 800; font-size: ${fs * 1.1}px; }
  .pbar-cpf { font-size: ${fs * 0.7}px; opacity: .7; }

  /* Urgency note */
  .urg { background: #fefce8; border: 1px solid #fde047; border-radius: 3px; padding: 3px 7px; flex-shrink: 0; }
  .urg-text { font-size: ${fs * 0.65}px; font-weight: 700; color: #713f12; line-height: 1.35; }

  /* Footer QR + signature */
  .qrw { display: flex; align-items: center; gap: 5px; flex-shrink: 0; }
  .qrw img { width: 28px; height: 28px; }
  .qr-lbl { font-size: ${fs * 0.63}px; font-weight: 800; text-transform: uppercase; color: #64748b; letter-spacing: .3px; }
  .qr-sub { font-size: ${fs * 0.63}px; color: #94a3b8; margin-top: 1px; }
  .sig { flex: 1; border-top: 1px solid #94a3b8; padding-top: 2px; text-align: center; font-size: ${fs * 0.7}px; color: #64748b; margin-left: 4px; }
`;

function techBody(so: any, osNumber: string, technician: string, date: string, statusStyle: string, techQrImg: string, printType: string, formatCurrency: (n: number) => string): string {
  const f = (lbl: string, val?: string | null, mono = false) =>
    `<div class="fc"><span class="fl">${lbl}</span><span class="fv${mono ? ' mono' : ''}">${val || '&mdash;'}</span></div>`;

  return `
  <div class="hd">
    <div>
      <div class="hd-tag">Ordem de Servico &mdash; Via Tecnico</div>
      <div class="hd-num">${osNumber}</div>
    </div>
    <div class="hd-right">
      <div class="badge" style="${statusStyle}">${so.status || 'Pendente'}</div>
      <div class="hd-sub">Tecnico: ${technician}</div>
      <div class="hd-sub">Data: ${date}</div>
    </div>
  </div>
  <div class="bd">
    <div class="sec">
      <div class="st">Dados do Equipamento</div>
      <div class="fg2">
        ${f('Tipo', so.equipmentType)}
        ${f('Marca', so.equipmentBrand)}
        ${f('Modelo', so.equipmentModel)}
        ${f('No de Serie', so.equipmentSerial)}
        ${f('Cor', so.equipmentColor)}
        ${f('Senha', so.customerPassword, true)}
      </div>
      ${(so.accessories || so.ramInfo || so.ssdInfo) ? `
      <div class="fg3">
        ${so.accessories ? f('Acessorios', so.accessories) : ''}
        ${so.ramInfo ? f('RAM', so.ramInfo) : ''}
        ${so.ssdInfo ? f('SSD/HD', so.ssdInfo) : ''}
      </div>` : ''}
    </div>

    ${so.reportedProblem ? `
    <div class="sec">
      <div class="st">Problema Relatado</div>
      <div class="pbox"><div class="ptext">${so.reportedProblem}</div></div>
    </div>` : ''}

    ${printType === 'complete' && so.technicalAnalysis ? `
    <div class="sec">
      <div class="st">Analise Tecnica</div>
      <div class="tblock"><div class="ttext">${so.technicalAnalysis}</div></div>
    </div>` : ''}

    ${printType === 'complete' && so.servicesPerformed ? `
    <div class="sec">
      <div class="st">Servicos Realizados</div>
      <div class="tblock"><div class="ttext">${so.servicesPerformed}</div></div>
    </div>` : ''}

    ${printType === 'complete' && so.partsUsed?.length ? `
    <div class="sec">
      <div class="st">Pecas Utilizadas</div>
      <div class="ptbl-wrap">
        <table class="ptbl">
          <thead><tr>
            <th style="width:52%">Descricao</th>
            <th style="width:10%">Qtd</th>
            <th style="width:19%">Unit.</th>
            <th style="width:19%">Subtotal</th>
          </tr></thead>
          <tbody>${so.partsUsed.map((p: any) => `
            <tr>
              <td style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:0">${p.name}</td>
              <td>${p.quantity}</td>
              <td>${formatCurrency(p.unitPrice)}</td>
              <td>${formatCurrency(p.subtotal)}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>` : ''}

    ${printType === 'complete' && so.totalAmount ? `
    <div class="total">
      <span class="total-lbl">Valor Total do Servico</span>
      <span class="total-val">${formatCurrency(so.totalAmount)}</span>
    </div>` : ''}

    ${so.finalObservations ? `
    <div class="sec">
      <div class="st">Observacoes</div>
      <div class="tblock"><div class="ttext">${so.finalObservations}</div></div>
    </div>` : ''}
  </div>
  <div class="ft">
    <div class="qrw">
      <img src="${techQrImg}" />
      <div>
        <div class="qr-lbl">QR Tecnico</div>
        <div class="qr-sub">Acesso rapido a OS</div>
      </div>
    </div>
    <div class="sig">${technician} &mdash; Assinatura do Tecnico</div>
  </div>`;
}

function clientBody(so: any, osNumber: string, customer: PrintData['customer'], dateFull: string, customerQrImg: string): string {
  const f = (lbl: string, val?: string | null) =>
    `<div class="fc"><span class="fl">${lbl}</span><span class="fv">${val || '&mdash;'}</span></div>`;

  return `
  <div class="hd">
    <div>
      <div class="hd-tag">Comprovante de Entrada &mdash; Via Cliente</div>
      <div class="hd-num">${osNumber}</div>
    </div>
    <div class="hd-right">
      <div class="hd-sub">${dateFull}</div>
    </div>
  </div>
  <div class="bd">
    <div class="wbox">
      <div class="wtext"><strong>AVISO DE RETIRADA:</strong> Apos a conclusao do servico, o equipamento deve ser retirado em ate <strong>30 dias corridos</strong>. Apos este prazo serao cobradas taxas de armazenamento diarias. Equipamentos nao retirados apos 90 dias poderao ser encaminhados para deposito externo ou descartados conforme legislacao vigente.</div>
    </div>

    <div class="pbar">
      <div>
        <div class="pbar-lbl">Telefone / WhatsApp</div>
        <div class="pbar-val">${customer.phone || 'Nao informado'}</div>
      </div>
      <div style="text-align:right">
        <div class="pbar-name">${customer.firstName} ${customer.lastName}</div>
        ${customer.cpf ? `<div class="pbar-cpf">CPF: ${customer.cpf}</div>` : ''}
      </div>
    </div>

    <div class="sec">
      <div class="st">Dados do Equipamento</div>
      <div class="fg2">
        ${f('Tipo', so.equipmentType)}
        ${f('Marca', so.equipmentBrand)}
        ${f('Modelo', so.equipmentModel)}
        ${f('No de Serie', so.equipmentSerial)}
        ${f('Cor', so.equipmentColor)}
      </div>
    </div>

    ${so.reportedProblem ? `
    <div class="sec">
      <div class="st">Problema Relatado</div>
      <div class="pbox"><div class="ptext">${so.reportedProblem}</div></div>
    </div>` : ''}

    ${so.finalObservations ? `
    <div class="sec">
      <div class="st">Observacoes</div>
      <div class="tblock"><div class="ttext">${so.finalObservations}</div></div>
    </div>` : ''}

    <div class="urg">
      <div class="urg-text">Tarifa de urgencia disponivel para analise prioritaria mediante taxa adicional. Consulte o atendimento.</div>
    </div>
  </div>
  <div class="ft">
    <div class="qrw">
      <img src="${customerQrImg}" />
      <div>
        <div class="qr-lbl">Acompanhe pelo celular</div>
        <div class="qr-sub">Escaneie para ver o status</div>
      </div>
    </div>
    <div class="sig">${customer.firstName} ${customer.lastName} &mdash; Assinatura do Cliente</div>
  </div>`;
}

// ─── A4 Landscape — 2 colunas lado a lado ────────────────────────────────────
export function getA4EnhancedLayout(data: PrintData): string {
  const { osNumber, date, dateFull, technician, customer, selectedOrder, customerQrImg, techQrImg, printType, formatCurrency } = data;
  const so = selectedOrder;
  const statusStyle = resolveStatusStyle(so.status || '');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${osNumber}</title>
<style>
@page { size: A4 landscape; margin: 5mm 6mm; }
${sharedCSS(7.5)}
body {
  width: 285mm; height: 200mm;
  display: flex; flex-direction: row; gap: 0;
}
/* Two equal columns */
.col { flex: 1; min-width: 0; }

/* Dashed vertical cut line */
.divider {
  flex-shrink: 0; width: 14px;
  display: flex; flex-direction: column; align-items: center;
}
.dline { flex: 1; border-left: 1.5px dashed #94a3b8; }
.dcut {
  flex-shrink: 0; font-size: 9px; color: #94a3b8;
  writing-mode: vertical-rl; letter-spacing: 2px;
  padding: 4px 0; white-space: nowrap;
}
</style>
</head>
<body>

<div class="col">${techBody(so, osNumber, technician, date, statusStyle, techQrImg, printType, formatCurrency)}</div>

<div class="divider">
  <div class="dline"></div>
  <div class="dcut">&#x2702; CORTE</div>
  <div class="dline"></div>
</div>

<div class="col">${clientBody(so, osNumber, customer, dateFull, customerQrImg)}</div>

<script>window.onload=function(){window.print();setTimeout(function(){window.close();},500);}</script>
</body>
</html>`;
}

// ─── A5 Portrait — 2 metades (cliente cima, técnico baixo) ───────────────────
export function getA5Layout(data: PrintData): string {
  const { osNumber, date, dateFull, technician, customer, selectedOrder, customerQrImg, techQrImg, printType, formatCurrency } = data;
  const so = selectedOrder;
  const statusStyle = resolveStatusStyle(so.status || '');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${osNumber}</title>
<style>
@page { size: A5 portrait; margin: 4mm; }
${sharedCSS(6.5)}
body {
  width: 140mm; height: 202mm;
  display: flex; flex-direction: column;
}
.col { flex: 1; min-height: 0; overflow: hidden; }

/* Horizontal cut line between halves */
.divider {
  flex-shrink: 0; height: 12px;
  display: flex; align-items: center; gap: 4px;
}
.dline { flex: 1; border-top: 1.5px dashed #94a3b8; }
.dcut { font-size: 7px; color: #94a3b8; white-space: nowrap; letter-spacing: 1px; }

/* A5 compact overrides */
.hd { padding: 4px 7px; }
.hd-num { font-size: 13px; }
.bd { padding: 4px 7px; gap: 3px; }
.ft { padding: 3px 7px; }
.qrw img { width: 24px; height: 24px; }
.pbar-val { font-size: 11px; }
</style>
</head>
<body>

<div class="col">${clientBody(so, osNumber, customer, dateFull, customerQrImg)}</div>

<div class="divider">
  <div class="dline"></div>
  <div class="dcut">&#x2702; CORTE AQUI &#x2702;</div>
  <div class="dline"></div>
</div>

<div class="col">${techBody(so, osNumber, technician, date, statusStyle, techQrImg, printType, formatCurrency)}</div>

<script>window.onload=function(){window.print();setTimeout(function(){window.close();},500);}</script>
</body>
</html>`;
}

// ─── Térmica 80mm ─────────────────────────────────────────────────────────────
export function getThermalLayout(data: PrintData): string {
  const { osNumber, dateFull, customer, selectedOrder, equipmentDisplay, customerQrImg } = data;
  const so = selectedOrder;

  const statusStyle = resolveStatusStyle(so.status || '');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${osNumber}</title>
<style>
@page { size: 80mm auto; margin: 3mm 4mm; }
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: 'Segoe UI', Arial, sans-serif;
  width: 72mm;
  color: #1e293b;
  font-size: 9px;
  line-height: 1.4;
}

/* Header */
.thd {
  text-align: center;
  padding-bottom: 6px;
  margin-bottom: 8px;
  border-bottom: 2px solid #0f2d52;
}
.thd-brand { font-size: 8px; font-weight: 800; color: #0f2d52; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 2px; }
.thd-title { font-size: 11px; font-weight: 900; color: #1e293b; letter-spacing: -.2px; }
.thd-os { font-size: 18px; font-weight: 900; color: #0f2d52; line-height: 1; margin: 3px 0; }
.thd-date { font-size: 8px; color: #64748b; }

/* Status badge */
.tbadge {
  display: inline-block;
  font-size: 8px; font-weight: 800;
  padding: 3px 10px;
  border-radius: 12px;
  text-transform: uppercase; letter-spacing: .4px;
  margin: 4px 0;
}

/* Section title */
.tst {
  font-size: 7px; font-weight: 800; text-transform: uppercase; letter-spacing: .8px;
  color: #1d4ed8;
  border-bottom: 1px solid #bfdbfe;
  padding-bottom: 2px; margin-bottom: 5px; margin-top: 8px;
}

/* Client bar */
.tclient {
  background: #0f2d52; color: #fff;
  border-radius: 4px; padding: 6px 8px;
  margin-bottom: 8px;
}
.tclient-lbl { font-size: 7px; text-transform: uppercase; letter-spacing: .5px; opacity: .7; margin-bottom: 1px; }
.tclient-phone { font-size: 16px; font-weight: 900; letter-spacing: .2px; }
.tclient-name { font-size: 9px; font-weight: 800; margin-top: 2px; }
.tclient-cpf { font-size: 7px; opacity: .7; }

/* Problem */
.tprob {
  background: #fef2f2; border-left: 3px solid #dc2626;
  padding: 4px 7px; border-radius: 0 3px 3px 0;
  margin-bottom: 6px;
}
.tprob-lbl { font-size: 7px; font-weight: 800; text-transform: uppercase; color: #dc2626; margin-bottom: 2px; }
.tprob-text { font-size: 9px; font-weight: 600; color: #1e293b; line-height: 1.4; }

/* Equipment */
.tequip { margin-bottom: 6px; }
.tequip-name { font-size: 11px; font-weight: 800; color: #0f172a; }
.tequip-serial { font-size: 8px; color: #64748b; margin-top: 1px; }

/* QR section */
.tqr { text-align: center; margin: 10px 0 6px; }
.tqr img { width: 70px; height: 70px; }
.tqr-lbl { font-size: 8px; font-weight: 800; text-transform: uppercase; color: #1d4ed8; margin-bottom: 3px; }
.tqr-sub { font-size: 7px; color: #64748b; margin-top: 2px; }

/* Divider */
.tdiv { border: none; border-top: 1px dashed #cbd5e1; margin: 8px 0; }

/* Footer */
.tfooter { text-align: center; font-size: 7px; color: #94a3b8; letter-spacing: .5px; padding-top: 4px; }
</style>
</head>
<body>

  <div class="thd">
    <div class="thd-brand">Assistencia Tecnica</div>
    <div class="thd-title">Comprovante de Entrada</div>
    <div class="thd-os">${osNumber}</div>
    <div class="thd-date">${dateFull}</div>
    <div style="margin-top:4px;">
      <span class="tbadge" style="${statusStyle}">${so.status || 'Pendente'}</span>
    </div>
  </div>

  <div class="tclient">
    <div class="tclient-lbl">Telefone / WhatsApp</div>
    <div class="tclient-phone">${customer.phone || 'Nao informado'}</div>
    <div class="tclient-name">${customer.firstName} ${customer.lastName}</div>
    ${customer.cpf ? `<div class="tclient-cpf">CPF: ${customer.cpf}</div>` : ''}
  </div>

  <div class="tequip">
    <div class="tst">Equipamento</div>
    <div class="tequip-name">${equipmentDisplay || 'Nao informado'}</div>
    ${so.equipmentSerial ? `<div class="tequip-serial">N/S: ${so.equipmentSerial}</div>` : ''}
    ${so.equipmentColor ? `<div class="tequip-serial">Cor: ${so.equipmentColor}</div>` : ''}
  </div>

  ${so.reportedProblem ? `
  <div class="tprob">
    <div class="tprob-lbl">Problema Relatado</div>
    <div class="tprob-text">${so.reportedProblem}</div>
  </div>` : ''}

  <hr class="tdiv" />

  <div class="tqr">
    <div class="tqr-lbl">Acompanhe pelo celular</div>
    <img src="${customerQrImg}" />
    <div class="tqr-sub">Escaneie o QR Code para ver o status da sua OS</div>
  </div>

  <hr class="tdiv" />

  <div class="tfooter">
    Obrigado pela preferencia!<br>
    Guarde este comprovante para retirada.
  </div>

  <script>window.onload=function(){window.print();setTimeout(function(){window.close();},500);}</script>
</body>
</html>`;
}
