import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../contexts/AuthContext';
import { 
  createProperty, 
  updateProperty,
  uploadPropertyMedia 
} from '../../services/api';

// Component imports
import ProgressIndicator from './components/ProgressIndicator';
import PropertyDetailsForm from './components/PropertyDetailsForm';
import LocationForm from './components/LocationForm';
import MediaUploadForm from './components/MediaUploadForm';
import PropertySpecificationsForm from './components/PropertySpecificationsForm';
import ReviewForm from './components/ReviewForm';

const PropertyCreateEdit = () => {
  const { currentUser } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isDraft, setIsDraft] = useState(true);
  const [lastSaved, setLastSaved] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  const steps = [
    'Property Details',
    'Location',
    'Media Upload',
    'Specifications',
    'Review'
  ];

  // Add this near the top of your component
  const DRAFT_KEY = `property_draft_${currentUser?.id || 'anonymous'}`;

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  // 1. Load draft on mount - place inside main useEffect
  useEffect(() => {
    if (isEditing && id) {
      // Existing edit mode loading...
    } else {
      // Load draft only for new properties
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
        } catch (e) {
          console.error('Draft parse error:', e);
        }
      }
    }
  }, [isEditing, id]);

  // 2. Save draft on change - new useEffect
  useEffect(() => {
    if (!isEditing || (isEditing && formData.id)) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
      setLastSaved(new Date());
      setHasUnsavedChanges(true);
      console.log('💾 Auto-saved draft to localStorage');
    }
  }, [formData]);

  // Add to preparePayload function
  const preparePayload = () => {
    // Handle amenities array
    const formattedAmenities = formData.amenities?.length > 0
      ? formData.amenities
      : [];
    
    // Convert bedrooms/bathrooms to numbers
    const bedrooms = parseInt(formData.rooms) || 0;
    const bathrooms = parseInt(formData.bathrooms) || 0;
    
    // Format price to decimal string
    const price = formData.price ? parseFloat(formData.price).toFixed(2) : '0.00';
    
    // Prepare location string
    const location = [
      formData.address,
    ]

    return {
      title: formData.title,
      description: formData.description,
      location,
      price,
      property_type: formData.propertyType,
      bedrooms,
      bathrooms,
      latitude: formData.latitude || null,
      longitude: formData.longitude || null,
      amenities: formattedAmenities,
      status: formData.status,
      available_from: formData.availableFrom || null,
      is_available_now: formData.is_available_now || false,
      location_notes: formData.locationNotes || '',
      // Creator details
      created_by: currentUser.id,
      agent_name: currentUser.fullName,
      agent_email: currentUser.email,
      agent_phone_numbers: currentUser.phone,
      whatsapp_number: currentUser.phone.replace(/\D/g, '')
    };
  };

  // Add after preparePayload function
