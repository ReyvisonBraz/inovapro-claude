import html2pdf from 'html2pdf.js';

export interface PDFExportOptions {
  companyName: string;
  reportPeriod: string;
}

export const generatePDF = async (
  element: HTMLElement,
  options: PDFExportOptions
): Promise<void> => {
  const { companyName, reportPeriod } = options;

  const header = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #1152d4;">
      <div>
        <h1 style="margin: 0; font-size: 24px; color: #1152d4; font-weight: 800;">${companyName}</h1>
        <p style="margin: 5px 0 0 0; font-size: 12px; color: #64748b;">Relatório Financeiro</p>
      </div>
      <div style="text-align: right;">
        <p style="margin: 0; font-size: 14px; color: #1e293b; font-weight: 600;">${reportPeriod}</p>
        <p style="margin: 5px 0 0 0; font-size: 10px; color: #64748b;" id="pdf-date"></p>
      </div>
    </div>
  `;

  const footer = document.createElement('div');
  footer.style.cssText = 'position: fixed; bottom: 10px; left: 0; right: 0; text-align: center; font-size: 10px; color: #64748b; padding-top: 10px; border-top: 1px solid #e2e8f0;';
  footer.textContent = `Gerado em: ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`;

  const contentClone = element.cloneNode(true) as HTMLElement;
  contentClone.style.background = '#ffffff';
  contentClone.style.padding = '20px';
  contentClone.querySelectorAll('.glass-card').forEach(card => {
    (card as HTMLElement).style.background = '#f8fafc';
    (card as HTMLElement).style.border = '1px solid #e2e8f0';
    (card as HTMLElement).style.borderRadius = '12px';
    (card as HTMLElement).style.boxShadow = 'none';
  });

  const wrapper = document.createElement('div');
  wrapper.innerHTML = header;
  wrapper.appendChild(contentClone);
  wrapper.appendChild(footer);

  const pdfDateEl = wrapper.querySelector('#pdf-date') as HTMLElement;
  if (pdfDateEl) {
    pdfDateEl.textContent = `Gerado em: ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`;
  }

  const opt = {
    margin: 10,
    filename: `relatorio-financeiro-${new Date().toISOString().split('T')[0]}.pdf`,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: { 
      scale: 2, 
      useCORS: true,
      logging: false
    },
    jsPDF: { 
      unit: 'mm', 
      format: 'a4', 
      orientation: 'landscape' as const 
    },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };

  try {
    await html2pdf().set(opt).from(wrapper).save();
  } finally {
    wrapper.remove();
  }
};