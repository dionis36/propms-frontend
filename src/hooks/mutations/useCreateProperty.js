// src\hooks\mutations\useCreateProperty.js

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createProperty } from '../../services/api';

export default function useCreateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ payload, token }) => createProperty(payload, token),
    onSuccess: () => {
      queryClient.invalidateQueries(['properties']);
    }
  });
}
