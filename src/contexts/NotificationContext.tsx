import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

export type NotificationType = 'weather' | 'market' | 'price-alert' | 'system' | 'info';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
  icon?: string;
  data?: unknown;
  autoHide?: boolean;
  hideAfter?: number; // milliseconds
}

export interface NotificationSettings {
  enabled: boolean;
  pushEnabled: boolean;
  soundEnabled: boolean;
  types: {
    weather: boolean;
    market: boolean;
    priceAlert: boolean;
    system: boolean;
    info: boolean;
  };
  priorities: {
    low: boolean;
    medium: boolean;
    high: boolean;
    urgent: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string;   // HH:MM format
  };
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  settings: NotificationSettings;
  
  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => string;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  updateSettings: (settings: Partial<NotificationSettings>) => void;
  
  // Push notification methods
  requestPermission: () => Promise<boolean>;
  isPermissionGranted: boolean;
  sendPushNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
}

const defaultSettings: NotificationSettings = {
  enabled: true,
  pushEnabled: false,
  soundEnabled: true,
  types: {
    weather: true,
    market: true,
    priceAlert: true,
    system: true,
    info: true,
  },
  priorities: {
    low: true,
    medium: true,
    high: true,
    urgent: true,
  },
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00',
  },
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>(() => {
    // Load settings from localStorage
    try {
      const saved = localStorage.getItem('agrismart_notification_settings');
      return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);

  // Check push notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setIsPermissionGranted(Notification.permission === 'granted');
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('agrismart_notification_settings', JSON.stringify(settings));
    } catch (error) {
      console.warn('Failed to save notification settings:', error);
    }
  }, [settings]);

  // Load notifications from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('agrismart_notifications');
      if (saved) {
        const savedNotifications = JSON.parse(saved).map((n: unknown) => {
          const notification = n as Record<string, unknown>;
          return {
            ...notification,
            timestamp: new Date(notification.timestamp as string),
          } as Notification;
        });
        // Only keep notifications from last 7 days
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const recentNotifications = savedNotifications.filter((n: Notification) => 
          n.timestamp > weekAgo
        );
        setNotifications(recentNotifications);
      }
    } catch (error) {
      console.warn('Failed to load notifications:', error);
    }
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('agrismart_notifications', JSON.stringify(notifications));
    } catch (error) {
      console.warn('Failed to save notifications:', error);
    }
  }, [notifications]);

  // Check if we're in quiet hours
  const isQuietHours = useCallback(() => {
    if (!settings.quietHours.enabled) return false;
    
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const { start, end } = settings.quietHours;
    
    if (start <= end) {
      return currentTime >= start && currentTime <= end;
    } else {
      // Overnight quiet hours (e.g., 22:00 to 08:00)
      return currentTime >= start || currentTime <= end;
    }
  }, [settings.quietHours]);

  // Check if notification should be shown based on settings
  const shouldShowNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    if (!settings.enabled) return false;
    if (!settings.types[notification.type]) return false;
    if (!settings.priorities[notification.priority]) return false;
    if (isQuietHours() && notification.priority !== 'urgent') return false;
    
    return true;
  }, [settings, isQuietHours]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    if (!shouldShowNotification(notification)) {
      return '';
    }

    const id = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: new Date(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 99)]); // Keep only last 100 notifications

    // Auto-hide notification if specified
    if (notification.autoHide) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.hideAfter || 5000);
    }

    // Send push notification if enabled
    if (settings.pushEnabled && isPermissionGranted) {
      sendBrowserNotification(newNotification);
    }

    return id;
  }, [shouldShowNotification, settings.pushEnabled, isPermissionGranted]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support desktop notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      setIsPermissionGranted(true);
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';
      setIsPermissionGranted(granted);
      return granted;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  }, []);

  const sendBrowserNotification = useCallback((notification: Notification) => {
    if (!isPermissionGranted || !('Notification' in window)) {
      return;
    }

    try {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: notification.icon || '/favicon.ico',
        badge: '/favicon.ico',
        tag: notification.id,
        requireInteraction: notification.priority === 'urgent',
        silent: !settings.soundEnabled,
        data: {
          url: notification.actionUrl,
          notificationId: notification.id,
        },
      });

      // Handle notification click
      browserNotification.onclick = () => {
        window.focus();
        if (notification.actionUrl) {
          window.location.href = notification.actionUrl;
        }
        markAsRead(notification.id);
        browserNotification.close();
      };

      // Auto-close after 10 seconds for non-urgent notifications
      if (notification.priority !== 'urgent') {
        setTimeout(() => {
          browserNotification.close();
        }, 10000);
      }
    } catch (error) {
      console.error('Failed to send browser notification:', error);
    }
  }, [isPermissionGranted, settings.soundEnabled, markAsRead]);

  const sendPushNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    if (shouldShowNotification(notification)) {
      const id = addNotification(notification);
      return id;
    }
    return '';
  }, [shouldShowNotification, addNotification]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const contextValue: NotificationContextType = {
    notifications,
    unreadCount,
    settings,
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    updateSettings,
    requestPermission,
    isPermissionGranted,
    sendPushNotification,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};