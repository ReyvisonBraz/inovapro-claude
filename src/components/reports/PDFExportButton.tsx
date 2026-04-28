import React, { useState } from 'react';
import { generatePDF } from '../../lib/pdfExporter';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useFilterStore } from '../../store/useFilterStore';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PDFExportButtonProps {
  reportElementId: string;
}

export const PDFExportButton: React.FC<PDFExportButtonProps> = ({ reportElementId }) => {
  const [loading, setLoading] = useState(false);
  const { settings } = useSettingsStore();
  const { reportStartDate, reportEndDate, reportMonth } = useFilterStore();

  const handleExport = async () => {
    const element = document.getElementById(reportElementId);
    if (!element) return;

    setLoading(true);
    try {
      const period = reportMonth
        ? format(parseISO(`${reportMonth}-01`), 'MMMM yyyy', { locale: ptBR })
        : `${format(parseISO(reportStartDate), 'dd/MM/yyyy')} - ${format(parseISO(reportEndDate), 'dd/MM/yyyy')}`;

      await generatePDF(element, {
        companyName: settings.profileName || settings.appName,
        reportPeriod: period
      });
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      alert('Erro ao exportar PDF. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-primary/20"
    >
      {loading ? (
        <>
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Exportando...
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Exportar PDF
        </>
      )}
    </button>
  );
};