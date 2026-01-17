// Location Service for geolocation and mandi proximity
export interface UserLocation {
  lat: number;
  lng: number;
  accuracy?: number;
  city?: string;
  state?: string;
  country?: string;
}

export interface LocationError {
  code: number;
  message: string;
}

// Default location (Chennai) for fallback
export const DEFAULT_LOCATION: UserLocation = {
  lat: 13.0827, // Chennai center
  lng: 80.2707,
  city: 'Chennai',
  state: 'Tamil Nadu',
  country: 'India'
};

// Get user's current location using Geolocation API
export const getCurrentLocation = (): Promise<UserLocation> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({
        code: 0,
        message: 'Geolocation is not supported by this browser.'
      } as LocationError);
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000 // Cache for 1 minute
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        
        try {
          // Try to get city/state from reverse geocoding
          const locationDetails = await reverseGeocode(latitude, longitude);
          
          resolve({
            lat: latitude,
            lng: longitude,
            accuracy,
            ...locationDetails
          });
        } catch (error) {
          // Resolve with just coordinates if reverse geocoding fails
          resolve({
            lat: latitude,
            lng: longitude,
            accuracy
          });
        }
      },
      (error) => {
        const locationError: LocationError = {
          code: error.code,
          message: getLocationErrorMessage(error.code)
        };
        reject(locationError);
      },
      options
    );
  });
};

// Get location error message based on error code
const getLocationErrorMessage = (code: number): string => {
  switch (code) {
    case 1:
      return 'Location access denied by user.';
    case 2:
      return 'Location information is unavailable.';
    case 3:
      return 'Location request timed out.';
    default:
      return 'An unknown error occurred.';
  }
};

// Reverse geocode coordinates to get city/state (using a free service)
export const reverseGeocode = async (lat: number, lng: number): Promise<{
  city?: string;
  state?: string;
  country?: string;
}> => {
  try {
    // Using OpenStreetMap Nominatim API (free)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'AgriSmart-App/1.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Reverse geocoding failed');
    }

    const data = await response.json();
    const address = data.address || {};

    return {
      city: address.city || address.town || address.village || address.suburb,
      state: address.state,
      country: address.country
    };
  } catch (error) {
    console.warn('Reverse geocoding failed:', error);
    return {};
  }
};

// Get location with fallback to default
export const getLocationWithFallback = async (): Promise<{
  location: UserLocation;
  isUserLocation: boolean;
  error?: LocationError;
}> => {
  try {
    const userLocation = await getCurrentLocation();
    return {
      location: userLocation,
      isUserLocation: true
    };
  } catch (error) {
    console.warn('Failed to get user location, using default:', error);
    return {
      location: DEFAULT_LOCATION,
      isUserLocation: false,
      error: error as LocationError
    };
  }
};

// Check if location permission is granted
export const checkLocationPermission = async (): Promise<'granted' | 'denied' | 'prompt' | 'unsupported'> => {
  if (!navigator.permissions) {
    return 'unsupported';
  }

  try {
    const permission = await navigator.permissions.query({ name: 'geolocation' });
    return permission.state;
  } catch (error) {
    return 'unsupported';
  }
};

// Request location permission
export const requestLocationPermission = async (): Promise<boolean> => {
  try {
    await getCurrentLocation();
    return true;
  } catch (error) {
    return false;
  }
};

