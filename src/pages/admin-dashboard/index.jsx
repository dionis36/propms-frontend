// src/pages/admin-dashboard/index.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from '../../components/ui/Header';
import AdminStatsOverview from './components/AdminStatsOverview';
import UserStats from './components/UserStats';
import PropertyOverview from './components/PropertyOverview';
import BrokerOverview from './components/BrokerOverview';
import QuickModeration from './components/QuickModeration';
import RecentAdminActivity from './components/RecentAdminActivity';
import { Helmet } from 'react-helmet-async';

// Standard Tailwind Icons (using heroicons style)
const Icons = {
  Menu: ({ className = "w-6 h-6" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  X: ({ className = "w-6 h-6" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  ChevronLeft: ({ className = "w-6 h-6" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  ),
  ChevronRight: ({ className = "w-6 h-6" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  ),
  Dashboard: ({ className = "w-6 h-6" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
    </svg>
  ),
  Chart: ({ className = "w-6 h-6" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  Users: ({ className = "w-6 h-6" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m3 5.197V9a3 3 0 00-6 0v2.967" />
    </svg>
  ),
  Building: ({ className = "w-6 h-6" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  Briefcase: ({ className = "w-6 h-6" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6" />
    </svg>
  ),
  Shield: ({ className = "w-6 h-6" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  Clock: ({ className = "w-6 h-6" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  ExternalLink: ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  )
};

const AdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [pendingActions, setPendingActions] = useState({
    brokerVerifications: 5,
    flaggedListings: 3,
    userReports: 7
  });
  const [activeComponent, setActiveComponent] = useState(null);
  const [panelState, setPanelState] = useState('hidden'); // Start with hidden on mobile
  const [isMobile, setIsMobile] = useState(false);
  const panelRef = useRef(null);
  const notificationTimerRef = useRef(null);

  // Improved responsive handling
  useEffect(() => {
    const handleResize = () => {
      const mobileCheck = window.innerWidth < 1024;
      const wasMobile = isMobile;
      setIsMobile(mobileCheck);
      
      // Handle panel state transitions between mobile and desktop
      if (!wasMobile && mobileCheck) {
        // Switching to mobile - hide panel
        setPanelState('hidden');
      } else if (wasMobile && !mobileCheck) {
        // Switching to desktop - show collapsed panel
        setPanelState('collapsed');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile]);

  // Initialize panel state on mount
  useEffect(() => {
    const isDesktop = window.innerWidth >= 1024;
    setPanelState(isDesktop ? 'collapsed' : 'hidden');
  }, []);

  useEffect(() => {
    // Simulate initial data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);

    // Simulate real-time admin notifications
    notificationTimerRef.current = setInterval(() => {
      const mockNotifications = [
        'New broker verification request submitted',
        'Property listing flagged for review',
        'User account requires moderation',
        'System backup completed successfully',
        'New user registration spike detected'
      ];
      const randomNotification = mockNotifications[Math.floor(Math.random() * mockNotifications.length)];
      setNotifications(prev => [{
        id: Date.now(),
        message: randomNotification,
        timestamp: new Date(),
        type: 'info'
      }, ...prev.slice(0, 9)]);
    }, 45000);

    return () => {
      clearTimeout(timer);
      if (notificationTimerRef.current) {
        clearInterval(notificationTimerRef.current);
      }
    };
  }, []);

  const handleModerationAction = useCallback((actionType, itemId) => {
    console.log(`Admin action ${actionType} for item:`, itemId);
    setPendingActions(prev => ({
      ...prev,
      [actionType]: Math.max(0, prev[actionType] - 1)
    }));
  }, []);

  const handleBulkAction = useCallback((actionType, selectedItems) => {
    console.log(`Bulk admin action ${actionType} for items:`, selectedItems);
    // Implement bulk moderation logic
  }, []);

  const renderComponent = useCallback((componentName) => {
    const commonProps = { expanded: !!activeComponent };
    
    switch(componentName) {
      case 'userStats':
        return <UserStats {...commonProps} />;
      case 'propertyOverview':
        return <PropertyOverview {...commonProps} />;
      case 'brokerOverview':
        return <BrokerOverview 
          {...commonProps}
          onModerationAction={handleModerationAction} 
        />;
      case 'quickModeration':
        return (
          <QuickModeration 
            {...commonProps}
            pendingActions={pendingActions}
            onModerationAction={handleModerationAction}
            onBulkAction={handleBulkAction}
          />
        );
      case 'recentAdminActivity':
        return <RecentAdminActivity 
          {...commonProps}
          notifications={notifications} 
        />;
      case 'adminStats':
        return <AdminStatsOverview {...commonProps} />;
      default:
        return null;
    }
  }, [activeComponent, pendingActions, notifications, handleModerationAction, handleBulkAction]);

  const getComponentTitle = useCallback((componentName) => {
    const titles = {
      adminStats: 'System Overview',
      userStats: 'User Statistics',
      propertyOverview: 'Property Insights',
      brokerOverview: 'Broker Management',
      quickModeration: 'Moderation Center',
      recentAdminActivity: 'Activity Log'
    };
    return titles[componentName] || 'Dashboard Component';
  }, []);

  const togglePanel = useCallback((newState) => {
    if (newState) {
      setPanelState(newState);
    } else {
      setPanelState(prev => {
        if (prev === 'expanded') return 'collapsed';
        if (prev === 'collapsed') return 'hidden';
        return 'expanded';
      });
    }
  }, []);

  const handleComponentSelect = useCallback((component) => {
    setActiveComponent(component);
    if (isMobile) {
      setPanelState('hidden');
    }
  }, [isMobile]);

  const handleBackToDashboard = useCallback(() => {
    setActiveComponent(null);
    if (isMobile) {
      setPanelState('hidden');
    }
  }, [isMobile]);

  // Component configuration with proper icons
  const components = [
    { 
      id: 'adminStats', 
      name: 'System Overview', 
      shortName: 'System',
      icon: Icons.Chart, 
      color: 'bg-blue-100 text-blue-600' 
    },
    { 
      id: 'userStats', 
      name: 'User Statistics', 
      shortName: 'Users',
      icon: Icons.Users, 
      color: 'bg-purple-100 text-purple-600' 
    },
    { 
      id: 'propertyOverview', 
      name: 'Property Insights', 
      shortName: 'Properties',
      icon: Icons.Building, 
      color: 'bg-green-100 text-green-600' 
    },
    { 
      id: 'brokerOverview', 
      name: 'Broker Management', 
      shortName: 'Brokers',
      icon: Icons.Briefcase, 
      color: 'bg-orange-100 text-orange-600' 
    },
    { 
      id: 'quickModeration', 
      name: 'Moderation Center', 
      shortName: 'Moderate',
      icon: Icons.Shield, 
      color: 'bg-red-100 text-red-600' 
    },
    { 
      id: 'recentAdminActivity', 
      name: 'Activity Log', 
      shortName: 'Activity',
      icon: Icons.Clock, 
      color: 'bg-indigo-100 text-indigo-600' 
    },
  ];

  if (isLoading) {
    return (
      <>
      <Helmet>
        <title>Admin Dashboard | EstateHub</title>
        <meta name="description" content="Find your dream property with EstateHub." />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-16 lg:pt-18">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Dashboard Skeleton */}
            <div className="mb-8">
              <div className="h-8 bg-secondary-100 rounded w-1/3 mb-4 animate-pulse"></div>
              <div className="h-4 bg-secondary-100 rounded w-1/2 animate-pulse"></div>
            </div>
            
            {/* Stats Overview Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-surface p-6 rounded-lg shadow-elevation-1">
                  <div className="h-4 bg-secondary-100 rounded w-1/2 mb-2 animate-pulse"></div>
                  <div className="h-8 bg-secondary-100 rounded w-3/4 animate-pulse"></div>
                </div>
              ))}
            </div>
            
            {/* Content Grid Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="h-64 bg-secondary-100 rounded-lg animate-pulse"></div>
                <div className="h-96 bg-secondary-100 rounded-lg animate-pulse"></div>
              </div>
              <div className="space-y-8">
                <div className="h-64 bg-secondary-100 rounded-lg animate-pulse"></div>
                <div className="h-64 bg-secondary-100 rounded-lg animate-pulse"></div>
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
      <Helmet>
        <title>Admin Dashboard | EstateHub</title>
        <meta name="description" content="Find your dream property with EstateHub." />
      </Helmet>
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Mobile Panel Toggle */}
      {isMobile && (
        <div className="fixed bottom-4 right-4 z-40">
          <button
            onClick={() => togglePanel(panelState === 'hidden' ? 'expanded' : 'hidden')}
            className="bg-primary text-white p-3 rounded-full shadow-lg hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label={panelState !== 'hidden' ? "Close panel" : "Open panel"}
          >
            {panelState !== 'hidden' ? <Icons.X className="w-6 h-6" /> : <Icons.Menu className="w-6 h-6" />}
          </button>
        </div>
      )}

      <div className="flex pt-16 lg:pt-18">
        {/* Side Panel */}
        <div 
          ref={panelRef}
          className={`
            fixed lg:sticky top-16 lg:top-18 bottom-0 left-0 z-30
            bg-surface shadow-elevation-2 lg:shadow-none lg:border-r lg:border-divider
            transition-all duration-300 ease-in-out
            overflow-y-auto
            ${panelState === 'hidden' ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'}
            ${panelState === 'expanded' ? 'w-64' : panelState === 'collapsed' ? 'w-20' : 'w-0 lg:w-20'}
            ${panelState === 'hidden' && !isMobile ? 'lg:w-0' : ''}
          `}
          style={{ height: isMobile ? 'calc(100vh - 4rem)' : 'calc(100vh - 4.5rem)' }}
        >
          {/* Panel Header */}
          <div className="p-4 border-b border-divider flex justify-between items-center">
            {panelState === 'expanded' ? (
              <h2 className="text-lg font-bold text-text-primary">Dashboard</h2>
            ) : (
              <div className="w-8 h-8 flex items-center justify-center">
                <Icons.Dashboard className="w-6 h-6 text-primary" />
              </div>
            )}
            
            <div className="flex space-x-1">
              {!isMobile && (
                <button 
                  onClick={() => togglePanel(panelState === 'expanded' ? 'collapsed' : 'expanded')}
                  className="text-text-secondary hover:text-primary focus:outline-none p-1 rounded-full hover:bg-secondary-50 transition-colors"
                  aria-label={panelState === 'expanded' ? "Collapse panel" : "Expand panel"}
                >
                  {panelState === 'expanded' ? (
                    <Icons.ChevronLeft className="w-5 h-5" />
                  ) : (
                    <Icons.ChevronRight className="w-5 h-5" />
                  )}
                </button>
              )}
              {isMobile && (
                <button 
                  onClick={() => togglePanel('hidden')}
                  className="text-text-secondary hover:text-primary focus:outline-none p-1 rounded-full hover:bg-secondary-50 transition-colors"
                  aria-label="Close panel"
                >
                  <Icons.X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
          
          {/* Navigation Items */}
          <nav className="p-2">
            <ul className="space-y-1">
              {components.map((component) => {
                const IconComponent = component.icon;
                return (
                  <li key={component.id}>
                    <button
                      onClick={() => handleComponentSelect(component.id)}
                      className={`
                        w-full flex items-center space-x-3
                        transition-all duration-200
                        px-3 py-3 rounded-lg
                        hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset
                        ${activeComponent === component.id ? 'bg-primary-50 border-l-4 border-primary text-primary' : 'text-text-primary'}
                      `}
                    >
                      <div className={`${activeComponent === component.id ? 'bg-primary-100 text-primary' : component.color} w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      {panelState === 'expanded' && (
                        <span className="font-medium text-left truncate">
                          {component.shortName}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* Panel Overlay (mobile only) */}
        {panelState !== 'hidden' && isMobile && (
          <div 
            className="fixed inset-0 z-20 bg-black bg-opacity-50"
            onClick={() => togglePanel('hidden')}
          />
        )}

        {/* Main Content Area */}
        <main className={`
          flex-1 transition-all duration-300 min-h-0
          ${!isMobile && panelState !== 'hidden' ? (
            panelState === 'expanded' ? 'lg:ml-0' : 'lg:ml-0'
          ) : 'lg:ml-0'}
        `}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {activeComponent ? (
              // Expanded Component View
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={handleBackToDashboard}
                    className="flex items-center text-primary hover:text-primary-700 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md px-2 py-1"
                  >
                    <Icons.ChevronLeft className="w-5 h-5 mr-1" />
                    Back to Dashboard
                  </button>
                  <h1 className="text-2xl font-bold text-text-primary">
                    {getComponentTitle(activeComponent)}
                  </h1>
                  <div className="w-32"></div> {/* Spacer for alignment */}
                </div>
                
                <div className="bg-surface rounded-xl shadow-elevation-1 overflow-hidden">
                  {renderComponent(activeComponent)}
                </div>
              </div>
            ) : (
              // Default Dashboard View
              <>
                {/* Dashboard Header */}
                <div className="mb-8">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <h1 className="text-3xl font-bold text-text-primary font-heading mb-2">
                        Admin Dashboard
                      </h1>
                      <p className="text-text-secondary">
                        System oversight and marketplace management
                      </p>
                    </div>
                    <div className="mt-4 md:mt-0 flex items-center space-x-3">
                      {(pendingActions?.brokerVerifications > 0 || pendingActions?.flaggedListings > 0 || pendingActions?.userReports > 0) && (
                        <div className="bg-warning-100 text-warning-800 px-3 py-2 rounded-md text-sm font-medium">
                          {Object.values(pendingActions).reduce((a, b) => a + b, 0)} pending actions
                        </div>
                      )}
                      <button className="bg-primary text-white px-6 py-3 rounded-md font-medium hover:bg-primary-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 shadow-elevation-1">
                        Export Reports
                      </button>
                    </div>
                  </div>
                </div>

                {/* Admin Stats Overview */}
                <div className="mb-8">
                  <AdminStatsOverview expanded={false} />
                </div>

                {/* Traditional Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Main Content Area */}
                  <div className="lg:col-span-2 space-y-8">
                    {/* User and Property Stats */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-6">
                      {/* <UserStats /> */}
                      <div>
                        <div onClick={() => handleComponentSelect('brokerOverview')} className="cursor-pointer" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', marginBottom: '8px', marginRight: '8px' }}>
                          <Icons.ExternalLink className="w-4 h-4 text-text-secondary hover:text-primary transition-colors" />
                        </div>
                          <UserStats expanded={false} />
                      </div>

                      {/* Property Overview */}
                      <div>
                        <div onClick={() => handleComponentSelect('brokerOverview')} className="cursor-pointer" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', marginBottom: '8px', marginRight: '8px' }}>
                          <Icons.ExternalLink className="w-4 h-4 text-text-secondary hover:text-primary transition-colors" />
                        </div>
                        <PropertyOverview expanded={false} />
                      </div>

                    </div>
                    
                    {/* Broker Overview */}
                    <div>
                      <div onClick={() => handleComponentSelect('brokerOverview')} className="cursor-pointer" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', marginBottom: '8px', marginRight: '8px' }}>
                        <Icons.ExternalLink className="w-4 h-4 text-text-secondary hover:text-primary transition-colors" />
                      </div>
                      <BrokerOverview 
                        expanded={false} 
                        onModerationAction={handleModerationAction} 
                      />
                    </div>
                    
                    {/* Quick Moderation */}
                    <div>
                      <div onClick={() => handleComponentSelect('brokerOverview')} className="cursor-pointer" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', marginBottom: '8px', marginRight: '8px' }}>
                        <Icons.ExternalLink className="w-4 h-4 text-text-secondary hover:text-primary transition-colors" />
                      </div>
                      <QuickModeration 
                        expanded={false}
                        pendingActions={pendingActions}
                        onModerationAction={handleModerationAction}
                        onBulkAction={handleBulkAction}
                      />
                    </div>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-8">
                    {/* Recent Admin Activity */}
                    <div>
                      <div onClick={() => handleComponentSelect('brokerOverview')} className="cursor-pointer" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', marginBottom: '8px', marginRight: '8px' }}>
                        <Icons.ExternalLink className="w-4 h-4 text-text-secondary hover:text-primary transition-colors" />
                      </div>
                      <RecentAdminActivity 
                        expanded={false} 
                        notifications={notifications} 
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
    </>
  );
};

export default AdminDashboard;