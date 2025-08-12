'use client';

import { useState, useEffect, useCallback } from 'react';
import { GoogleMap, StreetViewPanorama as StreetViewPanoramaComponent, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';

interface Property {
  id: string;
  lat: number;
  lng: number;
  name: string;
  address: string;
  price: string;
  type: string;
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  description: string;
}

// Sample property data - you can replace with real data
const properties: Property[] = [
  {
    id: '1',
    lat: 40.758896,
    lng: -73.985130,
    name: 'Luxury Manhattan Penthouse',
    address: '1234 Broadway, New York, NY 10001',
    price: '$2,500,000',
    type: 'Penthouse',
    bedrooms: 3,
    bathrooms: 2,
    sqft: 2200,
    description: 'Stunning penthouse with panoramic city views in the heart of Times Square.'
  },
  {
    id: '2',
    lat: 40.761431,
    lng: -73.981658,
    name: 'Modern High-Rise Condo',
    address: '567 W 47th St, New York, NY 10036',
    price: '$1,850,000',
    type: 'Condo',
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1800,
    description: 'Contemporary condo with floor-to-ceiling windows and premium amenities.'
  },
  {
    id: '3',
    lat: 40.755123,
    lng: -73.984567,
    name: 'Classic NYC Apartment',
    address: '890 8th Ave, New York, NY 10019',
    price: '$1,200,000',
    type: 'Apartment',
    bedrooms: 2,
    bathrooms: 1,
    sqft: 1200,
    description: 'Charming pre-war apartment with original hardwood floors and exposed brick.'
  },
  {
    id: '4',
    lat: 40.760125,
    lng: -73.983890,
    name: 'Executive Office Suite',
    address: '456 W 42nd St, New York, NY 10036',
    price: '$850,000',
    type: 'Commercial',
    sqft: 1500,
    description: 'Prime commercial space perfect for corporate headquarters or startup office.'
  },
  {
    id: '5',
    lat: 40.756789,
    lng: -73.986234,
    name: 'Boutique Retail Space',
    address: '123 W 44th St, New York, NY 10036',
    price: '$650,000',
    type: 'Retail',
    sqft: 800,
    description: 'Street-level retail space with high foot traffic in Theater District.'
  },
];

// Keep libraries array as static const to prevent reloads
const libraries: ('geometry')[] = ['geometry'];

export default function PropertyMapViewer() {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(properties[0]);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [, setMap] = useState<google.maps.Map | null>(null);
  const [error, setError] = useState<string | null>(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey || '',
    libraries,
  });

  // Debug API key and detect issues
  useEffect(() => {
    console.log('Google Maps API Key check:');
    console.log('- API Key exists:', !!apiKey);
    console.log('- API Key length:', apiKey?.length || 0);
    console.log('- API Key preview:', apiKey ? `${apiKey.substring(0, 10)}...` : 'Not found');
    
    if (!apiKey) {
      setError('Google Maps API key is missing. Please check your .env.local file.');
      return;
    }
    
    if (apiKey.length < 30) {
      setError('Google Maps API key appears to be invalid (too short). Please verify your API key.');
      return;
    }
  }, [apiKey]);

  // Global error handler for Google Maps API
  useEffect(() => {
    const handleGoogleMapsError = () => {
      console.error('Google Maps authentication failure detected');
      setError('Google Maps authentication failed. This could be due to: billing not enabled, invalid API key, or API restrictions.');
    };

    const handleQuotaError = () => {
      console.error('Google Maps quota exceeded');
      setError('Google Maps quota exceeded. Please check your API usage limits and billing in Google Cloud Console.');
    };

    // Listen for global Google Maps errors
    window.gm_authFailure = handleGoogleMapsError;
    
    // Listen for quota errors
    const originalError = console.error;
    console.error = (...args) => {
      const message = args.join(' ');
      if (message.includes('OVER_QUERY_LIMIT') || message.includes('quota')) {
        handleQuotaError();
      }
      originalError.apply(console, args);
    };

    return () => {
      delete window.gm_authFailure;
      console.error = originalError;
    };
  }, []);

  // Handle API loading errors
  if (loadError) {
    console.error('Google Maps Load Error:', loadError);
    let errorMessage = 'Failed to load Google Maps API.';
    
    if (loadError.message?.includes('BillingNotEnabledMapError')) {
      errorMessage = 'Google Maps billing is not enabled. Please enable billing in your Google Cloud Console.';
    } else if (loadError.message?.includes('InvalidKeyMapError')) {
      errorMessage = 'Invalid Google Maps API key. Please check your API key configuration.';
    } else if (loadError.message?.includes('REQUEST_DENIED')) {
      errorMessage = 'Google Maps API request denied. Please verify your API key and enabled services.';
    }
    
    setError(errorMessage);
  }

  // Handle marker click to select property
  const handleMarkerClick = useCallback((property: Property) => {
    setSelectedProperty(property);
    setSelectedMarkerId(property.id);
  }, []);

  // Handle map load
  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  // Center map on NYC
  const mapCenter = { lat: 40.758896, lng: -73.985130 };

  // Get property type icon color
  const getMarkerColor = (type: string) => {
    switch (type) {
      case 'Penthouse': return '#FF6B35'; // Orange
      case 'Condo': return '#4ECDC4'; // Teal
      case 'Apartment': return '#45B7D1'; // Blue
      case 'Commercial': return '#96CEB4'; // Green
      case 'Retail': return '#FFEAA7'; // Yellow
      default: return '#DDA0DD'; // Plum
    }
  };

  // Handle loading and error states
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Loading Google Maps...</p>
        </div>
      </div>
    );
  }

  if (error || loadError) {
    const isBillingError = error?.includes('billing') || loadError?.message?.includes('BillingNotEnabledMapError');
    const isApiKeyError = error?.includes('API key') || loadError?.message?.includes('InvalidKeyMapError');
    const isQuotaError = error?.includes('quota') || loadError?.message?.includes('OVER_QUERY_LIMIT');
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-red-600 text-center max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-4">🚫 Google Maps Loading Error</h2>
            <p className="text-lg mb-6">{error || loadError?.message || 'Failed to load Google Maps'}</p>
            
            {/* API Key Error */}
            {isApiKeyError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="font-semibold text-red-800 mb-2">🔑 API Key Issue</h3>
                <p className="text-red-700 text-sm mb-3">
                  Your Google Maps API key is missing or invalid.
                </p>
                <div className="text-left bg-white p-3 rounded border text-xs">
                  <strong>Check your .env.local file:</strong><br/>
                  <code className="bg-gray-100 px-2 py-1 rounded">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_key_here</code>
                </div>
              </div>
            )}

            {/* Billing Error */}
            {isBillingError && (
              <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <h3 className="font-semibold text-orange-800 mb-2">💳 Billing Required</h3>
                <p className="text-orange-700 text-sm mb-2">
                  Google Maps requires billing to be enabled. This is usually free for development.
                </p>
                <a 
                  href="https://console.cloud.google.com/billing" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors text-sm"
                >
                  Enable Billing in Google Cloud Console
                </a>
              </div>
            )}

            {/* Quota Error */}
            {isQuotaError && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="font-semibold text-yellow-800 mb-2">📊 Quota Exceeded</h3>
                <p className="text-yellow-700 text-sm mb-2">
                  You've exceeded your Google Maps API usage limits.
                </p>
                <a 
                  href="https://console.cloud.google.com/apis/api/maps-backend.googleapis.com/quotas" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors text-sm"
                >
                  Check Quotas in Google Cloud Console
                </a>
              </div>
            )}
            
            {/* General troubleshooting */}
            <div className="text-left bg-gray-50 p-6 rounded-lg">
              <h3 className="font-semibold mb-3 text-gray-800">🔧 Complete Setup Checklist:</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">API Configuration:</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm">
                    <li>Create API key in Google Cloud Console</li>
                    <li>Enable Maps JavaScript API</li>
                    <li>Enable Street View Static API</li>
                    <li>Set up billing (required even for free usage)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Environment Setup:</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm">
                    <li>Add API key to .env.local file</li>
                    <li>Restart your development server</li>
                    <li>Clear browser cache</li>
                    <li>Try incognito/private browsing mode</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-400">
                <p className="text-sm text-blue-800">
                  <strong>💡 Quick Fix:</strong> Google provides $200 free monthly credit. 
                  Enabling billing is required but typically costs nothing for development.
                </p>
              </div>

              <div className="mt-4 text-center">
                <button 
                  onClick={() => window.location.reload()} 
                  className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Retry Loading Maps
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-800">Interactive Property Map</h1>
        <p className="text-gray-600">Click on any property marker to view its 360° Street View</p>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex">
        {/* Left side - Interactive Map */}
        <div className="flex-1 relative">
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "100%" }}
            center={mapCenter}
            zoom={15}
            onLoad={onMapLoad}
            options={{
              streetViewControl: false,
              mapTypeControl: true,
              fullscreenControl: false,
              zoomControl: true,
              styles: [
                {
                  featureType: "poi",
                  elementType: "labels",
                  stylers: [{ visibility: "off" }]
                }
              ]
            }}
          >
            {/* Property markers */}
            {properties.map((property) => (
              <Marker
                key={property.id}
                position={{ lat: property.lat, lng: property.lng }}
                onClick={() => handleMarkerClick(property)}
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
                  fillColor: getMarkerColor(property.type),
                  fillOpacity: selectedProperty?.id === property.id ? 1 : 0.8,
                  strokeColor: '#FFFFFF',
                  strokeWeight: selectedProperty?.id === property.id ? 3 : 2,
                  scale: selectedProperty?.id === property.id ? 12 : 10,
                }}
              />
            ))}

            {/* Info window for selected marker */}
            {selectedMarkerId && selectedProperty && (
              <InfoWindow
                position={{ lat: selectedProperty.lat, lng: selectedProperty.lng }}
                onCloseClick={() => setSelectedMarkerId(null)}
              >
                <div className="p-2 max-w-xs">
                  <h3 className="font-semibold text-gray-800 mb-1">{selectedProperty.name}</h3>
                  <p className="text-sm text-gray-600 mb-1">{selectedProperty.address}</p>
                  <p className="text-lg font-bold text-green-600">{selectedProperty.price}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <span className="px-2 py-1 bg-gray-100 rounded">{selectedProperty.type}</span>
                    {selectedProperty.bedrooms && (
                      <span>{selectedProperty.bedrooms}bd</span>
                    )}
                    {selectedProperty.bathrooms && (
                      <span>{selectedProperty.bathrooms}ba</span>
                    )}
                    {selectedProperty.sqft && (
                      <span>{selectedProperty.sqft.toLocaleString()} sqft</span>
                    )}
                  </div>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>

          {/* Property legend */}
          <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-xs">
            <h3 className="font-semibold text-gray-800 mb-2">Property Types</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Array.from(new Set(properties.map(p => p.type))).map(type => (
                <div key={type} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: getMarkerColor(type) }}
                  ></div>
                  <span>{type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right side - Property details and Street View */}
        <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
          {selectedProperty ? (
            <>
              {/* Property details */}
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800 mb-2">{selectedProperty.name}</h2>
                <p className="text-gray-600 mb-2">{selectedProperty.address}</p>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-bold text-green-600">{selectedProperty.price}</span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {selectedProperty.type}
                  </span>
                </div>
                
                {/* Property stats */}
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {selectedProperty.bedrooms && (
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-800">{selectedProperty.bedrooms}</div>
                      <div className="text-xs text-gray-600">Bedrooms</div>
                    </div>
                  )}
                  {selectedProperty.bathrooms && (
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-800">{selectedProperty.bathrooms}</div>
                      <div className="text-xs text-gray-600">Bathrooms</div>
                    </div>
                  )}
                  {selectedProperty.sqft && (
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-800">{selectedProperty.sqft.toLocaleString()}</div>
                      <div className="text-xs text-gray-600">Sq Ft</div>
                    </div>
                  )}
                </div>
                
                <p className="text-sm text-gray-700">{selectedProperty.description}</p>
              </div>

              {/* Street View */}
              <div className="flex-1 relative">
                <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs z-10">
                  360° Street View
                </div>
                <GoogleMap
                  mapContainerStyle={{ width: "100%", height: "100%" }}
                  center={{ lat: selectedProperty.lat, lng: selectedProperty.lng }}
                  zoom={18}
                  options={{
                    disableDefaultUI: true,
                  }}
                >
                  <StreetViewPanoramaComponent
                    options={{
                      position: { lat: selectedProperty.lat, lng: selectedProperty.lng },
                      pov: { heading: 0, pitch: 0 },
                      zoom: 1,
                      addressControl: false,
                      linksControl: true,
                      panControl: true,
                      enableCloseButton: false,
                      fullscreenControl: true,
                      visible: true,
                    }}
                    onLoad={() => {
                      console.log('Street View loaded for:', selectedProperty.name);
                    }}
                  />
                </GoogleMap>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="text-4xl mb-4">🏢</div>
                <p>Select a property marker on the map to view details and Street View</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}