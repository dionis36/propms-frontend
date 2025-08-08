// src/pages/login-register/LoginRegister.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Icon from 'components/AppIcon';
import AuthForm from './components/AuthForm';
import ForgotPassword from './components/ForgotPassword';
import SimpleFooter from '../../components/ui/SimpleFooter'; // Import the new minimalist footer

const LoginRegister = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Determine initial tab based on URL
  const getInitialTab = () => {
    if (location.pathname === '/register') return 'register';
    return 'login'; // default to login for /login or any other path
  };

  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Update tab when URL changes
  useEffect(() => {
    const newTab = getInitialTab();
    setActiveTab(newTab);
    setShowForgotPassword(false); // Reset forgot password when switching tabs
  }, [location.pathname]);

  // Handle tab switching with URL updates
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setShowForgotPassword(false);
    
    // Update URL without adding to history stack
    const newPath = tab === 'register' ? '/register' : '/login';
    if (location.pathname !== newPath) {
      navigate(newPath, { replace: true });
    }
  };

  const pageTitle = showForgotPassword
    ? 'Reset Password'
    : activeTab === 'register'
    ? 'Register'
    : 'Login';

  return (
    <>
      <Helmet>
        <title>{pageTitle} | EstateHub</title>
        <meta
          name="description"
          content={`${
            pageTitle === 'Reset Password'
              ? 'Recover your EstateHub account.'
              : `${pageTitle} to access your EstateHub account.`
          }`}
        />
      </Helmet>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="bg-surface border-b border-border">
          <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
            <Link 
              to="/" 
              className="flex items-center space-x-2"
              aria-label="Go back to homepage"
            >
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <Icon name="Home" size={20} color="white" />
              </div>
              <span className="text-xl font-semibold text-text-primary font-heading">
                EstateHub
              </span>
            </Link>
            <Link 
              to="/" 
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              <Icon name="X" size={24} />
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-md">
            {showForgotPassword ? (
              <ForgotPassword onBack={() => setShowForgotPassword(false)} />
            ) : (
              <>
              {/* Header Section */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
                    <Icon name="Users" size={32} color="white" />
                  </div>
                  <h1 className="text-3xl font-bold text-text-primary font-heading mb-2">
                    {activeTab === 'login' ? 'Welcome Back' : 'Join EstateHub'}
                  </h1>
                  <p className="text-text-secondary">
                    {activeTab === 'login'
                      ? 'Sign in to access your account and continue your property journey'
                      : 'Create your account and start exploring properties today'
                    }
                  </p>
                </div>

                {/* Tab Navigation */}
                <div className="mb-8">
                  <div className="flex bg-secondary-100 rounded-lg p-1">
                    <button
                      onClick={() => handleTabChange('login')}
                      className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
                        activeTab === 'login' 
                          ? 'bg-surface text-text-primary shadow-elevation-1' 
                          : 'text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => handleTabChange('register')}
                      className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
                        activeTab === 'register' 
                          ? 'bg-surface text-text-primary shadow-elevation-1' 
                          : 'text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      Register
                    </button>
                  </div>
                </div>

                {/* Authentication Form */}
                <AuthForm 
                  mode={activeTab}
                  onForgotPassword={() => setShowForgotPassword(true)}
                />
              </>
            )}
          </div>
        </main>
        
        {/* Footer component for the login/register page */}
        <SimpleFooter />
      </div>
    </>
  );
};

export default LoginRegister;

