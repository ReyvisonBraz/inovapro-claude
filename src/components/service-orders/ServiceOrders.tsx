import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'motion/react';
import { useFormStore } from '../../store/useFormStore';
import { useAppStore } from '../../store/useAppStore';
import { useToast } from '../../components/ui/Toast';
import { useSettings } from '../../hooks/useSettings';
import { 
  Search, Plus, Filter, LayoutGrid, LayoutList, 
  Settings2, Download, Printer, QrCode, MessageSquare,
  ChevronDown, X, Check, RefreshCw, Wrench, Clock, CheckCircle2, Circle
} from 'lucide-react';
import { 
  ServiceOrder, Customer, InventoryItem, ServiceOrderStatus, 
  Brand, Model, User, EquipmentType
} from '../../types';
import { cn } from '../../lib/utils';
import api from '../../lib/api';

// Components
import { ServiceOrderFilters } from './ServiceOrderFilters';
import { ServiceOrderList } from './ServiceOrderList';
import { ServiceOrderForm } from './ServiceOrderForm';

// Modals
import { WhatsAppModal } from './modals/WhatsAppModal';
import { QRCodeModal } from './modals/QRCodeModal';
import { PrintModal } from './modals/PrintModal';
import { DirectOsSearchModal } from './modals/DirectOsSearchModal';
import { StatusManagerModal } from './modals/StatusManagerModal';
import { ServiceOrderStatusModal } from './modals/ServiceOrderStatusModal';

