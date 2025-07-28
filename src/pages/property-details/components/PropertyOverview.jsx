// src/pages/property-details/components/PropertyOverview.jsx
import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import StatusBadge from '../../../components/StatusBadge'; // Adjust path as needed
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import { saveFavorite, removeFavorite } from '../../../services/api';


const PropertyOverview = ({ 
  property, 
  isSaved: initialIsSaved, 
  onSave, 
  onShare, 
  onContact 
}) => {
  const [isSaved, setIsSaved] = useState(initialIsSaved || false); // Local state for toggle
  const { showToast } = useToast();
  const { accessToken, user } = useAuth();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'Tsh',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const handleSave = async () => {
    // 1. Not logged in
    if (!user || !accessToken) {
      showToast('Login to save favorites.', 'error');
      return;
    }

    // 2. Logged in, but not a tenant
    if (user && user.role !== 'TENANT') {
      showToast('Only tenants can save favorites.', 'error');
      return;
    }

    try {
      if (!isSaved) {
        await saveFavorite(property.id, accessToken);
        setIsSaved(true); // Update local state
        showToast('Property saved to favorites!', 'success');
      } else {
        await removeFavorite(property.id, accessToken);
        setIsSaved(false); // Update local state
        showToast('Removed from favorites.', 'info');
      }

      // Optional: call parent callback
      onSave?.(property.id, !isSaved);
    } catch (error) {
      console.error('Favorite error:', error);
      showToast(error.message || 'Failed to update favorite.', 'error');
    }
  };

  return (
    <div className="card p-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-6">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-2xl lg:text-3xl font-bold text-text-primary">
              {property?.title}
            </h1>
            {property?.days_since_posted <= 7 && (
              <span className="bg-success text-white px-2 py-1 rounded-md text-xs font-medium">
                New
              </span>
            )}
          </div>
          
          <p className="text-3xl lg:text-4xl font-bold text-primary mb-3">
            {formatPrice(property?.price)}
            <span className="text-sm font-normal text-text-secondary"> /month</span>
          </p>
          
          <div className="flex items-center space-x-2 text-text-secondary mb-4">
            <Icon name="MapPin" size={16} />
            <span>{property?.location}</span>
          </div>
        
        </div>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center space-x-3">
          <button
            onClick={handleSave}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 ${
              isSaved 
                ? 'bg-error text-white' :'bg-secondary-100 text-text-secondary hover:bg-error hover:text-white'
            }`}
          >
            <Icon name="Heart" size={18} fill={isSaved ? "currentColor" : "none"} />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>
          
          <button
            onClick={onShare}
            className="flex items-center space-x-2 px-4 py-2 bg-secondary-100 text-text-secondary rounded-md hover:bg-secondary-200 transition-all duration-200"
          >
            <Icon name="Share" size={18} />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Property Features Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        <div className="text-center p-3 bg-background rounded-md">
          <Icon name="Bed" size={24} className="text-primary mx-auto mb-2" />
          <p className="text-lg font-semibold text-text-primary">{property?.bedrooms}</p>
          <p className="text-sm text-text-secondary">Bedrooms</p>
        </div>
        
        <div className="text-center p-3 bg-background rounded-md">
          <Icon name="Bath" size={24} className="text-primary mx-auto mb-2" />
          <p className="text-lg font-semibold text-text-primary">{property?.bathrooms}</p>
          <p className="text-sm text-text-secondary">Bathrooms</p>
        </div>
        
        <div className="text-center p-3 bg-background rounded-md">
          <Icon name="Clock" size={24} className="text-primary mx-auto mb-2" />
          <p className="text-lg font-semibold text-text-primary">{property?.days_since_posted}</p>
          <p className="text-sm text-text-secondary">Days on Market</p>
        </div>
      </div>

{/* Property Type & Quick Info */}
<div className="flex flex-wrap items-center gap-4 text-sm">
  {/* Property Type */}
  <div className="flex items-center space-x-2">
    <Icon name="Home" size={16} className="text-text-secondary" />
    <span className="text-text-secondary">Type:</span>
    <span className="font-medium text-text-primary capitalize">{property?.property_type}</span>
  </div>

  {/* Property Status */}
  <div className="flex items-center space-x-2">
    <Icon name="CheckCircle" size={16} className="text-text-secondary" />
    <span className="text-text-secondary">Status:</span>
    <span className="font-medium text-text-primary capitalize">
      <StatusBadge status={property.status} />
    </span>
  </div>

  {/* Available From (only if occupied and available_from is present) */}
  {property?.status === 'OCCUPIED' && property?.available_from && (
    <div className="flex items-center space-x-2">
      <Icon name="Calendar" size={16} className="text-text-secondary" />
      <span className="text-text-secondary">Available From:</span>
      <span className="font-medium text-text-primary">
        {new Date(property.available_from).toLocaleDateString('en-GB', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })}
      </span>
    </div>
  )}
</div>


    </div>
  );
};

export default PropertyOverview;