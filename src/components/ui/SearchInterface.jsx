import React, { useState, useRef, useEffect } from 'react';
import Icon from '../AppIcon';

const SearchInterface = ({ variant = 'hero', onSearch, initialFilters = {} }) => {
  const [searchQuery, setSearchQuery] = useState(initialFilters.query || '');
  const [isFocused, setIsFocused] = useState(false);
  const formRef = useRef(null);

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch({ query: searchQuery });
    } else {
      const params = new URLSearchParams({ query: searchQuery });
      window.location.href = `/property-listings?${params.toString()}`;
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    // Maintain focus after clearing
    setTimeout(() => formRef.current.querySelector('input')?.focus(), 10);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      clearSearch();
    }
  };

  // Hero variant - immersive search experience
  if (variant === 'hero') {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <form 
          ref={formRef}
          onSubmit={handleSearch}
          className="relative"
        >
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Icon 
                name="Search" 
                size={24} 
                className={`transition-colors ${isFocused ? 'text-primary' : 'text-secondary'}`} 
              />
            </div>
            
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={handleKeyDown}
              placeholder="Search by neighborhood, city, or property features..."
              className="block w-full pl-12 pr-20 py-5 text-lg border-2 border-transparent rounded-xl
                         focus:border-primary focus:ring-0 focus:ring-primary-500 focus:ring-offset-0 
                         transition-all duration-300 ease-out bg-white/90 backdrop-blur-sm text-text-primary
                         placeholder-text-secondary shadow-elevation-3 hover:shadow-elevation-4"
              aria-label="Search properties"
            />
            
            {/* Clear button */}
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute inset-y-0 right-16 flex items-center px-3 text-text-secondary hover:text-text-primary transition-colors duration-200"
                aria-label="Clear search"
              >
                <Icon name="X" size={22} />
              </button>
            )}
            
            {/* Submit button */}
            <button
              type="submit"
              className={`absolute inset-y-0 right-0 flex items-center px-6 rounded-r-xl
                         transition-all duration-300 ease-out overflow-hidden ${
                           searchQuery 
                             ? 'bg-primary text-white' 
                             : 'bg-primary/90 text-white/90'
                         }`}
              aria-label="Search properties"
            >
              <div className="flex items-center">
                <span className="mr-2 font-medium hidden sm:inline">Search</span>
                <Icon name="ArrowRight" size={24} />
              </div>
            </button>
          </div>
        </form>
        
        {/* Quick search tags */}
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {[
            'Apartments in NYC',
            'Houses under $500K',
            'Luxury Condos',
            'Waterfront',
            'Pet-Friendly'
          ].map((tag) => (
            <button
              key={tag}
              onClick={() => {
                setSearchQuery(tag);
                setTimeout(() => formRef.current.requestSubmit(), 50);
              }}
              className="px-4 py-2 bg-white/20 backdrop-blur-lg text-white rounded-full text-sm
                         hover:bg-white/30 transition-all duration-300 ease-out
                         border border-white/30 hover:scale-105 transform"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Compact variant for header
  return (
    <form 
      ref={formRef}
      onSubmit={handleSearch}
      className="flex items-center space-x-2"
    >
      <div className="relative flex-1 min-w-[180px]">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon 
            name="Search" 
            size={16} 
            className={`transition-colors ${isFocused ? 'text-primary' : 'text-secondary'}`}
          />
        </div>
        
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder="Search properties..."
          className="block w-full pl-9 pr-16 py-2.5 border border-border rounded-lg text-base
                   focus:border-primary focus:ring-1 focus:ring-primary-500 
                   transition-all duration-200 ease-out bg-surface text-text-primary
                   placeholder-text-secondary"
        />
        
        {/* Clear button */}
        {searchQuery && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute inset-y-0 right-10 flex items-center px-2 text-text-secondary hover:text-text-primary transition-colors duration-200"
            aria-label="Clear search"
          >
            <Icon name="X" size={14} />
          </button>
        )}
        
        {/* Submit button */}
        <button
          type="submit"
          className="absolute inset-y-0 right-0 flex items-center px-3 rounded-r-lg bg-primary text-white"
          aria-label="Search"
        >
          <Icon name="Search" size={16} />
        </button>
      </div>
    </form>
  );
};

export default SearchInterface;