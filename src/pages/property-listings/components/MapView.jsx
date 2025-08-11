import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
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

  // Expose the map instance for the parent component to use
  useEffect(() => {
    // We can use a ref to make the map instance available to parent component if needed
    // This example keeps control local to this component for simplicity
  }, [map]);

  return (
    <>
      {/* Enhanced Map Controls */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col space-y-2">
        {/* Zoom Controls */}
        <div className="bg-surface/95 backdrop-blur-md rounded-lg shadow-elevation-2 border border-border overflow-hidden">
          <button
            onClick={() => handleZoomIn(map)}
            className="block w-10 h-10 flex items-center justify-center text-text-primary 
                       hover:bg-primary hover:text-white transition-all duration-200 ease-out"
            title="Zoom in"
          >
            <Icon name="Plus" size={16} />
          </button>
          <div className="border-t border-border"></div>
          <button
            onClick={() => handleZoomOut(map)}
            className="block w-10 h-10 flex items-center justify-center text-text-primary 
                       hover:bg-primary hover:text-white transition-all duration-200 ease-out"
            title="Zoom out"
          >
            <Icon name="Minus" size={16} />
          </button>
        </div>

        {/* Additional Controls */}
        <div className="bg-surface/95 backdrop-blur-md rounded-lg shadow-elevation-2 border border-border">
          <button
            onClick={() => handleResetView(map)}
            className="block w-10 h-10 flex items-center justify-center text-text-primary 
                       hover:bg-primary hover:text-white transition-all duration-200 ease-out"
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
const MarkerClusterGroup = ({ properties, selectedProperty, onPropertySelect, createCustomIcon, handleMarkerClick }) => {
  const map = useMap();
  const clusterRef = useRef(L.markerClusterGroup());

  useEffect(() => {
    clusterRef.current.clearLayers();
    properties.forEach(property => {
      const isSelected = selectedProperty?.id === property.id;
      const marker = L.marker([property.coordinates.lat, property.coordinates.lng], {
        icon: createCustomIcon(property, isSelected)
      }).on('click', () => handleMarkerClick(property));

      // Create and attach a popup
      const popupContent = `
        <div class="w-70 bg-surface rounded-xl shadow-elevation-4 border border-border overflow-hidden">
          <!-- Property Image -->
          <div class="relative h-32 overflow-hidden">
            <img 
              src="${property.images?.[0] || 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'}"
              alt="${property.title}"
              class="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
            <!-- Status badge -->
            ${property.status ? `<div class="absolute top-2 left-2 bg-success text-white px-2 py-1 rounded-md text-xs font-medium">${property.status}</div>` : ''}
          </div>
          <!-- Property Details -->
          <div class="p-4">
            <div class="mb-3">
              <h4 class="font-semibold text-text-primary text-sm mb-1 line-clamp-2 leading-tight">
                ${property.title}
              </h4>
              <p class="text-lg font-bold text-primary mb-1">
                ${new Intl.NumberFormat('en-TZ', { style: 'currency', currency: 'TZS', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(property.price)}
              </p>
              <p class="text-xs text-text-secondary line-clamp-1 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin mr-1 text-primary"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                ${property.address}
              </p>
            </div>
            <!-- Property Features -->
            <div class="flex items-center justify-between mb-4 text-xs text-text-secondary">
              <div class="flex items-center space-x-3">
                ${property.bedrooms > 0 ? `<div class="flex items-center space-x-1"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bed text-primary"><path d="M2 4v2"/><path d="M2 10v2"/><path d="M20 4v2"/><path d="M20 10v2"/><path d="M22 6h-6"/><path d="M16 10h-2"/><path d="M12 6h-2"/><path d="M10 10H8"/><path d="M8 6H2"/><path d="M22 10H16"/><path d="M16 14v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-4"/><path d="M12 14v4a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-4"/></svg><span>${property.bedrooms}</span></div>` : ''}
                ${property.bathrooms > 0 ? `<div class="flex items-center space-x-1"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bath text-primary"><path d="M9 6a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-.5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2H9Z"/><path d="M18 10V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h4a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H4"/><path d="M2 18h20"/><path d="M18 22v-4a2 2 0 0 1 2-2h2"/></svg><span>${property.bathrooms}</span></div>` : ''}
                ${property.sqft > 0 ? `<div class="flex items-center space-x-1"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square text-primary"><rect width="18" height="18" x="3" y="3" rx="2"/></svg><span>${property.sqft}</span></div>` : ''}
              </div>
              <!-- Days on market -->
              ${property.daysOnMarket <= 7 ? `<span class="bg-success/10 text-success px-2 py-1 rounded-full text-xs font-medium">New</span>` : ''}
            </div>
            <!-- Agent Info -->
            ${property.agent?.name ? `
              <div class="flex items-center justify-between pt-3 border-t border-border mb-3">
                <div class="flex items-center space-x-2">
                  <div class="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-semibold">
                    ${property.agent.name.charAt(0)}
                  </div>
                  <div>
                    <p class="text-xs font-medium text-text-primary">${property.agent.name}</p>
                    ${property.agent.phone ? `<p class="text-xs text-text-secondary">${property.agent.phone}</p>` : ''}
                  </div>
                </div>
              </div>` : ''}
            <!-- View Property Button -->
            <a href="/property-details?id=${property.id}" class="w-full bg-primary text-white text-sm font-medium py-2.5 rounded-lg
                         hover:bg-primary-700 transition-all duration-200 ease-out transform hover:scale-[1.02]
                         flex items-center justify-center space-x-2">
              <span>View Property</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </a>
          </div>
        </div>
      `;
      marker.bindPopup(popupContent);
      clusterRef.current.addLayer(marker);
    });

    map.addLayer(clusterRef.current);
    return () => {
      map.removeLayer(clusterRef.current);
    };
  }, [properties, map, selectedProperty, handleMarkerClick, createCustomIcon]);

  return null; // This component doesn't render anything directly
};


const MapView = ({ 
  properties = [], 
  selectedProperty, 
  onPropertySelect,
  isMobile = false 
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
  const mapRef = useRef(null);

  // Calculate map bounds based on properties with fallback to Dar es Salaam
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
        
        const latSpread = Math.max(...lats) - Math.min(...lats);
        const lngSpread = Math.max(...lngs) - Math.min(...lngs);
        const maxSpread = Math.max(latSpread, lngSpread);
        
        if (maxSpread > 1) setZoom(9);
        else if (maxSpread > 0.5) setZoom(10);
        else if (maxSpread > 0.1) setZoom(12);
        else setZoom(13);
      } else {
        setMapCenter(DAR_ES_SALAAM_BOUNDS.center);
        setZoom(11);
      }
    }
    // Set mapLoaded to true after initial calculation
    setMapLoaded(true);
  }, [properties]);

  // Format price
  const formatPrice = (price) => {
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

  const validProperties = getValidProperties();

  // Handle marker interactions
  const handleMarkerClick = (property) => {
    if (onPropertySelect) {
      onPropertySelect(property);
    }
  };

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

  // Custom marker icon creation with a render function
  const createCustomIcon = (property, isSelected) => {
    const isClicked = selectedProperty?.id === property.id;
    const markerClassName = `relative flex items-center justify-center rounded-full shadow-lg border-2 border-white 
      transition-all duration-200 ease-out transform
      ${isSelected ? 'w-8 h-8 bg-primary ring-4 ring-primary/30' : 
        'w-6 h-6 bg-surface hover:bg-primary hover:ring-2 hover:ring-primary/20'}`;

    const iconSize = isSelected ? 32 : 24;

    const priceHtml = `
      <div class="absolute -top-8 left-1/2 -translate-x-1/2">
        <div class="bg-text-primary text-white text-xs px-2 py-1 rounded-full font-semibold whitespace-nowrap shadow-md">
          ${formatPrice(property.price).replace('TZS', '').trim()}
        </div>
      </div>
    `;

    const iconHtml = `
      <div class="${markerClassName}" style="width:${iconSize}px; height:${iconSize}px;">
        ${priceHtml}
        <svg xmlns="http://www.w3.org/2000/svg" width="${iconSize/1.5}" height="${iconSize/1.5}" viewBox="0 0 24 24" fill="none" stroke="${isSelected ? 'white' : 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
        ${(isSelected) ? '<div class="absolute inset-0 rounded-full animate-ping opacity-75 bg-current"></div>' : ''}
      </div>
    `;

    return L.divIcon({
      html: iconHtml,
      className: 'custom-marker-icon',
      iconSize: [iconSize, iconSize],
      iconAnchor: [iconSize / 2, iconSize / 2]
    });
  };

  return (
    <div className="relative h-full bg-secondary-100 rounded-lg overflow-hidden">
      {/* Map Container */}
      <MapContainer
        ref={mapRef}
        center={[mapCenter.lat, mapCenter.lng]}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full relative z-0"
        whenCreated={mapInstance => {
          mapRef.current = mapInstance;
          setMapLoaded(true);
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
        />
        
        <MapControls 
          mapCenter={mapCenter} 
          zoom={zoom} 
          handleResetView={handleResetView} 
          handleZoomIn={handleZoomIn} 
          handleZoomOut={handleZoomOut}
        />
      </MapContainer>

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
