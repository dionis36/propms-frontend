import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const MapView = ({ 
  properties = [], 
  selectedProperty, 
  onPropertySelect,
  isMobile = false 
}) => {
  const [mapCenter, setMapCenter] = useState({ lat: -6.7924, lng: 39.2083 }); // Dar es Salaam center
  const [zoom, setZoom] = useState(11);
  const [hoveredProperty, setHoveredProperty] = useState(null);
  const [clickedProperty, setClickedProperty] = useState(null);
  const [mapBounds, setMapBounds] = useState(null);
  const mapContainerRef = useRef(null);
  const [cardPosition, setCardPosition] = useState({ x: 0, y: 0 });
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Dar es Salaam region bounds
  const DAR_ES_SALAAM_BOUNDS = {
    north: -6.36,
    south: -7.20,
    east: 39.58,
    west: 38.88
  };

  // Calculate map bounds and center based on properties with Dar es Salaam fallback
  const calculateMapBounds = useCallback(() => {
    if (properties.length === 0) {
      setMapCenter({ lat: -6.7924, lng: 39.2083 });
      setZoom(11);
      return;
    }

    // Filter properties within Dar es Salaam bounds or use fallback coordinates
    const validProperties = properties.map(property => {
      let lat = parseFloat(property.coordinates.lat);
      let lng = parseFloat(property.coordinates.lng);

      // Check if coordinates are within Dar es Salaam bounds
      const isWithinBounds = lat >= DAR_ES_SALAAM_BOUNDS.south && 
                            lat <= DAR_ES_SALAAM_BOUNDS.north &&
                            lng >= DAR_ES_SALAAM_BOUNDS.west && 
                            lng <= DAR_ES_SALAAM_BOUNDS.east;

      if (!isWithinBounds || lat === 0 || lng === 0) {
        // Generate random coordinates within Dar es Salaam bounds as fallback
        lat = DAR_ES_SALAAM_BOUNDS.south + Math.random() * (DAR_ES_SALAAM_BOUNDS.north - DAR_ES_SALAAM_BOUNDS.south);
        lng = DAR_ES_SALAAM_BOUNDS.west + Math.random() * (DAR_ES_SALAAM_BOUNDS.east - DAR_ES_SALAAM_BOUNDS.west);
      }

      return { ...property, coordinates: { lat, lng } };
    });

    if (validProperties.length > 0) {
      const lats = validProperties.map(p => p.coordinates.lat);
      const lngs = validProperties.map(p => p.coordinates.lng);
      
      const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
      const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
      
      // Calculate appropriate zoom level based on bounds
      const latDiff = Math.max(...lats) - Math.min(...lats);
      const lngDiff = Math.max(...lngs) - Math.min(...lngs);
      const maxDiff = Math.max(latDiff, lngDiff);
      
      let newZoom = 11;
      if (maxDiff > 0.5) newZoom = 9;
      else if (maxDiff > 0.2) newZoom = 10;
      else if (maxDiff > 0.1) newZoom = 11;
      else if (maxDiff > 0.05) newZoom = 12;
      else newZoom = 13;
      
      setMapCenter({ lat: centerLat, lng: centerLng });
      setZoom(newZoom);
      setMapBounds({
        north: Math.max(...lats) + 0.01,
        south: Math.min(...lats) - 0.01,
        east: Math.max(...lngs) + 0.01,
        west: Math.min(...lngs) - 0.01
      });
    }
  }, [properties]);

  // Recalculate bounds when properties change (for filter updates)
  useEffect(() => {
    calculateMapBounds();
  }, [calculateMapBounds]);

  // Smart card positioning to keep within map bounds
  const calculateCardPosition = useCallback((markerElement, property) => {
    if (!mapContainerRef.current || !markerElement) return { x: 0, y: 0 };

    const mapRect = mapContainerRef.current.getBoundingClientRect();
    const markerRect = markerElement.getBoundingClientRect();
    
    // Card dimensions (estimated)
    const cardWidth = 280;
    const cardHeight = 240;
    const padding = 16;

    // Marker position relative to map
    const markerX = markerRect.left - mapRect.left + markerRect.width / 2;
    const markerY = markerRect.top - mapRect.top;

    let cardX = markerX - cardWidth / 2;
    let cardY = markerY - cardHeight - 12; // Above marker by default

    // Horizontal bounds checking
    if (cardX < padding) {
      cardX = padding; // Left edge
    } else if (cardX + cardWidth > mapRect.width - padding) {
      cardX = mapRect.width - cardWidth - padding; // Right edge
    }

    // Vertical bounds checking
    if (cardY < padding) {
      cardY = markerY + 40; // Below marker if no space above
    }

    // Ensure card doesn't go below map
    if (cardY + cardHeight > mapRect.height - padding) {
      cardY = mapRect.height - cardHeight - padding;
    }

    return { x: cardX, y: cardY };
  }, []);

  const handleMarkerClick = useCallback((property, event) => {
    event?.stopPropagation();
    setClickedProperty(clickedProperty?.id === property.id ? null : property);
    setHoveredProperty(null);
    
    if (onPropertySelect) {
      onPropertySelect(property);
    }

    // Calculate position for clicked property
    if (event?.currentTarget) {
      const position = calculateCardPosition(event.currentTarget, property);
      setCardPosition(position);
    }
  }, [clickedProperty, onPropertySelect, calculateCardPosition]);

  const handleMarkerHover = useCallback((property, event, isEntering) => {
    if (clickedProperty) return; // Don't show hover if something is clicked

    if (isEntering) {
      setHoveredProperty(property);
      if (event?.currentTarget) {
        const position = calculateCardPosition(event.currentTarget, property);
        setCardPosition(position);
      }
    } else {
      setHoveredProperty(null);
    }
  }, [clickedProperty, calculateCardPosition]);

  const handleMapClick = useCallback(() => {
    setClickedProperty(null);
    setHoveredProperty(null);
  }, []);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 1, 18));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 1, 8));
  };

  const resetView = () => {
    calculateMapBounds();
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Convert lat/lng to pixel position (simplified)
  const getMarkerPosition = (property) => {
    if (!mapBounds) return { left: '50%', top: '50%' };

    const lat = property.coordinates.lat;
    const lng = property.coordinates.lng;

    // Simple projection within map bounds
    const x = ((lng - mapBounds.west) / (mapBounds.east - mapBounds.west)) * 100;
    const y = ((mapBounds.north - lat) / (mapBounds.north - mapBounds.south)) * 100;

    return {
      left: `${Math.max(5, Math.min(95, x))}%`,
      top: `${Math.max(5, Math.min(95, y))}%`
    };
  };

  const activeProperty = clickedProperty || hoveredProperty;

  return (
    <div ref={mapContainerRef} className="relative h-full bg-secondary-100 overflow-hidden">
      {/* Google Maps Iframe */}
      <iframe
        width="100%"
        height="100%"
        loading="lazy"
        title="Dar es Salaam Property Map"
        referrerPolicy="no-referrer-when-downgrade"
        src={`https://www.google.com/maps?q=${mapCenter.lat},${mapCenter.lng}&z=${zoom}&output=embed&t=roadmap`}
        className="absolute inset-0 transition-all duration-500"
        onLoad={() => setIsMapLoaded(true)}
      />

      {/* Property Markers Overlay */}
      <div className="absolute inset-0 pointer-events-none" onClick={handleMapClick}>
        {properties.map((property, index) => {
          const markerStyle = getMarkerPosition(property);
          const isActive = activeProperty?.id === property.id;
          const isSelected = selectedProperty?.id === property.id;

          return (
            <div
              key={property.id}
              style={{
                position: 'absolute',
                ...markerStyle,
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'auto',
                zIndex: isActive ? 30 : isSelected ? 20 : 10 + index
              }}
              className="transition-all duration-200 ease-out"
            >
              {/* Enhanced Marker */}
              <div
                className={`relative cursor-pointer transition-all duration-200 transform ${
                  isActive ? 'scale-150 z-30' : isSelected ? 'scale-125 z-20' : 'hover:scale-110'
                }`}
                onClick={(e) => handleMarkerClick(property, e)}
                onMouseEnter={(e) => !isMobile && handleMarkerHover(property, e, true)}
                onMouseLeave={(e) => !isMobile && handleMarkerHover(property, e, false)}
              >
                {/* Marker Shadow */}
                <div className="absolute inset-0 bg-black/20 rounded-full transform translate-y-1 blur-sm"></div>
                
                {/* Main Marker */}
                <div className={`relative w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold transition-all duration-200 ${
                  isActive ? 'bg-accent ring-4 ring-accent/30' :
                  isSelected ? 'bg-primary ring-2 ring-primary/30' : 
                  'bg-primary hover:bg-primary-600'
                }`}>
                  {formatPrice(property.price).replace(/[TZS,]/g, '').slice(0, -3)}K
                </div>

                {/* Marker Pulse Animation */}
                {isActive && (
                  <div className="absolute inset-0 w-8 h-8 bg-accent rounded-full animate-ping opacity-25"></div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Property Card Popup */}
      {activeProperty && (
        <div
          className="absolute z-40 w-70 pointer-events-auto"
          style={{
            left: `${cardPosition.x}px`,
            top: `${cardPosition.y}px`,
            maxWidth: '280px'
          }}
        >
          <div className="bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden transform transition-all duration-200 scale-100">
            {/* Property Image */}
            <div className="relative h-32 overflow-hidden">
              <Image
                src={activeProperty.images?.[0] || "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop"}
                alt={activeProperty.title}
                className="w-full h-full object-cover"
              />
              
              {/* Quick Actions */}
              <div className="absolute top-2 right-2 flex space-x-1">
                <button className="w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors">
                  <Icon name="Heart" size={12} />
                </button>
              </div>

              {/* Price Badge */}
              <div className="absolute bottom-2 left-2 bg-primary text-white px-2 py-1 rounded-md text-sm font-bold shadow-lg">
                {formatPrice(activeProperty.price)}
              </div>
            </div>

            {/* Property Details */}
            <div className="p-3 space-y-2">
              <h4 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">
                {activeProperty.title}
              </h4>
              
              <p className="text-xs text-gray-600 line-clamp-1 flex items-center">
                <Icon name="MapPin" size={12} className="mr-1 flex-shrink-0" />
                {activeProperty.address}
              </p>

              {/* Property Features */}
              <div className="flex items-center space-x-3 text-xs text-gray-500">
                {activeProperty.bedrooms > 0 && (
                  <div className="flex items-center space-x-1">
                    <Icon name="Bed" size={12} className="text-primary" />
                    <span>{activeProperty.bedrooms}</span>
                  </div>
                )}
                {activeProperty.bathrooms > 0 && (
                  <div className="flex items-center space-x-1">
                    <Icon name="Bath" size={12} className="text-primary" />
                    <span>{activeProperty.bathrooms}</span>
                  </div>
                )}
                {activeProperty.sqft > 0 && (
                  <div className="flex items-center space-x-1">
                    <Icon name="Square" size={12} className="text-primary" />
                    <span>{activeProperty.sqft}</span>
                  </div>
                )}
              </div>

              {/* Agent Info */}
              {activeProperty.agent?.name && (
                <div className="flex items-center space-x-2 pt-2 border-t border-gray-100">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                    <Icon name="User" size={10} className="text-primary" />
                  </div>
                  <span className="text-xs text-gray-600 flex-1 truncate">
                    {activeProperty.agent.name}
                  </span>
                  {activeProperty.agent.phone && (
                    <a 
                      href={`tel:${activeProperty.agent.phone}`}
                      className="text-xs text-primary hover:text-primary-700"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Icon name="Phone" size={12} />
                    </a>
                  )}
                </div>
              )}

              {/* View Property Button */}
              <Link
                to={`/property-details?id=${activeProperty.id}`}
                className="block w-full bg-primary text-white text-center py-2 px-3 rounded-md text-sm font-medium hover:bg-primary-700 transition-colors duration-200 mt-3"
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

      {/* Enhanced Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2 pointer-events-auto">
        {/* Zoom Controls */}
        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <button
            onClick={handleZoomIn}
            className="block w-10 h-10 flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors duration-200 border-b border-gray-200"
            title="Zoom in"
          >
            <Icon name="Plus" size={16} />
          </button>
          <button
            onClick={handleZoomOut}
            className="block w-10 h-10 flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors duration-200"
            title="Zoom out"
          >
            <Icon name="Minus" size={16} />
          </button>
        </div>

        {/* Additional Controls */}
        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <button
            onClick={resetView}
            className="block w-10 h-10 flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors duration-200 border-b border-gray-200"
            title="Reset view"
          >
            <Icon name="Home" size={16} />
          </button>
          <button
            className="block w-10 h-10 flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors duration-200"
            title="Current location"
          >
            <Icon name="MapPin" size={16} />
          </button>
        </div>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-3 pointer-events-auto">
        <div className="text-xs text-gray-600 space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-primary rounded-full"></div>
            <span>Available Properties ({properties.length})</span>
          </div>
          {selectedProperty && (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-accent rounded-full"></div>
              <span>Selected Property</span>
            </div>
          )}
        </div>
      </div>

      {/* Loading Overlay */}
      {!isMapLoaded && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-600 text-sm">Loading Dar es Salaam map...</p>
          </div>
        </div>
      )}

      {/* No Properties Message */}
      {properties.length === 0 && isMapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/90">
          <div className="text-center p-6">
            <Icon name="MapPin" size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Properties Found</h3>
            <p className="text-gray-600 text-sm">Adjust your filters to see properties on the map</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;
