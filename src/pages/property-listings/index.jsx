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
  const handleFilterChange = useCallback((filters) => {
    const newSearchParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (key === 'amenities') {
        if (Array.isArray(value) && value.length > 0) {
          newSearchParams.set(key, JSON.stringify(value));
        }
      } else if (value && value !== '' && value !== 'all') {
        newSearchParams.set(key, value);
      }
    });

    // Reset page to 1 when filters change
    setCurrentPage(1); 
    setSearchParams(newSearchParams);
    setSearchKeyword(filters.query || '');

    console.log('🎯 Filter change triggered, debounced API call will follow...');
  }, [setSearchParams]);

  // Handle property save/unsave
  const handlePropertySave = (propertyId, isSaved) => {
    setFilteredProperties(prev => prev.map(property =>
      property.id === propertyId ? { ...property, isSaved } : property
    ));
  };

  // Handle keyword search
  const handleKeywordSearch = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      handleFilterChange({ ...Object.fromEntries(searchParams), query: searchKeyword });
    }
  };

  // 🎯 DEBOUNCED REAL-TIME SEARCH - Updates UI immediately, API call is debounced
  const handleSearchInputChange = useCallback((value) => {
    setSearchKeyword(value);
    handleFilterChange({ ...Object.fromEntries(searchParams), query: value });
  }, [searchParams, handleFilterChange]);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    
    if (desktopListRef.current) {
      desktopListRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } else {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  // Get breadcrumbs
  const getBreadcrumbs = () => {
    const breadcrumbs = [
      { label: 'Home', path: '/homepage' },
      { label: 'Properties', path: '/property-listings' }
    ];

    const location = searchParams.get('location');
    const propertyType = searchParams.get('propertyType');

    if (location) {
      breadcrumbs.push({ label: location, path: null });
    }

    if (propertyType && propertyType !== 'all') {
      breadcrumbs.push({ 
        label: propertyType.charAt(0).toUpperCase() + propertyType.slice(1), 
        path: null 
      });
    }

    return breadcrumbs;
  };

  // 🧪 CACHE MANAGEMENT UTILITIES FOR DEBUGGING
  const clearCache = () => {
    propertyCache.clear();
    console.log('💾 Cache manually cleared');
  };

  const getCacheStats = () => {
    console.log('💾 Cache Stats:', {
      size: propertyCache.size(),
      maxSize: propertyCache.maxSize
    });
  };

  // Rendering debugging
  console.log('🎨 Rendering with state:', {
    loading,
    error,
    propertiesCount: properties.length,
    filteredPropertiesCount: filteredProperties.length,
    currentPropertiesCount: currentProperties.length,
    viewMode,
    currentPage,
    totalPages,
    cacheSize: propertyCache.size(),
    debouncedSearchParams: Object.fromEntries(debouncedSearchParams)
  });

  const helmet = (
    <Helmet>
      <title>Property Listings | EstateHub</title>
      <meta name="description" content="Find your dream property with EstateHub." />
    </Helmet>
  );

  return (
    <>
      {helmet}
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        
        <main className="flex-grow pt-16 lg:pt-20">
          {/* Search Results Header */}
          <div className="bg-surface border-b border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl md:text-2xl font-bold text-text-primary">
                    Properties for Sale
                  </h1>
                  <div className="flex items-center flex-wrap gap-2 mt-1">
                    <p className="text-sm md:text-base text-text-secondary">
                      {loading ? 'Loading...' : 
                        `Showing ${(currentPage - 1) * itemsPerPage + 1} to ${
                          Math.min(currentPage * itemsPerPage, totalResults)
                        } of ${totalResults} properties`}
                    </p>
                    {/* Cache status indicator for debugging */}
                    <span className="text-xs text-text-secondary bg-secondary-100 px-2 py-1 rounded-full">
                      💾 Cache: {propertyCache.size()}/{propertyCache.maxSize}
                    </span>
                  </div>
                </div>

                {/* Mobile Controls */}
                <div className="flex md:hidden items-center justify-between gap-2 w-full">
                  {/* Mobile Search Input */}
                  <div className="relative flex-1">
                    <input
                      type="text"
                      className="pl-10 pr-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent w-full transition-all duration-200"
                      placeholder="Search..."
                      value={searchKeyword}
                      onChange={(e) => handleSearchInputChange(e.target.value)}
                      onKeyDown={handleKeywordSearch}
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Icon name="Search" size={16} className="text-text-secondary" />
                    </div>
                  </div>

                  {/* Mobile Filter Button */}
                  <button
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className="flex items-center justify-center h-11 w-11 bg-primary text-white rounded-lg shadow-sm hover:bg-primary-700 transition-all duration-300 transform hover:scale-105 active:scale-95"
                  >
                    <Icon name="SlidersHorizontal" size={18} />
                  </button>
                </div>

                {/* Desktop Controls */}
                <div className="hidden md:flex items-center gap-3">
                  {/* Keyword Search */}
                  <div className="relative">
                    <input
                      type="text"
                      className="pl-10 pr-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent w-64 transition-all duration-200"
                      placeholder="Search properties..."
                      value={searchKeyword}
                      onChange={(e) => handleSearchInputChange(e.target.value)}
                      onKeyDown={handleKeywordSearch}
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Icon name="Search" size={16} className="text-text-secondary" />
                    </div>
                  </div>

                  {/* Sort Dropdown */}
                  <SortDropdown value={sortBy} onChange={handleSortChange} />

                  {/* Filter Toggle */}
                  <button
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className="flex items-center space-x-2 px-4 py-2.5 bg-primary text-white rounded-lg shadow-sm hover:bg-primary-700 transition-all duration-300 transform hover:scale-105 active:scale-95"
                  >
                    <Icon name="SlidersHorizontal" size={16} />
                    <span>Filters</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex gap-6 relative items-start">
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

              {/* Mobile Filter Panel */}
              <FilterPanel
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                onFilterChange={handleFilterChange}
                initialFilters={{
                  query: searchParams.get('query') || '',
                  location: searchParams.get('location') || '',
                  propertyType: searchParams.get('propertyType') || '',
                  minPrice: searchParams.get('minPrice') || '',
                  maxPrice: searchParams.get('maxPrice') || '',
                  bedrooms: searchParams.get('bedrooms') || '',
                  bathrooms: searchParams.get('bathrooms') || '',
                  amenities: searchParams.get('amenities') ? JSON.parse(searchParams.get('amenities')) : []
                }}
                variant="mobile"
              />

              {/* Content Area */}
              <div className={`
                flex-1 min-w-0 transition-all duration-300 ease-in-out
                ${isFilterPanelCollapsed ? 'max-w-full' : ''}
              `}>  
                {/* View Toggle and Sort Controls */}
                <div className="flex items-center justify-between mb-6">
                  {/* Left Side: Filter Button + View Toggle */}
                  <div className="flex items-center gap-3">
                    {/* Filter Toggle Button (when collapsed) */}
                    {isFilterPanelCollapsed && (
                      <button
                        onClick={() => setIsFilterPanelCollapsed(false)}
                        className="hidden lg:flex items-center space-x-2 px-4 py-2 bg-secondary-100 text-text-primary rounded-lg hover:bg-secondary-200 transition-all duration-300 transform hover:scale-105"
                        title="Show filters"
                      >
                        <Icon name="SlidersHorizontal" size={16} />
                        <span className="text-sm font-medium">Filters</span>
                      </button>
                    )}

                    {/* View Toggle */}
                    <div className="flex bg-secondary-100 rounded-lg p-1">
                      <button
                        onClick={() => setViewMode('list')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center transform ${
                          viewMode === 'list' 
                            ? 'bg-surface text-text-primary shadow-sm scale-105' 
                            : 'text-text-secondary hover:text-text-primary hover:bg-secondary-50'
                        }`}
                      >
                        <Icon name="Grid3X3" size={16} className="mr-1.5" />
                        <span>Grid</span>
                      </button>
                      <button
                        onClick={() => setViewMode('map')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center transform ${
                          viewMode === 'map' 
                            ? 'bg-surface text-text-primary shadow-sm scale-105' 
                            : 'text-text-secondary hover:text-text-primary hover:bg-secondary-50'
                        }`}
                      >
                        <Icon name="Map" size={16} className="mr-1.5" />
                        <span>Map</span>
                      </button>
                    </div>
                  </div>

                  {/* Results Count */}
                  <div className="text-sm text-text-secondary hidden sm:block">
                    <span className="animate-pulse">{totalResults}</span> properties found
                  </div>
                </div>

                {/* Properties Grid/Map View */}
                {viewMode === 'list' ? (
                  <div className="space-y-8">
                    {loading ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                        {[...Array(12)].map((_, index) => (
                          <div key={index} className="card p-0 rounded-xl overflow-hidden animate-pulse">
                            <div className="w-full h-48 bg-secondary-200"></div>
                            <div className="p-4 space-y-3">
                              <div className="h-4 bg-secondary-200 rounded w-3/4"></div>
                              <div className="h-3 bg-secondary-200 rounded w-1/2"></div>
                              <div className="h-3 bg-secondary-200 rounded w-2/3"></div>
                              <div className="flex space-x-2">
                                <div className="h-3 bg-secondary-200 rounded w-16"></div>
                                <div className="h-3 bg-secondary-200 rounded w-16"></div>
                                <div className="h-3 bg-secondary-200 rounded w-16"></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <>
                        {/* Properties Grid */}
                        <div 
                          ref={desktopListRef}
                          className="grid gap-6 transition-all duration-300"
                          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))' }}
                        >
                          {currentProperties.length > 0 ? (
                            currentProperties.map((property, index) => (
                              <div
                                key={property.id}
                                className="transform transition-all duration-300 hover:scale-105 hover:-translate-y-1"
                                style={{
                                  animationDelay: `${index * 50}ms`,
                                  animation: 'fadeInUp 0.6s ease-out forwards'
                                }}
                                onMouseEnter={() => setSelectedProperty(property)}
                                onMouseLeave={() => setSelectedProperty(null)}
                              >
                                <PropertyCard
                                  property={property}
                                  variant="card"
                                  onSave={handlePropertySave}
                                  isHighlighted={selectedProperty?.id === property.id}
                                />
                              </div>
                            ))
                          ) : (
                            <div className="col-span-full text-center py-16 animate-fadeIn">
                              <div className="max-w-md mx-auto">
                                <Icon name="Search" size={64} className="text-secondary mx-auto mb-6 animate-pulse" />
                                <h3 className="text-xl font-semibold text-text-primary mb-3">
                                  No properties found
                                </h3>
                                <p className="text-text-secondary mb-6">
                                  Try adjusting your search criteria or filters to see more results
                                </p>
                                <button
                                  onClick={() => {
                                    setSearchParams(new URLSearchParams());
                                    setSearchKeyword('');
                                  }}
                                  className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-700 transition-all duration-300 transform hover:scale-105"
                                >
                                  Clear All Filters
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Modern Pagination Controls */}
                        {filteredProperties.length > 0 && totalPages > 1 && (
                          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 mt-8 border-t border-border">
                            <div className="text-sm text-text-secondary order-2 sm:order-1">
                              Page <span className="font-medium text-primary">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
                            </div>
                            
                            <div className="flex items-center gap-1 order-1 sm:order-2">
                              {/* First Page */}
                              <button
                                onClick={() => handlePageChange(1)}
                                disabled={currentPage === 1}
                                className={`p-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                                  currentPage === 1 
                                    ? 'text-text-secondary cursor-not-allowed opacity-50' 
                                    : 'text-text-primary hover:bg-secondary-100 transform hover:scale-110'
                                }`}
                                title="First page"
                              >
                                <Icon name="ChevronsLeft" size={16} />
                              </button>
                              
                              {/* Previous Page */}
                              <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`p-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                                  currentPage === 1 
                                    ? 'text-text-secondary cursor-not-allowed opacity-50' 
                                    : 'text-text-primary hover:bg-secondary-100 transform hover:scale-110'
                                }`}
                                title="Previous page"
                              >
                                <Icon name="ChevronLeft" size={16} />
                              </button>
                              
                              {/* Page Numbers */}
                              <div className="flex gap-1 mx-2">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                  let pageNumber;
                                  if (totalPages <= 5) {
                                    pageNumber = i + 1;
                                  } else if (currentPage <= 3) {
                                    pageNumber = i + 1;
                                  } else if (currentPage >= totalPages - 2) {
                                    pageNumber = totalPages - 4 + i;
                                  } else {
                                    pageNumber = currentPage - 2 + i;
                                  }
                                  
                                  return (
                                    <button
                                      key={pageNumber}
                                      onClick={() => handlePageChange(pageNumber)}
                                      className={`w-10 h-10 rounded-lg text-sm font-medium flex items-center justify-center transition-all duration-300 transform ${
                                        currentPage === pageNumber
                                          ? 'bg-primary text-white shadow-md scale-110'
                                          : 'text-text-primary hover:bg-secondary-100 hover:scale-110'
                                      }`}
                                    >
                                      {pageNumber}
                                    </button>
                                  );
                                })}
                              </div>
                              
                              {/* Next Page */}
                              <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`p-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                                  currentPage === totalPages 
                                    ? 'text-text-secondary cursor-not-allowed opacity-50' 
                                    : 'text-text-primary hover:bg-secondary-100 transform hover:scale-110'
                                }`}
                                title="Next page"
                              >
                                <Icon name="ChevronRight" size={16} />
                              </button>
                              
                              {/* Last Page */}
                              <button
                                onClick={() => handlePageChange(totalPages)}
                                disabled={currentPage === totalPages}
                                className={`p-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                                  currentPage === totalPages 
                                    ? 'text-text-secondary cursor-not-allowed opacity-50' 
                                    : 'text-text-primary hover:bg-secondary-100 transform hover:scale-110'
                                }`}
                                title="Last page"
                              >
                                <Icon name="ChevronsRight" size={16} />
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  // <div className="h-[70vh] rounded-xl overflow-hidden border border-border shadow-lg transition-all duration-500 transform">
                  <div className="transition-all duration-500 transform">
                    <MapView
                      properties={filteredProperties}
                      selectedProperty={selectedProperty}
                      onPropertySelect={setSelectedProperty}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }

        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }

        /* Custom scrollbar for desktop list */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e0 transparent;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e0;
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #a0aec0;
        }

        /* Smooth transitions for all interactive elements */
        .transition-all {
          transition-property: all;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Micro-interactions */
        .hover-lift:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        /* Staggered animation for grid items */
        @keyframes staggerFadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .grid > div {
          animation: staggerFadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }

        /* Progressive delay for grid items */
        .grid > div:nth-child(1) { animation-delay: 0ms; }
        .grid > div:nth-child(2) { animation-delay: 50ms; }
        .grid > div:nth-child(3) { animation-delay: 100ms; }
        .grid > div:nth-child(4) { animation-delay: 150ms; }
        .grid > div:nth-child(5) { animation-delay: 200ms; }
        .grid > div:nth-child(6) { animation-delay: 250ms; }
        .grid > div:nth-child(7) { animation-delay: 300ms; }
        .grid > div:nth-child(8) { animation-delay: 350ms; }
        .grid > div:nth-child(9) { animation-delay: 400ms; }
        .grid > div:nth-child(10) { animation-delay: 450ms; }
        .grid > div:nth-child(11) { animation-delay: 500ms; }
        .grid > div:nth-child(12) { animation-delay: 550ms; }

        /* Loading shimmer effect */
        @keyframes shimmer {
          0% {
            background-position: -200px 0;
          }
          100% {
            background-position: calc(200px + 100%) 0;
          }
        }

        .animate-pulse {
          background: linear-gradient(90deg, #f0f0f0 25%, transparent 50%, #f0f0f0 75%);
          background-size: 200px 100%;
          animation: shimmer 1.5s infinite;
        }

        /* Responsive grid adjustments */
        @media (max-width: 768px) {
          .grid > div {
            animation-delay: 0ms !important;
          }
        }
      `}</style>
    </>
  );
};

export default PropertyListings;
