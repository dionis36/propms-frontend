// src/pages/admin-dashboard/components/BrokerOverview.jsx
import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const BrokerOverview = ({ onModerationAction }) => {
  const [selectedBrokers, setSelectedBrokers] = useState([]);

  const brokerStats = {
    verified: 142,
    pending: 14,
    total: 156
  };

  const pendingBrokers = [
    {
      id: 'br001',
      name: 'Sarah Johnson',
      email: 'sarah.j@realty.com',
      license: 'RE12345678',
      submittedAt: '2024-01-15',
      documents: ['License', 'Insurance', 'ID'],
      status: 'pending'
    },
    {
      id: 'br002',
      name: 'Michael Chen',
      email: 'mchen@properties.com',
      license: 'RE87654321',
      submittedAt: '2024-01-14',
      documents: ['License', 'Insurance'],
      status: 'pending'
    },
    {
      id: 'br003',
      name: 'Emily Rodriguez',
      email: 'emily.r@homes.com',
      license: 'RE11223344',
      submittedAt: '2024-01-13',
      documents: ['License', 'Insurance', 'ID', 'References'],
      status: 'pending'
    }
  ];

  const handleBrokerSelection = (brokerId) => {
    setSelectedBrokers(prev => 
      prev.includes(brokerId) 
        ? prev.filter(id => id !== brokerId)
        : [...prev, brokerId]
    );
  };

  const handleSelectAll = () => {
    setSelectedBrokers(
      selectedBrokers?.length === pendingBrokers?.length 
        ? [] 
        : pendingBrokers?.map(broker => broker?.id)
    );
  };

  const handleVerifyBroker = (brokerId) => {
    onModerationAction?.('brokerVerifications', brokerId);
    setSelectedBrokers(prev => prev.filter(id => id !== brokerId));
  };

  const handleBulkVerify = () => {
    selectedBrokers?.forEach(brokerId => {
      onModerationAction?.('brokerVerifications', brokerId);
    });
    setSelectedBrokers([]);
  };

  return (
    <div className="bg-surface p-6 rounded-lg shadow-elevation-1 border border-border">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-1">
            Broker Overview
          </h3>
          <p className="text-text-secondary text-sm">
            Verification and management
          </p>
        </div>
        <div className="p-2 bg-success-100 text-success rounded-md">
          <Icon name="UserCheck" size={20} />
        </div>
      </div>

      {/* Broker Statistics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-green-50 rounded-md">
          <p className="text-xl font-bold text-green-600">{brokerStats?.verified}</p>
          <p className="text-xs text-text-secondary">✅ Verified</p>
        </div>
        <div className="text-center p-3 bg-orange-50 rounded-md">
          <p className="text-xl font-bold text-orange-600">{brokerStats?.pending}</p>
          <p className="text-xs text-text-secondary">❌ Pending</p>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-md">
          <p className="text-xl font-bold text-blue-600">{brokerStats?.total}</p>
          <p className="text-xs text-text-secondary">Total</p>
        </div>
      </div>

      {/* Pending Verifications */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-medium text-text-primary">
            Pending Verifications ({pendingBrokers?.length})
          </h4>
          {selectedBrokers?.length > 0 && (
            <button
              onClick={handleBulkVerify}
              className="bg-success text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
            >
              Verify Selected ({selectedBrokers?.length})
            </button>
          )}
        </div>

        <div className="space-y-3 max-h-64 overflow-y-auto">
          <div className="flex items-center space-x-2 text-xs text-text-secondary border-b border-border pb-2">
            <input
              type="checkbox"
              checked={selectedBrokers?.length === pendingBrokers?.length}
              onChange={handleSelectAll}
              className="rounded"
            />
            <span className="font-medium">Select All</span>
          </div>

          {pendingBrokers?.map((broker) => (
            <div key={broker?.id} className="flex items-center justify-between p-3 bg-secondary-50 rounded-md">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={selectedBrokers?.includes(broker?.id)}
                  onChange={() => handleBrokerSelection(broker?.id)}
                  className="rounded"
                />
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {broker?.name}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {broker?.email} • {broker?.license}
                  </p>
                  <div className="flex items-center space-x-1 mt-1">
                    {broker?.documents?.map((doc, index) => (
                      <span key={index} className="text-xs bg-blue-100 text-blue-600 px-1 py-0.5 rounded">
                        {doc}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-text-secondary">
                  {broker?.submittedAt}
                </span>
                <button
                  onClick={() => handleVerifyBroker(broker?.id)}
                  className="bg-success text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition-colors"
                >
                  Verify
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BrokerOverview;