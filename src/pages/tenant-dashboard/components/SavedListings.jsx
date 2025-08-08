// pages/tenant-dashboard/components/SavedListings.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import EmptyState from './EmptyState';
import { removeFavorite } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import { createPortal } from 'react-dom';
import StatusBadge from '../../../components/StatusBadge';


export default function SavedListings({ 
  user, 
  savedListings, 
  loading, 
  onSavedListingsUpdate, 
  onAddSavedListing, 
  onRemoveSavedListing 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [removingId, setRemovingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);
  const { showToast } = useToast();  
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const deleteModalRef = useRef();

  // Handle delete modal
  const handleDeleteClick = (property) => {
    setPropertyToDelete(property);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!propertyToDelete) return;

    try {
      setRemovingId(propertyToDelete.propertyId);
      await removeFavorite(propertyToDelete.propertyId, accessToken);
      
      // Call the parent callback to update the shared state
      onRemoveSavedListing(propertyToDelete.propertyId);
      
      showToast("Property removed from saved list", "info");
      setShowDeleteModal(false);
      setPropertyToDelete(null);
    } catch (error) {
      console.error("Failed to remove favorite:", error);
      showToast("Failed to remove property", "error");
    } finally {
      setRemovingId(null);
    }
  };

  // Handle property sharing
  const handleShare = async (property) => {
    const propertyUrl = `${window.location.origin}/property-details?id=${property.propertyId}`;
    
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
          // Fallback to copy if share was cancelled or failed
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

  // Filter and pagination logic
  const filteredListings = savedListings.filter(listing =>
    listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredListings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedListings = filteredListings.slice(startIndex, startIndex + itemsPerPage);

  // Format price for display (using PropertyCard theme)
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

  // Check if property is new (within 7 days)
  const isNewProperty = (savedAt) => {
    const daysSaved = Math.floor((new Date() - new Date(savedAt)) / (1000 * 60 * 60 * 24));
    return daysSaved <= 7;
  };

  // Get days saved count
  const getDaysSaved = (savedAt) => {
    return Math.floor((new Date() - new Date(savedAt)) / (1000 * 60 * 60 * 24));
  };

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (deleteModalRef.current && !deleteModalRef.current.contains(event.target)) {
        setShowDeleteModal(false);
        setPropertyToDelete(null);
      }
    };

    if (showDeleteModal) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDeleteModal]);

  if (loading) {
    return (
      <div className="card p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 space-y-2 sm:space-y-0">
          <div className="skeleton h-6 w-40 rounded"></div>
          <div className="skeleton h-8 w-20 rounded-md"></div>
        </div>
        <div className="mb-4">
          <div className="skeleton h-10 w-full rounded-md"></div>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex flex-col sm:flex-row">
              <div className="skeleton rounded-xl w-full h-48 sm:w-20 sm:h-20 mb-3 sm:mb-0"></div>
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
            <h2 className="text-xl font-semibold text-text-primary">Saved Properties</h2>
            {savedListings.length > 0 && (
              <p className="text-sm text-text-secondary mt-1">
                Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredListings.length)} of {filteredListings.length}
              </p>
            )}
          </div>
          <button 
            onClick={() => navigate('/property-listings')}
            className="btn-secondary text-sm px-4 py-2 rounded-md w-full sm:w-auto"
          >
            Browse More
          </button>
        </div>

        {savedListings.length > 0 && (
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search saved properties..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
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
                        onClick={() => handleViewProperty(property.propertyId)}
                      />
                    ) : (
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-48 sm:w-48 sm:h-32 flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    
                    {/* New Badge - matching PropertyCard theme */}
                    {isNewProperty(property.savedAt) && (
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
                              onClick={() => handleViewProperty(property.propertyId)}
                              title={property.title}
                            >
                              {property.title}
                            </h3>
                            <div className="flex items-center justify-between">
                              <p className="text-xl font-bold text-primary">
                                {formatPrice(property.price)}
                              </p>
                              {property.status && (
                                <StatusBadge status={property.status} className="ml-2" />
                              )}
                            </div>
                          </div>
                        </div>

                        <p className="text-text-secondary text-sm mb-2 truncate overflow-hidden" title={property.location}>
                          {property.location}
                        </p>

                        {/* Property Features - matching PropertyCard theme */}
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
                            <span>{formatPropertyType(property.propertyType)}</span>
                          </div>
                        </div>

                        {/* Status and availability info */}
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Status-based availability display */}
                          {property.status === 'AVAILABLE' ? (
                            property.isAvailableNow && (
                              <span className="bg-success-100 text-success text-xs px-2 py-1 rounded whitespace-nowrap">
                                Available Now
                              </span>
                            )
                          ) : property.status === 'OCCUPIED' && property.availableFrom && (
                            <span className="bg-warning-100 text-warning text-xs px-2 py-1 rounded whitespace-nowrap">
                              Available from {new Date(property.availableFrom).toLocaleDateString()}
                            </span>
                          )}
                          
                          {/* Days saved badge */}
                          <span className="bg-secondary-100 text-secondary-700 text-xs px-2 py-1 rounded whitespace-nowrap">
                            Saved {getDaysSaved(property.savedAt)}d ago
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2 sm:ml-4 flex-shrink-0 self-start">
                        {/* View Property */}
                        <button
                          onClick={() => handleViewProperty(property.propertyId)}
                          className="p-2 text-text-secondary hover:text-primary hover:bg-primary-50 rounded-md transition-colors"
                          title="View Property"
                        >
                          <svg className="w-5 h-5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>

                        {/* Share Property */}
                        <button
                          onClick={() => handleShare(property)}
                          className="p-2 text-text-secondary hover:text-secondary hover:bg-secondary-50 rounded-md transition-colors"
                          title="Share Property"
                        >
                          <svg className="w-5 h-5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                          </svg>
                        </button>

                        {/* Remove from Favorites */}
                        <button
                          onClick={() => handleDeleteClick(property)}
                          disabled={removingId === property.propertyId}
                          className="p-2 text-text-secondary hover:text-error hover:bg-error-50 rounded-md transition-colors disabled:opacity-50"
                          title="Remove from Saved"
                        >
                          {removingId === property.propertyId ? (
                            <div className="w-5 h-5 sm:w-4 sm:h-4 border-2 border-error border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <svg className="w-5 h-5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
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
          <EmptyState 
            title={searchTerm ? "No properties match your search" : "No saved properties yet"}
            description={searchTerm ? "Try adjusting your search terms" : "Start saving properties you're interested in to see them here"}
            actionText="Browse Properties"
            onAction={() => navigate('/property-listings')}
          />
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div ref={deleteModalRef} className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-text-primary mb-2">Remove from Saved</h3>
            <p className="text-text-secondary mb-6">
              Are you sure you want to remove "{propertyToDelete?.title}" from your saved properties?
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
                disabled={removingId === propertyToDelete?.propertyId}
                className="bg-error text-white px-4 py-2 rounded-md hover:bg-error-dark transition-colors disabled:opacity-50 w-full sm:w-auto"
              >
                {removingId === propertyToDelete?.propertyId ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Removing...
                  </div>
                ) : (
                  'Remove Property'
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}