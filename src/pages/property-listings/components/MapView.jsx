import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import StatusBadge from '../../../components/StatusBadge';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import { useFavorites } from '../../../contexts/FavoritesContext';
// The following CSS imports for leaflet.markercluster often fail with bundlers like Vite.
// To fix this, you should manually add the CSS links to your project's index.html file.
// import 'leaflet.markercluster/dist/MarkerCluster.css';
// import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';

// A helper component to handle map instance and controls
const MapControls = ({ mapCenter, zoom, handleResetView, handleZoomIn, handleZoomOut }) => {
  const map = useMap();

  // Use useEffect to update the map view when state changes
  useEffect(() => {
    map.flyTo(mapCenter, zoom, {
      duration: 1
    });
  }, [map, mapCenter, zoom]);

  return (
    <>
      {/* Enhanced Map Controls */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col space-y-2">
        {/* Zoom Controls */}
        <div className="bg-surface/95 backdrop-blur-md rounded-lg shadow-elevation-2 border border-border overflow-hidden">
          <button
            onClick={() => handleZoomIn(map)}
            className="block w-10 h-10 flex items-center justify-center text-text-primary 
                       hover:bg-primary hover:text-white hover:border-primary 
                       transition-all duration-200 ease-out border-b border-border last:border-b-0"
            title="Zoom in"
          >
            <Icon name="Plus" size={16} />
          </button>
          <button
            onClick={() => handleZoomOut(map)}
            className="block w-10 h-10 flex items-center justify-center text-text-primary 
                       hover:bg-primary hover:text-white hover:border-primary 
                       transition-all duration-200 ease-out"
            title="Zoom out"
          >
            <Icon name="Minus" size={16} />
          </button>
        </div>

        {/* Reset Control */}
        <div className="bg-surface/95 backdrop-blur-md rounded-lg shadow-elevation-2 border border-border overflow-hidden">
          <button
            onClick={() => handleResetView(map)}
            className="block w-10 h-10 flex items-center justify-center text-text-primary 
                       hover:bg-primary hover:text-white hover:border-primary hover:shadow-lg hover:scale-110 
                       transition-all duration-300 ease-out transform active:scale-95 border border-border hover:border-primary"
            title="Reset to Dar es Salaam view"
          >
            <Icon name="RotateCcw" size={16} />
          </button>
        </div>
      </div>
    </>
  );
};

// A dedicated component to handle marker clustering logic
const MarkerClusterGroup = ({ 
  properties, 
  selectedProperty, 
  onPropertySelect, 
  createCustomIcon, 
  handleMarkerClick,
  hoveredProperty,
  setHoveredProperty,
  clickedProperty,
  setClickedProperty,
  cardPosition,
  setCardPosition,
  calculateCardPosition,
  isMobile
}) => {
  const map = useMap();
  const clusterRef = useRef(L.markerClusterGroup({
    // Prevent scroll wheel zoom when scrolling over clusters
    disableClusteringAtZoom: 15,
    maxClusterRadius: 50,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true
  }));
  const markersRef = useRef(new Map());
  const hoverTimeoutRef = useRef(null);

  useEffect(() => {
    clusterRef.current.clearLayers();
    markersRef.current.clear();
    
    properties.forEach(property => {
      const isSelected = selectedProperty?.id === property.id;
      const marker = L.marker([property.coordinates.lat, property.coordinates.lng], {
        icon: createCustomIcon(property, isSelected)
      });

      // Store marker reference
      markersRef.current.set(property.id, marker);

      // Add click handler for all devices (mobile and desktop)
      marker.on('click', (e) => {
        e.originalEvent.stopPropagation();
        handleMarkerClick(property, e, 'click');
      });

      // Add stable hover handlers for wide screens only
      if (!isMobile) {
        marker.on('mouseover', (e) => {
          // Clear any existing timeout
          if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
          }
          
          // Set hover with slight delay to prevent rapid flickering
          hoverTimeoutRef.current = setTimeout(() => {
            handleMarkerClick(property, e, 'hover');
          }, 100);
        });

        marker.on('mouseout', () => {
          // Clear timeout if mouse leaves quickly
          if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = null;
          }
          
          // Delay hiding to allow mouse to reach card
          setTimeout(() => {
            if (!document.querySelector('.property-card-popup:hover')) {
              setHoveredProperty(null);
            }
          }, 200);
        });
      }

      clusterRef.current.addLayer(marker);
    });

    map.addLayer(clusterRef.current);
    
    return () => {
      map.removeLayer(clusterRef.current);
      markersRef.current.clear();
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, [properties, map, selectedProperty, handleMarkerClick, createCustomIcon, hoveredProperty, clickedProperty, isMobile, calculateCardPosition, setHoveredProperty, setCardPosition]);

  return null;
};

const MapView = ({ 
  properties = [], 
  selectedProperty, 
  onPropertySelect,
  isMobile = false,
  isExpanded = false // New prop for flexible sizing
}) => {
  // Dar es Salaam region bounds
  const DAR_ES_SALAAM_BOUNDS = {
    north: -6.0,
    south: -7.5,
    east: 39.8,
    west: 38.5,
    center: { lat: -6.7924, lng: 39.2083 }
  };

  const [mapCenter, setMapCenter] = useState(DAR_ES_SALAAM_BOUNDS.center);
  const [zoom, setZoom] = useState(11);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [hoveredProperty, setHoveredProperty] = useState(null);
  const [clickedProperty, setClickedProperty] = useState(null);
  const [cardPosition, setCardPosition] = useState({ x: 0, y: 0 });
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const { showToast } = useToast();
  const { accessToken, user } = useAuth();
  const { isPropertySaved, handleToggleFavorite } = useFavorites();

  // Calculate map bounds based on properties with proper zoom for details
  useEffect(() => {
    if (properties.length > 0) {
      const validProperties = properties.filter(p => 
        p.coordinates && 
        p.coordinates.lat && 
        p.coordinates.lng &&
        p.coordinates.lat >= DAR_ES_SALAAM_BOUNDS.south &&
        p.coordinates.lat <= DAR_ES_SALAAM_BOUNDS.north &&
        p.coordinates.lng >= DAR_ES_SALAAM_BOUNDS.west &&
        p.coordinates.lng <= DAR_ES_SALAAM_BOUNDS.east
      );

      if (validProperties.length > 0) {
        const lats = validProperties.map(p => p.coordinates.lat);
        const lngs = validProperties.map(p => p.coordinates.lng);
        
        const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
        const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
        
        const boundedLat = Math.max(DAR_ES_SALAAM_BOUNDS.south, Math.min(DAR_ES_SALAAM_BOUNDS.north, centerLat));
        const boundedLng = Math.max(DAR_ES_SALAAM_BOUNDS.west, Math.min(DAR_ES_SALAAM_BOUNDS.east, centerLng));
        
        setMapCenter({ lat: boundedLat, lng: boundedLng });
        
        // Better zoom calculation for property details visibility
        const latSpread = Math.max(...lats) - Math.min(...lats);
        const lngSpread = Math.max(...lngs) - Math.min(...lngs);
        const maxSpread = Math.max(latSpread, lngSpread);
        
        if (maxSpread > 0.8) setZoom(10);
        else if (maxSpread > 0.4) setZoom(11);
        else if (maxSpread > 0.2) setZoom(12);
        else if (maxSpread > 0.1) setZoom(13);
        else if (maxSpread > 0.05) setZoom(14);
        else setZoom(15);
      } else {
        setMapCenter(DAR_ES_SALAAM_BOUNDS.center);
        setZoom(11);
      }
    }
    setMapLoaded(true);
  }, [properties]);

  // Smart card positioning to keep within map bounds
  const calculateCardPosition = useCallback((markerElement, property) => {
    if (!mapContainerRef.current || !markerElement) return { x: 0, y: 0 };

    const mapRect = mapContainerRef.current.getBoundingClientRect();
    const markerRect = markerElement.getBoundingClientRect();
    
    // Card dimensions
    const cardWidth = 260;
    const cardHeight = 220;
    const padding = 16;

    // Marker position relative to map
    const markerX = markerRect.left - mapRect.left + markerRect.width / 2;
    const markerY = markerRect.top - mapRect.top;

    let cardX = markerX - cardWidth / 2;
    let cardY = markerY - cardHeight - 12; // Above marker by default

    // For mobile: Keep cards strictly within container bounds
    if (isMobile) {
      // Horizontal bounds checking - strict
      if (cardX < padding) {
        cardX = padding;
      } else if (cardX + cardWidth > mapRect.width - padding) {
        cardX = mapRect.width - cardWidth - padding;
      }

      // Vertical bounds checking - strict
      if (cardY < padding) {
        cardY = markerY + 40; // Below marker if no space above
      }
      if (cardY + cardHeight > mapRect.height - padding) {
        cardY = mapRect.height - cardHeight - padding;
      }
    } else {
      // For wide screens: Allow overflow for better visibility
      // Horizontal positioning - can overflow if needed for better visibility
      if (cardX < -50) { // Allow some overflow
        cardX = -50;
      } else if (cardX + cardWidth > mapRect.width + 50) {
        cardX = mapRect.width + 50 - cardWidth;
      }

      // Vertical positioning - prefer above marker, but allow overflow
      if (cardY < -20) { // Allow some overflow at top
        cardY = markerY + 40; // Move below marker
      }
    }

    return { x: cardX, y: cardY };
  }, [isMobile]);

  // Format price for display
  const formatPrice = (price) => {
    const numPrice = parseFloat(price) || 0;
    if (numPrice >= 1000000000) {
      return `${(numPrice / 1000000000).toFixed(1)}B`;
    } else if (numPrice >= 1000000) {
      return `${(numPrice / 1000000).toFixed(1)}M`;
    } else if (numPrice >= 1000) {
      return `${(numPrice / 1000).toFixed(0)}K`;
    } else {
      return `${numPrice}`;
    }
  };

  // Format full price for cards
  const formatFullPrice = (price) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getValidProperties = () => {
    return properties.map(property => {
      let coordinates = property.coordinates;
      
      if (!coordinates || !coordinates.lat || !coordinates.lng ||
          coordinates.lat < DAR_ES_SALAAM_BOUNDS.south || coordinates.lat > DAR_ES_SALAAM_BOUNDS.north ||
          coordinates.lng < DAR_ES_SALAAM_BOUNDS.west || coordinates.lng > DAR_ES_SALAAM_BOUNDS.east) {
        
        const randomLat = DAR_ES_SALAAM_BOUNDS.south + 
          Math.random() * (DAR_ES_SALAAM_BOUNDS.north - DAR_ES_SALAAM_BOUNDS.south);
        const randomLng = DAR_ES_SALAAM_BOUNDS.west + 
          Math.random() * (DAR_ES_SALAAM_BOUNDS.east - DAR_ES_SALAAM_BOUNDS.west);
        
        coordinates = { lat: randomLat, lng: randomLng };
      }
      
      return { ...property, coordinates };
    });
  };

  // Handle save functionality
  const handleSave = async (e, property) => {
    e.preventDefault();
    e.stopPropagation();
    await handleToggleFavorite(property.id);
  };

  const validProperties = getValidProperties();

  // Handle marker interactions - Updated for better stability
  const handleMarkerClick = useCallback((property, event, type = 'click') => {
    event?.originalEvent?.stopPropagation();
    
    if (type === 'hover' && !isMobile) {
      // For hover on wide screens - only set if different property
      if (hoveredProperty?.id !== property.id) {
        setHoveredProperty(property);
        setClickedProperty(null);
      }
    } else if (type === 'click') {
      // For click on all devices
      setClickedProperty(clickedProperty?.id === property.id ? null : property);
      setHoveredProperty(null);
    }
    
    if (onPropertySelect) {
      onPropertySelect(property);
    }

    // Calculate position for the property
    if (event?.target?._icon) {
      const position = calculateCardPosition(event.target._icon, property);
      setCardPosition(position);
    }
  }, [clickedProperty, hoveredProperty, onPropertySelect, calculateCardPosition, isMobile]);

  // Handle map click to close cards
  const handleMapClick = useCallback(() => {
    setClickedProperty(null);
    setHoveredProperty(null);
  }, []);

  // Map controls
  const handleZoomIn = (map) => {
    map.zoomIn();
  };

  const handleZoomOut = (map) => {
    map.zoomOut();
  };

  const handleResetView = (map) => {
    map.flyTo([DAR_ES_SALAAM_BOUNDS.center.lat, DAR_ES_SALAAM_BOUNDS.center.lng], 11, {
      duration: 1
    });
  };

  // Custom marker icon creation with better design
  const createCustomIcon = (property, isSelected) => {
    const isActive = clickedProperty?.id === property.id || hoveredProperty?.id === property.id;
    const price = formatPrice(property.price);
    
    // Calculate width based on text length
    const baseWidth = 50;
    const textLength = price.length;
    const width = Math.max(baseWidth, textLength * 8 + 16);
    const height = 28;

    const iconHtml = `
      <div class="relative flex items-center justify-center rounded-full shadow-lg border-2 border-white 
                  transition-all duration-300 ease-out transform
                  ${isActive ? 'bg-accent ring-4 ring-accent/30 scale-110' : 
                    isSelected ? 'bg-primary ring-2 ring-primary/30 scale-105' : 
                    'bg-primary hover:bg-primary-600 hover:scale-105'}" 
           style="width:${width}px; height:${height}px; min-width:${baseWidth}px;">
        <span class="text-white text-xs font-bold whitespace-nowrap px-2">
          ${price}
        </span>
        ${isActive ? '<div class="absolute inset-0 w-full h-full bg-accent rounded-full animate-ping opacity-25"></div>' : ''}
      </div>
      <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
        <div class="w-3 h-3 bg-white rounded-full border-2 border-primary shadow-sm"></div>
      </div>
    `;

    return L.divIcon({
      html: iconHtml,
      className: 'custom-marker-icon',
      iconSize: [width, height + 6], // Add extra height for the pin point
      iconAnchor: [width / 2, height + 6] // Anchor at the bottom point
    });
  };

  const activeProperty = clickedProperty || hoveredProperty;

  return (
    <div 
      ref={mapContainerRef}
      className="relative bg-secondary-100 overflow-hidden w-full h-[80vh] rounded-md"
      onClick={handleMapClick}
    >
      {/* Map Container */}
      <MapContainer
        ref={mapRef}
        center={[mapCenter.lat, mapCenter.lng]}
        zoom={zoom}
        scrollWheelZoom={true}
        zoomControl={false} // Disable default zoom control
        className="w-full h-full relative z-0"
        whenCreated={mapInstance => {
          mapRef.current = mapInstance;
          setMapLoaded(true);
          
          // Prevent scroll wheel zoom when scrolling over UI elements
          mapInstance.on('wheel', (e) => {
            if (e.originalEvent.target.closest('.leaflet-control-container') ||
                e.originalEvent.target.closest('.absolute')) {
              e.originalEvent.preventDefault();
            }
          });
        }}
      >
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Marker Cluster Group */}
        <MarkerClusterGroup
          properties={validProperties}
          selectedProperty={selectedProperty}
          onPropertySelect={onPropertySelect}
          createCustomIcon={createCustomIcon}
          handleMarkerClick={handleMarkerClick}
          hoveredProperty={hoveredProperty}
          setHoveredProperty={setHoveredProperty}
          clickedProperty={clickedProperty}
          setClickedProperty={setClickedProperty}
          cardPosition={cardPosition}
          setCardPosition={setCardPosition}
          calculateCardPosition={calculateCardPosition}
          isMobile={isMobile}
        />
        
        <MapControls 
          mapCenter={mapCenter} 
          zoom={zoom} 
          handleResetView={handleResetView}
          handleZoomIn={handleZoomIn}
          handleZoomOut={handleZoomOut}
        />
      </MapContainer>

      {/* Property Card Popup */}
      {activeProperty && (
        <div
          className={`absolute z-[1001] pointer-events-auto property-card-popup ${
            isMobile ? '' : 'overflow-visible'
          }`}
          style={{
            left: `${cardPosition.x}px`,
            top: `${cardPosition.y}px`,
            maxWidth: '260px'
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseEnter={() => {
            // Keep the card visible when hovering over it
            if (!isMobile && hoveredProperty) {
              setHoveredProperty(activeProperty);
            }
          }}
          onMouseLeave={() => {
            // Hide card when leaving it (for hover state)
            if (!isMobile && hoveredProperty && !clickedProperty) {
              setTimeout(() => {
                setHoveredProperty(null);
              }, 100);
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden transform transition-all duration-200 scale-100">
            {/* Property Image */}
            <div className="relative h-28 overflow-hidden">
              <Image
                src={activeProperty.images?.[0] || "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop"}
                alt={activeProperty.title}
                className="w-full h-full object-cover"
              />
              
              {/* Save Button */}
              <button
                onClick={(e) => handleSave(e, activeProperty)}
                className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm
                           transition-all duration-200 ease-out ${
                             isPropertySaved(activeProperty.id)
                               ? 'bg-error text-white'
                               : 'bg-black/50 text-white hover:bg-black/70'
                           }`}
                aria-label="Save property"
              >
                <Icon
                  name="Heart"
                  size={12}
                  fill={isPropertySaved(activeProperty.id) ? 'currentColor' : 'none'}
                />
              </button>

              {/* Status Badge */}
              {activeProperty.status && (
                <div className="absolute top-2 left-2">
                  <StatusBadge status={activeProperty.status} size="sm" />
                </div>
              )}

              {/* New Badge */}
              {activeProperty.daysOnMarket <= 7 && (
                <div className="absolute top-2 left-2 bg-success text-white px-2 py-1 rounded-md text-xs font-medium">
                  New
                </div>
              )}

              {/* Price Badge */}
              <div className="absolute bottom-2 left-2 bg-primary text-white px-2 py-1 rounded-md text-xs font-bold shadow-lg">
                {formatFullPrice(activeProperty.price)}
              </div>
            </div>

            {/* Property Details */}
            <div className="p-3 space-y-2">
              <h4 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">
                {activeProperty.title}
              </h4>
              
              <p className="text-xs text-gray-600 line-clamp-1 flex items-center">
                <Icon name="MapPin" size={10} className="mr-1 flex-shrink-0" />
                <span className="truncate">
                  {activeProperty.address?.length > 30 
                    ? `${activeProperty.address.substring(0, 30)}...` 
                    : activeProperty.address
                  }
                </span>
              </p>

              {/* Property Features */}
              <div className="flex items-center space-x-3 text-xs text-gray-500">
                {activeProperty.bedrooms > 0 && (
                  <div className="flex items-center space-x-1">
                    <Icon name="Bed" size={10} className="text-primary" />
                    <span>{activeProperty.bedrooms}</span>
                  </div>
                )}
                {activeProperty.bathrooms > 0 && (
                  <div className="flex items-center space-x-1">
                    <Icon name="Bath" size={10} className="text-primary" />
                    <span>{activeProperty.bathrooms}</span>
                  </div>
                )}
                {activeProperty.sqft > 0 && (
                  <div className="flex items-center space-x-1">
                    <Icon name="Square" size={10} className="text-primary" />
                    <span>{activeProperty.sqft}</span>
                  </div>
                )}
              </div>

              {/* View Property Button */}
              <Link
                to={`/property-details?id=${activeProperty.id}`}
                className="block w-full bg-primary text-white text-center py-2 px-3 rounded-md text-xs font-medium hover:bg-primary-700 transition-colors duration-200 mt-3"
                onClick={(e) => e.stopPropagation()}
              >
                View Property
              </Link>
            </div>

            {/* Card Pointer */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2">
              <div className="w-0 h-0 border-l-6 border-r-6 border-b-6 border-l-transparent border-r-transparent border-b-white drop-shadow-sm"></div>
            </div>
          </div>
        </div>
      )}

      {/* Map Info Panel */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-surface/95 backdrop-blur-md rounded-lg shadow-elevation-2 
                    border border-border px-3 py-2">
        <div className="flex items-center space-x-2 text-xs text-text-secondary">
          <Icon name="MapPin" size={14} className="text-primary" />
          <span className="font-medium">{validProperties.length}</span>
          <span>properties in Dar es Salaam</span>
        </div>
      </div>

      {/* Mobile: Back to List Button */}
      {isMobile && (
        <div className="absolute bottom-4 right-4 z-[1000]">
          <button className="bg-primary text-white px-4 py-2.5 rounded-full 
                           shadow-elevation-3 text-sm font-medium
                           hover:bg-primary-700 transition-all duration-200 ease-out
                           transform hover:scale-105 flex items-center space-x-2">
            <Icon name="List" size={14} />
            <span>Back to List</span>
          </button>
        </div>
      )}

      {/* Loading Overlay */}
      {!mapLoaded && (
        <div className="absolute inset-0 z-[1001] bg-surface/90 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full 
                          animate-spin mx-auto mb-3"></div>
            <p className="text-text-secondary text-sm">Loading Dar es Salaam map...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;