const uploadMedia = async (propertyId) => {
  console.log('📤 Starting media upload for property:', propertyId);
  
  const formData = new FormData();
  
  // Add images with type indication
  formData.images.forEach((image, index) => {
    formData.append(`files`, image.file);
    formData.append(`types`, 'image');
    formData.append(`is_primary`, image.isPrimary ? 'true' : 'false');
    formData.append(`names`, image.name);
  });
  
  // Add videos with type indication
  formData.videos?.forEach((video) => {
    formData.append(`files`, video.file);
    formData.append(`types`, 'video');
    formData.append(`names`, video.name);
  });
  
  try {
    console.log('🖼️ Media payload:', {
      fileCount: formData.getAll('files').length,
      types: formData.getAll('types'),
      names: formData.getAll('names')
    });
    
    const response = await fetch(`${API_BASE}/properties/${propertyId}/media`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) throw new Error('Media upload failed');
    return await response.json();
  } catch (error) {
    console.error('🚨 Media upload error:', error);
    throw error;
  }
};

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

  useEffect(() => {
    if (isEditing && id) {
      setIsLoading(true);
      setTimeout(() => {
        const mockData = {
          title: 'Beautiful Downtown Condo',
          price: 450000,
          propertyType: 'Room',
          status: 'Available',
          description: 'A stunning downtown condominium with modern amenities...',
          address: '123 Main Street',
          city: 'Dar es Salaam',
          rooms: 2,
          bathrooms: 2,
          longitude: 39.2026,
          latitude: -6.7924,
          amenities: ['Air Conditioning', 'Dishwasher', 'Parking'],
          images: [],
          videos: []
        };
        setFormData(mockData);
        setIsDraft(false);
        // Mark all steps as completed for editing mode
        setCompletedSteps(new Set([1, 2, 3, 4]));
        setIsLoading(false);
      }, 1000);
    }
  }, [isEditing, id]);

  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [formData]);

  // Enhanced validation function that doesn't set errors
  const validateStepData = (step, data = formData) => {
    switch (step) {
      case 1:
        return !!(
          data?.title?.trim() &&
          data?.price && data.price > 0 &&
          data?.propertyType &&
          data?.status &&
          data?.description?.trim()
        );
      case 2:
        return !!(
          data?.address?.trim() &&
          data?.state?.trim()
        );
      case 3:
        // Media is optional, so always valid
        return true;
      case 4:
        return !!(
          data?.rooms && data.rooms >= 1 &&
          data?.bathrooms && data.bathrooms >= 0
        );
      case 5:
        // Review step is always accessible once previous steps are completed
        return true;
      default:
        return false;
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    switch (step) {
      case 1:
        if (!formData?.title?.trim()) newErrors.title = 'Property title is required';
        if (!formData?.price || formData.price <= 0) newErrors.price = 'Valid price is required';
        if (!formData?.propertyType) newErrors.propertyType = 'Property type is required';
        if (!formData?.status) newErrors.status = 'Property status is required';
        if (!formData?.description?.trim()) newErrors.description = 'Description is required';
        break;
      case 2:
        if (!formData?.address?.trim()) newErrors.address = 'Street address is required';
        if (!formData?.state?.trim()) newErrors.state = 'State is required';  
        break;
      case 4:
        if (!formData?.rooms || formData.rooms < 1) newErrors.rooms = 'Valid number of rooms is required';
        if (!formData?.bathrooms || formData.bathrooms < 0) newErrors.bathrooms = 'Valid number of bathrooms is required';
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

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      // Mark current step as completed
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
      // Show a toast or alert about completing previous steps
      const missingSteps = [];
      for (let i = 1; i < step; i++) {
        if (!completedSteps.has(i) && i !== 3) { // Skip media step for required validation
          missingSteps.push(steps[i - 1]);
        }
      }
      alert(`Please complete the following steps first: ${missingSteps.join(', ')}`);
    }
  };

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

  const handlePublish = async () => {
    let isValid = true;
    for (let step = 1; step <= 4; step++) {
      if (step !== 3 && !validateStep(step)) { // Skip media validation
        isValid = false;
        setCurrentStep(step);
        break;
      }
    }
    if (!isValid) return;
    setIsLoading(true);
    setSubmitError(null);
    try {
      // 1. Create/update property
      const payload = preparePayload();

          console.group('🧪 API Request Debug');
          console.log('Endpoint:', id ? 'PATCH /properties' : 'POST /properties');
          console.log('Payload:', payload);
          console.log('Current User:', currentUser);
          console.groupEnd();

    // Create/update property
    const propertyData = id 
      ? await updateProperty(id, payload)
      : await createProperty(payload);
    
    console.log('✅ Property saved:', propertyData);
    
    // Upload media
    if (formData.mediaFiles?.length > 0) {
      console.log('📤 Uploading media files...');
      const mediaFormData = new FormData();
      
      formData.mediaFiles.forEach(file => {
        mediaFormData.append('files', file);
        mediaFormData.append('types', file.type.includes('image') ? 'image' : 'video');
      });
      
      await uploadPropertyMedia(propertyData.id, mediaFormData);
      console.log('🖼️ Media upload complete');
    }
    
    // Clear draft and redirect
    localStorage.removeItem(DRAFT_KEY);
    navigate(`/property/${propertyData.id}`);
    
  } catch (error) {
    console.error('🚨 Publish error:', error);
    setSubmitError(error.message);
  } finally {
    setIsLoading(false);
  }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to leave?');
      if (!confirmed) return;
    }
    navigate('/agent-dashboard');
  };

  const renderStepForm = () => {
    switch (currentStep) {
      case 1:
        return <PropertyDetailsForm formData={formData} setFormData={setFormData} errors={errors} setErrors={setErrors} />;
      case 2:
        return <LocationForm formData={formData} setFormData={setFormData} errors={errors} setErrors={setErrors} />;
      case 3:
        return <MediaUploadForm formData={formData} setFormData={setFormData} errors={errors} setErrors={setErrors} />;
      case 4:
        return <PropertySpecificationsForm formData={formData} setFormData={setFormData} errors={errors} setErrors={setErrors} />;
      case 5:
        return <ReviewForm formData={formData} onEdit={handleStepEdit} />;
      default:
        return null;
    }
  };

  const helmet = (
    <Helmet>
      <title>Create-Edit Property | EstateHub</title>
      <meta name="description" content="Find your dream property with EstateHub." />
    </Helmet>
  );

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
      
      {/* Compact Progress Section */}
      <div className="sticky top-16 lg:top-18 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center justify-between gap-4">
            {/* Compact Progress Indicator */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex items-center gap-1 sm:gap-2">
                {steps.map((step, index) => (
                  <div key={index + 1} className="flex items-center">
                    <button
                      onClick={() => handleStepEdit(index + 1)}
                      disabled={!isStepAccessible(index + 1)}
                      className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                        currentStep === index + 1
                          ? 'bg-primary text-white'
                          : completedSteps.has(index + 1)
                          ? 'bg-primary/80 text-white'
                          : isStepAccessible(index + 1)
                          ? 'bg-primary/20 text-primary hover:bg-primary/30 cursor-pointer'
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
                        completedSteps.has(index + 1) ? 'bg-primary/80' : 'bg-border'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="hidden sm:block text-sm text-text-secondary truncate">
                Step {currentStep}: {steps[currentStep - 1]}
              </div>
            </div>
            
            {/* Draft Status Indicator */}
            <div className="flex items-center gap-2 text-xs flex-shrink-0">
              {lastSaved && (
                <div className="flex items-center gap-1 text-text-secondary">
                  <Icon name="Clock" size={12} />
                  <span className="hidden lg:inline">Saved:</span>
                  <span className="font-medium">{lastSaved.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
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
          {/* Compact Header Section */}
          <div className="mb-4 lg:mb-6">
            <h1 className="text-xl lg:text-2xl xl:text-3xl font-bold text-text-primary font-heading leading-tight">
              {isEditing ? 'Edit Property' : 'Create New Property'}
            </h1>
            <p className="text-text-secondary mt-1 text-sm">
              {isEditing ? 'Update your property listing details' : 'Add a new property to your listings'}
            </p>
          </div>

          {/* Main Content Area */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 lg:gap-6 pb-6">
            {/* Form Content - Takes full width on mobile/tablet, 3/4 on desktop */}
            <div className="xl:col-span-3">
              <div className="bg-surface rounded-xl shadow-elevation-1 p-4 sm:p-6">
                {renderStepForm()}
              </div>
            </div>

            {/* Compact Sidebar for desktop */}
            <div className="hidden xl:block xl:col-span-1">
              <div className="sticky top-24 space-y-4">
                {/* Compact Step Navigation */}
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
                            ? 'bg-primary text-white'
                            : completedSteps.has(index + 1)
                            ? 'bg-primary/10 text-primary hover:bg-primary/20'
                            : isStepAccessible(index + 1)
                            ? 'bg-background hover:bg-primary/5 text-text-primary'
                            : 'bg-background/50 text-text-secondary cursor-not-allowed opacity-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium ${
                            currentStep === index + 1
                              ? 'bg-white text-primary'
                              : completedSteps.has(index + 1)
                              ? 'bg-primary text-white'
                              : isStepAccessible(index + 1)
                              ? 'bg-primary/20 text-primary'
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

                {/* Compact Progress Summary */}
                <div className="bg-surface rounded-xl shadow-elevation-1 p-4">
                  <h3 className="font-semibold text-text-primary text-sm mb-3">Progress</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Completed:</span>
                      <span className="font-medium">{completedSteps.size}/{steps.length}</span>
                    </div>
                    <div className="w-full bg-background rounded-full h-1.5">
                      <div 
                        className="bg-primary h-1.5 rounded-full transition-all duration-300"
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

          {/* Compact Action Bar - Fixed at bottom on mobile, inline on desktop */}
          <div className="fixed bottom-0 left-0 right-0 xl:relative xl:bottom-auto bg-surface xl:bg-transparent border-t xl:border-t-0 border-border xl:rounded-xl xl:shadow-elevation-1 p-3 xl:p-4 z-30">
            <div className="max-w-7xl mx-auto xl:mx-0">
              <div className="flex items-center justify-between gap-3">
                {/* Left Actions */}
                <Button 
                  variant="outline" 
                  onClick={handleCancel} 
                  disabled={isLoading} 
                  iconName="X" 
                  size="sm"
                  className="px-3 py-2 text-sm"
                >
                  Cancel
                </Button>

                {/* Right Actions */}
                <div className="flex items-center gap-2">
                  {currentStep > 1 && (
                    <Button 
                      variant="outline" 
                      onClick={handlePrevStep} 
                      disabled={isLoading} 
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
                      disabled={isLoading}
                      iconName="ChevronRight"
                      iconPosition="right"
                      size="sm"
                      className="px-3 py-2 text-sm"
                    >
                      <span className="hidden sm:inline">Next Step</span>
                      <span className="sm:hidden">Next</span>
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      onClick={handlePublish}
                      disabled={isLoading}
                      iconName="Rocket"
                      size="sm"
                      loading={isLoading}
                      className="px-3 py-2 text-sm"
                    >
                      <span className="hidden sm:inline">
                        {isEditing ? 'Update Property' : 'Publish Property'}
                      </span>
                      <span className="sm:hidden">
                        {isEditing ? 'Update' : 'Publish'}
                      </span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Spacer for fixed bottom bar on mobile */}
          <div className="h-16 xl:hidden"></div>
        </div>
      </div>
    </div>
    </>
  );
};

export default PropertyCreateEdit;