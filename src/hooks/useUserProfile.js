// hooks/useUserProfile.js
import { useQuery } from '@tanstack/react-query';
import { getUserProfile } from '../services/api';

export const useUserProfile = (accessToken, logout) => {
  return useQuery({
    queryKey: ['userProfile', accessToken],
    queryFn: () => getUserProfile(accessToken),
    enabled: !!accessToken, // don't run if no token
    throwOnError: (err) => {
      console.error('Error fetching user data:', err);
      if (err.message.includes('401')) {
        logout();
      }
      return false; // Don't throw, handle gracefully
    }
  });
};