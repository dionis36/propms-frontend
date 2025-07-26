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

  // Helper function to check if a backend value matches any option (case-insensitive)
  const matchesOption = (backendValue, optionsList) => {
    if (!backendValue) return false;
    return optionsList.some(option => 
      option.toLowerCase() === backendValue.toLowerCase()
    );
  };

  // Helper function to get the proper case option value
  const getProperOption = (backendValue, optionsList) => {
    if (!backendValue) return '';
    const found = optionsList.find(option => 
      option.toLowerCase() === backendValue.toLowerCase()
    );
    return found || backendValue; // Return original if no match found
  };

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

  // Format the date for better display
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Get minimum date (today) for the available from field
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
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
            value={getProperOption(formData?.propertyType, propertyTypes)}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md transition-all duration-200 bg-background text-text-primary appearance-none ${
              errors?.propertyType ? 'border-error' : 'border-border focus:border-primary'
            } focus:outline-none focus:ring-0`}
            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
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

        {/* Status and Available From Container */}
        <div className="md:col-span-2">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Status *
              </label>
              <select
                name="status"
                value={getProperOption(formData?.status, propertyStatuses)}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md transition-all duration-200 bg-background text-text-primary appearance-none ${
                  errors?.status ? 'border-error' : 'border-border focus:border-primary'
                } focus:outline-none focus:ring-0`}
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
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

            {/* Available From - Show when status is Occupied */}
            {formData?.status === 'Occupied' && (
              <div className="lg:col-span-1">
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Available From
                  <span className="text-text-secondary text-xs ml-1">(Optional)</span>
                </label>
                <Input
                  type="date"
                  name="availableFrom"
                  value={formData?.availableFrom || ''}
                  onChange={handleInputChange}
                  min={getMinDate()}
                  className={errors?.availableFrom ? 'border-error' : ''}
                />
                {errors?.availableFrom && (
                  <p className="text-error text-xs mt-1 flex items-center">
                    <Icon name="AlertCircle" size={12} className="mr-1" />
                    {errors.availableFrom}
                  </p>
                )}
                {formData?.availableFrom && (
                  <p className="text-text-secondary text-xs mt-1 flex items-center">
                    <Icon name="Calendar" size={12} className="mr-1" />
                    Will be available on {formatDateForDisplay(formData.availableFrom)}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

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
            maxLength={1000}
            className={`w-full px-3 py-2 border rounded-md transition-all duration-200 bg-background text-text-primary placeholder-text-secondary resize-y min-h-[120px] max-h-[300px] ${
              errors?.description ? 'border-error' : 'border-border focus:border-primary'
            } focus:outline-none focus:ring-0`}
            placeholder="Describe the property features, amenities, neighborhood highlights, and what makes this property special..."
          />
          {errors?.description && (
            <p className="text-error text-xs mt-1 flex items-center">
              <Icon name="AlertCircle" size={12} className="mr-1" />
              {errors.description}
            </p>
          )}
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-text-secondary">
              {formData?.description?.length || 0}/1000 characters
            </p>
            {formData?.description?.length >= 950 && (
              <span className="text-xs text-warning flex items-center">
                <Icon name="AlertTriangle" size={10} className="mr-1" />
                Approaching limit
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Property Status Information */}
      {formData?.status && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Icon 
              name={formData.status === 'Available' ? 'CheckCircle' : 'Clock'} 
              size={16} 
              className={formData.status === 'Available' ? 'text-green-600 mt-0.5' : 'text-orange-600 mt-0.5'} 
            />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-text-primary mb-1">
                Property Status: {formData.status}
              </h4>
              <p className="text-xs text-text-secondary">
                {formData.status === 'Available' 
                  ? 'This property is currently available for immediate occupancy.'
                  : formData.availableFrom 
                    ? `This property is currently occupied and will be available on ${formatDateForDisplay(formData.availableFrom)}.`
                    : 'This property is currently occupied. Availability date not specified.'
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetailsForm;