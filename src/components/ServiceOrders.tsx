import React, { useState } from 'react';
import { ServiceOrder, Customer, InventoryItem, ServiceOrderStatus, User, ServiceOrderPart, Brand, Model, AppSettings } from '../types';
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
import { SearchableSelect } from './SearchableSelect';
import { useToast } from './ui/Toast';
import { ServiceOrderItem } from '../types';

import { Pagination } from './ui/Pagination';

// New Sub-components
import { ServiceOrderFilters } from './service-orders/ServiceOrderFilters';
import { ServiceOrderList } from './service-orders/ServiceOrderList';
import { WhatsAppModal } from './service-orders/modals/WhatsAppModal';
import { QRCodeModal } from './service-orders/modals/QRCodeModal';
import { PrintModal } from './service-orders/modals/PrintModal';
import { DirectOsSearchModal } from './service-orders/modals/DirectOsSearchModal';

interface ServiceOrdersProps {
  orders: { data: ServiceOrder[], meta: any };
  customers: { data: Customer[], meta: any };
  inventoryItems: InventoryItem[];
  statuses: ServiceOrderStatus[];
  equipmentTypes: {id: number, name: string}[];
  brands: Brand[];
  models: Model[];
  clientPayments: { data: any[], meta: any };
  onAddOrder: (order: any) => Promise<number | null>;
  onUpdateOrder: (id: number, order: any) => Promise<boolean>;
  onDeleteOrder: (id: number) => void;
  onAddStatus: (status: any) => void;
  onDeleteStatus: (id: number) => void;
  onAddEquipmentType: (name: string) => void;
  onAddBrand: (name: string, equipmentType: string) => void;
  onAddModel: (brandId: number, name: string) => void;
  onPrintBlankForm: () => void;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
  };
  onPageChange: (page: number) => void;
  settings: AppSettings;
  isAdding: boolean;
  setIsAdding: (isAdding: boolean) => void;
  directOsId: number | null;
  setDirectOsId: (id: number | null) => void;
  directMode: string | null;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  priorityFilter: string;
  onPriorityFilterChange: (priority: string) => void;
  sortBy: string;
  onSortByChange: (sortBy: string) => void;
  onOpenConfirm: (title: string, message: string, onConfirm: () => void, type?: 'danger' | 'warning' | 'info') => void;
  onTriggerAddCustomer: () => void;
  currentUser: User | null;
}

