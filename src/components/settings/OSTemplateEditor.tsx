import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  DndContext, closestCenter, DragEndEvent,
  useSensor, useSensors, PointerSensor,
} from '@dnd-kit/core';
import {
  SortableContext, useSortable, verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical, Eye, EyeOff, RotateCcw, Save, Printer,
} from 'lucide-react';
import { AppSettings, OSSection, OSTemplateConfig } from '../../types';
import { parseOSTemplateConfig, DEFAULT_OS_TEMPLATE_CONFIG } from '../../lib/osTemplateConfig';
import { getA4EnhancedLayout } from '../service-orders/modals/printLayouts';

// ─── Sample data for live preview ────────────────────────────────────────────
const fmt = (v: number) => `R$ ${v.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
const QR_BASE = 'https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=';

const SAMPLE_DATA = {
  osNumber: '#OS-0042',
  date: '19/05/2026',
  dateFull: '19 de maio de 2026',
  technician: 'João Silva',
  customer: { firstName: 'Maria', lastName: 'Oliveira', phone: '(11) 98765-4321', cpf: '123.456.789-00' },
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
    reportedProblem: 'Tela quebrada e não liga após queda acidental.',
    technicalAnalysis: 'Verificado dano no conector de carga e trinca na tela.',
    servicesPerformed: 'Substituição do display original (AMOLED) + troca do conector USB-C.',
    partsUsed: [
      { name: 'Display Samsung Galaxy S22', quantity: 1, unitPrice: 420, subtotal: 420 },
      { name: 'Conector USB-C', quantity: 1, unitPrice: 35, subtotal: 35 },
    ],
    totalAmount: 555,
    serviceFee: 100,
    finalObservations: 'Garantia de 90 dias para peças e serviço.',
    ramInfo: null,
    ssdInfo: null,
  },
  equipmentDisplay: 'Smartphone Samsung Galaxy S22',
  customerQrImg: `${QR_BASE}${encodeURIComponent('https://inovapro.app/rastreio?osId=42')}`,
  techQrImg: `${QR_BASE}${encodeURIComponent('https://inovapro.app/os/42')}`,
  printType: 'complete' as const,
  formatCurrency: fmt,
};

function stripScript(html: string): string {
  return html.replace(/<script[\s\S]*?<\/script>/gi, '');
}

// ─── Sortable section row ─────────────────────────────────────────────────────
function SortableSection({
  section,
  onToggle,
}: {
  section: OSSection;
  onToggle: (id: OSSection['id']) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 group"
    >
      <button
        {...attributes}
        {...listeners}
        className="text-slate-600 hover:text-slate-400 cursor-grab active:cursor-grabbing flex-shrink-0"
        tabIndex={-1}
      >
        <GripVertical size={15} />
      </button>
      <span className={`flex-1 text-sm font-bold truncate ${section.visible ? 'text-slate-200' : 'text-slate-600 line-through'}`}>
        {section.label}
      </span>
      <button
        onClick={() => onToggle(section.id)}
        className={`flex-shrink-0 transition-colors ${section.visible ? 'text-primary hover:text-primary/70' : 'text-slate-600 hover:text-slate-400'}`}
        title={section.visible ? 'Ocultar seção' : 'Mostrar seção'}
      >
        {section.visible ? <Eye size={15} /> : <EyeOff size={15} />}
      </button>
    </div>
  );
}

// ─── Color input ──────────────────────────────────────────────────────────────
function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-shrink-0">
        <input
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-9 h-9 rounded-lg cursor-pointer border border-white/10 bg-transparent p-0.5"
          title={label}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">{label}</p>
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full h-7 bg-white/5 border border-white/10 rounded-lg px-2 text-xs font-mono font-bold focus:ring-1 focus:ring-primary outline-none"
        />
      </div>
    </div>
  );
}

// ─── Toggle row ───────────────────────────────────────────────────────────────
function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm font-bold text-slate-300">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`w-10 h-5 rounded-full relative transition-all flex-shrink-0 ${checked ? 'bg-primary' : 'bg-slate-700'}`}
      >
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${checked ? 'left-5' : 'left-0.5'}`} />
      </button>
    </div>
  );
}

// ─── Live preview frame ───────────────────────────────────────────────────────
function PreviewFrame({ html }: { html: string }) {
  const ref = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.srcdoc = html;
  }, [html]);

  const NW = 1078, NH = 756, SCALE = 0.45;

  return (
    <div
      className="rounded-lg overflow-hidden mx-auto"
      style={{
        width: Math.round(NW * SCALE),
        height: Math.round(NH * SCALE),
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        background: '#fff',
        flexShrink: 0,
      }}
    >
      <iframe
        ref={ref}
        title="preview"
        style={{
          width: NW,
          height: NH,
          border: 'none',
          transformOrigin: '0 0',
          transform: `scale(${SCALE})`,
          pointerEvents: 'none',
          display: 'block',
        }}
      />
    </div>
  );
}

