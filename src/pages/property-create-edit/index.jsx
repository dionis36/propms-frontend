import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../contexts/AuthContext';
import { createProperty, getPropertyById, updateProperty } from '../../services/api';
import { useToast } from '../../contexts/ToastContext'; // Adjust path as needed


// Component imports
import ProgressIndicator from './components/ProgressIndicator';
import PropertyDetailsForm from './components/PropertyDetailsForm';
import LocationForm from './components/LocationForm';
import MediaUploadForm from './components/MediaUploadForm';
import PropertySpecificationsForm from './components/PropertySpecificationsForm';
import ReviewForm from './components/ReviewForm';

const PropertyCreateEdit = () => {
  const { user: currentUser, accessToken } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const { showToast } = useToast();



  // State management
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [isDraft, setIsDraft] = useState(true);
  const [lastSaved, setLastSaved] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmissionTime, setLastSubmissionTime] = useState(0);

  const steps = [
    'Property Details',
    'Location',
    'Media Upload',
    'Specifications',
    'Review'
  ];

  const DRAFT_KEY = `property_draft_${currentUser?.id || 'anonymous'}`;

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  // Load draft on mount
  useEffect(() => {
    if (isEditing && id) {
      // Load existing property data for editing
      loadPropertyData(id);
    } else {
      // Load draft only for new properties
      loadDraftData();
    }
  }, [isEditing, id]);

  // Auto-save draft on changes
  useEffect(() => {
    if (!isEditing && Object.keys(formData).length > 0) {
      saveDraftToLocalStorage();
    }
  }, [formData, isEditing]);

  // Auto-save interval
  const autoSave = useCallback(async () => {
    if (hasUnsavedChanges && Object.keys(formData).length > 0) {
      try {
        console.log('Auto-saving draft...', formData);
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }
  }, [formData, hasUnsavedChanges]);

  useEffect(() => {
    const interval = setInterval(autoSave, 30000);
    return () => clearInterval(interval);
  }, [autoSave]);

  // Mark form as having changes when data updates
  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [formData]);

  // Load draft from localStorage
  const loadDraftData = () => {
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
      try {
        const draftData = JSON.parse(savedDraft);
        setFormData(draftData);
        
        // Check which steps are completed based on loaded data
        const completed = new Set();
        if (validateStepData(1, draftData)) completed.add(1);
        if (validateStepData(2, draftData)) completed.add(2);
        if (validateStepData(4, draftData)) completed.add(4);
        setCompletedSteps(completed);
        
        console.log('📥 Loaded draft from localStorage:', draftData);
      } catch (error) {
        console.error('Draft parse error:', error);
      }
    }
  };


