import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import { useAuth } from '../../contexts/AuthContext'; // Added AuthContext import
import UserAvatar from '../ui/UserAvatar'; // Added UserAvatar import
import { useToast } from '../../contexts/ToastContext'; // Adjust path
import StatusBadge from '../StatusBadge';



const Header = () => {
 const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const userMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const { showToast } = useToast();


  // Get authentication state from context
  const { user, isAuthenticated, logout } = useAuth(); // Added auth context


  const navigationItems = [
    {
      label: 'Search Properties',
      path: '/property-listings',
      icon: 'Search',
      roles: ['all']
    },
    {
      label: 'Dashboard',
      path: '/agent-dashboard',
      icon: 'LayoutDashboard',
      roles: ['broker']
    },
    // Add new dashboard item for admin
    {
      label: 'Dashboard',
      path: '/admin-dashboard',
      icon: 'LayoutDashboard',
      roles: ['admin']
    },
    {
      label: 'Dashboard',
      path: '/tenant-dashboard',
      icon: 'LayoutDashboard',
      roles: ['tenant']
    }
  ];

const userMenuItems = [
    {
      label: 'Profile & Settings',
      path: '/user-profile-settings',
      icon: 'User'
    },
    {
      label: 'Sign Out',
      action: 'logout',
      icon: 'LogOut'
    }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to property listings with search query
      window.location.href = `/property-listings?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleUserAction = (action) => {
    if (action === 'logout') {
      logout(); // Use logout from AuthContext
    }
    showToast("Logged Out 👌", "info");

    setIsUserMenuOpen(false);
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const shouldShowNavItem = (roles) => {
    // Handle case when user is not authenticated
    if (!isAuthenticated || !user?.role) return roles.includes('all');
    
    return roles.includes('all') || roles.includes(user.role.toLowerCase());
  };

  return (
    <>
      {/* Backdrop blur overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-md z-[9998] md:hidden"
          style={{ backdropFilter: 'blur(8px) saturate(150%)' }}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* Header with backdrop blur */}
      <header className="fixed top-0 left-0 right-0 backdrop-blur-sm bg-surface/90 border-b border-border/50 z-[9999]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-18">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link 
                to="/homepage" 
                className="flex items-center space-x-2 micro-interaction"
                aria-label="EstateHub - Go to homepage"
              >
                <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                  <Icon name="Home" size={20} color="white" />
                </div>
                <span className="text-xl font-semibold text-text-primary font-heading">
                  EstateHub
                </span>
              </Link>
            </div>

            {/* Desktop Search Bar */}
            <div className="hidden md:flex flex-1 max-w-lg mx-8">
              <form onSubmit={handleSearchSubmit} className="w-full">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icon 
                      name="Search" 
                      size={20} 
                      className={`transition-colors duration-200 ${
                        isSearchFocused ? 'text-primary' : 'text-secondary'
                      }`}
                    />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    placeholder="Search properties by location, type, or price..."
                    className="block w-full pl-10 pr-4 py-2 border border-border rounded-md 
                             focus:border-border-focus focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 
                             transition-all duration-200 ease-out bg-background text-text-primary
                             placeholder-text-secondary"
                  />
                </div>
              </form>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {navigationItems.map((item) => (
                shouldShowNavItem(item.roles) && (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium 
                             transition-all duration-200 ease-out micro-interaction
                             ${isActiveRoute(item.path)
                               ? 'bg-primary-100 text-primary border border-primary-500' :'text-text-secondary hover:text-text-primary hover:bg-secondary-100'
                             }`}
                  >
                    <Icon name={item.icon} size={18} />
                    <span>{item.label}</span>
                  </Link>
                )
              ))}
            </nav>

            {/* User Menu & Mobile Menu Button */}
            <div className="flex items-center space-x-4">
               {/* User Menu */}
              {isAuthenticated ? ( // Use isAuthenticated from context
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="hidden md:flex items-center space-x-2 p-2 rounded-md hover:bg-secondary-100 transition-all duration-200 ease-out micro-interaction"
                    aria-expanded={isUserMenuOpen}
                    aria-haspopup="true"
                  >
                    
                    <UserAvatar
                      firstName={user?.first_name}
                      lastName={user?.last_name}
                    />

                    <Icon 
                      name="ChevronDown" 
                      size={16} 
                      className={`transition-transform duration-200 ${
                        isUserMenuOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* User Dropdown with smooth animation */}
                  <div className={`absolute right-0 mt-2 w-56 bg-surface rounded-md shadow-elevation-3 
                                border border-border z-dropdown transition-all duration-300 ease-out origin-top-right
                                ${isUserMenuOpen 
                                  ? 'opacity-100 scale-100 translate-y-0' 
                                  : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                                }`}>
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm font-medium text-text-primary">
                        {(user?.first_name || '') + ' ' + (user?.last_name || '') || 'User'}
                      </p>

                      <p className="text-xs text-text-secondary capitalize"><StatusBadge status={user?.role}></StatusBadge></p>
                    </div>
                    <div className="py-1">
                      {userMenuItems.map((item) => (
                        <div key={item.label}>
                          {item.path ? (
                            <Link
                              to={item.path}
                              className="flex items-center space-x-3 px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-secondary-100 transition-colors duration-200"
                            >
                              <Icon name={item.icon} size={16} />
                              <span>{item.label}</span>
                            </Link>
                          ) : (
                            <button
                              onClick={() => handleUserAction(item.action)}
                              className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-secondary-100 transition-colors duration-200"
                            >
                              <Icon name={item.icon} size={16} />
                              <span>{item.label}</span>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="hidden md:flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="text-sm font-medium text-text-secondary hover:text-text-primary 
                             transition-colors duration-200"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium 
                             hover:bg-primary-700 transition-all duration-200 ease-out micro-interaction"
                  >
                    Get Started
                  </Link>
                </div>
              )}

              {/* Mobile: Combined User/Menu Button */}
              <div className="md:hidden relative" ref={mobileMenuRef}>
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-md hover:bg-secondary-100 transition-all duration-200 ease-out"
                  aria-expanded={isMobileMenuOpen}
                  aria-label="Toggle mobile menu"
                >
                  {isAuthenticated ? (
                    <>
                      <UserAvatar
                        firstName={user?.first_name}
                        lastName={user?.last_name}
                      />
                      <Icon 
                        name={isMobileMenuOpen ? "X" : "Menu"} 
                        size={20} 
                      />
                    </>
                  ) : (
                    // Add placeholder user icon for non-authenticated users
                    <div className="w-10 h-10 rounded-full bg-secondary-100 flex items-center justify-center">
                      <Icon 
                        name={isMobileMenuOpen ? "X" : "User"} 
                        size={20} 
                        className="text-text-secondary"
                      />
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu with smooth animation and backdrop blur */}
        <div className={`md:hidden transition-all duration-300 ease-out ${
          isMobileMenuOpen 
            ? 'max-h-screen opacity-100' 
            : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <div 
            ref={mobileMenuRef}
            className="bg-surface/98 backdrop-blur-lg border-t border-border/50 z-[9999] shadow-lg"
          >
            {/* Add user info section for mobile */}
            {isAuthenticated && (
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-medium text-text-primary">
                  {(user?.first_name || '') + ' ' + (user?.last_name || '') || 'User'}
                </p>
                <p className="text-xs text-text-secondary capitalize"><StatusBadge status={user?.role}></StatusBadge></p>
              </div>
            )}
            
            <div className="px-4 py-3 space-y-1">
              {/* Navigation items */}
              {navigationItems.map((item) => (
                shouldShowNavItem(item.roles) && (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium 
                             transition-all duration-200 ease-out
                             ${isActiveRoute(item.path)
                               ? 'bg-primary-100 text-primary border border-primary-500' :'text-text-secondary hover:text-text-primary hover:bg-secondary-100'
                             }`}
                  >
                    <Icon name={item.icon} size={20} />
                    <span>{item.label}</span>
                  </Link>
                )
              ))}

               {/* User menu items for authenticated users */}
              {isAuthenticated && ( // Use isAuthenticated from context
                <>
                  
                  <div className="border-t border-border my-2"></div>
                  {userMenuItems.map((item) => (
                    <div key={item.label}>
                      {item.path ? (
                        <Link
                          to={item.path}
                          className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-text-secondary hover:text-text-primary hover:bg-secondary-100 transition-colors duration-200"
                        >
                          <Icon name={item.icon} size={20} />
                          <span>{item.label}</span>
                        </Link>
                      ) : (
                        <button
                          onClick={() => {
                            handleUserAction(item.action);
                            setIsMobileMenuOpen(false);
                          }}
                          className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-text-secondary hover:text-text-primary hover:bg-secondary-100 transition-colors duration-200 text-left"
                        >
                          <Icon name={item.icon} size={20} />
                          <span>{item.label}</span>
                        </button>
                      )}
                    </div>
                  ))}
                </>
              )}

              {/* Auth links for unauthenticated users */}
              {!isAuthenticated && ( // Use isAuthenticated from context
                <>
                  <div className="border-t border-border my-2"></div>
                  <Link
                    to="/login"
                    className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-text-secondary hover:text-text-primary hover:bg-secondary-100"
                  >
                    <Icon name="LogIn" size={20} />
                    <span>Sign In</span>
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-text-secondary hover:text-text-primary hover:bg-secondary-100"
                  >
                    <Icon name="UserPlus" size={20} />
                    <span>Get Started</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;