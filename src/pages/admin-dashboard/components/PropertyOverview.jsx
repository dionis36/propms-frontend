// src/pages/admin-dashboard/components/PropertyOverview.jsx
import React from 'react';
import Icon from '../../../components/AppIcon';

const PropertyOverview = () => {
  const propertyStats = [
    {
      status: 'Vacant',
      count: 1456,
      percentage: 60.8,
      icon: 'Home',
      color: 'bg-orange-100 text-orange-600',
      trend: '+45 this week'
    },
    {
      status: 'Occupied',
      count: 938,
      percentage: 39.2,
      icon: 'Users',
      color: 'bg-green-100 text-green-600',
      trend: '+12 this week'
    }
  ];

  const totalProperties = propertyStats.reduce((sum, stat) => sum + stat.count, 0);

  return (
    <div className="bg-surface p-6 rounded-lg shadow-elevation-1 border border-border">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-1">
            Property Overview
          </h3>
          <p className="text-text-secondary text-sm">
            Total: {totalProperties?.toLocaleString()} properties
          </p>
        </div>
        <div className="p-2 bg-accent-100 text-accent-600 rounded-md">
          <Icon name="Building" size={20} />
        </div>
      </div>

      {/* Property Status Cards */}
      <div className="space-y-4">
        {propertyStats?.map((stat) => (
          <div key={stat?.status} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-md ${stat?.color}`}>
                <Icon name={stat?.icon} size={16} />
              </div>
              <div>
                <p className="text-text-primary font-medium">
                  {stat?.status} Properties
                </p>
                <p className="text-text-secondary text-xs">
                  {stat?.trend}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-text-primary font-semibold">
                {stat?.count?.toLocaleString()}
              </p>
              <p className="text-text-secondary text-xs">
                {stat?.percentage}%
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Progress visualization */}
      <div className="mt-6">
        <div className="flex items-center justify-between text-xs text-text-secondary mb-2">
          <span>Occupancy Rate</span>
          <span>{propertyStats[1]?.percentage}%</span>
        </div>
        <div className="w-full bg-secondary-100 rounded-full h-3">
          <div 
            className="h-3 bg-green-500 rounded-full transition-all duration-500"
            style={{ width: `${propertyStats[1]?.percentage}%` }}
          ></div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-secondary-50 rounded-md">
          <p className="text-lg font-bold text-text-primary">2,394</p>
          <p className="text-xs text-text-secondary">Total Listed</p>
        </div>
        <div className="text-center p-3 bg-secondary-50 rounded-md">
          <p className="text-lg font-bold text-text-primary">156</p>
          <p className="text-xs text-text-secondary">New This Month</p>
        </div>
      </div>
    </div>
  );
};

export default PropertyOverview;