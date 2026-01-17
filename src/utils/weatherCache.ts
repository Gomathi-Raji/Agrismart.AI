/**
 * Weather API Cache System
 * Optimizes API calls by caching weather data based on location and time
 */

import { WeatherData } from '../services/weatherService';

interface CacheEntry {
  data: WeatherData;
  timestamp: number;
  location: {
    lat: number;
    lng: number;
  };
}

interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxEntries: number; // Maximum number of cache entries
  locationThreshold: number; // Distance threshold in km for cache hits
}

class WeatherCache {
  private cache: Map<string, CacheEntry> = new Map();
  private config: CacheConfig;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      ttl: 15 * 60 * 1000, // 15 minutes default
      maxEntries: 50, // 50 locations max
      locationThreshold: 1, // 1km threshold
      ...config
    };
  }

  /**
   * Generate cache key based on rounded coordinates
   */
  private generateKey(lat: number, lng: number): string {
    // Round to 2 decimal places (~1km precision)
    const roundedLat = Math.round(lat * 100) / 100;
    const roundedLng = Math.round(lng * 100) / 100;
    return `${roundedLat},${roundedLng}`;
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Check if cache entry is still valid
   */
  private isEntryValid(entry: CacheEntry): boolean {
    const now = Date.now();
    return (now - entry.timestamp) < this.config.ttl;
  }

  /**
   * Clean expired entries from cache
   */
  private cleanExpiredEntries(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if ((now - entry.timestamp) >= this.config.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Enforce maximum cache size by removing oldest entries
   */
  private enforceMaxSize(): void {
    if (this.cache.size > this.config.maxEntries) {
      // Convert to array and sort by timestamp
      const entries = Array.from(this.cache.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp);
      
      // Remove oldest entries
      const toRemove = this.cache.size - this.config.maxEntries;
      for (let i = 0; i < toRemove; i++) {
        this.cache.delete(entries[i][0]);
      }
    }
  }

  /**
   * Get weather data from cache if available and valid
   */
  get(lat: number, lng: number): WeatherData | null {
    this.cleanExpiredEntries();

    // Try exact key match first
    const exactKey = this.generateKey(lat, lng);
    const exactEntry = this.cache.get(exactKey);
    
    if (exactEntry && this.isEntryValid(exactEntry)) {
      console.log('Weather cache hit (exact):', exactKey);
      return exactEntry.data;
    }

    // Try nearby locations within threshold
    for (const [key, entry] of this.cache.entries()) {
      if (this.isEntryValid(entry)) {
        const distance = this.calculateDistance(lat, lng, entry.location.lat, entry.location.lng);
        if (distance <= this.config.locationThreshold) {
          console.log('Weather cache hit (nearby):', key, `distance: ${distance.toFixed(2)}km`);
          return entry.data;
        }
      }
    }

    console.log('Weather cache miss:', exactKey);
    return null;
  }

  /**
   * Store weather data in cache
   */
  set(lat: number, lng: number, data: WeatherData): void {
    const key = this.generateKey(lat, lng);
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      location: { lat, lng }
    };

    this.cache.set(key, entry);
    this.enforceMaxSize();
    
    console.log('Weather data cached:', key, `entries: ${this.cache.size}/${this.config.maxEntries}`);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    console.log('Weather cache cleared');
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    maxEntries: number;
    ttl: number;
    locationThreshold: number;
  } {
    this.cleanExpiredEntries();
    return {
      size: this.cache.size,
      maxEntries: this.config.maxEntries,
      ttl: this.config.ttl,
      locationThreshold: this.config.locationThreshold
    };
  }

  /**
   * Update cache configuration
   */
  updateConfig(newConfig: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Create singleton instance
export const weatherCache = new WeatherCache({
  ttl: 15 * 60 * 1000, // 15 minutes for weather data
  maxEntries: 100, // Support more locations for farming app
  locationThreshold: 2 // 2km threshold for rural areas
});

// Export class for testing
export { WeatherCache };
export type { CacheEntry, CacheConfig };