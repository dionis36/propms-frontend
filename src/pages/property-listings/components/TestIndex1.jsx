import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Footer from '../../components/ui/Footer';
import Icon from '../../components/AppIcon';
import { Helmet } from 'react-helmet-async';
import { useProperties } from '../../hooks/useProperties';

import PropertyCard from './components/PropertyCard';
import FilterPanel from './components/FilterPanel';
import MapView from './components/MapView';
import SortDropdown from './components/SortDropdown';

// 🎯 DEBOUNCE UTILITY FUNCTION
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// 💾 CLIENT-SIDE CACHE UTILITY
class PropertyCache {
  constructor(maxSize = 50) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  generateKey(page, itemsPerPage, searchParams) {
    const params = Object.fromEntries(searchParams);
    return JSON.stringify({ page, itemsPerPage, ...params });
  }

  get(page, itemsPerPage, searchParams) {
    const key = this.generateKey(page, itemsPerPage, searchParams);
    const cached = this.cache.get(key);
    
    if (cached) {
      console.log('💾 Cache HIT for:', key);
      // Move to end (LRU)
      this.cache.delete(key);
      this.cache.set(key, cached);
      return cached;
    }
    
    console.log('💾 Cache MISS for:', key);
    return null;
  }

  set(page, itemsPerPage, searchParams, data) {
    const key = this.generateKey(page, itemsPerPage, searchParams);
    
    // Remove oldest if at max size
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    const cacheEntry = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + (5 * 60 * 1000) // 5 minutes TTL
    };
    
    this.cache.set(key, cacheEntry);
    console.log('💾 Cache SET for:', key);
  }

  isExpired(entry) {
    return Date.now() > entry.expiresAt;
  }

  clear() {
    this.cache.clear();
    console.log('💾 Cache CLEARED');
  }

  size() {
    return this.cache.size;
  }
}

// Global cache instance
const propertyCache = new PropertyCache();

