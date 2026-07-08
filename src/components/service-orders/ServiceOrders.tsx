import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { useAppStore } from '../../store/useAppStore';
import { useToast } from '../../components/ui/Toast';
import { 
  Search, Plus, 
  Settings2, Printer
} from 'lucide-react';
import { 
  ServiceOrder, Customer, InventoryItem, ServiceOrderStatus, 
  Brand, Model, User, EquipmentType
} from '../../types';
import api from '../../lib/api';
import { sendWhatsAppStatusUpdate } from '../../lib/whatsappUtils';

// Components
import { ServiceOrderFilters } from './ServiceOrderFilters';
import { ServiceOrderList } from './ServiceOrderList';
import { ServiceOrderForm } from './ServiceOrderForm';
import { ServiceOrderFormContext } from '../../contexts/ServiceOrderFormContext';

// Modals
import { WhatsAppModal } from './modals/WhatsAppModal';
const QRCodeModal = React.lazy(() =>
  import('./modals/QRCodeModal').then(m => ({ default: m.QRCodeModal }))
);
import { PrintModal } from './modals/PrintModal';
import { DirectOsSearchModal } from './modals/DirectOsSearchModal';
import { StatusManagerModal } from './modals/StatusManagerModal';
import { ServiceOrderStatusModal } from './modals/ServiceOrderStatusModal';

interface ServiceOrdersProps {
  orders: { data: ServiceOrder[], meta: any };
  customers: { data: Customer[], meta: any };
  allCustomers?: Customer[];
  inventoryItems: InventoryItem[];
  statuses: ServiceOrderStatus[];
  equipmentTypes: EquipmentType[];
  brands: Brand[];
  models: Model[];
  currentUser: User | null;
  onAddOrder: (order: any) => Promise<number | null>;
  onUpdateOrder: (id: number, order: any, version?: number) => Promise<boolean>;
  onDeleteOrder: (id: number) => Promise<void>;
  onAddStatus: (status: any) => Promise<void>;
  onDeleteStatus: (id: number) => Promise<void>;
  onAddEquipmentType: (name: string, icon: string) => Promise<void>;
  onAddBrand: (name: string, equipmentType: string) => Promise<void>;
  onAddModel: (brandId: number, name: string) => Promise<void>;
  onTriggerAddCustomer: () => void;
  clientPayments: any;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
  };
  onPageChange: (page: number) => void;
  onOpenConfirm: (title: string, message: string, onConfirm: () => void, type: 'danger' | 'warning' | 'info') => void;
  onGeneratePayment?: (order: any) => void;
  onPrintBlankForm: () => void;
  settings: any;
  isAdding: boolean;
  setIsAdding: (isAdding: boolean) => void;
  directOsId: number | null;
  setDirectOsId: (id: number | null) => void;
  directMode: string | null;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  priorityFilter: string;
  onPriorityFilterChange: (value: string) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
  dateFilter: string;
  onDateFilterChange: (value: string) => void;
}

