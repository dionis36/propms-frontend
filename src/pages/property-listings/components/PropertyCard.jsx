import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import StatusBadge from '../../../components/StatusBadge';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import { saveFavorite, removeFavorite } from '../../../services/api';



const PropertyCard = ({ 
  property, 
  variant = 'card', 
  onSave, 
  isHighlighted = false 
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const { showToast } = useToast();
  const { accessToken, user } = useAuth();


  // Backup images if property has no images
  const defaultImages = [
    "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
    "https://images.pixabay.com/photo/2016/11/18/17/46/house-1836070_1280.jpg",
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop",
    "https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
    "https://images.pixabay.com/photo/2017/04/10/22/28/residence-2219972_1280.jpg",
    "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop"
  ];

  // Use property images if available, otherwise use defaults
  const displayImages = property?.images?.length > 0 
    ? property.images 
    : defaultImages;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatNumber = (num) => {
    return num ? new Intl.NumberFormat('en-US').format(num) : 'N/A';
  };

const handleSave = async (e) => {
  e.preventDefault();
  e.stopPropagation();

  if (!user?.role || user.role !== 'TENANT') {
    showToast('Only tenants can save favorites.', 'error');
    return;
  }

  try {
    if (!property?.isSaved) {
      await saveFavorite(property.id, accessToken);
      showToast('Property saved to favorites!', 'success');
    } else {
      await removeFavorite(property.id, accessToken);
      showToast('Removed from favorites.', 'info');
    }

    // Optional: toggle state in parent
    onSave?.(property.id, !property.isSaved);
  } catch (error) {
    console.error('Favorite error:', error);
    showToast(error.message || 'Failed to update favorite.', 'error');
  }
};


  const handleImageNavigation = (direction, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (direction === 'next') {
      setCurrentImageIndex((prev) => 
        prev === displayImages?.length - 1 ? 0 : prev + 1
      );
    } else {
      setCurrentImageIndex((prev) => 
        prev === 0 ? displayImages?.length - 1 : prev - 1
      );
    }
  };

  const handleContactAgent = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (property?.agent?.phone) {
      window.open(`tel:${property.agent.phone}`, '_self');
    }
  };

  // List View Variant
  if (variant === 'list') {
    return (
      <Link
        to={`/property-details?id=${property?.id}`}
        className={`block card hover:shadow-elevation-2 transition-all duration-200 ease-out
                   ${isHighlighted ? 'ring-2 ring-primary shadow-elevation-2' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="p-4">
          <div className="flex space-x-4">
            {/* Property Images */}
            <div className="relative w-48 h-32 flex-shrink-0 overflow-hidden rounded-md">
              <Image
                src={displayImages?.[currentImageIndex]}
                alt={property?.title || 'Property image'}
                className="w-full h-full object-cover"
              />
              
              {/* Image Navigation */}
              {displayImages?.length > 1 && isHovered && (
                <>
                  <button
                    onClick={(e) => handleImageNavigation('prev', e)}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 w-6 h-6 
                             bg-surface/90 rounded-full flex items-center justify-center
                             hover:bg-surface transition-all duration-200"
                  >
                    <Icon name="ChevronLeft" size={14} />
                  </button>
                  <button
                    onClick={(e) => handleImageNavigation('next', e)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 w-6 h-6 
                             bg-surface/90 rounded-full flex items-center justify-center
                             hover:bg-surface transition-all duration-200"
                  >
                    <Icon name="ChevronRight" size={14} />
                  </button>
                </>
              )}

              {/* Image Indicators */}
              {displayImages?.length > 1 && (
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 
                              flex space-x-1">
                  {displayImages?.map((_, index) => (
                    <div
                      key={index}
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Save Button */}
              <button
                onClick={handleSave}
                className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center
                           transition-all duration-200 ease-out ${
                  property?.isSaved
                    ? 'bg-error text-white' :'bg-surface/90 text-text-secondary hover:bg-surface hover:text-error'
                }`}
              >
                <Icon 
                  name="Heart" 
                  size={16} 
                  fill={property?.isSaved ? "currentColor" : "none"} 
                />
              </button>
            </div>

            {/* Property Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary truncate">
                    {property?.title || 'No title'}
                  </h3>
                  <p className="text-2xl font-bold text-primary">
                    {formatPrice(property?.price)}
                    {property?.status && (
                      <StatusBadge status={property.status} className="ml-5 relative b-3" />
                    )}
                  </p>
                </div>
                
                {property?.daysOnMarket <= 7 && (
                  <span className="bg-success-100 text-success px-2 py-1 rounded-md text-xs font-medium">
                    New
                  </span>
                )}
              </div>

              <p className="text-text-secondary text-sm mb-3 truncate">
                {property?.address || 'Address not available'}
              </p>

              {/* Property Features */}
              <div className="flex items-center space-x-4 mb-3 text-sm text-text-secondary">
                {property?.bedrooms > 0 && (
                  <div className="flex items-center space-x-1">
                    <Icon name="Bed" size={16} />
                    <span>{property.bedrooms} bed</span>
                  </div>
                )}
                {property?.bathrooms > 0 && (
                  <div className="flex items-center space-x-1">
                    <Icon name="Bath" size={16} />
                    <span>{property.bathrooms} bath</span>
                  </div>
                )}
                {property?.sqft > 0 && (
                  <div className="flex items-center space-x-1">
                    <Icon name="Square" size={16} />
                    <span>{formatNumber(property.sqft)} sqft</span>
                  </div>
                )}
              </div>

              {/* Agent Info & Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {property?.agent?.name && (
                    <>
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-8 h-8" />
                      <span className="text-sm text-text-secondary">
                        {property.agent.name}
                      </span>
                    </>
                  )}
                </div>

                {isHovered && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleContactAgent}
                      className="px-3 py-1.5 bg-accent-100 text-accent-600 rounded-md text-sm font-medium hover:bg-accent-500 hover:text-white transition-all duration-200 ease-out"
                    >
                      Contact
                    </button>
                    <button className="px-3 py-1.5 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-700 transition-all duration-200 ease-out">
                      Tour
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Card Variant (Default)
  return (
    <Link
      to={`/property-details?id=${property?.id}`}
      className="block card hover:shadow-elevation-2 transition-all duration-200 ease-out micro-interaction"
    >
      {/* Property Images */}
      <div className="relative h-48 overflow-hidden rounded-t-lg">
        <Image
          src={displayImages?.[currentImageIndex]}
          alt={property?.title || 'Property image'}
          className="w-full h-full object-cover"
        />
        
        {/* Image Navigation */}
        {displayImages?.length > 1 && (
          <>
            <button
              onClick={(e) => handleImageNavigation('prev', e)}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 
                       bg-surface/90 rounded-full flex items-center justify-center
                       hover:bg-surface transition-all duration-200"
            >
              <Icon name="ChevronLeft" size={16} />
            </button>
            <button
              onClick={(e) => handleImageNavigation('next', e)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 
                       bg-surface/90 rounded-full flex items-center justify-center
                       hover:bg-surface transition-all duration-200"
            >
              <Icon name="ChevronRight" size={16} />
            </button>
          </>
        )}

        {/* Image Indicators */}
        {displayImages?.length > 1 && (
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 
                        flex space-x-1">
            {displayImages?.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}

        {/* Save Button */}
        <button
          onClick={handleSave}
          className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center
                     transition-all duration-200 ease-out ${
            property?.isSaved
              ? 'bg-error text-white' :'bg-surface/90 text-text-secondary hover:bg-surface hover:text-error'
          }`}
        >
          <Icon 
            name="Heart" 
            size={18} 
            fill={property?.isSaved ? "currentColor" : "none"} 
          />
        </button>

        {/* New Badge */}
        {property?.daysOnMarket <= 7 && (
          <div className="absolute top-3 left-3 bg-success text-white px-2 py-1 rounded-md text-xs font-medium">
            New
          </div>
        )}
      </div>

      {/* Property Details */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-text-primary truncate">
              {property?.title || 'No title'}
              {property?.status && (
                <StatusBadge status={property.status} className="ml-2" />
              )}
            </h3>
            <p className="text-xl font-bold text-primary">
              {formatPrice(property?.price)}
            </p>
          </div>
        </div>

        <p className="text-text-secondary text-sm mb-3 truncate">
          {property?.address || 'Address not available'}
        </p>

        {/* Property Features */}
        <div className="flex items-center space-x-4 mb-4 text-sm text-text-secondary">
          {property?.bedrooms > 0 && (
            <div className="flex items-center space-x-1">
              <Icon name="Bed" size={16} />
              <span>{property.bedrooms}</span>
            </div>
          )}
          {property?.bathrooms > 0 && (
            <div className="flex items-center space-x-1">
              <Icon name="Bath" size={16} />
              <span>{property.bathrooms}</span>
            </div>
          )}
          {property?.sqft > 0 && (
            <div className="flex items-center space-x-1">
              <Icon name="Square" size={16} />
              <span>{formatNumber(property.sqft)} sqft</span>
            </div>
          )}
        </div>

        {/* Agent Info */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center space-x-2">
            {property?.agent?.name && (
              <>
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-8 h-8" />
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {property.agent.name}
                  </p>
                  {property?.agent?.phone && (
                    <p className="text-xs text-text-secondary">
                      {property.agent.phone}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {property?.agent?.phone && (
              <button
                onClick={handleContactAgent}
                className="p-2 bg-accent-100 text-accent-600 rounded-md hover:bg-accent-500 hover:text-white transition-all duration-200 ease-out"
              >
                <Icon name="Phone" size={16} />
              </button>
            )}
            <button className="p-2 bg-primary text-white rounded-md hover:bg-primary-700 transition-all duration-200 ease-out">
              <Icon name="Calendar" size={16} />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;