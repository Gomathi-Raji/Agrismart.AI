// Extend window type for telemetry blocking
declare global {
  interface Window {
    XMLHttpRequest: typeof XMLHttpRequest;
  }
}

// Environment configuration validation
export const config = {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  MAPBOX_API_KEY: import.meta.env.VITE_MAPBOX_API_KEY || 'pk.eyJ1IjoiaGFyaXNod2FyYW4iLCJhIjoiY21hZHhwZGs2MDF4YzJxczh2aDd0cWg1MyJ9.qcu0lpqVlZlC2WFxhwb1Pg',
};

// Disable Mapbox telemetry globally  
if (typeof window !== 'undefined') {
  // Override fetch for Mapbox events
  const originalFetch = window.fetch;
  window.fetch = function(input, init) {
    let url: string;
    
    if (typeof input === 'string') {
      url = input;
    } else if (input instanceof Request) {
      url = input.url;
    } else if (input instanceof URL) {
      url = input.href;
    } else {
      url = '';
    }
    
    // Block all Mapbox telemetry calls
    if (url.includes('events.mapbox.com')) {
      console.log('🔒 Blocked Mapbox telemetry request:', url);
      return Promise.resolve(new Response(null, { 
        status: 204, 
        statusText: 'No Content - Blocked by AgriSmart' 
      }));
    }
    
    return originalFetch.call(this, input, init);
  };

// Set global flag to prevent reinitializing
(window as { __mapboxTelemetryBlocked?: boolean }).__mapboxTelemetryBlocked = true;
}

// Geolocation utility functions
export const requestLocationPermission = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.warn('⚠️ Geolocation not supported');
      resolve(false);
      return;
    }

    navigator.permissions.query({ name: 'geolocation' }).then((result) => {
      if (result.state === 'granted') {
        console.log('📍 Location permission already granted');
        resolve(true);
      } else if (result.state === 'prompt') {
        console.log('📍 Requesting location permission...');
        // Try to get position to trigger permission prompt
        navigator.geolocation.getCurrentPosition(
          () => resolve(true),
          () => resolve(false),
          { timeout: 10000 }
        );
      } else {
        console.warn('⚠️ Location permission denied');
        resolve(false);
      }
    }).catch(() => {
      // Fallback for browsers that don't support permissions API
      navigator.geolocation.getCurrentPosition(
        () => resolve(true),
        () => resolve(false),
        { timeout: 5000 }
      );
    });
  });
};

export const getAccurateLocation = (
  onSuccess: (position: GeolocationPosition) => void,
  onError?: (error: GeolocationPositionError) => void,
  options?: PositionOptions
): void => {
  const defaultOptions: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 300000 // 5 minutes
  };

  const finalOptions = { ...defaultOptions, ...options };

  navigator.geolocation.getCurrentPosition(
    (position) => {
      console.log(`📍 Accurate location obtained: ${position.coords.latitude}, ${position.coords.longitude} (±${position.coords.accuracy}m)`);
      onSuccess(position);
    },
    (error) => {
      console.warn('⚠️ Location request failed:', error.message);
      if (onError) onError(error);
    },
    finalOptions
  );
};


// Validate required environment variables
export function validateConfig() {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if we're in a secure context for Clerk
  if (typeof window !== 'undefined') {
    if (!window.location.protocol.startsWith('https') && config.isProduction) {
      warnings.push("Clerk requires HTTPS in production");
    }
  }

  if (errors.length > 0) {
    console.error("Configuration errors:", errors);
  }
  
  if (warnings.length > 0) {
    console.warn("Configuration warnings:", warnings);
  }

  return errors.length === 0;
}

// Helper function to check if Clerk is likely blocked
export function isClerkBlocked(): boolean {
  try {
    // Check if common ad blocker patterns might be blocking Clerk
    const userAgent = navigator.userAgent.toLowerCase();
    const hasAdBlocker = (
      window.getComputedStyle ||
      !window.fetch ||
      typeof window.fetch !== 'function'
    );
    
    return false; // For now, just return false - we'll handle errors at runtime
  } catch {
    return true;
  }
}

export default config;