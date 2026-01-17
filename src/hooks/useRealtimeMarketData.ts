import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchMandiPrices, type MandiPrice, type FilterOptions } from '@/services/mandiService';
import { getPreferredLocation } from '@/services/locationService';

export interface MarketSyncStatus {
  isOnline: boolean;
  lastUpdated: Date | null;
  nextUpdateIn: number; // seconds
  isRefreshing: boolean;
  autoRefreshEnabled: boolean;
  failedAttempts: number;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'offline';
  totalRecords: number;
  priceChanges: PriceChange[];
}

export interface PriceChange {
  commodity: string;
  market: string;
  oldPrice: number;
  newPrice: number;
  change: number;
  changePercent: number;
  timestamp: Date;
}

export interface RealtimeMarketConfig {
  autoRefreshInterval: number; // minutes
  enableAutoRefresh: boolean;
  backgroundRefreshEnabled: boolean;
  retryAttempts: number;
  priceChangeThreshold: number; // percentage
  enablePriceAlerts: boolean;
}

const DEFAULT_CONFIG: RealtimeMarketConfig = {
  autoRefreshInterval: 30, // 30 minutes (market data updates less frequently)
  enableAutoRefresh: true,
  backgroundRefreshEnabled: true,
  retryAttempts: 3,
  priceChangeThreshold: 5, // 5% change triggers alert
  enablePriceAlerts: true,
};

