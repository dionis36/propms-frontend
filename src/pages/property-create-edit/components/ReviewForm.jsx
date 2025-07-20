import React from 'react';
import Icon from '../../../components/AppIcon';

const ReviewForm = ({ formData, onEdit }) => {
  const formatPrice = (price) => {
    if (!price) return 'Not specified';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFullAddress = () => {
    const { address } = formData || {};
    return address || 'Not specified';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
          <Icon name="Eye" size={16} className="text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-text-primary">Review & Publish</h2>
      </div>

      {/* Property Overview Card */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-text-primary">
              {formData?.title || 'Untitled Property'}
            </h3>
            <p className="text-text-secondary text-sm mt-1">
              {getFullAddress()}
            </p>
          </div>
          <button
            onClick={() => onEdit(1)}
            className="text-primary hover:text-primary-700 text-sm font-medium transition-colors duration-200"
          >
            Edit
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-primary-50 rounded-lg">
            <p className="text-2xl font-bold text-primary">
              {formatPrice(formData?.price)}
            </p>
            <p className="text-xs text-text-secondary uppercase tracking-wide">Price</p>
          </div>
          <div className="text-center p-3 bg-secondary-50 rounded-lg">
            <p className="text-2xl font-bold text-text-primary">
              {formData?.propertyType || '—'}
            </p>
            <p className="text-xs text-text-secondary uppercase tracking-wide">Type</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-text-secondary">Status:</span>
            <span className="ml-2 text-text-primary font-medium">
              {formData?.status || 'Not specified'}
            </span>
          </div>
          {formData?.status === 'Occupied' && formData?.availableFrom && (
            <div>
              <span className="text-text-secondary">Available From:</span>
              <span className="ml-2 text-text-primary font-medium">
                {new Date(formData.availableFrom).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
        
        {formData?.description && (
          <div className="mt-4 pt-4 border-t border-border">
            <h4 className="text-sm font-medium text-text-primary mb-2">Description</h4>
            <p className="text-text-secondary text-sm leading-relaxed line-clamp-3">
              {formData.description}
            </p>
          </div>
        )}
      </div>

      {/* Location Details */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-primary">Location</h3>
          <button
            onClick={() => onEdit(2)}
            className="text-primary hover:text-primary-700 text-sm font-medium transition-colors duration-200"
          >
            Edit
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-text-secondary">Address:</span>
            <span className="ml-2 text-text-primary font-medium">
              {formData?.address || 'Not specified'}
            </span>
          </div>
          <div>
            <span className="text-text-secondary">Region:</span>
            <span className="ml-2 text-text-primary font-medium">
              {formData?.state || 'Not specified'}
            </span>
          </div>
          <div>
            <span className="text-text-secondary">Country:</span>
            <span className="ml-2 text-text-primary font-medium">
              {formData?.country || 'Not specified'}
            </span>
          </div>
          <div>
            <span className="text-text-secondary">Coordinates:</span>
            <span className="ml-2 text-text-primary font-medium">
              {formData?.latitude && formData?.longitude 
                ? `${formData.latitude}, ${formData.longitude}`
                : 'Not specified'}
            </span>
          </div>
          <div className="md:col-span-2">
            <span className="text-text-secondary">Location Notes:</span>
            <span className="ml-2 text-text-primary font-medium">
              {formData?.locationNotes || 'Not provided'}
            </span>
          </div>
        </div>
      </div>

      {/* Media Summary */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-primary">Media</h3>
          <button
            onClick={() => onEdit(3)}
            className="text-primary hover:text-primary-700 text-sm font-medium transition-colors duration-200"
          >
            Edit
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Images */}
          <div>
            <h4 className="text-sm font-medium text-text-primary mb-3 flex items-center">
              <Icon name="Image" size={16} className="mr-2" />
              Images ({(formData?.images || []).length})
            </h4>
            
            {(formData?.images || []).length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {(formData?.images || []).slice(0, 6).map((image, index) => (
                  <div key={image.id} className="relative aspect-square rounded-lg overflow-hidden">
                    <img
                      src={image.preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {image.isPrimary && (
                      <div className="absolute top-1 left-1 bg-primary text-white text-xs px-1 py-0.5 rounded">
                        Primary
                      </div>
                    )}
                  </div>
                ))}
                {(formData?.images || []).length > 6 && (
                  <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center">
                    <span className="text-text-secondary text-sm">
                      +{(formData?.images || []).length - 6} more
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-text-secondary text-sm">No images uploaded</p>
            )}
          </div>

          {/* Videos */}
          <div>
            <h4 className="text-sm font-medium text-text-primary mb-3 flex items-center">
              <Icon name="Video" size={16} className="mr-2" />
              Videos ({(formData?.videos || []).length})
            </h4>
            
            {(formData?.videos || []).length > 0 ? (
              <div className="space-y-2">
                {(formData?.videos || []).slice(0, 3).map((video, index) => (
                  <div key={video.id} className="flex items-center space-x-3 p-2 bg-background rounded-lg">
                    <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                      <Icon name="Video" size={16} className="text-text-secondary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text-primary truncate">{video.name}</p>
                      <p className="text-xs text-text-secondary">{formatFileSize(video.size)}</p>
                    </div>
                  </div>
                ))}
                {(formData?.videos || []).length > 3 && (
                  <p className="text-text-secondary text-sm text-center">
                    +{(formData?.videos || []).length - 3} more videos
                  </p>
                )}
              </div>
            ) : (
              <p className="text-text-secondary text-sm">No videos uploaded</p>
            )}
          </div>
        </div>
      </div>

      {/* Property Specifications */}
      {(formData?.rooms || formData?.bathrooms || (formData?.amenities && formData.amenities.length > 0)) && (
        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-primary">Property Specifications</h3>
            <button
              onClick={() => onEdit(4)}
              className="text-primary hover:text-primary-700 text-sm font-medium transition-colors duration-200"
            >
              Edit
            </button>
          </div>
      
          <div className="flex flex-wrap gap-2">
            {/* Display Rooms */}
            {formData?.rooms && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary">
                {formData.rooms} {formData.rooms === 1 ? 'Room' : 'Rooms'}
              </span>
            )}

            {/* Display Bathrooms */}
            {formData?.bathrooms && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary">
                {formData.bathrooms} {formData.bathrooms === 1 ? 'Bathroom' : 'Bathrooms'}
              </span>
            )}

            {/* Display Amenities */}
            {(formData?.amenities || []).map(amenity => (
              <span
                key={amenity}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary"
              >
                {amenity}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Publish Options */}
      <div className="bg-primary-50 border border-primary-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
          <Icon name="Rocket" size={20} className="mr-2 text-primary" />
          Ready to Publish?
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="publish-active"
              defaultChecked
              className="rounded border-border text-primary focus:ring-primary-500"
            />
            <label htmlFor="publish-active" className="text-sm text-text-primary">
              Make listing active and visible to potential buyers/renters
            </label>
          </div>
          
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="notify-network"
              defaultChecked
              className="rounded border-border text-primary focus:ring-primary-500"
            />
            <label htmlFor="notify-network" className="text-sm text-text-primary">
              Notify your professional network about this new listing
            </label>
          </div>

          {formData?.featured && (
            <div className="flex items-center space-x-3">
              <Icon name="Star" size={16} className="text-primary" />
              <span className="text-sm text-primary font-medium">
                This listing will be featured with premium placement
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewForm;