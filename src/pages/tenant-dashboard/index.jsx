// pages/tenant-dashboard/index.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from 'components/ui/Header';
import WelcomeBanner from './components/WelcomeBanner';
import DashboardOverview from './components/DashboardOverview';
import SavedListings from './components/SavedListings';
import PropertyFeed from './components/PropertyFeed';
import ProfileQuickEdit from './components/ProfileQuickEdit';
import { Helmet } from 'react-helmet-async';

const TenantDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('auth_token');
    const userRole = localStorage.getItem('user_role');
    
    if (!token || userRole !== 'tenant') {
      navigate('/login-register');
      return;
    }

    // Mock user data fetch
    const fetchUserData = async () => {
      try {
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 800));
        setUser({
          id: 1,
          name: 'Sarah Johnson',
          email: 'sarah.johnson@email.com',
          phone: '+1 (555) 123-4567',
          joinDate: '2024-01-15',
          savedProperties: 12,
          viewedProperties: 45,
          activeAlerts: 3,
          preferences: '2 Bedrooms • Pet Friendly • Downtown'
        });
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              <WelcomeBanner user={user} />
              <DashboardOverview user={user} />
              <SavedListings user={user} />
            </div>
            
            {/* Right Column */}
            <div className="space-y-6">
              <PropertyFeed user={user} />
              <ProfileQuickEdit user={user} onUpdate={setUser} />
            </div>
          </div>
        </div>
      </div>
    </div> 
    </>
  );
};

export default TenantDashboard;