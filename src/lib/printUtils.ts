import { AppSettings } from '../types';

export const printBlankForm = (settings: AppSettings) => {
  console.log("Directly triggering print via new window...");
  
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const content = `
    <html>
      <head>
        <title>Ficha em Branco - ${settings.appName || 'FinanceFlow'}</title>
        <style>
          @page { size: A4 portrait; margin: 0; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            padding: 0; 
            color: #000; 
            background: #fff; 
            margin: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
            height: 100vh;
          }
          .form-container { 
            width: 210mm; 
            height: 148mm; 
            border-bottom: 2px dashed #000; 
            padding: 30px 40px; 
            box-sizing: border-box;
            background: #fff;
            overflow: hidden;
          }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #000; padding-bottom: 15px; margin-bottom: 25px; }
          .header-left { display: flex; align-items: center; gap: 20px; }
          .logo { max-height: 60px; max-width: 120px; object-fit: contain; }
          .title h1 { margin: 0; font-size: 32px; font-weight: 900; text-transform: uppercase; line-height: 1; }
          .title p { margin: 5px 0 0 0; font-size: 13px; font-weight: 800; color: #374151; text-transform: uppercase; letter-spacing: 1.5px; }
          .entry-date { text-align: right; }
          .entry-date p { margin: 0; font-size: 11px; font-weight: 800; color: #4b5563; text-transform: uppercase; }
          .date-line { width: 130px; height: 26px; border-bottom: 2px solid #000; margin-top: 4px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 25px; }
          .section-title { font-size: 14px; font-weight: 900; text-transform: uppercase; letter-spacing: 1.2px; border-bottom: 2px solid #000; padding-bottom: 4px; margin-bottom: 12px; }
          .field { margin-bottom: 12px; }
          .field label { display: block; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #374151; margin-bottom: 3px; }
          .field-line { width: 100%; height: 22px; border-bottom: 1px solid #9ca3af; }
          .field-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
          .problem-section { margin-bottom: 25px; }
          .problem-box { width: 100%; height: 70px; border: 2px solid #e5e7eb; border-radius: 8px; }
          .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 50px; margin-top: 45px; }
          .sig-box { border-top: 2px solid #000; text-align: center; padding-top: 6px; }
          .sig-box p { margin: 0; font-size: 11px; font-weight: 800; text-transform: uppercase; }
          .footer-note { margin-top: 20px; text-align: center; font-size: 9px; color: #6b7280; font-style: italic; text-transform: uppercase; letter-spacing: 1.2px; }
        </style>
      </head>
      <body>
        <div class="form-container">
          <div class="header">
            <div class="header-left">
              ${settings.receiptLogo ? `<img src="${settings.receiptLogo}" class="logo" />` : ''}
              <div class="title">
                <h1>${settings.appName || 'FinanceFlow Inc.'}</h1>
                <p>Ficha de Entrada de Equipamento</p>
              </div>
            </div>
            <div class="entry-date">
              <p>Data de Entrada</p>
              <div class="date-line"></div>
            </div>
          </div>
          <div class="grid">
            <div class="section">
              <div class="section-title">Dados do Cliente</div>
              <div class="field">
                <label>Nome Completo</label>
                <div class="field-line"></div>
              </div>
              <div class="field-grid">
                <div class="field">
                  <label>Telefone / WhatsApp</label>
                  <div class="field-line"></div>
                </div>
                <div class="field">
                  <label>CPF / CNPJ</label>
                  <div class="field-line"></div>
                </div>
              </div>
              <div class="field">
                <label>Endereço</label>
                <div class="field-line"></div>
              </div>
            </div>
            <div class="section">
              <div class="section-title">Dados do Equipamento</div>
              <div class="field-grid">
                <div class="field">
                  <label>Marca</label>
                  <div class="field-line"></div>
                </div>
                <div class="field">
                  <label>Modelo</label>
                  <div class="field-line"></div>
                </div>
              </div>
              <div class="field-grid">
                <div class="field">
                  <label>Nº de Série</label>
                  <div class="field-line"></div>
                </div>
                <div class="field">
                  <label>Cor / Acessórios</label>
                  <div class="field-line"></div>
                </div>
              </div>
              <div class="field">
                <label>Senha do Equipamento</label>
                <div class="field-line"></div>
              </div>
            </div>
          </div>
          <div class="problem-section">
            <div class="section-title">Relato do Problema / Defeito</div>
            <div class="problem-box"></div>
          </div>
          <div class="signatures">
            <div class="sig-box">
              <p>Assinatura do Cliente</p>
            </div>
            <div class="sig-box">
              <p>Responsável pelo Recebimento</p>
            </div>
          </div>
          <div class="footer-note">
            Esta ficha deve ser grampeada ou fixada ao equipamento para identificação interna.
          </div>
        </div>
        <script>window.onload = () => { window.print(); setTimeout(() => window.close(), 500); }</script>
      </body>
    </html>
  `;

  printWindow.document.write(content);
  printWindow.document.close();
};
