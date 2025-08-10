import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../../components/AppIcon';

const FilterPanel = ({ 
  isOpen, 
  onClose, 
  onFilterChange, 
  initialFilters = {} 
}) => {
  const [filters, setFilters] = useState({
    query: '',
    location: '',
    propertyType: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    bathrooms: '',
    minSqft: '',
    maxSqft: '',
    amenities: [],
    ...initialFilters
  });

  const [expandedSections, setExpandedSections] = useState({
    search: true,
    price: true,
    bedsBaths: true,
    propertyType: false,
    size: false,
    amenities: false
  });

  const [showMoreAmenities, setShowMoreAmenities] = useState(false);
  const panelRef = useRef();

  const propertyTypes = [
    { value: '', label: 'All Types', icon: 'Home' },
    { value: 'house', label: 'House', icon: 'Home' },
    { value: 'apartment', label: 'Apartment', icon: 'Building2' },
    { value: 'condo', label: 'Condo', icon: 'Building' },
    { value: 'townhouse', label: 'Townhouse', icon: 'Building2' },
    { value: 'loft', label: 'Loft', icon: 'Warehouse' },
    { value: 'penthouse', label: 'Penthouse', icon: 'Crown' }
  ];

  const priceRanges = [
    { min: '', max: '', label: 'Any Price' },
    { min: '0', max: '150000', label: 'Under Tsh 150K' },
    { min: '150000', max: '250000', label: 'Tsh 150K - 250K' },
    { min: '250000', max: '350000', label: 'Tsh 250K - 350K' },
    { min: '350000', max: '550000', label: 'Tsh 350K - 550K' },
    { min: '550000', max: '750000', label: 'Tsh 550K - 750K' },
    { min: '750000', max: '', label: 'Over Tsh 750K' }
  ];

  const amenitiesList = [
    { name: 'Parking', icon: 'Car', popular: true },
    { name: 'Pool', icon: 'Waves', popular: true },
    { name: 'Gym', icon: 'Dumbbell', popular: true },
    { name: 'Pet Friendly', icon: 'Heart', popular: true },
    { name: 'Balcony', icon: 'Building2', popular: true },
    { name: 'Garden', icon: 'Trees', popular: true },
    { name: 'Fireplace', icon: 'Flame', popular: false },
    { name: 'Air Conditioning', icon: 'Wind', popular: false },
    { name: 'Heating', icon: 'Thermometer', popular: false },
    { name: 'Laundry', icon: 'Shirt', popular: false },
    { name: 'Dishwasher', icon: 'Utensils', popular: false },
    { name: 'Elevator', icon: 'ArrowUp', popular: false },
    { name: 'Concierge', icon: 'Users', popular: false },
    { name: 'Security', icon: 'Shield', popular: false },
    { name: 'Storage', icon: 'Archive', popular: false },
    { name: 'Terrace', icon: 'Mountain', popular: false }
  ];

  const popularAmenities = amenitiesList.filter(a => a.popular);
  const otherAmenities = amenitiesList.filter(a => !a.popular);

  useEffect(() => {
    setFilters(prev => ({ ...prev, ...initialFilters }));
  }, [initialFilters]);

  // Close panel when clicking outside on mobile only
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Only close on outside click for mobile (screen width < 1024px)
      if (window.innerWidth < 1024 && panelRef.current && !panelRef.current.contains(event.target) && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Only prevent background scroll on mobile
      if (window.innerWidth < 1024) {
        document.body.style.overflow = 'hidden';
      }
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handlePriceRangeSelect = (range) => {
    const newFilters = {
      ...filters,
      minPrice: range.min,
      maxPrice: range.max
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleAmenityToggle = (amenity) => {
    const newAmenities = filters.amenities.includes(amenity)
      ? filters.amenities.filter(a => a !== amenity)
      : [...filters.amenities, amenity];
    
    const newFilters = { ...filters, amenities: newAmenities };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      query: '',
      location: '',
      propertyType: '',
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      bathrooms: '',
      minSqft: '',
      maxSqft: '',
      amenities: []
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'amenities') return Array.isArray(value) && value.length > 0;
    return value !== '';
  });

  const getActiveFilterCount = () => {
    return Object.entries(filters).reduce((count, [key, value]) => {
      if (key === 'amenities') return count + (Array.isArray(value) ? value.length : 0);
      return count + (value !== '' ? 1 : 0);
    }, 0);
  };

  const formatPrice = (price) => {
    if (!price) return '';
    const num = parseInt(price);
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000)}K`;
    return `${num}`;
  };

  return (
    <>
      {/* Mobile Backdrop */}
    {isOpen && (
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
        onClick={onClose}
      />
    )}

    {/* Filter Panel */}
    <div 
      ref={panelRef}
      className={`
        fixed lg:relative top-0 left-0 h-full w-80 lg:w-80 
        bg-surface border-r border-border z-50 lg:z-auto
        transform transition-all duration-300 ease-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isOpen ? 'lg:block' : 'lg:hidden'}
        lg:shadow-none shadow-elevation-4
        lg:sticky lg:top-20 lg:self-start lg:min-h-[calc(100vh-10rem)]
      `}
    >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-surface flex-shrink-0">
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="lg:hidden p-2 -ml-2 text-text-secondary hover:text-text-primary transition-colors duration-200"
              >
                <Icon name="ArrowLeft" size={20} />
              </button>
              <h2 className="text-lg font-semibold text-text-primary">Filters</h2>
              {getActiveFilterCount() > 0 && (
                <span className="bg-primary text-white text-xs font-medium px-2 py-1 rounded-full">
                  {getActiveFilterCount()}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-primary hover:text-primary-700 font-medium transition-colors duration-200"
                >
                  Clear All
                </button>
              )}
              {/* Desktop Close Button */}
              <button
                onClick={onClose}
                className="hidden lg:flex p-1.5 text-text-secondary hover:text-text-primary transition-colors duration-200 hover:bg-secondary-100 rounded-md"
              >
                <Icon name="X" size={16} />
              </button>
            </div>
          </div>

          {/* Filter Content - Fixed scrolling issue */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="p-4 space-y-6">

              {/* Search & Location */}
              <div className="space-y-4">
                <button
                  onClick={() => toggleSection('search')}
                  className="flex items-center justify-between w-full text-left group"
                >
                  <span className="text-sm font-medium text-text-primary flex items-center space-x-2">
                    <Icon name="Search" size={16} className="text-text-secondary" />
                    <span>Search & Location</span>
                  </span>
                  <Icon 
                    name="ChevronDown" 
                    size={16} 
                    className={`text-text-secondary group-hover:text-text-primary transition-all duration-200 ${
                      expandedSections.search ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                
                {expandedSections.search && (
                  <div className="space-y-3 pl-6">
                    {/* Search Query */}
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-2">
                        Search Keywords
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Icon name="Search" size={14} className="text-text-secondary" />
                        </div>
                        <input
                          type="text"
                          value={filters.query}
                          onChange={(e) => handleFilterChange('query', e.target.value)}
                          placeholder="Property name, features..."
                          className="block w-full pl-9 pr-3 py-2.5 border border-border rounded-lg
                                   focus:border-primary focus:ring-1 focus:ring-primary/20
                                   transition-all duration-200 ease-out text-sm
                                   hover:border-border-focus"
                        />
                      </div>
                    </div>

                    {/* Location */}
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-2">
                        Location
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Icon name="MapPin" size={14} className="text-text-secondary" />
                        </div>
                        <input
                          type="text"
                          value={filters.location}
                          onChange={(e) => handleFilterChange('location', e.target.value)}
                          placeholder="City, neighborhood, ZIP..."
                          className="block w-full pl-9 pr-3 py-2.5 border border-border rounded-lg
                                   focus:border-primary focus:ring-1 focus:ring-primary/20
                                   transition-all duration-200 ease-out text-sm
                                   hover:border-border-focus"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Price Range */}
              <div>
                <button
                  onClick={() => toggleSection('price')}
                  className="flex items-center justify-between w-full text-left group"
                >
                  <span className="text-sm font-medium text-text-primary flex items-center space-x-2">
                    <Icon name="DollarSign" size={16} className="text-text-secondary" />
                    <span>Price Range</span>
                    {(filters.minPrice || filters.maxPrice) && (
                      <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
                        {formatPrice(filters.minPrice) || 'Any'} - {formatPrice(filters.maxPrice) || 'Any'}
                      </span>
                    )}
                  </span>
                  <Icon 
                    name="ChevronDown" 
                    size={16} 
                    className={`text-text-secondary group-hover:text-text-primary transition-all duration-200 ${
                      expandedSections.price ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                
                {expandedSections.price && (
                  <div className="mt-3 pl-6 space-y-4">
                    {/* Quick Price Ranges */}
                    <div className="grid grid-cols-1 gap-2">
                      {priceRanges.map((range, index) => (
                        <button
                          key={index}
                          onClick={() => handlePriceRangeSelect(range)}
                          className={`text-left px-3 py-2.5 rounded-lg text-sm transition-all duration-200 
                                    border ${
                            filters.minPrice === range.min && filters.maxPrice === range.max
                              ? 'bg-primary/10 text-primary border-primary/30 font-medium'
                              : 'text-text-secondary hover:bg-secondary-100 border-transparent hover:border-border'
                          }`}
                        >
                          {range.label}
                        </button>
                      ))}
                    </div>

                    {/* Custom Price Range */}
                    <div className="pt-3 border-t border-border">
                      <label className="block text-xs font-medium text-text-secondary mb-2">
                        Custom Range
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <input
                            type="number"
                            value={filters.minPrice}
                            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                            placeholder="Min price"
                            className="w-full px-3 py-2.5 border border-border rounded-lg text-sm
                                     focus:border-primary focus:ring-1 focus:ring-primary/20
                                     transition-all duration-200 hover:border-border-focus"
                          />
                        </div>
                        <div>
                          <input
                            type="number"
                            value={filters.maxPrice}
                            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                            placeholder="Max price"
                            className="w-full px-3 py-2.5 border border-border rounded-lg text-sm
                                     focus:border-primary focus:ring-1 focus:ring-primary/20
                                     transition-all duration-200 hover:border-border-focus"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Beds & Baths */}
              <div>
                <button
                  onClick={() => toggleSection('bedsBaths')}
                  className="flex items-center justify-between w-full text-left group"
                >
                  <span className="text-sm font-medium text-text-primary flex items-center space-x-2">
                    <Icon name="Bed" size={16} className="text-text-secondary" />
                    <span>Beds & Baths</span>
                    {(filters.bedrooms || filters.bathrooms) && (
                      <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
                        {filters.bedrooms || 'Any'} bed, {filters.bathrooms || 'Any'} bath
                      </span>
                    )}
                  </span>
                  <Icon 
                    name="ChevronDown" 
                    size={16} 
                    className={`text-text-secondary group-hover:text-text-primary transition-all duration-200 ${
                      expandedSections.bedsBaths ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                
                {expandedSections.bedsBaths && (
                  <div className="mt-3 pl-6 space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-2">
                        Bedrooms
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {['', '1', '2', '3', '4', '5+'].map((bed) => (
                          <button
                            key={bed}
                            onClick={() => handleFilterChange('bedrooms', bed)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                                      border min-w-[3rem] ${
                              filters.bedrooms === bed
                                ? 'bg-primary text-white border-primary shadow-sm'
                                : 'bg-surface text-text-secondary border-border hover:bg-secondary-100 hover:text-text-primary'
                            }`}
                          >
                            {bed || 'Any'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-2">
                        Bathrooms
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {['', '1', '2', '3', '4+'].map((bath) => (
                          <button
                            key={bath}
                            onClick={() => handleFilterChange('bathrooms', bath)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                                      border min-w-[3rem] ${
                              filters.bathrooms === bath
                                ? 'bg-primary text-white border-primary shadow-sm'
                                : 'bg-surface text-text-secondary border-border hover:bg-secondary-100 hover:text-text-primary'
                            }`}
                          >
                            {bath || 'Any'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Property Type */}
              <div>
                <button
                  onClick={() => toggleSection('propertyType')}
                  className="flex items-center justify-between w-full text-left group"
                >
                  <span className="text-sm font-medium text-text-primary flex items-center space-x-2">
                    <Icon name="Home" size={16} className="text-text-secondary" />
                    <span>Property Type</span>
                    {filters.propertyType && (
                      <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
                        {propertyTypes.find(t => t.value === filters.propertyType)?.label}
                      </span>
                    )}
                  </span>
                  <Icon 
                    name="ChevronDown" 
                    size={16} 
                    className={`text-text-secondary group-hover:text-text-primary transition-all duration-200 ${
                      expandedSections.propertyType ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                
                {expandedSections.propertyType && (
                  <div className="mt-3 pl-6 grid grid-cols-2 gap-2">
                    {propertyTypes.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => handleFilterChange('propertyType', type.value)}
                        className={`flex items-center space-x-2 px-3 py-2.5 rounded-lg text-sm 
                                  transition-all duration-200 border ${
                          filters.propertyType === type.value
                            ? 'bg-primary/10 text-primary border-primary/30 font-medium'
                            : 'text-text-secondary hover:bg-secondary-100 border-transparent hover:border-border'
                        }`}
                      >
                        <Icon name={type.icon} size={14} />
                        <span className="truncate">{type.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Size */}
              <div>
                <button
                  onClick={() => toggleSection('size')}
                  className="flex items-center justify-between w-full text-left group"
                >
                  <span className="text-sm font-medium text-text-primary flex items-center space-x-2">
                    <Icon name="Square" size={16} className="text-text-secondary" />
                    <span>Size (Sqft)</span>
                    {(filters.minSqft || filters.maxSqft) && (
                      <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
                        {filters.minSqft || 'Any'} - {filters.maxSqft || 'Any'}
                      </span>
                    )}
                  </span>
                  <Icon 
                    name="ChevronDown" 
                    size={16} 
                    className={`text-text-secondary group-hover:text-text-primary transition-all duration-200 ${
                      expandedSections.size ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                
                {expandedSections.size && (
                  <div className="mt-3 pl-6">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-text-secondary mb-1">
                          Min Sqft
                        </label>
                        <input
                          type="number"
                          value={filters.minSqft}
                          onChange={(e) => handleFilterChange('minSqft', e.target.value)}
                          placeholder="Any"
                          className="w-full px-3 py-2.5 border border-border rounded-lg text-sm
                                   focus:border-primary focus:ring-1 focus:ring-primary/20
                                   transition-all duration-200 hover:border-border-focus"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-text-secondary mb-1">
                          Max Sqft
                        </label>
                        <input
                          type="number"
                          value={filters.maxSqft}
                          onChange={(e) => handleFilterChange('maxSqft', e.target.value)}
                          placeholder="Any"
                          className="w-full px-3 py-2.5 border border-border rounded-lg text-sm
                                   focus:border-primary focus:ring-1 focus:ring-primary/20
                                   transition-all duration-200 hover:border-border-focus"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Amenities */}
              <div>
                <button
                  onClick={() => toggleSection('amenities')}
                  className="flex items-center justify-between w-full text-left group"
                >
                  <span className="text-sm font-medium text-text-primary flex items-center space-x-2">
                    <Icon name="Star" size={16} className="text-text-secondary" />
                    <span>Amenities</span>
                    {filters.amenities.length > 0 && (
                      <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
                        {filters.amenities.length} selected
                      </span>
                    )}
                  </span>
                  <Icon 
                    name="ChevronDown" 
                    size={16} 
                    className={`text-text-secondary group-hover:text-text-primary transition-all duration-200 ${
                      expandedSections.amenities ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                
                {expandedSections.amenities && (
                  <div className="mt-3 pl-6 space-y-4">
                    {/* Popular Amenities */}
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-2">
                        Popular
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {popularAmenities.map((amenity) => (
                          <label key={amenity.name} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={filters.amenities.includes(amenity.name)}
                              onChange={() => handleAmenityToggle(amenity.name)}
                              className="w-4 h-4 text-primary border-border rounded focus:ring-primary/20 
                                       transition-colors duration-200"
                            />
                            <Icon name={amenity.icon} size={14} className="text-text-secondary flex-shrink-0" />
                            <span className="text-sm text-text-secondary truncate">{amenity.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Other Amenities */}
                    {showMoreAmenities && (
                      <div>
                        <label className="block text-xs font-medium text-text-secondary mb-2">
                          More Options
                        </label>
                        <div className="grid grid-cols-1 gap-2">
                          {otherAmenities.map((amenity) => (
                            <label key={amenity.name} className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={filters.amenities.includes(amenity.name)}
                                onChange={() => handleAmenityToggle(amenity.name)}
                                className="w-4 h-4 text-primary border-border rounded focus:ring-primary/20 
                                         transition-colors duration-200"
                              />
                              <Icon name={amenity.icon} size={14} className="text-text-secondary flex-shrink-0" />
                              <span className="text-sm text-text-secondary">{amenity.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => setShowMoreAmenities(!showMoreAmenities)}
                      className="text-sm text-primary hover:text-primary-700 font-medium 
                               transition-colors duration-200 flex items-center space-x-1"
                    >
                      <span>{showMoreAmenities ? 'Show Less' : 'Show More'}</span>
                      <Icon 
                        name="ChevronDown" 
                        size={14} 
                        className={`transition-transform duration-200 ${
                          showMoreAmenities ? 'rotate-180' : ''
                        }`} 
                      />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
)};

export default FilterPanel;