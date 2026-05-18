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

function statusBadge(status: string | null | undefined): string {
  const s = (status || '').toLowerCase();
  if (s.includes('aguardando') || s.includes('pendente')) return 'bg-amber';
  if (s.includes('andamento') || s.includes('analise')) return 'badge-blue';
  if (s.includes('pronto') || s.includes('concluído') || s.includes('finalizado')) return 'badge-green';
  if (s.includes('entregue')) return 'badge-done';
  return 'bg-amber';
}

export function getA4EnhancedLayout(data: PrintData): string {
  const { osNumber, date, dateFull, technician, customer, selectedOrder, equipmentDisplay, customerQrImg, techQrImg, printType, formatCurrency } = data;
  const so = selectedOrder;

  const badgeClass = statusBadge(so.status);

  return `
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page { size: A4 landscape; margin: 6mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #1e293b; line-height: 1.2; background: #fff;
      font-size: 8.5px;
      width: 285mm; height: 198mm;
      display: flex; position: relative;
    }
    .cut-line {
      position: absolute; left: 50%; top: 4mm; bottom: 4mm;
      width: 0; border-left: 2px dashed #94a3b8; z-index: 10;
    }
    .cut-label {
      position: absolute; left: 50%; top: 50%;
      transform: translate(-50%, -50%);
      background: #fff; padding: 2px 8px; z-index: 11;
      font-size: 7px; color: #94a3b8; font-weight: 700; letter-spacing: 1px;
      border: 1px dashed #94a3b8; border-radius: 3px;
    }
    .col {
      flex: 1; padding: 4mm 5.5mm;
      display: flex; flex-direction: column;
    }
    .hdr {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 4px; padding-bottom: 3px;
      border-bottom: 1.5px solid #e2e8f0;
    }
    .hdr-tag { font-size: 6.5px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 1px; }
    .hdr-tag-ico { font-size: 7px; }
    .hdr-num { font-size: 15px; font-weight: 900; color: #1e3a5f; letter-spacing: -0.3px; margin-top: 1px; }
    .hdr-date { font-size: 7px; color: #64748b; text-align: right; }
    .hdr-right { text-align: right; }

    .badge {
      display: inline-block; font-size: 6.5px; font-weight: 800;
      padding: 1px 8px; border-radius: 20px; letter-spacing: 0.5px;
    }
    .bg-amber { background: #fef3c7; color: #92400e; border: 1px solid #fbbf24; }
    .badge-blue { background: #dbeafe; color: #1e40af; border: 1px solid #93c5fd; }
    .badge-green { background: #d1fae5; color: #065f46; border: 1px solid #34d399; }
    .badge-done { background: #e0e7ff; color: #3730a3; border: 1px solid #818cf8; }

    .sec-title {
      font-size: 6.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px;
      color: #2563eb;
      border-bottom: 1.5px solid #93c5fd;
      padding-bottom: 1px; margin-bottom: 3px; margin-top: 3px;
      display: flex; align-items: center; gap: 3px;
    }

    .f-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px 4px; margin-bottom: 2px; }
    .f-cell { min-width: 0; }
    .f-label { font-size: 5.5px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.4px; }
    .f-value { font-size: 8px; font-weight: 700; color: #0f172a; word-break: break-word; }

    .urg-box {
      border: 1.5px solid #eab308; background: #fefce8; border-radius: 4px;
      padding: 3px 6px; margin-bottom: 4px;
      display: flex; align-items: flex-start; gap: 4px;
    }
    .urg-ico { font-size: 10px; flex-shrink: 0; margin-top: 1px; }
    .urg-text { font-size: 6.5px; font-weight: 700; color: #713f12; line-height: 1.25; }

    .warn-box {
      border: 1.5px solid #f97316; background: #fff7ed; border-radius: 4px;
      padding: 4px 6px; margin-bottom: 4px;
      display: flex; align-items: flex-start; gap: 4px;
    }
    .warn-ico { font-size: 11px; flex-shrink: 0; margin-top: 1px; }
    .warn-text { font-size: 6.5px; font-weight: 700; color: #7c2d12; line-height: 1.25; }

    .phone-bar {
      background: #1e3a5f; color: #fff; border-radius: 4px;
      padding: 4px 10px; display: flex; align-items: center;
      justify-content: space-between; margin-bottom: 4px;
    }
    .phone-label { font-size: 6px; text-transform: uppercase; letter-spacing: 0.6px; opacity: 0.8; }
    .phone-val { font-size: 16px; font-weight: 900; letter-spacing: 0.3px; }
    .phone-name { font-weight: 700; font-size: 10px; text-align: right; }

    .prob-box {
      background: #fef2f2; border: 1.5px solid #dc2626; border-radius: 4px;
      padding: 3px 8px; margin-bottom: 3px;
    }
    .prob-text { font-size: 8px; font-weight: 600; color: #1e293b; }

    .t-text {
      font-size: 7.5px; color: #334155; line-height: 1.3;
      padding: 2px 6px; background: #f8fafc; border-radius: 3px; margin-bottom: 3px;
    }

    .tbl { width: 100%; border-collapse: collapse; font-size: 6.5px; margin: 2px 0; }
    .tbl th { background: #f1f5f9; padding: 1px 4px; text-align: left; font-size: 5.5px; text-transform: uppercase; color: #64748b; border-bottom: 1px solid #e2e8f0; }
    .tbl td { padding: 1px 4px; border-bottom: 1px solid #f1f5f9; }

    .total-bar {
      background: #1e3a5f; color: #fff; padding: 3px 10px; border-radius: 4px;
      display: flex; justify-content: space-between; align-items: center; margin: 3px 0;
    }
    .total-label { font-size: 7px; opacity: 0.9; text-transform: uppercase; letter-spacing: 0.6px; }
    .total-value { font-size: 12px; font-weight: 900; }

    .sig {
      border-top: 1.5px solid #1e293b; padding-top: 2px;
      text-align: center; font-size: 7px; color: #64748b; margin-top: auto;
    }

    .qr-row { display: flex; align-items: center; gap: 5px; margin-top: 3px; }
    .qr-row img { width: 35px; height: 35px; }
    .qr-label { font-size: 5.5px; font-weight: 700; text-transform: uppercase; color: #64748b; }
    .qr-desc { font-size: 6px; color: #94a3b8; }

    .mt-a { margin-top: auto; }
    .mb-2 { margin-bottom: 3px; }
  </style>
</head>
<body>
  <div class="cut-line"></div>
  <div class="cut-label">&#x2702; Corte aqui &#x2702;</div>

  <!-- ============ LEFT: VIA EQUIPAMENTO ============ -->
  <div class="col">

    <div class="hdr">
      <div>
        <div class="hdr-tag"><span class="hdr-tag-ico">&#x1F527;</span> Ordem de Serviço</div>
        <div class="hdr-num">${osNumber}</div>
      </div>
      <div class="hdr-right">
        <div class="badge ${badgeClass}">${so.status || 'Pendente'}</div>
        <div class="hdr-date" style="margin-top:2px;">${technician}</div>
      </div>
    </div>

    <div class="urg-box">
      <span class="urg-ico">&#x23F0;</span>
      <div class="urg-text">TARIFA DE URGÊNCIA DISPONÍVEL! Possibilidade de análise prioritária mediante taxa adicional. Solicite informações detalhadas no atendimento.</div>
    </div>

    <div class="sec-title"><span>&#x1F4CB;</span> Dados do Equipamento</div>
    <div class="f-grid">
      <div class="f-cell"><div class="f-label">Tipo</div><div class="f-value">${so.equipmentType || '\u2014'}</div></div>
      <div class="f-cell"><div class="f-label">Marca</div><div class="f-value">${so.equipmentBrand || '\u2014'}</div></div>
      <div class="f-cell"><div class="f-label">Modelo</div><div class="f-value">${so.equipmentModel || '\u2014'}</div></div>
      <div class="f-cell"><div class="f-label">Nº Série</div><div class="f-value">${so.equipmentSerial || '\u2014'}</div></div>
      <div class="f-cell"><div class="f-label">Cor</div><div class="f-value">${so.equipmentColor || '\u2014'}</div></div>
      <div class="f-cell"><div class="f-label">Senha</div><div class="f-value" style="font-family:'Courier New',monospace;">${so.customerPassword || '\u2014'}</div></div>
      <div class="f-cell" style="grid-column:span 2;"><div class="f-label">Acessórios</div><div class="f-value">${so.accessories || '\u2014'}</div></div>
    </div>

    ${so.ramInfo || so.ssdInfo ? `
    <div style="display:flex;gap:4px;margin-bottom:2px;">
      ${so.ramInfo ? `<div style="flex:1;"><div class="f-label">RAM</div><div class="f-value">${so.ramInfo}</div></div>` : ''}
      ${so.ssdInfo ? `<div style="flex:1;"><div class="f-label">SSD</div><div class="f-value">${so.ssdInfo}</div></div>` : ''}
    </div>
    ` : ''}

    ${so.reportedProblem ? `
    <div class="sec-title"><span>&#x1F50D;</span> Problema Relatado</div>
    <div class="prob-box"><div class="prob-text">${so.reportedProblem}</div></div>
    ` : ''}

    ${printType === 'complete' && so.technicalAnalysis ? `
    <div class="sec-title"><span>&#x2699;&#xFE0F;</span> Análise Técnica</div>
    <div class="t-text">${so.technicalAnalysis}</div>
    ` : ''}

    ${printType === 'complete' && so.servicesPerformed ? `
    <div class="sec-title"><span>&#x1F527;</span> Serviços Realizados</div>
    <div class="t-text">${so.servicesPerformed}</div>
    ` : ''}

    ${printType === 'complete' && so.partsUsed && so.partsUsed.length > 0 ? `
    <div class="sec-title"><span>&#x1F529;</span> Peças Utilizadas</div>
    <table class="tbl">
      <thead><tr>
        <th>Descrição</th>
        <th style="text-align:center;">Qtd</th>
        <th style="text-align:right;">Unit.</th>
        <th style="text-align:right;">Subtotal</th>
      </tr></thead>
      <tbody>
        ${so.partsUsed.map((p: any) => `
          <tr>
            <td>${p.name}</td>
            <td style="text-align:center;">${p.quantity}</td>
            <td style="text-align:right;">${formatCurrency(p.unitPrice)}</td>
            <td style="text-align:right;">${formatCurrency(p.subtotal)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    ` : ''}

    ${printType === 'complete' && so.totalAmount ? `
    <div class="total-bar">
      <span class="total-label">&#x1F4B0; Valor Total</span>
      <span class="total-value">${formatCurrency(so.totalAmount)}</span>
    </div>
    ` : ''}

    ${so.finalObservations ? `
    <div class="sec-title"><span>&#x1F4DD;</span> Observações</div>
    <div class="t-text">${so.finalObservations}</div>
    ` : ''}

    <div style="margin-top:auto;">
      <div class="qr-row">
        <img src="${techQrImg}" />
        <div>
          <div class="qr-label">&#x1F4F1; QR Técnico</div>
          <div class="qr-desc">Uso interno do técnico</div>
        </div>
      </div>
      <div class="sig"><strong>${technician}</strong> — Assinatura do Técnico</div>
    </div>
  </div>

  <!-- ============ RIGHT: VIA CLIENTE ============ -->
  <div class="col">

    <div class="hdr">
      <div>
        <div class="hdr-tag"><span class="hdr-tag-ico">&#x1F4C4;</span> Comprovante de Entrada</div>
        <div class="hdr-num">${osNumber}</div>
      </div>
      <div class="hdr-right">
        <div class="hdr-date">${dateFull}</div>
      </div>
    </div>

    <div class="warn-box">
      <span class="warn-ico">&#x26A0;&#xFE0F;</span>
      <div class="warn-text">AVISO DE FINALIZAÇÃO E RETIRADA: Após o término do serviço, o equipamento deve ser retirado em até 30 dias corridos (prazo legal). Após este prazo, será cobrada taxa de armazenamento diária. Equipamentos não retirados após 90 dias poderão ser realocados para depósito externo ou descartados, conforme legislação vigente.</div>
    </div>

    <div class="phone-bar">
      <div>
        <div class="phone-label">&#x1F4DE; Telefone / WhatsApp</div>
        <div class="phone-val">${customer.phone || 'Não informado'}</div>
      </div>
      <div>
        <div class="phone-name">${customer.firstName} ${customer.lastName}</div>
        ${customer.cpf ? `<div style="font-size:7px;opacity:0.7;">CPF: ${customer.cpf}</div>` : ''}
      </div>
    </div>

    <div class="sec-title"><span>&#x1F4CB;</span> Dados do Equipamento</div>
    <div class="f-grid">
      <div class="f-cell" style="grid-column:span 2;"><div class="f-label">Equipamento</div><div class="f-value">${equipmentDisplay}</div></div>
      <div class="f-cell"><div class="f-label">Tipo</div><div class="f-value">${so.equipmentType || '\u2014'}</div></div>
      <div class="f-cell"><div class="f-label">Marca</div><div class="f-value">${so.equipmentBrand || '\u2014'}</div></div>
      <div class="f-cell"><div class="f-label">Modelo</div><div class="f-value">${so.equipmentModel || '\u2014'}</div></div>
      <div class="f-cell"><div class="f-label">Nº Série</div><div class="f-value">${so.equipmentSerial || '\u2014'}</div></div>
      <div class="f-cell"><div class="f-label">Cor</div><div class="f-value">${so.equipmentColor || '\u2014'}</div></div>
    </div>

    ${so.reportedProblem ? `
    <div class="sec-title"><span>&#x1F50D;</span> Problema Relatado</div>
    <div class="prob-box"><div class="prob-text">${so.reportedProblem}</div></div>
    ` : ''}

    ${so.finalObservations ? `
    <div class="sec-title"><span>&#x1F4DD;</span> Observações</div>
    <div class="t-text">${so.finalObservations}</div>
    ` : ''}

    <div class="urg-box" style="margin-top:2px;">
      <span class="urg-ico">&#x23F0;</span>
      <div class="urg-text">Tarifa de urgência disponível para análise prioritária. Consulte o atendimento para mais informações.</div>
    </div>

    <div style="margin-top:auto;">
      <div class="qr-row">
        <img src="${customerQrImg}" />
        <div>
          <div class="qr-label">&#x1F4F1; Acompanhe pelo celular</div>
          <div class="qr-desc">Escaneie o QR Code e veja o status do seu serviço</div>
        </div>
      </div>
      <div class="sig"><strong>${customer.firstName} ${customer.lastName}</strong> — Assinatura do Cliente</div>
    </div>
  </div>

  <script>window.onload = function(){ window.print(); setTimeout(function(){ window.close(); }, 500); }</script>
</body>
</html>`;
}

export function getA5Layout(data: PrintData): string {
  const { osNumber, date, dateFull, technician, customer, selectedOrder, equipmentDisplay, customerQrImg, techQrImg, printType, formatCurrency } = data;
  const so = selectedOrder;
  const badgeClass = statusBadge(so.status);

  return `
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page { size: A5 portrait; margin: 4mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #1e293b; line-height: 1.15; background: #fff;
      font-size: 7px;
      display: flex; flex-direction: column;
      height: 202mm;
    }
    .half {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 3mm 4mm;
    }

    .cut-line {
      flex-shrink: 0;
      border: none;
      border-top: 1.5px dashed #94a3b8;
      margin: 0 30mm;
      position: relative;
    }
    .cut-line::after {
      content: "\u2702  Corte aqui  \u2702";
      position: absolute; top: -5px; left: 50%;
      transform: translateX(-50%);
      background: #fff; padding: 0 6px;
      font-size: 6px; color: #94a3b8;
      font-weight: 700; letter-spacing: 1px;
    }

    .hdr {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 3px; padding-bottom: 2px;
      border-bottom: 1.5px solid #e2e8f0;
    }
    .hdr-tag { font-size: 5.5px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.8px; }
    .hdr-num { font-size: 12px; font-weight: 900; color: #1e3a5f; letter-spacing: -0.2px; }
    .hdr-date { font-size: 6px; color: #64748b; text-align: right; }

    .badge {
      display: inline-block; font-size: 5.5px; font-weight: 800;
      padding: 1px 6px; border-radius: 20px; letter-spacing: 0.4px;
    }
    .bg-amber { background: #fef3c7; color: #92400e; border: 1px solid #fbbf24; }
    .badge-blue { background: #dbeafe; color: #1e40af; border: 1px solid #93c5fd; }
    .badge-green { background: #d1fae5; color: #065f46; border: 1px solid #34d399; }
    .badge-done { background: #e0e7ff; color: #3730a3; border: 1px solid #818cf8; }

    .sec-title {
      font-size: 5.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.6px;
      color: #2563eb;
      border-bottom: 1.5px solid #93c5fd;
      padding-bottom: 1px; margin-bottom: 2px; margin-top: 2px;
      display: flex; align-items: center; gap: 2px;
    }

    .f-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px 3px; margin-bottom: 2px; }
    .f-label { font-size: 5px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.3px; }
    .f-value { font-size: 6.5px; font-weight: 700; color: #0f172a; word-break: break-word; }

    .urg-box {
      border: 1.5px solid #eab308; background: #fefce8; border-radius: 3px;
      padding: 2px 5px; margin-bottom: 3px;
      display: flex; align-items: flex-start; gap: 3px;
    }
    .urg-ico { font-size: 8px; flex-shrink: 0; margin-top: 1px; }
    .urg-text { font-size: 5.5px; font-weight: 700; color: #713f12; line-height: 1.2; }

    .warn-box {
      border: 1.5px solid #f97316; background: #fff7ed; border-radius: 3px;
      padding: 3px 5px; margin-bottom: 3px;
      display: flex; align-items: flex-start; gap: 3px;
    }
    .warn-ico { font-size: 9px; flex-shrink: 0; margin-top: 1px; }
    .warn-text { font-size: 5.5px; font-weight: 700; color: #7c2d12; line-height: 1.2; }

    .phone-bar {
      background: #1e3a5f; color: #fff; border-radius: 3px;
      padding: 3px 8px; display: flex; align-items: center;
      justify-content: space-between; margin-bottom: 3px;
    }
    .phone-label { font-size: 5px; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.8; }
    .phone-val { font-size: 12px; font-weight: 900; letter-spacing: 0.2px; }
    .phone-name { font-weight: 700; font-size: 8px; text-align: right; }

    .prob-box {
      background: #fef2f2; border: 1.5px solid #dc2626; border-radius: 3px;
      padding: 2px 6px; margin-bottom: 2px;
    }
    .prob-text { font-size: 6.5px; font-weight: 600; color: #1e293b; }

    .t-text {
      font-size: 6px; color: #334155; line-height: 1.2;
      padding: 2px 5px; background: #f8fafc; border-radius: 2px; margin-bottom: 2px;
    }

    .tbl { width: 100%; border-collapse: collapse; font-size: 5.5px; margin: 2px 0; }
    .tbl th { background: #f1f5f9; padding: 1px 3px; text-align: left; font-size: 5px; text-transform: uppercase; color: #64748b; border-bottom: 1px solid #e2e8f0; }
    .tbl td { padding: 1px 3px; border-bottom: 1px solid #f1f5f9; }

    .total-bar {
      background: #1e3a5f; color: #fff; padding: 2px 8px; border-radius: 3px;
      display: flex; justify-content: space-between; align-items: center; margin: 2px 0;
    }
    .total-label { font-size: 6px; opacity: 0.9; text-transform: uppercase; letter-spacing: 0.5px; }
    .total-value { font-size: 10px; font-weight: 900; }

    .sig {
      border-top: 1.5px solid #1e293b; padding-top: 2px;
      text-align: center; font-size: 6px; color: #64748b; margin-top: auto;
    }

    .qr-row { display: flex; align-items: center; gap: 4px; margin-top: 2px; }
    .qr-row img { width: 28px; height: 28px; }
    .qr-label { font-size: 5px; font-weight: 700; text-transform: uppercase; color: #64748b; }
    .qr-desc { font-size: 5px; color: #94a3b8; }

    .mt-a { margin-top: auto; }
  </style>
</head>
<body>

  <!-- ===== TOP HALF: CLIENTE ===== -->
  <div class="half">

    <div class="hdr">
      <div>
        <div class="hdr-tag">&#x1F4C4; Comprovante de Entrada</div>
        <div class="hdr-num">${osNumber}</div>
      </div>
      <div class="hdr-date">${date}</div>
    </div>

    <div class="warn-box">
      <span class="warn-ico">&#x26A0;&#xFE0F;</span>
      <div class="warn-text">AVISO: Retirar equipamento em até 30 dias. Após este prazo, taxa de armazenamento diária. Equipamentos não retirados após 90 dias poderão ser descartados conforme legislação.</div>
    </div>

    <div class="phone-bar">
      <div>
        <div class="phone-label">&#x1F4DE; Telefone / WhatsApp</div>
        <div class="phone-val">${customer.phone || 'Não informado'}</div>
      </div>
      <div>
        <div class="phone-name">${customer.firstName} ${customer.lastName}</div>
        ${customer.cpf ? `<div style="font-size:6px;opacity:0.7;">CPF: ${customer.cpf}</div>` : ''}
      </div>
    </div>

    <div class="sec-title"><span>&#x1F4CB;</span> Dados do Equipamento</div>
    <div class="f-grid">
      <div class="f-cell"><div class="f-label">Tipo</div><div class="f-value">${so.equipmentType || '\u2014'}</div></div>
      <div class="f-cell"><div class="f-label">Marca</div><div class="f-value">${so.equipmentBrand || '\u2014'}</div></div>
      <div class="f-cell"><div class="f-label">Modelo</div><div class="f-value">${so.equipmentModel || '\u2014'}</div></div>
      <div class="f-cell"><div class="f-label">Nº Série</div><div class="f-value">${so.equipmentSerial || '\u2014'}</div></div>
    </div>

    ${so.reportedProblem ? `
    <div class="sec-title"><span>&#x1F50D;</span> Problema Relatado</div>
    <div class="prob-box"><div class="prob-text">${so.reportedProblem}</div></div>
    ` : ''}

    <div class="urg-box" style="margin-top:auto;">
      <span class="urg-ico">&#x23F0;</span>
      <div class="urg-text">Tarifa de urgência disponível. Consulte o atendimento.</div>
    </div>

    <div class="qr-row">
      <img src="${customerQrImg}" />
      <div>
        <div class="qr-label">&#x1F4F1; Acompanhe pelo celular</div>
        <div class="qr-desc">Escaneie o QR Code e veja o status</div>
      </div>
    </div>
    <div class="sig"><strong>${customer.firstName} ${customer.lastName}</strong> — Assinatura do Cliente</div>
  </div>

  <hr class="cut-line" />

  <!-- ===== BOTTOM HALF: TÉCNICO ===== -->
  <div class="half" style="padding-top:2mm;">

    <div class="hdr">
      <div>
        <div class="hdr-tag">&#x1F527; Ordem de Serviço</div>
        <div class="hdr-num">${osNumber}</div>
      </div>
      <div style="text-align:right;">
        <div class="badge ${badgeClass}">${so.status || 'Pendente'}</div>
        <div class="hdr-date" style="margin-top:1px;">${technician}</div>
      </div>
    </div>

    <div class="urg-box">
      <span class="urg-ico">&#x23F0;</span>
      <div class="urg-text">TARIFA DE URGÊNCIA DISPONÍVEL! Análise prioritária mediante taxa adicional. Solicite informações no atendimento.</div>
    </div>

    <div class="sec-title"><span>&#x1F4CB;</span> Dados do Equipamento</div>
    <div class="f-grid">
      <div class="f-cell"><div class="f-label">Tipo</div><div class="f-value">${so.equipmentType || '\u2014'}</div></div>
      <div class="f-cell"><div class="f-label">Marca</div><div class="f-value">${so.equipmentBrand || '\u2014'}</div></div>
      <div class="f-cell"><div class="f-label">Modelo</div><div class="f-value">${so.equipmentModel || '\u2014'}</div></div>
      <div class="f-cell"><div class="f-label">Nº Série</div><div class="f-value">${so.equipmentSerial || '\u2014'}</div></div>
      <div class="f-cell"><div class="f-label">Cor</div><div class="f-value">${so.equipmentColor || '\u2014'}</div></div>
      <div class="f-cell"><div class="f-label">Senha</div><div class="f-value" style="font-family:'Courier New',monospace;">${so.customerPassword || '\u2014'}</div></div>
      <div class="f-cell" style="grid-column:span 2;"><div class="f-label">Acessórios</div><div class="f-value">${so.accessories || '\u2014'}</div></div>
    </div>

    ${so.ramInfo || so.ssdInfo ? `
    <div style="display:flex;gap:3px;margin-bottom:2px;">
      ${so.ramInfo ? `<div style="flex:1;"><div class="f-label">RAM</div><div class="f-value">${so.ramInfo}</div></div>` : ''}
      ${so.ssdInfo ? `<div style="flex:1;"><div class="f-label">SSD</div><div class="f-value">${so.ssdInfo}</div></div>` : ''}
    </div>
    ` : ''}

    ${so.reportedProblem ? `
    <div class="sec-title"><span>&#x1F50D;</span> Problema Relatado</div>
    <div class="prob-box"><div class="prob-text">${so.reportedProblem}</div></div>
    ` : ''}

    ${printType === 'complete' && so.technicalAnalysis ? `
    <div class="sec-title"><span>&#x2699;&#xFE0F;</span> Análise Técnica</div>
    <div class="t-text">${so.technicalAnalysis}</div>
    ` : ''}

    ${printType === 'complete' && so.totalAmount ? `
    <div class="total-bar" style="margin-top:auto;">
      <span class="total-label">&#x1F4B0; Valor Total</span>
      <span class="total-value">${formatCurrency(so.totalAmount)}</span>
    </div>
    ` : ''}

    <div class="qr-row">
      <img src="${techQrImg}" />
      <div>
        <div class="qr-label">&#x1F4F1; QR Técnico</div>
        <div class="qr-desc">Uso interno</div>
      </div>
    </div>
    <div class="sig"><strong>${technician}</strong> — Assinatura do Técnico</div>
  </div>

  <script>window.onload = function(){ window.print(); setTimeout(function(){ window.close(); }, 500); }</script>
</body>
</html>`;
}

export function getThermalLayout(data: PrintData): string {
  const { osNumber, dateFull, customer, selectedOrder, equipmentDisplay, customerQrImg } = data;
  const so = selectedOrder;

  return `
<html>
<head>
  <style>
    @page { margin: 0; }
    body {
      font-family: 'Courier New', Courier, monospace;
      width: 80mm; padding: 5mm; font-size: 11px; color: #000; margin: 0;
    }
    .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 8px; margin-bottom: 10px; }
    .section { margin-bottom: 10px; }
    .label { font-weight: bold; }
    .highlight-box {
      background: #fff3cd; border: 2px solid #ffc107;
      padding: 8px; margin: 8px 0; border-radius: 4px;
    }
    .problem-box {
      background: #f8d7da; border: 2px solid #dc3545;
      padding: 8px; margin: 8px 0; border-radius: 4px; font-weight: bold;
    }
    .footer {
      border-top: 1px dashed #000; padding-top: 5px;
      margin-top: 10px; text-align: center; font-size: 10px;
    }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; border-bottom: 1px solid #000; }
    .qr-container { text-align: center; margin-top: 10px; }
    .qr-container img { width: 80px; height: 80px; }
  </style>
</head>
<body>
  <div class="header">
    <h3 style="margin:0;font-size:14px;">&#x1F4CB; RECIBO - ORDEM DE SERVIÇO</h3>
    <p style="margin:3px 0;font-size:12px;">${osNumber}</p>
    <p style="margin:0;font-size:10px;">${dateFull}</p>
  </div>

  <div class="highlight-box">
    <div style="font-size:10px;margin-bottom:3px;">&#x1F4DE; TELEFONE DO CLIENTE</div>
    <div style="font-size:14px;font-weight:bold;">${customer.phone || 'Não informado'}</div>
    <div style="font-size:10px;margin-top:3px;">&#x1F464; ${customer.firstName} ${customer.lastName}</div>
  </div>

  ${so.reportedProblem ? `
  <div class="problem-box">
    <div style="font-size:9px;margin-bottom:3px;">&#x26A0;&#xFE0F; PROBLEMA RELATADO</div>
    <div style="font-size:11px;">${so.reportedProblem}</div>
  </div>
  ` : ''}

  <div class="section">
    <div style="font-size:10px;font-weight:bold;margin-bottom:3px;">&#x1F4F1; EQUIPAMENTO</div>
    <div style="font-size:11px;">${equipmentDisplay}</div>
    ${so.equipmentSerial ? `<div style="font-size:9px;">S/N: ${so.equipmentSerial}</div>` : ''}
  </div>

  <div class="qr-container">
    <p style="font-size:9px;margin:5px 0;">Escaneie para acompanhar:</p>
    <img src="${customerQrImg}" />
  </div>

  <div class="footer">
    Obrigado pela preferência!
  </div>
  <script>window.onload = function(){ window.print(); setTimeout(function(){ window.close(); }, 500); }</script>
</body>
</html>`;
}
