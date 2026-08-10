import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, ExternalLink } from 'lucide-react';
import { getA4EnhancedLayout, getA5Layout, getThermalLayout, PrintData } from '../components/service-orders/modals/printLayouts';
import { getBlankFormLayout, QR_BASE, stripScript } from '../lib/printUtils';
import { formatCurrency } from '../lib/utils';

const SAMPLE: PrintData = {
  osNumber: '#OS-0042',
  date: '19/05/2026',
  dateFull: '19 de maio de 2026',
  technician: 'João Silva',
  customer: {
    firstName: 'Maria',
    lastName: 'Oliveira',
    phone: '(11) 98765-4321',
    cpf: '123.456.789-00',
  },
  selectedOrder: {
    id: 42,
    status: 'Em Manutenção',
    equipmentType: 'Smartphone',
    equipmentBrand: 'Samsung',
    equipmentModel: 'Galaxy S22',
    equipmentSerial: 'SN98765432',
    equipmentColor: 'Preto Phantom',
    customerPassword: '1234',
    accessories: 'Capinha, carregador',
    reportedProblem: 'Tela quebrada e não liga após queda acidental. Cliente relata que o aparelho parou de funcionar completamente após a queda.',
    technicalAnalysis: 'Verificado dano no conector de carga e trinca na tela. Placa aparentemente íntegra após teste de bancada.',
    servicesPerformed: 'Substituição do display original (AMOLED) + troca do conector de carga USB-C + limpeza interna.',
    checklistIn: [
      { label: 'Tela sem avarias adicionais', done: true },
      { label: 'Acessórios recebidos', value: 'Capinha e carregador', done: true },
    ],
    checklistOut: [
      { label: 'Carregamento testado', done: true },
      { label: 'Teste final do aparelho', value: 'Aprovado', done: true },
    ],
    warranties: [
      { id: 1, serviceOrderId: 42, itemName: 'Substituição do display AMOLED', itemType: 'service', warrantyMonths: 3, expiresAt: '2026-08-19T00:00:00.000Z' },
      { id: 2, serviceOrderId: 42, itemName: 'Display Samsung Galaxy S22 AMOLED', itemType: 'part', warrantyMonths: 3, expiresAt: '2026-08-19' },
    ],
    partsUsed: [
      { name: 'Display Samsung Galaxy S22 AMOLED', quantity: 1, unitPrice: 420, subtotal: 420 },
      { name: 'Conector de carga USB-C', quantity: 1, unitPrice: 35, subtotal: 35 },
      { name: 'Pasta térmica profissional', quantity: 1, unitPrice: 20, subtotal: 20 },
    ],
    totalAmount: 575,
    serviceFee: 100,
    finalObservations: 'Garantia de 90 dias para peças e serviço. Testar carregamento antes de retirar.',
    ramInfo: null,
    ssdInfo: null,
  },
  equipmentDisplay: 'Smartphone Samsung Galaxy S22',
  customerQrImg: `${QR_BASE}${encodeURIComponent('https://inovapro.app/rastreio?osId=42')}`,
  techQrImg: `${QR_BASE}${encodeURIComponent('https://inovapro.app/os/42')}`,
  printType: 'complete',
  formatCurrency,
};

const MOCK_SETTINGS: any = { appName: 'INOVA PRO', receiptLogo: null };

interface PreviewFrameProps {
  html: string;
  nativeW: number;
  nativeH: number;
  scale: number;
}

function PreviewFrame({ html, nativeW, nativeH, scale }: PreviewFrameProps) {
  const ref = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.srcdoc = stripScript(html);
  }, [html]);

  return (
    <div
      className="rounded overflow-hidden mx-auto"
      style={{
        width: Math.round(nativeW * scale),
        height: Math.round(nativeH * scale),
        boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
        background: '#fff',
        flexShrink: 0,
      }}
    >
      <iframe
        ref={ref}
        title="preview"
        style={{
          width: nativeW,
          height: nativeH,
          border: 'none',
          transformOrigin: '0 0',
          transform: `scale(${scale})`,
          pointerEvents: 'none',
          display: 'block',
        }}
      />
    </div>
  );
}

