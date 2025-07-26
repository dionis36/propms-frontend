import React, { useState } from 'react';

import { useNavigate } from 'react-router-dom';
import Header from 'components/ui/Header';


import Icon from 'components/AppIcon';
import AuthToggle from './components/AuthToggle';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import SocialAuth from './components/SocialAuth';
import AuthFooter from './components/AuthFooter';

const Authentication = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleAuthToggle = (loginMode) => {
    setIsLogin(loginMode);
    setError('');
    setSuccess('');
  };

  const handleAuthSuccess = (userData) => {
    setSuccess(isLogin ? 'Login successful!' : 'Registration successful!');
    setLoading(false);
    
    // Simulate navigation based on user role
    setTimeout(() => {
      switch (userData.role) {
        case 'agent': navigate('/agent-dashboard');
          break;
        case 'buyer': case'seller': navigate('/property-listings');
          break;
        default:
          navigate('/homepage');
      }
    }, 1500);
  };

  const handleAuthError = (errorMessage) => {
    setError(errorMessage);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
              <Icon name="Users" size={32} color="white" />
            </div>
            <h1 className="text-3xl font-bold text-text-primary font-heading mb-2">
              {isLogin ? 'Welcome Back' : 'Join EstateHub'}
            </h1>
            <p className="text-text-secondary">
              {isLogin 
                ? 'Sign in to access your account and continue your property journey' :'Create your account and start exploring properties today'
              }
            </p>
          </div>

          {/* Auth Toggle */}
          <AuthToggle 
            isLogin={isLogin} 
            onToggle={handleAuthToggle}
          />

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-6 p-4 bg-error-100 border border-error-500 rounded-md">
              <div className="flex items-center">
                <Icon name="AlertCircle" size={20} className="text-error mr-2" />
                <p className="text-sm text-error font-medium">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-success-100 border border-success-500 rounded-md">
              <div className="flex items-center">
                <Icon name="CheckCircle" size={20} className="text-success mr-2" />
                <p className="text-sm text-success font-medium">{success}</p>
              </div>
            </div>
          )}

          {/* Authentication Form */}
          <div className="bg-surface rounded-lg shadow-elevation-2 p-6 mb-6">
            {isLogin ? (
              <LoginForm
                loading={loading}
                setLoading={setLoading}
                onSuccess={handleAuthSuccess}
                onError={handleAuthError}
              />
            ) : (
              <RegisterForm
                loading={loading}
                setLoading={setLoading}
                onSuccess={handleAuthSuccess}
                onError={handleAuthError}
              />
            )}
          </div>

          {/* Social Authentication */}
          <SocialAuth 
            isLogin={isLogin}
            loading={loading}
            setLoading={setLoading}
            onSuccess={handleAuthSuccess}
            onError={handleAuthError}
          />

          {/* Footer */}
          <AuthFooter isLogin={isLogin} />
        </div>
      </main>
    </div>
  );
};

export default Authentication;