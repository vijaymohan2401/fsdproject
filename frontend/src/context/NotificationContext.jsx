import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const knownNotifIds = useRef(new Set());
  const initialLoadDone = useRef(false);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      knownNotifIds.current.clear();
      initialLoadDone.current = false;
      return;
    }

    try {
      setLoading(true);
      const res = await api.get('/notifications', { limit: 40 });
      if (res.success) {
        setNotifications(res.notifications || []);
        setUnreadCount(res.unreadCount || 0);

        // Detect new incoming notifications to surface toast
        if (initialLoadDone.current && Array.isArray(res.notifications)) {
          res.notifications.forEach((n) => {
            if (!n.isRead && !knownNotifIds.current.has(n._id)) {
              if (n.type === 'exceeded') {
                showToast({ type: 'error', message: n.message });
              } else if (n.type === 'warning' || n.type === 'limit_reached') {
                showToast({ type: 'warning', message: n.message });
              }
            }
          });
        }

        // Register all current IDs
        if (Array.isArray(res.notifications)) {
          res.notifications.forEach((n) => knownNotifIds.current.add(n._id));
        }
        initialLoadDone.current = true;
      }
    } catch {
      // Silently catch background polling errors to avoid noisy toast
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, showToast]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Listen for global data updates (transactions/budgets added, edited, deleted)
  useEffect(() => {
    const handleUpdate = () => {
      fetchNotifications();
    };
    window.addEventListener('spendwise:data-updated', handleUpdate);
    return () => window.removeEventListener('spendwise:data-updated', handleUpdate);
  }, [fetchNotifications]);

  const markAsRead = async (id) => {
    try {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      const res = await api.put(`/notifications/${id}/read`);
      if (res.success && res.unreadCount !== undefined) {
        setUnreadCount(res.unreadCount);
      }
    } catch {
      fetchNotifications();
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);

      await api.put('/notifications/read-all');
    } catch {
      fetchNotifications();
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

