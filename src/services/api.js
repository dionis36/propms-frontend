// src/services/api.js

export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

// Import jwt-decode if you're using it in loginUser
// You'll need to install it: npm install jwt-decode
// const jwtDecode = (await import('jwt-decode')).default; // Example of dynamic import if needed

/**
 * Helper function for making general API requests.
 * Encapsulates fetch, header setup, JSON parsing, and robust error handling.
 *
 * @param {string} url - The full URL of the API endpoint.
 * @param {string} method - The HTTP method (e.g., 'GET', 'POST', 'PATCH').
 * @param {object} [data=null] - The request body data (for POST, PATCH, PUT).
 * @param {string} [token=null] - Optional JWT access token for Authorization header.
 * @returns {Promise<object|string>} - The parsed JSON response or raw text.
 * @throws {Error} - Throws an error object with status and parsed error data.
 */
async function makeRequest(url, method, data = null, token = null) {
  const headers = {};

  // Only set JSON content type for non-FormData
  if (!(data instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method: method,
    headers: headers,
  };

  if (data) {
    config.body = data instanceof FormData ? data : JSON.stringify(data);
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    let errorData;
    let errorMessage = 'Request failed';

    try {
      errorData = await response.json();
      errorMessage = errorData.detail || JSON.stringify(errorData);
    } catch (e) {
      const errorText = await response.text();
      errorMessage = errorText || 'Request failed with no readable body';
    }

    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = errorData;

    throw error;
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  } else {
    return response.text();
  }
}


// loginUser function to authenticate a user
export const loginUser = async (email, password) => {
    // Uses makeRequest for consistency
    const response = await makeRequest(`${API_BASE}/api/token/`, 'POST', { email, password });

    return response; // Returns the token response directly if no decoding here
};

// getUserProfile function to fetch the user's profile
export const getUserProfile = async (accessToken) => {
    // Uses makeRequest for consistency
    return makeRequest(`${API_BASE}/api/users/me/`, 'GET', null, accessToken);
};


// This function updates the user profile with the provided data
export async function updateUserProfile(token, payload) {
    console.log('🧪 About to PATCH with user:', payload);
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
export const updateProperty = async (propertyId, payload, token) => {
  // Use makeRequest for consistency.
  // The payload (FormData) will be handled correctly by makeRequest.
  return makeRequest(`${API_BASE}/api/properties/${propertyId}/`, 'PATCH', payload, token);
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

// export const getFilteredProperties = async (params = {}) => {
//   const queryString = new URLSearchParams(params).toString();
//   return makeRequest(`${API_BASE}/api/properties/?${queryString}`, 'GET');
// };


// Save a property to favorites
export const saveFavorite = (propertyId, accessToken) => {
  return makeRequest(`${API_BASE}/api/favorites/`, 'POST', { property_id: propertyId }, accessToken);
};

// Remove a favorite by property ID (using the custom DRF view)
export const removeFavorite = (propertyId, accessToken) => {
  return makeRequest(`${API_BASE}/api/favorites/remove-by-property/${propertyId}/`, 'DELETE', null, accessToken);
};

// Get all favorites for the logged-in tenant
export const getFavorites = (accessToken) => {
  return makeRequest(`${API_BASE}/api/favorites/`, 'GET', null, accessToken);
};
