import { useState, useEffect, useCallback, useRef } from 'react';
import { getWeatherData, getCurrentLocation, type WeatherData, type LocationData } from '@/services/weatherService';
import { useNotifications } from '@/contexts/NotificationContext';
import { weatherCache } from '@/utils/weatherCache';

export interface WeatherSyncStatus {
  isOnline: boolean;
  lastUpdated: Date | null;
  nextUpdateIn: number; // seconds
  isRefreshing: boolean;
  autoRefreshEnabled: boolean;
  failedAttempts: number;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'offline';
}

export interface RealtimeWeatherConfig {
  autoRefreshInterval: number; // minutes
  enableAutoRefresh: boolean;
  backgroundRefreshEnabled: boolean;
  retryAttempts: number;
  cacheTimeout: number; // minutes
}

const DEFAULT_CONFIG: RealtimeWeatherConfig = {
  autoRefreshInterval: 15, // 15 minutes
  enableAutoRefresh: true,
  backgroundRefreshEnabled: true,
  retryAttempts: 3,
  cacheTimeout: 30, // 30 minutes
};

export const useRealtimeWeather = (initialLocation?: LocationData, config: Partial<RealtimeWeatherConfig> = {}) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [location, setLocation] = useState<LocationData | null>(initialLocation || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<WeatherSyncStatus>({
    isOnline: navigator.onLine,
    lastUpdated: null,
    nextUpdateIn: 0,
    isRefreshing: false,
    autoRefreshEnabled: true,
    failedAttempts: 0,
    connectionQuality: 'excellent',
  });

  const configRef = useRef<RealtimeWeatherConfig>({ ...DEFAULT_CONFIG, ...config });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Add notifications hook
  const { addNotification } = useNotifications();

  // Update sync status countdown
  const updateCountdown = useCallback(() => {
    setSyncStatus(prev => ({
      ...prev,
      nextUpdateIn: Math.max(0, prev.nextUpdateIn - 1)
    }));
  }, []);

  // Start countdown timer
  const startCountdown = useCallback((seconds: number) => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }
    
    setSyncStatus(prev => ({ ...prev, nextUpdateIn: seconds }));
    countdownRef.current = setInterval(updateCountdown, 1000);
  }, [updateCountdown]);

  // Check connection quality based on response time
  const checkConnectionQuality = useCallback(async (): Promise<'excellent' | 'good' | 'poor' | 'offline'> => {
    if (!navigator.onLine) return 'offline';
    
    try {
      const startTime = Date.now();
      const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=0&longitude=0&current=temperature_2m', {
        method: 'HEAD',
        cache: 'no-cache',
      });
      const responseTime = Date.now() - startTime;
      
      if (!response.ok) return 'poor';
      
      if (responseTime < 500) return 'excellent';
      if (responseTime < 1500) return 'good';
      return 'poor';
    } catch {
      return 'offline';
    }
  }, []);

  // Fetch weather data with real-time sync tracking
  const fetchWeatherData = useCallback(async (targetLocation?: LocationData, forceRefresh = false) => {
    let locationToUse = targetLocation || location;
    
    // Get current location if none provided
    if (!locationToUse) {
      try {
        locationToUse = await getCurrentLocation();
        setLocation(locationToUse);
      } catch (error) {
        console.error('Failed to get location:', error);
        setError('Failed to get location. Please enable location services.');
        return;
      }
    }

    if (!locationToUse) {
      setError('Location is required for weather data');
      return;
    }

    setLoading(true);
    setSyncStatus(prev => ({ ...prev, isRefreshing: true }));
    setError(null);

    try {
      // Check connection quality
      const quality = await checkConnectionQuality();
      setSyncStatus(prev => ({ ...prev, connectionQuality: quality }));

      if (quality === 'offline') {
        throw new Error('No internet connection');
      }

      // Check cache first unless force refresh
      if (!forceRefresh) {
        const cachedData = weatherCache.get(locationToUse.latitude, locationToUse.longitude);
        if (cachedData) {
          setWeatherData(cachedData);
          setSyncStatus(prev => ({
            ...prev,
            lastUpdated: new Date(),
            failedAttempts: 0,
            isRefreshing: false,
          }));
          setLoading(false);
          
          // Start countdown for next refresh
          const nextRefreshSeconds = configRef.current.autoRefreshInterval * 60;
          startCountdown(nextRefreshSeconds);
          return;
        }
      }

      // Fetch fresh data
      const data = await getWeatherData(locationToUse.latitude, locationToUse.longitude);
      setWeatherData(data);
      
      // Update cache
      weatherCache.set(locationToUse.latitude, locationToUse.longitude, data);
      
      // Check for previous failures for reconnection notification
      const hadPreviousFailures = syncStatus.failedAttempts > 0;
      
      setSyncStatus(prev => ({
        ...prev,
        lastUpdated: new Date(),
        failedAttempts: 0,
        isRefreshing: false,
        isOnline: true,
      }));

      // Start countdown for next refresh
      const nextRefreshSeconds = configRef.current.autoRefreshInterval * 60;
      startCountdown(nextRefreshSeconds);

      // Send notifications
      if (hadPreviousFailures) {
        addNotification({
          type: 'weather',
          priority: 'low',
          title: 'Weather Sync Restored',
          message: 'Successfully reconnected and updated weather data',
          autoHide: true,
          hideAfter: 3000,
        });
      } else if (forceRefresh) {
        addNotification({
          type: 'weather',
          priority: 'low',
          title: 'Weather Updated',
          message: `Latest weather data synced for ${locationToUse.address || 'your location'}`,
          autoHide: true,
          hideAfter: 3000,
        });
      }

      // Check for weather alerts
      const currentTemp = data.current.temperature_2m;
      const precipitation = data.current.precipitation || 0;
      const windSpeed = data.current.wind_speed_10m;

      // High temperature alert
      if (currentTemp > 35) {
        addNotification({
          type: 'weather',
          priority: 'high',
          title: 'High Temperature Alert',
          message: `Extreme heat detected: ${Math.round(currentTemp)}°C. Take precautions for crops and livestock.`,
          actionUrl: '/weather',
          actionText: 'View Details',
        });
      }

      // Low temperature alert
      if (currentTemp < 5) {
        addNotification({
          type: 'weather',
          priority: 'high',
          title: 'Frost Risk Alert',
          message: `Low temperature warning: ${Math.round(currentTemp)}°C. Protect sensitive crops from frost damage.`,
          actionUrl: '/weather',
          actionText: 'View Details',
        });
      }

      // Heavy rain alert
      if (precipitation > 10) {
        addNotification({
          type: 'weather',
          priority: 'medium',
          title: 'Heavy Rainfall Alert',
          message: `Significant rainfall detected: ${precipitation.toFixed(1)}mm. Monitor field drainage and irrigation.`,
          actionUrl: '/weather',
          actionText: 'View Details',
        });
      }

      // High wind alert
      if (windSpeed > 20) {
        addNotification({
          type: 'weather',
          priority: 'medium',
          title: 'High Wind Warning',
          message: `Strong winds detected: ${Math.round(windSpeed)}km/h. Avoid spraying operations and secure equipment.`,
          actionUrl: '/weather',
          actionText: 'View Details',
        });
      }

    } catch (error) {
      console.error('Weather data fetch failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch weather data';
      setError(errorMessage);
      
      setSyncStatus(prev => ({
        ...prev,
        failedAttempts: prev.failedAttempts + 1,
        isRefreshing: false,
        isOnline: errorMessage !== 'No internet connection',
      }));

      // Send error notification
      if (syncStatus.failedAttempts === 0) { // Only on first failure
        addNotification({
          type: 'weather',
          priority: 'medium',
          title: 'Weather Sync Failed',
          message: `Unable to update weather data: ${errorMessage}`,
          actionUrl: '/weather',
          actionText: 'Retry',
        });
      }

      // Retry logic
      if (syncStatus.failedAttempts < configRef.current.retryAttempts) {
        const retryDelay = Math.min(1000 * Math.pow(2, syncStatus.failedAttempts), 30000); // Exponential backoff, max 30s
        retryTimeoutRef.current = setTimeout(() => {
          fetchWeatherData(locationToUse, forceRefresh);
        }, retryDelay);
      }
    } finally {
      setLoading(false);
    }
  }, [location, syncStatus.failedAttempts, startCountdown]);

  // Manual refresh function
  const refreshWeatherData = useCallback(() => {
    fetchWeatherData(undefined, true);
  }, [fetchWeatherData]);

  // Update location and fetch new data
  const updateLocation = useCallback(async (newLocation?: LocationData) => {
    if (newLocation) {
      setLocation(newLocation);
      await fetchWeatherData(newLocation, true);
    } else {
      // Get current location
      try {
        const currentLocation = await getCurrentLocation();
        setLocation(currentLocation);
        await fetchWeatherData(currentLocation, true);
      } catch (error) {
        setError('Failed to get current location');
      }
    }
  }, [fetchWeatherData]);

  // Toggle auto-refresh
  const toggleAutoRefresh = useCallback((enabled?: boolean) => {
    const newEnabled = enabled !== undefined ? enabled : !syncStatus.autoRefreshEnabled;
    
    setSyncStatus(prev => ({ ...prev, autoRefreshEnabled: newEnabled }));
    configRef.current.enableAutoRefresh = newEnabled;

    if (newEnabled && !intervalRef.current) {
      // Restart auto-refresh
      const intervalMs = configRef.current.autoRefreshInterval * 60 * 1000;
      intervalRef.current = setInterval(() => {
        if (configRef.current.enableAutoRefresh) {
          fetchWeatherData();
        }
      }, intervalMs);
    } else if (!newEnabled && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
    }
  }, [syncStatus.autoRefreshEnabled, fetchWeatherData]);

  // Update refresh interval
  const updateRefreshInterval = useCallback((minutes: number) => {
    configRef.current.autoRefreshInterval = Math.max(1, Math.min(60, minutes)); // 1-60 minutes
    
    // Restart interval if auto-refresh is enabled
    if (syncStatus.autoRefreshEnabled && intervalRef.current) {
      clearInterval(intervalRef.current);
      const intervalMs = configRef.current.autoRefreshInterval * 60 * 1000;
      intervalRef.current = setInterval(() => {
        if (configRef.current.enableAutoRefresh) {
          fetchWeatherData();
        }
      }, intervalMs);
      
      // Reset countdown
      const nextRefreshSeconds = configRef.current.autoRefreshInterval * 60;
      startCountdown(nextRefreshSeconds);
    }
  }, [syncStatus.autoRefreshEnabled, fetchWeatherData, startCountdown]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: true, failedAttempts: 0 }));
      // Refresh data when coming back online
      if (syncStatus.autoRefreshEnabled) {
        fetchWeatherData();
      }
    };

    const handleOffline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: false, connectionQuality: 'offline' }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncStatus.autoRefreshEnabled, fetchWeatherData]);

  // Setup auto-refresh on mount
  useEffect(() => {
    if (configRef.current.enableAutoRefresh) {
      toggleAutoRefresh(true);
    }

    // Initial data fetch
    fetchWeatherData();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  // Handle visibility change (pause when tab is not active)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Pause auto-refresh when tab is hidden
        if (intervalRef.current && !configRef.current.backgroundRefreshEnabled) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } else {
        // Resume auto-refresh when tab becomes visible
        if (syncStatus.autoRefreshEnabled && !intervalRef.current) {
          const intervalMs = configRef.current.autoRefreshInterval * 60 * 1000;
          intervalRef.current = setInterval(() => {
            if (configRef.current.enableAutoRefresh) {
              fetchWeatherData();
            }
          }, intervalMs);
        }
        
        // Refresh data if it's been a while
        const lastUpdate = syncStatus.lastUpdated;
        if (lastUpdate) {
          const timeSinceUpdate = Date.now() - lastUpdate.getTime();
          const staleThreshold = configRef.current.cacheTimeout * 60 * 1000;
          
          if (timeSinceUpdate > staleThreshold) {
            fetchWeatherData();
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [syncStatus.autoRefreshEnabled, syncStatus.lastUpdated, fetchWeatherData]);

  return {
    weatherData,
    location,
    loading,
    error,
    syncStatus,
    config: configRef.current,
    
    // Actions
    refreshWeatherData,
    updateLocation,
    toggleAutoRefresh,
    updateRefreshInterval,
    
    // Cache utilities
    clearCache: () => weatherCache.clear(),
    getCacheStats: () => weatherCache.getStats(),
  };
};