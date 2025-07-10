// src/components/UserAvatar.jsx
import React from 'react';
import PropTypes from 'prop-types';

const BG_CLASS_MAP = {
  AD: 'bg-primary-100 text-primary',
  EH: 'bg-accent-100 text-accent',
  IL: 'bg-secondary-200 text-secondary-700',
  MP: 'bg-success-100 text-success',
  QT: 'bg-warning-100 text-warning',
  UZ: 'bg-error-100 text-error',
  GUEST: 'bg-secondary-100 text-secondary-600',
};

function getInitials(first, last) {
  const a = first?.[0]?.toUpperCase() || '';
  const b = last?.[0]?.toUpperCase() || '';
  const initials = (a + b);
  return initials || 'GU';
}

function getBackground(initials) {
  if (initials === 'GU') return BG_CLASS_MAP.GUEST;

  const code = initials.charCodeAt(0);
  if (code >= 65 && code <= 68) return BG_CLASS_MAP.AD;   // A–D
  if (code >= 69 && code <= 72) return BG_CLASS_MAP.EH;   // E–H
  if (code >= 73 && code <= 76) return BG_CLASS_MAP.IL;   // I–L
  if (code >= 77 && code <= 80) return BG_CLASS_MAP.MP;   // M–P
  if (code >= 81 && code <= 84) return BG_CLASS_MAP.QT;   // Q–T
  if (code >= 85 && code <= 90) return BG_CLASS_MAP.UZ;   // U–Z

  return BG_CLASS_MAP.GUEST;
}

export default function UserAvatar({ firstName, lastName, size = 'w-10 h-10', className = '' }) {
  const initials = getInitials(firstName, lastName);
  const bg = getBackground(initials);

  return (
    <div
      className={`rounded-full flex items-center justify-center font-semibold uppercase ${bg} ${size} ${className}`}
      title={firstName || lastName ? `${firstName} ${lastName}` : 'Guest User'}
    >
      {initials}
    </div>
  );
}

UserAvatar.propTypes = {
  firstName: PropTypes.string,
  lastName: PropTypes.string,
  size: PropTypes.string,
  className: PropTypes.string,
};
