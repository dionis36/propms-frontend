// pages/agent-dashboard/index.jsx
import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

import WelcomeBanner from './components/WelcomeBanner';
import QuickActions from './components/QuickActions';
import PerformanceMetrics from './components/PerformanceMetrics';
import ActiveListings from './components/ActiveListings';

const AgentDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    // Simulate API call to fetch agent's listings
    const fetchData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setListings([
          {
            id: 1,
            title: "Spacious Family Home",
            address: "Oysterbay",
            price: "4,500,000",
            status: "Vacant",
            type: "House",
            rooms: 3,
            createdAt: "2025-06-25",
            description: "Beautiful 3-bedroom family home with garden and modern amenities. Located in a quiet neighborhood close to schools and shopping centers. Features include a spacious living area, modern kitchen, and a private backyard perfect for family gatherings."
          },
          {
            id: 2,
            title: "Commercial Retail Space",
            address: "Kariakoo",
            price: "3,500,000",
            status: "Occupied",
            type: "Commercial",
            rooms: 3,
            createdAt: "2025-05-18",
            description: "Prime commercial space in the bustling Kariakoo market area. High foot traffic location ideal for retail businesses. The space includes two storefronts, storage area, and office space. Currently occupied but available for lease renewal."
          },
          {
            id: 3,
            title: "Cozy Studio Flat",
            address: "Mikocheni",
            price: "850,000",
            status: "Vacant",
            type: "Studio",
            rooms: 1,
            createdAt: "2025-06-03",
            description: "Compact and modern studio apartment perfect for singles or couples. Features an open-plan design with kitchenette, comfortable living space, and balcony with city views. Building amenities include 24-hour security, gym, and swimming pool."
          },
          {
            id: 4,
            title: "Luxury Villa with Pool",
            address: "Masaki",
            price: "9,000,000",
            status: "Occupied",
            type: "Villa",
            rooms: 4,
            createdAt: "2025-03-22",

            description: "Exquisite 4-bedroom luxury villa with a private swimming pool and expansive garden. Located in the prestigious Masaki area, offering high-end finishes, spacious interiors, and proximity to embassies and international schools."
          },
          {
            id: 5,
            title: "Modern City Apartment",
            address: "Dar CBD",
            price: "2,000,000",
            status: "Vacant",
            type: "Apartment",
            rooms: 2,
            createdAt: "2025-04-10",

            description: "Contemporary 2-bedroom apartment in the heart of Dar es Salaam CBD. Ideal for professionals seeking convenience and urban living. Features include city skyline views, fitted kitchen, and secure parking. Walking distance to major offices and amenities."
          },
          {
            id: 6,
            title: "Beachfront Bungalow",
            address: "Mbezi Beach",
            price: "7,500,000",
            status: "Occupied",
            type: "House",
            rooms: 3,
            createdAt: "2025-02-05",
            description: "Charming 3-bedroom bungalow directly on Mbezi Beach. Enjoy stunning ocean views and direct beach access. Perfect for a tranquil lifestyle or as a holiday rental. Includes a large veranda and private garden leading to the sand."
          },
          {
            id: 7,
            title: "Suburban Townhouse",
            address: "Tegeta",
            price: "2,500,000",
            status: "Vacant",
            type: "Townhouse",
            rooms: 3,
            createdAt: "2025-06-20",
            description: "Well-maintained 3-bedroom townhouse in a family-friendly gated community in Tegeta. Offers spacious living areas, a modern kitchen, and a small private yard. Community features include 24/7 security and communal green spaces."
          },
          {
            id: 8,
            title: "Warehouse for Rent",
            address: "Kinondoni",
            price: "6,000,000",
            status: "Occupied",
            type: "Commercial",
            rooms: null,
            createdAt: "2025-05-01",
            description: "Large industrial warehouse space available for rent in Kinondoni. Suitable for storage, manufacturing, or distribution. Features high ceilings, multiple loading bays, and ample parking. Easily accessible from major roads."
          },
          {
            id: 9,
            title: "Penthouse with Skyline View",
            address: "Upanga",
            price: "5,000,000",
            status: "Vacant",
            type: "Apartment",
            rooms: 2,
            createdAt: "2025-06-12",
            description: "Luxurious 2-bedroom penthouse offering panoramic skyline views of Dar es Salaam. Features include a private terrace, high-end appliances, and exclusive access to building amenities like a rooftop pool and gym. Prime location in Upanga."
          },
          {
            id: 10,
            title: "Spacious Family Home",
            address: "Kunduchi",
            price: "4,000,000",
            status: "Occupied",
            type: "House",
            rooms: 4,
            createdAt: "2025-04-28",
            description: "Expansive 4-bedroom family house in Kunduchi, offering a serene environment away from the city bustle. Includes a large compound, servant's quarters, and easy access to the beach and main road. Ideal for a growing family."
          },
          {
            id: 11,
            title: "Modern City Apartment",
            location: "Mikocheni",
            price: "TZS 1,500,000",
            status: "Vacant",
            type: "Apartment",
            rooms: 1,
            createdAt: "2025-03-15",
            
            description: "Chic 1-bedroom apartment in a vibrant part of Mikocheni. Designed for comfort and style, with a modern kitchen and spacious living area. Perfect for young professionals. Close to popular restaurants and entertainment spots."
          },
          {
            id: 12,
            title: "Cozy Studio Flat",
            address: "Masaki",
            price: "1,200,000",
            status: "Occupied",
            type: "Studio",
            rooms: 1,
            createdAt: "2025-06-08",
            description: "A compact yet comfortable studio flat in the highly sought-after Masaki area. Features efficient use of space, a small balcony, and access to secure parking. Ideal for individuals seeking an affordable living option in a prime location."
          },
          {
            id: 13,
            title: "Luxury Villa with Pool",
            address: "Oysterbay",
            price: "9,000,000",
            status: "Vacant",
            type: "Villa",
            rooms: 4,
            createdAt: "2025-01-20",

            description: "Stunning 4-bedroom luxury villa in Oysterbay, complete with a large private pool and beautifully landscaped gardens. Offers expansive living spaces, high-end finishes, and a secure, private environment. Perfect for diplomatic residences or large families."
          },
          {
            id: 14,
            title: "Commercial Retail Space",
            address: "Dar CBD",
            price: "3,000,000",
            status: "Occupied",
            type: "Commercial",
            rooms: 2,
            createdAt: "2025-05-25",
            description: "Versatile commercial space located in a high-traffic area of Dar es Salaam CBD. Suitable for various retail businesses, showrooms, or service centers. Features large display windows and easy access for customers. Currently leased."
          },
          {
            id: 15,
            title: "Beachfront Bungalow",
            address: "Mbezi Beach",
            price: "7,500,000",
            status: "Vacant",
            type: "House",
            rooms: 3,
            createdAt: "2025-06-01",
            description: "Quaint 3-bedroom beachfront bungalow offering direct access to the sandy shores of Mbezi Beach. Enjoy the tranquility of the ocean and breathtaking sunsets. Features a spacious living area and a large outdoor space ideal for entertaining."
          }
        
        ]);
      } catch (error) {
        console.error("Failed to fetch listings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const metrics = {
    totalListings: 12,
    vacantListings: 3,
    avgPrice: "TZS 2,450,000",
    occupancyRate: "75%"
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
              name="Dio Estates" 
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