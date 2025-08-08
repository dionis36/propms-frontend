import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Footer from '../../components/ui/Footer';
import Icon from '../../components/AppIcon';
import UserAvatar from '../../components/ui/UserAvatar';
import { Helmet } from 'react-helmet-async';
import { getPropertyDetails, saveFavorite, removeFavorite  } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

// Import components
import ImageGallery from './components/ImageGallery';
import PropertyOverview from './components/PropertyOverview';
import PropertyInfo from './components/PropertyInfo';
import ContactForm from './components/ContactForm';
import SimilarProperties from './components/SimilarProperties';
import LoadingState from './components/LoadingState';

const PropertyDetails = () => {
  const [searchParams] = useSearchParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [showContactForm, setShowContactForm] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(null);
  const { showToast } = useToast();
  const { accessToken, user } = useAuth();
  
  const propertyId = searchParams.get('id');
  const requestIdRef = useRef(0); // Track latest request ID

  // Helper function for copying to clipboard
  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedPhone(id);
      setTimeout(() => setCopiedPhone(null), 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  // Helper function to convert TZ phone format
  const formatPhoneForSMS = (phone) => {
    if (!phone) return '';
    return phone.replace(/\s/g, '').replace(/^0/, '+255');
  };

  // Similar properties mock data (you can replace this with another API call later)
  const similarProperties = [
    {
      id: 2,
      title: "Luxury Suburban House",
      price: 750000,
      address: "456 Oak Avenue, Westfield, NJ 07090",
      bedrooms: 4,
      bathrooms: 3,
      sqft: 2800,
      images: ["https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800"]
    },
    {
      id: 3,
      title: "Cozy Studio Loft",
      price: 280000,
      address: "789 Industrial Blvd, Brooklyn, NY 11201",
      bedrooms: 1,
      bathrooms: 1,
      sqft: 650,
      images: ["https://images.pixabay.com/photo/2016/11/18/17/20/living-room-1835923_1280.jpg?auto=compress&cs=tinysrgb&w=800"]
    },
    {
      id: 4,
      title: "Waterfront Condo",
      price: 920000,
      address: "321 Harbor View, Jersey City, NJ 07302",
      bedrooms: 3,
      bathrooms: 2,
      sqft: 1800,
      images: ["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop"]
    }
  ];

  useEffect(() => {
    const requestId = ++requestIdRef.current; // Generate unique request ID
    
    const fetchProperty = async () => {
      if (!propertyId) {
        setError('No property ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getPropertyDetails(propertyId);
        
        // Only process response if it's the latest request
        if (requestId === requestIdRef.current) {
          // Process media array
          const images = data.media
            .filter(media => media.image)
            .map(media => media.image);
          
          const videos = data.media
            .filter(media => media.video)
            .map(media => media.video);
          
          // Map API response to component structure
          const mappedProperty = {
            ...data,
            daysOnMarket: data.days_since_posted,
            agent_name: data.agent_name,
            agent_email: data.agent_email,
            agent_phone_number: data.agent_phone_number,
            agent_whatsapp_number: data.agent_whatsapp_number,
            
            agent: {
              name: data.agent_name,
              first_name: data.agent_name ? data.agent_name.split(' ')[0] : '',
              last_name: data.agent_name ? data.agent_name.split(' ').slice(1).join(' ') : '',
              email: data.agent_email,
              phone: data.agent_phone_number
            },
            images,
            videos,
          };
          
          setProperty(mappedProperty);
          setIsSaved(data.is_saved);
        }
      } catch (error) {
        if (requestId === requestIdRef.current) {
          console.error('Error fetching property details:', error);
          setError(error.message || 'Failed to load property details');
        }
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    };

    fetchProperty();
  }, [propertyId]);

  
const handleSave = async (e) => {
  e.preventDefault();
  e.stopPropagation();

  // 1. Not logged in
  if (!user || !accessToken) {
    showToast('Login to save favorites.', 'error');
    return;
  }

  // 2. Logged in, but not a tenant
  if (user && user.role !== 'TENANT') {
    showToast('Only tenants can save favorites.', 'error');
    return;
  }

  try {
    if (!property?.isSaved) {
      await saveFavorite(property.id, accessToken);
      showToast('Property save to favorites!', 'success');
    } else {
      await removeFavorite(property.id, accessToken);
      showToast('Removed from favorites.', 'info');
    }

    // Optional: toggle state in parent
    onSave?.(property.id, !property.isSaved);
  } catch (error) {
    console.error('Favorite error:', error);
    showToast(error.message || 'Failed to update favorite.', 'error');
  }
};

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property?.title,
        text: `Check out this property: ${property?.title}`,
        url: window.location.href
      });
    } else {
      // Fallback to copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const getBreadcrumbs = () => {
    const breadcrumbs = [
      { label: 'Home', path: '/homepage' },
      { label: 'Properties', path: '/property-listings' },
      { label: property?.title || 'Property Details', path: null }
    ];
    return breadcrumbs;
  };

  const helmet = (
    <Helmet>
      <title>{property?.title ? `${property.title} | EstateHub` : 'Property Details | EstateHub'}</title>
      <meta name="description" content={property?.description || "Find your dream property with EstateHub."} />
    </Helmet>
  );

  if (loading) {
    return (
      <>
        {helmet}
        <div className="min-h-screen bg-background">
          <Header />
          <LoadingState />
        </div>
      </>
    );
  }

  if (error || !property) {
    return (
      <>
        {helmet}
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16 lg:pt-18">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <Icon name="Home" size={64} className="text-secondary mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-text-primary mb-2">
                {error === 'Property not found' ? 'Property Not Found' : 'Error Loading Property'}
              </h1>
              <p className="text-text-secondary mb-6">
                {error === 'Property not found' 
                  ? "The property you're looking for doesn't exist or has been removed."
                  : error || "There was an error loading the property details. Please try again."
                }
              </p>
              <div className="space-x-4">
                <Link
                  to="/property-listings"
                  className="inline-flex items-center space-x-2 bg-primary text-white px-6 py-3 rounded-md hover:bg-primary-700 transition-all duration-200"
                >
                  <Icon name="ArrowLeft" size={16} />
                  <span>Back to Properties</span>
                </Link>
                {error && error !== 'Property not found' && (
                  <button
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center space-x-2 bg-secondary text-text-primary px-6 py-3 rounded-md hover:bg-secondary-200 transition-all duration-200"
                  >
                    <Icon name="RefreshCw" size={16} />
                    <span>Try Again</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
      </>
    );
  }

  return (
    <>
      {helmet}
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16 lg:pt-18">
        {/* Breadcrumb */}
        <div className="bg-surface border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex items-center space-x-2 text-sm">
              {getBreadcrumbs().map((crumb, index) => (
                <React.Fragment key={index}>
                  {index > 0 && (
                    <Icon name="ChevronRight" size={14} className="text-text-secondary" />
                  )}
                  {crumb.path ? (
                    <Link
                      to={crumb.path}
                      className="text-text-secondary hover:text-text-primary transition-colors duration-200"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-text-primary font-medium truncate">{crumb.label}</span>
                  )}
                </React.Fragment>
              ))}
            </nav>
          </div>
        </div>

        {/* Mobile Actions Bar */}
        <div className="lg:hidden bg-surface border-b border-border sticky top-16 z-10">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={handleSave}
                className={`p-2 rounded-md transition-all duration-200 ${
                  isSaved 
                    ? 'bg-error text-white' :'bg-secondary-100 text-text-secondary hover:bg-error hover:text-white'
                }`}
              >
                <Icon name="Heart" size={18} fill={isSaved ? "currentColor" : "none"} />
              </button>
              <button
                onClick={handleShare}
                className="p-2 bg-secondary-100 text-text-secondary rounded-md hover:bg-secondary-200 transition-all duration-200"
              >
                <Icon name="Share" size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column - Main Content (8 columns) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Image Gallery */}
              <ImageGallery 
                images={property.images}
                title={property.title}
                virtualTour={property.virtualTour}
                video={property.videos}
              />

              {/* Property Overview */}
              <PropertyOverview 
                property={property}
                isSaved={isSaved}
                onSave={handleSave}
                onShare={handleShare}
                onContact={() => setShowContactForm(true)}
              />

              {/* Property Info */}
              <PropertyInfo 
                property={property}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />

            </div>

            {/* Right Column - Sticky Sidebar (4 columns) */}
            <div className="lg:col-span-4">
              <div className="sticky top-24 space-y-6">
                {/* Professional Agent Contact Card */}
                
                <div className="card p-6">
                  {/* Card Heading */}
                  <h4 className="text-lg font-semibold text-text-primary mb-6 flex items-center">
                    <Icon name="User" size={20} className="mr-2 text-primary" /> {/* Icon and text style matching Property Insights heading */}
                    Contact Agent
                  </h4>
                  {/* Agent Profile Section - Centered Avatar, Name, Phone */}
                  <div className="flex flex-col items-center text-center pb-6 border-b border-gray-100 mb-6">
                    <UserAvatar
                      firstName={property.agent?.first_name}
                      lastName={property.agent?.last_name}
                      size="w-18 h-18 mb-2" // Adjusted size and margin for compactness
                    />
                    <h3 className="font-semibold text-xl text-text-primary mb-1">
                      {property.agent?.name}
                    </h3>
                    {property.agent_phone_number && (
                      <div className="flex items-center justify-center space-x-2 text-sm text-text-secondary relative">
                        <span>{property.agent_phone_number}</span>
                        <button
                          onClick={() => copyToClipboard(property.agent_phone_number, property.id)} // Use the copyToClipboard function
                          className="p-1 text-text-secondary hover:text-primary-700 hover:bg-primary-50 rounded-full transition-colors duration-200"
                          title="Copy phone number"
                        >
                          {/* Icon changes to Check when copied */}
                          {copiedPhone === property.id ? (
                            <Icon name="Check" size={12} className="text-green-500" />
                          ) : (
                            <Icon name="Copy" size={12} />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                  
                  
                  
                  {/* Action Buttons Section - 2-Column Grid */}
                  <div className="grid grid-cols-2 gap-3"> {/* Use grid for 2 columns with a small gap */}
                    {/* WhatsApp Button */}
                    {property.agent_whatsapp_number && (
                    <button
                      onClick={() => window.open(`https://wa.me/${formatPhoneForSMS(property.agent_whatsapp_number)}`, '_blank')}
                      className="flex flex-col items-center justify-center p-3 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-colors duration-200 font-medium"
                    >
                      <Icon name="MessageSquare" size={18} className="text-green-600 mb-1" />
                      <span className="text-xs text-text-primary">WhatsApp</span>
                    </button>
                    )}

                    {/* Call now Button */}
                    {property.agent_phone_number && (
                      <button
                        onClick={() => window.open(`tel:${formatPhoneForSMS(property.agent_phone_number)}`, '_blank')}
                        className="flex flex-col items-center justify-center p-3 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors duration-200 font-medium"
                      >
                        <Icon name="Phone" size={18} className="text-accent mb-1" />
                        <span className="text-xs text-text-primary">Call now</span>
                      </button>
                    )}

                    {/* Send message (SMS) Button */}
                    {property.agent_phone_number && (
                      <button
                        onClick={() => window.open(`sms:${formatPhoneForSMS(property.agent_phone_number)}`, '_blank')}
                        className="flex flex-col items-center justify-center p-3 bg-sky-50 border border-sky-200 rounded-md hover:bg-sky-100 transition-colors duration-200 font-medium"
                      >
                        <Icon name="MessageCircle" size={18} className="text-blue-500 mb-1" />
                        <span className="text-xs text-text-primary">Send SMS</span>
                      </button>
                    )}

                    {/* Send Email Button */}
                    {property.agent_email && (
                      <button
                        onClick={() => window.open(`mailto:${property.agent_email}`, '_blank')}
                        className="flex flex-col items-center justify-center p-3 bg-purple-50 border border-purple-200 rounded-md hover:bg-purple-100 transition-colors duration-200 font-medium"
                      >
                        <Icon name="Mail" size={18} className="text-purple-500 mb-1" />
                        <span className="text-xs text-text-primary">Send Email</span>
                      </button>
                    )}
                  </div>



                </div>

                {/* Property Insights Card */}
                <div className="card p-6">
                  <h4 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
                    <Icon name="TrendingUp" size={20} className="mr-2 text-primary" />
                    Property Insights
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-sm text-text-secondary">Days on Market</span>
                      <span className="text-sm font-medium text-success bg-success-100 px-2 py-1 rounded">
                        {property.days_since_posted == null ? 'N/A' : property.days_since_posted}
                        {property.days_since_posted == null
                          ? ''
                          : property.days_since_posted === 1
                            ? ' day'
                            : ' days'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-text-secondary">Property Type</span>
                      <span className="text-sm font-medium text-accent bg-accent-100 px-2 py-1 rounded capitalize">
                        {property.property_type || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Similar Properties */}
          <div className="mt-12">
            <SimilarProperties properties={similarProperties} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
    </>
  );
};

export default PropertyDetails;