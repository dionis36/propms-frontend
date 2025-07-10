import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';

const PropertySpecificationsForm = ({ formData, setFormData, errors, setErrors }) => {
  const [customAmenity, setCustomAmenity] = useState('');
  const [customAdditional, setCustomAdditional] = useState('');

  const commonAmenities = [
    'Air Conditioning', 'Heating', 'Dishwasher', 'Washer/Dryer',
    'Parking', 'Garage', 'Balcony', 'Patio', 'Garden', 'Pool',
    'Gym', 'Elevator', 'Fireplace', 'Hardwood Floors', 'Carpet',
    'Tile Floors', 'Walk-in Closet', 'Storage'
  ]; 

  const commonAdditionalFeatures = [
    'Pets Allowed', 'No Pets', 'Cats Only', 'Dogs Only', 
    'No Smoking', 'Smoking Allowed', 'Case by Case'
  ];

  const bathroomOptions = [
    { value: 'Private Bathroom', label: 'Private Bathroom' },
    { value: 'Shared Bathroom', label: 'Shared Bathroom' }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // Clear error when user starts typing
    if (errors?.[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // If bathrooms are set to 0, remove bathroom type
    if (name === 'bathrooms' && Number(newValue) === 0) {
      const updatedAmenities = (formData?.amenities || []).filter(a => 
        !bathroomOptions.some(opt => opt.value === a)
      );
      setFormData(prev => ({
        ...prev,
        amenities: updatedAmenities
      }));
    }
  };

  const handleAmenityToggle = (amenity) => {
    const currentAmenities = formData?.amenities || [];
    const isSelected = currentAmenities.includes(amenity);
    
    setFormData(prev => ({
      ...prev,
      amenities: isSelected 
        ? currentAmenities.filter(a => a !== amenity)
        : [...currentAmenities, amenity]
    }));
  };

  const handleBathroomTypeChange = (type) => {
    // Remove any existing bathroom types
    const currentAmenities = formData?.amenities || [];
    const filteredAmenities = currentAmenities.filter(a => 
      !bathroomOptions.some(opt => opt.value === a)
    );
    
    setFormData(prev => ({
      ...prev,
      amenities: [...filteredAmenities, type]
    }));
    
    // Clear error when user selects an option
    if (errors?.bathroomType) {
      setErrors(prev => ({ ...prev, bathroomType: '' }));
    }
  };

  const addCustomAmenity = () => {
    if (customAmenity.trim() && !(formData?.amenities || []).includes(customAmenity.trim())) {
      setFormData(prev => ({
        ...prev,
        amenities: [...(prev?.amenities || []), customAmenity.trim()]
      }));
      setCustomAmenity('');
    }
  };

  const addCustomAdditional = () => {
    if (customAdditional.trim() && !(formData?.amenities || []).includes(customAdditional.trim())) {
      setFormData(prev => ({
        ...prev,
        amenities: [...(prev?.amenities || []), customAdditional.trim()]
      }));
      setCustomAdditional('');
    }
  };

  const removeAmenity = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: (prev?.amenities || []).filter(a => a !== amenity)
    }));
  };

  // Validate bathroom type when bathrooms count changes
  useEffect(() => {
    const bathrooms = Number(formData?.bathrooms || 0);
    const hasBathroomType = (formData?.amenities || []).some(a => 
      bathroomOptions.some(opt => opt.value === a)
    );
    
    if (bathrooms >= 1 && !hasBathroomType && errors?.bathroomType === undefined) {
      setErrors(prev => ({ ...prev, bathroomType: 'Please select a bathroom type' }));
    }
  }, [formData?.bathrooms, formData?.amenities]);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
          <Icon name="Settings" size={16} className="text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-text-primary">Property Specifications</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Rooms */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Rooms *
          </label>
          <Input
            type="number"
            name="rooms"
            value={formData?.rooms || ''}
            onChange={handleInputChange}
            placeholder="3"
            min="1"
            max="10"
            className={errors?.rooms ? 'border-error' : ''}
          />
          {errors?.rooms && (
            <p className="text-error text-xs mt-1 flex items-center">
              <Icon name="AlertCircle" size={12} className="mr-1" />
              {errors.rooms}
            </p>
          )}
        </div>

        {/* Bathrooms */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Bathrooms *
          </label>
          <Input
            type="number"
            name="bathrooms"
            value={formData?.bathrooms || ''}
            onChange={handleInputChange}
            placeholder="2"
            min="0"
            max="5"
            className={errors?.bathrooms ? 'border-error' : ''}
          />
          {errors?.bathrooms && (
            <p className="text-error text-xs mt-1 flex items-center">
              <Icon name="AlertCircle" size={12} className="mr-1" />
              {errors.bathrooms}
            </p>
          )}
        </div>
      </div>

      {/* Amenities Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-text-primary">Amenities & Features</h3>
        
        {/* Bathroom Type - Conditionally Required */}
        {(formData?.bathrooms || 0) >= 1 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-text-primary mb-2">
              Bathroom Type *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {bathroomOptions.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleBathroomTypeChange(option.value)}
                  className={`text-left p-3 rounded-lg border transition-all duration-200 ${
                    (formData?.amenities || []).includes(option.value)
                      ? 'border-primary bg-primary-50 text-primary' 
                      : 'border-border hover:border-primary hover:bg-primary-50 text-text-secondary hover:text-primary'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                      (formData?.amenities || []).includes(option.value)
                        ? 'border-primary bg-primary' 
                        : 'border-border'
                    }`}>
                      {(formData?.amenities || []).includes(option.value) && (
                        <Icon name="Check" size={12} className="text-white" />
                      )}
                    </div>
                    <span className="text-sm font-medium">{option.label}</span>
                  </div>
                </button>
              ))}
            </div>
            {errors?.bathroomType && (
              <p className="text-error text-xs mt-1 flex items-center">
                <Icon name="AlertCircle" size={12} className="mr-1" />
                {errors.bathroomType}
              </p>
            )}
          </div>
        )}
        
        {/* Common Amenities Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {commonAmenities.map(amenity => (
            <button
              key={amenity}
              type="button"
              onClick={() => handleAmenityToggle(amenity)}
              className={`text-left p-3 rounded-lg border transition-all duration-200 ${
                (formData?.amenities || []).includes(amenity)
                  ? 'border-primary bg-primary-50 text-primary' 
                  : 'border-border hover:border-primary hover:bg-primary-50 text-text-secondary hover:text-primary'
              }`}
            >
              <div className="flex items-center space-x-2">
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                  (formData?.amenities || []).includes(amenity)
                    ? 'border-primary bg-primary' 
                    : 'border-border'
                }`}>
                  {(formData?.amenities || []).includes(amenity) && (
                    <Icon name="Check" size={12} className="text-white" />
                  )}
                </div>
                <span className="text-sm font-medium">{amenity}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Custom Amenity Input */}
        <div className="flex space-x-2">
          <Input
            type="text"
            value={customAmenity}
            onChange={(e) => setCustomAmenity(e.target.value)}
            placeholder="Add custom amenity..."
            className="flex-1"
            onKeyPress={(e) => e.key === 'Enter' && addCustomAmenity()}
          />
          <button
            type="button"
            onClick={addCustomAmenity}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors duration-200"
          >
            <Icon name="Plus" size={16} />
          </button>
        </div>
      </div>

      {/* Additional Features Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-text-primary">Additional Features</h3>
        
        {/* Common Additional Features Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {commonAdditionalFeatures.map(feature => (
            <button
              key={feature}
              type="button"
              onClick={() => handleAmenityToggle(feature)}
              className={`text-left p-3 rounded-lg border transition-all duration-200 ${
                (formData?.amenities || []).includes(feature)
                  ? 'border-primary bg-primary-50 text-primary' 
                  : 'border-border hover:border-primary hover:bg-primary-50 text-text-secondary hover:text-primary'
              }`}
            >
              <div className="flex items-center space-x-2">
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                  (formData?.amenities || []).includes(feature)
                    ? 'border-primary bg-primary' 
                    : 'border-border'
                }`}>
                  {(formData?.amenities || []).includes(feature) && (
                    <Icon name="Check" size={12} className="text-white" />
                  )}
                </div>
                <span className="text-sm font-medium">{feature}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Custom Additional Feature Input */}
        <div className="flex space-x-2">
          <Input
            type="text"
            value={customAdditional}
            onChange={(e) => setCustomAdditional(e.target.value)}
            placeholder="Add custom feature..."
            className="flex-1"
            onKeyPress={(e) => e.key === 'Enter' && addCustomAdditional()}
          />
          <button
            type="button"
            onClick={addCustomAdditional}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors duration-200"
          >
            <Icon name="Plus" size={16} />
          </button>
        </div>
      </div>

      {/* Selected Custom Amenities & Features */}
      {(formData?.amenities || []).filter(amenity => 
        !commonAmenities.includes(amenity) && 
        !commonAdditionalFeatures.includes(amenity) &&
        !bathroomOptions.some(opt => opt.value === amenity)
      ).length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-text-primary">Custom Amenities & Features:</p>
          <div className="flex flex-wrap gap-2">
            {(formData?.amenities || [])
              .filter(amenity => 
                !commonAmenities.includes(amenity) && 
                !commonAdditionalFeatures.includes(amenity) &&
                !bathroomOptions.some(opt => opt.value === amenity)
              )
              .map(amenity => (
                <span
                  key={amenity}
                  className="inline-flex items-center space-x-1 bg-primary-100 text-primary px-3 py-1 rounded-full text-sm"
                >
                  <span>{amenity}</span>
                  <button
                    type="button"
                    onClick={() => removeAmenity(amenity)}
                    className="text-primary hover:text-primary-700"
                  >
                    <Icon name="X" size={12} />
                  </button>
                </span>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertySpecificationsForm;