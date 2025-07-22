// pages/agent-dashboard/components/ActiveListings.jsx
import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ActiveListings({ listings, onDeleteListing, onUpdateProperty }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedListing, setSelectedListing] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingListingId, setDeletingListingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortOption, setSortOption] = useState('newest');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [availableFromDate, setAvailableFromDate] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const navigate = useNavigate();
  const listingsRef = useRef(null);
  const containerRef = useRef(null);
  const deleteModalRef = useRef(null);
  const statusModalRef = useRef(null);

  // Constants
  const ITEMS_PER_PAGE = 8;
  const STATUS_OPTIONS = ['All', 'Vacant', 'Occupied', 'Pending', 'Draft'];
  const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'price-low', label: 'Price: Low to High' }
  ];

  // Close modals when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDeleteModal && deleteModalRef.current && !deleteModalRef.current.contains(event.target)) {
        setShowDeleteModal(false);
      }
      if (showStatusModal && statusModalRef.current && !statusModalRef.current.contains(event.target)) {
        setShowStatusModal(false);
      }
    };

    if (showDeleteModal || showStatusModal) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDeleteModal, showStatusModal]);

  // Filter and sort listings
  const filteredListings = useMemo(() => {
    let result = [...listings];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(listing => 
        listing.title.toLowerCase().includes(query) ||
        listing.location.toLowerCase().includes(query) ||
        listing.price.toString().includes(query) ||
        listing.type.toLowerCase().includes(query)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'All') {
      result = result.filter(listing => 
        listing.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }
    
    // Apply sorting
    switch (sortOption) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      default:
        break;
    }
    
    return result;
  }, [listings, searchQuery, statusFilter, sortOption]);

  // Pagination logic
  const totalPages = Math.ceil(filteredListings.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const displayedListings = filteredListings.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Clear search query
  const clearSearch = () => {
    setSearchQuery('');
    setCurrentPage(1);
  };

  // Handle property selection
  const handleSelectProperty = (listing) => {
    setSelectedListing(listing);
    // Scroll to top when viewing property details
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Handle page change with scroll to listings
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      // Scroll to top of container for better UX
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 0);
    }
  };

  // Handle delete initiation
  const handleDeleteInit = (listingId) => {
    setDeletingListingId(listingId);
    setShowDeleteModal(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    if (deletingListingId && onDeleteListing) {
      onDeleteListing(deletingListingId);
    }
    setShowDeleteModal(false);
    setSelectedListing(null);
  };

  // Handle status update initiation
  const handleStatusUpdateInit = (currentStatus) => {
    if (currentStatus.toLowerCase() === 'occupied') {
      setNewStatus('available');
      setAvailableFromDate(new Date().toISOString().split('T')[0]);
    } else if (currentStatus.toLowerCase() === 'vacant' || currentStatus.toLowerCase() === 'available') {
      setNewStatus('occupied');
      setAvailableFromDate('');
    }
    setShowStatusModal(true);
  };

  // Confirm status update
  const confirmStatusUpdate = async () => {
    if (!selectedListing || !onUpdateProperty) return;

    setIsUpdatingStatus(true);
    try {
      const updateData = {
        status: newStatus,
        availableFrom: newStatus === 'available' ? availableFromDate : (newStatus === 'occupied' ? availableFromDate : null)
      };
      
      await onUpdateProperty(selectedListing.id, updateData);
      
      // Update the selected listing state
      setSelectedListing({
        ...selectedListing,
        status: newStatus,
        availableFrom: updateData.availableFrom
      });
      
      setShowStatusModal(false);
    } catch (error) {
      console.error('Failed to update property status:', error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Get minimum date for date picker (today)
  const getMinDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'TZS',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // View public listing
  const viewPublicListing = (listingId) => {
    navigate(`/property-details?id=${listingId}`);
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

  const ArrowLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  );

  const ExternalLinkIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  );

  const ChevronDown = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );

  const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );

  return (
    <div ref={containerRef} className="card p-6">
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div ref={deleteModalRef} className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-text-primary mb-2">Confirm Deletion</h3>
            <p className="text-text-secondary mb-6">
              Are you sure you want to delete this property? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="btn-secondary px-4 py-2 rounded-md"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="bg-error text-white px-4 py-2 rounded-md hover:bg-error-dark transition-colors"
              >
                Delete Property
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div ref={statusModalRef} className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-text-primary mb-4">Update Property Status</h3>
            
            <div className="mb-4">
              <p className="text-text-secondary mb-2">
                Change status from <span className="font-medium">{selectedListing?.status}</span> to <span className="font-medium capitalize">{newStatus}</span>
              </p>
              
              {newStatus === 'occupied' && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    When will this property become available?
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={availableFromDate}
                      onChange={(e) => setAvailableFromDate(e.target.value)}
                      min={getMinDate()}
                      className="input-field w-full pl-10"
                      required
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CalendarIcon />
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowStatusModal(false)}
                className="btn-secondary px-4 py-2 rounded-md"
                disabled={isUpdatingStatus}
              >
                Cancel
              </button>
              <button 
                onClick={confirmStatusUpdate}
                disabled={isUpdatingStatus || (newStatus === 'occupied' && !availableFromDate)}
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {isUpdatingStatus ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedListing ? (
        <div>
          <button 
            onClick={() => setSelectedListing(null)}
            className="btn-secondary flex items-center px-4 py-2 rounded-md mb-6"
          >
            <ArrowLeftIcon />
            Back to Listings
          </button>
          
          {/* Property Details - Enhanced Professional Layout */}
<div className="card p-6">
  <div className="space-y-6">
    {/* Header Section - Inline with better alignment */}
    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b">
      <div>
        <h2 className="text-2xl font-semibold text-text-primary">{selectedListing.title}</h2>
        <p className="text-text-secondary mt-1 flex items-center">
          <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          {selectedListing.location}
        </p>
      </div>
      <div className="text-right">
        <div className="text-3xl font-bold text-text-primary">{formatPrice(selectedListing.price)}</div>
        <div className="mt-2">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            selectedListing.status === "Vacant" 
              ? "bg-yellow-100 text-yellow-800" 
              : selectedListing.status === "Occupied"
                ? "bg-red-100 text-red-800"
                : "bg-green-100 text-green-800"
          }`}>
            {selectedListing.status}
          </span>
        </div>
      </div>
    </div>

    {/* Two Column Layout - Professional arrangement */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Column - Property Information */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-4">Property Information</h3>
          
          {/* Property details in a cleaner format */}
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-text-secondary font-medium">Type</span>
              <span className="text-text-primary font-semibold capitalize">{selectedListing.type}</span>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-text-secondary font-medium">Bedrooms</span>
              <span className="text-text-primary font-semibold">{selectedListing.bedrooms || '-'}</span>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-text-secondary font-medium">Bathrooms</span>
              <span className="text-text-primary font-semibold">{selectedListing.bathrooms || '-'}</span>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-text-secondary font-medium">Date Added</span>
              <span className="text-text-primary font-semibold">{formatDate(selectedListing.createdAt)}</span>
            </div>

            {/* Available From Date - Inline with other property details for occupied properties */}
            {selectedListing.status?.toLowerCase() === 'occupied' && selectedListing.availableFrom && (
              <div className="flex items-center justify-between py-3 border-b border-gray-100 bg-yellow-50 px-3 -mx-3 rounded-md">
                <span className="text-yellow-800 font-medium flex items-center">
                  <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  Available From
                </span>
                <span className="text-yellow-900 font-semibold">{formatDate(selectedListing.availableFrom)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Column - Actions */}
      <div className="space-y-6">
        {/* Status Management */}
        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-4">Status Management</h3>
          
          <div className="card p-4 bg-blue-50 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-blue-800 font-medium">Current Status</div>
                <div className="text-blue-900 text-sm mt-1">
                  {selectedListing.status?.toLowerCase() === 'occupied' ? 'Mark as available when tenant leaves' : 'Mark as occupied when tenant moves in'}
                </div>
              </div>
              <button
                onClick={() => handleStatusUpdateInit(selectedListing.status)}
                className="btn-primary px-4 py-2 rounded-md text-sm"
              >
                {selectedListing.status?.toLowerCase() === 'occupied' ? 'Set Available' : 'Set Occupied'}
              </button>
            </div>
          </div>
        </div>

        {/* Property Actions */}
        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-4">Property Actions</h3>
          
          <div className="space-y-4">
            {/* View Public Listing - Standalone button */}
            <button 
              onClick={() => viewPublicListing(selectedListing.id)}
              className="w-full card p-4 text-left hover:bg-gray-50 transition-colors flex items-center justify-between group"
            >
              <div className="flex items-center">
                <svg className="h-5 w-5 mr-3 text-gray-600 group-hover:text-blue-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className="font-medium">View Public Listing</span>
              </div>
              <ExternalLinkIcon className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </button>
            
            {/* Edit and Delete buttons in row arrangement */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button 
                // onClick={() => navigate(`/property-create-edit/${selectedListing.id}`)}
                onClick={() => navigate(`/property-create-edit/${selectedListing.id}`)}
                className="btn-primary p-3 rounded-md flex items-center justify-center hover:bg-blue-700 transition-colors"
              >
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span className="font-medium">Edit</span>
              </button>
              
              <button 
                onClick={() => handleDeleteInit(selectedListing.id)}
                className="card p-3 text-red-700 hover:bg-red-50 border border-red-200 transition-colors flex items-center justify-center hover:border-red-300"
              >
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span className="font-medium">Delete</span>
              </button>
            </div>
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
            <div>
              <h2 className="text-xl font-semibold text-text-primary">Active Listings</h2>
              <p className="text-text-secondary text-sm mt-1">
                Showing {Math.min(startIndex + 1, filteredListings.length)}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredListings.length)} of {filteredListings.length} properties
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:min-w-[240px]">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search properties..."
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
              
              <div className="flex gap-2">
                {/* Status Filter Dropdown */}
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="input-field pl-3 pr-8 appearance-none"
                  >
                    {STATUS_OPTIONS.map(option => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <ChevronDown />
                  </div>
                </div>
                
                {/* Sort Options Dropdown */}
                <div className="relative">
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="input-field pl-3 pr-8 appearance-none"
                  >
                    {SORT_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <ChevronDown />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {filteredListings.length === 0 ? (
            <div className="text-center py-12 border border-gray-200 rounded-lg">
              <div className="mx-auto bg-secondary-100 rounded-full p-4 w-16 h-16 flex items-center justify-center mb-4">
                <SearchIcon className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-lg font-medium text-text-primary">No matching listings found</h3>
              <p className="text-text-secondary mt-2">
                {searchQuery ? `No listings match your search for "${searchQuery}"` : 'No listings match your current filters'}
              </p>
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('All');
                }}
                className="btn-secondary mt-4 px-4 py-2 rounded-md"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div ref={listingsRef}>
              <div className="grid grid-cols-1 gap-4">
                {displayedListings.map(listing => (
                  <div 
                    key={listing.id} 
                    className="card p-4 transition-all duration-200 hover:bg-gray-50 cursor-pointer border border-gray-200"
                    onClick={() => handleSelectProperty(listing)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-text-primary">{listing.title}</h3>
                        <p className="text-text-secondary text-sm mt-1">{listing.location}</p>
                        {/* Show available date for occupied properties */}
                        {listing.status?.toLowerCase() === 'occupied' && listing.availableFrom && (
                          <p className="text-yellow-600 text-xs mt-1 flex items-center">
                            <CalendarIcon />
                            <span className="ml-1">Available: {formatDate(listing.availableFrom)}</span>
                          </p>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        listing.status === "Vacant" 
                          ? "bg-warning-100 text-warning" 
                          : listing.status === "Occupied"
                            ? "bg-success-100 text-success"
                            : "bg-info-100 text-info"
                      }`}>
                        {listing.status}
                      </span>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-text-secondary text-xs">PRICE</p>
                        <p className="font-medium text-text-primary">{formatPrice(listing.price)}</p>
                      </div>
                      <div>
                        <p className="text-text-secondary text-xs">TYPE</p>
                        <p className="font-medium text-text-primary capitalize">{listing.type}</p>
                      </div>
                      <div>
                        <p className="text-text-secondary text-xs">BED | BATH</p>
                        <p className="font-medium text-text-primary flex items-center">
                          <span className="mr-2">{listing.bedrooms || 0}</span> | 
                          <span className="ml-2">{listing.bathrooms || 0}</span>
                        </p>
                      </div>
                      <div>
                        <p className="text-text-secondary text-xs">ADDED</p>
                        <p className="font-medium text-text-primary">{formatDate(listing.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200 pt-6">
                  <div className="text-text-secondary text-sm">
                    Page {currentPage} of {totalPages}
                  </div><div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-3 py-2 text-sm rounded-md ${
                              currentPage === pageNum
                                ? 'bg-primary text-white'
                                : 'border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}