import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MapPin, Search, Loader2 } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { config } from '@/lib/config';

interface LocationMapProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  currentLocation?: { lat: number; lng: number; address: string };
}

const MAPBOX_API_KEY = config.MAPBOX_API_KEY;

export const LocationMap: React.FC<LocationMapProps> = ({ 
  onLocationSelect, 
  currentLocation 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [marker, setMarker] = useState<mapboxgl.Marker | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Mapbox
  useEffect(() => {
    const initMap = async () => {
      try {
        if (!mapRef.current) return;

        // Set Mapbox access token
        mapboxgl.accessToken = MAPBOX_API_KEY;
        
        // Disable telemetry at map level
        if (!(window as { __mapboxTelemetryBlocked?: boolean }).__mapboxTelemetryBlocked) {
          console.log('🔒 Blocking Mapbox telemetry for LocationMap');
        }

        // Create map
        const mapboxMap = new mapboxgl.Map({
          container: mapRef.current,
          style: 'mapbox://styles/mapbox/satellite-v9',
          center: currentLocation 
            ? [currentLocation.lng, currentLocation.lat]
            : [77.1025, 28.7041], // Default to Delhi [lng, lat]
          zoom: 10
        });

        // Add navigation controls
        mapboxMap.addControl(new mapboxgl.NavigationControl(), 'top-right');

        // Create marker
        const mapboxMarker = new mapboxgl.Marker({
          draggable: true
        })
          .setLngLat(currentLocation 
            ? [currentLocation.lng, currentLocation.lat]
            : [77.1025, 28.7041])
          .addTo(mapboxMap);

        // Add click listener to map
        mapboxMap.on('click', async (event) => {
          const { lng, lat } = event.lngLat;
          
          mapboxMarker.setLngLat([lng, lat]);
          
          // Get address from coordinates using reverse geocoding
          try {
            const response = await fetch(
              `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_API_KEY}`
            );
            const data = await response.json();
            const address = data.features[0]?.place_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            onLocationSelect(lat, lng, address);
          } catch (error) {
            onLocationSelect(lat, lng, `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
          }
        });

        // Add drag listener to marker
        mapboxMarker.on('dragend', async () => {
          const lngLat = mapboxMarker.getLngLat();
          const { lng, lat } = lngLat;
          
          // Get address from coordinates
          try {
            const response = await fetch(
              `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_API_KEY}`
            );
            const data = await response.json();
            const address = data.features[0]?.place_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            onLocationSelect(lat, lng, address);
          } catch (error) {
            onLocationSelect(lat, lng, `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
          }
        });

        mapboxMap.on('load', () => {
          setIsLoading(false);
        });

        setMap(mapboxMap);
        setMarker(mapboxMarker);
      } catch (error) {
        console.error('Error loading Mapbox:', error);
        setIsLoading(false);
      }
    };

    initMap();
  }, [currentLocation, onLocationSelect]);

  // Search functionality
  const handleSearch = async () => {
    if (!searchValue.trim() || !map) return;

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchValue)}.json?access_token=${MAPBOX_API_KEY}`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        const address = data.features[0].place_name;

        map.setCenter([lng, lat]);
        map.setZoom(12);
        marker?.setLngLat([lng, lat]);
        
        onLocationSelect(lat, lng, address);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  };

  // Get current location with enhanced accuracy and error handling
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      console.log('📍 Requesting precise user location...');
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude: lat, longitude: lng, accuracy } = position.coords;
          console.log(`📍 User location obtained: ${lat}, ${lng} (accuracy: ${accuracy}m)`);

          if (map && marker) {
            // Smooth fly animation to user's location
            map.flyTo({
              center: [lng, lat],
              zoom: 15,
              essential: true,
              duration: 2000
            });

            // Update marker position
            marker.setLngLat([lng, lat]);

            // Get address using reverse geocoding with user's real coordinates
            try {
              const response = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_API_KEY}&types=address,poi,place,locality&limit=1`
              );
              const data = await response.json();
              const address = data.features?.[0]?.place_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
              console.log(`📍 Address resolved: ${address}`);
              onLocationSelect(lat, lng, address);
            } catch (error) {
              console.warn('⚠️ Reverse geocoding failed:', error);
              const fallbackAddress = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
              onLocationSelect(lat, lng, fallbackAddress);
            }
          }
        },
        (error) => {
          console.warn('⚠️ Geolocation failed:', error.message);
          console.log('💡 Please allow location access for accurate weather data');

          // Fallback to IP-based location or default
          console.log('📍 Using fallback location detection...');
          // Could implement IP geolocation here as additional fallback
        },
        {
          enableHighAccuracy: true, // Request GPS accuracy
          timeout: 15000, // 15 second timeout
          maximumAge: 600000 // Accept location up to 10 minutes old
        }
      );
    } else {
      console.warn('⚠️ Geolocation not supported by this browser');
      console.log('💡 Please use a modern browser with location services');
    }
  };

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Select Weather Location
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Controls */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              placeholder="Search for a location..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="pr-10"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          <Button onClick={handleSearch} variant="outline">
            Search
          </Button>
          <Button onClick={getCurrentLocation} variant="outline">
            <MapPin className="h-4 w-4" />
          </Button>
        </div>

        {/* Map Container */}
        <div className="relative h-96 rounded-lg overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 bg-muted/50 flex items-center justify-center z-10">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Loading map...</p>
              </div>
            </div>
          )}
          <div ref={mapRef} className="w-full h-full" />
        </div>

        {/* Instructions */}
        <div className="text-sm text-muted-foreground space-y-1">
          <p>• Click anywhere on the map to select a location</p>
          <p>• Drag the marker to fine-tune the position</p>
          <p>• Use search to find specific places</p>
          <p>• Click the location icon to use your current position</p>
        </div>
      </CardContent>
    </Card>
  );
};