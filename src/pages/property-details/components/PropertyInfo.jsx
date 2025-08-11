// src/pages/property-details/components/PropertyInfo.jsx
import React, { useRef, useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon'; // Assuming this path is correct

const PropertyInfo = ({ property }) => {
  const [isMapInteractive, setIsMapInteractive] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const leafletMapInstance = useRef(null);

  // Dar es Salaam bounds
  const DAR_ES_SALAAM_BOUNDS = {
    north: -6.6,
    south: -6.9,
    east: 39.4,
    west: 39.1
  };

  const handleGetDirections = () => {
    // Use the bounded and parsed coordinates for directions
    if (property?.latitude && property?.longitude) {
      const { lat, lng } = getBoundedCoordinates(); // Get the consistent coordinates
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      window.open(googleMapsUrl, '_blank');
    }
  };

  // Function to check if coordinates are within Dar es Salaam bounds
  const isWithinDarEsSalaam = (lat, lng) => {
    return lat >= DAR_ES_SALAAM_BOUNDS.south && 
           lat <= DAR_ES_SALAAM_BOUNDS.north && 
           lng >= DAR_ES_SALAAM_BOUNDS.west && 
           lng <= DAR_ES_SALAAM_BOUNDS.east;
  };

  // Get bounded coordinates (fallback to Dar es Salaam center if outside bounds)
  const getBoundedCoordinates = () => {
    const lat = parseFloat(property?.latitude);
    const lng = parseFloat(property?.longitude);
    
    if (isWithinDarEsSalaam(lat, lng)) {
      return { lat, lng };
    }
    
    // Fallback to Dar es Salaam center
    return { lat: -6.7924, lng: 39.2083 };
  };

  // Show temporary message for Ctrl+scroll
  const showCtrlZoomMessage = () => {
    const existingMessage = document.querySelector('.ctrl-zoom-message');
    if (existingMessage) return;

    const message = document.createElement('div');
    message.className = 'ctrl-zoom-message';
    message.innerHTML = `
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.5);
        color: white;
        padding: 8px 16px;
        border-radius: 6px;
        font-size: 12px;
        z-index: 1000;
        pointer-events: none;
        backdrop-filter: blur(4px);
      ">
        Hold Ctrl and scroll to zoom
      </div>
    `;
    
    if (leafletMapRef.current) {
      leafletMapRef.current.style.position = 'relative';
      leafletMapRef.current.appendChild(message);
      
      setTimeout(() => {
        if (message.parentNode) {
          message.parentNode.removeChild(message);
        }
      }, 2000);
    }
  };

  // New useEffect for touch device message (remains separate for mobile specific hints)
  useEffect(() => {
    if ('ontouchstart' in window) {
      const mapContainer = leafletMapRef.current; // Use leafletMapRef.current here
      if (!mapContainer) return; // Ensure mapContainer exists

      const existingMessage = document.querySelector('.touch-instruction-message');
      if (existingMessage) return;

      const touchMessage = document.createElement('div');
      touchMessage.className = 'touch-instruction-message';
      touchMessage.innerHTML = `
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(0, 0, 0, 0.5);
          color: white;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          text-align: center;
          z-index: 1000;
          pointer-events: none;
          backdrop-filter: blur(4px);
          white-space: nowrap;
        ">
          Double tap to zoom and hold to move
        </div>
      `;

      mapContainer.appendChild(touchMessage);

      setTimeout(() => {
        if (touchMessage.parentNode) {
          touchMessage.parentNode.removeChild(touchMessage);
        }
      }, 4000); 
    }
  }, [leafletMapInstance.current]); // Depend on leafletMapInstance.current


  // NEW useEffect for map initialization and desktop controls
  useEffect(() => {
    const loadLeafletAndInitializeMap = async () => {
      // Load Leaflet CSS
      if (!document.querySelector('link[href*="leaflet"]')) {
        const cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css';
        document.head.appendChild(cssLink);
      }

      // Load Leaflet JS
      if (!window.L) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js';
        script.onload = () => {
          initializeMap();
        };
        document.head.appendChild(script);
      } else {
        initializeMap();
      }
    };

    const initializeMap = () => {
      // Ensure map container and Leaflet are ready, and map not already initialized
      if (leafletMapRef.current && window.L && !leafletMapInstance.current) {
        const { lat, lng } = getBoundedCoordinates();
        
        // Create map instance
        const map = window.L.map(leafletMapRef.current, {
          scrollWheelZoom: false, // Disable scroll wheel zoom by default
          doubleClickZoom: true,
          touchZoom: true,
          boxZoom: true,
          keyboard: true,
          zoomControl: false // Disable Leaflet's default zoom controls
        }).setView([lat, lng], 16);

        // Add OpenStreetMap tiles
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(map);

        // Add marker
        const marker = window.L.marker([lat, lng]).addTo(map);
        
        // Custom popup content
        if (property?.location) {
          marker.bindPopup(`<strong>${property.location}</strong>`);
        }

        // Handle Ctrl + scroll for zoom
        let ctrlPressed = false;
        
        const handleKeyDown = (e) => {
          if (e.ctrlKey || e.metaKey) {
            ctrlPressed = true;
            map.scrollWheelZoom.enable();
          }
        };
        
        const handleKeyUp = (e) => {
          if (!e.ctrlKey && !e.metaKey) {
            ctrlPressed = false;
            map.scrollWheelZoom.disable();
          }
        };
        
        const handleWheel = (e) => {
          if (!ctrlPressed) {
            e.preventDefault();
            // Show temporary message
            showCtrlZoomMessage();
          }
        };

        // Add event listeners to the document for Ctrl key tracking
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);
        // Add wheel event listener directly to the map container
        leafletMapRef.current.addEventListener('wheel', handleWheel, { passive: false });

        // Store the map instance
        leafletMapInstance.current = map;
        setMapLoaded(true);

        // Cleanup function for this specific effect
        return () => {
          document.removeEventListener('keydown', handleKeyDown);
          document.removeEventListener('keyup', handleKeyUp);
          if (leafletMapRef.current) {
            leafletMapRef.current.removeEventListener('wheel', handleWheel);
          }
          // Clean up Leaflet map instance when component unmounts
          if (leafletMapInstance.current) {
            leafletMapInstance.current.remove();
            leafletMapInstance.current = null;
          }
        };
      }
    };

    // Only attempt to load and initialize map if coordinates are available
    if (property?.latitude && property?.longitude) {
      loadLeafletAndInitializeMap();
    }
  }, [property?.latitude, property?.longitude]); // Rerun when property coordinates change


  // Handle zoom in/out
  const handleZoomIn = (map) => {
    if (map) {
      map.zoomIn();
    }
  };

  const handleZoomOut = (map) => {
    if (map) {
      map.zoomOut();
    }
  };

  // Handle refresh/reset view
  const handleResetView = () => {
    if (leafletMapInstance.current) {
      const { lat, lng } = getBoundedCoordinates();
      leafletMapInstance.current.flyTo([lat, lng], 16, {
        duration: 1
      });
    }
  };

  const renderDescription = () => (
    <div className="card overflow-hidden mb-6">
      {/* Card Heading */}
      <div className="p-6 pb-4">
        <h4 className="text-lg font-semibold text-text-primary mb-6 flex items-center">
          <Icon name="FileText" size={20} className="mr-2 text-primary" />
          Description
        </h4>
        <div className="prose max-w-none">
          <div className="text-text-primary whitespace-pre-line leading-relaxed">
            {property?.description || 'No description available for this property. '}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAmenities = () => {
  let parsedAmenities = [];

  const rawAmenities = property?.amenities;

  // Case 1: amenities is already an array
  if (Array.isArray(rawAmenities)) {
    parsedAmenities = rawAmenities;

  // Case 2: amenities is a JSON string
  } else if (typeof rawAmenities === 'string') {
    try {
      const parsed = JSON.parse(rawAmenities);
      if (Array.isArray(parsed)) {
        parsedAmenities = parsed;
      } else {
        console.warn('Parsed amenities is not an array:', parsed);
      }
    } catch (error) {
      console.error('Error parsing amenities string:', error);
    }
  }

  return (
    <div className="card overflow-hidden">
      <div className="p-6">
        <h4 className="text-lg font-semibold text-text-primary mb-6 flex items-center">
          <Icon name="Star" size={20} className="mr-2 text-primary" />
          Amenities
        </h4>

        {parsedAmenities.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3">
            {parsedAmenities.map((amenity, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-2 bg-secondary-50 rounded-lg"
              >
                <Icon name="Check" size={16} className="text-success flex-shrink-0" />
                <span className="text-text-primary text-sm">
                  {amenity.charAt(0).toUpperCase() + amenity.slice(1)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Icon name="Star" size={48} className="text-secondary mx-auto mb-4" />
            <p className="text-text-secondary">No amenities listed for this property</p>
          </div>
        )}
      </div>
    </div>
  );
};

const renderInteractiveMap = () => {
  const { lat, lng } = getBoundedCoordinates();

  return (
    <div className="relative bg-secondary-100 rounded-lg h-72 md:h-80 lg:h-96 overflow-hidden group" ref={mapRef}>
      {/* Leaflet Map Container */}
      <div
        ref={leafletMapRef}
        className="absolute inset-0 w-full h-full rounded-lg"
        style={{ zIndex: 10 }}
      />

      {/* Loading Overlay */}
      {!mapLoaded && (
        <div className="absolute inset-0 bg-secondary-100 flex items-center justify-center" style={{ zIndex: 20 }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-text-secondary text-sm">Loading map...</p>
          </div>
        </div>
      )}

      {/* Map Controls - Refresh Button */}
      <div className="absolute top-4 right-4 z-30 flex flex-col items-end space-y-2">
        {/* Zoom Controls */}
        <div className="bg-black/50 backdrop-blur-sm rounded-lg overflow-hidden">
          <button
            onClick={() => handleZoomIn(leafletMapInstance.current)}
            className="block w-10 h-10 flex items-center justify-center text-white 
                       hover:bg-black/70 transition-all duration-200 ease-out 
                       border-b border-white/20 last:border-b-0"
            title="Zoom in"
          >
            <Icon name="Plus" size={16} />
          </button>
          <button
            onClick={() => handleZoomOut(leafletMapInstance.current)}
            className="block w-10 h-10 flex items-center justify-center text-white 
                       hover:bg-black/70 transition-all duration-200 ease-out"
            title="Zoom out"
          >
            <Icon name="Minus" size={16} />
          </button>
        </div>

        {/* Refresh button */}
        <button
          onClick={handleResetView}
          className="flex items-center justify-center w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-md transition-all duration-200 backdrop-blur-sm"
          title="Reset to property location"
        >
          <Icon name="RotateCcw" size={16} />
        </button>
      </div>

      {/* Get Directions Button */}
      <button
        onClick={handleGetDirections}
        className="absolute bottom-4 left-4 flex items-center space-x-2 bg-black/50 hover:bg-black/70 text-white px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 backdrop-blur-sm z-30"
      >
        <Icon name="Navigation" size={16} />
        <span className="hidden sm:inline">Get Directions</span>
        <span className="sm:hidden">Directions</span>
      </button>
    </div>
  );
};

  const renderLocation = () => (
    <div className="card overflow-hidden" ref={mapRef}>
      {/* Card Heading */}
      <div className="p-6">
        <h4 className="text-lg font-semibold text-text-primary mb-6 flex items-center">
          <Icon name="MapPin" size={20} className="mr-2 text-primary" />
          Location
        </h4>
        
        <div className="space-y-6">
          {/* Display property location */}
          {property?.location && (
            <div className="bg-secondary-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Icon name="MapPin" size={16} className="text-primary flex-shrink-0" />
                <h5 className="text-base font-medium text-text-primary">Address</h5>
              </div>
              <p className="text-text-secondary ml-6">
                {property.location}
              </p>
            </div>
          )}

          {/* Display location_notes if available */}
          {property?.location_notes && (
            <div className="bg-secondary-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Icon name="FileText" size={16} className="text-primary flex-shrink-0" />
                <h5 className="text-base font-medium text-text-primary">Location Notes</h5>
              </div>
              <p className="text-text-secondary ml-6 whitespace-pre-line">
                {property.location_notes}
              </p>
            </div>
          )}

          {/* Interactive Map */}
          {property?.latitude && property?.longitude ? (
            renderInteractiveMap()
          ) : (
            // Fallback when coordinates are not available
            <div className="bg-secondary-100 rounded-lg h-64 flex items-center justify-center">
              <div className="text-center">
                <Icon name="Map" size={48} className="text-secondary mx-auto mb-2" />
                <p className="text-text-secondary">Location coordinates not available</p>
              </div>
            </div>
          )}

          {/* Location bounds warning for coordinates outside Dar es Salaam */}
          {property?.latitude && property?.longitude && 
           !isWithinDarEsSalaam(parseFloat(property.latitude), parseFloat(property.longitude)) && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <Icon name="AlertTriangle" size={16} className="text-amber-600 flex-shrink-0" />
                <p className="text-amber-800 text-sm">
                  Property coordinates are outside Dar es Salaam region. Showing city center instead.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Description Section */}
      {renderDescription()}
      
      {/* Amenities Section */}
      {renderAmenities()}
      
      {/* Location Section */}
      {renderLocation()}
    </div>
  );
};

export default PropertyInfo;
