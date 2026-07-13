import React from 'react';
import { Briefcase } from 'lucide-react';
import { motion } from 'motion/react';
import { ServiceOrderCard } from './ServiceOrderCard';
import { Pagination } from '../ui/Pagination';
import { cn } from '../../lib/utils';
import { EmptyState } from '../ui/EmptyState';

interface ServiceOrderListProps {
  filteredOrders: any[];
  visibleColumns: any;
  quickStatusOrder: any;
  setQuickStatusOrder: (order: any) => void;
  getStatusColor: (status: string) => any;
  statuses: any[];
  handleUpdateStatus: (id: number, status: string) => void;
  formatCurrency: (value: number) => string;
  setSelectedOrder: (order: any) => void;
  setShowQRCodeModal: (show: boolean) => void;
  setShowWhatsAppModal: (show: boolean) => void;
  setShowPrintModal: (show: boolean) => void;
  handleEdit: (order: any) => void;
  onOpenConfirm: (title: string, message: string, onConfirm: () => void, type?: 'danger' | 'warning' | 'info') => void;
  onDeleteOrder: (id: number) => void;
  clientPayments: any;
  viewMode: 'grid' | 'list';
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
  };
  onPageChange: (page: number) => void;
  onGeneratePayment?: (order: any) => void;
}

export const ServiceOrderList: React.FC<ServiceOrderListProps> = ({
  filteredOrders,
  visibleColumns,
  quickStatusOrder,
  setQuickStatusOrder,
  getStatusColor,
  statuses,
  handleUpdateStatus,
  formatCurrency,
  setSelectedOrder,
  setShowQRCodeModal,
  setShowWhatsAppModal,
  setShowPrintModal,
  handleEdit,
  onOpenConfirm,
  onDeleteOrder,
  clientPayments,
  viewMode,
  pagination,
  onPageChange,
  onGeneratePayment
}) => {
  return (
    <>
      <div className={cn(
        "grid gap-3 md:gap-4",
        viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"
      )}>
        {filteredOrders.map((order, index) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            style={{ position: 'relative', zIndex: quickStatusOrder?.id === order.id ? 50 : 'auto' }}
          >
            <ServiceOrderCard
              order={order}
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
              viewMode={viewMode}
              onGeneratePayment={onGeneratePayment}
            />
          </motion.div>
        ))}
        
        {filteredOrders.length === 0 && (
          <EmptyState icon={Briefcase} title="Nenhuma ordem de serviço encontrada" className="col-span-full" />
        )}
      </div>

      <Pagination 
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalItems={pagination.totalItems}
        limit={pagination.limit}
        onPageChange={onPageChange}
      />
    </>
  );
};
