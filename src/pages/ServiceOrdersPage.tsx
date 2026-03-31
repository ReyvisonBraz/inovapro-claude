import React from 'react';
import { ServiceOrders } from '../components/ServiceOrders';
import { useServiceOrders } from '../hooks/useServiceOrders';
import { useCustomers } from '../hooks/useCustomers';
import { useInventory } from '../hooks/useInventory';
import { useClientPayments } from '../hooks/useClientPayments';
import { useToast } from '../components/ui/Toast';
import { useSettingsStore } from '../store/useSettingsStore';
import { useFilterStore } from '../store/useFilterStore';
import { useModalStore } from '../store/useModalStore';
import { useFormStore } from '../store/useFormStore';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';

export const ServiceOrdersPage: React.FC = () => {
  const { showToast } = useToast();
  const { settings } = useSettingsStore();
  const { 
    osSearchTerm, setOsSearchTerm,
    osStatusFilter, setOsStatusFilter,
    osPriorityFilter, setOsPriorityFilter,
    osSortBy, setOsSortBy
  } = useFilterStore();
  const { openConfirm, setEditingCustomer } = useModalStore();
  const { currentUser } = useAuthStore();
  const { setNewCustomer } = useFormStore();
  const { 
    isAddingServiceOrder, setIsAddingServiceOrder,
    directOsId, setDirectOsId,
    directMode,
    setIsAddingCustomer
  } = useAppStore();

  const { 
    serviceOrders, 
    setServiceOrdersPage, 
    serviceOrderStatuses,
    equipmentTypes,
    brands,
    models,
    saveServiceOrderAPI,
    deleteServiceOrderAPI,
    addServiceOrderStatusAPI,
    deleteServiceOrderStatusAPI,
    addEquipmentTypeAPI,
    addBrandAPI,
    addModelAPI
  } = useServiceOrders();
  const { customers } = useCustomers();
  const { inventoryItems } = useInventory(showToast);
  const { clientPayments } = useClientPayments(showToast);

  return (
    <ServiceOrders 
      orders={serviceOrders}
      customers={customers}
      inventoryItems={inventoryItems}
      statuses={serviceOrderStatuses}
      equipmentTypes={equipmentTypes}
      brands={brands}
      models={models}
      clientPayments={clientPayments}
      onAddOrder={async (order) => {
        try {
          const saved = await saveServiceOrderAPI(order);
          return saved.id;
        } catch (err) {
          return null;
        }
      }}
      onUpdateOrder={async (id, order) => {
        try {
          await saveServiceOrderAPI(order, id);
          return true;
        } catch (err) {
          return false;
        }
      }}
      onDeleteOrder={deleteServiceOrderAPI}
      onAddStatus={addServiceOrderStatusAPI}
      onDeleteStatus={deleteServiceOrderStatusAPI}
      onAddEquipmentType={addEquipmentTypeAPI}
      onAddBrand={addBrandAPI}
      onAddModel={addModelAPI}
      onPrintBlankForm={() => {
        window.print();
      }}
      onTriggerAddCustomer={() => {
        setEditingCustomer(null);
        setNewCustomer({
          firstName: '',
          lastName: '',
          nickname: '',
          cpf: '',
          companyName: '',
          phone: '',
          observation: '',
          creditLimit: ''
        });
        setIsAddingCustomer(true);
      }}
      pagination={{
        currentPage: serviceOrders.meta.page,
        totalPages: serviceOrders.meta.totalPages,
        totalItems: serviceOrders.meta.total,
        limit: serviceOrders.meta.limit
      }}
      onPageChange={setServiceOrdersPage}
      settings={settings}
      isAdding={isAddingServiceOrder}
      setIsAdding={setIsAddingServiceOrder}
      directOsId={directOsId}
      setDirectOsId={setDirectOsId}
      directMode={directMode}
      searchTerm={osSearchTerm}
      onSearchChange={setOsSearchTerm}
      statusFilter={osStatusFilter}
      onStatusFilterChange={setOsStatusFilter}
      priorityFilter={osPriorityFilter}
      onPriorityFilterChange={setOsPriorityFilter}
      sortBy={osSortBy}
      onSortByChange={setOsSortBy}
      onOpenConfirm={openConfirm}
      currentUser={currentUser}
    />
  );
};

export default ServiceOrdersPage;
