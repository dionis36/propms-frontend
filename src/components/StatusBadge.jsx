// src/components/StatusBadge.jsx
import React from 'react';

const StatusBadge = ({ status, className = '' }) => {
  const badgeMap = {
    AVAILABLE: { label: 'Available', bg: 'bg-success-100', text: 'text-success' },
    OCCUPIED: { label: 'Occupied', bg: 'bg-error-100', text: 'text-error' },
    VERIFIED: { label: 'Verified', bg: 'bg-success-100', text: 'text-success' },
    UNVERIFIED: { label: 'Unverified', bg: 'bg-warning-100', text: 'text-warning' },
    ADMIN: { label: 'Admin', bg: 'bg-secondary-300', text: 'text-secondary-900' },
    BROKER: { label: 'Broker', bg: 'bg-accent-100', text: 'text-accent' },
    TENANT: { label: 'Tenant', bg: 'bg-primary-100', text: 'text-primary' },
    // ADMIN: { label: 'Admin', bg: 'bg-secondary-100', text: 'text-secondary-700' },
  };

  const badgeConfig = badgeMap[status] || {
    label: 'Unknown',
    bg: 'bg-secondary-200',
    text: 'text-secondary-700'
  };

  const baseClasses = "text-xs font-semibold px-2 py-1 rounded-full uppercase tracking-wide inline-block";
  
  return (
    <span 
      className={`${baseClasses} ${badgeConfig.bg} ${badgeConfig.text} ${className}`}
    >
      {badgeConfig.label}
    </span>
  );
};

export default StatusBadge;