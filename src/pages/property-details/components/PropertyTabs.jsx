// src/pages/property-details/components/PropertyTabs.jsx
import React, { useRef } from 'react';
import Icon from '../../../components/AppIcon'; // Assuming this path is correct

const PropertyTabs = ({ property, activeTab, onTabChange }) => {
  const mapRef = useRef(null);

  const tabs = [
    { id: 'description', label: 'Description', icon: 'FileText' },
    { id: 'location', label: 'Location', icon: 'MapPin' },
    { id: 'amenities', label: 'Amenities', icon: 'Star' },
  ];

  const renderLocation = () => (
    <div className="space-y-6">
      {/* Display location_notes if available */}
      {property?.location_notes && (
        <div className="bg-background p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-text-primary mb-2">Location Notes</h3>
          <p className="text-text-secondary whitespace-pre-line">
            {property.location_notes}
          </p>
        </div>
      )}

      {/* Map Placeholder */}
      <div className="bg-secondary-100 rounded-lg h-64 md:h-80 flex items-center justify-center">
        <div className="text-center">
          <Icon name="Map" size={48} className="text-secondary mx-auto mb-2" />
          <p className="text-text-secondary">Interactive neighborhood map would be embedded here</p>
          <p className="text-sm text-text-secondary mt-1">
            Coordinates: {property?.latitude}, {property?.longitude}
          </p>
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
      <div>
        {/* Only render the grid if there are parsed amenities */}
        {parsedAmenities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {parsedAmenities.map((amenity, index) => (
              <div key={index} className="flex items-center space-x-3 p-1"> {/* Removed bg-background, rounded-md for no background/shadow */}
                <Icon name="Check" size={16} className="text-success flex-shrink-0" />
                {/* Capitalize the first letter of the amenity */}
                <span className="text-text-primary">{amenity.charAt(0).toUpperCase() + amenity.slice(1)}</span>
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
    );
  };

  const renderDescription = () => (
    <div className="prose max-w-none">
      <div className="text-text-primary whitespace-pre-line leading-relaxed">
        {property?.description}
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'location':
        return renderLocation();
      case 'amenities':
        return renderAmenities();
      case 'description':
        return renderDescription();
      default:
        // Default to description if activeTab is not recognized or initially unset
        return renderDescription();
    }
  };

  return (
    <div className="card overflow-hidden">
      {/* Tab Navigation */}
      <div className="border-b border-border">
        <div className="flex overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-primary border-b-2 border-primary bg-primary-50'
                  : 'text-text-secondary hover:text-text-primary hover:bg-secondary-100'
              }`}
            >
              <Icon name={tab.icon} size={16} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default PropertyTabs;
