// src/pages/admin-dashboard/components/QuickModeration.jsx
import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const QuickModeration = ({ pendingActions, onModerationAction, onBulkAction }) => {
  const [activeTab, setActiveTab] = useState('brokers');
  const [selectedItems, setSelectedItems] = useState([]);

  const moderationTasks = {
    brokers: {
      title: 'Broker Verifications',
      icon: 'UserCheck',
      count: pendingActions?.brokerVerifications || 0,
      items: [
        { id: 'bv001', name: 'Sarah Johnson', type: 'License Verification', priority: 'high' },
        { id: 'bv002', name: 'Michael Chen', type: 'Document Review', priority: 'medium' },
        { id: 'bv003', name: 'Emily Rodriguez', type: 'Background Check', priority: 'high' }
      ]
    },
    listings: {
      title: 'Flagged Listings',
      icon: 'Flag',
      count: pendingActions?.flaggedListings || 0,
      items: [
        { id: 'fl001', name: 'Luxury Condo Downtown', type: 'Price Complaint', priority: 'medium' },
        { id: 'fl002', name: 'Family Home Suburbs', type: 'False Information', priority: 'high' },
        { id: 'fl003', name: 'Studio Apartment', type: 'Duplicate Listing', priority: 'low' }
      ]
    },
    users: {
      title: 'User Reports',
      icon: 'AlertTriangle',
      count: pendingActions?.userReports || 0,
      items: [
        { id: 'ur001', name: 'John Smith', type: 'Spam Behavior', priority: 'high' },
        { id: 'ur002', name: 'Lisa Wong', type: 'Inappropriate Content', priority: 'medium' },
        { id: 'ur003', name: 'David Brown', type: 'Harassment Report', priority: 'high' }
      ]
    }
  };

  const tabs = [
    { id: 'brokers', label: 'Brokers', count: moderationTasks.brokers.count },
    { id: 'listings', label: 'Listings', count: moderationTasks.listings.count },
    { id: 'users', label: 'Users', count: moderationTasks.users.count }
  ];

  const handleItemSelection = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    const currentItems = moderationTasks[activeTab]?.items?.map(item => item?.id) || [];
    setSelectedItems(
      selectedItems?.length === currentItems?.length ? [] : currentItems
    );
  };

  const handleApprove = (itemId) => {
    onModerationAction?.(
      activeTab === 'brokers' ? 'brokerVerifications' : 
      activeTab === 'listings' ? 'flaggedListings' : 'userReports',
      itemId
    );
  };

  const handleBulkApprove = () => {
    onBulkAction?.(
      activeTab === 'brokers' ? 'brokerVerifications' : 
      activeTab === 'listings' ? 'flaggedListings' : 'userReports',
      selectedItems
    );
    setSelectedItems([]);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-600';
      case 'medium': return 'bg-yellow-100 text-yellow-600';
      case 'low': return 'bg-green-100 text-green-600';
      default: return 'bg-secondary-100 text-secondary-600';
    }
  };

  const currentTask = moderationTasks[activeTab];

  return (
    <div className="bg-surface p-6 rounded-lg shadow-elevation-1 border border-border">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-1">
            Quick Moderation
          </h3>
          <p className="text-text-secondary text-sm">
            Pending review and verification tasks
          </p>
        </div>
        <div className="p-2 bg-warning-100 text-warning rounded-md">
          <Icon name="CheckSquare" size={20} />
        </div>
      </div>

      {/* Moderation Tabs */}
      <div className="flex space-x-1 mb-6 bg-secondary-100 p-1 rounded-md">
        {tabs?.map((tab) => (
          <button
            key={tab?.id}
            onClick={() => {
              setActiveTab(tab?.id);
              setSelectedItems([]);
            }}
            className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded text-sm font-medium transition-all duration-200 ${
              activeTab === tab?.id 
                ? 'bg-surface text-text-primary shadow-sm' 
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <span>{tab?.label}</span>
            {tab?.count > 0 && (
              <span className="bg-warning text-white text-xs px-1.5 py-0.5 rounded-full">
                {tab?.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Current Task Content */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Icon name={currentTask?.icon} size={16} className="text-text-secondary" />
            <h4 className="text-md font-medium text-text-primary">
              {currentTask?.title} ({currentTask?.items?.length})
            </h4>
          </div>
          {selectedItems?.length > 0 && (
            <button
              onClick={handleBulkApprove}
              className="bg-success text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
            >
              Process Selected ({selectedItems?.length})
            </button>
          )}
        </div>

        {currentTask?.items?.length > 0 ? (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            <div className="flex items-center space-x-2 text-xs text-text-secondary border-b border-border pb-2">
              <input
                type="checkbox"
                checked={selectedItems?.length === currentTask?.items?.length}
                onChange={handleSelectAll}
                className="rounded"
              />
              <span className="font-medium">Select All</span>
            </div>

            {currentTask?.items?.map((item) => (
              <div key={item?.id} className="flex items-center justify-between p-3 bg-secondary-50 rounded-md">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedItems?.includes(item?.id)}
                    onChange={() => handleItemSelection(item?.id)}
                    className="rounded"
                  />
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {item?.name}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-text-secondary">
                        {item?.type}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(item?.priority)}`}>
                        {item?.priority}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleApprove(item?.id)}
                    className="bg-success text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition-colors"
                  >
                    Approve
                  </button>
                  <button className="bg-error text-white px-3 py-1 rounded text-xs hover:bg-red-700 transition-colors">
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Icon name="CheckCircle" size={48} className="text-success mx-auto mb-2" />
            <p className="text-text-secondary">No pending {currentTask?.title?.toLowerCase()}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickModeration;