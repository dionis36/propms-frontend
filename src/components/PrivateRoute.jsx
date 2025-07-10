import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../contexts/AuthContext';

export default function PrivateRoute({ allowedRoles = [] }) {
  const { user, isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) {
    return null; // or <LoadingSpinner /> or skeleton
  }

  if (!isAuthenticated) {
    return <Navigate to="/login-register" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}

PrivateRoute.propTypes = {
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
};
