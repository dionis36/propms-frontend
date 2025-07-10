// pages/agent-dashboard/components/ActiveListings.jsx
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ActiveListings({ listings }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const navigate = useNavigate();

  // Filter listings based on search query
  const filteredListings = useMemo(() => {
    if (!searchQuery) return listings;
    
    const query = searchQuery.toLowerCase();
    return listings.filter(listing => 
      listing.title.toLowerCase().includes(query) ||
      listing.location.toLowerCase().includes(query) ||
      listing.price.toLowerCase().includes(query) ||
      listing.type.toLowerCase().includes(query) ||
      listing.status.toLowerCase().includes(query)
    );
  }, [listings, searchQuery]);

  // Determine how many listings to show
  const displayedListings = showAll ? filteredListings : filteredListings.slice(0, 4);
  
  // Clear search query
  const clearSearch = () => setSearchQuery('');

  // Handle property selection
  const handleSelectProperty = (listing) => {
    setSelectedListing(listing);
  };

  // SVG Icons
  const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );

  const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-text-secondary hover:text-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );

  const ChevronDownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );

  const ChevronUpIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    </svg>
  );

  const ArrowLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  );

  return (
    <div className="card p-6">
      {selectedListing ? (
        <div>
          <button 
            onClick={() => setSelectedListing(null)}
            className="btn-secondary flex items-center px-4 py-2 rounded-md mb-6"
          >
            <ArrowLeftIcon />
            Back to Listings
          </button>
          
          <div className="card p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-text-primary">{selectedListing.title}</h2>
                <p className="text-text-secondary mt-1">{selectedListing.location}</p>
              </div>
              
              <div className="mt-4 md:mt-0 flex space-x-3">
                <button 
                  onClick={() => navigate(`/property-create-edit/${selectedListing.id}`)}
                  className="btn-secondary px-4 py-2 rounded-md"
                >
                  Edit
                </button>
                <button className="bg-error-100 text-error hover:bg-error-200 px-4 py-2 rounded-md transition-colors">
                  Delete
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-64" />
                
                <div className="mt-6">
                  <h3 className="text-xl font-semibold text-text-primary mb-4">Description</h3>
                  <p className="text-text-secondary">
                    {selectedListing.description || "No description available for this property."}
                  </p>
                </div>
              </div>
              
              <div>
                <div className="card p-5">
                  <h3 className="text-lg font-semibold text-text-primary mb-4">Property Details</h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Price:</span>
                      <span className="font-medium text-text-primary">{selectedListing.price}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedListing.status === "Vacant" 
                          ? "bg-warning-100 text-warning" 
                          : "bg-success-100 text-success"
                      }`}>
                        {selectedListing.status}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Type:</span>
                      <span className="font-medium text-text-primary">{selectedListing.type}</span>
                    </div>
                    
                    {selectedListing.bedrooms && (
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Bedrooms:</span>
                        <span className="font-medium text-text-primary">{selectedListing.bedrooms}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Added:</span>
                      <span className="font-medium text-text-primary">{selectedListing.createdAt}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Coordinates:</span>
                      <span className="font-medium text-text-primary">
                        {selectedListing.lat}, {selectedListing.lng}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-xl font-semibold text-text-primary">Active Listings</h2>
            
            <div className="flex gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search listings..."
                  className="input-field w-full pl-10 pr-10"
                />
                {searchQuery && (
                  <button 
                    onClick={clearSearch}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <CloseIcon />
                  </button>
                )}
              </div>
            </div>
          </div>

          {filteredListings.length === 0 ? (
            <div className="text-center py-8">
              {searchQuery ? (
                <>
                  <div className="mx-auto bg-secondary-100 rounded-full p-4 w-16 h-16 flex items-center justify-center mb-4">
                    <SearchIcon className="h-6 w-6 text-secondary" />
                  </div>
                  <h3 className="text-lg font-medium text-text-primary">No matching listings found</h3>
                  <p className="text-text-secondary mt-2">
                    No listings match your search for "{searchQuery}"
                  </p>
                  <button 
                    onClick={clearSearch}
                    className="btn-secondary mt-4 px-4 py-2 rounded-md"
                  >
                    Clear Search
                  </button>
                </>
              ) : (
                <>
                  <div className="mx-auto bg-secondary-100 rounded-full p-4 w-16 h-16 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-text-primary">No active listings yet</h3>
                  <p className="text-text-secondary mt-2">
                    You haven't added any properties. Create your first listing to get started!
                  </p>
                  <div className="mt-6">
                    <button 
                      onClick={() => navigate('/property-create-edit')}
                      className="btn-primary px-4 py-2 rounded-md"
                    >
                      Add Your First Listing
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayedListings.map(listing => (
                  <div 
                    key={listing.id} 
                    className="card p-4 micro-interaction hover:shadow-elevation-2 cursor-pointer"
                    onClick={() => handleSelectProperty(listing)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-text-primary">{listing.title}</h3>
                        <p className="text-text-secondary text-sm">{listing.location}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        listing.status === "Vacant" 
                          ? "bg-warning-100 text-warning" 
                          : "bg-success-100 text-success"
                      }`}>
                        {listing.status}
                      </span>
                    </div>
                    
                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-lg font-bold text-text-primary">{listing.price}</div>
                      <div className="flex items-center text-text-secondary text-sm">
                        {listing.type}
                        {listing.bedrooms && (
                          <span className="ml-2 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            {listing.bedrooms}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-4 flex justify-between items-center">
                      <div className="text-text-secondary text-sm">
                        Added: {listing.createdAt}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredListings.length > 4 && (
                <div className="mt-6 text-center">
                  <button
                    onClick={() => setShowAll(!showAll)}
                    className="btn-secondary px-4 py-2 rounded-md inline-flex items-center"
                  >
                    {showAll ? (
                      <>
                        <ChevronUpIcon className="mr-1" /> Show Less
                      </>
                    ) : (
                      <>
                        <ChevronDownIcon className="mr-1" /> View All ({filteredListings.length})
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}