import { useQuery } from "@tanstack/react-query";
import { getMyProperties } from "../services/api";

/**
 * Custom hook to fetch the current user's properties.
 * @param {string} accessToken - JWT or auth token
 * @param {function} formatListings - optional formatter
 */
export function useMyProperties(accessToken, formatListings) {
  return useQuery({
    queryKey: ["myProperties", accessToken],
    queryFn: async () => {
      if (!accessToken) throw new Error("No access token provided");
      const data = await getMyProperties(accessToken);
      return formatListings ? formatListings(data) : data;
    },
    enabled: !!accessToken,       // don't fetch unless logged in
    staleTime: 1000 * 60 * 2,     // cache for 2 min
    retry: 1,                     // retry once if it fails
  });
}