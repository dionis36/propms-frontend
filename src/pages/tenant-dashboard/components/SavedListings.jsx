// pages/tenant-dashboard/components/SavedListings.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import EmptyState from './EmptyState';
import { getFavorites, removeFavorite } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext'; // Adjust path


export default function SavedListings() {
  const [savedListings, setSavedListings] = useState([]);
  const [loading, setLoading] = useState(true);
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


  // 🔹 Format backend favorites data
  const formatFavorites = (data) =>
    data.map((item) => ({
      id: item.id,
      propertyId: item.property.id,
      title: item.property.title,
      price: item.property.price,
      location: item.property.location,
      bedrooms: item.property.bedrooms,
      bathrooms: item.property.bathrooms,
      propertyType: item.property.property_type,
      status: item.property.status,
      availableFrom: item.property.available_from,
      image: item.property.media.find(m => m.image)?.image || null,
      savedAt: item.saved_at,
      daysSincePosted: item.property.days_since_posted,
      isAvailableNow: item.property.is_available_now,
    }));

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const data = await getFavorites(accessToken);
        const formatted = formatFavorites(data);
        setSavedListings(formatted);
      } catch (error) {
        console.error("Failed to fetch favorites:", error);
        showToast("Failed to load saved properties", "error");
      } finally {
        setLoading(false);
      }
    };

    if (accessToken) {
      fetchFavorites();
    }
  }, [accessToken]);

  // 🔹 Handle delete modal
  const handleDeleteClick = (property) => {
    setPropertyToDelete(property);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!propertyToDelete) return;

    try {
      setRemovingId(propertyToDelete.propertyId);
      await removeFavorite(propertyToDelete.propertyId, accessToken);
      setSavedListings(prev => prev.filter(item => item.propertyId !== propertyToDelete.propertyId));
      showToast("Property removed from saved list", "success");
      setShowDeleteModal(false);
      setPropertyToDelete(null);
    } catch (error) {
      console.error("Failed to remove favorite:", error);
      showToast("Failed to remove property", "error");
    } finally {
      setRemovingId(null);
    }
  };

  // 🔹 Handle property sharing
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

  // 🔹 Handle view property details
  const handleViewProperty = (propertyId) => {
    navigate(`/property-details?id=${propertyId}`);

  };

  // 🔹 Filter and pagination logic
  const filteredListings = savedListings.filter(listing =>
    listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredListings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedListings = filteredListings.slice(startIndex, startIndex + itemsPerPage);

  // 🔹 Format price for display
  const formatPrice = (price) => {
    const numericPrice = typeof price === 'string' ? parseFloat(price.replace(/,/g, '')) : price;
    return `TZS ${numericPrice.toLocaleString()}`;
  };

  // 🔹 Format property type for display
  const formatPropertyType = (type) => {
    return type?.charAt(0).toUpperCase() + type?.slice(1).toLowerCase();
  };

  // 🔹 Get status badge styling
  const getStatusBadge = (status, isAvailableNow) => {
    if (status === 'AVAILABLE' && isAvailableNow) {
      return 'bg-success-100 text-success';
    } else if (status === 'AVAILABLE') {
      return 'bg-warning-100 text-warning';
    } else {
      return 'bg-error-100 text-error';
    }
  };

  // 🔹 Close modal when clicking outside
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
          <h2 className="text-xl font-semibold text-text-primary">Saved Properties</h2>
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
              <div key={property.id} className="border border-border rounded-lg p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row">
                  {/* Property Image */}
                  <div className="flex-shrink-0 mb-3 sm:mb-0">
                    {property.image ? (
                      <img
                        src={property.image}
                        alt={property.title}
                        className="w-full h-48 sm:w-20 sm:h-20 object-cover rounded-xl cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => handleViewProperty(property.propertyId)}
                      />
                    ) : (
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-48 sm:w-20 sm:h-20 flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Property Details */}
                  <div className="sm:ml-4 flex-grow">
                    <div className="flex flex-col space-y-3">
                      <div className="flex-grow">
                        <h3 
                          className="font-medium text-text-primary hover:text-primary cursor-pointer transition-colors text-lg sm:text-base"
                          onClick={() => handleViewProperty(property.propertyId)}
                        >
                          {property.title}
                        </h3>
                        <p className="text-sm text-text-secondary mt-1">
                          {formatPrice(property.price)} • {property.bedrooms}bd {property.bathrooms}ba • {formatPropertyType(property.propertyType)}
                        </p>
                        <p className="text-xs text-text-secondary mt-1 line-clamp-2">
                          📍 {property.location}
                        </p>

                        <div className="flex flex-wrap items-center mt-2 gap-2">
                          <span className={`text-xs px-2 py-1 rounded whitespace-nowrap ${getStatusBadge(property.status, property.isAvailableNow)}`}>
                            {property.isAvailableNow ? 'Available Now' : `Available from ${new Date(property.availableFrom).toLocaleDateString()}`}
                          </span>
                          <span className="bg-secondary-100 text-secondary-700 text-xs px-2 py-1 rounded whitespace-nowrap">
                            Saved {Math.floor((new Date() - new Date(property.savedAt)) / (1000 * 60 * 60 * 24))} days ago
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between sm:justify-end space-x-2">
                        <div className="flex items-center space-x-2">
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
                              <svg className="w-5 h-5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                              </svg>
                            )}
                          </button>
                        </div>
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
      {showDeleteModal && (
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
        </div>
      )}

    </>
  );
}