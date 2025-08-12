'use client';

import { useState, useEffect } from 'react';
import { GoogleMap, StreetViewPanorama as StreetViewPanoramaComponent, useJsApiLoader } from '@react-google-maps/api';

interface Location {
  lat: number;
  lng: number;
  name: string;
}

const locations: Location[] = [
  { lat: 40.758896, lng: -73.985130, name: 'Times Square, New York' },
  { lat: 48.858370, lng: 2.294481, name: 'Eiffel Tower, Paris' },
  { lat: 51.501364, lng: -0.141890, name: 'Big Ben, London' },
  { lat: 35.659487, lng: 139.700378, name: 'Shibuya Crossing, Tokyo' },
  { lat: 41.890251, lng: 12.492373, name: 'Colosseum, Rome' },
];

// Keep libraries array as static const to prevent reloads
const libraries: ('geometry')[] = ['geometry'];

export default function StreetViewPanorama() {
  const [selectedLocation, setSelectedLocation] = useState(locations[0]);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customLat, setCustomLat] = useState('');
  const [customLng, setCustomLng] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  // Global error handler for Google Maps API
  useEffect(() => {
    const handleGoogleMapsError = () => {
      setError('Google Maps billing is not enabled. Please enable billing in your Google Cloud Console and ensure your API key has proper permissions.');
    };

    // Listen for global Google Maps errors
    window.gm_authFailure = handleGoogleMapsError;

    return () => {
      delete window.gm_authFailure;
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

  const handleLocationChange = (value: string) => {
    const location = locations.find(loc => `${loc.lat},${loc.lng}` === value);
    if (location) {
      setSelectedLocation(location);
    }
  };

  const handleCustomLocation = () => {
    const lat = parseFloat(customLat);
    const lng = parseFloat(customLng);

    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      const newLocation = { lat, lng, name: 'Custom Location' };
      setSelectedLocation(newLocation);
      setShowCustomInput(false);
      setCustomLat('');
      setCustomLng('');
    } else {
      alert('Please enter valid latitude (-90 to 90) and longitude (-180 to 180) values.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCustomLocation();
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
    
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600 text-center max-w-3xl mx-auto p-6">
          <p className="text-xl font-semibold mb-4">{error || 'Failed to load Google Maps'}</p>
          
          {isBillingError && (
            <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <h3 className="font-semibold text-orange-800 mb-2">💳 Billing Required</h3>
              <p className="text-orange-700 text-sm mb-2">
                Google Maps requires billing to be enabled. This is usually free for low usage.
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
          
          <div className="text-left bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2 text-gray-800">Setup Steps:</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 text-sm">
              <li>Check your Google Maps API key in .env.local</li>
              <li>Enable <strong>Maps JavaScript API</strong> in Google Cloud Console</li>
              <li>Enable <strong>billing</strong> on your Google Cloud project</li>
              <li>Verify API key restrictions allow your domain</li>
              <li>Disable ad blockers or try incognito mode</li>
            </ol>
            <div className="mt-3 p-3 bg-blue-50 border-l-4 border-blue-400">
              <p className="text-xs text-blue-800">
                <strong>Note:</strong> Google Maps provides $200 free monthly credit, which covers typical usage.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="location-select" className="font-semibold text-gray-700">
              Choose a location:
            </label>
            <select
              id="location-select"
              value={`${selectedLocation.lat},${selectedLocation.lng}`}
              onChange={(e) => handleLocationChange(e.target.value)}
              className="px-4 py-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none transition-colors"
            >
              {locations.map((loc) => (
                <option key={`${loc.lat},${loc.lng}`} value={`${loc.lat},${loc.lng}`}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowCustomInput(!showCustomInput)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Enter Custom Location
          </button>

          {showCustomInput && (
            <div className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Latitude"
                value={customLat}
                onChange={(e) => setCustomLat(e.target.value)}
                onKeyPress={handleKeyPress}
                className="px-3 py-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none w-32"
              />
              <input
                type="text"
                placeholder="Longitude"
                value={customLng}
                onChange={(e) => setCustomLng(e.target.value)}
                onKeyPress={handleKeyPress}
                className="px-3 py-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none w-32"
              />
              <button
                onClick={handleCustomLocation}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
              >
                Go
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "600px" }}
          center={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
          zoom={14}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }}
        >
          <StreetViewPanoramaComponent
            options={{
              position: { lat: selectedLocation.lat, lng: selectedLocation.lng },
              pov: { heading: 34, pitch: 10 },
              zoom: 1,
              addressControl: true,
              linksControl: true,
              panControl: true,
              enableCloseButton: false,
              fullscreenControl: true,
              visible: true,
            }}
            onLoad={() => {
              console.log('Street View panorama loaded successfully');
            }}
          />
        </GoogleMap>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">How to use:</h3>
        <ul className="space-y-2 text-gray-600 mb-4">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            Click and drag to look around 360°
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            Use scroll wheel or pinch to zoom in/out
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            Select a location from the dropdown or enter custom coordinates
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            Click on the arrows in the panorama to move to nearby locations
          </li>
        </ul>
        
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
          <p className="font-semibold mb-1">Note about console errors:</p>
          <p>Some "ERR_BLOCKED_BY_CLIENT" errors in the console are normal - they're from Google's internal telemetry that may be blocked by ad blockers. These don't affect the functionality of Street View.</p>
        </div>
      </div>
    </div>
  );
}