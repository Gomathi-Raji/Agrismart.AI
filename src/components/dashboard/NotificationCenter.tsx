import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useNotifications } from "@/contexts/NotificationContext";
import {
  Bell,
  AlertTriangle,
  Info,
  CheckCircle,
  X,
  Settings,
  CloudRain,
  TrendingUp,
  Package,
  Users
} from "lucide-react";

interface Notification {
  id: string;
  type: "weather" | "market" | "system" | "order" | "alert" | "match" | "demand" | "purchase";
  title: string;
  message: string;
  timestamp: string;
  priority: "high" | "medium" | "low";
  read: boolean;
  actionable?: boolean;
}

interface NotificationCenterProps {
  userType?: "farmer" | "buyer" | "admin";
}

export function NotificationCenter({ userType = "farmer" }: NotificationCenterProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, clearAll, settings, updateSettings } = useNotifications();
  const [showSettings, setShowSettings] = useState(false);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "weather":
        return CloudRain;
      case "market":
        return TrendingUp;
      case "price-alert":
        return TrendingUp;
      case "system":
        return Info;
      case "info":
        return Info;
      default:
        return Bell;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "text-destructive bg-destructive/10";
      case "high":
        return "text-destructive bg-destructive/10";
      case "medium":
        return "text-warning bg-warning/10";
      default:
        return "text-info bg-info/10";
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="h-4 w-4" />
            </Button>
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                Mark all read
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {showSettings && (
          <div className="mb-6 p-4 bg-accent/30 rounded-lg space-y-3">
            <h4 className="font-medium text-sm">Notification Settings</h4>
            <div className="space-y-2">
              {Object.entries(settings.types).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm capitalize">{key} Notifications</span>
                  <Switch
                    checked={value}
                    onCheckedChange={(checked) =>
                      updateSettings({ types: { ...settings.types, [key]: checked } })
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No notifications</p>
            </div>
          ) : (
            notifications.map((notification) => {
              const IconComponent = getNotificationIcon(notification.type);
              return (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    notification.read 
                      ? "bg-background border-border" 
                      : "bg-accent/50 border-primary/20"
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getPriorityColor(notification.priority)}`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm">{notification.title}</h4>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{notification.message}</p>
                        <p className="text-xs text-muted-foreground">{formatTimestamp(notification.timestamp)}</p>
                        
                        {notification.actionUrl && notification.actionText && (
                          <Button variant="outline" size="sm" className="mt-2 h-7 text-xs" asChild>
                            <a href={notification.actionUrl}>{notification.actionText}</a>
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNotification(notification.id);
                      }}
                      className="opacity-50 hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}