const loadPropertyData = async (propertyId) => {
  setIsLoading(true);
  try {
    const token = accessToken || localStorage.getItem('accessToken');
    const property = await getPropertyById(propertyId, token); // real backend fetch

    // Process images with unique IDs and primary flag
    const processedImages = property.media
      .filter(media => media.image)
      .map((media, index) => ({
        id: `existing-image-${media.id}`,
        name: media.image.split('/').pop(),
        file: null, // no actual file, just placeholder
        url: media.image,
        isPrimary: index === 0, // First image is primary by default
        type: 'image',
        size: null // Size unknown for existing files
      }));

    // Process videos with unique IDs
    const processedVideos = property.media
      .filter(media => media.video)
      .map(media => ({
        id: `existing-video-${media.id}`,
        name: media.video.split('/').pop(),
        file: null,
        url: media.video,
        type: 'video',
        size: null // Size unknown for existing files
      }));

    setFormData({
      title: property.title,
      price: property.price,
      propertyType: property.property_type,
      status: property.status,
      description: property.description,
      address: property.location,
      locationNotes: property.location_notes,
      rooms: property.bedrooms,
      bathrooms: property.bathrooms,
      latitude: parseFloat(property.latitude),
      longitude: parseFloat(property.longitude),
      amenities: Array.isArray(property.amenities)
        ? property.amenities
        : JSON.parse(property.amenities || '[]'),
      availableFrom: property.available_from || '',
      images: processedImages,
      videos: processedVideos,
    });

    setIsDraft(false);
    setCompletedSteps(new Set([1, 2, 3, 4]));
  } catch (error) {
    console.error('Failed to load property data:', error);
  } finally {
    setIsLoading(false);
  }
};


  // Save draft to localStorage (excluding File objects)
  const saveDraftToLocalStorage = () => {
    const draftForStorage = { ...formData };
    
    // Remove File objects before saving to localStorage
    if (draftForStorage.images) {
      draftForStorage.images = draftForStorage.images.map(img => ({
        name: img.name,
        isPrimary: img.isPrimary,
      }));
    }
    
    if (draftForStorage.videos) {
      draftForStorage.videos = draftForStorage.videos.map(vid => ({
        name: vid.name,
      }));
    }
    
    delete draftForStorage.mediaFiles; // Remove raw files
    
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draftForStorage));
    setLastSaved(new Date());
    setHasUnsavedChanges(true);
    console.log('💾 Auto-saved draft to localStorage');
  };

  // Prepare payload for API submission
  const preparePayload = () => {
    const data = new FormData();
    
    // Required fields
    data.append('title', formData.title || '');
    data.append('description', formData.description || '');
    data.append('location', formData.address || '');
    data.append('price', parseFloat(formData.price) || 0);
    data.append('property_type', (formData.propertyType || '').toUpperCase());
    data.append('status', (formData.status || '').toUpperCase());
    data.append('bedrooms', parseInt(formData.rooms) || 0);
    data.append('bathrooms', parseInt(formData.bathrooms) || 0);

    // Optional fields
    if (formData.locationNotes) {
      data.append('location_notes', formData.locationNotes);
    }
    
    // --- APPLYING THE FIX HERE ---
    // Truncate/round latitude and longitude to 6 decimal places
    if (formData.latitude) {
      const formattedLatitude = parseFloat(formData.latitude.toFixed(6));
      data.append('latitude', formattedLatitude.toString());
    }
    if (formData.longitude) {
      const formattedLongitude = parseFloat(formData.longitude.toFixed(6));
      data.append('longitude', formattedLongitude.toString());
    }
    // --- END OF FIX ---

    // Handle availability logic - ONLY for OCCUPIED status
    if (formData.status?.toUpperCase() === 'OCCUPIED' && formData.availableFrom) {
      data.append('available_from', formData.availableFrom);
    }
    // For AVAILABLE status, backend will set to creation date automatically

    // Amenities as JSON string
    // if (formData.amenities && formData.amenities.length > 0) {
    //   const amenitiesArray = formData.amenities.map(a => a.toLowerCase());
    //   data.append('amenities', JSON.stringify(amenitiesArray));
    // } else {
    //   data.append('amenities', JSON.stringify([]));
    // }
    // --- START OF REPLACEMENT CODE ---

// 1. Prepare the amenities array, converting to lowercase
const amenitiesArrayToSend = formData.amenities ? formData.amenities.map(a => a.toLowerCase()) : [];

// 2. Append each amenity as a separate entry to the FormData object
// This correctly sends an array of strings to a backend expecting multiple values for one key.
amenitiesArrayToSend.forEach(amenity => {
    data.append('amenities', amenity);
});


// --- END OF REPLACEMENT CODE ---

    // Image files - only append new files (with file property)
    // Sort images so primary image is submitted first
    if (formData.images && formData.images.length > 0) {
      // Filter only new files (those with file property)
      const newImageFiles = formData.images.filter(imageFile => imageFile && imageFile.file);
      
      // Sort so primary image comes first
      const sortedImages = newImageFiles.sort((a, b) => {
        if (a.isPrimary && !b.isPrimary) return -1;
        if (!a.isPrimary && b.isPrimary) return 1;
        return 0; // maintain original order for non-primary images
      });
      
      // Append sorted images to FormData
      sortedImages.forEach(imageFile => {
        data.append('image', imageFile.file);
      });
    }

    // Video files (up to 3) - only append new files (with file property)
    if (formData.videos && formData.videos.length > 0) {
      formData.videos.slice(0, 3).forEach(videoFile => { // Remove the 'index' parameter
        if (videoFile && videoFile.file) {
          data.append('video', videoFile.file); // Change back to a single, consistent key 'video'
        }
      });
    }

    return data;
};

  // Enhanced validation function
  const validateStepData = (step, data = formData) => {
    switch (step) {
      case 1: // Property Details
        return !!(
          data?.title?.trim() &&
          data?.price && data.price > 0 &&
          data?.propertyType &&
          data?.status &&
          data?.description?.trim()
        );
      case 2: // Location
        return !!(data?.address?.trim());
      case 3: // Media Upload (optional)
        return true;
      case 4: // Specifications
        return !!(
          data?.rooms && data.rooms >= 1 &&
          data?.bathrooms && data.bathrooms >= 0
        );
      case 5: // Review
        return true;
      default:
        return false;
    }
  };

  // Validate current step and set errors
  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 1:
        if (!formData?.title?.trim()) {
          newErrors.title = 'Property title is required';
        }
        if (!formData?.price || formData.price <= 0) {
          newErrors.price = 'Valid price is required';
        }
        if (!formData?.propertyType) {
          newErrors.propertyType = 'Property type is required';
        }
        if (!formData?.status) {
          newErrors.status = 'Property status is required';
        }
        if (!formData?.description?.trim()) {
          newErrors.description = 'Description is required';
        }
        break;
        
      case 2:
        if (!formData?.address?.trim()) {
          newErrors.address = 'Address is required';
        }
        break;
        
      case 4:
        if (!formData?.rooms || formData.rooms < 1) {
          newErrors.rooms = 'Valid number of rooms is required';
        }
        if (formData?.bathrooms === undefined || formData.bathrooms < 0) {
          newErrors.bathrooms = 'Valid number of bathrooms is required';
        }
        break;
        
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check if a step is accessible
  const isStepAccessible = (step) => {
    if (step === 1) return true; // First step is always accessible
    if (step === 3) return completedSteps.has(1) && completedSteps.has(2); // Media after basic info
    if (step === 5) return completedSteps.has(1) && completedSteps.has(2) && completedSteps.has(4); // Review after all required steps
    return completedSteps.has(step - 1); // Sequential access for other steps
  };

  // Navigation handlers
  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleStepEdit = (step) => {
    if (isStepAccessible(step)) {
      setCurrentStep(step);
    } else {
      const missingSteps = [];
      for (let i = 1; i < step; i++) {
        if (!completedSteps.has(i) && i !== 3) { // Skip media step for required validation
          missingSteps.push(steps[i - 1]);
        }
      }
      alert(`Please complete the following steps first: ${missingSteps.join(', ')}`);
    }
  };

  // Save draft handler
  const handleSaveDraft = async () => {
    setIsLoading(true);
    try {
      console.log('Saving draft...', formData);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsDraft(true);
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Save draft failed:', error);
    } finally {
      setIsLoading(false);
    }
  };



  // Updated handlePublish function with toast notifications
  const handlePublish = async () => {
    // Prevent double-click submissions
    const now = Date.now();
    if (isSubmitting || (now - lastSubmissionTime < 2000)) {
      console.log('⚠️ Submission blocked - too soon after last attempt');
      return;
    }

    // Validate all required steps
    let isValid = true;
    for (let step = 1; step <= 4; step++) {
      if (step !== 3 && !validateStep(step)) {
        isValid = false;
        setCurrentStep(step);
        return;
      }
    }
    if (!isValid) return;

    // Set submission states
    setIsSubmitting(true);
    setIsLoading(true);
    setIsUploadingMedia(false);
    setSubmitError(null);
    setLastSubmissionTime(now);

    try {
      // Get authentication token
      let token = accessToken || localStorage.getItem('accessToken');
      
      console.group('🔐 Authentication Debug');
      console.log('Current user:', currentUser);
      console.log('User role:', currentUser?.role || 'Unknown');
      console.log('Access token available:', !!token);
      console.groupEnd();

      if (!token) {
        throw new Error('Authentication required. Please log in to continue.');
      }

      // Basic token format validation
      if (!token.includes('.') || token.split('.').length !== 3) {
        console.error('❌ Invalid token format detected');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        throw new Error('Invalid authentication token. Please log in again.');
      }

      const payload = preparePayload();

      console.group('🚀 Property Operation');
      console.log('Operation:', isEditing ? 'UPDATE' : 'CREATE');
      console.log('Property ID:', id || 'New Property');
      console.log('User:', currentUser?.email);
      console.log('Role:', currentUser?.role);
      console.groupEnd();

      // Call appropriate API function
      const propertyData = isEditing
        ? await updateProperty(id, payload, token)
        : await createProperty(payload, token);

      console.log('✅ Property operation completed successfully');

      // Handle media upload status
      const hasNewMedia = 
        (formData.images && formData.images.some(img => img.file)) ||
        (formData.videos && formData.videos.some(vid => vid.file));

      if (hasNewMedia) {
        setIsUploadingMedia(true);
        console.log('📤 New media files were included in the request');
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsUploadingMedia(false);
      }

      // Clean up draft for new properties
      if (!isEditing) {
        localStorage.removeItem(DRAFT_KEY);
        console.log('🗑️ Cleaned up draft data');
      }

      // 🎉 SUCCESS TOAST NOTIFICATIONS
      const propertyTitle = formData.title || 'Property';
      
      if (isEditing) {
        showToast(
          `"${propertyTitle}" has been updated successfully!`, 
          "success",
          {
            duration: 4000,
            showCloseButton: true
          }
        );
      } else {
        showToast(
          `"${propertyTitle}" has been created and published successfully!`, 
          "success",
          {
            duration: 5000,
            showCloseButton: true
          }
        );
      }

      console.log('🎉 Property published successfully!');
      
// Navigate after a short delay to show toast
       setTimeout(() => {
         if (isEditing) {
         // For editing, we have the ID from URL params
           navigate(`/property-details?id=${id}`);
        } else {
          // For creation, check if we got an ID from the response
          if (propertyData?.id) {
            navigate(`/property-details?id=${propertyData.id}`);
          } else {
             // Fallback to agent dashboard if no ID returned
            console.warn('No property ID returned from creation, redirecting to dashboard');
            navigate('/agent-dashboard');
          }
        }
      }, 1500); // Delay to show toast
      
    } catch (error) {
      console.error('🚨 Publish error:', error);
      
      // 🚨 ERROR TOAST NOTIFICATIONS
      let errorTitle = isEditing ? 'Update Failed' : 'Publishing Failed';
      let errorMessage = '';
      
      if (error.status === 401) {
        errorTitle = 'Authentication Required';
        errorMessage = 'Please log in again to continue.';
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      } else if (error.status === 403) {
        errorTitle = 'Permission Denied';
        errorMessage = error.message || 'You do not have permission to perform this action.';
      } else if (error.status === 404 && isEditing) {
        errorTitle = 'Property Not Found';
        errorMessage = 'This property may have been deleted by another user.';
      } else if (error.status === 400) {
        errorTitle = 'Validation Error';
        errorMessage = error.message || 'Please check your input and try again.';
      } else if (error.type === 'network') {
        errorTitle = 'Network Error';
        errorMessage = 'Please check your internet connection and try again.';
      } else if (error.message?.includes('token')) {
        errorTitle = 'Authentication Issue';
        errorMessage = 'Please refresh the page and try again.';
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      } else {
        errorMessage = error.message || 'An unexpected error occurred. Please try again.';
      }

      // Show error toast
      showToast(errorMessage, "error", {
        duration: 6000,
        showCloseButton: true
      });

      // Also set the submit error for the UI error display
      setSubmitError(`${errorTitle}: ${errorMessage}`);
      
      // Reset submission time to allow retry after error
      setLastSubmissionTime(0);
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
      setIsUploadingMedia(false);
    }
  };

  // Cancel handler
  const handleCancel = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to leave?');
      if (!confirmed) return;
    }
    navigate('/agent-dashboard');
  };

  // Render step form
  const renderStepForm = () => {
    const commonProps = {
      formData,
      setFormData,
      errors,
      setErrors
    };

    switch (currentStep) {
      case 1:
        return <PropertyDetailsForm {...commonProps} />;
      case 2:
        return <LocationForm {...commonProps} />;
      case 3:
        return <MediaUploadForm {...commonProps} />;
      case 4:
        return <PropertySpecificationsForm {...commonProps} />;
      case 5:
        return <ReviewForm formData={formData} onEdit={handleStepEdit} />;
      default:
        return null;
    }
  };

  const helmet = (
    <Helmet>
      <title>{isEditing ? 'Edit Property' : 'Create Property'} | EstateHub</title>
      <meta name="description" content="Create or edit property listings with EstateHub." />
    </Helmet>
  );

  // Loading state for editing
  if (isLoading && isEditing && !formData?.title) {
    return (
      <>
        {helmet}
        <div className="min-h-screen bg-background">
          <Header />
          <div className="pt-16 lg:pt-18">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-text-secondary">Loading property data...</p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {helmet}
      <div className="min-h-screen bg-background">
        <Header />
        
        {/* Sticky Progress Header */}
        <div className="sticky top-16 lg:top-18 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <div className="flex items-center justify-between gap-4">
              {/* Progress Indicator */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex items-center gap-1 sm:gap-2">
                  {steps.map((step, index) => (
                    <div key={index + 1} className="flex items-center">
                      <button
                        onClick={() => handleStepEdit(index + 1)}
                        disabled={!isStepAccessible(index + 1)}
                        className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                          currentStep === index + 1
                            ? 'bg-primary text-white shadow-md'
                            : completedSteps.has(index + 1)
                            ? 'bg-blue-600 text-white'
                            : isStepAccessible(index + 1)
                            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 cursor-pointer'
                            : 'bg-border text-text-secondary cursor-not-allowed opacity-50'
                        }`}
                      >
                        {completedSteps.has(index + 1) ? (
                          <Icon name="Check" size={12} />
                        ) : (
                          index + 1
                        )}
                      </button>
                      {index < steps.length - 1 && (
                        <div className={`w-4 sm:w-6 h-0.5 mx-1 ${
                          completedSteps.has(index + 1) ? 'bg-blue-600' : 'bg-border'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
                <div className="hidden sm:block text-sm text-text-secondary truncate">
                  Step {currentStep}: {steps[currentStep - 1]}
                </div>
              </div>
              
              {/* Status Indicators */}
              <div className="flex items-center gap-2 text-xs flex-shrink-0">
                {lastSaved && (
                  <div className="flex items-center gap-1 text-text-secondary">
                    <Icon name="Clock" size={12} />
                    <span className="hidden lg:inline">Saved:</span>
                    <span className="font-medium">
                      {lastSaved.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                )}
                {hasUnsavedChanges && (
                  <div className="flex items-center gap-1 text-warning">
                    <Icon name="AlertCircle" size={12} />
                    <span className="hidden sm:inline">Unsaved</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header Section */}
            <div className="mb-4 lg:mb-6">
              <h1 className="text-xl lg:text-2xl xl:text-3xl font-bold text-text-primary font-heading leading-tight">
                {isEditing ? 'Edit Property' : 'Create New Property'}
              </h1>
              <p className="text-text-secondary mt-1 text-sm">
                {isEditing ? 'Update your property listing details' : 'Add a new property to your listings'}
              </p>
            </div>

            {/* Error Message */}
            {submitError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-700">
                  <Icon name="AlertCircle" size={16} />
                  <span className="text-sm font-medium">Publishing Failed</span>
                </div>
                <p className="text-red-600 text-sm mt-1">{submitError}</p>
              </div>
            )}

            {/* Main Content */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 lg:gap-6 pb-6">
              {/* Form Content */}
              <div className="xl:col-span-3">
                <div className="bg-surface rounded-xl shadow-elevation-1 p-4 sm:p-6">
                  {renderStepForm()}
                </div>
              </div>

              {/* Desktop Sidebar */}
              <div className="hidden xl:block xl:col-span-1">
                <div className="sticky top-24 space-y-4">
                  {/* Step Navigation */}
                  <div className="bg-surface rounded-xl shadow-elevation-1 p-4">
                    <h3 className="font-semibold text-text-primary text-sm mb-3">Navigation</h3>
                    <div className="space-y-2">
                      {steps.map((step, index) => (
                        <button
                          key={index + 1}
                          onClick={() => handleStepEdit(index + 1)}
                          disabled={!isStepAccessible(index + 1)}
                          className={`w-full text-left p-2 rounded-lg transition-colors text-sm ${
                            currentStep === index + 1
                              ? 'bg-primary text-white shadow-md'
                              : completedSteps.has(index + 1)
                              ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                              : isStepAccessible(index + 1)
                              ? 'bg-background hover:bg-blue-50 text-text-primary border border-transparent hover:border-blue-200'
                              : 'bg-background/50 text-text-secondary cursor-not-allowed opacity-50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium ${
                              currentStep === index + 1
                                ? 'bg-white text-primary'
                                : completedSteps.has(index + 1)
                                ? 'bg-blue-600 text-white'
                                : isStepAccessible(index + 1)
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-border text-text-secondary'
                            }`}>
                              {completedSteps.has(index + 1) ? (
                                <Icon name="Check" size={10} />
                              ) : (
                                index + 1
                              )}
                            </div>
                            <span className="text-xs font-medium truncate">{step}</span>
                            {!isStepAccessible(index + 1) && (
                              <Icon name="Lock" size={10} className="ml-auto opacity-50" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Progress Summary */}
                  <div className="bg-surface rounded-xl shadow-elevation-1 p-4">
                    <h3 className="font-semibold text-text-primary text-sm mb-3">Progress</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Completed:</span>
                        <span className="font-medium">{completedSteps.size}/{steps.length}</span>
                      </div>
                      <div className="w-full bg-background rounded-full h-1.5">
                        <div 
                          className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${(completedSteps.size / steps.length) * 100}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-text-secondary">
                        {Math.round((completedSteps.size / steps.length) * 100)}% Complete
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="bg-surface rounded-xl shadow-elevation-1 p-4 mt-6">
              <div className="flex items-center justify-between gap-3">
                {/* Cancel Button */}
                <Button 
                  variant="outline" 
                  onClick={handleCancel} 
                  disabled={isLoading || isUploadingMedia} 
                  iconName="X" 
                  size="sm"
                  className="px-3 py-2 text-sm"
                >
                  Cancel
                </Button>

                {/* Navigation & Action Buttons */}
                <div className="flex items-center gap-2">
                  {currentStep > 1 && (
                    <Button 
                      variant="outline" 
                      onClick={handlePrevStep} 
                      disabled={isLoading || isUploadingMedia} 
                      iconName="ChevronLeft" 
                      size="sm"
                      className="px-3 py-2 text-sm"
                    >
                      <span className="hidden sm:inline">Previous</span>
                      <span className="sm:hidden">Prev</span>
                    </Button>
                  )}
                  
                  {currentStep < steps.length ? (
                    <Button
                      variant="primary"
                      onClick={handleNextStep}
                      disabled={isLoading || isUploadingMedia}
                      iconName="ChevronRight"
                      iconPosition="right"
                      size="sm"
                      className="px-3 py-2 text-sm"
                    >
                      <span className="hidden sm:inline">Next Step</span>
                      <span className="sm:hidden">Next</span>
                    </Button>
                  ) : (
                    // <Button
                    //   variant="primary"
                    //   onClick={handlePublish}
                    //   disabled={isLoading || isUploadingMedia}
                    //   size="sm"
                    //   className="px-4 py-2 text-sm min-w-[120px] relative"
                    // >
                    //   {isLoading || isUploadingMedia ? (
                    //     <div className="flex items-center justify-center gap-2">
                    //       <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    //       <span className="text-sm">
                    //         {isUploadingMedia ? 'Uploading Media...' : 'Publishing...'}
                    //       </span>
                    //     </div>
                    //   ) : (
                    //     <div className="flex items-center gap-2">
                    //       <Icon name="Rocket" size={14} />
                    //       <span>
                    //         {isEditing ? 'Update Property' : 'Publish Property'}
                    //       </span>
                    //     </div>
                    //   )}
                    // </Button>
                    
<Button
  variant="primary"
  onClick={handlePublish}
  disabled={isLoading || isUploadingMedia || isSubmitting}
  size="sm"
  className="px-4 py-2 text-sm min-w-[120px] relative"
>
  {(isLoading || isUploadingMedia || isSubmitting) ? (
    <div className="flex items-center justify-center gap-2">
      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
      <span className="text-sm">
        {isSubmitting 
          ? (isEditing ? 'Updating...' : 'Publishing...') 
          : isUploadingMedia 
          ? 'Uploading Media...' 
          : 'Processing...'
        }
      </span>
    </div>
  ) : (
    <div className="flex items-center gap-2">
      <Icon name="Rocket" size={14} />
      <span>
        {isEditing ? 'Update Property' : 'Publish Property'}
      </span>
    </div>
  )}
</Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PropertyCreateEdit;