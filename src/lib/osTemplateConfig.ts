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
    { id: 'equipment',    label: 'Dados do Equipamento', visible: true,  template: T.equipment },
    { id: 'problem',      label: 'Problema Relatado',    visible: true,  template: T.problem },
    { id: 'analysis',     label: 'Análise Técnica',      visible: true,  template: T.analysis },
    { id: 'services',     label: 'Serviços Realizados',  visible: true,  template: T.services },
    { id: 'parts',        label: 'Peças Utilizadas',     visible: true,  template: '' },
    { id: 'values',       label: 'Valor Total',          visible: true,  template: '' },
    { id: 'observations', label: 'Observações Finais',   visible: true,  template: T.observations },
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

// ─── Backward-compat exports (used by printLayouts.ts) ───────────────────────
export const DEFAULT_OS_SECTIONS      = DEFAULT_A4_COMPLETE_CONFIG.sections;
export const DEFAULT_OS_TEMPLATE_CONFIG = DEFAULT_A4_COMPLETE_CONFIG;

// ─── Layout config merger ─────────────────────────────────────────────────────
function mergeLayout(saved: Partial<OSLayoutConfig>, defaults: OSLayoutConfig): OSLayoutConfig {
  const savedSections = saved.sections ?? [];
  // Merge each saved section into the defaults (preserving custom templates + visibility)
  const merged: OSSection[] = defaults.sections.map(def => {
    const s = savedSections.find(x => x.id === def.id);
    if (!s) return def;
    return { ...def, visible: s.visible, template: s.template ?? def.template };
  });
  // Respect user's section ordering
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
