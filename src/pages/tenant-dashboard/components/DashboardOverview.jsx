// pages/tenant-dashboard/components/DashboardOverview.jsx
import React from 'react';

export default function DashboardOverview({ user, savedListings, loading }) {
  // Calculate dynamic metrics from props
  const calculateMetrics = () => {
    if (savedListings.length === 0) {
      return {
        totalSaved: 0,
        availableNow: 0,
        savedThisWeek: 0,
        averagePrice: 0
      };
    }

    // Available now count
    const availableNow = savedListings.filter(p => 
      p.status === "AVAILABLE" || p.status === "available"
    ).length;

    // Saved this week
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const savedThisWeek = savedListings.filter(property => {
      return new Date(property.savedAt) >= weekAgo;
    }).length;

    // Average price
    const averagePrice = savedListings.reduce((sum, p) => {
      const price = typeof p.price === 'string' ? 
        parseFloat(p.price.replace(/,/g, '')) : p.price;
      return sum + price;
    }, 0) / savedListings.length;

    return {
      totalSaved: savedListings.length,
      availableNow,
      savedThisWeek,
      averagePrice: Math.round(averagePrice)
    };
  };

  const metrics = calculateMetrics();

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
      title: "Favorites",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      value: loading ? "..." : metrics.totalSaved,
      change: "saved properties"
    },
    {
      title: "Available",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      value: loading ? "..." : metrics.availableNow,
      change: "ready now"
    },
    {
      title: "This Week",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      value: loading ? "..." : metrics.savedThisWeek,
      change: "new saves"
    },
    {
      title: "Avg Price",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      value: loading ? "..." : formatPrice(metrics.averagePrice),
      change: "TZS /month"
    }
  ];

  return (
    <div className="card p-6">
      <h2 className="text-xl font-semibold text-text-primary mb-4">Dashboard Overview</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-surface border border-border rounded-xl p-4"
          >
            <div className="flex items-center gap-2 text-lg text-text-secondary">
              {stat.icon}
              <span className="truncate">{stat.title}</span>
            </div>
            <div className="text-2xl font-bold text-text-primary my-2">{stat.value}</div>
            <div className="text-sm text-text-secondary">{stat.change}</div>
          </div>
        ))}
      </div>
    </div>
  );
}