// ─── Main editor ─────────────────────────────────────────────────────────────
interface Props {
  settings: AppSettings;
  onUpdateSettings: (s: Partial<AppSettings>) => void;
}

const FONT_OPTIONS = [
  { label: 'Segoe UI (padrão)', value: "'Segoe UI', Arial, sans-serif" },
  { label: 'Arial',             value: 'Arial, sans-serif' },
  { label: 'Georgia',           value: 'Georgia, serif' },
  { label: 'Courier New',       value: "'Courier New', monospace" },
  { label: 'Trebuchet MS',      value: "'Trebuchet MS', sans-serif" },
];

export const OSTemplateEditor: React.FC<Props> = ({ settings, onUpdateSettings }) => {
  const [config, setConfig] = useState<OSTemplateConfig>(() =>
    parseOSTemplateConfig(settings.osPrintConfig)
  );
  const [saved, setSaved] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const previewHtml = useMemo(() =>
    stripScript(getA4EnhancedLayout({ ...SAMPLE_DATA, config })),
    [config]
  );

  const updateSections = (sections: OSSection[]) =>
    setConfig(c => ({ ...c, sections }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = config.sections.findIndex(s => s.id === active.id);
    const newIdx = config.sections.findIndex(s => s.id === over.id);
    updateSections(arrayMove(config.sections, oldIdx, newIdx));
  };

  const toggleSection = (id: OSSection['id']) => {
    updateSections(config.sections.map(s => s.id === id ? { ...s, visible: !s.visible } : s));
  };

  const handleSave = () => {
    onUpdateSettings({ osPrintConfig: JSON.stringify(config) });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setConfig(DEFAULT_OS_TEMPLATE_CONFIG);
  };

  const handlePrintSample = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(getA4EnhancedLayout({ ...SAMPLE_DATA, config }));
    w.document.close();
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6">

      {/* ── Left panel ── */}
      <div className="w-full xl:w-72 space-y-5 flex-shrink-0">

        {/* Sections */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">
            Seções — arrastar para reordenar
          </p>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext
              items={config.sections.map(s => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-1.5">
                {config.sections.map(s => (
                  <SortableSection key={s.id} section={s} onToggle={toggleSection} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        <div className="border-t border-white/5 pt-5 space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Cores</p>
          <ColorField
            label="Cor Principal (fundo dos cabeçalhos)"
            value={config.primaryColor}
            onChange={v => setConfig(c => ({ ...c, primaryColor: v }))}
          />
          <ColorField
            label="Cor de Destaque (títulos das seções)"
            value={config.accentColor}
            onChange={v => setConfig(c => ({ ...c, accentColor: v }))}
          />
        </div>

        <div className="border-t border-white/5 pt-5 space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Tipografia</p>
          <select
            value={config.fontFamily}
            onChange={e => setConfig(c => ({ ...c, fontFamily: e.target.value }))}
            className="w-full h-10 bg-white/5 border border-white/10 rounded-xl px-3 text-sm font-bold focus:ring-1 focus:ring-primary outline-none text-slate-200 [&>option]:bg-slate-900"
          >
            {FONT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="border-t border-white/5 pt-5 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Rodapé e Extras</p>
          <ToggleRow label="QR Code do Técnico"     checked={config.showQrTech}    onChange={v => setConfig(c => ({ ...c, showQrTech: v }))} />
          <ToggleRow label="QR Code do Cliente"     checked={config.showQrClient}  onChange={v => setConfig(c => ({ ...c, showQrClient: v }))} />
          <ToggleRow label="Aviso de Retirada (30d)" checked={config.showWarning}   onChange={v => setConfig(c => ({ ...c, showWarning: v }))} />
        </div>

        {/* Actions */}
        <div className="border-t border-white/5 pt-5 flex flex-col gap-2">
          <button
            onClick={handleSave}
            className={`w-full h-10 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              saved
                ? 'bg-emerald-500 text-white'
                : 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20'
            }`}
          >
            <Save size={15} />
            {saved ? 'Salvo!' : 'Salvar Template'}
          </button>
          <div className="flex gap-2">
            <button
              onClick={handlePrintSample}
              className="flex-1 h-9 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/10 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <Printer size={13} />
              Imprimir Exemplo
            </button>
            <button
              onClick={handleReset}
              className="flex-1 h-9 rounded-xl bg-white/5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-white/10 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
              title="Restaurar configurações padrão"
            >
              <RotateCcw size={13} />
              Restaurar
            </button>
          </div>
        </div>
      </div>

      {/* ── Right panel — live preview ── */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Pré-visualização — A4 Paisagem (dados de exemplo)
          </p>
        </div>
        <div className="bg-slate-900/50 rounded-2xl p-4 flex items-start justify-center min-h-[360px]">
          <PreviewFrame html={previewHtml} />
        </div>
        <p className="text-[10px] text-slate-600 text-center mt-2 font-medium">
          As alterações aparecem em tempo real · O template salvo é aplicado em todas as impressões de OS
        </p>
      </div>

    </div>
  );
};
