import { useQuery } from '@tanstack/react-query';
import { getAllProperties } from '../services/api';

export const useAllProperties = (filters = {}) => {
  return useQuery({
    queryKey: ['allProperties', filters],
    queryFn: () => getAllProperties({ filters }),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};