import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';

const PropertySpecificationsForm = ({ formData, setFormData, errors, setErrors }) => {
  const [customAmenity, setCustomAmenity] = useState('');

  const commonAmenities = [
    'Air Conditioning', 'Heating', 'Dishwasher', 'Washer/Dryer',
    'Parking', 'Garage', 'Balcony', 'Patio', 'Garden', 'Pool',
    'Gym', 'Elevator', 'Fireplace', 'Hardwood Floors', 'Carpet',
    'Tile Floors', 'Walk-in Closet', 'Storage', 'Pet Friendly'
  ]; 

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors?.[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
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

  const addCustomAmenity = () => {
    if (customAmenity.trim() && !(formData?.amenities || []).includes(customAmenity.trim())) {
      setFormData(prev => ({
        ...prev,
        amenities: [...(prev?.amenities || []), customAmenity.trim()]
      }));
      setCustomAmenity('');
    }
  };

  const removeAmenity = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: (prev?.amenities || []).filter(a => a !== amenity)
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
          <Icon name="Settings" size={16} className="text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-text-primary">Property Specifications</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Bedrooms */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Bedrooms *
          </label>
          <Input
            type="number"
            name="bedrooms"
            value={formData?.bedrooms || ''}
            onChange={handleInputChange}
            placeholder="3"
            min="0"
            className={errors?.bedrooms ? 'border-error' : ''}
          />
          {errors?.bedrooms && (
            <p className="text-error text-xs mt-1 flex items-center">
              <Icon name="AlertCircle" size={12} className="mr-1" />
              {errors.bedrooms}
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
            step="0.5"
            className={errors?.bathrooms ? 'border-error' : ''}
          />
          {errors?.bathrooms && (
            <p className="text-error text-xs mt-1 flex items-center">
              <Icon name="AlertCircle" size={12} className="mr-1" />
              {errors.bathrooms}
            </p>
          )}
        </div>

        {/* Half Bathrooms */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Half Bathrooms
          </label>
          <Input
            type="number"
            name="halfBathrooms"
            value={formData?.halfBathrooms || ''}
            onChange={handleInputChange}
            placeholder="1"
            min="0"
            className={errors?.halfBathrooms ? 'border-error' : ''}
          />
        </div>

        {/* Lot Size */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Lot Size
          </label>
          <div className="relative">
            <Input
              type="number"
              name="lotSize"
              value={formData?.lotSize || ''}
              onChange={handleInputChange}
              placeholder="0.25"
              step="0.01"
              className={errors?.lotSize ? 'border-error' : ''}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-text-secondary text-sm">acres</span>
            </div>
          </div>
        </div>

        {/* Year Built */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Year Built
          </label>
          <Input
            type="number"
            name="yearBuilt"
            value={formData?.yearBuilt || ''}
            onChange={handleInputChange}
            placeholder="2020"
            min="1800"
            max={new Date().getFullYear()}
            className={errors?.yearBuilt ? 'border-error' : ''}
          />
        </div>

        {/* Parking Spaces */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Parking Spaces
          </label>
          <Input
            type="number"
            name="parkingSpaces"
            value={formData?.parkingSpaces || ''}
            onChange={handleInputChange}
            placeholder="2"
            min="0"
            className={errors?.parkingSpaces ? 'border-error' : ''}
          />
        </div>

        {/* Stories */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Stories
          </label>
          <Input
            type="number"
            name="stories"
            value={formData?.stories || ''}
            onChange={handleInputChange}
            placeholder="2"
            min="1"
            className={errors?.stories ? 'border-error' : ''}
          />
        </div>

        {/* HOA Fee */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            HOA Fee (Monthly)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-text-secondary text-sm">$</span>
            </div>
            <Input
              type="number"
              name="hoaFee"
              value={formData?.hoaFee || ''}
              onChange={handleInputChange}
              placeholder="150"
              min="0"
              className={`pl-8 ${errors?.hoaFee ? 'border-error' : ''}`}
            />
          </div>
        </div>

        {/* Property Tax */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Property Tax (Annual)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-text-secondary text-sm">$</span>
            </div>
            <Input
              type="number"
              name="propertyTax"
              value={formData?.propertyTax || ''}
              onChange={handleInputChange}
              placeholder="5000"
              min="0"
              className={`pl-8 ${errors?.propertyTax ? 'border-error' : ''}`}
            />
          </div>
        </div>
      </div>

      {/* Amenities Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-text-primary">Amenities & Features</h3>
        
        {/* Common Amenities Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {commonAmenities.map(amenity => (
            <button
              key={amenity}
              type="button"
              onClick={() => handleAmenityToggle(amenity)}
              className={`text-left p-3 rounded-lg border transition-all duration-200 ${
                (formData?.amenities || []).includes(amenity)
                  ? 'border-primary bg-primary-50 text-primary' :'border-border hover:border-primary hover:bg-primary-50 text-text-secondary hover:text-primary'
              }`}
            >
              <div className="flex items-center space-x-2">
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                  (formData?.amenities || []).includes(amenity)
                    ? 'border-primary bg-primary' :'border-border'
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

        {/* Selected Custom Amenities */}
        {(formData?.amenities || []).filter(amenity => !commonAmenities.includes(amenity)).length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-text-primary">Custom Amenities:</p>
            <div className="flex flex-wrap gap-2">
              {(formData?.amenities || [])
                .filter(amenity => !commonAmenities.includes(amenity))
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

      {/* Additional Features */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-text-primary">Additional Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pet Policy */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Pet Policy
            </label>
            <select
              name="petPolicy"
              value={formData?.petPolicy || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 bg-background text-text-primary"
            >
              <option value="">Select pet policy</option>
              <option value="allowed">Pets Allowed</option>
              <option value="cats-only">Cats Only</option>
              <option value="dogs-only">Dogs Only</option>
              <option value="no-pets">No Pets</option>
              <option value="case-by-case">Case by Case</option>
            </select>
          </div>

          {/* Smoking Policy */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Smoking Policy
            </label>
            <select
              name="smokingPolicy"
              value={formData?.smokingPolicy || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 bg-background text-text-primary"
            >
              <option value="">Select smoking policy</option>
              <option value="no-smoking">No Smoking</option>
              <option value="outdoor-only">Outdoor Only</option>
              <option value="allowed">Smoking Allowed</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertySpecificationsForm;