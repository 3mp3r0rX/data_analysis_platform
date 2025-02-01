import { useState } from 'react';

export type Notification = {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  timestamp: Date;
};

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const addNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const newNotification = {
      id: Date.now().toString(),
      message,
      type,
      timestamp: new Date()
    };
    setNotifications(prev => [newNotification, ...prev].slice(0, 5));
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return {
    notifications,
    showNotifications,
    setShowNotifications,
    addNotification,
    removeNotification
  };
};