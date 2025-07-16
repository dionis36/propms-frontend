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

  const steps = [
    'Property Details',
    'Location',
    'Media Upload',
    'Specifications',
    'Review'
  ];

  // Add this near the top of your component
  const DRAFT_KEY = `property_draft_${currentUser?.id || 'anonymous'}`;

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
          console.log('📥 Loaded draft from localStorage:', draftData);
        } catch (e) {
          console.error('Draft parse error:', e);
        }
      }
    }
  }, [isEditing, id]); // Add DRAFT_KEY to dependencies if needed

  // 2. Save draft on change - new useEffect
  useEffect(() => {
    if (!isEditing || (isEditing && formData.id)) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
      setLastSaved(new Date());
      setHasUnsavedChanges(true);
      console.log('💾 Auto-saved draft to localStorage');
    }
  }, [formData]); // Runs on every form change

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
      formData.city,
      formData.state,
      formData.country,
      formData.zipCode
    ].filter(Boolean).join(', ');

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
      whatsapp_url: `https://wa.me/${currentUser.phone.replace(/\D/g, '')}`
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
        setIsLoading(false);
      }, 1000);
    }
  }, [isEditing, id]);

  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [formData]);

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

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleStepEdit = (step) => {
    setCurrentStep(step);
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
      if (!validateStep(step)) {
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
      <div className="pt-16 lg:pt-18">
        <ProgressIndicator currentStep={currentStep} totalSteps={steps.length} steps={steps} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-text-primary font-heading">
                  {isEditing ? 'Edit Property' : 'Create New Property'}
                </h1>
                <p className="text-text-secondary mt-2">
                  {isEditing ? 'Update your property listing details' : 'Add a new property to your listings'}
                </p>
              </div>
              <div className="text-right">
                {lastSaved && (
                  <p className="text-xs text-text-secondary">
                    Last saved: {lastSaved.toLocaleTimeString()}
                  </p>
                )}
                {hasUnsavedChanges && (
                  <p className="text-xs text-warning">
                    <Icon name="AlertCircle" size={12} className="inline mr-1" />
                    Unsaved changes
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-xl shadow-elevation-1 p-6 lg:p-8 mb-8">
            {renderStepForm()}
          </div>

          <div className="flex items-center justify-between bg-surface rounded-xl shadow-elevation-1 p-6">
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={handleCancel} disabled={isLoading} iconName="X" size="md">
                Cancel
              </Button>
              {/* Replace Save Draft button with local indicator */}
              <div className="text-right">
                {lastSaved && (
                  <p className="text-xs text-text-secondary">
                    Draft saved locally: {lastSaved.toLocaleTimeString()}
                  </p>
                )}
                {hasUnsavedChanges && (
                  <p className="text-xs text-warning">
                    <Icon name="AlertCircle" size={12} className="inline mr-1" />
                    Changes not saved
                  </p>
                )}
              </div>

            </div>

            <div className="flex items-center space-x-4">
              {currentStep > 1 && (
                <Button variant="outline" onClick={handlePrevStep} disabled={isLoading} iconName="ChevronLeft" size="md">
                  Previous
                </Button>
              )}
              {currentStep < steps.length ? (
                <Button
                  variant="primary"
                  onClick={handleNextStep}
                  disabled={isLoading}
                  iconName="ChevronRight"
                  iconPosition="right"
                  size="md"
                >
                  Next Step
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={handlePublish}
                  disabled={isLoading}
                  iconName="Rocket"
                  size="md"
                  loading={isLoading}
                >
                  {isEditing ? 'Update Property' : 'Publish Property'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default PropertyCreateEdit;
