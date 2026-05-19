import { AppSettings } from '../types';

export const getBlankFormLayout = (settings: AppSettings): string => {
  const appName = settings.appName || 'INOVA PRO';
  const logoHtml = settings.receiptLogo
    ? `<img src="${settings.receiptLogo}" class="logo" alt="${appName}" />`
    : `<div class="logo-text">${appName}</div>`;

  const content = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Ficha em Branco — ${appName}</title>
  <style>
    @page { size: A4 portrait; margin: 8mm 10mm; }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      color: #1e293b;
      background: #fff;
      width: 190mm;
      font-size: 8.5px;
      line-height: 1.35;
    }

    /* ── Header ──────────────────────────────── */
    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 8px;
      margin-bottom: 12px;
      border-bottom: 2.5px solid #0f2d52;
    }
    .logo-wrap { display: flex; align-items: center; gap: 10px; }
    .logo { height: 48px; width: auto; object-fit: contain; }
    .logo-text { font-size: 18px; font-weight: 900; color: #0f2d52; letter-spacing: -.5px; }
    .company-info { }
    .company-title { font-size: 13px; font-weight: 900; color: #0f2d52; text-transform: uppercase; letter-spacing: .5px; }
    .company-sub { font-size: 8px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1.2px; margin-top: 1px; }
    .header-right { text-align: right; }
    .os-box {
      border: 1.5px solid #0f2d52;
      border-radius: 4px;
      padding: 4px 10px;
      min-width: 80px;
    }
    .os-label { font-size: 7px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: .8px; margin-bottom: 3px; }
    .os-line { height: 18px; border-bottom: 1.5px solid #0f2d52; }
    .date-row { display: flex; align-items: center; gap: 6px; margin-top: 5px; }
    .date-label { font-size: 7px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: .6px; white-space: nowrap; }
    .date-line { flex: 1; height: 16px; border-bottom: 1.5px solid #0f2d52; min-width: 80px; }

    /* ── Section titles ──────────────────────── */
    .sec-title {
      font-size: 7.5px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: .9px;
      color: #1d4ed8;
      padding: 2px 0 3px;
      border-bottom: 1.5px solid #bfdbfe;
      margin-bottom: 8px;
    }

    /* ── Main grid ───────────────────────────── */
    .main-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px 16px;
      margin-bottom: 10px;
    }

    /* ── Field ───────────────────────────────── */
    .field { margin-bottom: 7px; }
    .field-label {
      display: block;
      font-size: 7px;
      font-weight: 700;
      text-transform: uppercase;
      color: #64748b;
      letter-spacing: .4px;
      margin-bottom: 2px;
    }
    .field-line {
      width: 100%;
      height: 20px;
      border-bottom: 1.5px solid #94a3b8;
    }
    .field-pair {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0 10px;
    }
    .field-trio {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 0 8px;
    }

    /* ── Problem area ────────────────────────── */
    .problem-section { margin-bottom: 10px; }
    .problem-box {
      width: 100%;
      height: 52px;
      border: 1.5px solid #e2e8f0;
      border-radius: 4px;
      background: #fafafa;
    }

    /* ── Services area ───────────────────────── */
    .services-box {
      width: 100%;
      height: 36px;
      border: 1.5px solid #e2e8f0;
      border-radius: 4px;
      background: #fafafa;
    }

    /* ── Value row ───────────────────────────── */
    .value-row {
      display: flex;
      gap: 10px;
      margin-bottom: 10px;
      align-items: flex-end;
    }
    .value-row .field { flex: 1; margin-bottom: 0; }

    /* ── Signatures ──────────────────────────── */
    .signatures {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0 40px;
      margin-top: 14px;
    }
    .sig-box { border-top: 1.5px solid #1e293b; padding-top: 4px; text-align: center; }
    .sig-label { font-size: 7.5px; font-weight: 700; text-transform: uppercase; color: #475569; letter-spacing: .5px; }

    /* ── Footer note ─────────────────────────── */
    .footer-note {
      margin-top: 10px;
      text-align: center;
      font-size: 7px;
      color: #94a3b8;
      font-style: italic;
      letter-spacing: .5px;
    }

    /* ── Warning strip ───────────────────────── */
    .warning-strip {
      background: #fff7ed;
      border-left: 3px solid #f97316;
      padding: 4px 8px;
      border-radius: 0 3px 3px 0;
      margin-bottom: 10px;
    }
    .warning-text { font-size: 7px; font-weight: 700; color: #7c2d12; line-height: 1.4; }
  </style>
</head>
<body>

  <!-- Header -->
  <div class="page-header">
    <div class="logo-wrap">
      ${logoHtml}
      <div class="company-info">
        <div class="company-title">${appName}</div>
        <div class="company-sub">Ficha de Entrada de Equipamento</div>
      </div>
    </div>
    <div class="header-right">
      <div class="os-box">
        <div class="os-label">No da OS</div>
        <div class="os-line"></div>
      </div>
      <div class="date-row" style="margin-top:6px;">
        <span class="date-label">Data de entrada:</span>
        <div class="date-line"></div>
      </div>
    </div>
  </div>

  <!-- Main two-column grid -->
  <div class="main-grid">

    <!-- Left: Client data -->
    <div>
      <div class="sec-title">Dados do Cliente</div>
      <div class="field">
        <label class="field-label">Nome Completo</label>
        <div class="field-line"></div>
      </div>
      <div class="field-pair">
        <div class="field">
          <label class="field-label">Telefone / WhatsApp</label>
          <div class="field-line"></div>
        </div>
        <div class="field">
          <label class="field-label">CPF / CNPJ</label>
          <div class="field-line"></div>
        </div>
      </div>
      <div class="field">
        <label class="field-label">E-mail</label>
        <div class="field-line"></div>
      </div>
      <div class="field">
        <label class="field-label">Endereco</label>
        <div class="field-line"></div>
      </div>
    </div>

    <!-- Right: Equipment data -->
    <div>
      <div class="sec-title">Dados do Equipamento</div>
      <div class="field-pair">
        <div class="field">
          <label class="field-label">Tipo</label>
          <div class="field-line"></div>
        </div>
        <div class="field">
          <label class="field-label">Marca</label>
          <div class="field-line"></div>
        </div>
      </div>
      <div class="field-pair">
        <div class="field">
          <label class="field-label">Modelo</label>
          <div class="field-line"></div>
        </div>
        <div class="field">
          <label class="field-label">No de Serie / IMEI</label>
          <div class="field-line"></div>
        </div>
      </div>
      <div class="field-trio">
        <div class="field">
          <label class="field-label">Cor</label>
          <div class="field-line"></div>
        </div>
        <div class="field">
          <label class="field-label">Senha / PIN</label>
          <div class="field-line"></div>
        </div>
        <div class="field">
          <label class="field-label">Acessorios</label>
          <div class="field-line"></div>
        </div>
      </div>
    </div>
  </div>

  <!-- Problem reported -->
  <div class="problem-section">
    <div class="sec-title">Relato do Problema / Defeito</div>
    <div class="problem-box"></div>
  </div>

  <!-- Services + Value -->
  <div class="value-row">
    <div class="field" style="flex:2">
      <div class="sec-title">Servicos / Observacoes Tecnicas</div>
      <div class="services-box"></div>
    </div>
    <div style="flex:1">
      <div class="sec-title">Valores</div>
      <div class="field">
        <label class="field-label">Orcamento (R$)</label>
        <div class="field-line"></div>
      </div>
      <div class="field">
        <label class="field-label">Valor Final (R$)</label>
        <div class="field-line"></div>
      </div>
    </div>
  </div>

  <!-- Warning -->
  <div class="warning-strip">
    <div class="warning-text">
      <strong>AVISO:</strong> Equipamentos devem ser retirados em ate 30 dias corridos apos conclusao do servico. Apos este prazo sera cobrada taxa de armazenamento diaria. Nao nos responsabilizamos por itens nao mencionados nesta ficha.
    </div>
  </div>

  <!-- Signatures -->
  <div class="signatures">
    <div class="sig-box">
      <div class="sig-label">Assinatura do Cliente</div>
    </div>
    <div class="sig-box">
      <div class="sig-label">Responsavel pelo Recebimento</div>
    </div>
  </div>

  <div class="footer-note">
    Esta ficha deve ser grampeada ou fixada ao equipamento para identificacao interna &mdash; ${appName}
  </div>

  <script>window.onload = () => { window.print(); setTimeout(() => window.close(), 500); }</script>
</body>
</html>`;

  return content;
};

export const printBlankForm = (settings: AppSettings) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  printWindow.document.write(getBlankFormLayout(settings));
  printWindow.document.close();
};
