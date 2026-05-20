import { AppSettings } from '../types';

export const QR_BASE = 'https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=';

export function stripScript(html: string): string {
  return html.replace(/<script[\s\S]*?<\/script>/gi, '');
}

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
      font-size: 11px;
      line-height: 1.5;
    }

    /* ── Header ──────────────────────────────── */
    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 12px;
      margin-bottom: 18px;
      border-bottom: 2.5px solid #0f2d52;
    }
    .logo-wrap { display: flex; align-items: center; gap: 12px; }
    .logo { height: 56px; width: auto; object-fit: contain; }
    .logo-text { font-size: 22px; font-weight: 900; color: #0f2d52; letter-spacing: -.5px; }
    .company-title { font-size: 15px; font-weight: 900; color: #0f2d52; text-transform: uppercase; letter-spacing: .5px; }
    .company-sub { font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1.2px; margin-top: 2px; }
    .header-right { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
    .os-box {
      border: 2px solid #0f2d52;
      border-radius: 6px;
      padding: 6px 14px;
      min-width: 110px;
    }
    .os-label { font-size: 8.5px; font-weight: 800; text-transform: uppercase; color: #64748b; letter-spacing: 1px; margin-bottom: 4px; }
    .os-line { height: 24px; border-bottom: 1.5px solid #0f2d52; }
    .date-row { display: flex; align-items: center; gap: 8px; }
    .date-label { font-size: 8.5px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: .7px; white-space: nowrap; }
    .date-line { width: 110px; height: 22px; border-bottom: 1.5px solid #0f2d52; }

    /* ── Section titles ──────────────────────── */
    .sec-title {
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #1d4ed8;
      padding: 4px 0 5px;
      border-bottom: 2px solid #bfdbfe;
      margin-bottom: 12px;
    }

    /* ── Main grid ───────────────────────────── */
    .main-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0 22px;
      margin-bottom: 18px;
    }

    /* ── Field ───────────────────────────────── */
    .field { margin-bottom: 12px; }
    .field-label {
      display: block;
      font-size: 8.5px;
      font-weight: 700;
      text-transform: uppercase;
      color: #64748b;
      letter-spacing: .5px;
      margin-bottom: 3px;
    }
    .field-line {
      width: 100%;
      height: 30px;
      border-bottom: 1.5px solid #94a3b8;
    }
    .field-pair {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0 12px;
    }
    .field-trio {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 0 10px;
    }

    /* ── Accessories row ─────────────────────── */
    .accessories-row {
      margin-bottom: 12px;
    }
    .accessories-label {
      display: block;
      font-size: 8.5px;
      font-weight: 700;
      text-transform: uppercase;
      color: #64748b;
      letter-spacing: .5px;
      margin-bottom: 6px;
    }
    .check-row {
      display: flex;
      flex-wrap: wrap;
      gap: 6px 16px;
    }
    .check-item {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 9.5px;
      font-weight: 600;
      color: #334155;
    }
    .check-box {
      width: 13px;
      height: 13px;
      border: 1.5px solid #94a3b8;
      border-radius: 2px;
      flex-shrink: 0;
    }
    .outros-wrap {
      display: flex;
      align-items: center;
      gap: 6px;
      flex: 1;
      min-width: 120px;
    }
    .outros-line {
      flex: 1;
      height: 18px;
      border-bottom: 1.5px solid #94a3b8;
    }

    /* ── Text area boxes ─────────────────────── */
    .text-box {
      width: 100%;
      border: 1.5px solid #e2e8f0;
      border-radius: 5px;
      background: #f8fafc;
    }
    .problem-box { height: 110px; }
    .services-box { height: 90px; }

    /* ── Services + Values row ───────────────── */
    .sv-row {
      display: flex;
      gap: 18px;
      margin-bottom: 18px;
      align-items: flex-start;
    }
    .sv-services { flex: 2; }
    .sv-values { flex: 1; }
    .values-grid { display: grid; gap: 10px; }
    .value-field { }
    .value-label {
      font-size: 8.5px;
      font-weight: 700;
      text-transform: uppercase;
      color: #64748b;
      letter-spacing: .5px;
      display: block;
      margin-bottom: 3px;
    }
    .value-line {
      width: 100%;
      height: 30px;
      border-bottom: 1.5px solid #0f2d52;
    }
    .value-note {
      font-size: 8px;
      color: #94a3b8;
      font-style: italic;
      margin-top: 8px;
    }

    /* ── Warning strip ───────────────────────── */
    .warning-strip {
      background: #fff7ed;
      border-left: 4px solid #f97316;
      padding: 8px 12px;
      border-radius: 0 5px 5px 0;
      margin-bottom: 18px;
    }
    .warning-text {
      font-size: 8.5px;
      font-weight: 700;
      color: #7c2d12;
      line-height: 1.6;
    }

    /* ── Signatures ──────────────────────────── */
    .signatures {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0 50px;
      margin-top: 8px;
    }
    .sig-box {
      padding-top: 6px;
      border-top: 1.5px solid #1e293b;
      text-align: center;
    }
    .sig-label {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      color: #475569;
      letter-spacing: .6px;
    }
    .sig-sub {
      font-size: 8px;
      color: #94a3b8;
      margin-top: 2px;
    }

    /* ── Footer ──────────────────────────────── */
    .footer-note {
      margin-top: 14px;
      text-align: center;
      font-size: 8px;
      color: #94a3b8;
      font-style: italic;
      letter-spacing: .5px;
    }
  </style>
</head>
<body>

  <!-- Header -->
  <div class="page-header">
    <div class="logo-wrap">
      ${logoHtml}
      <div>
        <div class="company-title">${appName}</div>
        <div class="company-sub">Ficha de Entrada de Equipamento</div>
      </div>
    </div>
    <div class="header-right">
      <div class="os-box">
        <div class="os-label">N&ordm; da OS</div>
        <div class="os-line"></div>
      </div>
      <div class="date-row">
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
        <label class="field-label">Endere&ccedil;o</label>
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
          <label class="field-label">N&ordm; de S&eacute;rie / IMEI</label>
          <div class="field-line"></div>
        </div>
      </div>
      <div class="field-pair">
        <div class="field">
          <label class="field-label">Cor</label>
          <div class="field-line"></div>
        </div>
        <div class="field">
          <label class="field-label">Senha / PIN</label>
          <div class="field-line"></div>
        </div>
      </div>
      <div class="accessories-row">
        <span class="accessories-label">Acess&oacute;rios entregues</span>
        <div class="check-row">
          <label class="check-item"><div class="check-box"></div> Carregador</label>
          <label class="check-item"><div class="check-box"></div> Capinha</label>
          <label class="check-item"><div class="check-box"></div> Fone</label>
          <label class="check-item"><div class="check-box"></div> Cabo USB</label>
          <label class="check-item"><div class="check-box"></div> Caixa</label>
          <div class="outros-wrap">
            <span class="check-item" style="white-space:nowrap"><div class="check-box"></div> Outros:</span>
            <div class="outros-line"></div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Problem reported -->
  <div style="margin-bottom:18px;">
    <div class="sec-title">Relato do Problema / Defeito</div>
    <div class="text-box problem-box"></div>
  </div>

  <!-- Services + Values -->
  <div class="sv-row">
    <div class="sv-services">
      <div class="sec-title">Servi&ccedil;os / Observa&ccedil;&otilde;es T&eacute;cnicas</div>
      <div class="text-box services-box"></div>
    </div>
    <div class="sv-values">
      <div class="sec-title">Valores</div>
      <div class="values-grid">
        <div class="value-field">
          <label class="value-label">Or&ccedil;amento (R$)</label>
          <div class="value-line"></div>
        </div>
        <div class="value-field">
          <label class="value-label">Valor Final (R$)</label>
          <div class="value-line"></div>
        </div>
        <div class="value-field">
          <label class="value-label">Forma de Pagamento</label>
          <div class="value-line"></div>
        </div>
      </div>
      <div class="value-note">* Or&ccedil;amento sujeito a altera&ccedil;&atilde;o ap&oacute;s an&aacute;lise</div>
    </div>
  </div>

  <!-- Warning -->
  <div class="warning-strip">
    <div class="warning-text">
      <strong>AVISO:</strong> Equipamentos devem ser retirados em at&eacute; 30 dias corridos ap&oacute;s conclus&atilde;o do servi&ccedil;o.
      Ap&oacute;s este prazo ser&aacute; cobrada taxa de armazenamento di&aacute;ria. N&atilde;o nos responsabilizamos por
      itens n&atilde;o mencionados nesta ficha nem por danos preexistentes ao equipamento.
    </div>
  </div>

  <!-- Signatures -->
  <div class="signatures">
    <div class="sig-box">
      <div class="sig-label">Assinatura do Cliente</div>
      <div class="sig-sub">Declaro estar ciente das condi&ccedil;&otilde;es acima</div>
    </div>
    <div class="sig-box">
      <div class="sig-label">Respons&aacute;vel pelo Recebimento</div>
      <div class="sig-sub">Nome e assinatura do t&eacute;cnico</div>
    </div>
  </div>

  <div class="footer-note">
    Esta ficha deve ser grampeada ou fixada ao equipamento para identifica&ccedil;&atilde;o interna &mdash; ${appName}
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
