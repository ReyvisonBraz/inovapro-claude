import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface UIContextType {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebarCollapsed: () => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  showNotifications: boolean;
  setShowNotifications: (show: boolean) => void;
  toggleNotifications: () => void;
  notificationTab: 'payments' | 'service-orders';
  setNotificationTab: (tab: 'payments' | 'service-orders') => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [fontSize, setFontSizeState] = useState<number>(() => {
    const saved = localStorage.getItem('app_font_size');
    return saved ? parseInt(saved, 10) : 16;
  });
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationTab, setNotificationTab] = useState<'payments' | 'service-orders'>('payments');

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const toggleSidebarCollapsed = useCallback(() => {
    setIsSidebarCollapsed(prev => !prev);
  }, []);

  const toggleNotifications = useCallback(() => {
    setShowNotifications(prev => !prev);
  }, []);

  const setFontSize = useCallback((size: number) => {
    setFontSizeState(size);
    document.documentElement.style.fontSize = `${size}px`;
    localStorage.setItem('app_font_size', size.toString());
  }, []);

  return (
    <UIContext.Provider value={{
      isSidebarOpen,
      setIsSidebarOpen,
      toggleSidebar,
      isSidebarCollapsed,
      setIsSidebarCollapsed,
      toggleSidebarCollapsed,
      fontSize,
      setFontSize,
      showNotifications,
      setShowNotifications,
      toggleNotifications,
      notificationTab,
      setNotificationTab
    }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};
