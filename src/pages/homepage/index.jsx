import React, { useState, useEffect } from 'react';

import Header from '../../components/ui/Header';
import { Helmet } from 'react-helmet-async';



import HeroSection from './components/HeroSection';
import FeaturedProperties from './components/FeaturedProperties';
import QuickStats from './components/QuickStats';
import AgentSpotlight from './components/AgentSpotlight';
import Footer from './components/Footer';

const Homepage = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial content loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleSearch = (searchParams) => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    window.location.href = `/property-listings?${params.toString()}`;
  };


const homepageHelmet = (
  <Helmet>
    <title>EstateHub | Find Your Dream Home</title>
    <meta
      name="description"
      content="Explore thousands of property listings across the country. Buy, rent, or invest in your next dream home with EstateHub."
    />

    {/* Open Graph for social previews */}
    <meta property="og:title" content="EstateHub | Find Your Dream Home" />
    <meta
      property="og:description"
      content="Explore thousands of property listings across the country. Buy, rent, or invest in your next dream home with EstateHub."
    />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://www.estatehub.com/" />
    <meta property="og:image" content="https://www.estatehub.com/assets/og-image.jpg" />

    {/* Twitter Card metadata */}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="EstateHub | Find Your Dream Home" />
    <meta
      name="twitter:description"
      content="Explore thousands of property listings across the country. Buy, rent, or invest in your next dream home with EstateHub."
    />
    <meta name="twitter:image" content="https://www.estatehub.com/assets/twitter-card.jpg" />
  </Helmet>
);


  if (isLoading) {
    return (
      <>
      {homepageHelmet}
      <div className="min-h-screen bg-background">
        <Header />
        <div>
          {/* Hero Skeleton */}
          <div className="relative h-[600px] bg-secondary-100 skeleton"></div>
          
          {/* Content Skeletons */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-surface rounded-lg overflow-hidden shadow-elevation-1">
                  <div className="h-48 bg-secondary-100 skeleton"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-secondary-100 rounded skeleton"></div>
                    <div className="h-4 bg-secondary-100 rounded w-3/4 skeleton"></div>
                    <div className="h-4 bg-secondary-100 rounded w-1/2 skeleton"></div>
                  </div>
                </div>
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
    {homepageHelmet}
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        <HeroSection onSearch={handleSearch} />

        <div className="pt-16 lg:pt-18">
          <FeaturedProperties />
          <QuickStats />
          <AgentSpotlight />
        </div>
      </main>

      
      <Footer />
    </div>
    </>
  );
};

export default Homepage;