const PropertyListings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('list');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isFilterPanelCollapsed, setIsFilterPanelCollapsed] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [sortBy, setSortBy] = useState('relevance');
  const [searchKeyword, setSearchKeyword] = useState(searchParams.get('query') || '');
  const desktopListRef = useRef();

  const [filteredProperties, setFilteredProperties] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12); // Increased for grid layout

  const isInitialMount = useRef(true);

  // 🎯 DEBOUNCED SEARCH PARAMS - Only triggers API call after 500ms of inactivity
  const debouncedSearchParams = useDebounce(searchParams, 500);

  // Prepare filters for useProperties hook
  const filters = useMemo(() => {
    const params = Object.fromEntries(debouncedSearchParams);
    return {
      query: params.query || '',
      location: params.location || '',
      propertyType: params.propertyType || '',
      minPrice: params.minPrice || '',
      maxPrice: params.maxPrice || '',
      bedrooms: params.bedrooms || '',
      bathrooms: params.bathrooms || '',
      amenities: params.amenities ? JSON.parse(params.amenities) : []
    };
  }, [debouncedSearchParams]);

  // 🚀 USE PROPERTIES HOOK - Replaces manual data fetching
  const {
    data: apiResponse,
    isLoading: loading,
    error: queryError,
    isError
  } = useProperties({
    page: currentPage,
    limit: itemsPerPage,
    filters
  });

  // Process error state
  const error = isError ? 'Failed to load properties. Please try again later.' : null;

  // Extract data from API response
  const properties = apiResponse?.results || [];
  const totalResults = apiResponse?.count || 0;
  const totalPages = Math.ceil(totalResults / itemsPerPage);
  const currentProperties = filteredProperties;

  // Enhanced formatListings function with debugging:
  const formatListings = useCallback((apiData) => {
    console.log('🔄 Starting formatListings with:', apiData);
    console.log('📊 Input data length:', apiData.length);
    
    if (!Array.isArray(apiData)) {
      console.error('❌ formatListings received non-array:', typeof apiData);
      return [];
    }
    
    const formatted = apiData.map((property, index) => {
      console.log(`🏠 Processing property ${index + 1}:`, property);
      
      // Check for required fields
      const requiredFields = ['id', 'title', 'price', 'location'];
      const missingFields = requiredFields.filter(field => !property[field]);
      if (missingFields.length > 0) {
        console.warn(`⚠️ Property ${index + 1} missing fields:`, missingFields);
      }
      
      // Debug media processing
      console.log(`📷 Property ${index + 1} media:`, property.media);
      const images = property.media
        ? property.media.filter(media => media && media.image).map(media => media.image)
        : [];
      console.log(`🖼️ Property ${index + 1} processed images:`, images);
      
      // Debug amenities processing
      let amenities = [];
      if (property.amenities) {
        if (Array.isArray(property.amenities)) {
          amenities = property.amenities;
          console.log(`🎯 Property ${index + 1} amenities:`, amenities);
        } else if (typeof property.amenities === 'string') {
          try {
            amenities = JSON.parse(property.amenities);
            console.log(`🎯 Property ${index + 1} amenities:`, amenities);
          } catch (e) {
            console.warn(`⚠️ Property ${index + 1} amenities parsing failed:`, e);
            amenities = [];
          }
        } else {
          console.warn(`⚠️ Property ${index + 1} has no valid amenities`);
        }
      } else {
        console.warn(`⚠️ Property ${index + 1} has no amenities`);
      }
      
      const formattedProperty = {
        id: property.id,
        title: property.title || 'Untitled Property',
        price: parseFloat(property.price) || 0,
        address: property.location || 'Address not available',
        bedrooms: parseInt(property.bedrooms) || 0,
        bathrooms: parseInt(property.bathrooms) || 0,
        sqft: 0,
        propertyType: property.property_type?.toLowerCase() || 'unknown',
        status: property.status || 'available',
        images: images,
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
      
      console.log(`✅ Property ${index + 1} formatted:`, formattedProperty);
      return formattedProperty;
    });
    
    console.log('🎉 formatListings completed. Result:', formatted);
    return formatted;
  }, []);

  // Client-side filtering and sorting
  const applyFilters = useCallback((propertiesToFilter = properties) => {
    console.log('🔍 Applying filters to:', propertiesToFilter.length, 'properties');
    
    let filtered = [...propertiesToFilter];
    console.log('📊 Starting with:', filtered.length, 'properties');
    
    const currentParams = Object.fromEntries(searchParams);
    console.log('🔧 Current search params:', currentParams);
    
    const query = searchParams.get('query') || '';
    const location = searchParams.get('location');
    const propertyType = searchParams.get('propertyType');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const bedrooms = searchParams.get('bedrooms');
    const bathrooms = searchParams.get('bathrooms');

    // Apply each filter with logging
    if (query) {
      const beforeLength = filtered.length;
      filtered = filtered.filter(property =>
        property.title.toLowerCase().includes(query.toLowerCase()) ||
        property.address.toLowerCase().includes(query.toLowerCase()) ||
        property.description.toLowerCase().includes(query.toLowerCase())
      );
      console.log(`🔍 Query filter "${query}": ${beforeLength} → ${filtered.length}`);
    }

    if (location) {
      const beforeLength = filtered.length;
      filtered = filtered.filter(property =>
        property.address.toLowerCase().includes(location.toLowerCase())
      );
      console.log(`📍 Location filter "${location}": ${beforeLength} → ${filtered.length}`);
    }

    if (propertyType && propertyType !== 'all') {
      const beforeLength = filtered.length;
      filtered = filtered.filter(property =>
        property.propertyType === propertyType
      );
      console.log(`🏠 PropertyType filter "${propertyType}": ${beforeLength} → ${filtered.length}`);
    }

    if (minPrice) {
      const beforeLength = filtered.length;
      const minPriceNum = parseFloat(minPrice);
      filtered = filtered.filter(property =>
        property.price >= minPriceNum
      );
      console.log(`💰 MinPrice filter "${minPrice}": ${beforeLength} → ${filtered.length}`);
    }

    if (maxPrice) {
      const beforeLength = filtered.length;
      const maxPriceNum = parseFloat(maxPrice);
      filtered = filtered.filter(property =>
        property.price <= maxPriceNum
      );
      console.log(`💰 MaxPrice filter "${maxPrice}": ${beforeLength} → ${filtered.length}`);
    }

    if (bedrooms) {
      const beforeLength = filtered.length;
      filtered = filtered.filter(property =>
        property.bedrooms >= parseInt(bedrooms)
      );
      console.log(`🛏️ Bedrooms filter "${bedrooms}": ${beforeLength} → ${filtered.length}`);
    }

    if (bathrooms) {
      const beforeLength = filtered.length;
      filtered = filtered.filter(property =>
        property.bathrooms >= parseInt(bathrooms)
      );
      console.log(`🚿 Bathrooms filter "${bathrooms}": ${beforeLength} → ${filtered.length}`);
    }

    // Apply sorting
    filtered = sortProperties(filtered, sortBy);
    console.log(`📊 Final filtered properties: ${filtered.length}`);
    console.log('🎯 Final filtered list:', filtered);
    
    setFilteredProperties(filtered);
  }, [properties, searchParams, sortBy]);

  // API VALIDATION
  const validateApiResponse = (data) => {
    if (!Array.isArray(data)) {
      console.error('❌ API response is not an array');
      return false;
    }
    
    if (data.length === 0) {
      console.warn('⚠️ API response is empty array');
      return true;
    }
    
    const firstItem = data[0];
    const requiredFields = ['id', 'title', 'price', 'location'];
    const missingFields = requiredFields.filter(field => !(field in firstItem));
    
    if (missingFields.length > 0) {
      console.error('❌ API response missing required fields:', missingFields);
      console.error('📋 Available fields:', Object.keys(firstItem));
      return false;
    }
    
    console.log('✅ API response structure is valid');
    return true;
  };

  // Process data when API response changes
  useEffect(() => {
    if (properties && properties.length > 0) {
      console.log('🔄 Processing API data...');
      validateApiResponse(properties);
      // 💾 CACHE THE RESPONSE (simulating cache behavior for consistency)
      propertyCache.set(currentPage, itemsPerPage, debouncedSearchParams, { results: properties, count: totalResults });
      // Format and apply filters
      const formatted = formatListings(properties);
      applyFilters(formatted);
      console.log(`✅ Loaded page ${currentPage} with ${formatted.length} properties`);
    } else if (properties && properties.length === 0 && !loading) {
      setFilteredProperties([]);
    }
  }, [properties, formatListings, applyFilters, currentPage, itemsPerPage, debouncedSearchParams, totalResults, loading]);

  // Mark initial mount as complete
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    }
  }, []);

  // Component state debugging
  useEffect(() => {
    console.log('📊 Properties state changed:', properties.length);
  }, [properties]);

  useEffect(() => {
    console.log('🔍 FilteredProperties state changed:', filteredProperties.length);
  }, [filteredProperties]);

  useEffect(() => {
    console.log('⏳ Loading state changed:', loading);
  }, [loading]);

  useEffect(() => {
    console.log('❌ Error state changed:', error);
  }, [error]);

  // Log cache stats
  useEffect(() => {
    console.log('💾 Cache size:', propertyCache.size());
  }, [debouncedSearchParams]);

  // Sort properties
  const sortProperties = (propertiesToSort, sortOption) => {
    const sorted = [...propertiesToSort];
    switch (sortOption) {
      case 'price-low':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-high':
        return sorted.sort((a, b) => b.price - a.price);
      case 'newest':
        return sorted.sort((a, b) => a.daysOnMarket - b.daysOnMarket);
      case 'oldest':
        return sorted.sort((a, b) => b.daysOnMarket - a.daysOnMarket);
      case 'size':
        return sorted.sort((a, b) => b.sqft - a.sqft);
      default:
        return sorted;
    }
  };

  // Handle sort change
  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
    const sorted = sortProperties(filteredProperties, newSortBy);
    setFilteredProperties(sorted);
    setCurrentPage(1);
  };

  // 🎯 DEBOUNCED FILTER CHANGE - This now updates searchParams immediately for UI responsiveness
  // but the actual API call is debounced via debouncedSearchParams
  const handleFilterChange = (newFilters) => {
    console.log('📝 Handling filter change:', newFilters);
    const newSearchParams = new URLSearchParams(searchParams);

    // Update query params with new filters
    Object.keys(newFilters).forEach(key => {
      const value = newFilters[key];
      if (Array.isArray(value)) {
        newSearchParams.set(key, JSON.stringify(value));
      } else if (value) {
        newSearchParams.set(key, value);
      } else {
        newSearchParams.delete(key);
      }
    });

    setSearchParams(newSearchParams);
  };
  
  // Handlers for UI interaction
  const handleToggleMapView = () => {
    setViewMode(prevMode => prevMode === 'list' ? 'map' : 'list');
  };

  const handleOpenFilter = () => {
    setIsFilterOpen(true);
  };

  const handleCloseFilter = () => {
    setIsFilterOpen(false);
  };

  const handleCardHover = useCallback((property) => {
    setSelectedProperty(property);
  }, []);

  const handleCardLeave = useCallback(() => {
    setSelectedProperty(null);
  }, []);
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to the top of the listing section on desktop
    if (desktopListRef.current && window.innerWidth >= 1024) {
      desktopListRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Loading shimmer grid items
  const ShimmerGrid = () => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {[...Array(itemsPerPage)].map((_, index) => (
          <div key={index} className="bg-surface-secondary p-4 rounded-xl shadow-sm transition-all duration-300">
            <div className="h-48 bg-surface-primary rounded-lg mb-4 shimmer-bg"></div>
            <div className="h-6 bg-surface-primary rounded-md mb-2 shimmer-bg w-3/4"></div>
            <div className="h-4 bg-surface-primary rounded-md shimmer-bg w-1/2"></div>
            <div className="mt-4 flex items-center justify-between">
              <div className="h-4 w-16 bg-surface-primary rounded-md shimmer-bg"></div>
              <div className="h-4 w-12 bg-surface-primary rounded-md shimmer-bg"></div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // No results state
  const NoResults = () => (
    <div className="flex flex-col items-center justify-center p-8 text-center text-text-secondary h-[40vh]">
      <Icon name="SearchX" size={48} className="mb-4" />
      <h3 className="text-xl font-semibold text-text-primary">No Properties Found</h3>
      <p className="mt-2 text-md max-w-sm">
        We couldn't find any properties matching your search criteria.
        Try adjusting your filters or search terms.
      </p>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Property Listings - Your Real Estate Platform</title>
        <meta name="description" content="Browse and filter real estate properties for sale or rent. Find your dream home with our advanced search tools." />
      </Helmet>
      <Header onOpenFilter={handleOpenFilter} />

      <main className="container mx-auto px-4 mt-6 lg:mt-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-text-primary">
            Property Listings
          </h1>
          <div className="flex items-center space-x-2">
            <SortDropdown sortBy={sortBy} onSortChange={handleSortChange} />
            <button
              onClick={handleToggleMapView}
              className="p-2 bg-surface-secondary text-text-secondary rounded-lg hover:bg-surface-tertiary transition-colors duration-200"
              aria-label={viewMode === 'list' ? 'Switch to map view' : 'Switch to list view'}
            >
              <Icon name={viewMode === 'list' ? 'Map' : 'LayoutGrid'} size={20} />
            </button>
          </div>
        </div>

        {/* The main content area with filter panel and listings */}
        <div className="flex flex-col lg:flex-row lg:gap-6 relative">
          
          {/* Mobile Filter Panel */}
          {isFilterOpen && (
            <FilterPanel
              isOpen={isFilterOpen}
              onClose={handleCloseFilter}
              onFilterChange={handleFilterChange}
              initialFilters={Object.fromEntries(searchParams)}
            />
          )}

          {/* Desktop Filter Panel */}
          {!isFilterOpen && !isFilterPanelCollapsed && (
            <div className="hidden lg:block lg:w-80 flex-shrink-0">
              <FilterPanel
                isOpen={true}
                onClose={() => setIsFilterPanelCollapsed(true)} // Example: Can collapse
                onFilterChange={handleFilterChange}
                initialFilters={Object.fromEntries(searchParams)}
              />
            </div>
          )}

          {/* Main Listings/Map Content */}
          <div className="flex-1 min-w-0" ref={desktopListRef}>
            {viewMode === 'list' ? (
              <>
                {loading && <ShimmerGrid />}
                {error && <div className="text-center text-error p-4">{error}</div>}
                {!loading && !error && filteredProperties.length === 0 && <NoResults />}
                
                {!loading && filteredProperties.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProperties.map(property => (
                      <PropertyCard
                        key={property.id}
                        property={property}
                        onMouseEnter={() => handleCardHover(property)}
                        onMouseLeave={handleCardLeave}
                      />
                    ))}
                  </div>
                )}

                {/* Pagination (placeholder) */}
                {/*
                {!loading && filteredProperties.length > 0 && (
                  <div className="flex justify-center mt-8">
                    <button className="p-2 mx-1 border rounded">1</button>
                    <button className="p-2 mx-1 border rounded">2</button>
                    <button className="p-2 mx-1 border rounded">3</button>
                  </div>
                )}
                */}
              </>
            ) : (
              <MapView 
                properties={filteredProperties}
                selectedProperty={selectedProperty}
              />
            )}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default PropertyListings;