export const ServiceOrders: React.FC<ServiceOrdersProps> = ({
  orders,
  customers,
  inventoryItems,
  statuses,
  equipmentTypes,
  brands,
  models,
  clientPayments,
  onAddOrder,
  onUpdateOrder,
  onDeleteOrder,
  onAddStatus,
  onDeleteStatus,
  onAddEquipmentType,
  onAddBrand,
  onAddModel,
  onPrintBlankForm,
  pagination,
  onPageChange,
  settings,
  isAdding,
  setIsAdding,
  directOsId,
  setDirectOsId,
  directMode,
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  sortBy,
  onSortByChange,
  onOpenConfirm,
  onTriggerAddCustomer,
  currentUser
}) => {
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
    equipmentType: '',
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
    partsUsed: [] as ServiceOrderPart[],
    services: [] as ServiceOrderItem[],
    arrivalPhotoBase64: ''
  });

  const { showToast } = useToast();

  const [partSearch, setPartSearch] = useState('');
  const [isAddingPart, setIsAddingPart] = useState(false);
  const [isAddingService, setIsAddingService] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const photoSectionRef = React.useRef<HTMLDivElement>(null);

  const [showStatusOnly, setShowStatusOnly] = useState<ServiceOrder | null>(null);
  const [quickStatusOrder, setQuickStatusOrder] = useState<ServiceOrder | null>(null);

  const [quickAddModal, setQuickAddModal] = useState<{
    isOpen: boolean;
    type: 'type' | 'brand' | 'model';
    title: string;
    placeholder: string;
    value: string;
  }>({
    isOpen: false,
    type: 'type',
    title: '',
    placeholder: '',
    value: ''
  });

  const handleQuickAdd = () => {
    if (!quickAddModal.value.trim()) return;
    
    if (quickAddModal.type === 'type') {
      onAddEquipmentType(quickAddModal.value.trim());
      setNewOrder({ ...newOrder, equipmentType: quickAddModal.value.trim(), equipmentBrand: '', equipmentModel: '' });
    } else if (quickAddModal.type === 'brand') {
      onAddBrand(quickAddModal.value.trim(), newOrder.equipmentType);
      setNewOrder({ ...newOrder, equipmentBrand: quickAddModal.value.trim(), equipmentModel: '' });
    } else if (quickAddModal.type === 'model') {
      const brand = brands.find(b => b.name === newOrder.equipmentBrand);
      if (brand) {
        onAddModel(brand.id, quickAddModal.value.trim());
        setNewOrder({ ...newOrder, equipmentModel: quickAddModal.value.trim() });
      }
    }
    
    setQuickAddModal({ ...quickAddModal, isOpen: false, value: '' });
  };

  const handleUpdateStatus = (id: number, newStatus: string) => {
    const order = orders.data.find(o => o.id === id);
    if (order) {
      onUpdateOrder(id, { ...order, status: newStatus });
      showToast('Status atualizado com sucesso!', 'success');
    }
  };

  const updateOrderTotals = (updatedServices: ServiceOrderItem[], updatedParts: ServiceOrderPart[]) => {
    const newFee = updatedServices.reduce((acc, s) => acc + s.price, 0);
    const partsTotal = updatedParts.reduce((acc, p) => acc + p.subtotal, 0);
    setNewOrder(prev => ({
      ...prev,
      services: updatedServices,
      partsUsed: updatedParts,
      serviceFee: newFee.toString(),
      totalAmount: (newFee + partsTotal).toFixed(2)
    }));
  };

  // Handle direct OS access from QR Code
  React.useEffect(() => {
    if (directOsId) {
      const order = orders.data.find(o => o.id === directOsId);
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

  const onClearDirectOsId = () => setDirectOsId(null);

  // New states for Print and WhatsApp
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [showQRCodeModal, setShowQRCodeModal] = useState(false);
  const [showDirectOsModal, setShowDirectOsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);

  // Column visibility
  const [visibleColumns, setVisibleColumns] = useState({
    id: true,
    status: true,
    priority: true,
    entryDate: true,
    prediction: true,
    total: true
  });

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [showColumnConfig, setShowColumnConfig] = useState(false);
  const [dateFilter, setDateFilter] = useState('all');

  const filteredOrders = orders.data.filter(order => {
    const customer = customers.data.find(c => c.id === order.customerId);
    const searchLower = searchTerm.toLowerCase().trim();
    const searchNumber = searchLower.replace(/[^0-9]/g, '');
    
    const matchesSearch = 
      order.equipmentBrand?.toLowerCase().includes(searchLower) ||
      order.equipmentModel?.toLowerCase().includes(searchLower) ||
      order.reportedProblem?.toLowerCase().includes(searchLower) ||
      customer?.firstName?.toLowerCase().includes(searchLower) ||
      customer?.lastName?.toLowerCase().includes(searchLower) ||
      `#os-${order.id.toString().padStart(4, '0')}`.includes(searchLower) ||
      (searchNumber && order.id.toString().includes(searchNumber));
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || order.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  }).sort((a, b) => {
    if (sortBy === 'newest') return b.id - a.id;
    if (sortBy === 'oldest') return a.id - b.id;
    if (sortBy === 'priority') {
      const pMap = { high: 3, medium: 2, low: 1 };
      return (pMap[b.priority as keyof typeof pMap] || 0) - (pMap[a.priority as keyof typeof pMap] || 0);
    }
    if (sortBy === 'prediction') {
      if (!a.analysisPrediction) return 1;
      if (!b.analysisPrediction) return -1;
      return new Date(a.analysisPrediction).getTime() - new Date(b.analysisPrediction).getTime();
    }
    return 0;
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

  const handleSave = async () => {
    if (newOrder.customerId === 0) {
      showToast("Selecione um cliente.", "error");
      return;
    }
    
    if (!newOrder.reportedProblem.trim()) {
      showToast("Descreva o problema relatado.", "error");
      return;
    }
    
    const orderData = {
      ...newOrder,
      serviceFee: parseFloat(newOrder.serviceFee.toString().replace(',', '.')) || 0,
      totalAmount: parseFloat(newOrder.totalAmount.toString().replace(',', '.')) || 0,
      createdBy: currentUser?.id
    };

    if (editingOrder) {
      const success = await onUpdateOrder(editingOrder.id, orderData);
      if (!success) return;
    } else {
      const success = await onAddOrder(orderData);
      if (!success) return;
    }
    
    setIsAdding(false);
    setEditingOrder(null);
    setNewOrder({
      customerId: 0,
      equipmentType: '',
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
      partsUsed: [],
      services: [],
      arrivalPhotoBase64: ''
    });

    // Option to send via WhatsApp after saving
    onOpenConfirm(
      'Enviar via WhatsApp',
      'Deseja enviar a Ordem de Serviço via WhatsApp agora?',
      () => {
        // We need the ID of the newly created order, but onAddOrder is async and doesn't return it here easily
        // For now, we'll just close. In a real app, we'd wait for the response.
      },
      'info'
    );
  };

  const handleEdit = (order: ServiceOrder) => {
    setEditingOrder(order);
    setNewOrder({
      customerId: order.customerId,
      equipmentType: order.equipmentType || '',
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
      partsUsed: order.partsUsed || [],
      services: order.services || [],
      arrivalPhotoBase64: order.arrivalPhotoBase64 || ''
    });
    setIsAdding(true);
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
                const customer = customers.data.find(c => c.id === order.customerId);
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

  const stats = orders.meta?.counts || {
    awaiting: 0,
    active: 0,
    ready: 0,
    urgent: 0
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Ordens de Serviço</h2>
          <p className="text-slate-500 font-medium">Gerencie manutenções e reparos técnicos</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <button 
            onClick={onPrintBlankForm}
            className="w-full sm:w-auto h-12 px-6 rounded-xl bg-white/5 border border-white/10 text-slate-300 font-bold text-sm hover:bg-white/10 transition-all flex items-center justify-center gap-2"
          >
            <Printer size={20} />
            Ficha em Branco
          </button>
          <button 
            onClick={handlePrintReport}
            className="w-full sm:w-auto h-12 px-6 rounded-xl bg-white/5 border border-white/10 text-slate-300 font-bold text-sm hover:bg-white/10 transition-all flex items-center justify-center gap-2"
          >
            <Printer size={20} />
            Relatório
          </button>
          <button 
            onClick={() => setShowStatusManager(true)}
            className="w-full sm:w-auto h-12 px-6 rounded-xl bg-white/5 border border-white/10 text-slate-300 font-bold text-sm hover:bg-white/10 transition-all flex items-center justify-center gap-2"
          >
            <Tag size={20} />
            Status
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
        <div className="glass-card p-6 border-l-4 border-l-rose-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Urgente</p>
              <h3 className="text-3xl font-black mt-1">{stats.urgent}</h3>
            </div>
            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-500">
              <AlertCircle size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <ServiceOrderFilters 
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        statusFilter={statusFilter}
        setStatusFilter={onStatusFilterChange}
        statuses={statuses}
        priorityFilter={priorityFilter}
        setPriorityFilter={onPriorityFilterChange}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        viewMode={viewMode}
        setViewMode={setViewMode}
        showColumnConfig={showColumnConfig}
        setShowColumnConfig={setShowColumnConfig}
        visibleColumns={visibleColumns}
        setVisibleColumns={setVisibleColumns}
        filteredOrdersCount={filteredOrders.length}
      />

      {/* List */}
      <ServiceOrderList 
        filteredOrders={filteredOrders}
        visibleColumns={visibleColumns}
        quickStatusOrder={quickStatusOrder}
        setQuickStatusOrder={setQuickStatusOrder}
        getStatusColor={getStatusColor}
        statuses={statuses}
        handleUpdateStatus={handleUpdateStatus}
        formatCurrency={formatCurrency}
        setSelectedOrder={setSelectedOrder}
        setShowQRCodeModal={setShowQRCodeModal}
        setShowWhatsAppModal={setShowWhatsAppModal}
        setShowPrintModal={setShowPrintModal}
        handleEdit={handleEdit}
        onOpenConfirm={onOpenConfirm}
        onDeleteOrder={onDeleteOrder}
        clientPayments={clientPayments}
        pagination={pagination}
        onPageChange={onPageChange}
      />

      {/* Modals */}
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
              className="relative w-full max-w-lg glass-modal p-4 sm:p-6 md:p-8 max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="flex justify-between items-center mb-4 md:mb-6">
                <h3 className="text-lg md:text-xl font-bold">Gerenciar Status</h3>
                <button onClick={() => setShowStatusManager(false)} className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-all">
                  <X size={20} className="md:w-6 md:h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <p className="text-sm text-slate-400">Personalize os status das suas ordens de serviço.</p>
                  <button 
                    onClick={() => setIsAddingStatus(true)}
                    className="flex items-center justify-center w-full sm:w-auto gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg text-xs font-bold border border-primary/20 hover:bg-primary/20 transition-all"
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
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Nome</label>
                        <input 
                          value={newStatus.name}
                          onChange={(e) => setNewStatus({...newStatus, name: e.target.value})}
                          className="w-full h-10 bg-white/5 border border-white/10 rounded-lg px-3 text-sm font-bold focus:ring-1 focus:ring-primary outline-none"
                          placeholder="Ex: Em Teste"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Cor</label>
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
                        {s.isDefault && <span className="text-xs font-black uppercase tracking-widest px-1.5 py-0.5 bg-white/10 text-slate-500 rounded">Padrão</span>}
                      </div>
                      {!s.isDefault && (
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
              <div className="p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8 overflow-y-auto flex-1 custom-scrollbar">
                {/* Cliente e Data */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-primary ml-1 flex items-center gap-2 bg-primary/5 px-2 py-1 rounded-md w-fit mb-1">
                      <UserIcon size={12} /> Cliente <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <CustomerSearchSelect 
                        customers={customers.data}
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
                    <label className="text-xs font-bold uppercase tracking-widest text-primary ml-1 flex items-center gap-2 bg-primary/5 px-2 py-1 rounded-md w-fit mb-1">
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
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Dados do Equipamento</h4>
                  </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Tipo</label>
                        <div className="flex gap-2">
                          <SearchableSelect
                            options={equipmentTypes.map(t => ({ value: t.name, label: t.name }))}
                            value={newOrder.equipmentType || ''}
                            onChange={(val) => setNewOrder({ ...newOrder, equipmentType: val as string, equipmentBrand: '', equipmentModel: '' })}
                            placeholder="Selecione o Tipo"
                            onAdd={(val) => onAddEquipmentType(val)}
                            className="h-12 flex-1"
                          />
                          <button
                            type="button"
                            onClick={() => setQuickAddModal({ isOpen: true, type: 'type', title: 'Novo Tipo de Equipamento', placeholder: 'Ex: Notebook, Smartphone...', value: '' })}
                            className="h-12 w-12 flex-shrink-0 flex items-center justify-center bg-primary/10 text-primary border border-primary/20 rounded-xl hover:bg-primary/20 transition-all shadow-lg shadow-primary/5"
                            title="Adicionar Novo Tipo"
                          >
                            <Plus size={18} />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Marca</label>
                        </div>
                        <div className="flex gap-2">
                          <SearchableSelect
                            options={brands
                              .filter(b => !newOrder.equipmentType || b.equipmentType === newOrder.equipmentType)
                              .map(b => ({ value: b.name, label: b.name }))}
                            value={newOrder.equipmentBrand || ''}
                            onChange={(val) => setNewOrder({ ...newOrder, equipmentBrand: val as string, equipmentModel: '' })}
                            placeholder="Selecione a Marca"
                            onAdd={(val) => onAddBrand(val, newOrder.equipmentType || '')}
                            disabled={!newOrder.equipmentType}
                            className="h-12 flex-1"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (!newOrder.equipmentType) {
                                showToast('Selecione um tipo primeiro!', 'error');
                                return;
                              }
                              setQuickAddModal({ isOpen: true, type: 'brand', title: 'Nova Marca', placeholder: 'Ex: Samsung, Apple...', value: '' });
                            }}
                            disabled={!newOrder.equipmentType}
                            className="h-12 w-12 flex-shrink-0 flex items-center justify-center bg-primary/10 text-primary border border-primary/20 rounded-xl hover:bg-primary/20 transition-all shadow-lg shadow-primary/5 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Adicionar Nova Marca"
                          >
                            <Plus size={18} />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Modelo</label>
                        </div>
                        <div className="flex gap-2">
                          <SearchableSelect
                            options={models
                              .filter(m => {
                                const brand = brands.find(b => b.name === newOrder.equipmentBrand);
                                return brand ? m.brandId === brand.id : false;
                              })
                              .map(m => ({ value: m.name, label: m.name }))}
                            value={newOrder.equipmentModel || ''}
                            onChange={(val) => setNewOrder({ ...newOrder, equipmentModel: val as string })}
                            placeholder="Selecione o Modelo"
                            onAdd={(val) => {
                              const brand = brands.find(b => b.name === newOrder.equipmentBrand);
                              if (brand) {
                                onAddModel(brand.id, val);
                              } else {
                                showToast('Selecione uma marca primeiro!', 'error');
                              }
                            }}
                            disabled={!newOrder.equipmentBrand}
                            className="h-12 flex-1"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (!newOrder.equipmentBrand) {
                                showToast('Selecione uma marca primeiro!', 'error');
                                return;
                              }
                              setQuickAddModal({ isOpen: true, type: 'model', title: 'Novo Modelo', placeholder: 'Ex: Galaxy S23, iPhone 15...', value: '' });
                            }}
                            disabled={!newOrder.equipmentBrand}
                            className="h-12 w-12 flex-shrink-0 flex items-center justify-center bg-primary/10 text-primary border border-primary/20 rounded-xl hover:bg-primary/20 transition-all shadow-lg shadow-primary/5 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Adicionar Novo Modelo"
                          >
                            <Plus size={18} />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Cor do Equipamento</label>
                        <input 
                          value={newOrder.equipmentColor}
                          onChange={(e) => setNewOrder({...newOrder, equipmentColor: e.target.value})}
                          className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all"
                          placeholder="Ex: Preto, Prata, Azul"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Nº de Série</label>
                        <input 
                          value={newOrder.equipmentSerial}
                          onChange={(e) => setNewOrder({...newOrder, equipmentSerial: e.target.value})}
                          className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all"
                          placeholder="Opcional"
                        />
                      </div>
                    </div>
                </div>

                {/* Especificações e Senha */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                      <Cpu size={12} /> RAM
                    </label>
                    <input 
                      value={newOrder.ramInfo}
                      onChange={(e) => setNewOrder({...newOrder, ramInfo: e.target.value})}
                      className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all"
                      placeholder="Ex: 8GB DDR4"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                      <HardDrive size={12} /> SSD/HD
                    </label>
                    <input 
                      value={newOrder.ssdInfo}
                      onChange={(e) => setNewOrder({...newOrder, ssdInfo: e.target.value})}
                      className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all"
                      placeholder="Ex: 240GB SSD"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                      <Lock size={12} /> Senha do Equipamento
                    </label>
                    <input 
                      value={newOrder.customerPassword}
                      onChange={(e) => setNewOrder({...newOrder, customerPassword: e.target.value})}
                      className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all"
                      placeholder="Opcional"
                    />
                  </div>
                </div>

                {/* Acessórios */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Acessórios Inclusos</label>
                  <input 
                    value={newOrder.accessories}
                    onChange={(e) => setNewOrder({...newOrder, accessories: e.target.value})}
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all"
                    placeholder="Ex: Carregador, Capa, Cabo USB..."
                  />
                </div>

                {/* Foto de Entrada */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-1 w-8 bg-primary rounded-full" />
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Foto do Equipamento (Entrada)</h4>
                  </div>
                  <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-white/10 rounded-3xl bg-white/5 hover:bg-white/10 transition-all group relative overflow-hidden">
                    {newOrder.arrivalPhotoBase64 ? (
                      <div className="relative w-full aspect-video rounded-2xl overflow-hidden">
                        <img 
                          src={newOrder.arrivalPhotoBase64} 
                          alt="Foto de Entrada" 
                          className="w-full h-full object-cover"
                        />
                        <button 
                          onClick={() => setNewOrder({...newOrder, arrivalPhotoBase64: ''})}
                          className="absolute top-4 right-4 p-2 bg-rose-500 text-white rounded-xl shadow-lg hover:scale-110 transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center gap-4">
                        <div className="p-4 bg-primary/10 text-primary rounded-2xl group-hover:scale-110 transition-all">
                          <Camera size={32} />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold">Clique para tirar ou anexar foto</p>
                          <p className="text-xs text-slate-500 mt-1">PNG, JPG ou JPEG (Máx. 2MB)</p>
                        </div>
                        <input 
                          type="file" 
                          accept="image/*" 
                          capture="environment"
                          className="hidden" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 2 * 1024 * 1024) {
                                showToast('A imagem deve ter no máximo 2MB', 'error');
                                return;
                              }
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setNewOrder({...newOrder, arrivalPhotoBase64: reader.result as string});
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Problema e Análise */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-rose-500 ml-1 flex items-center gap-2 bg-rose-500/5 px-2 py-1 rounded-md w-fit mb-1">
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
                    <label className="text-xs font-bold uppercase tracking-widest text-amber-500 ml-1 flex items-center gap-2 bg-amber-500/5 px-2 py-1 rounded-md w-fit mb-1">
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

                {/* Status e Prioridade */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Status Atual</label>
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
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Prioridade</label>
                    <div className="flex gap-2">
                      {(['low', 'medium', 'high'] as const).map((p) => (
                        <button
                          key={p}
                          onClick={() => setNewOrder({...newOrder, priority: p})}
                          className={cn(
                            "flex-1 h-14 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all",
                            newOrder.priority === p 
                              ? p === 'high' ? "bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-lg shadow-rose-500/5" : 
                                p === 'medium' ? "bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-lg shadow-amber-500/5" :
                                "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-lg shadow-emerald-500/5"
                              : "bg-white/5 text-slate-500 border-transparent hover:bg-white/10"
                          )}
                        >
                          {p === 'low' ? 'Baixa' : p === 'medium' ? 'Normal' : 'Alta'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Serviços e Peças */}
                <div className="space-y-4 pt-6 border-t border-white/5">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="h-1 w-8 bg-primary rounded-full" />
                      <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                        <Wrench size={12} /> Serviços e Peças
                      </h4>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setIsAddingService(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl text-xs font-black uppercase tracking-widest border border-primary/20 hover:bg-primary/20 transition-all"
                      >
                        <Plus size={14} /> Serviço
                      </button>
                      <button 
                        onClick={() => setIsAddingPart(!isAddingPart)}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-xl text-xs font-black uppercase tracking-widest border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
                      >
                        {isAddingPart ? <X size={14} /> : <Plus size={14} />}
                        Peça
                      </button>
                    </div>
                  </div>

                  {/* Services List */}
                  <div className="space-y-3">
                    {(newOrder.services || []).map((service, idx) => (
                      <div key={`service-${idx}`} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 group hover:border-primary/20 transition-all">
                        <div className="flex-1">
                          <p className="text-sm font-bold text-slate-200">{service.name}</p>
                          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Mão de Obra</p>
                        </div>
                        <div className="flex items-center gap-6">
                          <span className="text-sm font-black text-primary w-24 text-right">{formatCurrency(service.price)}</span>
                          <button 
                            onClick={() => {
                              const updatedServices = [...(newOrder.services || [])];
                              updatedServices.splice(idx, 1);
                              updateOrderTotals(updatedServices, newOrder.partsUsed);
                            }}
                            className="p-2 rounded-xl text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
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
                                let updatedParts;
                                if (existing) {
                                  updatedParts = newOrder.partsUsed.map(p => p.id === item.id ? {...p, quantity: p.quantity + 1, subtotal: (p.quantity + 1) * p.unitPrice} : p);
                                } else {
                                  updatedParts = [...newOrder.partsUsed, { id: item.id, name: item.name, quantity: 1, unitPrice: item.unitPrice, subtotal: item.unitPrice }];
                                }
                                updateOrderTotals(newOrder.services || [], updatedParts);
                                setPartSearch('');
                              }}
                              className="w-full flex justify-between items-center p-3 rounded-xl hover:bg-white/5 text-left transition-all group border border-transparent hover:border-white/5"
                            >
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-200">{item.name}</span>
                                <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Estoque: {item.stockLevel}</span>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="text-sm font-black text-primary">{formatCurrency(item.unitPrice)}</span>
                                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all">
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
                      <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 group hover:border-primary/20 transition-all gap-4 sm:gap-0">
                        <div className="flex-1 w-full">
                          <p className="text-sm font-bold text-slate-200 truncate">{part.name}</p>
                          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{formatCurrency(part.unitPrice)} x {part.quantity}</p>
                        </div>
                        <div className="flex items-center justify-between w-full sm:w-auto gap-4 sm:gap-6">
                          <div className="flex items-center gap-3 bg-white/5 p-1 rounded-xl border border-white/10">
                            <button 
                              onClick={() => {
                                if (part.quantity > 1) {
                                  const updatedParts = newOrder.partsUsed.map((p, i) => i === idx ? {...p, quantity: p.quantity - 1, subtotal: (p.quantity - 1) * p.unitPrice} : p);
                                  updateOrderTotals(newOrder.services || [], updatedParts);
                                }
                              }}
                              className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                            >
                              <ChevronDown size={16} />
                            </button>
                            <span className="text-sm font-black w-6 text-center">{part.quantity}</span>
                            <button 
                              onClick={() => {
                                const updatedParts = newOrder.partsUsed.map((p, i) => i === idx ? {...p, quantity: p.quantity + 1, subtotal: (p.quantity + 1) * p.unitPrice} : p);
                                updateOrderTotals(newOrder.services || [], updatedParts);
                              }}
                              className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                            >
                              <ChevronUp size={16} />
                            </button>
                          </div>
                          <span className="text-sm font-black text-slate-300 w-24 text-right">{formatCurrency(part.subtotal)}</span>
                          <button 
                            onClick={() => {
                              const updatedParts = newOrder.partsUsed.filter((_, i) => i !== idx);
                              updateOrderTotals(newOrder.services || [], updatedParts);
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
                      <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Fechamento e Valores</h4>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-emerald-500 ml-1">Serviços Realizados</label>
                      <textarea 
                        value={newOrder.servicesPerformed}
                        onChange={(e) => setNewOrder({...newOrder, servicesPerformed: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none min-h-[100px] resize-none transition-all"
                        placeholder="Descreva o que foi feito no equipamento..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Mão de Obra (R$)</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">R$</span>
                          <input 
                            type="number"
                            step="0.01"
                            value={newOrder.serviceFee}
                            onChange={(e) => {
                              const fee = parseFloat(e.target.value.toString().replace(',', '.')) || 0;
                              const partsTotal = newOrder.partsUsed.reduce((acc, p) => acc + p.subtotal, 0);
                              setNewOrder({...newOrder, serviceFee: e.target.value, totalAmount: (fee + partsTotal).toFixed(2)});
                            }}
                            className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-sm font-black focus:ring-2 focus:ring-primary outline-none transition-all"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-primary ml-1">Valor Total (R$)</label>
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
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Observações Finais</label>
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
              <div className="p-4 sm:p-6 border-t border-white/5 bg-white/5 flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button 
                  onClick={() => setIsAdding(false)}
                  className="flex-1 h-12 sm:h-14 rounded-xl sm:rounded-2xl font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all order-2 sm:order-1"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSave}
                  className="flex-[2] h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-primary text-white font-black shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 order-1 sm:order-2"
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
                    <div className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-4">Status Atual</div>
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
                      <div className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Equipamento</div>
                      <div className="text-sm font-bold text-white">{showStatusOnly.equipmentBrand} {showStatusOnly.equipmentModel}</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                      <div className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Cor</div>
                      <div className="text-sm font-bold text-white">{showStatusOnly.equipmentColor || 'Não informada'}</div>
                    </div>
                  </div>

                  {showStatusOnly.analysisPrediction && (
                    <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                        <Calendar size={20} />
                      </div>
                      <div>
                        <div className="text-xs font-black uppercase tracking-widest text-primary/60">Previsão de Entrega</div>
                        <div className="text-sm font-bold text-white">{format(parseISO(showStatusOnly.analysisPrediction), 'dd/MM/yyyy')}</div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                      <div className="h-px flex-1 bg-white/10" />
                      Histórico de Fotos
                      <div className="h-px flex-1 bg-white/10" />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3">
                      {showStatusOnly.arrivalPhotoBase64 ? (
                        <div className="aspect-square rounded-xl overflow-hidden border border-white/10 bg-white/5">
                          <img src={showStatusOnly.arrivalPhotoBase64} alt="Foto de Entrada" className="w-full h-full object-cover" />
                        </div>
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

      {/* Add Service Modal */}
      <AnimatePresence>
        {isAddingService && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg-dark/90 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md glass-modal p-4 sm:p-6 md:p-8 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-blue-500" />
              
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tight">Novo Serviço</h3>
                  <p className="text-slate-500 text-xs font-medium uppercase tracking-widest mt-1">Mão de Obra</p>
                </div>
                <button onClick={() => setIsAddingService(false)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Descrição</label>
                  <input 
                    type="text"
                    value={newServiceName}
                    onChange={(e) => setNewServiceName(e.target.value)}
                    className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-4 text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all"
                    placeholder="Ex: Formatação, Limpeza..."
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Valor (R$)</label>
                  <input 
                    type="number"
                    value={newServicePrice}
                    onChange={(e) => setNewServicePrice(e.target.value)}
                    className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-4 text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all"
                    placeholder="0,00"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => setIsAddingService(false)}
                    className="flex-1 h-14 bg-white/5 border border-white/10 text-slate-400 font-bold rounded-2xl hover:bg-white/10 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={() => {
                      if (!newServiceName || !newServicePrice) return;
                      const service: ServiceOrderItem = {
                        name: newServiceName,
                        price: Number(newServicePrice)
                      };
                      const updatedServices = [...(newOrder.services || []), service];
                      updateOrderTotals(updatedServices, newOrder.partsUsed);
                      setIsAddingService(false);
                      setNewServiceName('');
                      setNewServicePrice('');
                    }}
                    className="flex-[2] h-14 bg-primary text-white font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus size={18} /> Adicionar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Quick Add Modal */}
      <AnimatePresence>
        {quickAddModal.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg-dark/90 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md glass-modal p-4 sm:p-6 md:p-8 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-emerald-500" />

              <div className="flex justify-between items-center mb-4 sm:mb-6 md:mb-8">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">{quickAddModal.title}</h3>
                  <p className="text-slate-500 text-xs font-medium uppercase tracking-widest mt-1">Cadastro Rápido</p>
                </div>
                <button 
                  onClick={() => setQuickAddModal({ ...quickAddModal, isOpen: false, value: '' })} 
                  className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Nome</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-primary transition-colors">
                      <Tag size={18} />
                    </div>
                    <input 
                      type="text"
                      value={quickAddModal.value}
                      onChange={(e) => setQuickAddModal({ ...quickAddModal, value: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleQuickAdd();
                        }
                      }}
                      className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-slate-700"
                      placeholder={quickAddModal.placeholder}
                      autoFocus
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button 
                    onClick={() => setQuickAddModal({ ...quickAddModal, isOpen: false, value: '' })}
                    className="flex-1 h-12 sm:h-14 bg-white/5 border border-white/10 text-slate-400 font-bold rounded-xl sm:rounded-2xl hover:bg-white/10 transition-all order-2 sm:order-1"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleQuickAdd}
                    disabled={!quickAddModal.value.trim()}
                    className="flex-[2] h-12 sm:h-14 bg-primary text-white font-black uppercase tracking-widest rounded-xl sm:rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 order-1 sm:order-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus size={18} /> Adicionar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Modals */}
      <WhatsAppModal 
        show={showWhatsAppModal}
        onClose={() => setShowWhatsAppModal(false)}
        selectedOrder={selectedOrder}
        customers={customers.data}
        settings={settings}
      />

      <QRCodeModal 
        show={showQRCodeModal}
        onClose={() => setShowQRCodeModal(false)}
        selectedOrder={selectedOrder}
      />

      <PrintModal 
        show={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        selectedOrder={selectedOrder}
        customers={customers.data}
        currentUser={currentUser}
      />

      <DirectOsSearchModal 
        show={showDirectOsModal}
        onClose={() => setShowDirectOsModal(false)}
        orders={orders.data}
        handleEdit={handleEdit}
      />
    </div>
  );
};
