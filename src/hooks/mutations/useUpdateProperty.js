// src\hooks\mutations\useUpdateProperty.js

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProperty } from '../../services/api';

export default function useUpdateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload, token }) => updateProperty(id, payload, token),
    onSuccess: () => {
      queryClient.invalidateQueries(['properties']);
    }
  });
}
