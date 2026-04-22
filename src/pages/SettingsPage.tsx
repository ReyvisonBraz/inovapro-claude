import React from 'react';
import Settings from '../components/settings/Settings';
import { useSettings } from '../hooks/useSettings';
import { useUsers } from '../hooks/useUsers';
import { useAuditLogs } from '../hooks/useAuditLogs';
import { useServiceOrders } from '../hooks/useServiceOrders';
import { useToast } from '../components/ui/Toast';

export const SettingsPage: React.FC = () => {
  const { showToast } = useToast();
  const { 
    settings, 
    saveSettingsAPI, 
    addCategory, 
    deleteCategory,
    categories
  } = useSettings(showToast);
  
  const { useUsersQuery, addUserMutation, updateUserMutation, deleteUserMutation } = useUsers();
  const { useAuditLogsQuery } = useAuditLogs();
  const { 
    brands, models, equipmentTypes,
    addBrandAPI, updateBrandAPI, deleteBrandAPI,
    addModelAPI, updateModelAPI, deleteModelAPI,
    addEquipmentTypeAPI, updateEquipmentTypeAPI, deleteEquipmentTypeAPI
  } = useServiceOrders();

  const usersQuery = useUsersQuery();
  const auditLogsQuery = useAuditLogsQuery();

  return (
    <Settings 
      settings={settings}
      onUpdateSettings={saveSettingsAPI}
      categories={categories}
      onAddCategory={(name, type) => addCategory({ name, type })}
      onDeleteCategory={deleteCategory}
      users={usersQuery.data || []}
      onAddUser={(user) => addUserMutation.mutate(user)}
      onUpdateUser={(id, user) => updateUserMutation.mutate({ id, user })}
      onDeleteUser={(id) => deleteUserMutation.mutate(id)}
      auditLogs={auditLogsQuery.data || []}
      brands={brands || []}
      models={models || []}
      equipmentTypes={equipmentTypes || []}
      onAddBrand={addBrandAPI}
      onUpdateBrand={updateBrandAPI}
      onDeleteBrand={deleteBrandAPI}
      onAddModel={addModelAPI}
      onUpdateModel={updateModelAPI}
      onDeleteModel={deleteModelAPI}
      onAddEquipmentType={addEquipmentTypeAPI}
      onUpdateEquipmentType={updateEquipmentTypeAPI}
      onDeleteEquipmentType={deleteEquipmentTypeAPI}
    />
  );
};

export default SettingsPage;
