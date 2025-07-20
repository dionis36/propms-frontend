// src/pages/property-details/components/PropertyInfo.jsx
import React, { useRef, useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon'; // Assuming this path is correct

const PropertyInfo = ({ property }) => {
  const [isMapInteractive, setIsMapInteractive] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef(null);

  // Dar es Salaam bounds
  const DAR_ES_SALAAM_BOUNDS = {
    north: -6.6,
    south: -6.9,
    east: 39.4,
    west: 39.1
  };

  const handleGetDirections = () => {
    if (property?.latitude && property?.longitude) {
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${property.latitude},${property.longitude}`;
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
            {property?.description || 'No description available for this property.'}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAmenities = () => {
    // Safely get the raw amenities string from the array
    const rawAmenitiesString = property?.amenities?.[0];

    let parsedAmenities = [];
    if (rawAmenitiesString && typeof rawAmenitiesString === 'string') {
      try {
        // Attempt to parse the JSON string into an array
        parsedAmenities = JSON.parse(rawAmenitiesString);
        // Ensure the parsed result is actually an array
        if (!Array.isArray(parsedAmenities)) {
          console.warn('Parsed amenities is not an array:', parsedAmenities);
          parsedAmenities = []; // Reset if parsing resulted in non-array
        }
      } catch (error) {
        console.error('Error parsing amenities string:', error);
        parsedAmenities = []; // Fallback to empty array on parsing error
      }
    }

    return (
      <div className="card overflow-hidden">
        {/* Card Heading */}
        <div className="p-6">
          <h4 className="text-lg font-semibold text-text-primary mb-6 flex items-center">
            <Icon name="Star" size={20} className="mr-2 text-primary" />
            Amenities
          </h4>
          
          {/* Only render the grid if there are parsed amenities */}
          {parsedAmenities.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3">
              {parsedAmenities.map((amenity, index) => (
                <div key={index} className="flex items-center space-x-3 p-2 bg-secondary-50 rounded-lg">
                  <Icon name="Check" size={16} className="text-success flex-shrink-0" />
                  {/* Capitalize the first letter of the amenity */}
                  <span className="text-text-primary text-sm">
                    {amenity.charAt(0).toUpperCase() + amenity.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            // Display "No amenities listed" message if no parsed amenities
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
  const [zoomLevel, setZoomLevel] = useState(16); // default proximity zoom
  const mapCenter = `${lat},${lng}`;

  const buildMapUrl = (zoom) =>
    `https://maps.locationiq.com/v3/staticmap?key=pk.ad563e9d0495f84cb1afb14f4f550d68&center=${mapCenter}&zoom=${zoom}&size=1200x800&format=png&maptype=roads&markers=icon:large-red-cutout|${lat},${lng}&style=osm-bright`;

  const mapUrl = buildMapUrl(zoomLevel);

  const handleZoomIn = () => {
    if (zoomLevel < 20) setZoomLevel(z => z + 1);
  };

  const handleZoomOut = () => {
    if (zoomLevel > 10) setZoomLevel(z => z - 1);
  };

  return (
    <div className="relative bg-secondary-100 rounded-lg h-72 md:h-80 lg:h-96 overflow-hidden group" ref={mapRef}>
      {/* Static Map */}
      <img
        src={mapUrl}
        alt="Property Location Map"
        className="absolute inset-0 w-full h-full object-cover rounded-lg"
        onLoad={() => setMapLoaded(true)}
      />

      {/* Loading Overlay */}
      {!mapLoaded && (
        <div className="absolute inset-0 bg-secondary-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-text-secondary text-sm">Loading map...</p>
          </div>
        </div>
      )}

      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2 z-30">
        <div className="bg-surface rounded-md shadow-elevation-2 border border-border overflow-hidden">
          <button
            onClick={handleZoomIn}
            className="block w-10 h-10 flex items-center justify-center text-text-secondary 
                     hover:text-text-primary hover:bg-secondary-100 transition-colors duration-200"
          >
            <Icon name="Plus" size={16} />
          </button>
          <div className="border-t border-border"></div>
          <button
            onClick={handleZoomOut}
            className="block w-10 h-10 flex items-center justify-center text-text-secondary 
                     hover:text-text-primary hover:bg-secondary-100 transition-colors duration-200"
          >
            <Icon name="Minus" size={16} />
          </button>
        </div>
      </div>

      {/* Get Directions Button */}
      <button
        onClick={handleGetDirections}
        className="absolute bottom-4 left-4 bg-primary text-white px-3 py-2 rounded-lg shadow-lg hover:bg-primary-600 transition-colors duration-200 flex items-center space-x-2 text-sm font-medium z-30"
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