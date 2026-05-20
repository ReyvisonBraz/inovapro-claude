import { OSSection, OSLayoutConfig, OSPrintTemplateConfig } from '../types';

// ─── Placeholder groups shown in the editor UI ────────────────────────────────
export const PLACEHOLDER_GROUPS = [
  {
    label: 'Ordem de Serviço',
    items: [
      { key: 'numero_os',         label: 'Nº da OS' },
      { key: 'data',              label: 'Data (curta)' },
      { key: 'data_extenso',      label: 'Data (extenso)' },
      { key: 'tecnico',           label: 'Técnico responsável' },
      { key: 'status',            label: 'Status' },
    ],
  },
  {
    label: 'Cliente',
    items: [
      { key: 'cliente_nome',          label: 'Nome completo' },
      { key: 'cliente_primeiro_nome', label: 'Primeiro nome' },
      { key: 'cliente_telefone',      label: 'Telefone' },
      { key: 'cliente_cpf',           label: 'CPF / CNPJ' },
    ],
  },
  {
    label: 'Equipamento',
    items: [
      { key: 'equipamento',          label: 'Nome completo' },
      { key: 'equipamento_tipo',     label: 'Tipo' },
      { key: 'equipamento_marca',    label: 'Marca' },
      { key: 'equipamento_modelo',   label: 'Modelo' },
      { key: 'equipamento_serial',   label: 'Nº de Série' },
      { key: 'equipamento_cor',      label: 'Cor' },
      { key: 'senha',                label: 'Senha / PIN' },
      { key: 'acessorios',           label: 'Acessórios' },
      { key: 'ram',                  label: 'RAM' },
      { key: 'ssd',                  label: 'SSD / HD' },
    ],
  },
  {
    label: 'Serviço',
    items: [
      { key: 'problema',      label: 'Problema relatado' },
      { key: 'analise',       label: 'Análise técnica' },
      { key: 'servicos',      label: 'Serviços realizados' },
      { key: 'observacoes',   label: 'Observações finais' },
      { key: 'valor_total',   label: 'Valor total' },
      { key: 'taxa_servico',  label: 'Taxa de serviço' },
    ],
  },
] as const;

// ─── Template substitution ────────────────────────────────────────────────────
export function substituteTemplate(template: string, values: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => values[key] ?? '');
}

// ─── Section IDs that accept free-form templates ──────────────────────────────
export const TEMPLATE_CAPABLE_IDS = new Set<OSSection['id']>([
  'equipment', 'problem', 'analysis', 'services', 'observations',
]);

// ─── Default templates per section ───────────────────────────────────────────
const T = {
  equipment: [
    '{{equipamento_tipo}} {{equipamento_marca}} {{equipamento_modelo}}',
    'Serial: {{equipamento_serial}} | Cor: {{equipamento_cor}}',
    'Senha: {{senha}} | Acessórios: {{acessorios}}',
  ].join('\n'),
  equipmentCompact: [
    '{{equipamento}}',
    'Serial: {{equipamento_serial}} | Cor: {{equipamento_cor}}',
  ].join('\n'),
  problem:      '{{problema}}',
  analysis:     '{{analise}}',
  services:     '{{servicos}}',
  observations: '{{observacoes}}',
};

// ─── Section builders ─────────────────────────────────────────────────────────
type SectionOverride = Partial<Omit<OSSection, 'id'>>;

function mkSections(
  overrides: Partial<Record<OSSection['id'], SectionOverride>> = {},
): OSSection[] {
  const defaults: OSSection[] = [
    { id: 'equipment',    label: 'Dados do Equipamento', visible: true,  template: T.equipment,     fontScale: 'normal' },
    { id: 'problem',      label: 'Problema Relatado',    visible: true,  template: T.problem,       fontScale: 'normal' },
    { id: 'analysis',     label: 'Análise Técnica',      visible: true,  template: T.analysis,      fontScale: 'normal' },
    { id: 'services',     label: 'Serviços Realizados',  visible: true,  template: T.services,      fontScale: 'normal' },
    { id: 'parts',        label: 'Peças Utilizadas',     visible: true,  template: '' },
    { id: 'values',       label: 'Valor Total',          visible: true,  template: '' },
    { id: 'observations', label: 'Observações Finais',   visible: true,  template: T.observations,  fontScale: 'normal' },
  ];
  return defaults.map(s => ({ ...s, ...(overrides[s.id] ?? {}) }));
}

// ─── Default colors / font ────────────────────────────────────────────────────
const DEFAULTS = {
  primaryColor: '#0f2d52',
  accentColor:  '#1d4ed8',
  fontFamily:   "'Segoe UI', Arial, sans-serif",
  showQrTech:   true,
  showQrClient: true,
  showWarning:  true,
};

// ─── Per-layout default configs ───────────────────────────────────────────────
export const DEFAULT_A4_COMPLETE_CONFIG: OSLayoutConfig = {
  ...DEFAULTS,
  sections: mkSections(),
};

export const DEFAULT_A4_SIMPLIFIED_CONFIG: OSLayoutConfig = {
  ...DEFAULTS,
  sections: mkSections({
    analysis:     { visible: false },
    services:     { visible: false },
    parts:        { visible: false },
    values:       { visible: false },
  }),
};

export const DEFAULT_A5_CONFIG: OSLayoutConfig = {
  ...DEFAULTS,
  sections: mkSections({
    analysis:     { visible: false },
    services:     { visible: false },
    parts:        { visible: false },
    values:       { visible: false },
  }),
};

