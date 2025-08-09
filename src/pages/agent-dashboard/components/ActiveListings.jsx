// pages/agent-dashboard/components/ActiveListings.jsx
import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteProperty } from '../../../services/api';
import { useToast } from '../../../contexts/ToastContext';
import { useAuth } from '../../../contexts/AuthContext';
import StatusBadge from '../../../components/StatusBadge';
import { createPortal } from 'react-dom';

export default function ActiveListings({ listings, onDeleteListing, onUpdateProperty }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortOption, setSortOption] = useState('newest');
  const [showEditModal, setShowEditModal] = useState(false);
  const [propertyToEdit, setPropertyToEdit] = useState(null);
  
  const navigate = useNavigate();
  const deleteModalRef = useRef(null);
  const editModalRef = useRef(null);
  const { showToast } = useToast();
  const { accessToken } = useAuth();

  // Constants
  const itemsPerPage = 6;
  const STATUS_OPTIONS = ['All', 'Available', 'Occupied'];
  const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'price-low', label: 'Price: Low to High' }
  ];

  // Close modals when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (deleteModalRef.current && !deleteModalRef.current.contains(event.target)) {
        setShowDeleteModal(false);
        setPropertyToDelete(null);
      }
      if (editModalRef.current && !editModalRef.current.contains(event.target)) {
        setShowEditModal(false);
        setPropertyToEdit(null);
      }
    };

    if (showDeleteModal || showEditModal) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDeleteModal, showEditModal]);

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
  const totalPages = Math.ceil(filteredListings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedListings = filteredListings.slice(startIndex, startIndex + itemsPerPage);

  // Handle delete modal
  const handleDeleteClick = (property) => {
    setPropertyToDelete(property);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!propertyToDelete) return;

    try {
      setDeletingId(propertyToDelete.id);
      
      await deleteProperty(propertyToDelete.id, accessToken);
      
      // Call the parent callback to update the listings state
      if (onDeleteListing) {
        onDeleteListing(propertyToDelete.id);
      }
      
      showToast("Property deleted successfully", "success");
      setShowDeleteModal(false);
      setPropertyToDelete(null);
    } catch (error) {
      console.error('Failed to delete property:', error);
      showToast("Failed to delete property. Please try again.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  // Handle edit modal
  const handleEditClick = (property) => {
    setPropertyToEdit(property);
    setShowEditModal(true);
  };

  const confirmEdit = () => {
    if (!propertyToEdit) return;
    navigate(`/property-create-edit/${propertyToEdit.id}`);
    setShowEditModal(false);
    setPropertyToEdit(null);
  };

  // Handle property sharing
  const handleShare = async (property) => {
    const propertyUrl = `${window.location.origin}/property-details?id=${property.id}`;
    
    if (navigator.share && /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      try {
        await navigator.share({
          title: property.title,
          text: `Check out this property: ${property.title}`,
          url: propertyUrl
        });
        showToast("Property shared successfully", "success");
      } catch (error) {
        if (error.name !== 'AbortError') {
          copyToClipboard(propertyUrl);
        }
      }
    } else {
      copyToClipboard(propertyUrl);
    }
  };

  const copyToClipboard = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      showToast("Property link copied to clipboard", "success");
    } catch (error) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showToast("Property link copied to clipboard", "success");
    }
  };

  // Handle view property details
  const handleViewProperty = (propertyId) => {
    navigate(`/property-details?id=${propertyId}`);
  };

  // Format price for display
  const formatPrice = (price) => {
    const numericPrice = typeof price === 'string' ? parseFloat(price.replace(/,/g, '')) : price;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numericPrice);
  };

  // Format property type for display
  const formatPropertyType = (type) => {
    return type?.charAt(0).toUpperCase() + type?.slice(1).toLowerCase();
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get days since creation
  const getDaysCreated = (createdAt) => {
    return Math.floor((new Date() - new Date(createdAt)) / (1000 * 60 * 60 * 24));
  };

  // Check if property is new (within 7 days)
  const isNewProperty = (createdAt) => {
    const daysCreated = getDaysCreated(createdAt);
    return daysCreated <= 7;
  };

  // Loading state
  if (!listings) {
    return (
      <div className="card p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 space-y-2 sm:space-y-0">
          <div className="skeleton h-6 w-40 rounded"></div>
          <div className="skeleton h-8 w-32 rounded-md"></div>
        </div>
        <div className="mb-4">
          <div className="skeleton h-10 w-full rounded-md mb-3"></div>
          <div className="flex gap-3">
            <div className="skeleton h-10 w-32 rounded-md"></div>
            <div className="skeleton h-10 w-32 rounded-md"></div>
          </div>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex flex-col sm:flex-row">
              <div className="skeleton rounded-xl w-full h-48 sm:w-48 sm:h-32 mb-3 sm:mb-0"></div>
              <div className="sm:ml-4 w-full">
                <div className="skeleton h-5 w-40 mb-2 rounded"></div>
                <div className="skeleton h-4 w-56 mb-2 rounded"></div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
                  <div className="flex flex-wrap gap-2">
                    <div className="skeleton h-5 w-20 rounded"></div>
                    <div className="skeleton h-5 w-32 rounded"></div>
                  </div>
                  <div className="flex space-x-2">
                    <div className="skeleton h-8 w-8 rounded"></div>
                    <div className="skeleton h-8 w-8 rounded"></div>
                    <div className="skeleton h-8 w-8 rounded"></div>
                    <div className="skeleton h-8 w-8 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="card p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 space-y-3 sm:space-y-0">
          <div>
            <h2 className="text-xl font-semibold text-text-primary">Active Listings</h2>
            {filteredListings.length > 0 && (
              <p className="text-sm text-text-secondary mt-1">
                Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredListings.length)} of {filteredListings.length}
              </p>
            )}
          </div>
          <button 
            onClick={() => navigate('/property-create-edit')}
            className="btn-primary text-sm px-4 py-2 rounded-md w-full sm:w-auto"
          >
            Add New Property
          </button>
        </div>

        {/* Search and Filter Section */}
        {listings.length > 0 && (
          <div className="mb-4 space-y-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search properties..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 pl-10 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-secondary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="flex-1 px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {STATUS_OPTIONS.map(option => (
                  <option key={option} value={option}>
                    {option === 'All' ? 'All Status' : option}
                  </option>
                ))}
              </select>
              
              {/* Sort Options */}
              <select
                value={sortOption}
                onChange={(e) => {
                  setSortOption(e.target.value);
                  setCurrentPage(1);
                }}
                className="flex-1 px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {SORT_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {paginatedListings.length > 0 ? (
          <div className="space-y-4">
            {paginatedListings.map((property) => (
              <div key={property.id} className="border border-border rounded-lg p-3 sm:p-4 hover:shadow-elevation-2 transition-all duration-200">
                <div className="flex flex-col sm:flex-row">
                  {/* Property Image */}
                  <div className="flex-shrink-0 mb-3 sm:mb-0 relative">
                    {property.image ? (
                      <img
                        src={property.image}
                        alt={property.title}
                        className="w-full h-48 sm:w-48 sm:h-32 object-cover rounded-xl cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => handleViewProperty(property.id)}
                      />
                    ) : (
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-48 sm:w-48 sm:h-32 flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors"
                           onClick={() => handleViewProperty(property.id)}>
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    
                    {/* New Badge */}
                    {isNewProperty(property.createdAt) && (
                      <div className="absolute top-3 left-3 bg-success text-white px-2 py-1 rounded-md text-xs font-medium">
                        New
                      </div>
                    )}
                  </div>

                  {/* Property Details */}
                  <div className="sm:ml-4 flex-grow min-w-0">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                      <div className="flex-grow mb-3 sm:mb-0 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0 pr-4">
                            <h3 
                              className="text-lg font-semibold text-text-primary hover:text-primary cursor-pointer transition-colors truncate mb-1"
                              onClick={() => handleViewProperty(property.id)}
                              title={property.title}
                            >
                              {property.title}
                            </h3>
                            <div className="flex items-center justify-between">
                              <p className="text-xl font-bold text-primary">
                                {formatPrice(property.price)}
                              </p>
                              
                            </div>
                          </div>
                        </div>

                        <p className="text-text-secondary text-sm mb-2 truncate overflow-hidden" title={property.location}>
                          <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          {property.location}
                        </p>

                        {/* Property Features */}
                        <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mb-2 text-sm text-text-secondary">
                          {property.bedrooms > 0 && (
                            <div className="flex items-center space-x-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 21v-4a2 2 0 012-2h4a2 2 0 012 2v4" />
                              </svg>
                              <span>{property.bedrooms}bd</span>
                            </div>
                          )}
                          {property.bathrooms > 0 && (
                            <div className="flex items-center space-x-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                              </svg>
                              <span>{property.bathrooms}ba</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            <span>{formatPropertyType(property.type)}</span>
                          </div>
                        </div>

                        {/* Status and timing info */}
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Available From display for occupied properties */}
                          {property.status?.toLowerCase() === 'occupied' && property.availableFrom && (
                            <span className="bg-warning-100 text-warning text-xs px-2 py-1 rounded whitespace-nowrap">
                              Available from {new Date(property.availableFrom).toLocaleDateString()}
                            </span>
                          )}
                          
                          {/* Added on badge */}
                          <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded whitespace-nowrap">
                            Added {getDaysCreated(property.createdAt)}d ago
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons and Status Badge container */}
                      <div className="flex items-center justify-between sm:ml-4 flex-shrink-0 self-start md:flex-col md:items-end">
                        {/* The action buttons group */}
                        <div className="flex items-center space-x-2">
                          {/* View Property */}
                          <button
                            onClick={() => handleViewProperty(property.id)}
                            className="flex items-center space-x-1 px-2 py-1 text-xs text-text-secondary hover:text-primary hover:bg-primary-50 rounded-md transition-colors"
                            title="View Property"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span className="hidden sm:inline">View</span>
                          </button>

                          {/* Share Property */}
                          <button
                            onClick={() => handleShare(property)}
                            className="flex items-center space-x-1 px-2 py-1 text-xs text-text-secondary hover:text-secondary hover:bg-secondary-50 rounded-md transition-colors"
                            title="Share Property"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                            </svg>
                            <span className="hidden sm:inline">Share</span>
                          </button>

                          {/* Edit Property */}
                          <button
                            onClick={() => handleEditClick(property)}
                            className="flex items-center space-x-1 px-2 py-1 text-xs text-text-secondary hover:text-info hover:bg-info-50 rounded-md transition-colors"
                            title="Edit Property"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span className="hidden sm:inline">Edit</span>
                          </button>

                          {/* Delete Property */}
                          <button
                            onClick={() => handleDeleteClick(property)}
                            disabled={deletingId === property.id}
                            className="flex items-center space-x-1 px-2 py-1 text-xs text-text-secondary hover:text-error hover:bg-error-50 rounded-md transition-colors disabled:opacity-50"
                            title="Delete Property"
                          >
                            {deletingId === property.id ? (
                              <div className="w-4 h-4 border-2 border-error border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                <span className="hidden sm:inline">Delete</span>
                              </>
                            )}
                          </button>
                        </div>
                        {/* The status badge */}
                        <StatusBadge status={property.status.toUpperCase()} />
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Uniform Tailwind Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-2 mt-6">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="w-full sm:w-auto px-3 py-2 text-sm border border-border rounded-md hover:bg-background-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>

                <div className="flex space-x-2 overflow-x-auto pb-1">
                  {[...Array(totalPages)].map((_, index) => {
                    const pageNumber = index + 1;
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`flex-shrink-0 px-3 py-2 text-sm border rounded-md transition-colors ${
                          currentPage === pageNumber
                            ? 'bg-primary text-white border-primary'
                            : 'border-border hover:bg-background-secondary'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="w-full sm:w-auto px-3 py-2 text-sm border border-border rounded-md hover:bg-background-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto bg-secondary-100 rounded-full p-4 w-16 h-16 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-text-primary">
              {searchQuery || statusFilter !== 'All' ? "No properties match your filters" : "No active listings yet"}
            </h3>
            <p className="text-text-secondary mt-2">
              {searchQuery || statusFilter !== 'All' ? "Try adjusting your search terms or filters" : "Create your first property listing to get started"}
            </p>
            <button 
              onClick={() => {
                if (searchQuery || statusFilter !== 'All') {
                  setSearchQuery('');
                  setStatusFilter('All');
                  setSortOption('newest');
                  setCurrentPage(1);
                } else {
                  navigate('/property-create-edit');
                }
              }}
              className="btn-primary mt-4 px-4 py-2 rounded-md"
            >
              {searchQuery || statusFilter !== 'All' ? 'Clear Filters' : 'Add New Property'}
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div ref={deleteModalRef} className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-text-primary mb-2">Delete Property</h3>
            <p className="text-text-secondary mb-6">
              Are you sure you want to delete "{propertyToDelete?.title}"? This action cannot be undone.
            </p>
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setPropertyToDelete(null);
                }}
                className="btn-secondary px-4 py-2 rounded-md w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deletingId === propertyToDelete?.id}
                className="bg-error text-white px-4 py-2 rounded-md hover:bg-error-dark transition-colors disabled:opacity-50 w-full sm:w-auto"
              >
                {deletingId === propertyToDelete?.id ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Deleting...
                  </div>
                ) : (
                  'Delete Property'
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Edit Confirmation Modal */}
      {showEditModal && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div ref={editModalRef} className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-text-primary mb-2">Edit Property</h3>
            <p className="text-text-secondary mb-6">
              You are about to edit "{propertyToEdit?.title}". You will be redirected to the property edit page.
            </p>
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setPropertyToEdit(null);
                }}
                className="btn-secondary px-4 py-2 rounded-md w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                onClick={confirmEdit}
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-info-dark transition-colors w-full sm:w-auto"
              >
                Continue to Edit
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}