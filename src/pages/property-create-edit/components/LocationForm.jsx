import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, AlertCircle, ChevronUp, ChevronDown, Map, Navigation } from 'lucide-react';

const LocationForm = ({ formData, setFormData, errors, setErrors }) => {
  const [showMapPreview, setShowMapPreview] = useState(false);
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [activeAutocompleteIndex, setActiveAutocompleteIndex] = useState(-1);
  const [isGeocodingLoading, setIsGeocodingLoading] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);
  const [currentMarker, setCurrentMarker] = useState(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapInteractionMode, setMapInteractionMode] = useState(false);
  
  const mapRef = useRef(null);
  const autocompleteTimeoutRef = useRef(null);
  const addressInputRef = useRef(null);
  const autocompleteContainerRef = useRef(null);

  const LOCATIONIQ_API_KEY = "pk.ad563e9d0495f84cb1afb14f4f550d68";
  const DAR_ES_SALAAM_VIEWBOX = "39.12,-6.89,39.31,-6.75";
  const DAR_ES_SALAAM_CENTER = [-6.8235, 39.2695];

  // Dynamic Leaflet loading
  useEffect(() => {
    if (window.L) {
      setIsMapLoaded(true);
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => setIsMapLoaded(true);
    document.head.appendChild(script);
  }, []);

  // Initialize map
  useEffect(() => {
    if (showMapPreview && isMapLoaded && mapRef.current && !mapInstance) {
      const map = window.L.map(mapRef.current, {
        center: DAR_ES_SALAAM_CENTER,
        zoom: 13,
        scrollWheelZoom: false,
        dragging: false,
        zoomControl: true
      });

      window.L.tileLayer(`https://{s}-tiles.locationiq.com/v3/streets/r/{z}/{x}/{y}.png?key=${LOCATIONIQ_API_KEY}`, {
        maxZoom: 19,
        attribution: '© LocationIQ © OpenStreetMap'
      }).addTo(map);

      map.on('click', handleMapClick);

      if (formData?.latitude && formData?.longitude) {
        addMarkerToMap(map, formData.latitude, formData.longitude, formData.address || 'Selected Location');
        map.setView([formData.latitude, formData.longitude], 16);
      }

      setMapInstance(map);
    }
  }, [showMapPreview, isMapLoaded]);

  // Add marker with custom icon and popup
  const addMarkerToMap = (map, lat, lng, address) => {
    if (currentMarker) {
      map.removeLayer(currentMarker);
    }
    
    // Create custom marker icon
    const customIcon = window.L.divIcon({
      className: 'custom-marker',
      html: `<div class="absolute w-8 h-8 flex items-center justify-center">
               <div class="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                 <div class="w-4 h-4 bg-white rounded-full"></div>
               </div>
             </div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32]
    });
    
    const marker = window.L.marker([lat, lng], { icon: customIcon }).addTo(map);
    
    // Create popup content
    const popupContent = `
      <div class="p-2 max-w-xs">
        <div class="font-medium text-blue-700">${address.split(',')[0]}</div>
        <div class="text-xs text-gray-600 truncate">${address}</div>
        <div class="text-xs text-gray-500 mt-1">Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}</div>
      </div>
    `;
    
    marker.bindPopup(popupContent).openPopup();
    setCurrentMarker(marker);
  };

  // Toggle map interaction mode
  useEffect(() => {
    if (!mapInstance) return;
    
    if (mapInteractionMode) {
      mapInstance.scrollWheelZoom.enable();
      mapInstance.dragging.enable();
    } else {
      mapInstance.scrollWheelZoom.disable();
      mapInstance.dragging.disable();
    }
  }, [mapInteractionMode, mapInstance]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors?.[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    if (name === 'address') {
      handleAddressInputChange(value);
    }
  };

  const handleAddressInputChange = (value) => {
    clearTimeout(autocompleteTimeoutRef.current);

    if (value.length < 3) {
      setAutocompleteSuggestions([]);
      setShowAutocomplete(false);
      return;
    }

    autocompleteTimeoutRef.current = setTimeout(() => {
      fetchAutocompleteSuggestions(value);
    }, 300);
  };

  const fetchAutocompleteSuggestions = async (query) => {
    try {
      const url = `https://us1.locationiq.com/v1/autocomplete.php?key=${LOCATIONIQ_API_KEY}&q=${encodeURIComponent(query)}&format=json&viewbox=${DAR_ES_SALAAM_VIEWBOX}&bounded=1&limit=8`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch suggestions');
      
      const data = await response.json();
      setAutocompleteSuggestions(data || []);
      setShowAutocomplete(true);
      setActiveAutocompleteIndex(-1);
    } catch (error) {
      console.error('Autocomplete error:', error);
      setAutocompleteSuggestions([]);
      setShowAutocomplete(false);
    }
  };

  // Highlight matching text in autocomplete results with blue color
  const highlightMatch = (text, query) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<span class="text-blue-600 font-bold">$1</span>');
  };

  const handleAutocompleteSelect = (suggestion) => {
    const lat = parseFloat(suggestion.lat);
    const lon = parseFloat(suggestion.lon);
    
    setFormData(prev => ({
      ...prev,
      address: suggestion.display_name,
      state: 'Dar es Salaam Region',
      country: 'Tanzania',
      latitude: lat,
      longitude: lon
    }));

    setShowAutocomplete(false);
    setAutocompleteSuggestions([]);

    if (mapInstance) {
      addMarkerToMap(mapInstance, lat, lon, suggestion.display_name);
      mapInstance.setView([lat, lon], 16);
    }
  };

  const handleMapClick = async (e) => {
    const lat = e.latlng.lat;
    const lon = e.latlng.lng;

    try {
      const url = `https://us1.locationiq.com/v1/reverse.php?key=${LOCATIONIQ_API_KEY}&lat=${lat}&lon=${lon}&format=json&viewbox=${DAR_ES_SALAAM_VIEWBOX}&bounded=1`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to reverse geocode');
      
      const data = await response.json();
      
      if (data && data.display_name) {
        setFormData(prev => ({
          ...prev,
          address: data.display_name,
          state: 'Dar es Salaam Region',
          country: 'Tanzania',
          latitude: lat,
          longitude: lon
        }));

        if (mapInstance) {
          addMarkerToMap(mapInstance, lat, lon, data.display_name);
        }
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    }
  };

  const handleKeyDown = (e) => {
    if (!showAutocomplete || autocompleteSuggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveAutocompleteIndex(prev => 
          prev < autocompleteSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveAutocompleteIndex(prev => 
          prev > 0 ? prev - 1 : autocompleteSuggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (activeAutocompleteIndex >= 0) {
          handleAutocompleteSelect(autocompleteSuggestions[activeAutocompleteIndex]);
        }
        break;
      case 'Escape':
        setShowAutocomplete(false);
        setActiveAutocompleteIndex(-1);
        break;
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsGeocodingLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        
        try {
          const url = `https://us1.locationiq.com/v1/reverse.php?key=${LOCATIONIQ_API_KEY}&lat=${lat}&lon=${lon}&format=json`;
          const response = await fetch(url);
          if (!response.ok) throw new Error('Failed to reverse geocode');
          
          const data = await response.json();
          
          if (data && data.display_name) {
            setFormData(prev => ({
              ...prev,
              address: data.display_name,
              state: 'Dar es Salaam Region',
              country: 'Tanzania',
              latitude: lat,
              longitude: lon
            }));

            if (mapInstance) {
              addMarkerToMap(mapInstance, lat, lon, data.display_name);
              mapInstance.setView([lat, lon], 16);
            }
          }
        } catch (error) {
          console.error('Reverse geocoding error:', error);
          alert('Failed to get address for your location');
        } finally {
          setIsGeocodingLoading(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Failed to get your location');
        setIsGeocodingLoading(false);
      }
    );
  };

  // Close autocomplete when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (autocompleteContainerRef.current && 
          !autocompleteContainerRef.current.contains(event.target) &&
          addressInputRef.current !== event.target) {
        setShowAutocomplete(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <MapPin size={16} className="text-blue-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Property Location</h2>
      </div>

      <div className="space-y-6">
        {/* Street Address with Autocomplete */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location Address *
          </label>
          <div className="relative">
            <input
              ref={addressInputRef}
              type="text"
              name="address"
              value={formData?.address || ''}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Search location in Dar es Salaam Region..."
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900 placeholder-gray-400 pr-20 ${
                errors?.address ? 'border-red-500' : 'border-gray-300'
              }`}
              style={{ minWidth: '100%' }}
            />
            <div className="absolute inset-y-0 right-0 flex items-center space-x-1 pr-3">
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={isGeocodingLoading}
                className="text-gray-400 hover:text-blue-600 transition-colors duration-200 disabled:opacity-50"
                title="Use current location"
              >
                {isGeocodingLoading ? (
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Navigation size={16} />
                )}
              </button>
              <Search size={16} className="text-gray-400" />
            </div>
          </div>
          
          {/* Autocomplete Suggestions */}
          {showAutocomplete && autocompleteSuggestions.length > 0 && (
            <div 
              ref={autocompleteContainerRef}
              className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
            >
              {autocompleteSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className={`px-3 py-2 cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors duration-150 ${
                    index === activeAutocompleteIndex ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleAutocompleteSelect(suggestion)}
                >
                  <div 
                    className="text-sm text-gray-900"
                    dangerouslySetInnerHTML={{
                      __html: highlightMatch(suggestion.display_name, formData.address || '')
                    }}
                  />
                </div>
              ))}
            </div>
          )}
          
          {errors?.address && (
            <p className="text-red-500 text-xs mt-1 flex items-center">
              <AlertCircle size={12} className="mr-1" />
              {errors.address}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Region - Auto-filled for Dar es Salaam Region */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Region *
            </label>
            <input
              type="text"
              name="state"
              value="Dar es Salaam Region"
              readOnly
              className="w-full px-3 py-2 border rounded-md bg-gray-50 text-gray-700 border-gray-300"
            />
          </div>

          {/* Country - Fixed to Tanzania */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country *
            </label>
            <input
              type="text"
              name="country"
              value="Tanzania"
              readOnly
              className="w-full px-3 py-2 border rounded-md bg-gray-50 text-gray-700 border-gray-300"
            />
          </div>

          {/* Coordinates */}
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Latitude *
              </label>
              <input
                type="text"
                name="latitude"
                value={formData?.latitude || ''}
                readOnly
                className="w-full px-3 py-2 border rounded-md bg-gray-50 text-gray-700 border-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Longitude *
              </label>
              <input
                type="text"
                name="longitude"
                value={formData?.longitude || ''}
                readOnly
                className="w-full px-3 py-2 border rounded-md bg-gray-50 text-gray-700 border-gray-300"
              />
            </div>
          </div>
        </div>

        {/* Map Preview Toggle */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowMapPreview(!showMapPreview)}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors duration-200 font-medium"
          >
            {showMapPreview ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            <span className="text-sm">
              {showMapPreview ? 'Hide' : 'Show'} Interactive Map
            </span>
          </button>
        </div>

        {/* Interactive Map */}
        {showMapPreview && (
          <div className="pt-4">
            <div className="bg-gray-100 rounded-lg border border-gray-300 overflow-hidden">
              {!isMapLoaded ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-sm">Loading map...</p>
                  </div>
                </div>
              ) : (
                <div>
                  <div 
                    ref={mapRef} 
                    className="h-64 md:h-80 w-full"
                    style={{ minHeight: '256px' }}
                  />
                  <div className="p-3 bg-white border-t border-gray-200 flex justify-between items-center">
                    <p className="text-xs text-gray-500">
                      {mapInteractionMode 
                        ? 'Map interaction active • Click to set location' 
                        : 'Hold Ctrl/Cmd to interact with map • Click to set location'}
                    </p>
                    <button
                      onClick={() => setMapInteractionMode(!mapInteractionMode)}
                      className={`px-3 py-1 text-xs rounded ${
                        mapInteractionMode
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {mapInteractionMode ? 'Active ✓' : 'Enable Interaction'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Location Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location Notes
          </label>
          <textarea
            name="locationNotes"
            value={formData?.locationNotes || ''}
            onChange={handleInputChange}
            rows={3}
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900 placeholder-gray-400 ${
              errors?.locationNotes ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Additional details about the location..."
          />
        </div>
      </div>

      {/* Error display at bottom */}
      {Object.keys(errors).length > 0 && (
        <div className="mt-6 p-3 bg-red-50 border border-red-200 rounded-md">
          <h3 className="text-red-800 font-medium flex items-center">
            <AlertCircle size={16} className="mr-2" />
            Please fix the following issues:
          </h3>
          <ul className="mt-2 text-red-700 text-sm list-disc pl-5 space-y-1">
            {Object.entries(errors).map(([field, message]) => (
              <li key={field}>{message}</li>
            ))}
          </ul>
        </div>
      )}

      <style jsx>{`
        .custom-marker {
          background: transparent;
          border: none;
        }
        
        input[name="address"] {
          overflow-x: auto;
          white-space: nowrap;
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        input[name="address"]::-webkit-scrollbar {
          display: none;
        }
        
        @media (max-width: 640px) {
          input[name="address"] {
            min-width: calc(100vw - 4rem);
          }
        }
      `}</style>
    </div>
  );
};

export default LocationForm;