export const DEFAULT_THERMAL_CONFIG: OSLayoutConfig = {
  ...DEFAULTS,
  showQrTech: false,
  sections: [
    { id: 'equipment',    label: 'Equipamento',       visible: true,  template: T.equipmentCompact },
    { id: 'problem',      label: 'Problema Relatado', visible: true,  template: T.problem },
    { id: 'analysis',     label: 'Análise Técnica',   visible: false, template: T.analysis },
    { id: 'services',     label: 'Serviços',          visible: false, template: T.services },
    { id: 'parts',        label: 'Peças Utilizadas',  visible: false, template: '' },
    { id: 'values',       label: 'Valor Total',       visible: false, template: '' },
    { id: 'observations', label: 'Observações',       visible: false, template: T.observations },
  ],
};

export const DEFAULT_OS_PRINT_TEMPLATE_CONFIG: OSPrintTemplateConfig = {
  a4Complete:   DEFAULT_A4_COMPLETE_CONFIG,
  a4Simplified: DEFAULT_A4_SIMPLIFIED_CONFIG,
  a5:           DEFAULT_A5_CONFIG,
  thermal:      DEFAULT_THERMAL_CONFIG,
};

// ─── Central layout registry — single source of truth for metadata ────────────
export const LAYOUT_REGISTRY = {
  a4Complete:   {
    label: 'A4 Completo',     tag: 'A4 Paisagem', color: '#3b82f6',
    fontSize: 12.5, fontSizeMin: 8,  fontSizeMax: 16,
    previewDims: { nW: 1077, nH: 756,  scale: 0.44 },
    defaultConfig: DEFAULT_A4_COMPLETE_CONFIG,
  },
  a4Simplified: {
    label: 'A4 Simplificado', tag: 'A4 Paisagem', color: '#8b5cf6',
    fontSize: 12.5, fontSizeMin: 8,  fontSizeMax: 16,
    previewDims: { nW: 1077, nH: 756,  scale: 0.44 },
    defaultConfig: DEFAULT_A4_SIMPLIFIED_CONFIG,
  },
  a5:           {
    label: 'A5 Compacto',     tag: 'A5 Retrato',  color: '#10b981',
    fontSize: 9,   fontSizeMin: 7,  fontSizeMax: 13,
    previewDims: { nW: 529,  nH: 763,  scale: 0.60 },
    defaultConfig: DEFAULT_A5_CONFIG,
  },
  thermal:      {
    label: 'Térmica 80mm',    tag: '80mm',        color: '#f59e0b',
    fontSize: 9,   fontSizeMin: 7,  fontSizeMax: 12,
    previewDims: { nW: 272,  nH: 680,  scale: 0.80 },
    defaultConfig: DEFAULT_THERMAL_CONFIG,
  },
  blank:        {
    label: 'Ficha em Branco', tag: 'A4 Retrato',  color: '#f43f5e',
    fontSize: 12,  fontSizeMin: 8,  fontSizeMax: 16,
    previewDims: { nW: 718,  nH: 1062, scale: 0.44 },
    defaultConfig: null,
  },
} as const;

export type LayoutRegistryKey = keyof typeof LAYOUT_REGISTRY;

// ─── Backward-compat exports (used by printLayouts.ts) ───────────────────────
export const DEFAULT_OS_SECTIONS      = DEFAULT_A4_COMPLETE_CONFIG.sections;
export const DEFAULT_OS_TEMPLATE_CONFIG = DEFAULT_A4_COMPLETE_CONFIG;

// ─── Layout config merger ─────────────────────────────────────────────────────
function mergeLayout(saved: Partial<OSLayoutConfig>, defaults: OSLayoutConfig): OSLayoutConfig {
  const savedSections = saved.sections ?? [];
  const merged: OSSection[] = defaults.sections.map(def => {
    const s = savedSections.find(x => x.id === def.id);
    if (!s) return def;
    return { ...def, visible: s.visible, template: s.template ?? def.template, fontScale: s.fontScale ?? def.fontScale };
  });
  const ordered = savedSections.length
    ? savedSections.map(s => merged.find(x => x.id === s.id)!).filter(Boolean)
    : merged;
  return { ...defaults, ...saved, sections: ordered };
}

// ─── Parser — handles both new (per-layout) and old (flat) formats ────────────
export function parseOSPrintTemplateConfig(raw?: string | null): OSPrintTemplateConfig {
  if (!raw) return DEFAULT_OS_PRINT_TEMPLATE_CONFIG;
  try {
    const parsed = JSON.parse(raw);
    // New format: top-level key is a layout name
    if (parsed.a4Complete) {
      return {
        a4Complete:   mergeLayout(parsed.a4Complete,   DEFAULT_A4_COMPLETE_CONFIG),
        a4Simplified: mergeLayout(parsed.a4Simplified ?? {}, DEFAULT_A4_SIMPLIFIED_CONFIG),
        a5:           mergeLayout(parsed.a5 ?? {},           DEFAULT_A5_CONFIG),
        thermal:      mergeLayout(parsed.thermal ?? {},       DEFAULT_THERMAL_CONFIG),
      };
    }
    // Old format: flat OSTemplateConfig — apply to a4Complete only
    return {
      a4Complete:   mergeLayout(parsed, DEFAULT_A4_COMPLETE_CONFIG),
      a4Simplified: DEFAULT_A4_SIMPLIFIED_CONFIG,
      a5:           DEFAULT_A5_CONFIG,
      thermal:      DEFAULT_THERMAL_CONFIG,
    };
  } catch {
    return DEFAULT_OS_PRINT_TEMPLATE_CONFIG;
  }
}

// Backward-compat single-layout parser
export function parseOSTemplateConfig(raw?: string | null): OSLayoutConfig {
  return parseOSPrintTemplateConfig(raw).a4Complete;
}
