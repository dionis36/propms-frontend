// pages/agent-dashboard/index.jsx
import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { getMyProperties } from '../../services/api'; // Adjust path to match your structure
import { useAuth } from '../../contexts/AuthContext'; // If you’re using auth context

import WelcomeBanner from './components/WelcomeBanner';
import QuickActions from './components/QuickActions';
import PerformanceMetrics from './components/PerformanceMetrics';
import ActiveListings from './components/ActiveListings';

const AgentDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState([]);
  const { accessToken, user } = useAuth(); // assuming your auth context provides token and user info
  const navigate = useNavigate();

  // 🔹 Format backend listings into what your UI expects
  const formatListings = (data) =>
    data.map((item) => ({
      id: item.id,
      title: item.title,
      price: item.price,
      status: item.status === 'AVAILABLE' ? 'Vacant' : 'Occupied',
      type: item.property_type?.charAt(0).toUpperCase() + item.property_type?.slice(1).toLowerCase(),
      bedrooms: item.bedrooms || 0,
      bathrooms: item.bedrooms || 0,
      createdAt: item.created_at,
      availableFrom: item.available_from,
      description: item.description,
      image: item.media.find(m => m.image)?.image || null,
      video: item.media.find(m => m.video)?.video || null,
      isSaved: item.is_saved,
      location: item.location,
      agentName: item.agent_name,
      agentPhone: item.agent_phone_number,
      agentWhatsapp: item.agent_whatsapp_number,
      agentEmail: item.agent_email,
    }));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getMyProperties(accessToken);
        const formatted = formatListings(data);
        setListings(formatted);
      } catch (error) {
        console.error("Failed to fetch listings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [accessToken]);


  const vacantListings = listings.filter(p => p.status === 'Vacant').length;
  const occupiedListings = listings.filter(p => p.status === 'Occupied').length;

const numericPrices = listings
  .map(p => typeof p.price === 'string' ? parseFloat(p.price.replace(/,/g, '')) : p.price)
  .filter(price => !isNaN(price));

const avg = numericPrices.length > 0
  ? Math.round(numericPrices.reduce((sum, val) => sum + val, 0) / numericPrices.length)
  : 0;


const metrics = {
  totalListings: listings.length,
  vacantListings,
  occupiedListings,
  avgPrice: `TZS ${avg.toLocaleString()}`,
  avg: avg // 👈 Add raw number for later use in `change`
};




  const helmet = (
    <Helmet>
      <title>Agent Dashboard | EstateHub</title>
      <meta name="description" content="Find your dream property with EstateHub." />
    </Helmet>
  );

  if (loading) {
    return (
      <>
      {helmet}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Header />
      <div className="h-16 lg:h-18"></div>

        <div className="space-y-6">
          {/* Top section with Welcome, Metrics, and QuickActions skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left: Welcome and Metrics */}
            <div className="lg:col-span-3 space-y-6">
              <div className="skeleton h-24 rounded-xl"></div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="skeleton h-32 rounded-xl"></div>
                ))}
              </div>
            </div>
            
            {/* Right: QuickActions */}
            <div className="lg:col-span-1">
              <div className="skeleton h-full rounded-xl"></div>
            </div>
          </div>
          
          {/* Active Listings skeleton - full width */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="skeleton h-8 w-48 rounded"></div>
              <div className="skeleton h-10 w-32 rounded-md"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="skeleton h-40 rounded-xl"></div>
              ))}
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
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <Header />
      <div className="h-16 lg:h-18"></div>

      <div className="space-y-6">
        {/* Top section with Welcome, Metrics, and QuickActions */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left: Welcome and Metrics - 3/4 width */}
          <div className="lg:col-span-3 space-y-6">
            <WelcomeBanner 
              name={user?.first_name} 
              vacantListings={metrics.vacantListings} 
            />
            <PerformanceMetrics metrics={metrics} />
          </div>
          
          {/* Right: QuickActions - 1/4 width */}
          <div className="lg:col-span-1">
            <QuickActions />
          </div>
        </div>
        
        {/* Active Listings - full width */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-text-primary">Active Listings</h2>
            <button 
              onClick={() => navigate('/property-create-edit')}
              className="btn-primary flex items-center px-4 py-2 rounded-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Listing
            </button>
          </div>
          
          <ActiveListings listings={listings} />
        </div>
      </div>
    </div>
    </>
  );
};

export default AgentDashboard;