// src/pages/property-details/components/PropertyTabs.jsx
import React, { useRef } from 'react';
import Icon from '../../../components/AppIcon';

const PropertyTabs = ({ property, activeTab, onTabChange }) => {
  const mapRef = useRef(null);

  const tabs = [
    { id: 'description', label: 'Description', icon: 'FileText' },
    { id: 'location', label: 'Location', icon: 'MapPin' },
    { id: 'amenities', label: 'Amenities', icon: 'Star' },
  ];

  const renderLocation = () => (
    <div className="space-y-6">
      {/* Map Placeholder */}
      <div className="bg-secondary-100 rounded-lg h-64 md:h-80 flex items-center justify-center">
        <div className="text-center">
          <Icon name="Map" size={48} className="text-secondary mx-auto mb-2" />
          <p className="text-text-secondary">Interactive neighborhood map would be embedded here</p>
          <p className="text-sm text-text-secondary mt-1">
            Coordinates: {property?.coordinates?.lat}, {property?.coordinates?.lng}
          </p>
        </div>
      </div>      
    </div>
  );

  const renderAmenities = () => (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {property?.amenities?.map((amenity, index) => (
          <div key={index} className="flex items-center space-x-3 p-3 bg-background rounded-md">
            <Icon name="Check" size={16} className="text-success flex-shrink-0" />
            <span className="text-text-primary">{amenity}</span>
          </div>
        ))}
      </div>
      
      {(!property?.amenities || property.amenities.length === 0) && (
        <div className="text-center py-8">
          <Icon name="Star" size={48} className="text-secondary mx-auto mb-4" />
          <p className="text-text-secondary">No amenities listed for this property</p>
        </div>
      )}
    </div>
  );

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
        return renderLocation();
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
                  ? 'text-primary border-b-2 border-primary bg-primary-50' :'text-text-secondary hover:text-text-primary hover:bg-secondary-100'
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