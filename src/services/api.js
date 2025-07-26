// src/services/api.js

export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';


/**
 * Generic helper function to make API requests.
 * Handles headers, JSON stringification, FormData, and basic error handling.
 * @param {string} url - The full URL for the API endpoint.
 * @param {string} method - The HTTP method (e.g., 'GET', 'POST', 'PUT', 'PATCH', 'DELETE').
 * @param {Object|FormData|null} data - The request body data. Can be an object (will be JSON stringified) or FormData.
 * @param {string|null} token - The authorization token, if required.
 * @returns {Promise<Object|string|null>} The parsed JSON response, raw text, or null for 204 No Content.
 * @throws {Error} Throws an error object with status and data properties on API failure or network issues.
 */
async function makeRequest(url, method, data = null, token = null) {
  console.log('🌐 API Request:', url);
  console.trace('📍 Called from:'); // Helps trace where the API call originated

  const headers = {};

  // Only set 'Content-Type': 'application/json' for non-FormData bodies.
  // When sending FormData, the browser automatically sets 'Content-Type' to 'multipart/form-data'
  // along with the correct boundary, so we should not set it manually.
  if (!(data instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  // Add Authorization header if a token is provided
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method: method,
    headers: headers,
  };

  // Attach the request body if data is provided
  if (data) {
    // If data is FormData, send it directly. Otherwise, stringify it for JSON.
    config.body = data instanceof FormData ? data : JSON.stringify(data);
  }

  const response = await fetch(url, config);

  // --- Error Handling for Non-OK Responses (status code not in 2xx range) ---
  if (!response.ok) {
    let errorData;
    let errorMessage = 'Request failed'; // Default error message

    try {
      // Attempt to parse error response as JSON for detailed error messages
      errorData = await response.json();
      // Prioritize 'detail' field, otherwise stringify the entire error object
      errorMessage = errorData.detail || JSON.stringify(errorData);
    } catch (e) {
      // If JSON parsing fails, try to get the response as plain text
      const errorText = await response.text();
      errorMessage = errorText || 'Request failed with no readable body'; // Fallback message
    }

    // Create a custom Error object with status and original error data
    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = errorData; // Attach original error data for more granular handling upstream

    console.error('🚨 API Error:', {
      url,
      method,
      status: response.status,
      errorMessage,
      errorData
    });
    throw error; // Re-throw the extended error
  }

  // --- Success Response Handling ---

  // Handle 204 No Content specifically, as there's no body to parse
  if (response.status === 204) {
    console.log(`✅ API Success (204 No Content): ${url}`);
    return null; // Indicate success with no content
  }

  // Check content type to determine how to parse the response body
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    console.log(`✅ API Success (JSON): ${url}`);
    return response.json(); // Parse as JSON
  } else {
    console.log(`✅ API Success (Text/Other): ${url}`);
    return response.text(); // Parse as plain text or other non-JSON content
  }
}


// loginUser function to authenticate a user
export const loginUser = async (email, password) => {
    // Uses makeRequest for consistency
    const response = await makeRequest(`${API_BASE}/api/token/`, 'POST', { email, password });
    return response;
};

// getUserProfile function to fetch the user's profile
export const getUserProfile = async (accessToken) => {
    // Uses makeRequest for consistency
    return makeRequest(`${API_BASE}/api/users/me/`, 'GET', null, accessToken);
};


// This function updates the user profile with the provided data
export async function updateUserProfile(token, payload) {
    console.log('🧪 About to PATCH user profile with:', payload);
    // Uses makeRequest for consistency
    return makeRequest(`${API_BASE}/api/users/me/`, 'PATCH', payload, token);
}


// This function changes the user's password
export const changeUserPassword = async (accessToken, data) => {
    // Uses makeRequest for consistency, removing redundant try/catch and error parsing
    return makeRequest(`${API_BASE}/api/users/change-password/`, 'PATCH', data, accessToken);
};


// Handles user registration.
export const registerUser = async (userData) => {
    // Uses makeRequest for consistency
    const url = `${API_BASE}/api/register/`;
    return makeRequest(url, 'POST', userData); // No token needed for public registration
};


