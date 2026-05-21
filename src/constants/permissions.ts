export const AVAILABLE_PERMISSIONS = [
  { id: 'view_dashboard',        label: 'Ver Painel/Dashboard' },
  { id: 'manage_transactions',   label: 'Gerenciar Transações (Fluxo)' },
  { id: 'manage_payments',       label: 'Vendas e Pagamentos' },
  { id: 'manage_service_orders', label: 'Ordens de Serviço' },
  { id: 'manage_customers',      label: 'Clientes' },
  { id: 'manage_inventory',      label: 'Estoque' },
  { id: 'view_reports',          label: 'Relatórios' },
  { id: 'manage_settings',       label: 'Configurações' },
  { id: 'manage_users',          label: 'Gerenciar Usuários' },
] as const;

export type Permission = typeof AVAILABLE_PERMISSIONS[number]['id'];

export const OWNER_PERMISSIONS: Permission[] = [
  'view_dashboard',
  'manage_transactions',
  'manage_payments',
  'manage_service_orders',
  'manage_customers',
  'manage_inventory',
  'view_reports',
  'manage_settings',
  'manage_users',
];