// Save location to localStorage for future use
export const saveLocationToStorage = (location: UserLocation): void => {
  try {
    localStorage.setItem('agrismart_user_location', JSON.stringify({
      ...location,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.warn('Failed to save location to storage:', error);
  }
};

// Get saved location from localStorage
export const getSavedLocation = (): UserLocation | null => {
  try {
    const saved = localStorage.getItem('agrismart_user_location');
    if (!saved) return null;

    const data = JSON.parse(saved);
    const isStale = Date.now() - data.timestamp > 24 * 60 * 60 * 1000; // 24 hours

    if (isStale) {
      localStorage.removeItem('agrismart_user_location');
      return null;
    }

    return {
      lat: data.lat,
      lng: data.lng,
      accuracy: data.accuracy,
      city: data.city,
      state: data.state,
      country: data.country
    };
  } catch (error) {
    console.warn('Failed to get saved location:', error);
    return null;
  }
};

// Get location preference order: saved -> user -> default
export const getPreferredLocation = async (): Promise<{
  location: UserLocation;
  source: 'saved' | 'user' | 'default';
  error?: LocationError;
}> => {
  // First try saved location
  const savedLocation = getSavedLocation();
  if (savedLocation) {
    return {
      location: savedLocation,
      source: 'saved'
    };
  }

  // Then try user location
  try {
    const userLocation = await getCurrentLocation();
    saveLocationToStorage(userLocation);
    return {
      location: userLocation,
      source: 'user'
    };
  } catch (error) {
    // Finally fallback to default
    return {
      location: DEFAULT_LOCATION,
      source: 'default',
      error: error as LocationError
    };
  }
};

// Get state from location
export const getStateFromLocation = (location: UserLocation): string => {
  if (location.state) {
    return location.state;
  }

  // Fallback: determine state from coordinates (basic mapping)
  const { lat, lng } = location;

  // Punjab region
  if (lat >= 29.5 && lat <= 32.5 && lng >= 73.5 && lng <= 77.0) {
    return 'Punjab';
  }
  
  // Haryana region
  if (lat >= 27.5 && lat <= 30.5 && lng >= 74.5 && lng <= 77.5) {
    return 'Haryana';
  }
  
  // Maharashtra region
  if (lat >= 15.5 && lat <= 22.0 && lng >= 72.0 && lng <= 80.5) {
    return 'Maharashtra';
  }
  
  // Gujarat region
  if (lat >= 20.0 && lat <= 24.5 && lng >= 68.0 && lng <= 74.5) {
    return 'Gujarat';
  }
  
  // Rajasthan region
  if (lat >= 23.0 && lat <= 30.0 && lng >= 69.0 && lng <= 78.0) {
    return 'Rajasthan';
  }
  
  // Uttar Pradesh region
  if (lat >= 23.5 && lat <= 30.5 && lng >= 77.0 && lng <= 84.5) {
    return 'Uttar Pradesh';
  }
  
  // Madhya Pradesh region
  if (lat >= 21.0 && lat <= 26.5 && lng >= 74.0 && lng <= 82.5) {
    return 'Madhya Pradesh';
  }
  
  // Karnataka region
  if (lat >= 11.5 && lat <= 18.5 && lng >= 74.0 && lng <= 78.5) {
    return 'Karnataka';
  }
  
  // Tamil Nadu region
  if (lat >= 8.0 && lat <= 13.5 && lng >= 76.0 && lng <= 80.5) {
    return 'Tamil Nadu';
  }
  
  // West Bengal region
  if (lat >= 21.5 && lat <= 27.5 && lng >= 85.5 && lng <= 89.5) {
    return 'West Bengal';
  }
  
  // Default to Tamil Nadu if can't determine
  return 'Tamil Nadu';
};

// Location hooks for React components
export const useLocationService = () => {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<LocationError | null>(null);
  const [source, setSource] = useState<'saved' | 'user' | 'default' | null>(null);

  const getCurrentUserLocation = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getPreferredLocation();
      setLocation(result.location);
      setSource(result.source);
      
      if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError(err as LocationError);
      setLocation(DEFAULT_LOCATION);
      setSource('default');
    } finally {
      setIsLoading(false);
    }
  };

  const requestLocation = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const userLocation = await getCurrentLocation();
      setLocation(userLocation);
      setSource('user');
      saveLocationToStorage(userLocation);
    } catch (err) {
      setError(err as LocationError);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    location,
    isLoading,
    error,
    source,
    getCurrentUserLocation,
    requestLocation,
    isUserLocation: source === 'user' || source === 'saved'
  };
};

import { useState } from 'react';