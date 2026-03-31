import { format, parseISO } from 'date-fns';
import { Transaction, ServiceOrder, Customer, InventoryItem, ClientPayment } from '../types';

export const useExportData = () => {
  const downloadCSV = (headers: string[], rows: any[][], filename: string) => {
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportTransactionsToCSV = (transactions: Transaction[]) => {
    const headers = ["Descrição", "Categoria", "Tipo", "Valor", "Data", "Status"];
    const rows = transactions.map(t => [
      t.description,
      t.category,
      t.type,
      t.amount,
      t.date,
      t.status
    ]);
    downloadCSV(headers, rows, `relatorio_financeiro_${format(new Date(), 'yyyy-MM-dd')}.csv`);
  };

  const exportServiceOrdersToCSV = (serviceOrders: ServiceOrder[], customers: Customer[]) => {
    const headers = ["ID", "Cliente", "Equipamento", "Status", "Prioridade", "Data Entrada", "Total"];
    const rows = serviceOrders.map(o => {
      const customer = customers.find(c => c.id === o.customerId);
      return [
        `#OS-${o.id}`,
        `${customer?.firstName} ${customer?.lastName}`,
        `${o.equipmentBrand} ${o.equipmentModel}`,
        o.status,
        o.priority,
        o.entryDate || format(parseISO(o.createdAt), 'yyyy-MM-dd'),
        o.totalAmount
      ];
    });
    downloadCSV(headers, rows, `ordens_de_servico_${format(new Date(), 'yyyy-MM-dd')}.csv`);
  };

  const exportCustomersToCSV = (customers: Customer[]) => {
    const headers = ["Nome", "Apelido", "CPF", "Empresa", "Telefone", "Limite de Crédito"];
    const rows = customers.map(c => [
      `${c.firstName} ${c.lastName}`,
      c.nickname || '-',
      c.cpf || '-',
      c.companyName || '-',
      c.phone || '-',
      c.creditLimit || '0'
    ]);
    downloadCSV(headers, rows, `clientes_${format(new Date(), 'yyyy-MM-dd')}.csv`);
  };

  const exportInventoryToCSV = (inventoryItems: InventoryItem[]) => {
    const headers = ["Nome", "Categoria", "SKU", "Preço Unitário", "Estoque"];
    const rows = inventoryItems.map(i => [
      i.name,
      i.category === 'product' ? 'Produto' : 'Serviço',
      i.sku || '-',
      i.unitPrice,
      i.stockLevel || '0'
    ]);
    downloadCSV(headers, rows, `estoque_${format(new Date(), 'yyyy-MM-dd')}.csv`);
  };

  const exportPaymentsToCSV = (clientPayments: ClientPayment[]) => {
    const headers = ["Cliente", "Descrição", "Valor Total", "Valor Pago", "Saldo Devedor", "Vencimento", "Status"];
    const rows = clientPayments.map(p => [
      p.customerName,
      p.description,
      p.totalAmount,
      p.paidAmount,
      p.totalAmount - p.paidAmount,
      p.dueDate,
      p.status
    ]);
    downloadCSV(headers, rows, `pagamentos_clientes_${format(new Date(), 'yyyy-MM-dd')}.csv`);
  };

  return {
    exportTransactionsToCSV,
    exportServiceOrdersToCSV,
    exportCustomersToCSV,
    exportInventoryToCSV,
    exportPaymentsToCSV
  };
};
