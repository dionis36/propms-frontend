import React from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';

const PropertyDetailsForm = ({ formData, setFormData, errors, setErrors }) => {
  const propertyTypes = [
    'House',
    'Room',
    'Self-Contained Unit',
    'Apartment'
  ]; 

  const propertyStatuses = [
    'Available',
    'Occupied',
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newFormData = {
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    };

    // Handle is_available_now logic
    if (name === 'status') {
      if (value === 'Available') {
        newFormData.is_available_now = true;
        // Clear availableFrom when switching to Available
        newFormData.availableFrom = '';
      } else if (value === 'Occupied') {
        newFormData.is_available_now = false;
      }
    }

    // Handle availableFrom date selection for occupied properties
    if (name === 'availableFrom' && formData.status === 'Occupied') {
      // The is_available_now logic can be implemented here if needed
      // For now, we just store the date
      newFormData.is_available_now = false;
    }

    setFormData(newFormData);
    
    // Clear error when user starts typing
    if (errors?.[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
          <Icon name="Home" size={16} className="text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-text-primary">Property Details</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Property Title */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-text-primary mb-2">
            Property Title *
          </label>
          <Input
            type="text"
            name="title"
            value={formData?.title || ''}
            onChange={handleInputChange}
            placeholder="Beautiful 3-bedroom family home in downtown..."
            className={errors?.title ? 'border-error' : ''}
          />
          {errors?.title && (
            <p className="text-error text-xs mt-1 flex items-center">
              <Icon name="AlertCircle" size={12} className="mr-1" />
              {errors.title}
            </p>
          )}
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Price *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-text-secondary text-sm">Tsh</span>
            </div>
            <Input
              type="number"
              name="price"
              value={formData?.price || ''}
              onChange={handleInputChange}
              placeholder="450000"
              min="10000"
              step="1000"
              className={`pl-11 ${errors?.price ? 'border-error' : ''}`}
            />
          </div>
          {errors?.price && (
            <p className="text-error text-xs mt-1 flex items-center">
              <Icon name="AlertCircle" size={12} className="mr-1" />
              {errors.price}
            </p>
          )}
        </div>

        {/* Property Type */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Property Type *
          </label>
          <select
            name="propertyType"
            value={formData.propertyType || ''}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 bg-background text-text-primary ${
              errors?.propertyType ? 'border-error' : 'border-border focus:border-border-focus'
            }`}
          >
            <option value="">Select property type</option>
            {propertyTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          {errors?.propertyType && (
            <p className="text-error text-xs mt-1 flex items-center">
              <Icon name="AlertCircle" size={12} className="mr-1" />
              {errors.propertyType}
            </p>
          )}
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Status *
          </label>
          <select
            name="status"
            value={formData?.status || ''}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 bg-background text-text-primary ${
              errors?.status ? 'border-error' : 'border-border focus:border-border-focus'
            }`}
          >
            <option value="">Select status</option>
            {propertyStatuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          {errors?.status && (
            <p className="text-error text-xs mt-1 flex items-center">
              <Icon name="AlertCircle" size={12} className="mr-1" />
              {errors.status}
            </p>
          )}
        </div>

        {/* Available From - Only show when status is Occupied */}
        {formData?.status === 'Occupied' && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-text-primary mb-2">
              Available From
            </label>
            <Input
              type="date"
              name="availableFrom"
              value={formData?.availableFrom || ''}
              onChange={handleInputChange}
              className={errors?.availableFrom ? 'border-error' : ''}
            />
            {errors?.availableFrom && (
              <p className="text-error text-xs mt-1 flex items-center">
                <Icon name="AlertCircle" size={12} className="mr-1" />
                {errors.availableFrom}
              </p>
            )}
          </div>
        )}

        {/* Description */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-text-primary mb-2">
            Description *
          </label>
          <textarea
            name="description"
            value={formData?.description || ''}
            onChange={handleInputChange}
            rows={6}
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 bg-background text-text-primary placeholder-text-secondary ${
              errors?.description ? 'border-error' : 'border-border focus:border-border-focus'
            }`}
            placeholder="Describe the property features, amenities, neighborhood highlights, and what makes this property special..."
          />
          {errors?.description && (
            <p className="text-error text-xs mt-1 flex items-center">
              <Icon name="AlertCircle" size={12} className="mr-1" />
              {errors.description}
            </p>
          )}
          <p className="text-xs text-text-secondary mt-1">
            {formData?.description?.length || 0}/1000 characters
          </p>
        </div>
        
      </div>
    </div>
  );
};

export default PropertyDetailsForm;