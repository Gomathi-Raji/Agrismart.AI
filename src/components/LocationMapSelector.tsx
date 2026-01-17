import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MapPin, Search, Loader2, X } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { config } from '@/lib/config';

interface LocationMapSelectorProps {
  onLocationSelect: (location: string) => void;
  currentLocation?: string;
  isVisible: boolean;
  onClose: () => void;
}

const MAPBOX_API_KEY = config.MAPBOX_API_KEY;

export const LocationMapSelector: React.FC<LocationMapSelectorProps> = ({ 
  onLocationSelect, 
  currentLocation,
  isVisible,
  onClose
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [marker, setMarker] = useState<mapboxgl.Marker | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState(currentLocation || '');

  // Initialize Mapbox
  useEffect(() => {
    if (!isVisible) return;

    const initMap = async () => {
      try {
        if (!mapRef.current) return;

        // Set Mapbox access token
        mapboxgl.accessToken = MAPBOX_API_KEY;
        
        // Disable telemetry at map level
        if (!(window as { __mapboxTelemetryBlocked?: boolean }).__mapboxTelemetryBlocked) {
          console.log('🔒 Blocking Mapbox telemetry for LocationMapSelector');
        }

        // Parse current location if it exists
        let initialLng = 77.1025; // Default to Delhi
        let initialLat = 28.7041;
        let initialAddress = 'Delhi, India';

        if (currentLocation && currentLocation.includes(',')) {
          const coords = currentLocation.split(',').map(c => parseFloat(c.trim()));
          if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
            initialLat = coords[0];
            initialLng = coords[1];
            // Try to resolve coordinates to address
            try {
              const geoResponse = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${initialLng},${initialLat}.json?access_token=${MAPBOX_API_KEY}&types=address,poi,place,locality,neighborhood&limit=1`
              );
              const geoData = await geoResponse.json();
              if (geoData.features && geoData.features.length > 0) {
                initialAddress = geoData.features[0].place_name;
              } else {
                initialAddress = `${initialLat.toFixed(4)}, ${initialLng.toFixed(4)}`;
              }
            } catch (error) {
              initialAddress = `${initialLat.toFixed(4)}, ${initialLng.toFixed(4)}`;
            }
          } else {
            initialAddress = currentLocation;
          }
        } else if (currentLocation) {
          initialAddress = currentLocation;
        }

        // Create map
        const mapboxMap = new mapboxgl.Map({
          container: mapRef.current,
          style: 'mapbox://styles/mapbox/satellite-v9',
          center: [initialLng, initialLat],
          zoom: 10
        });

        // Add navigation controls
        mapboxMap.addControl(new mapboxgl.NavigationControl(), 'top-right');

        // Create marker
        const mapboxMarker = new mapboxgl.Marker({
          draggable: true,
          color: '#22c55e'
        })
          .setLngLat([initialLng, initialLat])
          .addTo(mapboxMap);

        // Set initial address
        setSelectedAddress(initialAddress);

        // Add click listener to map
        mapboxMap.on('click', async (event) => {
          const { lng, lat } = event.lngLat;
          
          mapboxMarker.setLngLat([lng, lat]);
          
          // Get detailed address from coordinates using reverse geocoding
          try {
            const response = await fetch(
              `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_API_KEY}&types=address,poi,place,locality,neighborhood&limit=5`
            );
            const data = await response.json();
            
            let address = `${lat.toFixed(6)}, ${lng.toFixed(6)}`; // fallback to coordinates
            
            if (data.features && data.features.length > 0) {
              // Try to find the most specific address
              const features = data.features;
              
              // Prefer address type first
              const addressFeature = features.find(f => f.place_type.includes('address'));
              if (addressFeature) {
                address = addressFeature.place_name;
              } else {
                // Then POI
                const poiFeature = features.find(f => f.place_type.includes('poi'));
                if (poiFeature) {
                  address = poiFeature.place_name;
                } else {
                  // Then place
                  const placeFeature = features.find(f => f.place_type.includes('place'));
                  if (placeFeature) {
                    address = placeFeature.place_name;
                  } else {
                    // Use the first available feature
                    address = features[0].place_name;
                  }
                }
              }
            }
            
            setSelectedAddress(address);
          } catch (error) {
            console.warn('Reverse geocoding failed:', error);
            // Provide a more user-friendly fallback
            setSelectedAddress(`Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
          }
        });

        // Add drag listener to marker
        mapboxMarker.on('dragend', async () => {
          const lngLat = mapboxMarker.getLngLat();
          const { lng, lat } = lngLat;
          
          // Get detailed address from coordinates
          try {
            const response = await fetch(
              `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_API_KEY}&types=address,poi,place,locality,neighborhood&limit=5`
            );
            const data = await response.json();
            
            let address = `${lat.toFixed(6)}, ${lng.toFixed(6)}`; // fallback to coordinates
            
            if (data.features && data.features.length > 0) {
              // Try to find the most specific address
              const features = data.features;
              
              // Prefer address type first
              const addressFeature = features.find(f => f.place_type.includes('address'));
              if (addressFeature) {
                address = addressFeature.place_name;
              } else {
                // Then POI
                const poiFeature = features.find(f => f.place_type.includes('poi'));
                if (poiFeature) {
                  address = poiFeature.place_name;
                } else {
                  // Then place
                  const placeFeature = features.find(f => f.place_type.includes('place'));
                  if (placeFeature) {
                    address = placeFeature.place_name;
                  } else {
                    // Use the first available feature
                    address = features[0].place_name;
                  }
                }
              }
            }
            
            setSelectedAddress(address);
          } catch (error) {
            console.warn('Reverse geocoding failed:', error);
            // Provide a more user-friendly fallback
            setSelectedAddress(`Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
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

    // Cleanup function
    return () => {
      if (map) {
        map.remove();
        setMap(null);
        setMarker(null);
      }
    };
  }, [isVisible, currentLocation]);

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
        
        setSelectedAddress(address);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  };

  // Get current location with enhanced accuracy and feedback
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      console.log('📍 Requesting user location for location selection...');
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude: lat, longitude: lng, accuracy } = position.coords;
          console.log(`📍 Location selector obtained: ${lat}, ${lng} (accuracy: ${accuracy}m)`);

          if (map && marker) {
            // Smooth fly animation to user's location
            map.flyTo({
              center: [lng, lat],
              zoom: 15,
              essential: true,
              duration: 2000
            });

            marker.setLngLat([lng, lat]);

            // Get precise address using reverse geocoding
            try {
              const response = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_API_KEY}&types=address,poi,place,locality,neighborhood&limit=5`
              );
              const data = await response.json();
              
              let address = `${lat.toFixed(6)}, ${lng.toFixed(6)}`; // fallback to coordinates
              
              if (data.features && data.features.length > 0) {
                // Try to find the most specific address
                const features = data.features;
                
                // Prefer address type first
                const addressFeature = features.find(f => f.place_type.includes('address'));
                if (addressFeature) {
                  address = addressFeature.place_name;
                } else {
                  // Then POI
                  const poiFeature = features.find(f => f.place_type.includes('poi'));
                  if (poiFeature) {
                    address = poiFeature.place_name;
                  } else {
                    // Then place
                    const placeFeature = features.find(f => f.place_type.includes('place'));
                    if (placeFeature) {
                      address = placeFeature.place_name;
                    } else {
                      // Use the first available feature
                      address = features[0].place_name;
                    }
                  }
                }
              }
              
              console.log(`📍 Address resolved: ${address}`);
              setSelectedAddress(address);
            } catch (error) {
              console.warn('⚠️ Reverse geocoding failed:', error);
              const fallbackAddress = `Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
              setSelectedAddress(fallbackAddress);
            }
          }
        },
        (error) => {
          console.warn('⚠️ Location selector geolocation failed:', error.message);
          console.log('💡 Allow location access for precise location selection');
          setSelectedAddress('Location access denied - please select manually');
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 300000
        }
      );
    } else {
      console.warn('⚠️ Geolocation not supported for location selection');
      setSelectedAddress('Geolocation not supported');
    }
  };

  const handleConfirmLocation = () => {
    if (selectedAddress) {
      onLocationSelect(selectedAddress);
      onClose();
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Select Your Location
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
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

          {/* Selected Address Display */}
          {selectedAddress && (
            <div className="p-3 bg-accent/50 rounded-lg">
              <p className="text-sm font-medium">Selected Location:</p>
              <p className="text-sm text-muted-foreground">{selectedAddress}</p>
            </div>
          )}

          {/* Map Container */}
          <div className="relative h-96 rounded-lg overflow-hidden border">
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
            <p>• Drag the green marker to fine-tune the position</p>
            <p>• Use search to find specific places</p>
            <p>• Click the location icon to use your current position</p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmLocation} 
              disabled={!selectedAddress}
              className="bg-primary hover:bg-primary/90"
            >
              Confirm Location
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};