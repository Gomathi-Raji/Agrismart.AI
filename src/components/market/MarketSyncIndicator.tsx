import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  Signal, 
  Clock, 
  Settings,
  CheckCircle,
  AlertTriangle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Database,
  Bell
} from 'lucide-react';
import { MarketSyncStatus, PriceChange } from '@/hooks/useRealtimeMarketData';

interface MarketSyncIndicatorProps {
  syncStatus: MarketSyncStatus;
  onRefresh: () => void;
  onToggleAutoRefresh: (enabled: boolean) => void;
  onUpdateInterval: (minutes: number) => void;
  refreshInterval: number;
  className?: string;
  compact?: boolean;
}

export function MarketSyncIndicator({
  syncStatus,
  onRefresh,
  onToggleAutoRefresh,
  onUpdateInterval,
  refreshInterval,
  className = '',
  compact = false
}: MarketSyncIndicatorProps) {
  const {
    isOnline,
    lastUpdated,
    nextUpdateIn,
    isRefreshing,
    autoRefreshEnabled,
    failedAttempts,
    connectionQuality,
    totalRecords,
    priceChanges
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
      } else if (timeSinceUpdate < 10) {
        return <Badge variant="default" className="text-xs bg-green-500">{timeSinceUpdate}m ago</Badge>;
      } else if (timeSinceUpdate < 60) {
        return <Badge variant="secondary" className="text-xs">{timeSinceUpdate}m ago</Badge>;
      } else {
        const hours = Math.floor(timeSinceUpdate / 60);
        return <Badge variant="outline" className="text-xs">{hours}h ago</Badge>;
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

  const recentPriceChanges = priceChanges.slice(0, 5);

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {getConnectionIcon()}
        {getSyncStatusBadge()}
        <Badge variant="outline" className="text-xs">
          <Database className="h-3 w-3 mr-1" />
          {totalRecords.toLocaleString()}
        </Badge>
        {priceChanges.length > 0 && (
          <Badge variant="outline" className="text-xs text-orange-600">
            <Bell className="h-3 w-3 mr-1" />
            {priceChanges.length}
          </Badge>
        )}
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
                <span className="text-sm font-medium">Market Data Sync</span>
                {getSyncStatusBadge()}
              </div>
              
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Database className="h-3 w-3" />
                  <span>{totalRecords.toLocaleString()} records</span>
                </div>
                
                {priceChanges.length > 0 && (
                  <div className="flex items-center gap-1 text-orange-600">
                    <Bell className="h-3 w-3" />
                    <span>{priceChanges.length} price changes</span>
                  </div>
                )}
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
              <PopoverContent className="w-96" align="end">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Real-time Market Sync</h4>
                    <p className="text-xs text-muted-foreground">
                      Configure automatic market data refresh and price alerts
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="market-auto-refresh" className="text-sm">
                      Auto-refresh
                    </Label>
                    <Switch
                      id="market-auto-refresh"
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
                        min={5}
                        max={120}
                        step={5}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>5 min</span>
                        <span>120 min</span>
                      </div>
                    </div>
                  )}

                  {recentPriceChanges.length > 0 && (
                    <div className="space-y-2 pt-2 border-t">
                      <Label className="text-sm flex items-center gap-1">
                        <Bell className="h-3 w-3" />
                        Recent Price Changes
                      </Label>
                      <ScrollArea className="h-32">
                        <div className="space-y-1">
                          {recentPriceChanges.map((change, index) => (
                            <div key={index} className="text-xs p-2 rounded bg-muted/50">
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{change.commodity}</span>
                                <div className="flex items-center gap-1">
                                  {change.change > 0 ? (
                                    <TrendingUp className="h-3 w-3 text-green-500" />
                                  ) : (
                                    <TrendingDown className="h-3 w-3 text-red-500" />
                                  )}
                                  <span className={change.change > 0 ? 'text-green-600' : 'text-red-600'}>
                                    {change.changePercent > 0 ? '+' : ''}{change.changePercent.toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                              <div className="text-muted-foreground truncate">
                                {change.market}
                              </div>
                              <div className="text-muted-foreground">
                                ₹{change.oldPrice.toFixed(2)} → ₹{change.newPrice.toFixed(2)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
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