interface CardProps {
  label: string;
  tag: string;
  desc: string;
  color: string;
  html: string;
  nativeW: number;
  nativeH: number;
  scale: number;
}

function PrintCard({ label, tag, desc, color, html, nativeW, nativeH, scale }: CardProps) {
  const open = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(html);
    w.document.close();
  };

  return (
    <div className="glass-card flex flex-col overflow-hidden">
      {/* Card header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <span
            className="h-2 w-2 rounded-full shrink-0"
            style={{ backgroundColor: color }}
          />
          <div>
            <p className="font-black text-white text-sm leading-tight">{label}</p>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5">{desc}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest"
            style={{ background: `${color}15`, color: color, border: `1px solid ${color}30` }}
          >
            {tag}
          </span>
          <button
            onClick={open}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-[10px] font-bold hover:bg-primary/90 transition-all active:scale-95 ml-2"
            title="Abrir e imprimir"
          >
            <Printer size={12} />
            Imprimir
          </button>
          <button
            onClick={open}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            title="Abrir em nova aba"
          >
            <ExternalLink size={14} />
          </button>
        </div>
      </div>

      {/* Preview area */}
      <div className="flex items-center justify-center p-6 bg-slate-900/50 min-h-0">
        <PreviewFrame html={html} nativeW={nativeW} nativeH={nativeH} scale={scale} />
      </div>
    </div>
  );
}

export const PrintPreviewPage: React.FC = () => {
  const navigate = useNavigate();

  const a4Complete = getA4EnhancedLayout(SAMPLE);
  const a4Simple = getA4EnhancedLayout({ ...SAMPLE, printType: 'simplified' });
  const a5Html = getA5Layout(SAMPLE);
  const thermalHtml = getThermalLayout(SAMPLE);
  const blankHtml = getBlankFormLayout(MOCK_SETTINGS);

  // Native pixel sizes (96dpi) matching the CSS body dimensions
  // A4 landscape: 285mm × 200mm  →  1077px × 756px
  // A5 portrait:  140mm × 202mm  →   529px × 763px
  // Thermal:       72mm wide     →   272px wide, ~680px tall
  // Blank A4:     190mm wide     →   718px wide, ~1060px tall

  return (
    <div className="min-h-screen bg-bg-dark">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-bg-dark/95 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors p-1"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-base font-black text-white">Pré-visualização de Impressão</h1>
          <p className="text-[11px] text-slate-500 font-medium">
            Dados de exemplo — OS #0042 · Maria Oliveira · Samsung Galaxy S22
          </p>
        </div>
      </div>

      <div className="p-6 space-y-6">

        {/* A4 Completa */}
        <PrintCard
          label="A4 Aprimorado — Completo"
          tag="A4 Paisagem"
          desc="2 vias lado a lado com análise técnica, serviços, peças e valor total"
          color="#3b82f6"
          html={a4Complete}
          nativeW={1077}
          nativeH={756}
          scale={0.52}
        />

        {/* A4 Simplificado */}
        <PrintCard
          label="A4 Aprimorado — Simplificado"
          tag="A4 Paisagem"
          desc="2 vias lado a lado apenas com equipamento e problema relatado"
          color="#8b5cf6"
          html={a4Simple}
          nativeW={1077}
          nativeH={756}
          scale={0.52}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* A5 */}
          <PrintCard
            label="A5 Compacto"
            tag="A5 Retrato"
            desc="2 metades empilhadas — cliente (cima) e técnico (baixo)"
            color="#10b981"
            html={a5Html}
            nativeW={529}
            nativeH={763}
            scale={0.72}
          />

          {/* Térmica */}
          <PrintCard
            label="Térmica 80mm"
            tag="80mm"
            desc="Comprovante compacto para impressora térmica do cliente"
            color="#f59e0b"
            html={thermalHtml}
            nativeW={272}
            nativeH={680}
            scale={0.90}
          />
        </div>

        {/* Ficha em Branco */}
        <PrintCard
          label="Ficha em Branco"
          tag="A4 Retrato"
          desc="Formulário para preenchimento manual — entrada de equipamento"
          color="#f43f5e"
          html={blankHtml}
          nativeW={718}
          nativeH={1062}
          scale={0.52}
        />
      </div>
    </div>
  );
};
