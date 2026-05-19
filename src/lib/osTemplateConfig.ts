import { OSSection, OSTemplateConfig } from '../types';

export const DEFAULT_OS_SECTIONS: OSSection[] = [
  { id: 'equipment',    label: 'Dados do Equipamento', visible: true },
  { id: 'problem',      label: 'Problema Relatado',    visible: true },
  { id: 'analysis',     label: 'Análise Técnica',      visible: true },
  { id: 'services',     label: 'Serviços Realizados',  visible: true },
  { id: 'parts',        label: 'Peças Utilizadas',     visible: true },
  { id: 'values',       label: 'Valor Total',          visible: true },
  { id: 'observations', label: 'Observações Finais',   visible: true },
];

export const DEFAULT_OS_TEMPLATE_CONFIG: OSTemplateConfig = {
  sections: DEFAULT_OS_SECTIONS,
  primaryColor: '#0f2d52',
  accentColor: '#1d4ed8',
  fontFamily: "'Segoe UI', Arial, sans-serif",
  showQrTech: true,
  showQrClient: true,
  showWarning: true,
};

export function parseOSTemplateConfig(raw?: string | null): OSTemplateConfig {
  if (!raw) return DEFAULT_OS_TEMPLATE_CONFIG;
  try {
    const parsed = JSON.parse(raw) as Partial<OSTemplateConfig>;
    const sections: OSSection[] = DEFAULT_OS_SECTIONS.map(def => {
      const saved = parsed.sections?.find(s => s.id === def.id);
      return saved ? { ...def, visible: saved.visible } : def;
    });
    const ordered = parsed.sections
      ? parsed.sections.map(s => sections.find(x => x.id === s.id)!).filter(Boolean)
      : sections;
    return {
      ...DEFAULT_OS_TEMPLATE_CONFIG,
      ...parsed,
      sections: ordered,
    };
  } catch {
    return DEFAULT_OS_TEMPLATE_CONFIG;
  }
}
