import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Icon from 'components/AppIcon';
import AuthForm from './components/AuthForm';
import ForgotPassword from './components/ForgotPassword';

const LoginRegister = () => {
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'register'
  const [showForgotPassword, setShowForgotPassword] = useState(false);

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
              {/* Tab Navigation */}
              <div className="mb-8">
                <div className="flex bg-secondary-100 rounded-lg p-1">
                  <button
                    onClick={() => setActiveTab('login')}
                    className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
                      activeTab === 'login' ?'bg-surface text-text-primary shadow-elevation-1' :'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setActiveTab('register')}
                    className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
                      activeTab === 'register' ?'bg-surface text-text-primary shadow-elevation-1' :'text-text-secondary hover:text-text-primary'
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

              {/* Footer Links */}
              <div className="mt-8 text-center">
                <p className="text-sm text-text-secondary">
                  By continuing, you agree to our{' '}
                  <Link to="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
    </>
  );
};

export default LoginRegister;