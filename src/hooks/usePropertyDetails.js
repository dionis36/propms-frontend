// src/hooks/usePropertyDetails.js
import { useQuery } from "@tanstack/react-query";
import { getPropertyDetails } from "../services/api";

/**
 * Custom hook to fetch detailed property data with media processing.
 * @param {string|number} propertyId
 * @param {string|null} token - optional auth token
 * @returns {object} query result including transformed data, loading, error states
 */
export function usePropertyDetails(propertyId, token = null) {
  // The useQuery call has been updated to use a single object argument,
  // which is required for TanStack Query v5.
  return useQuery({
    // queryKey is a required property in the new object syntax
    queryKey: ["propertyDetails", propertyId],
    // queryFn is also a required property
    queryFn: async () => {
      if (!propertyId) throw new Error("No property ID provided");

      const data = await getPropertyDetails(propertyId, token);

      // Transform media arrays
      const images = data.media
        .filter((media) => media.image)
        .map((media) => media.image);

      const videos = data.media
        .filter((media) => media.video)
        .map((media) => media.video);

      // Map API response to desired structure
      return {
        ...data,
        daysOnMarket: data.days_since_posted,
        agent_name: data.agent_name,
        agent_email: data.agent_email,
        agent_phone_number: data.agent_phone_number,
        agent_whatsapp_number: data.agent_whatsapp_number,
        agent: {
          name: data.agent_name,
          first_name: data.agent_name ? data.agent_name.split(" ")[0] : "",
          last_name: data.agent_name
            ? data.agent_name.split(" ").slice(1).join(" ")
            : "",
          email: data.agent_email,
          phone: data.agent_phone_number,
        },
        images,
        videos,
      };
    },
    // The options are now also part of this single object
    enabled: !!propertyId, // don't fetch if no propertyId
    staleTime: 1000 * 60 * 5, // cache 5 minutes
    retry: 1, // retry once on failure
  });
}