export const ServiceOrders: React.FC<ServiceOrdersProps> = ({
  orders,
  customers,
  allCustomers,
  inventoryItems,
  statuses,
  equipmentTypes,
  brands,
  models,
  currentUser,
  onAddOrder,
  onUpdateOrder,
  onDeleteOrder,
  onAddStatus,
  onDeleteStatus,
  onAddEquipmentType,
  onAddBrand,
  onAddModel,
  onTriggerAddCustomer,
  clientPayments,
  pagination,
  onPageChange,
  onOpenConfirm,
  onGeneratePayment,
  onPrintBlankForm,
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
  dateFilter,
  onDateFilterChange
}) => {
  const { showToast } = useToast();
  const { isSearchingOS, setIsSearchingOS } = useAppStore();
  const [editingOrder, setEditingOrder] = useState<ServiceOrder | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);
  
  const [showStatusManager, setShowStatusManager] = useState(false);
  const [showStatusOnly, setShowStatusOnly] = useState<ServiceOrder | null>(null);
  const [quickStatusOrder, setQuickStatusOrder] = useState<ServiceOrder | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [showQRCodeModal, setShowQRCodeModal] = useState(false);
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [showColumnConfig, setShowColumnConfig] = useState(false);
  const [showFiltersExpanded, setShowFiltersExpanded] = useState(true);
  const [visibleColumns, setVisibleColumns] = useState({
    id: true,
    status: true,
    priority: true,
    entryDate: true,
    prediction: true,
    total: true
  });

  // Handle direct OS access from QR Code
  useEffect(() => {
    const fetchDirectOs = async () => {
      if (directOsId) {
        const orderFromCache = orders.data.find(o => o.id === directOsId);
        let order = orderFromCache;
        
        if (!order) {
          try {
            const { data } = await api.get(`/service-orders/${directOsId}`);
            order = data;
          } catch (error) {
            console.error("Failed to fetch direct OS", error);
            showToast('OS não encontrada', 'error');
            setDirectOsId(null);
            return;
          }
        }
        
        if (order) {
          if (directMode === 'status') {
            setShowStatusOnly(order);
          } else {
            handleEdit(order);
          }
        }
        setDirectOsId(null);
      }
    };
    
    fetchDirectOs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [directOsId, directMode]);

  const handleEdit = (order: ServiceOrder) => {
    setEditingOrder(order);
    setIsAdding(true);
  };

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    const success = await onUpdateOrder(id, { status: newStatus, updatedBy: currentUser?.id || 1 });
    if (success) {
      const notifyStatuses = ['Concluído', 'Pronto', 'Aguardando Autorização', 'Aguardando Aprovação'];
      if (notifyStatuses.includes(newStatus)) {
        const order = orders.data.find(o => o.id === id);
        const customer = (allCustomers ?? customers.data).find(c => c.id === order?.customerId);
        if (order && customer?.phone) {
          setTimeout(() => {
            sendWhatsAppStatusUpdate(order, customer, 'INOVA PRO', window.location.origin);
          }, 300);
        }
      }
    } else {
      showToast('Erro ao atualizar status.', 'error');
    }
  };

  const getStatusColor = (statusName: string) => {
    const status = statuses.find(s => s.name === statusName);
    if (status) {
      return {
        backgroundColor: `${status.color}28`,
        color: status.color,
        borderColor: `${status.color}50`
      };
    }
    return {
      backgroundColor: 'rgba(100, 116, 139, 0.15)',
      color: '#94a3b8',
      borderColor: 'rgba(100, 116, 139, 0.3)'
    };
  };

  // Calculate summary stats
  // (Removed static counts as we will map dynamically)

  return (
    <div className="p-4 sm:p-6 lg:p-10 space-y-6 md:space-y-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-6">
        <div className="flex items-center gap-3">
          <div className="p-2 lg:p-3 bg-primary/10 rounded-xl lg:rounded-2xl border border-primary/20">
            <Settings2 className="text-primary" size={20} />
          </div>
          <div>
            <h1 className="text-xl lg:text-3xl font-black text-white tracking-tight">
              Ordens de <span className="text-primary">Serviço</span>
            </h1>
            <p className="hidden lg:block text-slate-500 text-sm font-medium">
              Gerencie manutenções, orçamentos e status em tempo real
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={onPrintBlankForm} className="p-2.5 lg:h-12 lg:px-4 rounded-xl lg:rounded-2xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-all flex items-center gap-2 group" title="Imprimir Ficha">
            <Printer size={18} className="lg:group-hover:text-primary transition-colors" />
            <span className="hidden lg:inline text-sm font-bold">Imprimir Ficha</span>
          </button>

          <button onClick={() => setIsSearchingOS(true)} className="p-2.5 lg:h-12 lg:px-4 rounded-xl lg:rounded-2xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-all flex items-center gap-2 group" title="Buscar OS">
            <Search size={18} className="lg:group-hover:text-primary transition-colors" />
            <span className="hidden lg:inline text-sm font-bold">Busca Direta</span>
          </button>

          <button onClick={() => setShowStatusManager(true)} className="p-2.5 lg:h-12 lg:px-4 rounded-xl lg:rounded-2xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-all flex items-center gap-2 group" title="Status">
            <Settings2 size={18} className="lg:group-hover:text-primary transition-colors" />
            <span className="hidden lg:inline text-sm font-bold">Status</span>
          </button>

          <button onClick={() => { setEditingOrder(null); setIsAdding(true); }}
            className="p-2.5 lg:h-12 lg:px-6 rounded-xl lg:rounded-2xl bg-primary text-white font-black text-xs lg:text-sm hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-primary/25"
            title="Nova Ordem"
          >
            <Plus size={18} strokeWidth={3} />
            <span className="hidden lg:inline">NOVA ORDEM</span>
          </button>
        </div>
      </div>



      <ServiceOrderFilters 
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        statusFilter={statusFilter}
        setStatusFilter={onStatusFilterChange}
        priorityFilter={priorityFilter}
        setPriorityFilter={onPriorityFilterChange}
        dateFilter={dateFilter}
        setDateFilter={onDateFilterChange}
        sortBy={sortBy}
        setSortBy={onSortByChange}
        statuses={statuses}
        viewMode={viewMode}
        setViewMode={setViewMode}
        showColumnConfig={showColumnConfig}
        setShowColumnConfig={setShowColumnConfig}
        visibleColumns={visibleColumns}
        setVisibleColumns={setVisibleColumns}
        filteredOrdersCount={orders.data.length}
        onClearFilters={() => {
          onSearchChange('');
          onStatusFilterChange('all');
          onPriorityFilterChange('all');
          onDateFilterChange('all');
          onSortByChange('newest');
        }}
        showFiltersExpanded={showFiltersExpanded}
        onToggleFilters={() => setShowFiltersExpanded(!showFiltersExpanded)}
        filteredOrders={orders.data}
        statusCounts={orders.meta?.statusCounts ?? {}}
      />

      <ServiceOrderList 
        filteredOrders={orders.data}
        visibleColumns={visibleColumns}
        quickStatusOrder={quickStatusOrder}
        setQuickStatusOrder={setQuickStatusOrder}
        getStatusColor={getStatusColor}
        statuses={statuses}
        handleUpdateStatus={handleUpdateStatus}
        formatCurrency={(val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)}
        setSelectedOrder={setSelectedOrder}
        setShowQRCodeModal={setShowQRCodeModal}
        setShowWhatsAppModal={setShowWhatsAppModal}
        setShowPrintModal={setShowPrintModal}
        handleEdit={handleEdit}
        onOpenConfirm={onOpenConfirm}
        onDeleteOrder={onDeleteOrder}
        clientPayments={clientPayments}
        viewMode={viewMode}
        pagination={pagination}
        onPageChange={onPageChange}
        onGeneratePayment={onGeneratePayment}
      />

      <ServiceOrderFormContext.Provider value={{
        isAdding,
        setIsAdding,
        editingOrder,
        setEditingOrder,
        customers: allCustomers ?? customers.data,
        inventoryItems,
        statuses,
        equipmentTypes,
        brands,
        models,
        currentUser,
        onAddOrder,
        onUpdateOrder,
        onAddEquipmentType: (name) => onAddEquipmentType(name, 'Smartphone'),
        onAddBrand,
        onAddModel,
        onTriggerAddCustomer,
        showToast,
        onOpenConfirm,
        setSelectedOrder,
        setShowWhatsAppModal,
        setShowQRCodeModal,
        onGeneratePayment,
      }}>
        <AnimatePresence>
          {isAdding && <ServiceOrderForm />}
        </AnimatePresence>
      </ServiceOrderFormContext.Provider>

      <StatusManagerModal 
        isOpen={showStatusManager}
        onClose={() => setShowStatusManager(false)}
        statuses={statuses}
        onAddStatus={onAddStatus}
        onDeleteStatus={onDeleteStatus}
      />

      <ServiceOrderStatusModal
        showStatusOnly={showStatusOnly}
        setShowStatusOnly={setShowStatusOnly}
        statuses={statuses}
        handleUpdateStatus={handleUpdateStatus}
      />

      <WhatsAppModal
        show={showWhatsAppModal}
        onClose={() => setShowWhatsAppModal(false)}
        selectedOrder={selectedOrder}
        customers={allCustomers ?? customers.data}
        settings={settings}
        showToast={showToast}
      />

      <React.Suspense fallback={null}>
        <QRCodeModal
          show={showQRCodeModal}
          onClose={() => setShowQRCodeModal(false)}
          selectedOrder={selectedOrder}
        />
      </React.Suspense>

      <PrintModal
        show={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        selectedOrder={selectedOrder}
        customers={allCustomers ?? customers.data}
        currentUser={currentUser}
        osPrintConfig={settings?.osPrintConfig}
      />

      <DirectOsSearchModal 
        show={isSearchingOS}
        onClose={() => setIsSearchingOS(false)}
        orders={orders.data}
        handleEdit={handleEdit}
      />
    </div>
  );
};
