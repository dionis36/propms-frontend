import React, { useState, useRef } from 'react';
import Icon from '../../../components/AppIcon';

const MediaUploadForm = ({ formData, setFormData, errors, setErrors }) => {
  // ... (existing code remains unchanged until the handleImageUpload function)

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
    
    // Create image objects for valid files
    const newImages = validFiles.map(file => {
      // Generate unique identifier
      const uniqueId = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      
      return {
        id: uniqueId,
        file,
        preview: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        // Only set as primary if there are no existing images
        isPrimary: images.length === 0
      };
    });
    
    setFormData(prev => ({
      ...prev,
      images: [...(prev?.images || []), ...newImages]
    }));
    
    // Clear errors if upload successful
    updateErrors([]);
  };

  // ... (existing code remains unchanged until the removeImage function)

  const removeImage = (imageId) => {
    const imageToRemove = images.find(img => img.id === imageId);
    if (imageToRemove?.preview) {
      URL.revokeObjectURL(imageToRemove.preview);
    }
    
    const remainingImages = images.filter(img => img.id !== imageId);
    
    // If removed image was primary and there are remaining images,
    // set the first remaining image as primary
    if (imageToRemove?.isPrimary && remainingImages.length > 0) {
      remainingImages[0].isPrimary = true;
    }
    
    setFormData(prev => ({
      ...prev,
      images: remainingImages
    }));
  };

  const setPrimaryImage = (imageId) => {
    const updatedImages = images.map(img => ({
      ...img,
      // Reset all to false first
      isPrimary: false,
      // Add unique identifier to name only for primary image
      name: img.isPrimary ? img.name.replace(' (Primary)', '') : img.name
    }));
    
    // Find the image to set as primary and update it
    const primaryIndex = updatedImages.findIndex(img => img.id === imageId);
    if (primaryIndex !== -1) {
      updatedImages[primaryIndex] = {
        ...updatedImages[primaryIndex],
        isPrimary: true,
        name: `${updatedImages[primaryIndex].name} (Primary)`
      };
    }
    
    setFormData(prev => ({
      ...prev,
      images: updatedImages
    }));
  };

  // ... (existing code remains unchanged after this point)
};

export default MediaUploadForm;