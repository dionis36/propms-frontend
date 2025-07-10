import { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, getUserProfile } from '../services/api'; // Adjust the import path as necessary
import { API_BASE } from '../services/api'; // ✅ Added to use full URL for token refresh


const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const navigate = useNavigate();
  const [isInitializing, setIsInitializing] = useState(true);



  // Initialize state from storage on app load
  useEffect(() => {
    const initializeAuth = () => {
      // Try localStorage first (persistent session)
      let storedAccess = localStorage.getItem('accessToken');
      let storedRefresh = localStorage.getItem('refreshToken');
      let storedUser = JSON.parse(localStorage.getItem('user'));

      // Fallback to sessionStorage (temporary session)
      if (!storedAccess) {
        storedAccess = sessionStorage.getItem('accessToken');
        storedRefresh = sessionStorage.getItem('refreshToken');
        storedUser = JSON.parse(sessionStorage.getItem('user'));
      }

      if (storedAccess && storedUser) {
        setAccessToken(storedAccess);
        setRefreshToken(storedRefresh);
        setUser(storedUser);
      }
    };

    initializeAuth();
    setIsInitializing(false);
  }, []);

  // Get dashboard path based on user role
  const getDashboardPath = (role) => {
    switch(role) {
      case 'ADMIN': return '/admin-dashboard';
      case 'BROKER': return '/agent-dashboard';
      case 'TENANT': return '/tenant-dashboard';
      default: return '/';
    }
  };

  const login = async (email, password, rememberMe = true, navigate) => {
  try {
    // 1. Get tokens
    const { access, refresh } = await loginUser(email, password);

    // 2. Get user profile
    const userData = await getUserProfile(access);

    // 3. Update state
    setAccessToken(access);
    setRefreshToken(refresh);
    setUser(userData);

    // 4. Store tokens based on rememberMe preference
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('accessToken', access);
    storage.setItem('refreshToken', refresh);
    storage.setItem('user', JSON.stringify(userData));

    // 5. Redirect to appropriate dashboard
    if (navigate) {
      const redirectPath = getDashboardPath(userData.role);
      navigate(redirectPath);
    }

    return true;
  } catch (error) {
    console.error('Login failed:', error);
    return false;
  }
};

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);

    // Clear both storage types
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('user');

    // Redirect to login page
    navigate('/homepage');
  };


  // Token refresh logic (optional)
  useEffect(() => {
    if (!refreshToken) return; // Don't run if no refresh token exists

    const refreshAccessToken = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/token/refresh/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh: refreshToken })
            });

            if (!res.ok) {
                // If refresh fails (e.g., refresh token expired or invalid)
                throw new Error('Token refresh failed');
            }

            // CRITICAL FIX: Destructure both 'access' and 'refresh' from the response
            const { access, refresh } = await res.json();

            // Update both access and refresh tokens in state
            setAccessToken(access);
            setRefreshToken(refresh); // <--- THIS IS THE KEY ADDITION

            // Update storage where tokens exist (both local and session)
            // Ensure the correct storage is updated for BOTH tokens
            if (localStorage.getItem('accessToken')) { // Check if originally from localStorage
                localStorage.setItem('accessToken', access);
                localStorage.setItem('refreshToken', refresh); // Update new refresh token here
            } else if (sessionStorage.getItem('accessToken')) { // Check if originally from sessionStorage
                sessionStorage.setItem('accessToken', access);
                sessionStorage.setItem('refreshToken', refresh); // Update new refresh token here
            }

        } catch (error) {
            console.error('Token refresh failed:', error);
            // If refresh fails, it means the refresh token is no longer valid.
            // Log out the user.
            logout();
        }
    };
    // Refresh every 4.5 minutes (270000 ms), giving buffer for 10-min access token
    const interval = setInterval(refreshAccessToken, 270000);
    return () => clearInterval(interval);

  }, [refreshToken, logout]);

  const updateUserContext = (updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));

    const storage = localStorage.getItem('accessToken') ? localStorage : sessionStorage;
    storage.setItem('user', JSON.stringify({ ...user, ...updatedData }));
  };



  return (
    <AuthContext.Provider value={{
      user,
      accessToken,
      refreshToken,
      login,
      logout,
      isAuthenticated: !!accessToken,
      updateUserContext,   // ✅ expose updater
      isInitializing       // ✅ expose loading status
    }}>
      {children}
    </AuthContext.Provider>

  );
}

export const useAuth = () => useContext(AuthContext);
