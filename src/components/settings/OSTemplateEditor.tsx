import React, { useState, useMemo, useDeferredValue, useRef } from 'react';
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
  ChevronDown, ChevronUp, Info,
} from 'lucide-react';
import { AppSettings, OSSection, OSLayoutConfig, OSPrintTemplateConfig } from '../../types';
import {
  parseOSPrintTemplateConfig,
  DEFAULT_OS_PRINT_TEMPLATE_CONFIG,
  PLACEHOLDER_GROUPS,
  TEMPLATE_CAPABLE_IDS,
  LAYOUT_REGISTRY,
  LayoutRegistryKey,
} from '../../lib/osTemplateConfig';
import { getA4EnhancedLayout, getA5Layout, getThermalLayout } from '../service-orders/modals/printLayouts';
import { getBlankFormLayout, QR_BASE, stripScript } from '../../lib/printUtils';
import { formatCurrency } from '../../lib/utils';
import { useToast } from '../ui/Toast';

// ─── Sample data for live preview ────────────────────────────────────────────
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
      { name: 'Conector USB-C',             quantity: 1, unitPrice: 35,  subtotal: 35 },
    ],
    totalAmount: 555,
    serviceFee: 100,
    finalObservations: 'Garantia de 90 dias para peças e serviço.',
    ramInfo: null,
    ssdInfo: null,
  },
  equipmentDisplay: 'Smartphone Samsung Galaxy S22',
  customerQrImg: `${QR_BASE}${encodeURIComponent('https://inovapro.app/rastreio?osId=42')}`,
  techQrImg:     `${QR_BASE}${encodeURIComponent('https://inovapro.app/os/42')}`,
  printType: 'complete' as const,
  formatCurrency,
};

// ─── Derived layout tabs from registry ────────────────────────────────────────
const LAYOUT_TABS = (Object.keys(LAYOUT_REGISTRY) as LayoutRegistryKey[]).map(id => ({
  id,
  label: LAYOUT_REGISTRY[id].label,
  tag:   LAYOUT_REGISTRY[id].tag,
  color: LAYOUT_REGISTRY[id].color,
}));

type LayoutTab = LayoutRegistryKey;
type ConfigurableLayout = Exclude<LayoutTab, 'blank'>;

const FONT_OPTIONS = [
  { label: 'Segoe UI (padrão)', value: "'Segoe UI', Arial, sans-serif" },
  { label: 'Arial',             value: 'Arial, sans-serif' },
  { label: 'Georgia',           value: 'Georgia, serif' },
  { label: 'Courier New',       value: "'Courier New', monospace" },
  { label: 'Trebuchet MS',      value: "'Trebuchet MS', sans-serif" },
];

