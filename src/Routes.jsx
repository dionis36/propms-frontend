// src/Routes.jsx
import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";

// Import the PrivateRoute component
import PrivateRoute from 'components/PrivateRoute';

// Page imports
import Homepage from "pages/homepage";
import PropertyListings from "pages/property-listings";
import PropertyDetails from "pages/property-details";
import AgentDashboard from "pages/agent-dashboard";
import AdminDashboard from "pages/admin-dashboard";
import UserProfileSettings from "pages/user-profile-settings";
import LoginRegister from "pages/login-register";
import TenantDashboard from "pages/tenant-dashboard";
import PropertyCreateEdit from "pages/property-create-edit";
import NotFound from "pages/NotFound";
import Unauthorized from "pages/Unauthorized"; 

const Routes = () => {
  return (
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
          {/* Public Routes */}
          <Route path="/" element={<Homepage />} />
          <Route path="/homepage" element={<Homepage />} />
          <Route path="/property-listings" element={<PropertyListings />} />
          <Route path="/property-details" element={<PropertyDetails />} />
          <Route path="/login-register" element={<LoginRegister />} />
          <Route path="/unauthorized" element={<Unauthorized />} /> {/* Route for unauthorized access */}

          {/* Protected Routes - Authenticated Users Only */}
          {/* User Profile Settings - accessible by any authenticated user */}
          <Route path="/user-profile-settings" element={<PrivateRoute allowedRoles={[]} />}>
            <Route index element={<UserProfileSettings />} />
          </Route>

          {/* Protected Routes - Role-Based Access Control */}

          {/* Tenant Dashboard - accessible only by TENANT role */}
          <Route path="/tenant-dashboard" element={<PrivateRoute allowedRoles={['TENANT']} />}>
            <Route index element={<TenantDashboard />} />
          </Route>

          {/* Agent Dashboard - accessible only by BROKER role (assuming 'BROKER' is the agent role name) */}
          <Route path="/agent-dashboard" element={<PrivateRoute allowedRoles={['BROKER']} />}>
            <Route index element={<AgentDashboard />} />
          </Route>

          {/* Admin Dashboard - accessible only by ADMIN role */}
          <Route path="/admin-dashboard" element={<PrivateRoute allowedRoles={['ADMIN']} />}>
            <Route index element={<AdminDashboard />} />
          </Route>

          {/* Property Create/Edit - accessible by BROKER or ADMIN roles */}
          <Route path="/property-create-edit" element={<PrivateRoute allowedRoles={['BROKER', 'ADMIN']} />}>
            <Route index element={<PropertyCreateEdit />} />
          </Route>
          <Route path="/property-create-edit/:id" element={<PrivateRoute allowedRoles={['BROKER', 'ADMIN']} />}>
            <Route index element={<PropertyCreateEdit />} />
          </Route>

          {/* Catch-all route for 404 Not Found */}
          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
      </ErrorBoundary>
  );
};

export default Routes;