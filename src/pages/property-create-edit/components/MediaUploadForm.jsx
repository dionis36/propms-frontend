import React, { useState, useRef } from 'react';
import Icon from '../../../components/AppIcon';

const MediaUploadForm = ({ formData, setFormData, errors, setErrors }) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const images = formData?.images || [];
  const videos = formData?.videos || [];

  // File validation constants
  const MAX_IMAGES = 10;
  const MAX_VIDEOS = 3;
  const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
  const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
  
  // Allowed file types with comprehensive MIME type checking
  const ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp'
  ];
  
  const ALLOWED_VIDEO_TYPES = [
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/x-msvideo', // AVI
    'video/avi'
  ];

  // Security: File signature validation (magic numbers)
  const FILE_SIGNATURES = {
    'image/jpeg': [0xFF, 0xD8, 0xFF],
    'image/png': [0x89, 0x50, 0x4E, 0x47],
    'image/webp': [0x52, 0x49, 0x46, 0x46],
    'video/mp4': [0x00, 0x00, 0x00, null, 0x66, 0x74, 0x79, 0x70],
    'video/avi': [0x52, 0x49, 0x46, 0x46],
    'video/quicktime': [0x00, 0x00, 0x00, null, 0x66, 0x74, 0x79, 0x70]
  };

  // Security: Check file signature against declared MIME type
  const validateFileSignature = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const arr = new Uint8Array(e.target.result);
        const signature = FILE_SIGNATURES[file.type];
        
        if (!signature) {
          resolve(false);
          return;
        }

        const matches = signature.every((byte, index) => {
          return byte === null || arr[index] === byte;
        });
        
        resolve(matches);
      };
      reader.onerror = () => resolve(false);
      reader.readAsArrayBuffer(file.slice(0, 16));
    });
  };

  // Enhanced file validation
  const validateFile = async (file, type) => {
    const errors = [];
    
    // Type validation
    const allowedTypes = type === 'image' ? ALLOWED_IMAGE_TYPES : ALLOWED_VIDEO_TYPES;
    if (!allowedTypes.includes(file.type)) {
      errors.push(`Invalid file type: ${file.type}. Allowed types: ${allowedTypes.join(', ')}`);
    }
    
    // Size validation
    const maxSize = type === 'image' ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;
    if (file.size > maxSize) {
      errors.push(`File size exceeds limit: ${formatFileSize(file.size)} > ${formatFileSize(maxSize)}`);
    }
    
    // Security: File signature validation
    if (allowedTypes.includes(file.type)) {
      const isValidSignature = await validateFileSignature(file);
      if (!isValidSignature) {
        errors.push(`File signature doesn't match declared type: ${file.type}`);
      }
    }
    
    // Check for double extensions (security)
    const nameParts = file.name.split('.');
    if (nameParts.length > 2) {
      errors.push(`Multiple extensions detected: ${file.name}`);
    }
    
    return errors;
  };

  // Enhanced quantity validation
  const validateQuantity = (newFiles, type) => {
    const currentCount = type === 'image' ? images.length : videos.length;
    const maxCount = type === 'image' ? MAX_IMAGES : MAX_VIDEOS;
    
    if (currentCount + newFiles.length > maxCount) {
      return `Cannot upload ${newFiles.length} ${type}(s). Maximum ${maxCount} ${type}(s) allowed. Currently have ${currentCount}.`;
    }
    
    return null;
  };

  // Update error state
  const updateErrors = (newErrors) => {
    if (newErrors.length > 0) {
      setErrors(prev => ({
        ...prev,
        media: newErrors
      }));
    } else {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated.media;
        return updated;
      });
    }
  };
 
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;
    
    // Separate files by type
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    const videoFiles = files.filter(file => file.type.startsWith('video/'));
    
    // Process images
    if (imageFiles.length > 0) {
      await handleImageUpload(imageFiles);
    }
    
    // Process videos
    if (videoFiles.length > 0) {
      await handleVideoUpload(videoFiles);
    }
  };

  const handleImageUpload = async (files) => {
    const fileArray = Array.from(files);
    const allErrors = [];
    
    // Validate quantity first
    const quantityError = validateQuantity(fileArray, 'image');
    if (quantityError) {
      allErrors.push(quantityError);
      updateErrors(allErrors);
      return;
    }
    
    // Validate each file
    const validFiles = [];
    for (const file of fileArray) {
      const fileErrors = await validateFile(file, 'image');
      if (fileErrors.length > 0) {
        allErrors.push(...fileErrors.map(err => `${file.name}: ${err}`));
      } else {
        validFiles.push(file);
      }
    }
    
    // If there are validation errors, show them and stop
    if (allErrors.length > 0) {
      updateErrors(allErrors);
      return;
    }
    
    // Check if there's already a primary image
    const hasPrimary = images.some(img => img.isPrimary);
    
    // Create image objects for valid files
    const newImages = validFiles.map((file, index) => {
      const uniqueId = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      
      return {
        id: uniqueId,
        file,
        preview: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        type: 'image',
        // Only set as primary if it's the first image in the batch AND there are no existing primary images
        isPrimary: index === 0 && !hasPrimary && images.length === 0
      };
    });
    
    setFormData(prev => ({
      ...prev,
      images: [...(prev?.images || []), ...newImages]
    }));
    
    // Clear errors if upload successful
    updateErrors([]);
  };

  const handleVideoUpload = async (files) => {
    const fileArray = Array.from(files);
    const allErrors = [];
    
    // Validate quantity first
    const quantityError = validateQuantity(fileArray, 'video');
    if (quantityError) {
      allErrors.push(quantityError);
      updateErrors(allErrors);
      return;
    }
    
    // Validate each file
    const validFiles = [];
    for (const file of fileArray) {
      const fileErrors = await validateFile(file, 'video');
      if (fileErrors.length > 0) {
        allErrors.push(...fileErrors.map(err => `${file.name}: ${err}`));
      } else {
        validFiles.push(file);
      }
    }
    
    // If there are validation errors, show them and stop
    if (allErrors.length > 0) {
      updateErrors(allErrors);
      return;
    }
    
    // Create video objects for valid files
    const newVideos = validFiles.map(file => ({
      id: Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      type: 'video'
    }));
    
    setFormData(prev => ({
      ...prev,
      videos: [...(prev?.videos || []), ...newVideos]
    }));
    
    // Clear errors if upload successful
    updateErrors([]);
  };

  const removeImage = (imageId) => {
    const imageToRemove = images.find(img => img.id === imageId);
    if (imageToRemove?.preview) {
      URL.revokeObjectURL(imageToRemove.preview);
    }
    
    // Create new array without the removed image
    const remainingImages = images.filter(img => img.id !== imageId);
    
    // FIXED: Only set new primary if the removed image WAS primary and there are remaining images
    if (imageToRemove?.isPrimary && remainingImages.length > 0) {
      // Ensure only the first remaining image becomes primary
      remainingImages[0] = { ...remainingImages[0], isPrimary: true };
      // Ensure all other images are not primary
      for (let i = 1; i < remainingImages.length; i++) {
        remainingImages[i] = { ...remainingImages[i], isPrimary: false };
      }
    }
    
    // FIXED: Update state properly to prevent deletion bugs
    setFormData(prev => ({
      ...prev,
      images: remainingImages
    }));
  };

  const removeVideo = (videoId) => {
    const videoToRemove = videos.find(vid => vid.id === videoId);
    if (videoToRemove?.preview) {
      URL.revokeObjectURL(videoToRemove.preview);
    }
    
    // FIXED: Create new array properly
    const remainingVideos = videos.filter(vid => vid.id !== videoId);
    
    setFormData(prev => ({
      ...prev,
      videos: remainingVideos
    }));
  };

  const setPrimaryImage = (imageId) => {
    // FIXED: Ensure only one primary image at a time
    const updatedImages = images.map(img => ({
      ...img,
      isPrimary: img.id === imageId
    }));
    
    setFormData(prev => ({
      ...prev,
      images: updatedImages
    }));
  };

  const reorderImages = (fromIndex, toIndex) => {
    const updatedImages = [...images];
    const [movedImage] = updatedImages.splice(fromIndex, 1);
    updatedImages.splice(toIndex, 0, movedImage);
    
    setFormData(prev => ({
      ...prev,
      images: updatedImages
    }));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // FIXED: Helper function to get media data for review forms
  const getMediaSummary = () => {
    const primaryImage = images.find(img => img.isPrimary);
    return {
      totalImages: images.length,
      totalVideos: videos.length,
      primaryImage: primaryImage ? {
        name: primaryImage.name,
        size: formatFileSize(primaryImage.size),
        preview: primaryImage.preview
      } : null,
      allImages: images.map(img => ({
        id: img.id,
        name: img.name,
        size: formatFileSize(img.size),
        isPrimary: img.isPrimary,
        preview: img.preview
      })),
      allVideos: videos.map(vid => ({
        id: vid.id,
        name: vid.name,
        size: formatFileSize(vid.size),
        preview: vid.preview
      }))
    };
  };

  // Expose media summary for parent components (like review forms)
  React.useEffect(() => {
    if (setFormData) {
      setFormData(prev => ({
        ...prev,
        mediaSummary: getMediaSummary()
      }));
    }
  }, [images, videos]);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
          <Icon name="Camera" size={16} className="text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-text-primary">Media Upload</h2>
      </div>

      {/* Error Display */}
      {errors?.media && errors.media.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Icon name="AlertCircle" size={16} className="text-red-500 mr-2" />
            <h4 className="text-sm font-medium text-red-800">Upload Errors</h4>
          </div>
          <ul className="text-sm text-red-700 space-y-1">
            {errors.media.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Image Upload Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-text-primary">Images</h3>
          <span className="text-sm text-text-secondary">
            {images.length}/{MAX_IMAGES} images
          </span>
        </div>
        
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
            dragActive 
              ? 'border-primary bg-primary-50' :'border-border hover:border-primary hover:bg-primary-50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={(e) => handleImageUpload(e.target.files)}
            className="hidden"
          />
          
          <div className="space-y-4">
            <Icon name="Upload" size={48} className="mx-auto text-text-secondary" />
            <div>
              <p className="text-text-primary font-medium">
                Drag and drop images here, or click to browse
              </p>
              <p className="text-sm text-text-secondary mt-1">
                Support for JPG, PNG, WebP up to 10MB each
              </p>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-primary text-white px-6 py-2 rounded-md font-medium hover:bg-primary-700 transition-colors duration-200"
              disabled={images.length >= MAX_IMAGES}
            >
              Choose Images
            </button>
          </div>
        </div>

        {/* Image Preview Grid */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
            {images.map((image, index) => (
              <div key={image.id} className="relative group">
                <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={image.preview}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Primary Image Badge */}
                  {image.isPrimary && (
                    <div className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded-full font-medium">
                      Primary
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center space-x-2">
                    {!image.isPrimary && (
                      <button
                        type="button"
                        onClick={() => setPrimaryImage(image.id)}
                        className="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                        title="Set as primary"
                      >
                        <Icon name="Star" size={16} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(image.id)}
                      className="bg-error text-white p-2 rounded-full hover:bg-error-600 transition-colors duration-200"
                      title="Remove image"
                    >
                      <Icon name="Trash2" size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="mt-2 text-xs text-text-secondary truncate">
                  <p>{image.name}</p>
                  <p>{formatFileSize(image.size)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Video Upload Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-text-primary">Videos</h3>
          <span className="text-sm text-text-secondary">
            {videos.length}/{MAX_VIDEOS} videos
          </span>
        </div>
        
        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
          <input
            ref={videoInputRef}
            type="file"
            multiple
            accept="video/mp4,video/mpeg,video/quicktime,video/x-msvideo,video/avi"
            onChange={(e) => handleVideoUpload(e.target.files)}
            className="hidden"
          />
          
          <div className="space-y-3">
            <Icon name="Video" size={32} className="mx-auto text-text-secondary" />
            <div>
              <p className="text-text-primary font-medium">Upload Property Videos</p>
              <p className="text-sm text-text-secondary">
                MP4, MOV, AVI up to 50MB each
              </p>
            </div>
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              className="bg-secondary text-text-primary px-4 py-2 rounded-md font-medium hover:bg-secondary-200 transition-colors duration-200"
              disabled={videos.length >= MAX_VIDEOS}
            >
              Choose Videos
            </button>
          </div>
        </div>

        {/* Video Preview List */}
        {videos.length > 0 && (
          <div className="space-y-3 mt-4">
            {videos.map((video, index) => (
              <div key={video.id} className="flex items-center space-x-3 p-3 bg-background rounded-lg border border-border">
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Icon name="Video" size={24} className="text-text-secondary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {video.name}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {formatFileSize(video.size)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeVideo(video.id)}
                  className="text-error hover:text-error-600 transition-colors duration-200 p-1"
                >
                  <Icon name="Trash2" size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Guidelines */}
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-text-primary mb-2 flex items-center">
          <Icon name="Info" size={16} className="mr-2 text-primary" />
          Media Guidelines
        </h4>
        <ul className="text-sm text-text-secondary space-y-1 ml-6">
          <li>• Use high-quality, well-lit photos</li>
          <li>• Include exterior, interior, and key feature shots</li>
          <li>• First image will be used as the primary listing photo</li>
          <li>• Videos should showcase the property's best features</li>
          <li>• Maximum file sizes: 10MB for images, 50MB for videos</li>
          <li>• Maximum {MAX_IMAGES} images and {MAX_VIDEOS} videos allowed</li>
        </ul>
      </div>
    </div>
  );
};

export default MediaUploadForm;