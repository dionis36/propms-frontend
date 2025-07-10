import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/AppIcon'; // Assuming AppIcon is correctly located
import { Helmet } from 'react-helmet-async'; 

const helmet = (
    <Helmet>
      <title>Unauthorized | EstateHub</title>
      <meta name="description" content="You do not have permission to access this page." />
    </Helmet>
); 

const Unauthorized = () => {
  return (
    <>
      {helmet}
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            {/* Using a Lock icon or similar to represent unauthorized access */}
            {/* You might need to check if your 'Icon' component supports a 'Lock' or 'Ban' icon name */}
            <Icon name="Lock" size={48} className="text-red-600" />
          </div>
          <h1 className="text-6xl font-bold text-text-primary mb-4">403</h1> {/* Standard HTTP code for Forbidden */}
          <h2 className="text-2xl font-semibold text-text-primary mb-4">Access Denied</h2>
          <p className="text-text-secondary mb-8">
            You do not have the necessary permissions to view this page.
            Please log in with an authorized account or contact support.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            to="/login-register" // Redirect to login/register page
            className="inline-flex items-center justify-center w-full px-6 py-3 bg-primary text-white
                       rounded-md font-medium hover:bg-primary-700 transition-all duration-200 ease-out
                       micro-interaction"
          >
            <Icon name="User" size={20} className="mr-2" /> {/* Assuming a User or Login icon */}
            Go to Login
          </Link>

          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center w-full px-6 py-3 bg-secondary-100
                       text-text-primary rounded-md font-medium hover:bg-secondary-200
                       transition-all duration-200 ease-out micro-interaction"
          >
            <Icon name="ArrowLeft" size={20} className="mr-2" />
            Go Back
          </button>
        </div>
      </div>
    </div> 
    </>
  );
};

export default Unauthorized;
