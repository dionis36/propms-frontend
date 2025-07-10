// src/pages/admin-dashboard/components/UserStats.jsx
import React from 'react';

const UserStats = ({ expanded = false }) => {
  const userData = [
    { role: 'Tenants', count: 2450, percentage: 58 },
    { role: 'Brokers', count: 327, percentage: 8 },
    { role: 'Owners', count: 1432, percentage: 34 },
  ];

  if (expanded) {
    return (
      <div className="bg-surface rounded-xl shadow-elevation-1 p-6">
        <h3 className="text-2xl font-bold mb-6">User Statistics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="text-xl font-semibold mb-4">User Distribution</h4>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-text-secondary">User Distribution Chart</span>
            </div>
          </div>
          
          <div>
            <h4 className="text-xl font-semibold mb-4">User Details</h4>
            <div className="space-y-4">
              {userData.map((user, index) => (
                <div key={index} className="border-b border-divider pb-4">
                  <div className="flex justify-between">
                    <span className="font-medium">{user.role}</span>
                    <span>{user.count} users</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${user.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6">
              <h4 className="text-lg font-semibold mb-2">New Signups (30 days)</h4>
              <div className="text-2xl font-bold text-success">+324</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl shadow-elevation-1 p-4 h-full">
      <h3 className="text-lg font-bold mb-3">User Statistics</h3>
      <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
        <span className="text-text-secondary">User Distribution Chart</span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {userData.map((user, index) => (
          <div key={index} className="text-center">
            <div className="font-bold">{user.count}</div>
            <div className="text-xs text-text-secondary">{user.role}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserStats;