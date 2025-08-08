// src/services/api.js

import axios from 'axios';

// Ensure you have axios installed: npm install axios
export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

/**
 * Generic helper function to make API requests using Axios.
 * This function encapsulates all common logic like headers, authentication,
 * and error handling, so other functions can remain clean.
 * @param {string} url - The full URL for the API endpoint.
 * @param {string} method - The HTTP method (e.g., 'GET', 'POST', 'PUT', 'PATCH', 'DELETE').
 * @param {Object|FormData|null} data - The request body data or URL parameters.
 * @param {string|null} token - The authorization token, if required.
 * @returns {Promise<Object|string|null>} The response data.
 * @throws {Error} Throws an error object with status and data properties on failure.
 */
async function makeRequest(url, method, data = null, token = null) {
  console.log('🌐 API Request:', url);
  console.trace('📍 Called from:');

  const headers = {};

  // Axios handles Content-Type automatically for FormData and JSON,
  // so we just need to add the Authorization header if a token exists.
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Axios config object
  const config = {
    method,
    url,
    headers,
    // Axios uses 'data' for POST/PUT/PATCH and 'params' for GET/DELETE
    // We can conditionally assign the payload.
    // NOTE: This logic assumes 'data' is body for POST/PUT/PATCH and query params for GET/DELETE
    // For more complex cases, you might pass 'params' and 'data' separately.
    [method === 'GET' ? 'params' : 'data']: data,
  };

  try {
    const response = await axios(config);
    console.log(`✅ API Success: ${url}`);
    
    // Axios automatically parses JSON and returns the data directly.
    // No need to manually check content-type or parse.
    // Also, Axios throws an error for non-2xx codes, simplifying the flow.
    return response.data;
  } catch (error) {
    // Axios error object has a structured 'response' field for non-2xx status codes.
    const status = error.response ? error.response.status : null;
    const errorData = error.response ? error.response.data : null;
    const errorMessage = errorData?.detail || error.message;

    console.error('🚨 API Error:', {
      url,
      method,
      status,
      errorMessage,
      errorData,
    });

    // Create a custom Error object for consistency with the original implementation.
    const customError = new Error(errorMessage);
    customError.status = status;
    customError.data = errorData;
    throw customError; // Re-throw the extended error
  }
}

// ============================================================================
// Auth Related API Calls
// The public-facing function signatures remain the same.
// ============================================================================

export const loginUser = async (email, password) => {
  return makeRequest(`${API_BASE}/api/token/`, 'POST', { email, password });
};

export const getUserProfile = async (accessToken) => {
  return makeRequest(`${API_BASE}/api/users/me/`, 'GET', null, accessToken);
};

export async function updateUserProfile(token, payload) {
  console.log('🧪 About to PATCH user profile with:', payload);
  return makeRequest(`${API_BASE}/api/users/me/`, 'PATCH', payload, token);
}

export const changeUserPassword = async (accessToken, data) => {
  return makeRequest(`${API_BASE}/api/users/change-password/`, 'PATCH', data, accessToken);
};

export const registerUser = async (userData) => {
  const url = `${API_BASE}/api/register/`;
  return makeRequest(url, 'POST', userData);
};

// ============================================================================
// Property Related API Calls
// ============================================================================

// export const getAllProperties = async (page = 1, limit = 10) => {
//   const response = await axios.get(`${API_BASE}/api/properties/`, {
//     params: { page, page_size: limit }
//   });
//   return response.data; // { count, next, previous, results: [...] }
// };


export const getAllProperties = async ({ page = 1, limit = 10, filters = {} }) => {
  const params = { page, page_size: limit, ...filters };

  const response = await axios.get(`${API_BASE}/api/properties/`, {
    params
  });

  return response.data; // { count, next, previous, results: [...] }
};



export const createProperty = async (formData, token) => {
  return makeRequest(`${API_BASE}/api/property/submit/`, 'POST', formData, token);
};

export const getPropertyDetails = async (propertyId, token = null) => {
  // We can simplify this, as makeRequest now handles the try/catch internally.
  return makeRequest(`${API_BASE}/api/properties/${propertyId}/`, 'GET', null, token);
};

export const updateProperty = async (propertyId, formData, token) => {
  console.log('🔄 Updating property:', propertyId);
  return makeRequest(`${API_BASE}/api/properties/${propertyId}/`, 'PUT', formData, token);
};

export const deleteProperty = async (propertyId, token) => {
  console.log('🗑️ Deleting property:', propertyId);
  return makeRequest(`${API_BASE}/api/properties/${propertyId}/`, 'DELETE', null, token);
};

export const patchProperty = async (propertyId, formData, token) => {
  console.log('🔄 Patching property:', propertyId);
  return makeRequest(`${API_BASE}/api/properties/${propertyId}/`, 'PATCH', formData, token);
};

export const deleteMultipleProperties = async (propertyIds, token) => {
  console.log('🗑️ Bulk deleting properties:', propertyIds);
  return makeRequest(`${API_BASE}/api/properties/bulk-delete/`, 'DELETE', { property_ids: propertyIds }, token);
};

export const togglePropertyStatus = async (propertyId, status, token) => {
  console.log('🔄 Toggling property status:', propertyId, 'to', status);
  return makeRequest(`${API_BASE}/api/properties/${propertyId}/status/`, 'PATCH', { status }, token);
};

export const getMyProperties = async (token) => {
  return makeRequest(`${API_BASE}/api/properties/my-properties/`, 'GET', null, token);
};

export const getPropertyById = async (id, token) => {
  console.log(`📡 API CALL: getPropertyById(${id})`);
  return makeRequest(`${API_BASE}/api/properties/${id}/`, 'GET', null, token);
};

// export const getPropertyById = async (id, token) => {
//   return makeRequest(`${API_BASE}/api/properties/${id}/`, 'GET', null, token);
// };

// ============================================================================
// Favorites Related API Calls
// ============================================================================

export const saveFavorite = (propertyId, accessToken) => {
  return makeRequest(`${API_BASE}/api/favorites/`, 'POST', { property_id: propertyId }, accessToken);
};

export const removeFavorite = (propertyId, accessToken) => {
  return makeRequest(`${API_BASE}/api/favorites/remove-by-property/${propertyId}/`, 'DELETE', null, accessToken);
};

export const getFavorites = (accessToken) => {
  return makeRequest(`${API_BASE}/api/favorites/`, 'GET', null, accessToken);
};
