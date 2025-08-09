// pages/agent-dashboard/components/PerformanceMetrics.jsx
import React from 'react';

export default function PerformanceMetrics({ metrics }) {
  const { totalListings, vacantListings, occupiedListings, avg } = metrics;

  // Calculate percentage values
  const vacantRate = totalListings > 0 ? Math.round((vacantListings / totalListings) * 100) : 0;
  const occupiedRate = totalListings > 0 ? Math.round((occupiedListings / totalListings) * 100) : 0;

  // Function to format the price for display
  const formatPrice = (price) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}M`;
    } else if (price >= 1000) {
      return `${Math.round(price / 1000)}K`; 
    } else {
      return price.toString();
    }
  };


  const stats = [
    {
      title: "Total Listings",
      icon: (
        // Icon and background are red
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10l1.553-1.276A2 2 0 015.894 8h12.212a2 2 0 011.341.724L21 10m-18 0v10a2 2 0 002 2h14a2 2 0 002-2V10m-18 0L12 3l9 7" />
        </svg>
      ),
      value: totalListings,
      change: `${totalListings > 0 ? "+100%" : "0%"}`,
      bgColor: "bg-red-50"
    },
    {
      title: "Vacant",
      icon: (
        // Icon and background are green
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m2 0a8 8 0 11-16 0 8 8 0 0116 0z" />
        </svg>
      ),
      value: vacantListings,
      change: `${vacantRate}%`,
      bgColor: "bg-green-50"
    },
    {
      title: "Occupied",
      icon: (
        // Icon and background are blue
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      ),
      value: occupiedListings,
      change: `${occupiedRate}%`,
      bgColor: "bg-blue-50"
    },
    {
      // Updated title to remove the dot
      title: "Avg Price",
      icon: (
        // Changed icon to match the dollar sign from DashboardOverview
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      // Use the new formatPrice function to format the value
      value: avg ? formatPrice(avg) : '...',
      // Updated change text to match DashboardOverview
      change: "TZS /month",
      bgColor: "bg-yellow-50"
    }
  ];
  
  return (
    <div className="card p-6">
      <h2 className="text-xl font-semibold text-text-primary mb-4">Performance Overview</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`${stat.bgColor} border border-border rounded-xl p-4 text-center`}
          >
            <div className="flex items-center gap-2 text-lg text-text-secondary justify-center">
              {stat.icon}
              <span>{stat.title}</span>
            </div>

            <div className="text-2xl font-bold text-text-primary my-2">{stat.value}</div>
            <div className="text-sm text-text-secondary">{stat.change}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
