// src/pages/user-profile-settings/components/ProfileInformation.jsx
import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import UserAvatar from '../../../components/ui/UserAvatar';


const ProfileInformation = ({ user, onDataChange }) => {
// Inside useState
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone_number: user?.phone_number || '',
    bio: user?.bio || '',
    location: user?.location || '',
    website: user?.website || ''
  });

  // Update handler
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    onDataChange?.({ ...formData, [field]: value });
  };


  return (
    
    <div className="bg-surface rounded-lg shadow-elevation-1">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border">
        <h2 className="text-xl font-semibold text-text-primary font-heading">
          Profile Information
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          Update your personal information and profile photo
        </p>
      </div>

      <div className="p-6">
        {/* Profile Photo Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 mb-8">
          <div className="relative group">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-secondary-100">
              <UserAvatar
                firstName={user?.first_name}
                lastName={user?.last_name}
                size="w-full h-full"
                className="transition-transform duration-200"
              />
            </div>
          </div>
          
          <div className="mt-4 sm:mt-0 flex-1">
            <h3 className="text-lg font-medium text-text-primary">
              {formData.first_name} {formData.last_name}
            </h3>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* First Name */}
          <div>
            <label htmlFor="first_name" className="block text-sm font-medium text-text-primary mb-2">
              First Name *
            </label>
            <input
              type="text"
              id="first_name"
              value={formData.first_name}
              onChange={(e) => handleInputChange('first_name', e.target.value)}
              className="block w-full px-4 py-3 border border-border rounded-md shadow-sm focus:border-border-focus focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 bg-background text-text-primary placeholder-text-secondary"
              placeholder="e.g. Jane"
              required
            />
          </div>

          {/* Last Name */}
          <div>
            <label htmlFor="last_name" className="block text-sm font-medium text-text-primary mb-2">
              Last Name *
            </label>
            <input
              type="text"
              id="last_name"
              value={formData.last_name}
              onChange={(e) => handleInputChange('last_name', e.target.value)}
              className="block w-full px-4 py-3 border border-border rounded-md shadow-sm focus:border-border-focus focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 bg-background text-text-primary placeholder-text-secondary"
              placeholder="e.g. Doe"
              required
            />
          </div>


          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="block w-full px-4 py-3 border border-border rounded-md shadow-sm focus:border-border-focus focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 bg-background text-text-primary placeholder-text-secondary"
              placeholder="your.email@example.com"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone_number" className="block text-sm font-medium text-text-primary mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone_number"
              value={formData.phone_number}
              onChange={(e) => handleInputChange('phone_number', e.target.value)}
              className="block w-full px-4 py-3 border border-border rounded-md shadow-sm focus:border-border-focus focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 bg-background text-text-primary placeholder-text-secondary"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-text-primary mb-2">
              Location
            </label>
            <input
              type="text"
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="block w-full px-4 py-3 border border-border rounded-md shadow-sm focus:border-border-focus focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 bg-background text-text-primary placeholder-text-secondary"
              placeholder="City, State"
            />
          </div>

          {/* Website */}
          <div>
            <label htmlFor="website" className="block text-sm font-medium text-text-primary mb-2">
              Website
            </label>
            <input
              type="url"
              id="website"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              className="block w-full px-4 py-3 border border-border rounded-md shadow-sm focus:border-border-focus focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 bg-background text-text-primary placeholder-text-secondary"
              placeholder="https://www.yourwebsite.com"
            />
          </div>
        </div>
      </div>
    </div>

    
  );
};

export default ProfileInformation;
