export type TrackingData = {
  id: number;
  status: string;
  equipmentType: string | null;
  equipmentBrand: string | null;
  equipmentModel: string | null;
  equipmentColor: string | null;
  equipmentSerial: string | null;
  reportedProblem: string | null;
  entryDate: string | null;
  analysisPrediction: string | null;
  arrivalPhotos: (string | { base64: string; timestamp: string })[];
  totalAmount: number | null;
  serviceFee: number | null;
  shopWhatsapp: string | null;
  shopName: string;
};

export const STATUS_COLORS: Record<string, string> = {
  'Aguardando Análise': '#f59e0b',
  'Em Análise': '#3b82f6',
  'Em Manutenção': '#8b5cf6',
  'Em Reparo': '#8b5cf6',
  'Aguardando Peças': '#f97316',
  'Aguardando Aprovação': '#ef4444',
  'Aguardando Autorização': '#ef4444',
  'Testando': '#06b6d4',
  'Pronto': '#10b981',
  'Concluído': '#10b981',
  'Entregue': '#059669',
  'Cancelado': '#6b7280',
};