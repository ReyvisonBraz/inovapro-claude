import React, { useState, useMemo, useDeferredValue, useRef } from 'react';
import {
  DndContext, closestCenter, DragEndEvent,
  useSensor, useSensors, PointerSensor,
} from '@dnd-kit/core';
import {
  SortableContext, verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable';
import type { AppSettings, OSSection, OSLayoutConfig, OSPrintTemplateConfig } from '../../types';
import {
  parseOSPrintTemplateConfig,
  DEFAULT_OS_PRINT_TEMPLATE_CONFIG,
  LAYOUT_REGISTRY,
  LayoutRegistryKey,
} from '../../lib/osTemplateConfig';
import { getA4EnhancedLayout, getA5Layout, getThermalLayout } from '../service-orders/modals/printLayouts';
import { getBlankFormLayout, stripScript } from '../../lib/printUtils';
import { SAMPLE_DATA } from './previewData';
import { useTextareaCursor, PreviewFrame } from './osTemplateComponents';
import { SortableSection } from './SortableSection';
import { TemplateConfigPanel } from './TemplateConfigPanel';

const LAYOUT_TABS = (Object.keys(LAYOUT_REGISTRY) as LayoutRegistryKey[]).map(id => ({
  id,
  label: LAYOUT_REGISTRY[id].label,
  tag:   LAYOUT_REGISTRY[id].tag,
  color: LAYOUT_REGISTRY[id].color,
}));

type LayoutTab = LayoutRegistryKey;
type ConfigurableLayout = Exclude<LayoutTab, 'blank'>;

interface Props {
  settings: AppSettings;
  onUpdateSettings: (s: Partial<AppSettings>) => void;
}

export const OSTemplateEditor: React.FC<Props> = ({ settings, onUpdateSettings }) => {
  const [activeTab, setActiveTab]       = useState<LayoutTab>('a4Complete');
  const [config, setConfig]             = useState<OSPrintTemplateConfig>(() =>
    parseOSPrintTemplateConfig(settings.osPrintConfig)
  );
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const scheduleRestore = useTextareaCursor(textareaRef);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const isBlank = activeTab === 'blank';
  const layoutKey = isBlank ? null : (activeTab as ConfigurableLayout);
  const currentConfig = layoutKey ? config[layoutKey] : null;
  const registryEntry = LAYOUT_REGISTRY[activeTab];

  const updateCurrentLayout = (updates: Partial<OSLayoutConfig>) => {
    if (!layoutKey) return;
    setConfig(c => ({ ...c, [layoutKey]: { ...c[layoutKey], ...updates } }));
  };

  const updateSections = (sections: OSSection[]) => updateCurrentLayout({ sections });
  const toggleSection = (id: OSSection['id']) => updateSections(currentConfig!.sections.map(s => s.id === id ? { ...s, visible: !s.visible } : s));
  const updateSectionTemplate = (id: string, template: string) => updateSections(currentConfig!.sections.map(s => s.id === id ? { ...s, template } : s));
  const updateSectionFontScale = (id: string, fontScale: 'small' | 'normal' | 'large') => updateSections(currentConfig!.sections.map(s => s.id === id ? { ...s, fontScale } : s));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !currentConfig) return;
    const oldIdx = currentConfig.sections.findIndex(s => s.id === active.id);
    const newIdx = currentConfig.sections.findIndex(s => s.id === over.id);
    updateSections(arrayMove(currentConfig.sections, oldIdx, newIdx));
  };

  const toggleExpand = (id: string) => setExpandedSection(prev => prev === id ? null : id);

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

  const deferredConfig = useDeferredValue(currentConfig);
  const deferredTab    = useDeferredValue(activeTab);

  const previewHtml = useMemo(() => {
    if (deferredTab === 'blank') return stripScript(getBlankFormLayout(settings));
    if (deferredTab === 'thermal') return stripScript(getThermalLayout({ ...SAMPLE_DATA, config: deferredConfig ?? undefined }));
    if (deferredTab === 'a5') return stripScript(getA5Layout({ ...SAMPLE_DATA, config: deferredConfig ?? undefined }));
    const printType = deferredTab === 'a4Simplified' ? 'simplified' : 'complete';
    return stripScript(getA4EnhancedLayout({ ...SAMPLE_DATA, printType, config: deferredConfig ?? undefined }));
  }, [deferredTab, deferredConfig, settings]);

  const handleSave = () => {
    onUpdateSettings({ osPrintConfig: JSON.stringify(config) });
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
    if (activeTab === 'blank') html = getBlankFormLayout(settings);
    else if (activeTab === 'thermal') html = getThermalLayout({ ...SAMPLE_DATA, config: currentConfig ?? undefined });
    else if (activeTab === 'a5') html = getA5Layout({ ...SAMPLE_DATA, config: currentConfig ?? undefined });
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

      <div className="flex flex-col xl:flex-row gap-6">
        <div className="w-full xl:w-72 space-y-5 flex-shrink-0">
          {!isBlank && currentConfig && (
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
          )}

          <TemplateConfigPanel
            currentConfig={currentConfig!}
            registryEntry={registryEntry}
            isBlank={isBlank}
            onUpdateLayout={updateCurrentLayout}
            onSave={handleSave}
            onReset={handleReset}
            onPrintSample={handlePrintSample}
          />
        </div>

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
