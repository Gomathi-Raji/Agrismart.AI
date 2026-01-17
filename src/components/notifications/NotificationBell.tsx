import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Bell,
  BellRing,
  Check,
  X,
  Settings,
  Volume2,
  VolumeX,
  Clock,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  CloudRain,
  Sun,
  DollarSign,
  Info,
  ExternalLink,
  Trash2,
  MarkRead,
} from 'lucide-react';
import { useNotifications, type Notification, type NotificationType } from '@/contexts/NotificationContext';
import { cn } from '@/lib/utils';

interface NotificationBellProps {
  className?: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  showBadge?: boolean;
}

export function NotificationBell({
  className = '',
  variant = 'ghost',
  size = 'md',
  showBadge = true
}: NotificationBellProps) {
  const {
    notifications,
    unreadCount,
    settings,
    markAsRead,
    markAllAsRead,
    clearAll,
    removeNotification,
    updateSettings,
    requestPermission,
    isPermissionGranted,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'weather':
        return <CloudRain className="h-4 w-4 text-blue-500" />;
      case 'market':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'price-alert':
        return <DollarSign className="h-4 w-4 text-orange-500" />;
      case 'system':
        return <Settings className="h-4 w-4 text-gray-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 border-red-200 bg-red-50';
      case 'high':
        return 'text-orange-600 border-orange-200 bg-orange-50';
      case 'medium':
        return 'text-blue-600 border-blue-200 bg-blue-50';
      default:
        return 'text-gray-600 border-gray-200 bg-gray-50';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return timestamp.toLocaleDateString();
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    if (notification.actionUrl) {
      window.open(notification.actionUrl, '_blank');
    }
  };

  const handleEnablePushNotifications = async () => {
    const granted = await requestPermission();
    if (granted) {
      updateSettings({ pushEnabled: true });
    }
  };

  const buttonSizeClass = {
    sm: 'h-8 w-8',
    md: 'h-9 w-9',
    lg: 'h-10 w-10'
  }[size];

  const recentNotifications = notifications.slice(0, 10);
  const hasUnread = unreadCount > 0;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={variant}
          size="sm"
          className={cn(
            'relative',
            buttonSizeClass,
            'p-0',
            hasUnread && 'animate-pulse',
            className
          )}
        >
          {hasUnread ? (
            <BellRing className="h-5 w-5" />
          ) : (
            <Bell className="h-5 w-5" />
          )}
          
          {showBadge && unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center min-w-[20px]"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-80 sm:w-96 p-0" 
        align="end"
        sideOffset={8}
      >
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {unreadCount} new
                  </Badge>
                )}
              </CardTitle>
              
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="h-8 px-2 text-xs"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Mark all read
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <Separator />

          <CardContent className="p-0">
            {recentNotifications.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notifications yet</p>
                <p className="text-xs mt-1">
                  You'll see weather alerts, price changes, and system updates here
                </p>
              </div>
            ) : (
              <ScrollArea className="h-80">
                <div className="p-2 space-y-1">
                  {recentNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        'relative p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50',
                        !notification.read && 'bg-blue-50/50 border-blue-200',
                        notification.read && 'bg-background border-border'
                      )}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className={cn(
                              'text-sm font-medium truncate',
                              !notification.read && 'font-semibold'
                            )}>
                              {notification.title}
                            </h4>
                            
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <span className="text-xs text-muted-foreground">
                                {formatTimestamp(notification.timestamp)}
                              </span>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeNotification(notification.id);
                                }}
                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center justify-between mt-2">
                            <Badge
                              variant="outline"
                              className={cn('text-xs', getPriorityColor(notification.priority))}
                            >
                              {notification.priority}
                            </Badge>
                            
                            {notification.actionUrl && (
                              <div className="flex items-center gap-1 text-xs text-blue-600">
                                <ExternalLink className="h-3 w-3" />
                                <span>View details</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {!notification.read && (
                        <div className="absolute top-3 right-3 h-2 w-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}

            {notifications.length > 10 && (
              <div className="p-3 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => {
                    // TODO: Navigate to full notifications page
                    console.log('Show all notifications');
                  }}
                >
                  View all {notifications.length} notifications
                </Button>
              </div>
            )}

            <Separator />

            {/* Quick Settings */}
            <div className="p-3 space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="push-notifications" className="text-sm">
                  Push notifications
                </Label>
                <div className="flex items-center gap-2">
                  {!isPermissionGranted && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEnablePushNotifications}
                      className="h-7 px-2 text-xs"
                    >
                      Enable
                    </Button>
                  )}
                  <Switch
                    id="push-notifications"
                    checked={settings.pushEnabled && isPermissionGranted}
                    onCheckedChange={(checked) => {
                      if (checked && !isPermissionGranted) {
                        handleEnablePushNotifications();
                      } else {
                        updateSettings({ pushEnabled: checked });
                      }
                    }}
                    disabled={!isPermissionGranted}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="sound-notifications" className="text-sm">
                  Sound
                </Label>
                <Switch
                  id="sound-notifications"
                  checked={settings.soundEnabled}
                  onCheckedChange={(checked) => updateSettings({ soundEnabled: checked })}
                />
              </div>

              {notifications.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAll}
                  className="w-full text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Clear all notifications
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}