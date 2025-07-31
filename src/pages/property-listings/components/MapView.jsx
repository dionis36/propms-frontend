import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const MapView = ({ 
  properties = [], 
  selectedProperty, 
  onPropertySelect,
  isMobile = false 
}) => {
  const [mapCenter, setMapCenter] = useState({ lat: 40.7128, lng: -74.0060 });
  const [zoom, setZoom] = useState(11);
  const [hoveredProperty, setHoveredProperty] = useState(null);

  // Calculate map bounds based on properties
  useEffect(() => {
    if (properties.length > 0) {
      const lats = properties.map(p => p.coordinates.lat);
      const lngs = properties.map(p => p.coordinates.lng);
      
      const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
      const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
      
      setMapCenter({ lat: centerLat, lng: centerLng });
    }
  }, [properties]);

  const handleMarkerClick = (property) => {
    if (onPropertySelect) {
      onPropertySelect(property);
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 1, 18));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 1, 8));
  };

  return (
    <div className="relative h-full bg-secondary-100">
      {/* Map Container */}
      <div className="w-full h-full relative overflow-hidden">
        {/* Google Maps Iframe */}
        <iframe
          width="100%"
          height="100%"
          loading="lazy"
          title="Property Map"
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://www.google.com/maps?q=${mapCenter.lat},${mapCenter.lng}&z=${zoom}&output=embed`}
          className="absolute inset-0"
        />

        {/* Property Markers Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {properties.map((property) => {
            // Calculate marker position (simplified positioning)
            const markerStyle = {
              position: 'absolute',
              left: `${20 + (property.id * 15) % 60}%`,
              top: `${20 + (property.id * 12) % 60}%`,
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'auto',
              zIndex: selectedProperty?.id === property.id ? 20 : 10
            };

            return (
              <div
                key={property.id}
                style={markerStyle}
                className="relative transition-transform duration-200 ease-out"
              >
                {/* Minimal Dot Marker */}
                <button
                  onClick={() => handleMarkerClick(property)}
                  onMouseEnter={() => setHoveredProperty(property)}
                  onMouseLeave={() => setHoveredProperty(null)}
                  className={`w-4 h-4 rounded-full shadow-md transform transition-all duration-200
                    ${selectedProperty?.id === property.id 
                      ? 'bg-primary scale-150 ring-2 ring-white' 
                      : hoveredProperty?.id === property.id 
                      ? 'bg-accent scale-125' 
                      : 'bg-surface'}`}
                />

                {/* Property Card Popup */}
                {(hoveredProperty?.id === property.id || selectedProperty?.id === property.id) && (
                  <div className="absolute bottom-full mb-3 left-1/2 transform -translate-x-1/2 
                                w-56 bg-surface rounded-lg shadow-elevation-4 border border-border
                                z-dropdown">
                    <div className="p-3">
                      {/* Property Image */}
                      <div className="relative h-32 mb-2 overflow-hidden rounded-md">
                        <Image
                          src={property.images[0]}
                          alt={property.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Property Details */}
                      <div>
                        <h4 className="font-semibold text-text-primary text-sm mb-1 truncate">
                          {property.title}
                        </h4>
                        <p className="text-lg font-bold text-primary mb-1">
                          ${property.price.toLocaleString()}
                        </p>
                        <p className="text-xs text-text-secondary mb-2 truncate">
                          {property.address}
                        </p>

                        {/* Property Features */}
                        <div className="flex items-center space-x-3 text-xs text-text-secondary">
                          <div className="flex items-center space-x-1">
                            <Icon name="Bed" size={12} className="text-primary" />
                            <span>{property.bedrooms}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Icon name="Bath" size={12} className="text-primary" />
                            <span>{property.bathrooms}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Icon name="Square" size={12} className="text-primary" />
                            <span>{property.sqft}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Popup Arrow */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                      <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 
                                    border-l-transparent border-r-transparent border-t-surface"></div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Map Controls */}
        <div className="absolute top-4 right-4 flex flex-col space-y-2">
          {/* Zoom Controls */}
          <div className="bg-surface/90 backdrop-blur-sm rounded-md shadow-elevation-1 border border-border/50 overflow-hidden">
            <button
              onClick={handleZoomIn}
              className="block w-8 h-8 flex items-center justify-center text-text-primary 
                       hover:bg-secondary-100 transition-colors duration-200"
            >
              <Icon name="Plus" size={14} />
            </button>
            <div className="border-t border-border/50"></div>
            <button
              onClick={handleZoomOut}
              className="block w-8 h-8 flex items-center justify-center text-text-primary 
                       hover:bg-secondary-100 transition-colors duration-200"
            >
              <Icon name="Minus" size={14} />
            </button>
          </div>
        </div>

        {/* Mobile: Back to List Button */}
        {isMobile && (
          <div className="absolute bottom-4 right-4">
            <button className="bg-primary text-white px-4 py-2 rounded-full 
                             shadow-elevation-2 text-sm font-medium
                             hover:bg-primary-700 transition-all duration-200 ease-out
                             micro-interaction">
              <Icon name="List" size={14} className="inline mr-2" />
              Back to List
            </button>
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {properties.length === 0 && (
        <div className="absolute inset-0 bg-surface/80 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full 
                          animate-spin mx-auto mb-3"></div>
            <p className="text-text-secondary text-sm">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
};


export default MapView;