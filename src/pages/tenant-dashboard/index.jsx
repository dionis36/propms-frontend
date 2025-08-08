// pages/tenant-dashboard/index.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import WelcomeBanner from './components/WelcomeBanner';
import DashboardOverview from './components/DashboardOverview';
import SavedListings from './components/SavedListings';
import PropertyFeed from './components/PropertyFeed';
import ProfileQuickEdit from './components/ProfileQuickEdit';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../contexts/AuthContext';
import { getFavorites } from '../../services/api';


const TenantDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [savedListings, setSavedListings] = useState([]);
  const [savedListingsLoading, setSavedListingsLoading] = useState(true);
  const { user, accessToken } = useAuth();
  const navigate = useNavigate();

  // Format backend favorites data
  const formatFavorites = (data) => {
    // Check if data is an object and if it contains a 'results' array
    if (!data || !Array.isArray(data.results)) {
      console.error("API response for favorites is not valid:", data);
      return []; // Return an empty array to prevent the .map() error
    }
    
    // Map over the 'results' array instead of the root data object
    return data.results.map((item) => ({
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
  };

  // Fetch saved listings
  const fetchSavedListings = async () => {
    try {
      setSavedListingsLoading(true);
      const data = await getFavorites(accessToken);
      const formatted = formatFavorites(data);
      setSavedListings(formatted);
    } catch (error) {
      console.error("Failed to fetch favorites:", error);
    } finally {
      setSavedListingsLoading(false);
    }
  };

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Fetch saved listings if user is authenticated
        if (accessToken) {
          await fetchSavedListings();
        }
      } catch (error) {
        console.error('Failed to initialize dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, [accessToken, user, navigate]);

  // Handler to update saved listings from child components
  const handleSavedListingsUpdate = (updatedListings) => {
    setSavedListings(updatedListings);
  };

  // Handler to add a new saved listing
  const handleAddSavedListing = (newListing) => {
    setSavedListings(prev => [newListing, ...prev]);
  };

  // Handler to remove a saved listing
  const handleRemoveSavedListing = (propertyId) => {
    setSavedListings(prev => prev.filter(item => item.propertyId !== propertyId));
  };

  const helmet = (
    <Helmet>
      <title>Tenant Dashboard | EstateHub</title>
      <meta name="description" content="Find your dream property with EstateHub." />
    </Helmet>
  );

  if (loading) {
    return (
      <>
      {helmet}
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-16 lg:pt-18">
          <div className="container mx-auto px-4 py-6 max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column Skeleton */}
              <div className="lg:col-span-2 space-y-6">
                <div className="card p-6">
                  <div className="flex justify-between">
                    <div className="space-y-3">
                      <div className="skeleton h-7 w-40 rounded"></div>
                      <div className="skeleton h-5 w-64 rounded"></div>
                    </div>
                    <div className="skeleton rounded-full w-12 h-12"></div>
                  </div>
                </div>
                
                <div className="card p-6">
                  <div className="skeleton h-6 w-48 mb-4 rounded"></div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="p-4">
                        <div className="skeleton h-7 w-7 mx-auto mb-3 rounded-full"></div>
                        <div className="skeleton h-8 w-10 mx-auto mb-2 rounded"></div>
                        <div className="skeleton h-4 w-24 mx-auto rounded"></div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="card p-6">
                  <div className="flex justify-between mb-4">
                    <div className="skeleton h-6 w-40 rounded"></div>
                    <div className="skeleton h-8 w-20 rounded-md"></div>
                  </div>
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex">
                        <div className="skeleton rounded-xl w-16 h-16"></div>
                        <div className="ml-4 w-full">
                          <div className="skeleton h-5 w-40 mb-2 rounded"></div>
                          <div className="skeleton h-4 w-56 mb-2 rounded"></div>
                          <div className="flex">
                            <div className="skeleton h-5 w-20 mr-2 rounded"></div>
                            <div className="skeleton h-5 w-32 rounded"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Right Column Skeleton */}
              <div className="space-y-6">
                <div className="card p-6">
                  <div className="flex justify-between mb-4">
                    <div className="skeleton h-6 w-40 rounded"></div>
                    <div className="skeleton h-4 w-12 rounded"></div>
                  </div>
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex">
                        <div className="skeleton rounded-xl w-12 h-12"></div>
                        <div className="ml-3">
                          <div className="skeleton h-5 w-32 mb-2 rounded"></div>
                          <div className="flex">
                            <div className="skeleton h-5 w-16 mr-2 rounded"></div>
                            <div className="skeleton h-5 w-20 rounded"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6">
                    <div className="skeleton h-10 w-full rounded-md"></div>
                  </div>
                </div>
                
                <div className="card p-6">
                  <div className="skeleton h-6 w-32 mb-4 rounded"></div>
                  <div className="flex items-center mb-6">
                    <div className="skeleton rounded-full w-16 h-16"></div>
                    <div className="ml-4">
                      <div className="skeleton h-5 w-32 mb-1 rounded"></div>
                      <div className="skeleton h-4 w-24 rounded"></div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i}>
                        <div className="skeleton h-4 w-24 mb-1 rounded"></div>
                        <div className="skeleton h-5 w-full rounded"></div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6">
                    <div className="skeleton h-10 w-full rounded-md"></div>
                  </div>
                </div>
              </div>
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
        {/* Mobile Search Button */}
        <div className="lg:hidden fixed bottom-6 right-6 z-10">
          <button
            onClick={() => navigate('/property-listings')}
            className="bg-primary text-white p-3 rounded-full shadow-lg hover:bg-primary-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>

        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:items-start">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6 lg:sticky lg:top-6">
              <WelcomeBanner 
                name={user?.first_name}
              />
              <DashboardOverview 
                user={user} 
                savedListings={savedListings}
                loading={savedListingsLoading}
              />
              <SavedListings 
                user={user}
                savedListings={savedListings}
                loading={savedListingsLoading}
                onSavedListingsUpdate={handleSavedListingsUpdate}
                onAddSavedListing={handleAddSavedListing}
                onRemoveSavedListing={handleRemoveSavedListing}
              />
            </div>
            
            {/* Right Column */}
            <div className="space-y-6 lg:sticky lg:top-6">
              <PropertyFeed 
                user={user} 
                onAddSavedListing={handleAddSavedListing}
              />
              <ProfileQuickEdit user={user} />
            </div>
          </div>
        </div>
      </div>
    </div> 
    </>
  );
};

export default TenantDashboard;