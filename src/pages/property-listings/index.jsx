import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import { Helmet } from 'react-helmet-async';
import { getAllProperties } from '../../services/api';

import PropertyCard from './components/PropertyCard';
import FilterPanel from './components/FilterPanel';
import MapView from './components/MapView';
import SortDropdown from './components/SortDropdown';

const PropertyListings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [sortBy, setSortBy] = useState('relevance');
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Items per page
  const [searchKeyword, setSearchKeyword] = useState(searchParams.get('query') || '');
  const desktopListRef = useRef();

  // Calculate pagination values
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProperties = filteredProperties.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);

  // DEBUGGING CHECKLIST FOR PROPERTY LISTINGS NOT DISPLAYING

// 1. API RESPONSE DEBUGGING
// Add this to your fetchProperties function in useEffect:

useEffect(() => {
  const fetchProperties = async () => {
    setLoading(true);
    try {
      console.log('🔍 Fetching properties from API...');
      const data = await getAllProperties();
      
      // DEBUG: Log the raw API response
      console.log('📥 Raw API Response:', data);
      console.log('📊 Response type:', typeof data);
      console.log('📋 Response length:', Array.isArray(data) ? data.length : 'Not an array');
      
      if (!data || !Array.isArray(data)) {
        console.error('❌ API response is not an array:', data);
        setError('Invalid data format received from server');
        return;
      }
      
      if (data.length === 0) {
        console.warn('⚠️ API returned empty array');
        setProperties([]);
        setFilteredProperties([]);
        return;
      }
      
      // DEBUG: Log first property structure
      console.log('🏠 First property structure:', data[0]);
      
      const formattedProperties = formatListings(data);
      console.log('✅ Formatted properties:', formattedProperties);
      console.log('📊 Formatted length:', formattedProperties.length);
      
      setProperties(formattedProperties);
      applyFilters(formattedProperties);
      setError(null);
    } catch (err) {
      console.error('💥 Error fetching properties:', err);
      console.error('📋 Error details:', {
        message: err.message,
        stack: err.stack,
        response: err.response
      });
      setError('Failed to load properties. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  fetchProperties();
}, []);

// 2. FORMAT LISTINGS DEBUGGING
// Enhanced formatListings function with debugging:

const formatListings = (apiData) => {
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
      sqft: 0, // Not provided in API
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
};

// 3. FILTER DEBUGGING
// Enhanced applyFilters function:

const applyFilters = (propertiesToFilter = properties) => {
  console.log('🔍 Applying filters to:', propertiesToFilter.length, 'properties');
  
  let filtered = [...propertiesToFilter];
  console.log('📊 Starting with:', filtered.length, 'properties');
  
  // Log all current search params
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
  setCurrentPage(1); // Reset to first page when filters change
};

// 4. COMPONENT STATE DEBUGGING
// Add this to your component to monitor state changes:

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

// 5. RENDERING DEBUGGING
// Add this just before your return statement:

console.log('🎨 Rendering with state:', {
  loading,
  error,
  propertiesCount: properties.length,
  filteredPropertiesCount: filteredProperties.length,
  currentPropertiesCount: currentProperties.length,
  viewMode,
  currentPage,
  totalPages
});

// 6. COMMON ISSUES TO CHECK:

/*
❌ POTENTIAL ISSUES:

1. API Response Format:
   - Check if API returns array or object with properties array
   - Verify field names match (location vs address, etc.)

2. Data Type Issues:
   - Ensure price is numeric
   - Check if media is array
   - Verify coordinate data types

3. Filter Issues:
   - Check if default filters are too restrictive
   - Verify search params are being read correctly

4. State Issues:
   - Properties array is empty
   - Filters removing all properties
   - Loading state stuck on true

5. Network Issues:
   - CORS errors
   - Authentication required
   - API endpoint returning errors

6. Component Issues:
   - Conditional rendering hiding content
   - CSS hiding elements
   - Wrong view mode selected
*/

// 7. QUICK FIXES TO TRY:

// Temporary bypass filters for testing:
const bypassFilters = () => {
  console.log('🚨 BYPASSING FILTERS FOR TESTING');
  setFilteredProperties(properties);
};

// Force show loading state:
const forceShowContent = () => {
  console.log('🚨 FORCING CONTENT DISPLAY');
  setLoading(false);
  setError(null);
};

// 8. API VALIDATION
// Add this to validate your API response structure:
const validateApiResponse = (data) => {
  if (!Array.isArray(data)) {
    console.error('❌ API response is not an array');
    return false;
  }
  
  if (data.length === 0) {
    console.warn('⚠️ API response is empty array');
    return true; // Empty is valid
  }
  
  // Check first item structure
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




  // Format API response to match frontend structure
  // const formatListings = (apiData) => {
  //   return apiData.map(property => ({
  //     id: property.id,
  //     title: property.title,
  //     price: parseFloat(property.price),
  //     address: property.location,
  //     bedrooms: property.bedrooms,
  //     bathrooms: property.bathrooms,
  //     sqft: 0, // Not provided in API
  //     propertyType: property.property_type.toLowerCase(),
  //     status: property.status,
  //     images: property.media
  //       .filter(media => media.image)
  //       .map(media => media.image),
  //     agent: {
  //       name: property.agent_name,
  //       phone: property.agent_phone_number,
  //     },
  //     coordinates: { 
  //       lat: parseFloat(property.latitude), 
  //       lng: parseFloat(property.longitude) 
  //     },
  //     isSaved: property.is_saved,
  //     daysOnMarket: property.days_since_posted,
  //     amenities: property.amenities && property.amenities.length > 0 
  //       ? JSON.parse(property.amenities[0]) 
  //       : [],
  //     description: property.description
  //   }));
  // };

  // Fetch properties from API
  // useEffect(() => {
  //   const fetchProperties = async () => {
  //     setLoading(true);
  //     try {
  //       const data = await getAllProperties();
  //       const formattedProperties = formatListings(data);
  //       setProperties(formattedProperties);
  //       applyFilters(formattedProperties);
  //       setError(null);
  //     } catch (err) {
  //       setError('Failed to load properties. Please try again later.');
  //       console.error('Error fetching properties:', err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchProperties();
  // }, []);

  // Apply filters based on search params
  // const applyFilters = (propertiesToFilter = properties) => {
  //   let filtered = [...propertiesToFilter];
    
  //   const query = searchParams.get('query') || '';
  //   const location = searchParams.get('location');
  //   const propertyType = searchParams.get('propertyType');
  //   const minPrice = searchParams.get('minPrice');
  //   const maxPrice = searchParams.get('maxPrice');
  //   const bedrooms = searchParams.get('bedrooms');
  //   const bathrooms = searchParams.get('bathrooms');

  //   if (query) {
  //     filtered = filtered.filter(property =>
  //       property.title.toLowerCase().includes(query.toLowerCase()) ||
  //       property.address.toLowerCase().includes(query.toLowerCase()) ||
  //       property.description.toLowerCase().includes(query.toLowerCase())
  //     );
  //   }

  //   if (location) {
  //     filtered = filtered.filter(property =>
  //       property.address.toLowerCase().includes(location.toLowerCase())
  //     );
  //   }

  //   if (propertyType && propertyType !== 'all') {
  //     filtered = filtered.filter(property =>
  //       property.propertyType === propertyType
  //     );
  //   }

  //   if (minPrice) {
  //     const minPriceNum = parseFloat(minPrice);
  //     filtered = filtered.filter(property =>
  //       property.price >= minPriceNum
  //     );
  //   }

  //   if (maxPrice) {
  //     const maxPriceNum = parseFloat(maxPrice);
  //     filtered = filtered.filter(property =>
  //       property.price <= maxPriceNum
  //     );
  //   }

  //   if (bedrooms) {
  //     filtered = filtered.filter(property =>
  //       property.bedrooms >= parseInt(bedrooms)
  //     );
  //   }

  //   if (bathrooms) {
  //     filtered = filtered.filter(property =>
  //       property.bathrooms >= parseInt(bathrooms)
  //     );
  //   }

  //   // Apply sorting
  //   filtered = sortProperties(filtered, sortBy);
    
  //   setFilteredProperties(filtered);
  //   setCurrentPage(1); // Reset to first page when filters change
  // };

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
    setCurrentPage(1); // Reset to first page when sorting changes
  };

  // Handle filter changes - Fixed to not include empty amenities
  const handleFilterChange = (filters) => {
    const newSearchParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (key === 'amenities') {
        // Only add amenities if array has items
        if (Array.isArray(value) && value.length > 0) {
          newSearchParams.set(key, JSON.stringify(value));
        }
      } else if (value && value !== '' && value !== 'all') {
        newSearchParams.set(key, value);
      }
    });
    
    setSearchParams(newSearchParams);
    setSearchKeyword(filters.query || '');
    applyFilters();
  };

  // Handle property save/unsave
  const handlePropertySave = (propertyId, isSaved) => {
    setProperties(prev => prev.map(property =>
      property.id === propertyId ? { ...property, isSaved } : property
    ));
    setFilteredProperties(prev => prev.map(property =>
      property.id === propertyId ? { ...property, isSaved } : property
    ));
  };

  // Handle keyword search - Modified for real-time search
  const handleKeywordSearch = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      handleFilterChange({ ...Object.fromEntries(searchParams), query: searchKeyword });
    }
  };

  // Handle real-time search input change
  const handleSearchInputChange = (value) => {
    setSearchKeyword(value);
    // Apply filter immediately as user types
    handleFilterChange({ ...Object.fromEntries(searchParams), query: value });
  };

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    
    // Scroll to top of property list
    if (desktopListRef.current) {
      desktopListRef.current.scrollTop = 0;
    }
    window.scrollTo(0, 0);
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

  const helmet = (
    <Helmet>
      <title>Property Listings | EstateHub</title>
      <meta name="description" content="Find your dream property with EstateHub." />
    </Helmet>
  );

  return (
    <>
      {helmet}
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16 lg:pt-18">
        {/* Search Results Header */}
        <div className="bg-surface border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-text-primary">
                  Properties for Sale
                </h1>
                <p className="text-text-secondary mt-1">
                  {loading ? 'Loading...' : 
                    `Showing ${Math.min(indexOfFirstItem + 1, filteredProperties.length)}-${Math.min(indexOfLastItem, filteredProperties.length)} of ${filteredProperties.length} properties`}
                </p>
              </div>

              {/* Mobile Controls */}
              <div className="flex sm:hidden items-center space-x-2">
                {/* Mobile Search Input */}
                <div className="relative flex-1">
                  <input
                    type="text"
                    className="pl-10 pr-4 py-3 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent w-full"
                    placeholder="Search..."
                    value={searchKeyword}
                    onChange={(e) => handleSearchInputChange(e.target.value)}
                    onKeyDown={handleKeywordSearch}
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icon name="Search" size={16} className="text-text-secondary" />
                  </div>
                </div>

                {/* Mobile View Toggle */}
                <div className="flex bg-secondary-100 rounded-md p-1">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded text-sm font-medium transition-all duration-200 ${
                      viewMode === 'list' ?'bg-surface text-text-primary shadow-sm' :'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <Icon name="List" size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode('map')}
                    className={`p-2 rounded text-sm font-medium transition-all duration-200 ${
                      viewMode === 'map' ?'bg-surface text-text-primary shadow-sm' :'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <Icon name="Map" size={16} />
                  </button>
                </div>

                {/* Mobile Sort Dropdown */}
                <div className="h-12">
                  <SortDropdown value={sortBy} onChange={handleSortChange} />
                </div>

                {/* Mobile Filter Button */}
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="flex items-center justify-center h-12 w-12 bg-primary text-white rounded-md hover:bg-primary-700 transition-all duration-200 ease-out micro-interaction"
                >
                  <Icon name="SlidersHorizontal" size={16} />
                </button>
              </div>

              {/* Desktop Controls */}
              <div className="hidden sm:flex items-center space-x-3">
                {/* Keyword Search */}
                <div className="relative">
                  <input
                    type="text"
                    className="pl-10 pr-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent w-64"
                    placeholder="Search by keyword..."
                    value={searchKeyword}
                    onChange={(e) => handleSearchInputChange(e.target.value)}
                    onKeyDown={handleKeywordSearch}
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icon name="Search" size={16} className="text-text-secondary" />
                  </div>
                </div>

                {/* View Toggle (Mobile) */}
                <div className="flex lg:hidden bg-secondary-100 rounded-md p-1">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-1.5 rounded text-sm font-medium transition-all duration-200 ${
                      viewMode === 'list' ?'bg-surface text-text-primary shadow-sm' :'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <Icon name="List" size={16} className="inline mr-1" />
                    List
                  </button>
                  <button
                    onClick={() => setViewMode('map')}
                    className={`px-3 py-1.5 rounded text-sm font-medium transition-all duration-200 ${
                      viewMode === 'map' ?'bg-surface text-text-primary shadow-sm' :'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <Icon name="Map" size={16} className="inline mr-1" />
                    Map
                  </button>
                </div>

                {/* Sort Dropdown */}
                <SortDropdown value={sortBy} onChange={handleSortChange} />

                {/* Filter Toggle */}
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-700 transition-all duration-200 ease-out micro-interaction"
                >
                  <Icon name="SlidersHorizontal" size={16} />
                  <span className="hidden sm:inline">Filters</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto">
          <div className="flex">
            {/* Filter Panel */}
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
            />

            {/* Content Area */}
            <div className="flex-1 min-w-0">
              {/* Desktop Split View */}
              <div className="hidden lg:flex h-[calc(100vh-160px)]">
                {/* Property List */}
                <div className="w-3/5 overflow-y-auto" ref={desktopListRef}>
                  <div className="p-6">
                    {loading ? (
                      <div className="grid grid-cols-1 gap-6">
                        {[...Array(6)].map((_, index) => (
                          <div key={index} className="card p-4">
                            <div className="animate-pulse">
                              <div className="flex space-x-4">
                                <div className="w-48 h-32 bg-secondary-200 rounded-md"></div>
                                <div className="flex-1 space-y-3">
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
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {currentProperties.map((property) => (
                          <div
                            key={property.id}
                            onMouseEnter={() => setSelectedProperty(property)}
                            onMouseLeave={() => setSelectedProperty(null)}
                          >
                            <PropertyCard
                              property={property}
                              variant="list"
                              onSave={handlePropertySave}
                              isHighlighted={selectedProperty?.id === property.id}
                            />
                          </div>
                        ))}
                        
                        {filteredProperties.length === 0 && (
                          <div className="text-center py-12">
                            <Icon name="Search" size={48} className="text-secondary mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-text-primary mb-2">
                              No properties found
                            </h3>
                            <p className="text-text-secondary">
                              Try adjusting your search criteria or filters
                            </p>
                          </div>
                        )}

                        {/* Pagination Controls */}
                        {filteredProperties.length > 0 && totalPages > 1 && (
                          <div className="flex items-center justify-between border-t border-border pt-6">
                            <div className="text-sm text-text-secondary">
                              Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => handlePageChange(1)}
                                disabled={currentPage === 1}
                                className={`px-3 py-1.5 rounded text-sm font-medium ${
                                  currentPage === 1 
                                    ? 'text-text-secondary cursor-not-allowed' 
                                    : 'text-text-primary hover:bg-secondary-50'
                                }`}
                              >
                                First
                              </button>
                              
                              <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`px-3 py-1.5 rounded text-sm font-medium ${
                                  currentPage === 1 
                                    ? 'text-text-secondary cursor-not-allowed' 
                                    : 'text-text-primary hover:bg-secondary-50'
                                }`}
                              >
                                Previous
                              </button>
                              
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
                                    className={`w-8 h-8 rounded text-sm font-medium ${
                                      currentPage === pageNumber
                                        ? 'bg-primary text-white'
                                        : 'text-text-primary hover:bg-secondary-50'
                                    }`}
                                  >
                                    {pageNumber}
                                  </button>
                                );
                              })}
                              
                              <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`px-3 py-1.5 rounded text-sm font-medium ${
                                  currentPage === totalPages 
                                    ? 'text-text-secondary cursor-not-allowed' 
                                    : 'text-text-primary hover:bg-secondary-50'
                                }`}
                              >
                                Next
                              </button>
                              
                              <button
                                onClick={() => handlePageChange(totalPages)}
                                disabled={currentPage === totalPages}
                                className={`px-3 py-1.5 rounded text-sm font-medium ${
                                  currentPage === totalPages 
                                    ? 'text-text-secondary cursor-not-allowed' 
                                    : 'text-text-primary hover:bg-secondary-50'
                                }`}
                              >
                                Last
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Map View */}
                <div className="w-2/5 border-l border-border">
                  <MapView
                    properties={filteredProperties}
                    selectedProperty={selectedProperty}
                    onPropertySelect={setSelectedProperty}
                  />
                </div>
              </div>

              {/* Mobile View */}
              <div className="lg:hidden">
                {viewMode === 'list' ? (
                  <div className="p-4">
                    {loading ? (
                      <div className="grid grid-cols-1 gap-4">
                        {[...Array(6)].map((_, index) => (
                          <div key={index} className="card p-4">
                            <div className="animate-pulse">
                              <div className="w-full h-48 bg-secondary-200 rounded-md mb-4"></div>
                              <div className="space-y-3">
                                <div className="h-4 bg-secondary-200 rounded w-3/4"></div>
                                <div className="h-3 bg-secondary-200 rounded w-1/2"></div>
                                <div className="h-3 bg-secondary-200 rounded w-2/3"></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {currentProperties.map((property) => (
                          <div key={property.id}>
                            <PropertyCard
                              property={property}
                              variant="card"
                              onSave={handlePropertySave}
                            />
                          </div>
                        ))}
                        
                        {filteredProperties.length === 0 && (
                          <div className="text-center py-12">
                            <Icon name="Search" size={48} className="text-secondary mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-text-primary mb-2">
                              No properties found
                            </h3>
                            <p className="text-text-secondary">
                              Try adjusting your search criteria or filters
                            </p>
                          </div>
                        )}

                        {/* Pagination Controls for Mobile */}
                        {filteredProperties.length > 0 && totalPages > 1 && (
                          <div className="flex flex-col items-center justify-center border-t border-border pt-6 space-y-4">
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => handlePageChange(1)}
                                disabled={currentPage === 1}
                                className={`px-3 py-1.5 rounded text-sm font-medium ${
                                  currentPage === 1 
                                    ? 'text-text-secondary cursor-not-allowed' 
                                    : 'text-text-primary hover:bg-secondary-50'
                                }`}
                              >
                                First
                              </button>
                              
                              <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`px-3 py-1.5 rounded text-sm font-medium ${
                                  currentPage === 1 
                                    ? 'text-text-secondary cursor-not-allowed' 
                                    : 'text-text-primary hover:bg-secondary-50'
                                }`}
                              >
                                Previous
                              </button>
                              
                              <span className="px-3 py-1.5 text-sm font-medium text-text-primary">
                                {currentPage} of {totalPages}
                              </span>
                              
                              <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`px-3 py-1.5 rounded text-sm font-medium ${
                                  currentPage === totalPages 
                                    ? 'text-text-secondary cursor-not-allowed' 
                                    : 'text-text-primary hover:bg-secondary-50'
                                }`}
                              >
                                Next
                              </button>
                              
                              <button
                                onClick={() => handlePageChange(totalPages)}
                                disabled={currentPage === totalPages}
                                className={`px-3 py-1.5 rounded text-sm font-medium ${
                                  currentPage === totalPages 
                                    ? 'text-text-secondary cursor-not-allowed' 
                                    : 'text-text-primary hover:bg-secondary-50'
                                }`}
                              >
                                Last
                              </button>
                            </div>
                            
                            <div className="flex items-center space-x-1">
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
                                    className={`w-8 h-8 rounded text-sm font-medium ${
                                      currentPage === pageNumber
                                        ? 'bg-primary text-white'
                                        : 'text-text-primary hover:bg-secondary-50'
                                    }`}
                                  >
                                    {pageNumber}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-[calc(100vh-160px)]">
                    <MapView
                      properties={filteredProperties}
                      selectedProperty={selectedProperty}
                      onPropertySelect={setSelectedProperty}
                      isMobile={true}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
    </>
  );
};

export default PropertyListings;