// src/pages/admin-dashboard/components/RecentAdminActivity.jsx
import React from 'react';
import Icon from '../../../components/AppIcon';

const RecentAdminActivity = ({ notifications }) => {
  const recentActivities = [
    {
      id: 'act001',
      type: 'broker_verified',
      message: 'Verified broker: Sarah Johnson',
      timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
      icon: 'UserCheck',
      color: 'text-green-600'
    },
    {
      id: 'act002',
      type: 'listing_removed',
      message: 'Removed flagged listing: Downtown Condo',
      timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
      icon: 'Trash2',
      color: 'text-red-600'
    },
    {
      id: 'act003',
      type: 'user_suspended',
      message: 'Suspended user: spam_account_123',
      timestamp: new Date(Date.now() - 1000 * 60 * 90), // 1.5 hours ago
      icon: 'UserX',
      color: 'text-orange-600'
    },
    {
      id: 'act004',
      type: 'system_update',
      message: 'System maintenance completed',
      timestamp: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
      icon: 'Settings',
      color: 'text-blue-600'
    },
    {
      id: 'act005',
      type: 'broker_rejected',
      message: 'Rejected broker application: Invalid license',
      timestamp: new Date(Date.now() - 1000 * 60 * 180), // 3 hours ago
      icon: 'X',
      color: 'text-red-600'
    }
  ];

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - timestamp) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'info': return 'Info';
      case 'warning': return 'AlertTriangle';
      case 'error': return 'AlertCircle';
      case 'success': return 'CheckCircle';
      default: return 'Bell';
    }
  };

  const combinedActivities = [
    ...recentActivities,
    ...(notifications?.slice(0, 5)?.map(notification => ({
      id: `notif_${notification?.id}`,
      type: 'notification',
      message: notification?.message,
      timestamp: notification?.timestamp,
      icon: getNotificationIcon(notification?.type),
      color: 'text-blue-600'
    })) || [])
  ].sort((a, b) => new Date(b?.timestamp) - new Date(a?.timestamp));

  return (
    <div className="bg-surface p-6 rounded-lg shadow-elevation-1 border border-border">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-1">
            Recent Activity
          </h3>
          <p className="text-text-secondary text-sm">
            Administrative actions and system events
          </p>
        </div>
        <div className="p-2 bg-blue-100 text-blue-600 rounded-md">
          <Icon name="Activity" size={20} />
        </div>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {combinedActivities?.slice(0, 10)?.map((activity) => (
          <div key={activity?.id} className="flex items-start space-x-3 p-3 bg-secondary-50 rounded-md">
            <div className={`p-1.5 rounded-full bg-white ${activity?.color}`}>
              <Icon name={activity?.icon} size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-text-primary">
                {activity?.message}
              </p>
              <p className="text-xs text-text-secondary mt-1">
                {formatTimeAgo(activity?.timestamp)}
              </p>
            </div>
          </div>
        ))}

        {combinedActivities?.length === 0 && (
          <div className="text-center py-8">
            <Icon name="Clock" size={48} className="text-secondary-300 mx-auto mb-2" />
            <p className="text-text-secondary">No recent activity</p>
          </div>
        )}
      </div>

      {/* Audit Trail Placeholder */}
      <div className="mt-6 pt-4 border-t border-border">
        <button className="w-full text-center text-primary text-sm font-medium hover:text-primary-700 transition-colors">
          View Full Audit Trail
        </button>
      </div>
    </div>
  );
};

export default RecentAdminActivity;