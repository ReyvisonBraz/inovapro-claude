import React, { useState } from 'react';
import { ServiceOrder, Customer, InventoryItem, ServiceOrderStatus, User, ServiceOrderPart, Brand, Model } from '../types';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Search, Plus, Filter, MoreVertical, Edit, Trash2, 
  CheckCircle, Clock, AlertTriangle, Briefcase, 
  Settings, Wrench, X, Calendar, Lock, Package, 
  Printer, MessageCircle, ChevronDown, ChevronUp,
  Camera, Cpu, HardDrive, Smartphone, Tag, Wallet,
  AlertCircle, ClipboardList, Upload, Check, User as UserIcon,
  QrCode
} from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

import { QRCodeSVG } from 'qrcode.react';
import { CustomerSearchSelect } from './CustomerSearchSelect';

interface ServiceOrdersProps {
  orders: ServiceOrder[];
  customers: Customer[];
  inventoryItems: InventoryItem[];
  statuses: ServiceOrderStatus[];
  brands: Brand[];
  models: Model[];
  clientPayments: any[];
  currentUser: User | null;
  onAddOrder: (order: any) => void;
  onUpdateOrder: (id: number, order: any) => void;
  onDeleteOrder: (id: number) => void;
  onAddStatus: (status: any) => void;
  onDeleteStatus: (id: number) => void;
  onAddBrand: (name: string) => void;
  onAddModel: (brandId: number, name: string) => void;
  onTriggerAddCustomer: () => void;
  directOsId: number | null;
  directMode: string | null;
  onClearDirectOsId: () => void;
}

export const ServiceOrders: React.FC<ServiceOrdersProps> = ({
  orders,
  customers,
  inventoryItems,
  statuses,
  brands,
  models,
  clientPayments,
  currentUser,
  onAddOrder,
  onUpdateOrder,
  onDeleteOrder,
  onAddStatus,
  onDeleteStatus,
  onAddBrand,
  onAddModel,
  onTriggerAddCustomer,
  directOsId,
  directMode,
  onClearDirectOsId
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAdding, setIsAdding] = useState(false);
  const [editingOrder, setEditingOrder] = useState<ServiceOrder | null>(null);
  const [showStatusManager, setShowStatusManager] = useState(false);
  const [isAddingStatus, setIsAddingStatus] = useState(false);
  
  // New Status Form
  const [newStatus, setNewStatus] = useState({
    name: '',
    color: '#3b82f6',
    priority: 0
  });

  // Form state
  const [newOrder, setNewOrder] = useState({
    customerId: 0,
    equipmentBrand: '',
    equipmentModel: '',
    equipmentColor: '',
    equipmentSerial: '',
    reportedProblem: '',
    status: 'Aguardando Análise',
    technicalAnalysis: '',
    servicesPerformed: '',
    serviceFee: '',
    totalAmount: '',
    finalObservations: '',
    entryDate: format(new Date(), 'yyyy-MM-dd'),
    analysisPrediction: '',
    customerPassword: '',
    accessories: '',
    ramInfo: '',
    ssdInfo: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    partsUsed: [] as ServiceOrderPart[]
  });

  const [isAddingBrand, setIsAddingBrand] = useState(false);
  const [isAddingModel, setIsAddingModel] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [newModelName, setNewModelName] = useState('');

  const [partSearch, setPartSearch] = useState('');
  const [isAddingPart, setIsAddingPart] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const photoSectionRef = React.useRef<HTMLDivElement>(null);

  const [showStatusOnly, setShowStatusOnly] = useState<ServiceOrder | null>(null);

  // Handle direct OS access from QR Code
  React.useEffect(() => {
    if (directOsId) {
      const order = orders.find(o => o.id === directOsId);
      if (order) {
        if (directMode === 'status') {
          setShowStatusOnly(order);
        } else {
          handleEdit(order);
          if (directMode === 'tech') {
            setTimeout(() => {
              photoSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 500);
          }
        }
      }
      onClearDirectOsId();
    }
  }, [directOsId, orders, directMode]);

  // New states for Print and WhatsApp
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [showQRCodeModal, setShowQRCodeModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);
  const [printConfig, setPrintConfig] = useState<{ type: 'simplified' | 'complete', format: 'a4' | 'thermal' }>({
    type: 'complete',
    format: 'a4'
  });
  const [whatsappConfig, setWhatsappConfig] = useState<{ type: 'simplified' | 'complete' }>({
    type: 'complete'
  });

  // Column visibility
  const [visibleColumns, setVisibleColumns] = useState({
    id: true,
    status: true,
    priority: true,
    entryDate: true,
    prediction: true,
    total: true
  });

  const filteredOrders = orders.filter(order => {
    const customer = customers.find(c => c.id === order.customerId);
    const matchesSearch = 
      order.equipmentBrand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.equipmentModel?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `#OS-${order.id}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (statusName: string) => {
    const status = statuses.find(s => s.name === statusName);
    if (status) {
      return {
        backgroundColor: `${status.color}15`,
        color: status.color,
        borderColor: `${status.color}30`
      };
    }
    return {
      backgroundColor: 'rgba(100, 116, 139, 0.1)',
      color: '#64748b',
      borderColor: 'rgba(100, 116, 139, 0.2)'
    };
  };

  const handleSave = () => {
    if (newOrder.customerId === 0) {
      alert("Selecione um cliente.");
      return;
    }
    
    const orderData = {
      ...newOrder,
      serviceFee: parseFloat(newOrder.serviceFee) || 0,
      totalAmount: parseFloat(newOrder.totalAmount) || 0,
      createdBy: currentUser?.id
    };

    if (editingOrder) {
      onUpdateOrder(editingOrder.id, orderData);
    } else {
      onAddOrder(orderData);
    }
    
    setIsAdding(false);
    setEditingOrder(null);
    setNewOrder({
      customerId: 0,
      equipmentBrand: '',
      equipmentModel: '',
      equipmentColor: '',
      equipmentSerial: '',
      reportedProblem: '',
      status: 'Aguardando Análise',
      technicalAnalysis: '',
      servicesPerformed: '',
      serviceFee: '',
      totalAmount: '',
      finalObservations: '',
      entryDate: format(new Date(), 'yyyy-MM-dd'),
      analysisPrediction: '',
      customerPassword: '',
      accessories: '',
      ramInfo: '',
      ssdInfo: '',
      priority: 'medium',
      partsUsed: []
    });

    // Option to send via WhatsApp after saving
    if (window.confirm('Deseja enviar a Ordem de Serviço via WhatsApp agora?')) {
      // We need the ID of the newly created order, but onAddOrder is async and doesn't return it here easily
      // For now, we'll just close. In a real app, we'd wait for the response.
    }
  };

  const handleEdit = (order: ServiceOrder) => {
    setEditingOrder(order);
    setNewOrder({
      customerId: order.customerId,
      equipmentBrand: order.equipmentBrand || '',
      equipmentModel: order.equipmentModel || '',
      equipmentColor: order.equipmentColor || '',
      equipmentSerial: order.equipmentSerial || '',
      reportedProblem: order.reportedProblem || '',
      status: order.status,
      technicalAnalysis: order.technicalAnalysis || '',
      servicesPerformed: order.servicesPerformed || '',
      serviceFee: order.serviceFee?.toString() || '',
      totalAmount: order.totalAmount?.toString() || '',
      finalObservations: order.finalObservations || '',
      entryDate: order.entryDate || format(parseISO(order.createdAt), 'yyyy-MM-dd'),
      analysisPrediction: order.analysisPrediction || '',
      customerPassword: order.customerPassword || '',
      accessories: order.accessories || '',
      ramInfo: order.ramInfo || '',
      ssdInfo: order.ssdInfo || '',
      priority: order.priority || 'medium',
      partsUsed: order.partsUsed || []
    });
    setIsAdding(true);
  };

  const generateWhatsAppMessage = (order: ServiceOrder, type: 'simplified' | 'complete') => {
    const customer = customers.find(c => c.id === order.customerId);
    if (!customer) return '';

    const osNumber = `#OS-${order.id.toString().padStart(4, '0')}`;
    const equipment = `${order.equipmentBrand} ${order.equipmentModel}`;
    
    let message = `*ORDEM DE SERVIÇO ${osNumber}*\n\n`;
    message += `*Cliente:* ${customer.firstName} ${customer.lastName}\n`;
    message += `*Equipamento:* ${equipment}\n`;
    message += `*Status:* ${order.status}\n`;

    if (type === 'complete') {
      message += `*Data de Entrada:* ${order.entryDate || format(parseISO(order.createdAt), 'dd/MM/yyyy')}\n`;
      if (order.reportedProblem) message += `*Problema:* ${order.reportedProblem}\n`;
      if (order.technicalAnalysis) message += `*Análise:* ${order.technicalAnalysis}\n`;
      if (order.servicesPerformed) message += `*Serviços:* ${order.servicesPerformed}\n`;
      if (order.partsUsed && order.partsUsed.length > 0) {
        message += `\n*Peças:*\n`;
        order.partsUsed.forEach(p => {
          message += `- ${p.name} (${p.quantity}x ${formatCurrency(p.unitPrice)})\n`;
        });
      }
      message += `\n*Total:* ${formatCurrency(order.totalAmount || 0)}\n`;
    } else {
      message += `\nPara mais informações, entre em contato conosco.`;
    }

    return message;
  };

  const handleSendWhatsApp = async (order: ServiceOrder, type: 'simplified' | 'complete') => {
    const customer = customers.find(c => c.id === order.customerId);
    if (customer?.phone) {
      const message = generateWhatsAppMessage(order, type);
      let phone = customer.phone.replace(/\D/g, '');
      if (phone.length === 10 || phone.length === 11) {
        phone = '55' + phone;
      }

      // Gancho para API de envio automático (Ex: Evolution API, Z-API, etc)
      // Descomente e configure para usar uma API de envio automático
      /*
      try {
        const response = await fetch('https://sua-api.com/send-message', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json', 
            'apikey': 'SUA_CHAVE_AQUI' 
          },
          body: JSON.stringify({ 
            number: phone, 
            message: message,
            delay: 1200 // Delay humano opcional
          })
        });
        
        if (response.ok) {
          // Mensagem de confirmação de envio via API
          alert('✅ Ordem de serviço enviada com sucesso para o cliente via API!');
          return;
        } else {
          console.warn('Falha no envio via API, tentando fallback para link direto...');
        }
      } catch (error) {
        console.error('Erro ao enviar via API:', error);
      }
      */

      // Fallback para link direto (Padrão)
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
      
      // Mensagem de confirmação para o usuário (Simulando o comportamento de envio)
      alert('🚀 Abrindo WhatsApp para enviar a Ordem de Serviço...');
    } else {
      alert('⚠️ Cliente sem telefone cadastrado ou inválido.');
    }
  };

  const handlePrint = (order: ServiceOrder, type: 'simplified' | 'complete', formatType: 'a4' | 'thermal') => {
    const customer = customers.find(c => c.id === order.customerId);
    if (!customer) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const osNumber = `#OS-${order.id.toString().padStart(4, '0')}`;
    const date = order.entryDate || format(parseISO(order.createdAt), 'dd/MM/yyyy');
    const technician = currentUser?.name || 'Não informado';
    const appUrl = window.location.origin;
    const customerQrUrl = `${appUrl}/?osId=${order.id}&mode=status`;
    const techQrUrl = `${appUrl}/?osId=${order.id}&mode=tech`;
    
    const customerQrImg = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(customerQrUrl)}`;
    const techQrImg = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(techQrUrl)}`;

    let content = '';

    if (formatType === 'thermal') {
      content = `
        <html>
          <head>
            <style>
              @page { margin: 0; }
              body { font-family: 'Courier New', Courier, monospace; width: 80mm; padding: 5mm; font-size: 12px; color: #000; margin: 0; }
              .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 5px; margin-bottom: 10px; }
              .section { margin-bottom: 10px; }
              .label { font-weight: bold; }
              .footer { border-top: 1px dashed #000; padding-top: 5px; margin-top: 10px; text-align: center; font-size: 10px; }
              .signature { margin-top: 30px; border-top: 1px solid #000; text-align: center; padding-top: 5px; }
              table { width: 100%; border-collapse: collapse; }
              th { text-align: left; border-bottom: 1px solid #000; }
              .qr-container { text-align: center; margin-top: 10px; }
              .qr-container img { width: 100px; height: 100px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h3 style="margin: 0;">ORDEM DE SERVIÇO</h3>
              <p style="margin: 5px 0;">${osNumber}</p>
            </div>
            <div class="section">
              <p style="margin: 2px 0;"><span class="label">Data:</span> ${date}</p>
              <p style="margin: 2px 0;"><span class="label">Cliente:</span> ${customer.firstName} ${customer.lastName}</p>
              <p style="margin: 2px 0;"><span class="label">Equipamento:</span> ${order.equipmentBrand} ${order.equipmentModel}</p>
              <p style="margin: 2px 0;"><span class="label">S/N:</span> ${order.equipmentSerial || 'N/A'}</p>
            </div>
            <div class="section">
              <p style="margin: 2px 0;"><span class="label">Status:</span> ${order.status}</p>
              <p style="margin: 2px 0;"><span class="label">Problema:</span> ${order.reportedProblem || 'N/A'}</p>
            </div>
            ${type === 'complete' ? `
              <div class="section">
                <p style="margin: 2px 0;"><span class="label">Análise:</span> ${order.technicalAnalysis || 'N/A'}</p>
                <p style="margin: 2px 0;"><span class="label">Serviços:</span> ${order.servicesPerformed || 'N/A'}</p>
              </div>
              ${order.partsUsed && order.partsUsed.length > 0 ? `
                <div class="section">
                  <p class="label" style="margin-bottom: 5px;">Peças:</p>
                  <table>
                    <thead><tr><th>Item</th><th>Qtd</th><th>Sub</th></tr></thead>
                    <tbody>
                      ${order.partsUsed.map(p => `<tr><td>${p.name}</td><td>${p.quantity}</td><td>${formatCurrency(p.subtotal)}</td></tr>`).join('')}
                    </tbody>
                  </table>
                </div>
              ` : ''}
              <div class="section" style="text-align: right; margin-top: 10px;">
                <p style="margin: 0;"><span class="label">Total:</span> ${formatCurrency(order.totalAmount || 0)}</p>
              </div>
            ` : ''}
            <div class="section">
              <p style="margin: 5px 0;"><span class="label">Técnico:</span> ${technician}</p>
            </div>
            <div class="qr-container">
              <p style="font-size: 10px; margin-bottom: 5px;">Acompanhe sua OS (CLIENTE):</p>
              <img src="${customerQrImg}" />
            </div>
            <div class="qr-container" style="margin-top: 10px; border-top: 1px dashed #000; padding-top: 10px;">
              <p style="font-size: 10px; margin-bottom: 5px;">Área do Técnico (Anexar Fotos):</p>
              <img src="${techQrImg}" />
            </div>
            <div class="signature">
              Assinatura do Cliente
            </div>
            <div class="footer">
              Obrigado pela preferência!
            </div>
            <script>window.onload = () => { window.print(); setTimeout(() => window.close(), 500); }</script>
          </body>
        </html>
      `;
    } else {
      // A4 Layout
      content = `
        <html>
          <head>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; line-height: 1.5; background: #fff; }
              .header { display: flex; justify-content: space-between; border-bottom: 3px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }
              .logo-area h1 { margin: 0; color: #3b82f6; font-size: 28px; letter-spacing: -1px; }
              .logo-area p { margin: 5px 0 0 0; color: #64748b; font-size: 14px; }
              .os-info { text-align: right; }
              .os-number { font-size: 32px; font-weight: 800; color: #3b82f6; line-height: 1; }
              .os-date { color: #64748b; font-size: 14px; margin-top: 5px; }
              .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
              .box { border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; background: #f8fafc; }
              .box-title { font-weight: 800; text-transform: uppercase; font-size: 11px; color: #3b82f6; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; letter-spacing: 1px; }
              .box p { margin: 6px 0; font-size: 14px; }
              .box p strong { color: #475569; width: 100px; display: inline-block; }
              .full-box { border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; margin-bottom: 30px; }
              table { width: 100%; border-collapse: collapse; margin-top: 15px; }
              th { background: #f1f5f9; padding: 12px; text-align: left; border-bottom: 2px solid #e2e8f0; font-size: 12px; text-transform: uppercase; color: #64748b; }
              td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
              .total-section { text-align: right; margin-top: 30px; padding: 20px; background: #f8fafc; border-radius: 12px; }
              .total-label { font-size: 14px; color: #64748b; }
              .total-value { font-size: 24px; font-weight: 800; color: #3b82f6; display: block; }
              .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; margin-top: 80px; }
              .sig-box { border-top: 2px solid #cbd5e1; text-align: center; padding-top: 15px; font-size: 13px; color: #64748b; }
              .qr-area { display: flex; align-items: center; gap: 20px; margin-top: 40px; padding: 20px; border: 1px dashed #e2e8f0; border-radius: 12px; }
              .qr-text { flex: 1; }
              .qr-text h4 { margin: 0; color: #3b82f6; }
              .qr-text p { margin: 5px 0 0 0; font-size: 12px; color: #64748b; }
              @media print { body { padding: 0; } .no-print { display: none; } }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="logo-area">
                <h1>ORDEM DE SERVIÇO</h1>
                <p>Assistência Técnica Especializada</p>
              </div>
              <div class="os-info">
                <div class="os-number">${osNumber}</div>
                <div class="os-date">Entrada: ${date}</div>
              </div>
            </div>

            <div class="grid">
              <div class="box">
                <div class="box-title">Dados do Cliente</div>
                <p><strong>Nome:</strong> ${customer.firstName} ${customer.lastName}</p>
                <p><strong>Telefone:</strong> ${customer.phone}</p>
                <p><strong>CPF:</strong> ${customer.cpf || 'Não informado'}</p>
              </div>
              <div class="box">
                <div class="box-title">Dados do Equipamento</div>
                <p><strong>Marca:</strong> ${order.equipmentBrand}</p>
                <p><strong>Modelo:</strong> ${order.equipmentModel}</p>
                <p><strong>Série:</strong> ${order.equipmentSerial || 'N/A'}</p>
                <p><strong>Senha:</strong> ${order.customerPassword || 'N/A'}</p>
              </div>
            </div>

            <div class="full-box">
              <div class="box-title">Informações do Serviço</div>
              <p><strong>Status Atual:</strong> ${order.status}</p>
              <p><strong>Problema Relatado:</strong> ${order.reportedProblem || 'Não informado'}</p>
              ${type === 'complete' ? `
                <p><strong>Análise Técnica:</strong> ${order.technicalAnalysis || 'Pendente'}</p>
                <p><strong>Serviços Realizados:</strong> ${order.servicesPerformed || 'Pendente'}</p>
              ` : ''}
            </div>

            ${type === 'complete' && order.partsUsed && order.partsUsed.length > 0 ? `
              <div class="full-box">
                <div class="box-title">Peças e Componentes</div>
                <table>
                  <thead>
                    <tr>
                      <th>Descrição</th>
                      <th>Quantidade</th>
                      <th>Vlr. Unitário</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${order.partsUsed.map(p => `
                      <tr>
                        <td>${p.name}</td>
                        <td>${p.quantity}</td>
                        <td>${formatCurrency(p.unitPrice)}</td>
                        <td>${formatCurrency(p.subtotal)}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            ` : ''}

            <div class="total-section">
              <span class="total-label">Valor Total do Serviço</span>
              <span class="total-value">${formatCurrency(order.totalAmount || 0)}</span>
              <p style="font-size: 12px; color: #64748b; margin-top: 10px;">Técnico Responsável: ${technician}</p>
            </div>

            <div class="qr-area">
              <div style="display: flex; flex-direction: column; align-items: center; gap: 10px; border-right: 1px dashed #e2e8f0; padding-right: 20px;">
                <img src="${customerQrImg}" width="100" height="100" />
                <div class="qr-text" style="text-align: center;">
                  <h4 style="font-size: 12px;">CLIENTE</h4>
                  <p style="font-size: 10px;">Acompanhe o Status</p>
                </div>
              </div>
              <div style="display: flex; flex-direction: column; align-items: center; gap: 10px; padding-left: 20px;">
                <img src="${techQrImg}" width="100" height="100" />
                <div class="qr-text" style="text-align: center;">
                  <h4 style="font-size: 12px;">TÉCNICO</h4>
                  <p style="font-size: 10px;">Anexar Fotos Rápido</p>
                </div>
              </div>
              <div class="qr-text" style="margin-left: 20px;">
                <h4>Acompanhe seu Serviço</h4>
                <p>Escaneie o código de CLIENTE para ver o status em tempo real. O código de TÉCNICO é para uso interno da equipe.</p>
              </div>
            </div>

            <div class="signatures">
              <div class="sig-box">
                <strong>${customer.firstName} ${customer.lastName}</strong><br/>
                Assinatura do Cliente
              </div>
              <div class="sig-box">
                <strong>${technician}</strong><br/>
                Assinatura do Técnico
              </div>
            </div>

            <script>window.onload = () => { window.print(); setTimeout(() => window.close(), 500); }</script>
          </body>
        </html>
      `;
    }

    printWindow.document.write(content);
    printWindow.document.close();
  };

  const handlePrintReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const technician = currentUser?.name || 'Não informado';
    const date = format(new Date(), 'dd/MM/yyyy HH:mm');

    const content = `
      <html>
        <head>
          <title>Relatório de Ordens de Serviço</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
            h1 { color: #1152d4; margin-bottom: 5px; }
            .meta { font-size: 12px; color: #666; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background: #f8fafc; padding: 10px; text-align: left; border: 1px solid #ddd; font-size: 12px; text-transform: uppercase; }
            td { padding: 10px; border: 1px solid #eee; font-size: 12px; }
            .status { font-weight: bold; text-transform: uppercase; font-size: 10px; }
            .total { font-weight: bold; text-align: right; }
            .footer { margin-top: 30px; font-size: 10px; text-align: center; color: #999; }
          </style>
        </head>
        <body>
          <h1>Relatório de Ordens de Serviço</h1>
          <div class="meta">
            Gerado em: ${date} | Técnico: ${technician} | Total de Registros: ${filteredOrders.length}
          </div>
          <table>
            <thead>
              <tr>
                <th>OS</th>
                <th>Cliente</th>
                <th>Equipamento</th>
                <th>Entrada</th>
                <th>Status</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${filteredOrders.map(order => {
                const customer = customers.find(c => c.id === order.customerId);
                const customerName = customer ? `${customer.firstName} ${customer.lastName}` : 'Não encontrado';
                return `
                  <tr>
                    <td>#${order.id.toString().padStart(4, '0')}</td>
                    <td>${customerName}</td>
                    <td>${order.equipmentBrand} ${order.equipmentModel}</td>
                    <td>${order.entryDate || format(parseISO(order.createdAt), 'dd/MM/yyyy')}</td>
                    <td><span class="status">${order.status}</span></td>
                    <td class="total">${formatCurrency(order.totalAmount || 0)}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
          <div class="footer">
            Sistema de Gestão Profissional - ${format(new Date(), 'yyyy')}
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
  };

  const stats = {
    awaiting: orders.filter(o => o.status === 'Aguardando Análise' || o.status === 'Aguardando Peças').length,
    active: orders.filter(o => o.status === 'Em Reparo' || o.status === 'Aprovado').length,
    ready: orders.filter(o => o.status === 'Pronto' || o.status === 'Concluído').length,
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Ordens de Serviço</h2>
          <p className="text-slate-500 font-medium">Gerencie manutenções e reparos técnicos</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handlePrintReport}
            className="h-12 px-6 rounded-xl bg-white/5 border border-white/10 text-slate-300 font-bold text-sm hover:bg-white/10 transition-all flex items-center gap-2"
          >
            <Printer size={20} />
            Relatório
          </button>
          <button 
            onClick={() => setShowStatusManager(true)}
            className="h-12 px-6 rounded-xl bg-white/5 border border-white/10 text-slate-300 font-bold text-sm hover:bg-white/10 transition-all flex items-center gap-2"
          >
            <Tag size={20} />
            Status
          </button>
          <button 
            onClick={() => {
              setEditingOrder(null);
              setNewOrder({
                customerId: 0,
                equipmentBrand: '',
                equipmentModel: '',
                equipmentColor: '',
                equipmentSerial: '',
                reportedProblem: '',
                status: 'Aguardando Análise',
                technicalAnalysis: '',
                servicesPerformed: '',
                serviceFee: '',
                totalAmount: '',
                finalObservations: '',
                entryDate: format(new Date(), 'yyyy-MM-dd'),
                analysisPrediction: '',
                customerPassword: '',
                accessories: '',
                ramInfo: '',
                ssdInfo: '',
                priority: 'medium',
                partsUsed: []
              });
              setIsAdding(true);
            }}
            className="h-12 px-6 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-2"
          >
            <Plus size={20} />
            Nova Ordem
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-6 border-l-4 border-l-amber-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Aguardando</p>
              <h3 className="text-3xl font-black mt-1">{stats.awaiting}</h3>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
              <Clock size={24} />
            </div>
          </div>
        </div>
        <div className="glass-card p-6 border-l-4 border-l-blue-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Em Manutenção</p>
              <h3 className="text-3xl font-black mt-1">{stats.active}</h3>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
              <Wrench size={24} />
            </div>
          </div>
        </div>
        <div className="glass-card p-6 border-l-4 border-l-emerald-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pronto para Retirada</p>
              <h3 className="text-3xl font-black mt-1">{stats.ready}</h3>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
              <CheckCircle size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text"
              placeholder="Buscar por cliente, equipamento ou número da OS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-white/5 border border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary outline-none text-slate-200 [&>option]:bg-slate-900"
            >
              <option value="all">Todos os Status</option>
              {statuses.map(s => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
            
            {/* Column Visibility Toggle */}
            <div className="relative group">
              <button className="h-12 w-12 flex items-center justify-center bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white transition-all">
                <Filter size={20} />
              </button>
              <div className="absolute right-0 top-full mt-2 w-48 glass-modal p-4 hidden group-hover:block z-50">
                <h5 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Exibir Colunas</h5>
                <div className="space-y-2">
                  {Object.entries(visibleColumns).map(([key, visible]) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={visible} 
                        onChange={() => setVisibleColumns(prev => ({ ...prev, [key]: !prev[key] }))}
                        className="rounded border-white/10 bg-white/5 text-primary"
                      />
                      <span className="text-xs text-slate-300 capitalize">
                        {key === 'id' ? 'Nº OS' : 
                         key === 'status' ? 'Status' : 
                         key === 'priority' ? 'Prioridade' : 
                         key === 'entryDate' ? 'Entrada' : 
                         key === 'prediction' ? 'Previsão' : 'Total'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredOrders.map(order => (
          <div key={order.id} className="glass-card p-5 group hover:border-primary/30 transition-all">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Briefcase size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-1">
                    {visibleColumns.id && <span className="text-sm font-bold text-primary">#OS-{order.id.toString().padStart(4, '0')}</span>}
                    {visibleColumns.status && (
                      <span 
                        className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border"
                        style={getStatusColor(order.status)}
                      >
                        {order.status}
                      </span>
                    )}
                    {visibleColumns.priority && order.priority === 'high' && (
                      <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-rose-500/10 text-rose-500 border border-rose-500/20">
                        <AlertTriangle size={10} /> Urgente
                      </span>
                    )}
                    {visibleColumns.prediction && order.analysisPrediction && new Date(order.analysisPrediction) < new Date() && order.status !== 'Concluído' && (
                      <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-red-500/10 text-red-500 border border-red-500/20 animate-pulse">
                        <Clock size={10} /> Atrasado
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-0.5">
                    <h4 className="font-black text-xl text-white tracking-tight">
                      {order.firstName} {order.lastName}
                    </h4>
                    <p className="text-sm font-bold text-primary/80 flex items-center gap-2">
                      <Smartphone size={14} />
                      {order.equipmentBrand} {order.equipmentModel}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2 mt-4">
                    {visibleColumns.entryDate && (
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Calendar size={14} className="text-slate-600" />
                        <span>Entrada: <span className="text-slate-300 font-medium">{order.entryDate || format(parseISO(order.createdAt), 'dd/MM/yyyy')}</span></span>
                      </div>
                    )}
                    {visibleColumns.prediction && order.analysisPrediction && (
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Clock size={14} className="text-slate-600" />
                        <span>Previsão: <span className="text-slate-300 font-medium">{format(parseISO(order.analysisPrediction), 'dd/MM/yyyy')}</span></span>
                      </div>
                    )}
                    {visibleColumns.total && (
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Wallet size={14} className="text-slate-600" />
                        <span>Total: <span className="text-emerald-400 font-bold">{formatCurrency(order.totalAmount || 0)}</span></span>
                      </div>
                    )}
                  </div>

                  {order.reportedProblem && (
                    <p className="text-xs text-slate-500 mt-3 line-clamp-1 max-w-2xl bg-white/5 p-2 rounded-lg border border-white/5">
                      <span className="font-bold text-slate-400">Problema:</span> {order.reportedProblem}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex flex-row md:flex-col justify-between items-end gap-2 shrink-0">
                <div className="text-right hidden md:block">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Criado em</p>
                  <p className="text-xs font-medium text-slate-300">{format(parseISO(order.createdAt), "dd MMM yyyy", { locale: ptBR })}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowQRCodeModal(true);
                    }}
                    className="p-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-primary hover:bg-primary/10 transition-all border border-white/5"
                    title="Ver QR Code"
                  >
                    <QrCode size={20} />
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowWhatsAppModal(true);
                    }}
                    className="p-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 transition-all border border-white/5"
                    title="Enviar via WhatsApp"
                  >
                    <MessageCircle size={20} />
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowPrintModal(true);
                    }}
                    className="p-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 transition-all border border-white/5"
                    title="Imprimir OS"
                  >
                    <Printer size={20} />
                  </button>
                  <button 
                    onClick={() => handleEdit(order)}
                    className="p-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-primary hover:bg-primary/10 transition-all border border-white/5"
                    title="Editar"
                  >
                    <Edit size={20} />
                  </button>
                  <button 
                    onClick={() => {
                      // Professional Deletion Logic with multiple checks
                      const hasParts = order.partsUsed && order.partsUsed.length > 0;
                      const isCompleted = order.status === 'Concluído' || order.status === 'Entregue';
                      const hasPayments = clientPayments.some(p => p.description?.includes(`#OS-${order.id}`));
                      
                      let warningMessage = `Tem certeza que deseja excluir a Ordem de Serviço #OS-${order.id.toString().padStart(4, '0')}?`;
                      
                      if (isCompleted) {
                        warningMessage += `\n\n⚠️ ATENÇÃO: Esta ordem está com status "${order.status}". Excluir ordens finalizadas pode afetar seus relatórios financeiros e histórico do cliente.`;
                      }
                      
                      if (hasParts) {
                        warningMessage += `\n\n⚠️ ATENÇÃO: Existem ${order.partsUsed.length} peças vinculadas a esta ordem. A exclusão NÃO retornará automaticamente estas peças ao estoque.`;
                      }

                      if (hasPayments) {
                        warningMessage += `\n\n⚠️ ATENÇÃO: Existem pagamentos registrados para esta Ordem de Serviço no módulo de Contas a Receber. Recomenda-se verificar antes de excluir.`;
                      }

                      if (window.confirm(warningMessage)) {
                        onDeleteOrder(order.id);
                      }
                    }}
                    className="p-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all border border-white/5"
                    title="Excluir"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {filteredOrders.length === 0 && (
          <div className="text-center py-12 glass-card">
            <Briefcase size={48} className="mx-auto text-slate-600 mb-4 opacity-50" />
            <p className="text-slate-400 font-medium">Nenhuma ordem de serviço encontrada.</p>
          </div>
        )}
      </div>

      {/* WhatsApp Modal */}
      <AnimatePresence>
        {showWhatsAppModal && selectedOrder && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowWhatsAppModal(false)}
              className="absolute inset-0 bg-bg-dark/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md glass-modal p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                    <MessageCircle size={24} />
                  </div>
                  <h3 className="text-xl font-bold">Enviar via WhatsApp</h3>
                </div>
                <button onClick={() => setShowWhatsAppModal(false)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 text-slate-400 hover:text-white transition-all">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-xs text-slate-400 uppercase font-black tracking-widest mb-2">Selecione o Formato</p>
                  <div className="grid grid-cols-1 gap-3">
                    <button 
                      onClick={() => setWhatsappConfig({ type: 'simplified' })}
                      className={cn(
                        "p-4 rounded-xl border transition-all text-left group",
                        whatsappConfig.type === 'simplified' ? "bg-primary/10 border-primary text-primary" : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                      )}
                    >
                      <p className="font-bold text-sm">Ordem Simplificada</p>
                      <p className="text-xs opacity-70">Apenas status e informações básicas.</p>
                    </button>
                    <button 
                      onClick={() => setWhatsappConfig({ type: 'complete' })}
                      className={cn(
                        "p-4 rounded-xl border transition-all text-left group",
                        whatsappConfig.type === 'complete' ? "bg-primary/10 border-primary text-primary" : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                      )}
                    >
                      <p className="font-bold text-sm">Ordem Completa</p>
                      <p className="text-xs opacity-70">Inclui análise, serviços e peças utilizadas.</p>
                    </button>
                  </div>
                </div>

                <button 
                  onClick={async () => {
                    await handleSendWhatsApp(selectedOrder, whatsappConfig.type);
                    setShowWhatsAppModal(false);
                  }}
                  className="w-full h-14 bg-emerald-500 text-white rounded-2xl font-black shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 group"
                >
                  <MessageCircle size={24} className="group-hover:scale-110 transition-transform" />
                  Enviar Agora
                </button>
                
                <p className="text-[10px] text-center text-slate-500 font-medium">
                  O cliente receberá um link direto para acompanhar a OS em tempo real.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQRCodeModal && selectedOrder && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowQRCodeModal(false)}
              className="absolute inset-0 bg-bg-dark/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm glass-modal p-8 text-center"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">QR Code da OS</h3>
                <button onClick={() => setShowQRCodeModal(false)} className="text-slate-400 hover:text-white">
                  <X size={24} />
                </button>
              </div>

              <div className="bg-white p-6 rounded-3xl inline-block mb-6 shadow-2xl">
                <QRCodeSVG 
                  value={`${window.location.origin}/?osId=${selectedOrder.id}`}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <div className="space-y-2">
                <p className="text-lg font-black text-white">#OS-{selectedOrder.id.toString().padStart(4, '0')}</p>
                <p className="text-sm text-slate-400">Escaneie para acessar os detalhes, fotos e status desta ordem de serviço em tempo real.</p>
              </div>

              <div className="mt-8 p-4 rounded-2xl bg-primary/5 border border-primary/10 text-left">
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Dica do Técnico</p>
                <p className="text-xs text-slate-400">Você pode imprimir este QR Code na etiqueta térmica para colar no equipamento do cliente.</p>
              </div>

              <button 
                onClick={() => setShowQRCodeModal(false)}
                className="w-full h-14 bg-white/5 text-white rounded-2xl font-black mt-8 border border-white/10 hover:bg-white/10 transition-all"
              >
                Fechar
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Print Modal */}
      <AnimatePresence>
        {showPrintModal && selectedOrder && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPrintModal(false)}
              className="absolute inset-0 bg-bg-dark/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md glass-modal p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Imprimir Ordem</h3>
                <button onClick={() => setShowPrintModal(false)} className="text-slate-400 hover:text-white">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Tipo de Ordem</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => setPrintConfig({ ...printConfig, type: 'simplified' })}
                      className={cn(
                        "h-12 rounded-xl border font-bold text-xs transition-all",
                        printConfig.type === 'simplified' ? "bg-primary/10 border-primary text-primary" : "bg-white/5 border-white/10 text-slate-400"
                      )}
                    >
                      Simplificada
                    </button>
                    <button 
                      onClick={() => setPrintConfig({ ...printConfig, type: 'complete' })}
                      className={cn(
                        "h-12 rounded-xl border font-bold text-xs transition-all",
                        printConfig.type === 'complete' ? "bg-primary/10 border-primary text-primary" : "bg-white/5 border-white/10 text-slate-400"
                      )}
                    >
                      Completa
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Formato de Impressão</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => setPrintConfig({ ...printConfig, format: 'a4' })}
                      className={cn(
                        "h-12 rounded-xl border font-bold text-xs transition-all",
                        printConfig.format === 'a4' ? "bg-primary/10 border-primary text-primary" : "bg-white/5 border-white/10 text-slate-400"
                      )}
                    >
                      Folha A4
                    </button>
                    <button 
                      onClick={() => setPrintConfig({ ...printConfig, format: 'thermal' })}
                      className={cn(
                        "h-12 rounded-xl border font-bold text-xs transition-all",
                        printConfig.format === 'thermal' ? "bg-primary/10 border-primary text-primary" : "bg-white/5 border-white/10 text-slate-400"
                      )}
                    >
                      Térmica (80mm)
                    </button>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    handlePrint(selectedOrder, printConfig.type, printConfig.format);
                    setShowPrintModal(false);
                  }}
                  className="w-full h-12 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                >
                  <Printer size={20} />
                  Imprimir / Gerar PDF
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Status Manager Modal */}
      <AnimatePresence>
        {showStatusManager && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowStatusManager(false)}
              className="absolute inset-0 bg-bg-dark/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg glass-modal p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Gerenciar Status</h3>
                <button onClick={() => setShowStatusManager(false)} className="text-slate-400 hover:text-white">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-slate-400">Personalize os status das suas ordens de serviço.</p>
                  <button 
                    onClick={() => setIsAddingStatus(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-bold border border-primary/20 hover:bg-primary/20 transition-all"
                  >
                    <Plus size={14} /> Novo Status
                  </button>
                </div>

                {isAddingStatus && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4 overflow-hidden"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Nome</label>
                        <input 
                          value={newStatus.name}
                          onChange={(e) => setNewStatus({...newStatus, name: e.target.value})}
                          className="w-full h-10 bg-white/5 border border-white/10 rounded-lg px-3 text-sm font-bold focus:ring-1 focus:ring-primary outline-none"
                          placeholder="Ex: Em Teste"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Cor</label>
                        <input 
                          type="color"
                          value={newStatus.color}
                          onChange={(e) => setNewStatus({...newStatus, color: e.target.value})}
                          className="w-full h-10 bg-white/5 border border-white/10 rounded-lg px-1 py-1 focus:ring-1 focus:ring-primary outline-none cursor-pointer"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setIsAddingStatus(false)}
                        className="flex-1 h-10 rounded-lg font-bold text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button 
                        onClick={() => {
                          if (!newStatus.name) return;
                          onAddStatus(newStatus);
                          setIsAddingStatus(false);
                          setNewStatus({ name: '', color: '#3b82f6', priority: 0 });
                        }}
                        className="flex-1 h-10 rounded-lg bg-primary text-white font-bold text-xs shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                      >
                        Adicionar
                      </button>
                    </div>
                  </motion.div>
                )}

                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                  {statuses.map(s => (
                    <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 group">
                      <div className="flex items-center gap-3">
                        <div className="h-4 w-4 rounded-full shadow-sm" style={{ backgroundColor: s.color }} />
                        <span className="text-sm font-bold">{s.name}</span>
                        {s.isDefault === 1 && <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 bg-white/10 text-slate-500 rounded">Padrão</span>}
                      </div>
                      {s.isDefault === 0 && (
                        <button 
                          onClick={() => onDeleteStatus(s.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="absolute inset-0 bg-bg-dark/95 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl glass-modal p-0 max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border-white/10"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                <div>
                  <h3 className="text-xl font-bold text-white">{editingOrder ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço'}</h3>
                  <p className="text-xs text-slate-400 mt-1">Preencha os dados técnicos e do cliente com atenção.</p>
                </div>
                <button onClick={() => setIsAdding(false)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-8 space-y-8 overflow-y-auto flex-1 custom-scrollbar">
                {/* Cliente e Data */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-primary ml-1 flex items-center gap-2 bg-primary/5 px-2 py-1 rounded-md w-fit mb-1">
                      <UserIcon size={12} /> Cliente <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <CustomerSearchSelect 
                        customers={customers}
                        selectedId={newOrder.customerId}
                        onSelect={(id) => setNewOrder({...newOrder, customerId: id})}
                        className="flex-1"
                      />
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onTriggerAddCustomer();
                        }}
                        className="h-14 w-14 flex items-center justify-center bg-primary/10 text-primary border border-primary/20 rounded-2xl hover:bg-primary/20 transition-all shadow-lg shadow-primary/5"
                        title="Adicionar Novo Cliente"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-primary ml-1 flex items-center gap-2 bg-primary/5 px-2 py-1 rounded-md w-fit mb-1">
                      <Calendar size={12} /> Data de Entrada <span className="text-rose-500">*</span>
                    </label>
                    <input 
                      type="date"
                      value={newOrder.entryDate}
                      onChange={(e) => setNewOrder({...newOrder, entryDate: e.target.value})}
                      className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-4 text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all [color-scheme:dark]"
                    />
                  </div>
                </div>

                {/* Equipamento */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-1 w-8 bg-primary rounded-full" />
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Dados do Equipamento</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Marca</label>
                        <button 
                          type="button"
                          onClick={() => setIsAddingBrand(true)}
                          className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all text-[10px] font-black uppercase tracking-widest border border-primary/20"
                        >
                          <Plus size={12} /> Nova
                        </button>
                      </div>
                      <select 
                        value={newOrder.equipmentBrand}
                        onChange={(e) => setNewOrder({...newOrder, equipmentBrand: e.target.value})}
                        className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-4 text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all hover:bg-white/10 [&>option]:bg-slate-900"
                      >
                        <option value="">Selecione a Marca</option>
                        {brands.map(b => (
                          <option key={b.id} value={b.name}>{b.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Modelo</label>
                        <button 
                          type="button"
                          onClick={() => {
                            if (!newOrder.equipmentBrand) {
                              alert("Selecione uma marca primeiro.");
                              return;
                            }
                            setIsAddingModel(true);
                          }}
                          className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all text-[10px] font-black uppercase tracking-widest border border-primary/20"
                        >
                          <Plus size={12} /> Novo
                        </button>
                      </div>
                      <select 
                        value={newOrder.equipmentModel}
                        onChange={(e) => setNewOrder({...newOrder, equipmentModel: e.target.value})}
                        className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-4 text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all hover:bg-white/10 [&>option]:bg-slate-900"
                      >
                        <option value="">Selecione o Modelo</option>
                        {models
                          .filter(m => {
                            const brand = brands.find(b => b.name === newOrder.equipmentBrand);
                            return brand ? m.brandId === brand.id : false;
                          })
                          .map(m => (
                            <option key={m.id} value={m.name}>{m.name}</option>
                          ))
                        }
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Cor do Equipamento</label>
                      <input 
                        value={newOrder.equipmentColor}
                        onChange={(e) => setNewOrder({...newOrder, equipmentColor: e.target.value})}
                        className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-4 text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all"
                        placeholder="Ex: Preto, Prata, Azul"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Nº de Série</label>
                      <input 
                        value={newOrder.equipmentSerial}
                        onChange={(e) => setNewOrder({...newOrder, equipmentSerial: e.target.value})}
                        className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-4 text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all"
                        placeholder="Opcional"
                      />
                    </div>
                  </div>
                </div>

                {/* Especificações e Senha */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                      <Cpu size={12} /> RAM
                    </label>
                    <input 
                      value={newOrder.ramInfo}
                      onChange={(e) => setNewOrder({...newOrder, ramInfo: e.target.value})}
                      className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-4 text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all"
                      placeholder="Ex: 8GB DDR4"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                      <HardDrive size={12} /> SSD/HD
                    </label>
                    <input 
                      value={newOrder.ssdInfo}
                      onChange={(e) => setNewOrder({...newOrder, ssdInfo: e.target.value})}
                      className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-4 text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all"
                      placeholder="Ex: 240GB SSD"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                      <Lock size={12} /> Senha do Equipamento
                    </label>
                    <input 
                      value={newOrder.customerPassword}
                      onChange={(e) => setNewOrder({...newOrder, customerPassword: e.target.value})}
                      className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-4 text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all"
                      placeholder="Opcional"
                    />
                  </div>
                </div>

                {/* Acessórios */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Acessórios Inclusos</label>
                  <input 
                    value={newOrder.accessories}
                    onChange={(e) => setNewOrder({...newOrder, accessories: e.target.value})}
                    className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-4 text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all"
                    placeholder="Ex: Carregador, Capa, Cabo USB..."
                  />
                </div>

                {/* Problema e Análise */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-rose-500 ml-1 flex items-center gap-2 bg-rose-500/5 px-2 py-1 rounded-md w-fit mb-1">
                      <AlertCircle size={12} /> Problema Relatado <span className="text-rose-500">*</span>
                    </label>
                    <textarea 
                      value={newOrder.reportedProblem}
                      onChange={(e) => setNewOrder({...newOrder, reportedProblem: e.target.value})}
                      className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
                      placeholder="Descreva o defeito informado pelo cliente..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-amber-500 ml-1 flex items-center gap-2 bg-amber-500/5 px-2 py-1 rounded-md w-fit mb-1">
                      <ClipboardList size={12} /> Análise Técnica
                    </label>
                    <textarea 
                      value={newOrder.technicalAnalysis}
                      onChange={(e) => setNewOrder({...newOrder, technicalAnalysis: e.target.value})}
                      className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
                      placeholder="Diagnóstico técnico inicial..."
                    />
                  </div>
                </div>

                {/* Foto do Equipamento */}
                <div ref={photoSectionRef} className="space-y-4 p-6 bg-white/5 rounded-3xl border border-white/10">
                  <div className="flex items-center gap-3 mb-2">
                    <Camera className="text-primary" size={20} />
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Foto do Equipamento</h4>
                  </div>
                  
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="w-full md:w-48 h-48 rounded-2xl border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden bg-slate-900/50 relative group">
                      {newOrder.arrivalPhotoUrl ? (
                        <>
                          <img src={newOrder.arrivalPhotoUrl} alt="Equipamento" className="w-full h-full object-cover" />
                          <button 
                            onClick={() => setNewOrder({...newOrder, arrivalPhotoUrl: ''})}
                            className="absolute top-2 right-2 p-1.5 bg-rose-500 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                          >
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <div className="text-center p-4">
                          <Camera size={32} className="mx-auto text-slate-600 mb-2" />
                          <p className="text-[10px] font-bold text-slate-500 uppercase">Nenhuma foto</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 space-y-4 w-full">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Anexar Foto (Arquivo)</label>
                        <input 
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setNewOrder({...newOrder, arrivalPhotoUrl: reader.result as string});
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-medium focus:ring-1 focus:ring-primary outline-none file:bg-primary file:border-none file:rounded-lg file:text-white file:text-[10px] file:font-bold file:px-3 file:py-1 file:mr-4 file:cursor-pointer"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Ou URL da Imagem</label>
                        <input 
                          value={newOrder.arrivalPhotoUrl || ''}
                          onChange={(e) => setNewOrder({...newOrder, arrivalPhotoUrl: e.target.value})}
                          className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-xs font-medium focus:ring-1 focus:ring-primary outline-none"
                          placeholder="https://exemplo.com/foto.jpg"
                        />
                      </div>
                      <div className="relative">
                        <input 
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setIsUploadingPhoto(true);
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setNewOrder({...newOrder, arrivalPhotoUrl: reader.result as string});
                                setIsUploadingPhoto(false);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                          id="photo-upload"
                        />
                        <label 
                          htmlFor="photo-upload"
                          className="flex items-center justify-center gap-2 w-full h-12 bg-primary/10 text-primary border border-primary/20 rounded-xl font-bold text-sm cursor-pointer hover:bg-primary/20 transition-all"
                        >
                          {isUploadingPhoto ? (
                            <div className="flex items-center gap-2">
                              <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                              Processando...
                            </div>
                          ) : (
                            <>
                              <Upload size={18} />
                              Anexar Foto do Celular/PC
                            </>
                          )}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status e Prioridade */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Status Atual</label>
                    <select 
                      value={newOrder.status}
                      onChange={(e) => setNewOrder({...newOrder, status: e.target.value})}
                      className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-4 text-sm font-bold focus:ring-2 focus:ring-primary outline-none text-slate-200 [&>option]:bg-slate-900 transition-all"
                    >
                      {statuses.map(s => (
                        <option key={s.id} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Prioridade</label>
                    <div className="flex gap-2">
                      {(['low', 'medium', 'high'] as const).map((p) => (
                        <button
                          key={p}
                          onClick={() => setNewOrder({...newOrder, priority: p})}
                          className={cn(
                            "flex-1 h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all",
                            newOrder.priority === p 
                              ? p === 'high' ? "bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-lg shadow-rose-500/5" : 
                                p === 'medium' ? "bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-lg shadow-amber-500/5" :
                                "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-lg shadow-emerald-500/5"
                              : "bg-white/5 text-slate-500 border-transparent hover:bg-white/10"
                          )}
                        >
                          {p === 'low' ? 'Baixa' : p === 'medium' ? 'Normal' : 'Urgente'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Peças Utilizadas */}
                <div className="space-y-4 pt-6 border-t border-white/5">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="h-1 w-8 bg-primary rounded-full" />
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                        <Package size={12} /> Peças Utilizadas
                      </h4>
                    </div>
                    <button 
                      onClick={() => setIsAddingPart(!isAddingPart)}
                      className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest border border-primary/20 hover:bg-primary/20 transition-all"
                    >
                      {isAddingPart ? <X size={14} /> : <Plus size={14} />}
                      {isAddingPart ? 'Fechar' : 'Adicionar Peça'}
                    </button>
                  </div>

                  {isAddingPart && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-3 p-6 rounded-3xl bg-white/5 border border-white/10 shadow-xl"
                    >
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input 
                          value={partSearch}
                          onChange={(e) => setPartSearch(e.target.value)}
                          placeholder="Buscar no inventário..."
                          className="w-full h-12 pl-12 pr-4 bg-white/5 border border-white/10 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary transition-all"
                        />
                      </div>
                      <div className="max-h-[200px] overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                        {inventoryItems
                          .filter(item => item.name.toLowerCase().includes(partSearch.toLowerCase()) && item.category === 'product')
                          .map(item => (
                            <button
                              key={item.id}
                              onClick={() => {
                                const existing = newOrder.partsUsed.find(p => p.id === item.id);
                                if (existing) {
                                  setNewOrder({
                                    ...newOrder,
                                    partsUsed: newOrder.partsUsed.map(p => p.id === item.id ? {...p, quantity: p.quantity + 1, subtotal: (p.quantity + 1) * p.unitPrice} : p)
                                  });
                                } else {
                                  setNewOrder({
                                    ...newOrder,
                                    partsUsed: [...newOrder.partsUsed, { id: item.id, name: item.name, quantity: 1, unitPrice: item.unitPrice, subtotal: item.unitPrice }]
                                  });
                                }
                                setPartSearch('');
                              }}
                              className="w-full flex justify-between items-center p-3 rounded-xl hover:bg-white/5 text-left transition-all group border border-transparent hover:border-white/5"
                            >
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-200">{item.name}</span>
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Estoque: {item.stockLevel}</span>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="text-sm font-black text-primary">{formatCurrency(item.unitPrice)}</span>
                                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                  <Plus size={16} />
                                </div>
                              </div>
                            </button>
                          ))}
                      </div>
                    </motion.div>
                  )}

                  <div className="space-y-3">
                    {newOrder.partsUsed.map((part, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 group hover:border-primary/20 transition-all">
                        <div className="flex-1">
                          <p className="text-sm font-bold text-slate-200">{part.name}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{formatCurrency(part.unitPrice)} x {part.quantity}</p>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-3 bg-white/5 p-1 rounded-xl border border-white/10">
                            <button 
                              onClick={() => {
                                if (part.quantity > 1) {
                                  setNewOrder({
                                    ...newOrder,
                                    partsUsed: newOrder.partsUsed.map((p, i) => i === idx ? {...p, quantity: p.quantity - 1, subtotal: (p.quantity - 1) * p.unitPrice} : p)
                                  });
                                }
                              }}
                              className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                            >
                              <ChevronDown size={16} />
                            </button>
                            <span className="text-sm font-black w-6 text-center">{part.quantity}</span>
                            <button 
                              onClick={() => {
                                setNewOrder({
                                  ...newOrder,
                                  partsUsed: newOrder.partsUsed.map((p, i) => i === idx ? {...p, quantity: p.quantity + 1, subtotal: (p.quantity + 1) * p.unitPrice} : p)
                                });
                              }}
                              className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                            >
                              <ChevronUp size={16} />
                            </button>
                          </div>
                          <span className="text-sm font-black text-slate-300 w-24 text-right">{formatCurrency(part.subtotal)}</span>
                          <button 
                            onClick={() => {
                              setNewOrder({
                                ...newOrder,
                                partsUsed: newOrder.partsUsed.filter((_, i) => i !== idx)
                              });
                            }}
                            className="p-2 rounded-xl text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Seção de Fechamento (Apenas Edição) */}
                {editingOrder && (
                  <div className="space-y-6 pt-6 border-t border-white/5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-1 w-8 bg-emerald-500 rounded-full" />
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Fechamento e Valores</h4>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 ml-1">Serviços Realizados</label>
                      <textarea 
                        value={newOrder.servicesPerformed}
                        onChange={(e) => setNewOrder({...newOrder, servicesPerformed: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none min-h-[100px] resize-none transition-all"
                        placeholder="Descreva o que foi feito no equipamento..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Mão de Obra (R$)</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">R$</span>
                          <input 
                            type="number"
                            step="0.01"
                            value={newOrder.serviceFee}
                            onChange={(e) => {
                              const fee = parseFloat(e.target.value) || 0;
                              const partsTotal = newOrder.partsUsed.reduce((acc, p) => acc + p.subtotal, 0);
                              setNewOrder({...newOrder, serviceFee: e.target.value, totalAmount: (fee + partsTotal).toFixed(2)});
                            }}
                            className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-sm font-black focus:ring-2 focus:ring-primary outline-none transition-all"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-primary ml-1">Valor Total (R$)</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-bold">R$</span>
                          <input 
                            type="number"
                            step="0.01"
                            value={newOrder.totalAmount}
                            onChange={(e) => setNewOrder({...newOrder, totalAmount: e.target.value})}
                            className="w-full h-14 bg-primary/10 border border-primary/20 rounded-2xl pl-12 pr-4 text-sm font-black text-primary focus:ring-2 focus:ring-primary outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 items-center bg-primary/5 p-6 rounded-3xl border border-primary/20 shadow-inner">
                      <div className="bg-white p-4 rounded-2xl shadow-2xl transform hover:scale-105 transition-transform cursor-pointer" onClick={() => setShowQRCodeModal(true)}>
                        <QRCodeSVG 
                          value={`${window.location.origin}/?osId=${editingOrder.id}`}
                          size={140}
                          level="H"
                          includeMargin={true}
                        />
                      </div>
                      <div className="flex-1 text-center md:text-left">
                        <div className="flex items-center gap-2 mb-2 justify-center md:justify-start">
                          <QrCode size={16} className="text-primary" />
                          <h5 className="text-sm font-black text-white uppercase tracking-widest">QR Code de Acompanhamento</h5>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">Este código permite que o cliente ou técnico acesse esta OS rapidamente via celular. Clique no QR Code para ampliar.</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Observações Finais</label>
                      <textarea 
                        value={newOrder.finalObservations}
                        onChange={(e) => setNewOrder({...newOrder, finalObservations: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-primary outline-none min-h-[80px] resize-none transition-all"
                        placeholder="Garantia, recomendações, etc..."
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-white/5 bg-white/5 flex gap-4">
                <button 
                  onClick={() => setIsAdding(false)}
                  className="flex-1 h-14 rounded-2xl font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSave}
                  className="flex-[2] h-14 rounded-2xl bg-primary text-white font-black shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                >
                  <Check size={20} />
                  {editingOrder ? 'Salvar Alterações' : 'Gerar Ordem de Serviço'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

        {/* Modal de Status para o Cliente */}
        <AnimatePresence>
          {showStatusOnly && (
            <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-bg-dark/90 backdrop-blur-md">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full max-w-lg glass-modal p-8 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-blue-500 to-primary animate-gradient-x" />
                
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-2xl font-black text-white tracking-tight">Status da Ordem</h3>
                    <p className="text-slate-500 font-medium">OS #{showStatusOnly.id.toString().padStart(4, '0')}</p>
                  </div>
                  <button 
                    onClick={() => setShowStatusOnly(null)}
                    className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-8">
                  <div className="p-6 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center text-center">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">Status Atual</div>
                    <div 
                      className="px-6 py-3 rounded-2xl text-lg font-black shadow-lg"
                      style={{ 
                        backgroundColor: `${statuses.find(s => s.name === showStatusOnly.status)?.color || '#3b82f6'}20`,
                        color: statuses.find(s => s.name === showStatusOnly.status)?.color || '#3b82f6',
                        border: `1px solid ${statuses.find(s => s.name === showStatusOnly.status)?.color || '#3b82f6'}40`
                      }}
                    >
                      {showStatusOnly.status}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Equipamento</div>
                      <div className="text-sm font-bold text-white">{showStatusOnly.equipmentBrand} {showStatusOnly.equipmentModel}</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Cor</div>
                      <div className="text-sm font-bold text-white">{showStatusOnly.equipmentColor || 'Não informada'}</div>
                    </div>
                  </div>

                  {showStatusOnly.analysisPrediction && (
                    <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                        <Calendar size={20} />
                      </div>
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-primary/60">Previsão de Entrega</div>
                        <div className="text-sm font-bold text-white">{format(parseISO(showStatusOnly.analysisPrediction), 'dd/MM/yyyy')}</div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                      <div className="h-px flex-1 bg-white/10" />
                      Histórico de Fotos
                      <div className="h-px flex-1 bg-white/10" />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3">
                      {showStatusOnly.photos && showStatusOnly.photos.length > 0 ? (
                        showStatusOnly.photos.map((photo, idx) => (
                          <div key={idx} className="aspect-square rounded-xl overflow-hidden border border-white/10 bg-white/5">
                            <img src={photo} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                          </div>
                        ))
                      ) : (
                        <div className="col-span-3 py-8 text-center text-slate-600 text-xs font-medium italic">
                          Nenhuma foto anexada ainda.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setShowStatusOnly(null)}
                  className="w-full h-14 mt-8 bg-white/5 border border-white/10 text-white font-bold rounded-2xl hover:bg-white/10 transition-all"
                >
                  Fechar
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      {/* Modal Adicionar Marca */}
      <AnimatePresence>
        {isAddingBrand && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg-dark/90 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md glass-modal p-8 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-blue-500" />
              
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tight">Nova Marca</h3>
                  <p className="text-slate-500 text-xs font-medium uppercase tracking-widest mt-1">Cadastro de Fabricante</p>
                </div>
                <button 
                  onClick={() => setIsAddingBrand(false)} 
                  className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Nome da Marca</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-primary transition-colors">
                      <Tag size={18} />
                    </div>
                    <input 
                      type="text"
                      value={newBrandName}
                      onChange={(e) => setNewBrandName(e.target.value)}
                      className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-slate-700"
                      placeholder="Ex: Apple, Samsung, Dell..."
                      autoFocus
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => setIsAddingBrand(false)}
                    className="flex-1 h-14 bg-white/5 border border-white/10 text-slate-400 font-bold rounded-2xl hover:bg-white/10 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={() => {
                      if (!newBrandName) return;
                      onAddBrand(newBrandName);
                      setNewBrandName('');
                      setIsAddingBrand(false);
                    }}
                    className="flex-[2] h-14 bg-primary text-white font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus size={18} /> Salvar Marca
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Adicionar Modelo */}
      <AnimatePresence>
        {isAddingModel && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg-dark/90 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md glass-modal p-8 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-emerald-500" />

              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tight">Novo Modelo</h3>
                  <p className="text-slate-500 text-xs font-medium uppercase tracking-widest mt-1">Cadastro de Equipamento</p>
                </div>
                <button 
                  onClick={() => setIsAddingModel(false)} 
                  className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                    <Tag size={20} />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Marca Selecionada</div>
                    <div className="text-sm font-bold text-white">{newOrder.equipmentBrand}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Nome do Modelo</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-primary transition-colors">
                      <Smartphone size={18} />
                    </div>
                    <input 
                      type="text"
                      value={newModelName}
                      onChange={(e) => setNewModelName(e.target.value)}
                      className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-slate-700"
                      placeholder="Ex: iPhone 15 Pro, Galaxy S24..."
                      autoFocus
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => setIsAddingModel(false)}
                    className="flex-1 h-14 bg-white/5 border border-white/10 text-slate-400 font-bold rounded-2xl hover:bg-white/10 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={() => {
                      if (!newModelName) return;
                      const brand = brands.find(b => b.name === newOrder.equipmentBrand);
                      if (brand) {
                        onAddModel(brand.id, newModelName);
                        setNewModelName('');
                        setIsAddingModel(false);
                      }
                    }}
                    className="flex-[2] h-14 bg-primary text-white font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus size={18} /> Salvar Modelo
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
