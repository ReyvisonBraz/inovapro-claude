import React from 'react';
import Settings from '../components/settings/Settings';
import { useSettings } from '../hooks/useSettings';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/ui/Toast';

export const SettingsPage: React.FC = () => {
  const { showToast } = useToast();
  const { 
    settings, 
    setSettings,
    saveSettingsAPI, 
    addCategory, 
    deleteCategory,
    categories,
    fetchSettings,
    fetchCategories
  } = useSettings(showToast);
  
  const { 
    users, 
    saveUserAPI, 
    deleteUserAPI,
    auditLogs,
    fetchUsers,
    fetchAuditLogs
  } = useAuth(showToast);

  React.useEffect(() => {
    fetchSettings();
    fetchCategories();
    fetchUsers();
    fetchAuditLogs();
  }, [fetchSettings, fetchCategories, fetchUsers, fetchAuditLogs]);

  return (
    <Settings 
      settings={settings}
      onUpdateSettings={(newSettings) => setSettings(newSettings)}
      categories={categories}
      onAddCategory={(name, type) => addCategory({ name, type })}
      onDeleteCategory={deleteCategory}
      users={users}
      onAddUser={(user) => saveUserAPI(user)}
      onUpdateUser={(id, user) => saveUserAPI(user, id)}
      onDeleteUser={deleteUserAPI}
      auditLogs={auditLogs}
    />
  );
};

export default SettingsPage;