// Property related API calls
export const createProperty = async (formData, token) => {
    // The makeRequest function now handles FormData correctly.
    // No need to manually set 'Content-Type': 'multipart/form-data' as fetch does it automatically for FormData.
    return makeRequest(`${API_BASE}/api/property/submit/`, 'POST', formData, token);
};

// UPDATE PROPERTY - Add this function
export const updateProperty = async (propertyId, formData, token) => {
    console.log('🔄 Updating property:', propertyId);
    // Use PUT method to update the entire property resource
    // FormData is handled correctly by makeRequest function
    return makeRequest(`${API_BASE}/api/properties/${propertyId}/`, 'PUT', formData, token);
};

// DELETE PROPERTY - Add this function  
export const deleteProperty = async (propertyId, token) => {
    console.log('🗑️ Deleting property:', propertyId);
    // DELETE method with no body data needed
    return makeRequest(`${API_BASE}/api/properties/${propertyId}/`, 'DELETE', null, token);
};

// ALTERNATIVE: If your backend uses PATCH for partial updates instead of PUT
export const patchProperty = async (propertyId, formData, token) => {
    console.log('🔄 Patching property:', propertyId);
    // Use PATCH method for partial updates
    return makeRequest(`${API_BASE}/api/properties/${propertyId}/`, 'PATCH', formData, token);
};

// BULK DELETE - If you need to delete multiple properties
export const deleteMultipleProperties = async (propertyIds, token) => {
    console.log('🗑️ Bulk deleting properties:', propertyIds);
    // Send array of property IDs in request body
    return makeRequest(`${API_BASE}/api/properties/bulk-delete/`, 'DELETE', { property_ids: propertyIds }, token);
};

// TOGGLE PROPERTY STATUS - If you have a separate endpoint for status changes
export const togglePropertyStatus = async (propertyId, status, token) => {
    console.log('🔄 Toggling property status:', propertyId, 'to', status);
    // PATCH just the status field
    return makeRequest(`${API_BASE}/api/properties/${propertyId}/status/`, 'PATCH', { status }, token);
};



// display property details
export const getPropertyDetails = async (propertyId, token = null) => {
  try {
    // Use makeRequest for consistency
    // The URL is constructed using API_BASE and the propertyId
    // The method is 'GET', no data is sent in the body, and the token is passed
    return await makeRequest(`${API_BASE}/api/properties/${propertyId}/`, 'GET', null, token);
  } catch (error) {
    console.error('Error fetching property details:', error);
    // Re-throw the error so calling components can handle it
    throw error;
  }
};

// Get broker's own listings
export const getMyProperties = async (token) => {
  // Use makeRequest for consistency and error handling
  return makeRequest(`${API_BASE}/api/properties/my-properties/`, 'GET', null, token);
};

export const getPropertyById = async (id, token) => {
  // Refactored to use the makeRequest helper for consistency.
  // This ensures proper error handling, token inclusion, and API_BASE usage.
  return makeRequest(`${API_BASE}/api/properties/${id}/`, 'GET', null, token);
};

export const getAllProperties = async () => {
  // Use makeRequest for consistency and centralized error handling
  // No token is passed as this is assumed to be a public endpoint.
  return makeRequest(`${API_BASE}/api/properties/`, 'GET', null, null);
};

// Save a property to favorites
export const saveFavorite = (propertyId, accessToken) => {
  return makeRequest(`${API_BASE}/api/favorites/`, 'POST', { property_id: propertyId }, accessToken);
};

// Remove a favorite by property ID (using the custom DRF view)
export const removeFavorite = (propertyId, accessToken) => {
  // DELETE request typically does not have a body, so data is null
  return makeRequest(`${API_BASE}/api/favorites/remove-by-property/${propertyId}/`, 'DELETE', null, accessToken);
};

// Get all favorites for the logged-in tenant
export const getFavorites = (accessToken) => {
  return makeRequest(`${API_BASE}/api/favorites/`, 'GET', null, accessToken);
};



