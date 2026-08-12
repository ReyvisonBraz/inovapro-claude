import React from 'react';
import Settings from '../components/settings/Settings';
import { useSettings } from '../hooks/useSettings';
import { useUsers } from '../hooks/useUsers';
import { useAuditLogs } from '../hooks/useAuditLogs';
import { useServiceOrders } from '../hooks/useServiceOrders';
import { useToast } from '../components/ui/Toast';
import { useSystemErrors } from '../hooks/useSystemErrors';

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
  const { errors: systemErrors, resolveError } = useSystemErrors();

  if (!settings) {
    return <div className="p-10 text-center text-slate-400 font-medium">Carregando configurações…</div>;
  }

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
      systemErrors={systemErrors}
      onResolveSystemError={resolveError}
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
