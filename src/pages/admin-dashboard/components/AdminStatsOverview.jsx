// src/pages/admin-dashboard/components/AdminStatsOverview.jsx
import React from 'react';
import Icon from '../../../components/AppIcon';

const AdminStatsOverview = () => {
  const stats = [
    {
      id: 'total-users',
      title: 'Total Users',
      value: '12,847',
      change: '+324',
      changeType: 'increase',
      icon: 'Users',
      color: 'primary',
      description: 'Registered platform users'
    },
    {
      id: 'total-brokers',
      title: 'Active Brokers',
      value: '156',
      change: '+12',
      changeType: 'increase',
      icon: 'UserCheck',
      color: 'accent',
      description: 'Verified real estate brokers'
    },
    {
      id: 'total-properties',
      title: 'Listed Properties',
      value: '2,394',
      change: '+89',
      changeType: 'increase',
      icon: 'Home',
      color: 'success',
      description: 'Active property listings'
    }
  ];

  const getColorClasses = (color) => {
    const colorMap = {
      primary: 'bg-primary-100 text-primary border-primary-500',
      accent: 'bg-accent-100 text-accent-600 border-accent-500',
      success: 'bg-success-100 text-success border-success-500',
      warning: 'bg-warning-100 text-warning border-warning-500'
    };
    return colorMap[color] || colorMap.primary;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {stats?.map((stat) => (
        <div 
          key={stat?.id}
          className="bg-surface p-6 rounded-lg shadow-elevation-1 border border-border hover:shadow-elevation-2 transition-all duration-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-md ${getColorClasses(stat?.color)}`}>
              <Icon name={stat?.icon} size={24} />
            </div>
            <div className={`text-sm font-medium px-2 py-1 rounded-md ${
              stat?.changeType === 'increase' ?'bg-success-100 text-success' :'bg-error-100 text-error'
            }`}>
              {stat?.change}
            </div>
          </div>
          
          <div>
            <h3 className="text-2xl font-bold text-text-primary mb-1">
              {stat?.value}
            </h3>
            <p className="text-text-primary text-sm font-medium mb-1">
              {stat?.title}
            </p>
            <p className="text-text-secondary text-xs">
              {stat?.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminStatsOverview;