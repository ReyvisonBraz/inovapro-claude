import { QR_BASE } from '../../lib/printUtils';
import { formatCurrency } from '../../lib/utils';

export const SAMPLE_DATA = {
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