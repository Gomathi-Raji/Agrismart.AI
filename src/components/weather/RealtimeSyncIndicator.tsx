import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  Signal, 
  Clock, 
  Settings,
  CheckCircle,
  AlertTriangle,
  XCircle
} from 'lucide-react';
import { WeatherSyncStatus } from '@/hooks/useRealtimeWeather';

interface RealtimeSyncIndicatorProps {
  syncStatus: WeatherSyncStatus;
  onRefresh: () => void;
  onToggleAutoRefresh: (enabled: boolean) => void;
  onUpdateInterval: (minutes: number) => void;
  refreshInterval: number;
  className?: string;
  compact?: boolean;
}

export function RealtimeSyncIndicator({
  syncStatus,
  onRefresh,
  onToggleAutoRefresh,
  onUpdateInterval,
  refreshInterval,
  className = '',
  compact = false
}: RealtimeSyncIndicatorProps) {
  const {
    isOnline,
    lastUpdated,
    nextUpdateIn,
    isRefreshing,
    autoRefreshEnabled,
    failedAttempts,
    connectionQuality
  } = syncStatus;

  const getConnectionIcon = () => {
    if (!isOnline) return <WifiOff className="h-4 w-4" />;
    
    switch (connectionQuality) {
      case 'excellent':
        return <Wifi className="h-4 w-4 text-green-500" />;
      case 'good':
        return <Signal className="h-4 w-4 text-blue-500" />;
      case 'poor':
        return <Signal className="h-4 w-4 text-yellow-500" />;
      default:
        return <WifiOff className="h-4 w-4 text-red-500" />;
    }
  };

  const getSyncStatusBadge = () => {
    if (!isOnline) {
      return <Badge variant="destructive" className="text-xs">Offline</Badge>;
    }
    
    if (isRefreshing) {
      return <Badge variant="secondary" className="text-xs">Syncing...</Badge>;
    }
    
    if (failedAttempts > 0) {
      return <Badge variant="destructive" className="text-xs">Sync Error</Badge>;
    }
    
    if (lastUpdated) {
      const timeSinceUpdate = Math.floor((Date.now() - lastUpdated.getTime()) / 1000 / 60);
      if (timeSinceUpdate < 1) {
        return <Badge variant="default" className="text-xs bg-green-500">Just now</Badge>;
      } else if (timeSinceUpdate < 5) {
        return <Badge variant="default" className="text-xs bg-green-500">{timeSinceUpdate}m ago</Badge>;
      } else if (timeSinceUpdate < 30) {
        return <Badge variant="secondary" className="text-xs">{timeSinceUpdate}m ago</Badge>;
      } else {
        return <Badge variant="outline" className="text-xs">{timeSinceUpdate}m ago</Badge>;
      }
    }
    
    return <Badge variant="outline" className="text-xs">No data</Badge>;
  };

  const formatNextUpdate = () => {
    if (!autoRefreshEnabled || !isOnline) return '';
    
    const minutes = Math.floor(nextUpdateIn / 60);
    const seconds = nextUpdateIn % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {getConnectionIcon()}
        {getSyncStatusBadge()}
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing || !isOnline}
          className="h-8 w-8 p-0"
        >
          <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>
    );
  }

  return (
    <Card className={`border-0 shadow-none bg-muted/50 ${className}`}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getConnectionIcon()}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Weather Sync</span>
                {getSyncStatusBadge()}
              </div>
              
              {autoRefreshEnabled && isOnline && nextUpdateIn > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>Next update in {formatNextUpdate()}</span>
                </div>
              )}
              
              {failedAttempts > 0 && (
                <div className="flex items-center gap-1 text-xs text-red-500">
                  <AlertTriangle className="h-3 w-3" />
                  <span>{failedAttempts} failed attempt{failedAttempts > 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing || !isOnline}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Settings className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Real-time Sync Settings</h4>
                    <p className="text-xs text-muted-foreground">
                      Configure automatic weather data refresh
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-refresh" className="text-sm">
                      Auto-refresh
                    </Label>
                    <Switch
                      id="auto-refresh"
                      checked={autoRefreshEnabled}
                      onCheckedChange={onToggleAutoRefresh}
                    />
                  </div>

                  {autoRefreshEnabled && (
                    <div className="space-y-2">
                      <Label className="text-sm">
                        Refresh interval: {refreshInterval} minutes
                      </Label>
                      <Slider
                        value={[refreshInterval]}
                        onValueChange={(value) => onUpdateInterval(value[0])}
                        min={1}
                        max={60}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>1 min</span>
                        <span>60 min</span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 pt-2 border-t">
                    <div className="text-xs text-muted-foreground">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex items-center gap-1">
                          {getConnectionIcon()}
                          <span>Connection: {connectionQuality}</span>
                        </div>
                      </div>
                      
                      {lastUpdated && (
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
                        </div>
                      )}
                      
                      {failedAttempts > 0 && (
                        <div className="flex items-center gap-1 text-red-500">
                          <XCircle className="h-3 w-3" />
                          <span>Failed attempts: {failedAttempts}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}