interface ServiceOrdersProps {
  orders: { data: ServiceOrder[], meta: any };
  customers: { data: Customer[], meta: any };
  inventoryItems: InventoryItem[];
  statuses: ServiceOrderStatus[];
  equipmentTypes: EquipmentType[];
  brands: Brand[];
  models: Model[];
  currentUser: User | null;
  onAddOrder: (order: any) => Promise<number | null>;
  onUpdateOrder: (id: number, order: any) => Promise<boolean>;
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
        let order = orders.data.find(o => o.id === directOsId);
        
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
  }, [directOsId, orders.data, directMode]);

  const handleEdit = (order: ServiceOrder) => {
    setEditingOrder(order);
    setIsAdding(true);
  };

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    const success = await onUpdateOrder(id, { status: newStatus, updatedBy: currentUser?.id || 1 });
    if (success) {
      showToast('Status atualizado com sucesso!', 'success');
    }
  };

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

  // Calculate summary stats
  // (Removed static counts as we will map dynamically)

  return (
    <div className="p-4 sm:p-6 lg:p-10 space-y-6 md:space-y-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
              <Settings2 className="text-primary" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">
                Ordens de <span className="text-primary">Serviço</span>
              </h1>
              <p className="text-slate-500 text-sm font-medium">
                Gerencie manutenções, orçamentos e status em tempo real
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={onPrintBlankForm}
            className="h-14 px-6 rounded-2xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:border-primary/30 transition-all flex items-center gap-3 group"
          >
            <Printer size={20} className="group-hover:text-primary transition-colors" />
            <span className="text-sm font-bold">Imprimir Ficha</span>
          </button>

          <button 
            onClick={() => setIsSearchingOS(true)}
            className="h-14 px-6 rounded-2xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:border-primary/30 transition-all flex items-center gap-3 group"
          >
            <Search size={20} className="group-hover:text-primary transition-colors" />
            <span className="text-sm font-bold">Busca Direta</span>
          </button>

          <button 
            onClick={() => setShowStatusManager(true)}
            className="h-14 px-6 rounded-2xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:border-primary/30 transition-all flex items-center gap-3 group"
          >
            <Settings2 size={20} className="group-hover:text-primary transition-colors" />
            <span className="text-sm font-bold">Status</span>
          </button>

          <button 
            onClick={() => {
              setEditingOrder(null);
              setIsAdding(true);
            }}
            className="h-14 px-8 rounded-2xl bg-primary text-white font-black text-sm hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 shadow-lg shadow-primary/25"
          >
            <Plus size={20} strokeWidth={3} />
            NOVA ORDEM
          </button>
        </div>
      </div>

      {/* Summary Cards (Status Filters) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {/* "All" Card */}
        <button
          onClick={() => onStatusFilterChange('all')}
          className={cn(
            "bg-white/5 border rounded-2xl p-4 flex items-center gap-4 transition-all text-left hover:bg-white/10",
            statusFilter === 'all' ? "border-primary shadow-[0_0_15px_rgba(59,130,246,0.3)]" : "border-white/10"
          )}
        >
          <div className={cn(
            "p-3 rounded-xl transition-colors shrink-0",
            statusFilter === 'all' ? "bg-primary text-white" : "bg-slate-500/10 text-slate-400"
          )}>
            <LayoutGrid size={24} />
          </div>
          <div className="min-w-0">
            <p className={cn("text-xs font-bold uppercase tracking-wider truncate", statusFilter === 'all' ? "text-primary" : "text-slate-400")}>Todas as OS</p>
            <p className="text-2xl font-black text-white truncate">{orders.data.length}</p>
          </div>
        </button>

        {/* Dynamic Status Cards */}
        {statuses.map(status => {
          const count = orders.data.filter(o => o.status === status.name).length;
          const isSelected = statusFilter === status.name;
          
          return (
            <button
              key={status.id}
              onClick={() => onStatusFilterChange(status.name)}
              className={cn(
                "bg-white/5 border rounded-2xl p-4 flex items-center gap-4 transition-all text-left hover:bg-white/10",
                isSelected ? "shadow-lg" : "border-white/10"
              )}
              style={isSelected ? { borderColor: status.color, boxShadow: `0 0 15px ${status.color}40` } : {}}
            >
              <div 
                className="p-3 rounded-xl transition-colors shrink-0"
                style={{ 
                  backgroundColor: isSelected ? status.color : `${status.color}15`,
                  color: isSelected ? '#fff' : status.color
                }}
              >
                <Circle size={24} fill="currentColor" />
              </div>
              <div className="min-w-0">
                <p 
                  className="text-xs font-bold uppercase tracking-wider truncate"
                  style={{ color: isSelected ? status.color : '#94a3b8' }}
                  title={status.name}
                >
                  {status.name}
                </p>
                <p className="text-2xl font-black text-white truncate">{count}</p>
              </div>
            </button>
          );
        })}
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

      <AnimatePresence>
        {isAdding && (
          <ServiceOrderForm 
            isAdding={isAdding}
            setIsAdding={setIsAdding}
            editingOrder={editingOrder}
            setEditingOrder={setEditingOrder}
            customers={customers.data}
            inventoryItems={inventoryItems}
            statuses={statuses}
            equipmentTypes={equipmentTypes}
            brands={brands}
            models={models}
            currentUser={currentUser}
            onAddOrder={onAddOrder}
            onUpdateOrder={onUpdateOrder}
            onAddEquipmentType={(name) => onAddEquipmentType(name, 'Smartphone')}
            onAddBrand={onAddBrand}
            onAddModel={onAddModel}
            onTriggerAddCustomer={onTriggerAddCustomer}
            showToast={showToast}
            onOpenConfirm={onOpenConfirm}
            setSelectedOrder={setSelectedOrder}
            setShowWhatsAppModal={setShowWhatsAppModal}
            setShowQRCodeModal={setShowQRCodeModal}
            onGeneratePayment={onGeneratePayment}
          />
        )}
      </AnimatePresence>

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
      />

      <WhatsAppModal 
        show={showWhatsAppModal}
        onClose={() => setShowWhatsAppModal(false)}
        selectedOrder={selectedOrder}
        customers={customers.data}
        settings={settings}
        showToast={showToast}
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
        show={isSearchingOS}
        onClose={() => setIsSearchingOS(false)}
        orders={orders.data}
        handleEdit={handleEdit}
      />
    </div>
  );
};
