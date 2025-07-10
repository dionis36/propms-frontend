import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import { Helmet } from 'react-helmet-async';

// Component imports
import ProgressIndicator from './components/ProgressIndicator';
import PropertyDetailsForm from './components/PropertyDetailsForm';
import LocationForm from './components/LocationForm';
import MediaUploadForm from './components/MediaUploadForm';
import PropertySpecificationsForm from './components/PropertySpecificationsForm';
import ReviewForm from './components/ReviewForm';

const PropertyCreateEdit = () => {
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
    try {
      console.log('Publishing property...', formData);
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsDraft(false);
      setHasUnsavedChanges(false);
      navigate('/agent-dashboard');
    } catch (error) {
      console.error('Publish failed:', error);
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
              <Button
                variant="ghost"
                onClick={handleSaveDraft}
                disabled={isLoading}
                iconName="Save"
                size="md"
                loading={isLoading && !formData?.title}
              >
                Save Draft
              </Button>
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
