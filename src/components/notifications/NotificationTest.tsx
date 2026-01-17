import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications } from '@/contexts/NotificationContext';
import type { Notification } from '@/contexts/NotificationContext';
import { Settings } from 'lucide-react';

interface NotificationTestModalProps {
  children: React.ReactNode;
}

export const NotificationTestModal: React.FC<NotificationTestModalProps> = ({ children }) => {
  const { addNotification, notifications } = useNotifications();

  const testNotifications = [
    {
      type: 'weather' as const,
      priority: 'high' as const,
      title: 'High Temperature Alert',
      message: 'Temperature has reached 38°C. Consider indoor activities and stay hydrated.',
    },
    {
      type: 'weather' as const,
      priority: 'medium' as const,
      title: 'Heavy Rain Warning',
      message: 'Heavy rainfall (15mm) expected. Secure outdoor equipment and check drainage.',
    },
    {
      type: 'market' as const,
      priority: 'medium' as const,
      title: 'Price Alert: Wheat',
      message: 'Wheat prices increased by 8% to ₹2,250/quintal at Delhi Mandi.',
    },
    {
      type: 'price-alert' as const,
      priority: 'high' as const,
      title: 'Tomato Price Surge',
      message: 'Tomato prices up 15% to ₹45/kg. Consider selling if you have stock.',
      actionUrl: '/marketplace',
      actionText: 'View Market',
    },
    {
      type: 'system' as const,
      priority: 'low' as const,
      title: 'Data Sync Complete',
      message: 'Successfully updated all market and weather data.',
      autoHide: true,
      hideAfter: 3000,
    },
    {
      type: 'info' as const,
      priority: 'medium' as const,
      title: 'New Workshop Available',
      message: 'Join our organic farming workshop this Saturday. Limited seats available.',
      actionUrl: '/workshops',
      actionText: 'Register Now',
    },
  ];

  const handleTestNotification = (notification: Notification) => {
    addNotification(notification);
  };

  const handleTestPushNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Test Push Notification', {
        body: 'This is a test push notification from AgriSmart',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'test-notification',
      });
    } else {
      addNotification({
        type: 'system',
        priority: 'medium',
        title: 'Push Notifications Disabled',
        message: 'Please enable push notifications in your browser settings.',
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Notification System Test
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardDescription>
                  Test different types of notifications to see how they appear in the notification bell.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {testNotifications.map((notification, index) => (
                    <Card key={index} className="border-l-4 border-l-blue-500">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm">{notification.title}</CardTitle>
                          <Badge variant={
                            notification.priority === 'high' ? 'destructive' :
                            notification.priority === 'medium' ? 'default' :
                            'secondary'
                          }>
                            {notification.priority}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground mb-3">
                          {notification.message}
                        </p>
                        <Button
                          size="sm"
                          onClick={() => handleTestNotification(notification)}
                          className="w-full"
                        >
                          Send {notification.type} Notification
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      onClick={handleTestPushNotification}
                      variant="outline"
                      className="flex-1"
                    >
                      Test Push Notification
                    </Button>
                    <Button
                      onClick={() => {
                        testNotifications.forEach((notification, index) => {
                          setTimeout(() => handleTestNotification(notification), index * 500);
                        });
                      }}
                      className="flex-1"
                    >
                      Send All Notifications
                    </Button>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-lg font-semibold mb-3">Current Notifications ({notifications.length})</h3>
                  {notifications.length === 0 ? (
                    <p className="text-muted-foreground">No notifications</p>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className="p-3 border rounded-lg bg-muted/50"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">{notification.title}</span>
                            <span className="text-xs text-muted-foreground">
                              {notification.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};