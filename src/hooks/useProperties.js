// src/hooks/useProperties.js
import { useQuery } from "@tanstack/react-query";
import { getAllProperties } from "../services/api";

/**
 * Custom hook for fetching properties with caching and filtering.
 * 
 * @param {Object} params - Query params: page, limit, filters
 * @returns React Query result object
 */
export function useProperties({ page = 1, limit = 10, filters = {} }) {
  return useQuery({
    queryKey: ["properties", page, limit, filters],
    queryFn: () => getAllProperties({ page, limit, filters }),
    keepPreviousData: true, // Keeps old data while fetching new
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}

