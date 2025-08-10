// src/hooks/useDeleteProperty.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteProperty } from '../../services/api';

export function useDeleteProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ propertyId, token }) => {
      console.log('🗑 Deleting property...', propertyId);
      // Now passing the token to the API function
      return await deleteProperty(propertyId, token);
    },
    onSuccess: () => {
      console.log('✅ Property deleted successfully');
      queryClient.invalidateQueries(['properties']);
    },
    onError: (error) => {
      console.error('❌ Error deleting property:', error);
      throw error;
    },
  });
}