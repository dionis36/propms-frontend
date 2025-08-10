import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import StatusBadge from '../../../components/StatusBadge';
import { useProperties } from '../../../hooks/useProperties';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import { useFavorites } from '../../../contexts/FavoritesContext';
import UserAvatar from '../../../components/ui/UserAvatar';

const FeaturedProperties = () => {
  const [copiedPhone, setCopiedPhone] = useState(null);
  const { showToast } = useToast();
  const { isPropertySaved, handleToggleFavorite } = useFavorites();

  // Fetch featured properties from backend (limiting to 6 items)
  const {
    data: apiResponse,
    isLoading: loading,
    error: queryError,
    isError
  } = useProperties({
    page: 1,
    limit: 6,
    filters: {
      query: '',
      location: '',
      propertyType: '',
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      bathrooms: '',
      amenities: []
    }
  });

  // Extract and format properties from API response
  const properties = apiResponse?.results || [];

  // Backup images if property has no images
  const defaultImages = [
    "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
    "https://images.pixabay.com/photo/2016/11/18/17/46/house-1836070_1280.jpg",
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop",
    "https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
    "https://images.pixabay.com/photo/2017/04/10/22/28/residence-2219972_1280.jpg",
    "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop"
  ];

  // Format backend data to match component expectations
  const formatListings = (apiData) => {
    if (!Array.isArray(apiData)) return [];
    
    return apiData.map((property) => {
      // Process images
      const images = property.media
        ? property.media.filter(media => media && media.image).map(media => media.image)
        : [];
      
      // Use property images if available, otherwise use defaults
      const displayImages = images.length > 0 ? images : defaultImages;
      
      // Process amenities
      let amenities = [];
      if (property.amenities) {
        if (Array.isArray(property.amenities)) {
          amenities = property.amenities;
        } else if (typeof property.amenities === 'string') {
          try {
            amenities = JSON.parse(property.amenities);
          } catch (e) {
            amenities = [];
          }
        }
      }
      
      return {
        id: property.id,
        title: property.title || 'Untitled Property',
        price: parseFloat(property.price) || 0,
        address: property.location || 'Address not available',
        bedrooms: parseInt(property.bedrooms) || 0,
        bathrooms: parseInt(property.bathrooms) || 0,
        sqft: 0, // Backend doesn't provide sqft, keeping as 0
        propertyType: property.property_type?.toLowerCase() || 'unknown',
        status: property.status || 'available',
        images: displayImages,
        agent: {
          name: property.agent_name || 'Agent not available',
          phone: property.agent_phone_number || '',
        },
        coordinates: { 
          lat: parseFloat(property.latitude) || 0, 
          lng: parseFloat(property.longitude) || 0
        },
        isSaved: property.is_saved || false,
        daysOnMarket: property.days_since_posted || 0,
        amenities: amenities,
        description: property.description || ''
      };
    });
  };

  const featuredProperties = formatListings(properties);

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

  const copyToClipboard = async (phoneNumber, propertyId) => {
    try {
      await navigator.clipboard.writeText(phoneNumber);
      setCopiedPhone(propertyId);
      showToast('Phone number copied!', 'success');
      setTimeout(() => setCopiedPhone(null), 2000);
    } catch (error) {
      showToast('Failed to copy phone number', 'error');
    }
  };

  // Property Card Component - Exact same as PropertyCard.jsx
  const PropertyCard = ({ property }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    
    const agentFullName = property.agent.name;
    const nameParts = agentFullName.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts[nameParts.length - 1];

    const displayImages = property?.images?.length > 0 
      ? property.images 
      : defaultImages;

    const handleSave = async (e) => {
      e.preventDefault();
      e.stopPropagation();
      await handleToggleFavorite(property.id);
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
                className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-all duration-200 shadow-lg backdrop-blur-sm"
                aria-label="Previous image"
              >
                <Icon name="ChevronLeft" size={16} />
              </button>
              <button
                onClick={(e) => handleImageNavigation('next', e)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-all duration-200 shadow-lg backdrop-blur-sm"
                aria-label="Next image"
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
            className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-lg backdrop-blur-lg
                         transition-all duration-200 ease-out ${
                           isPropertySaved(property.id)
                             ? 'bg-error text-white'
                             : 'bg-black/50 text-white hover:bg-black/70'
                         }`}
            aria-label="Save property"
          >
            <Icon
              name="Heart"
              size={16}
              fill={isPropertySaved(property.id) ? 'currentColor' : 'none'}
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
          <div className="pt-3 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                {property?.agent?.name && (
                  <>
                    <UserAvatar firstName={firstName} lastName={lastName} size="w-10 h-10 text-base"/>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {property.agent.name}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {property?.agent?.phone && (
                <div className="flex items-center space-x-2 text-sm text-text-secondary ml-2 flex-shrink-0">
                  <span>{property.agent.phone}</span>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      copyToClipboard(property.agent.phone, property.id);
                    }}
                    className="p-1 text-text-secondary hover:text-primary-700 hover:bg-primary-50 rounded-full transition-colors duration-200"
                    title="Copy phone number"
                  >
                    {copiedPhone === property.id ? (
                      <Icon name="Check" size={12} className="text-green-500" />
                    ) : (
                      <Icon name="Copy" size={12} />
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  };

  if (loading) {
    return (
      <section className="py-16 lg:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mb-4 font-heading">
              Featured Properties
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Discover our handpicked selection of premium properties from top locations across the country
            </p>
          </div>

          {/* Loading Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-12">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-surface rounded-lg overflow-hidden shadow-elevation-1 animate-pulse">
                <div className="h-48 lg:h-56 bg-secondary-100"></div>
                <div className="p-4 lg:p-6 space-y-3">
                  <div className="h-4 bg-secondary-100 rounded"></div>
                  <div className="h-4 bg-secondary-100 rounded w-3/4"></div>
                  <div className="h-4 bg-secondary-100 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (isError || featuredProperties.length === 0) {
    return (
      <section className="py-16 lg:py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mb-4 font-heading">
              Featured Properties
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              No featured properties available at the moment
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 lg:py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mb-4 font-heading">
            Featured Properties
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Discover our handpicked selection of premium properties from top locations across the country
          </p>
        </div>

        {/* Properties Grid - Using exact same cards as PropertyCard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-12">
          {featuredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Link
                to="/property-listings"
                className="inline-flex items-center text-primary font-medium
                     transition-colors duration-200"
              >
                View all Properties
                <Icon name="ArrowRight" size={18} className="ml-2" />
              </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperties;