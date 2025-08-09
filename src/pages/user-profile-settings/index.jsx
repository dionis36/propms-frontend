import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import ProfileInformation from './components/ProfileInformation';
import AccountSettings from './components/AccountSettings';
import MobileTabNavigation from './components/MobileTabNavigation';
import DesktopTabNavigation from './components/DesktopTabNavigation';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../../components/AppIcon';
import Toast from '../../components/ui/Toast';
import { useUserProfile } from '../../hooks/useUserProfile';

import { updateUserProfile } from '../../services/api'; // Adjust the import path as necessary

const UserProfileSettings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('saved');
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState(null);

  
  const { accessToken, logout, updateUserContext } = useAuth();
  
  const { data: userProfile, isLoading, error } = useUserProfile(accessToken, logout);

  // Update local user state when profile data is fetched
  useEffect(() => {
    if (userProfile) {
      setUser(userProfile);
    }
  }, [userProfile]);
  
  const tabs = [
    {
      id: 'profile',
      label: 'Profile',
      icon: 'User',
      component: ProfileInformation,
      roles: ['all']
    },
    {
      id: 'account',
      label: 'Account Settings',
      icon: 'Settings',
      component: AccountSettings,
      roles: ['all']
    },
  ];

  const filteredTabs = tabs.filter(tab => 
    tab.roles.includes('all') || (user?.role && tab.roles.includes(user.role.toLowerCase()))
  );

  const handleTabChange = (tabId) => {
    if (hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave this section?')) {
        setActiveTab(tabId);
        setHasUnsavedChanges(false);
        setIsMobileMenuOpen(false);
      }
    } else {
      setActiveTab(tabId);
      setIsMobileMenuOpen(false);
    }
  };

  const handleDataChange = (updatedData) => {
    setUser(prev => ({ ...prev, ...updatedData }));
    setHasUnsavedChanges(true);
  };

  const ActiveTabComponent = filteredTabs.find(tab => tab.id === activeTab)?.component;

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const helmet = (
    <Helmet>
      <title>Settings | EstateHub</title>
      <meta name="description" content="Find your dream property with EstateHub." />
    </Helmet>
  );

const handleManualSave = async () => {
  console.log("🧪 About to PATCH with user:", user);
  try {
    setAutoSaveStatus('saving');

    // 1. Send update to backend
    const updatedUser = await updateUserProfile(accessToken, user);

    // 2. Reflect update in UI
    setAutoSaveStatus('saved');
    setHasUnsavedChanges(false);

    // ✅ 3. Sync globally to update Avatar, Header, etc.
    updateUserContext(updatedUser); // ← this line is the key

    showToast('Changes saved successfully.', 'success');
  } catch (err) {
    console.error('Manual save failed:', err);
    setAutoSaveStatus('error');
    showToast('Failed to save changes. Please try again.', 'error');
  }
};

  if (isLoading) {
    return (
      <>
        {helmet}
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-16 lg:pt-18">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header Skeleton */}
            <div className="mb-8">
              <div className="h-8 bg-secondary-100 rounded w-1/3 mb-4 skeleton"></div>
              <div className="h-4 bg-secondary-100 rounded w-1/2 skeleton"></div>
            </div>
            
            {/* Content Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Sidebar Skeleton */}
              <div className="lg:col-span-1">
                <div className="space-y-2">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-12 bg-secondary-100 rounded skeleton"></div>
                  ))}
                </div>
              </div>
              
              {/* Main Content Skeleton */}
              <div className="lg:col-span-3">
                <div className="space-y-6">
                  <div className="h-64 bg-secondary-100 rounded-lg skeleton"></div>
                  <div className="h-48 bg-secondary-100 rounded-lg skeleton"></div>
                  <div className="h-32 bg-secondary-100 rounded-lg skeleton"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </>
    );
  }

  return (
    <>
      {helmet}
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16 lg:pt-18">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-text-primary font-heading mb-2">
                  Profile & Settings
                </h1>
                <p className="text-text-secondary">
                  Manage your account information and preferences
                </p>
              </div>
              
              {/* Auto-save Status */}
              <div className="mt-4 md:mt-0 flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm">
                  {autoSaveStatus === 'saving' && (
                    <>
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-text-secondary">Saving...</span>
                    </>
                  )}
                  {autoSaveStatus === 'saved' && (
                    <>
                      <div className="w-4 h-4 bg-success rounded-full flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-success">Changes saved</span>
                    </>
                  )}
                  {autoSaveStatus === 'error' && (
                    <>
                      <div className="w-4 h-4 bg-error rounded-full flex items-center justify-center">
                        <Icon name="X" size={10} color="white" />
                      </div>
                      <span className="text-error">Save failed</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Tab Navigation */}
          <div className="lg:hidden mb-6">
            <MobileTabNavigation
              tabs={filteredTabs}
              activeTab={activeTab}
              onTabChange={handleTabChange}
              isMenuOpen={isMobileMenuOpen}
              onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </div>

          {/* Desktop Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Desktop Sidebar Navigation */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="lg:sticky lg:top-20 lg:max-h-screen lg:overflow-y-auto lg:pb-20">
                <DesktopTabNavigation
                  tabs={filteredTabs}
                  activeTab={activeTab}
                  onTabChange={handleTabChange}
                />
              </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3">
              <div className="min-h-screen lg:min-h-0">
               {ActiveTabComponent && user && (
                  <>
                    <ActiveTabComponent
                      user={user}
                      onDataChange={handleDataChange}
                      hasUnsavedChanges={hasUnsavedChanges}
                      // Add these two lines:
                      accessToken={accessToken}
                      showToast={showToast}
                    />

                    {activeTab === 'profile' && hasUnsavedChanges && (
                      <div className="mt-6 flex justify-end">
                        <button
                          onClick={handleManualSave}
                          className="btn-primary px-4 py-2 rounded-md"
                          disabled={autoSaveStatus === 'saving'}
                        >
                          {autoSaveStatus === 'saving' ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    )}
                  </>
                )}

              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
    {toast && (
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(null)}
      />
    )}  

    </>
  );
};

export default UserProfileSettings;