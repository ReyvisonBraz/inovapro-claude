import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ServiceOrders } from '../components/service-orders/ServiceOrders';
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
import { useDebounce } from '../hooks/useDebounce';
import { printBlankForm } from '../lib/printUtils';
import { AddClientPaymentModal } from '../components/payments/modals/AddClientPaymentModal';

export const ServiceOrdersPage: React.FC = () => {
  const { showToast } = useToast();
  const { settings } = useSettingsStore();
  const { 
    osSearchTerm, setOsSearchTerm,
    osStatusFilter, setOsStatusFilter,
    osPriorityFilter, setOsPriorityFilter,
    osSortBy, setOsSortBy,
    osDateFilter, setOsDateFilter
  } = useFilterStore();
  
  const [localSearchTerm, setLocalSearchTerm] = useState(osSearchTerm);
  const debouncedSearchTerm = useDebounce(localSearchTerm, 500);

  useEffect(() => {
    setOsSearchTerm(debouncedSearchTerm);
  }, [debouncedSearchTerm, setOsSearchTerm]);

  const { openConfirm, setEditingCustomer } = useModalStore();
  const { currentUser } = useAuthStore();
  const { setNewCustomer, setNewClientPayment, newClientPayment } = useFormStore();
  const { 
    isAddingServiceOrder, setIsAddingServiceOrder,
    isAddingClientPayment, setIsAddingClientPayment,
    directOsId, setDirectOsId,
    directMode,
    setIsAddingCustomer,
    setCustomerRegistrationSource
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
  const { clientPayments, saveClientPaymentAPI } = useClientPayments();
  const [isSavingPayment, setIsSavingPayment] = useState(false);

  const navigate = useNavigate();

  const handleGeneratePayment = (order: any) => {
    let servicesDesc = '';
    if (order.services && order.services.length > 0) {
      servicesDesc = order.services.map((s: any) => s.name).join(', ');
    } else if (order.servicesPerformed) {
      servicesDesc = order.servicesPerformed;
    }

    const description = `OS #${order.id.toString().padStart(4, '0')} - ${order.equipmentBrand} ${order.equipmentModel}${servicesDesc ? ` (${servicesDesc})` : ''}`;

    setNewClientPayment({
      customerId: order.customerId,
      description: description.substring(0, 200),
      totalAmount: order.totalAmount.toString(),
      paidAmount: order.totalAmount.toString(), // Sugere pagamento total à vista
      purchaseDate: new Date().toISOString().split('T')[0],
      dueDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'Dinheiro',
      installmentsCount: 1,
      installmentInterval: 'monthly'
    });
    setIsAddingClientPayment(true);
  };

  const handleAddClientPayment = async () => {
    if (isSavingPayment) return;
    if (!newClientPayment.customerId || !newClientPayment.totalAmount) return;
    
    setIsSavingPayment(true);
    try {
      const total = parseFloat(newClientPayment.totalAmount.toString().replace(',', '.'));
      const paid = parseFloat((newClientPayment.paidAmount || '0').toString().replace(',', '.'));
      const installmentsCount = newClientPayment.installmentsCount || 1;
      const interval = newClientPayment.installmentInterval || 'monthly';
      const saleId = `SALE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const promises = [];

      if (paid > 0) {
        promises.push(saveClientPaymentAPI({
          ...newClientPayment,
          description: `ENTRADA: ${newClientPayment.description}`,
          totalAmount: paid,
          paidAmount: paid,
          dueDate: newClientPayment.purchaseDate,
          status: 'paid',
          installmentsCount: 1,
          saleId,
          createdBy: currentUser?.id
        }));
      }

      const remainingAmount = total - paid;
      if (remainingAmount > 0) {
        const installmentAmount = remainingAmount / installmentsCount;

        for (let i = 0; i < installmentsCount; i++) {
          let dueDate = new Date(newClientPayment.dueDate + 'T12:00:00');
          if (interval === 'monthly') {
            dueDate.setMonth(dueDate.getMonth() + i);
          } else if (interval === 'biweekly') {
            dueDate.setDate(dueDate.getDate() + (i * 15));
          } else if (interval === 'weekly') {
            dueDate.setDate(dueDate.getDate() + (i * 7));
          } else if (interval === 'daily') {
            dueDate.setDate(dueDate.getDate() + i);
          }

          const description = installmentsCount > 1 
            ? `${newClientPayment.description} (Parcela ${i + 1}/${installmentsCount})`
            : newClientPayment.description;

          promises.push(saveClientPaymentAPI({
            ...newClientPayment,
            description,
            totalAmount: installmentAmount,
            paidAmount: 0,
            dueDate: dueDate.toISOString().split('T')[0],
            status: 'pending',
            installmentsCount: 1,
            saleId,
            createdBy: currentUser?.id
          }));
        }
      }

      await Promise.all(promises);

      setIsAddingClientPayment(false);
      setNewClientPayment({
        customerId: 0,
        description: '',
        totalAmount: '',
        paidAmount: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        dueDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'Dinheiro',
        installmentsCount: 1,
        installmentInterval: 'monthly',
        type: 'income'
      });
      showToast('Pagamento gerado com sucesso!', 'success');
    } catch (err) {
      console.error("Failed to add client payment", err);
      showToast('Erro ao gerar cobrança.', 'error');
    } finally {
      setIsSavingPayment(false);
    }
  };

  return (
    <>
    <ServiceOrders 
      orders={serviceOrders}
      customers={customers}
      inventoryItems={inventoryItems}
      statuses={serviceOrderStatuses}
      equipmentTypes={equipmentTypes}
      brands={brands}
      models={models}
      clientPayments={clientPayments}
      onGeneratePayment={handleGeneratePayment}
      onAddOrder={async (order) => {
        try {
          const saved = await saveServiceOrderAPI(order);
          setOsSearchTerm(''); // Clear search to show the new order
          setOsStatusFilter('all'); // Clear status filter
          setOsPriorityFilter('all'); // Clear priority filter
          setOsSortBy('newest'); // Reset sort to newest
          setServiceOrdersPage(1);
          showToast("Ordem de Serviço salva com sucesso!", "success");
          return saved.id;
        } catch (err: any) {
          showToast(err.message || "Erro ao salvar Ordem de Serviço", "error");
          return null;
        }
      }}
      onUpdateOrder={async (id, order) => {
        try {
          await saveServiceOrderAPI(order, id);
          showToast("Ordem de Serviço atualizada com sucesso!", "success");
          return true;
        } catch (err: any) {
          showToast(err.message || "Erro ao atualizar Ordem de Serviço", "error");
          return false;
        }
      }}
      onDeleteOrder={async (id) => {
        await deleteServiceOrderAPI(id);
      }}
      onAddStatus={async (status) => {
        await addServiceOrderStatusAPI(status);
      }}
      onDeleteStatus={async (id) => {
        await deleteServiceOrderStatusAPI(id);
      }}
      onAddEquipmentType={async (name, icon) => {
        await addEquipmentTypeAPI(name, icon);
      }}
      onAddBrand={async (name, equipmentType) => {
        await addBrandAPI(name, equipmentType);
      }}
      onAddModel={async (brandId, name) => {
        await addModelAPI(brandId, name);
      }}
      onPrintBlankForm={() => {
        printBlankForm(settings);
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
        setCustomerRegistrationSource('service-orders');
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
      searchTerm={localSearchTerm}
      onSearchChange={setLocalSearchTerm}
      statusFilter={osStatusFilter}
      onStatusFilterChange={setOsStatusFilter}
      priorityFilter={osPriorityFilter}
      onPriorityFilterChange={setOsPriorityFilter}
      sortBy={osSortBy}
      onSortByChange={setOsSortBy}
      dateFilter={osDateFilter}
      onDateFilterChange={setOsDateFilter}
      onOpenConfirm={openConfirm}
      currentUser={currentUser}
    />
    <AddClientPaymentModal 
      isOpen={isAddingClientPayment}
      onClose={() => setIsAddingClientPayment(false)}
      customers={customers.data}
      newClientPayment={newClientPayment}
      setNewClientPayment={setNewClientPayment}
      onAdd={handleAddClientPayment}
      isSaving={isSavingPayment}
    />
    </>
  );
};

export default ServiceOrdersPage;
