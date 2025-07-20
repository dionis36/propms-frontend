// src/pages/property-details/index.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import UserAvatar from '../../components/ui/UserAvatar';
import { Helmet } from 'react-helmet-async';

// Import components
import ImageGallery from './components/ImageGallery';
import PropertyOverview from './components/PropertyOverview';
import PropertyTabs from './components/PropertyTabs';
import ContactForm from './components/ContactForm';
import SimilarProperties from './components/SimilarProperties';
import LoadingState from './components/LoadingState';

const PropertyDetails = () => {
  const [searchParams] = useSearchParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [showContactForm, setShowContactForm] = useState(false);

  const propertyId = searchParams.get('id');

  // Mock property data - in real app this would come from API
  const mockProperty = {
    id: 1,
    title: "Modern Downtown Apartment",
    price: 450000,
    address: "123 Main Street, Downtown, NY 10001",
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1200,
    propertyType: "apartment",
    yearBuilt: 2019,
    lotSize: null,
    parkingSpaces: 1,
    images: [
      "https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pixabay.com/photo/2017/03/28/12/13/chairs-2181968_1280.jpg?auto=compress&cs=tinysrgb&w=800",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
      "https://images.pexels.com/photos/2121121/pexels-photo-2121121.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pixabay.com/photo/2016/12/30/07/59/kitchen-1940174_1280.jpg?auto=compress&cs=tinysrgb&w=800",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop"
    ],
    video: "https://example.com/property-video",
    coordinates: { lat: 40.7128, lng: -74.0060 },
    daysOnMarket: 15,
    mls: "MLS-2024-001234",
    description: `Beautiful modern apartment in the heart of downtown with stunning city views and premium amenities. This spacious 2-bedroom, 2-bathroom unit features floor-to-ceiling windows, hardwood floors, and a gourmet kitchen with stainless steel appliances.
      The open floor plan creates a seamless flow between the living, dining, and kitchen areas, perfect for entertaining. The master bedroom includes a walk-in closet and ensuite bathroom with marble finishes.
      Building amenities include a fitness center, rooftop pool, 24-hour concierge service, and valet parking. Located within walking distance of restaurants, shopping, and public transportation with easy access to major highways.`,
    amenities: [
      "24-Hour Concierge",
      "Fitness Center", 
      "Rooftop Pool",
      "Valet Parking",
      "Pet Friendly",
      "In-Unit Laundry",
      "Balcony",
      "Central Air",
      "Hardwood Floors",
      "Stainless Steel Appliances"
    ],
    agent: {
      name: "Sarah Johnson",
      phone: "(555) 123-4567",
      email: "sarah.johnson@estatehub.com",
      rating: 4.8,
      reviewsCount: 127,
      bio: "Sarah is a dedicated real estate professional with over 10 years of experience in the downtown market. She specializes in luxury apartments and condominiums."
    },
  };

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
    const fetchProperty = async () => {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setProperty(mockProperty);
        setIsSaved(false);
        setLoading(false);
      }, 1000);
    };

    if (propertyId) {
      fetchProperty();
    }
  }, [propertyId]);

  const handleSave = () => {
    setIsSaved(!isSaved);
    // In real app, sync with backend
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
      <title>Property Details | EstateHub</title>
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

  if (!property) {
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
                Property Not Found
              </h1>
              <p className="text-text-secondary mb-6">
                The property you're looking for doesn't exist or has been removed.
              </p>
              <Link
                to="/property-listings"
                className="inline-flex items-center space-x-2 bg-primary text-white px-6 py-3 rounded-md hover:bg-primary-700 transition-all duration-200"
              >
                <Icon name="ArrowLeft" size={16} />
                <span>Back to Properties</span>
              </Link>
            </div>
          </div>
        </main>
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
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowContactForm(true)}
                className="px-4 py-2 bg-accent text-white rounded-md text-sm font-medium hover:bg-accent-600 transition-all duration-200"
              >
                Contact Agent
              </button>
              <button className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-700 transition-all duration-200">
                Schedule Tour
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
                video={property.video}
              />

              {/* Property Overview */}
              <PropertyOverview 
                property={property}
                isSaved={isSaved}
                onSave={handleSave}
                onShare={handleShare}
                onContact={() => setShowContactForm(true)}
              />

              {/* Property Tabs */}
              <PropertyTabs 
                property={property}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
            </div>

            {/* Right Column - Sticky Sidebar (4 columns) */}
            <div className="lg:col-span-4">
              <div className="sticky top-24 space-y-6">
                {/* Agent Contact Card */}
                <div className="card p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <UserAvatar
                      firstName={property.agent.first_name}
                      lastName={property.agent.last_name}
                      size="w-16 h-16"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-text-primary">{property.agent.name}</h3>
                      <div className="flex items-center space-x-1 mb-1">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Icon
                              key={i}
                              name="Star"
                              size={14}
                              className={i < Math.floor(property.agent.rating) ? 'text-warning fill-current' : 'text-secondary-300'}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-text-secondary">
                          {property.agent.rating} ({property.agent.reviewsCount} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-text-secondary mb-4">
                    {property.agent.bio}
                  </p>
                  
                  <div className="space-y-3">
                    <button
                      onClick={() => setShowContactForm(true)}
                      className="w-full flex items-center justify-center space-x-2 bg-primary text-white py-3 rounded-md hover:bg-primary-700 transition-all duration-200"
                    >
                      <Icon name="MessageCircle" size={16} />
                      <span>Send Message</span>
                    </button>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <button className="flex items-center justify-center space-x-2 bg-accent-100 text-accent-600 py-2 rounded-md hover:bg-accent hover:text-white transition-all duration-200">
                        <Icon name="Phone" size={16} />
                        <span className="text-sm">Call</span>
                      </button>
                      <button className="flex items-center justify-center space-x-2 bg-secondary-100 text-text-secondary py-2 rounded-md hover:bg-secondary-200 transition-all duration-200">
                        <Icon name="Calendar" size={16} />
                        <span className="text-sm">Schedule</span>
                      </button>
                    </div>
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
                        {property.daysOnMarket} days
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-sm text-text-secondary">MLS Number</span>
                      <span className="text-sm font-mono text-text-primary">{property.mls}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-text-secondary">Property Type</span>
                      <span className="text-sm font-medium text-accent bg-accent-100 px-2 py-1 rounded capitalize">
                        {property.propertyType}
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

      {/* Contact Form Modal */}
      {showContactForm && (
        <ContactForm
          property={property}
          agent={property.agent}
          onClose={() => setShowContactForm(false)}
        />
      )}
    </div>
    </>
  );
};

export default PropertyDetails;