// ─── Hook: restore cursor position after template state updates ───────────────
function useTextareaCursor(ref: React.RefObject<HTMLTextAreaElement | null>) {
  const posRef = useRef<number | null>(null);

  const scheduleRestore = (pos: number) => { posRef.current = pos; };

  React.useEffect(() => {
    if (posRef.current !== null && ref.current) {
      const pos = posRef.current;
      ref.current.selectionStart = pos;
      ref.current.selectionEnd   = pos;
      ref.current.focus();
      posRef.current = null;
    }
  });

  return scheduleRestore;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PreviewFrame({ html, nW, nH, scale }: { html: string; nW: number; nH: number; scale: number }) {
  const ref = useRef<HTMLIFrameElement>(null);
  React.useEffect(() => { if (ref.current) ref.current.srcdoc = html; }, [html]);

  return (
    <div
      className="rounded-lg overflow-hidden mx-auto"
      style={{ width: Math.round(nW * scale), height: Math.round(nH * scale), boxShadow: '0 8px 32px rgba(0,0,0,0.5)', background: '#fff', flexShrink: 0 }}
    >
      <iframe
        ref={ref}
        title="preview"
        style={{ width: nW, height: nH, border: 'none', transformOrigin: '0 0', transform: `scale(${scale})`, pointerEvents: 'none', display: 'block' }}
      />
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="color"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-9 h-9 rounded-lg cursor-pointer border border-white/10 bg-transparent p-0.5 flex-shrink-0"
        title={label}
      />
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

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
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

interface SortableSectionProps {
  section: OSSection;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggle: () => void;
  onTemplateChange: (template: string) => void;
  onFontScaleChange: (scale: 'small' | 'normal' | 'large') => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onInsertPlaceholder: (key: string) => void;
}

function SortableSection({
  section, isExpanded, onToggleExpand, onToggle,
  onTemplateChange, onFontScaleChange, textareaRef, onInsertPlaceholder,
}: SortableSectionProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });
  const capable = TEMPLATE_CAPABLE_IDS.has(section.id);

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      className="rounded-xl border border-white/10 overflow-hidden"
    >
      {/* Header row */}
      <div className="flex items-center gap-2 px-3 py-2.5 bg-white/5">
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

        {capable && (
          <button
            onClick={onToggleExpand}
            className="text-slate-500 hover:text-slate-300 flex-shrink-0 transition-colors"
            title={isExpanded ? 'Fechar editor' : 'Editar template'}
          >
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        )}

        <button
          onClick={onToggle}
          className={`flex-shrink-0 transition-colors ${section.visible ? 'text-primary hover:text-primary/70' : 'text-slate-600 hover:text-slate-400'}`}
          title={section.visible ? 'Ocultar seção' : 'Mostrar seção'}
        >
          {section.visible ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>
      </div>

      {/* Expanded template editor */}
      {isExpanded && (
        <div className="bg-slate-950/60 border-t border-white/5 p-3 space-y-3">
          {capable ? (
            <>
              {/* Font scale buttons */}
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600 mb-1.5">Tamanho do Texto</p>
                <div className="flex gap-1">
                  {(['small', 'normal', 'large'] as const).map(scale => (
                    <button
                      key={scale}
                      onClick={() => onFontScaleChange(scale)}
                      className={`flex-1 h-7 rounded-lg text-[10px] font-bold transition-all border ${
                        (section.fontScale ?? 'normal') === scale
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      {scale === 'small' ? 'A↓ Pequeno' : scale === 'normal' ? 'A Normal' : 'A↑ Grande'}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                ref={textareaRef}
                value={section.template}
                onChange={e => onTemplateChange(e.target.value)}
                rows={4}
                spellCheck={false}
                placeholder="Digite o conteúdo. Use {{placeholder}} para inserir campos."
                className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 resize-y focus:ring-1 focus:ring-primary outline-none leading-relaxed placeholder:text-slate-600"
              />
              {/* Placeholder groups */}
              <div className="space-y-2">
                {PLACEHOLDER_GROUPS.map(group => (
                  <div key={group.label}>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600 mb-1.5">{group.label}</p>
                    <div className="flex flex-wrap gap-1">
                      {group.items.map(item => (
                        <button
                          key={item.key}
                          onClick={() => onInsertPlaceholder(item.key)}
                          className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
                          title={`Inserir {{${item.key}}}`}
                        >
                          {`{{${item.key}}}`}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-start gap-2 text-slate-500">
              <Info size={14} className="flex-shrink-0 mt-0.5" />
              <p className="text-xs">Esta seção é gerada automaticamente (tabela ou total) — controle apenas a visibilidade.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
interface Props {
  settings: AppSettings;
  onUpdateSettings: (s: Partial<AppSettings>) => void;
}

export const OSTemplateEditor: React.FC<Props> = ({ settings, onUpdateSettings }) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab]       = useState<LayoutTab>('a4Complete');
  const [config, setConfig]             = useState<OSPrintTemplateConfig>(() =>
    parseOSPrintTemplateConfig(settings.osPrintConfig)
  );
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const scheduleRestore = useTextareaCursor(textareaRef);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  // ── Current layout config helpers ─────────────────────────────────────────
  const isBlank = activeTab === 'blank';
  const layoutKey = isBlank ? null : (activeTab as ConfigurableLayout);
  const currentConfig = layoutKey ? config[layoutKey] : null;
  const registryEntry = LAYOUT_REGISTRY[activeTab];

  const updateCurrentLayout = (updates: Partial<OSLayoutConfig>) => {
    if (!layoutKey) return;
    setConfig(c => ({ ...c, [layoutKey]: { ...c[layoutKey], ...updates } }));
  };

  const updateSections = (sections: OSSection[]) => updateCurrentLayout({ sections });

  const toggleSection = (id: OSSection['id']) =>
    updateSections(currentConfig!.sections.map(s => s.id === id ? { ...s, visible: !s.visible } : s));

  const updateSectionTemplate = (id: string, template: string) =>
    updateSections(currentConfig!.sections.map(s => s.id === id ? { ...s, template } : s));

  const updateSectionFontScale = (id: string, fontScale: 'small' | 'normal' | 'large') =>
    updateSections(currentConfig!.sections.map(s => s.id === id ? { ...s, fontScale } : s));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !currentConfig) return;
    const oldIdx = currentConfig.sections.findIndex(s => s.id === active.id);
    const newIdx = currentConfig.sections.findIndex(s => s.id === over.id);
    updateSections(arrayMove(currentConfig.sections, oldIdx, newIdx));
  };

  const toggleExpand = (id: string) =>
    setExpandedSection(prev => prev === id ? null : id);

  // ── Insert placeholder at cursor ──────────────────────────────────────────
  const insertAtCursor = (key: string) => {
    const el = textareaRef.current;
    if (!el || !expandedSection) return;
    const ss = el.selectionStart;
    const se = el.selectionEnd;
    const token = `{{${key}}}`;
    const section = currentConfig!.sections.find(s => s.id === expandedSection);
    if (!section) return;
    const newTemplate = section.template.slice(0, ss) + token + section.template.slice(se);
    scheduleRestore(ss + token.length);
    updateSectionTemplate(expandedSection, newTemplate);
  };

  // ── Live preview ──────────────────────────────────────────────────────────
  const deferredConfig = useDeferredValue(currentConfig);
  const deferredTab    = useDeferredValue(activeTab);

  const previewHtml = useMemo(() => {
    if (deferredTab === 'blank')
      return stripScript(getBlankFormLayout(settings));
    if (deferredTab === 'thermal')
      return stripScript(getThermalLayout({ ...SAMPLE_DATA, config: deferredConfig ?? undefined }));
    if (deferredTab === 'a5')
      return stripScript(getA5Layout({ ...SAMPLE_DATA, config: deferredConfig ?? undefined }));
    const printType = deferredTab === 'a4Simplified' ? 'simplified' : 'complete';
    return stripScript(getA4EnhancedLayout({ ...SAMPLE_DATA, printType, config: deferredConfig ?? undefined }));
  }, [deferredTab, deferredConfig, settings]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleSave = () => {
    onUpdateSettings({ osPrintConfig: JSON.stringify(config) });
    showToast('Template salvo com sucesso!', 'success');
  };

  const handleReset = () => {
    if (!layoutKey) return;
    setConfig(c => ({ ...c, [layoutKey]: DEFAULT_OS_PRINT_TEMPLATE_CONFIG[layoutKey] }));
    setExpandedSection(null);
  };

  const handlePrintSample = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    let html: string;
    if (activeTab === 'blank')
      html = getBlankFormLayout(settings);
    else if (activeTab === 'thermal')
      html = getThermalLayout({ ...SAMPLE_DATA, config: currentConfig ?? undefined });
    else if (activeTab === 'a5')
      html = getA5Layout({ ...SAMPLE_DATA, config: currentConfig ?? undefined });
    else {
      const printType = activeTab === 'a4Simplified' ? 'simplified' : 'complete';
      html = getA4EnhancedLayout({ ...SAMPLE_DATA, printType, config: currentConfig ?? undefined });
    }
    w.document.write(html);
    w.document.close();
  };

  const dims = registryEntry.previewDims;
  const currentTab = LAYOUT_TABS.find(t => t.id === activeTab)!;

  return (
    <div className="flex flex-col gap-6">

      {/* ── Layout tabs ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {LAYOUT_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setExpandedSection(null); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              activeTab === tab.id
                ? 'text-white border-transparent'
                : 'bg-white/5 text-slate-400 border-white/10 hover:text-white hover:bg-white/10'
            }`}
            style={activeTab === tab.id ? { background: tab.color, boxShadow: `0 4px 16px ${tab.color}40` } : {}}
          >
            {tab.label}
            <span
              className="text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest"
              style={activeTab === tab.id
                ? { background: 'rgba(255,255,255,0.2)', color: '#fff' }
                : { background: `${tab.color}15`, color: tab.color }
              }
            >
              {tab.tag}
            </span>
          </button>
        ))}
      </div>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col xl:flex-row gap-6">

        {/* Left panel */}
        <div className="w-full xl:w-72 space-y-5 flex-shrink-0">

          {!isBlank && currentConfig && (
            <>
              {/* Sections */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">
                  Seções — arrastar para reordenar · clique ▾ para editar template
                </p>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={currentConfig.sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-1.5">
                      {currentConfig.sections.map(s => (
                        <SortableSection
                          key={s.id}
                          section={s}
                          isExpanded={expandedSection === s.id}
                          onToggleExpand={() => toggleExpand(s.id)}
                          onToggle={() => toggleSection(s.id)}
                          onTemplateChange={tmpl => updateSectionTemplate(s.id, tmpl)}
                          onFontScaleChange={scale => updateSectionFontScale(s.id, scale)}
                          textareaRef={expandedSection === s.id ? textareaRef : { current: null }}
                          onInsertPlaceholder={insertAtCursor}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>

              {/* Colors */}
              <div className="border-t border-white/5 pt-5 space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Cores</p>
                <ColorField
                  label="Cor Principal (fundo dos cabeçalhos)"
                  value={currentConfig.primaryColor}
                  onChange={v => updateCurrentLayout({ primaryColor: v })}
                />
                <ColorField
                  label="Cor de Destaque (títulos das seções)"
                  value={currentConfig.accentColor}
                  onChange={v => updateCurrentLayout({ accentColor: v })}
                />
              </div>

              {/* Typography */}
              <div className="border-t border-white/5 pt-5 space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Tipografia</p>
                <select
                  value={currentConfig.fontFamily}
                  onChange={e => updateCurrentLayout({ fontFamily: e.target.value })}
                  className="w-full h-10 bg-white/5 border border-white/10 rounded-xl px-3 text-sm font-bold focus:ring-1 focus:ring-primary outline-none text-slate-200 [&>option]:bg-slate-900"
                >
                  {FONT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>

                {/* Font size slider */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Tamanho da Fonte</p>
                    <span className="text-xs font-black text-primary">{(currentConfig.fontSize ?? registryEntry.fontSize).toFixed(1)}px</span>
                  </div>
                  <input
                    type="range"
                    min={registryEntry.fontSizeMin}
                    max={registryEntry.fontSizeMax}
                    step={0.5}
                    value={currentConfig.fontSize ?? registryEntry.fontSize}
                    onChange={e => updateCurrentLayout({ fontSize: parseFloat(e.target.value) })}
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between text-[9px] text-slate-600 font-bold mt-0.5">
                    <span>{registryEntry.fontSizeMin}px</span>
                    <span>{registryEntry.fontSizeMax}px</span>
                  </div>
                </div>

                {/* Spacing */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Espaçamento</p>
                  <div className="flex gap-1">
                    {(['compact', 'normal', 'spacious'] as const).map(sp => (
                      <button
                        key={sp}
                        onClick={() => updateCurrentLayout({ spacing: sp })}
                        className={`flex-1 h-8 rounded-lg text-[10px] font-bold transition-all border ${
                          (currentConfig.spacing ?? 'normal') === sp
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/20 hover:text-white'
                        }`}
                      >
                        {sp === 'compact' ? 'Compacto' : sp === 'normal' ? 'Normal' : 'Espaçoso'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Toggles */}
              <div className="border-t border-white/5 pt-5 space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Rodapé e Extras</p>
                <ToggleRow label="QR Code do Técnico"      checked={currentConfig.showQrTech}   onChange={v => updateCurrentLayout({ showQrTech: v })} />
                <ToggleRow label="QR Code do Cliente"      checked={currentConfig.showQrClient} onChange={v => updateCurrentLayout({ showQrClient: v })} />
                <ToggleRow label="Aviso de Retirada (30d)" checked={currentConfig.showWarning}  onChange={v => updateCurrentLayout({ showWarning: v })} />
              </div>
            </>
          )}

          {isBlank && (
            <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-center space-y-2">
              <Info size={20} className="text-slate-500 mx-auto" />
              <p className="text-sm font-bold text-slate-300">Ficha em Branco</p>
              <p className="text-xs text-slate-500">
                Este layout gera um formulário vazio para preenchimento manual — não possui seções configuráveis.
                O nome da empresa e o logo vêm das configurações gerais.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="border-t border-white/5 pt-5 flex flex-col gap-2">
            {!isBlank && (
              <button
                onClick={handleSave}
                className="w-full h-10 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95"
              >
                <Save size={15} />
                Salvar Template
              </button>
            )}
            <div className="flex gap-2">
              <button
                onClick={handlePrintSample}
                className="flex-1 h-9 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/10 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <Printer size={13} />
                Imprimir Exemplo
              </button>
              {!isBlank && (
                <button
                  onClick={handleReset}
                  className="flex-1 h-9 rounded-xl bg-white/5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-white/10 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                  title={`Restaurar configurações padrão de ${currentTab.label}`}
                >
                  <RotateCcw size={13} />
                  Restaurar
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right panel — live preview */}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">
            Pré-visualização — {currentTab.label} · dados de exemplo
          </p>
          <div className="bg-slate-900/50 rounded-2xl p-4 flex items-start justify-center min-h-[360px]">
            <PreviewFrame html={previewHtml} nW={dims.nW} nH={dims.nH} scale={dims.scale} />
          </div>
          <p className="text-[10px] text-slate-600 text-center mt-2 font-medium">
            Alterações aparecem em tempo real · Salvar aplica o template em todas as impressões
          </p>
        </div>
      </div>
    </div>
  );
};