export const useRealtimeMarketData = (
  initialFilters: FilterOptions = {},
  config: Partial<RealtimeMarketConfig> = {}
) => {
  const [data, setData] = useState<MandiPrice[]>([]);
  const [filteredData, setFilteredData] = useState<MandiPrice[]>([]);
  const [filters, setFilters] = useState<FilterOptions>(initialFilters);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  const [syncStatus, setSyncStatus] = useState<MarketSyncStatus>({
    isOnline: navigator.onLine,
    lastUpdated: null,
    nextUpdateIn: 0,
    isRefreshing: false,
    autoRefreshEnabled: true,
    failedAttempts: 0,
    connectionQuality: 'excellent',
    totalRecords: 0,
    priceChanges: [],
  });

  const configRef = useRef<RealtimeMarketConfig>({ ...DEFAULT_CONFIG, ...config });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousDataRef = useRef<MandiPrice[]>([]);

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

  // Check connection quality
  const checkConnectionQuality = useCallback(async (): Promise<'excellent' | 'good' | 'poor' | 'offline'> => {
    if (!navigator.onLine) return 'offline';
    
    try {
      const startTime = Date.now();
      // Use a simple HEAD request to test connectivity to the API
      const response = await fetch('https://api.data.gov.in', {
        method: 'HEAD',
        cache: 'no-cache',
      });
      const responseTime = Date.now() - startTime;
      
      if (!response.ok) return 'poor';
      
      if (responseTime < 1000) return 'excellent';
      if (responseTime < 3000) return 'good';
      return 'poor';
    } catch {
      return 'offline';
    }
  }, []);

  // Detect price changes
  const detectPriceChanges = useCallback((newData: MandiPrice[], oldData: MandiPrice[]): PriceChange[] => {
    const changes: PriceChange[] = [];
    
    newData.forEach(newItem => {
      const oldItem = oldData.find(old => 
        old.commodity === newItem.commodity && 
        old.market === newItem.market &&
        old.arrival_date === newItem.arrival_date
      );
      
      if (oldItem && oldItem.modal_price_per_kg !== newItem.modal_price_per_kg) {
        const change = newItem.modal_price_per_kg - oldItem.modal_price_per_kg;
        const changePercent = (change / oldItem.modal_price_per_kg) * 100;
        
        // Only track significant changes
        if (Math.abs(changePercent) >= configRef.current.priceChangeThreshold) {
          changes.push({
            commodity: newItem.commodity,
            market: newItem.market,
            oldPrice: oldItem.modal_price_per_kg,
            newPrice: newItem.modal_price_per_kg,
            change,
            changePercent,
            timestamp: new Date(),
          });
        }
      }
    });
    
    return changes;
  }, []);

  // Apply filters to data
  const applyFilters = useCallback((rawData: MandiPrice[], currentFilters: FilterOptions) => {
    let filtered = [...rawData];

    // Search filter
    if (currentFilters.search) {
      const searchTerm = currentFilters.search.toLowerCase();
      filtered = filtered.filter(item =>
        item.commodity.toLowerCase().includes(searchTerm) ||
        item.market.toLowerCase().includes(searchTerm) ||
        item.state?.toLowerCase().includes(searchTerm) ||
        item.district?.toLowerCase().includes(searchTerm)
      );
    }

    // Commodity filter
    if (currentFilters.commodity) {
      filtered = filtered.filter(item => item.commodity === currentFilters.commodity);
    }

    // State filter
    if (currentFilters.state) {
      filtered = filtered.filter(item => item.state === currentFilters.state);
    }

    // District filter
    if (currentFilters.district) {
      filtered = filtered.filter(item => item.district === currentFilters.district);
    }

    // Market filter
    if (currentFilters.market) {
      filtered = filtered.filter(item => item.market === currentFilters.market);
    }

    // Price range filter
    if (currentFilters.priceMin !== undefined) {
      filtered = filtered.filter(item => item.modal_price_per_kg >= currentFilters.priceMin!);
    }
    if (currentFilters.priceMax !== undefined) {
      filtered = filtered.filter(item => item.modal_price_per_kg <= currentFilters.priceMax!);
    }

    // Date range filter
    if (currentFilters.dateFrom) {
      const fromDate = currentFilters.dateFrom.toISOString().split('T')[0];
      filtered = filtered.filter(item => item.arrival_date >= fromDate);
    }
    if (currentFilters.dateTo) {
      const toDate = currentFilters.dateTo.toISOString().split('T')[0];
      filtered = filtered.filter(item => item.arrival_date <= toDate);
    }

    // Sort data
    if (currentFilters.sortBy) {
      filtered.sort((a, b) => {
        switch (currentFilters.sortBy) {
          case 'price_asc':
            return a.modal_price_per_kg - b.modal_price_per_kg;
          case 'price_desc':
            return b.modal_price_per_kg - a.modal_price_per_kg;
          case 'commodity':
            return a.commodity.localeCompare(b.commodity);
          case 'market':
            return a.market.localeCompare(b.market);
          case 'date':
            return new Date(b.arrival_date || 0).getTime() - new Date(a.arrival_date || 0).getTime();
          default:
            return 0;
        }
      });
    }

    return filtered;
  }, []);

  // Fetch market data with real-time sync tracking
  const fetchMarketData = useCallback(async (currentFilters?: FilterOptions, forceRefresh = false) => {
    const filtersToUse = currentFilters || filters;
    
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

      // Get user location if needed
      if (!userLocation && !filtersToUse.state) {
        try {
          const { location } = await getPreferredLocation();
          setUserLocation({ lat: location.lat, lng: location.lng });
          filtersToUse.userLocation = { lat: location.lat, lng: location.lng };
        } catch (error) {
          console.warn('Could not get user location:', error);
        }
      }

      // Fetch data with location context
      const result = await fetchMandiPrices({
        ...filtersToUse,
        userLocation: userLocation || filtersToUse.userLocation,
        prioritizeChennai: true, // Enable Chennai prioritization
      });

      // Detect price changes
      const priceChanges = detectPriceChanges(result.data, previousDataRef.current);
      
      // Update data
      setData(result.data);
      setTotal(result.total);
      previousDataRef.current = result.data;
      
      // Apply filters
      const filtered = applyFilters(result.data, filtersToUse);
      setFilteredData(filtered);
      
      setSyncStatus(prev => ({
        ...prev,
        lastUpdated: new Date(),
        failedAttempts: 0,
        isRefreshing: false,
        isOnline: true,
        totalRecords: result.total,
        priceChanges: [...priceChanges, ...prev.priceChanges.slice(0, 9)], // Keep last 10 changes
      }));

      // Start countdown for next refresh
      const nextRefreshSeconds = configRef.current.autoRefreshInterval * 60;
      startCountdown(nextRefreshSeconds);

      // Show price change notifications
      if (configRef.current.enablePriceAlerts && priceChanges.length > 0) {
        priceChanges.forEach(change => {
          console.log(`Price Alert: ${change.commodity} at ${change.market} ${change.change > 0 ? 'increased' : 'decreased'} by ${Math.abs(change.changePercent).toFixed(1)}%`);
        });
      }

    } catch (error) {
      console.error('Market data fetch failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch market data';
      setError(errorMessage);
      
      setSyncStatus(prev => ({
        ...prev,
        failedAttempts: prev.failedAttempts + 1,
        isRefreshing: false,
        isOnline: errorMessage !== 'No internet connection',
      }));

      // Retry logic
      if (syncStatus.failedAttempts < configRef.current.retryAttempts) {
        const retryDelay = Math.min(5000 * Math.pow(2, syncStatus.failedAttempts), 60000); // Exponential backoff, max 1 minute
        retryTimeoutRef.current = setTimeout(() => {
          fetchMarketData(filtersToUse, forceRefresh);
        }, retryDelay);
      }
    } finally {
      setLoading(false);
    }
  }, [filters, userLocation, syncStatus.failedAttempts, startCountdown, checkConnectionQuality, detectPriceChanges, applyFilters]);

  // Update filters and re-fetch data
  const updateFilters = useCallback((newFilters: Partial<FilterOptions>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    
    // Re-apply filters to existing data immediately for better UX
    const filtered = applyFilters(data, updatedFilters);
    setFilteredData(filtered);
    
    // Fetch new data if filters changed significantly
    const significantFilterChange = Boolean(
      newFilters.commodity || 
      newFilters.state || 
      newFilters.district || 
      newFilters.market ||
      newFilters.dateFrom ||
      newFilters.dateTo
    );
    
    if (significantFilterChange) {
      fetchMarketData(updatedFilters);
    }
  }, [filters, data, applyFilters, fetchMarketData]);

  // Manual refresh function
  const refreshMarketData = useCallback(() => {
    fetchMarketData(undefined, true);
  }, [fetchMarketData]);

  // Toggle auto-refresh
  const toggleAutoRefresh = useCallback((enabled?: boolean) => {
    const newEnabled = enabled !== undefined ? enabled : !syncStatus.autoRefreshEnabled;
    
    setSyncStatus(prev => ({ ...prev, autoRefreshEnabled: newEnabled }));
    configRef.current.enableAutoRefresh = newEnabled;

    if (newEnabled && !intervalRef.current) {
      const intervalMs = configRef.current.autoRefreshInterval * 60 * 1000;
      intervalRef.current = setInterval(() => {
        if (configRef.current.enableAutoRefresh) {
          fetchMarketData();
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
  }, [syncStatus.autoRefreshEnabled, fetchMarketData]);

  // Update refresh interval
  const updateRefreshInterval = useCallback((minutes: number) => {
    configRef.current.autoRefreshInterval = Math.max(5, Math.min(120, minutes)); // 5-120 minutes
    
    if (syncStatus.autoRefreshEnabled && intervalRef.current) {
      clearInterval(intervalRef.current);
      const intervalMs = configRef.current.autoRefreshInterval * 60 * 1000;
      intervalRef.current = setInterval(() => {
        if (configRef.current.enableAutoRefresh) {
          fetchMarketData();
        }
      }, intervalMs);
      
      const nextRefreshSeconds = configRef.current.autoRefreshInterval * 60;
      startCountdown(nextRefreshSeconds);
    }
  }, [syncStatus.autoRefreshEnabled, fetchMarketData, startCountdown]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: true, failedAttempts: 0 }));
      if (syncStatus.autoRefreshEnabled) {
        fetchMarketData();
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
  }, [syncStatus.autoRefreshEnabled, fetchMarketData]);

  // Initial data fetch and auto-refresh setup
  useEffect(() => {
    if (configRef.current.enableAutoRefresh) {
      toggleAutoRefresh(true);
    }

    fetchMarketData();

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

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (intervalRef.current && !configRef.current.backgroundRefreshEnabled) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } else {
        if (syncStatus.autoRefreshEnabled && !intervalRef.current) {
          const intervalMs = configRef.current.autoRefreshInterval * 60 * 1000;
          intervalRef.current = setInterval(() => {
            if (configRef.current.enableAutoRefresh) {
              fetchMarketData();
            }
          }, intervalMs);
        }
        
        const lastUpdate = syncStatus.lastUpdated;
        if (lastUpdate) {
          const timeSinceUpdate = Date.now() - lastUpdate.getTime();
          const staleThreshold = configRef.current.autoRefreshInterval * 60 * 1000;
          
          if (timeSinceUpdate > staleThreshold) {
            fetchMarketData();
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [syncStatus.autoRefreshEnabled, syncStatus.lastUpdated, fetchMarketData]);

  return {
    data,
    filteredData,
    filters,
    loading,
    error,
    total,
    userLocation,
    syncStatus,
    config: configRef.current,
    
    // Actions
    updateFilters,
    refreshMarketData,
    toggleAutoRefresh,
    updateRefreshInterval,
    
    // Utilities
    fetchData: fetchMarketData,
  };
};