
// // src/services/api.js

// export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

// // Import jwt-decode if you're using it in loginUser
// // You'll need to install it: npm install jwt-decode
// // const jwtDecode = (await import('jwt-decode')).default; // Example of dynamic import if needed

// /**
//  * Helper function for making general API requests.
//  * Encapsulates fetch, header setup, JSON parsing, and robust error handling.
//  *
//  * @param {string} url - The full URL of the API endpoint.
//  * @param {string} method - The HTTP method (e.g., 'GET', 'POST', 'PATCH').
//  * @param {object} [data=null] - The request body data (for POST, PATCH, PUT).
//  * @param {string} [token=null] - Optional JWT access token for Authorization header.
//  * @returns {Promise<object|string>} - The parsed JSON response or raw text.
//  * @throws {Error} - Throws an error object with status and parsed error data.
//  */
// async function makeRequest(url, method, data = null, token = null) {
//     const headers = {
//         'Content-Type': 'application/json',
//     };

//     if (token) {
//         headers['Authorization'] = `Bearer ${token}`;
//     }

//     const config = { // Declared outside conditional block
//         method: method,
//         headers: headers,
//     };

//     if (data) {
//         config.body = JSON.stringify(data);
//     }

//     const response = await fetch(url, config);

//     if (!response.ok) {
//         let errorData;
//         let errorMessage = 'Request failed';

//         try {
//             errorData = await response.json(); // Attempt to parse the response as JSON
//             errorMessage = errorData.detail || JSON.stringify(errorData); // Use 'detail' or stringify
//         } catch (e) {
//             const errorText = await response.text(); // Fallback to raw text if not JSON
//             errorMessage = errorText || 'Request failed with no readable body';
//         }

//         // Create a custom Error object with more context
//         const error = new Error(errorMessage);
//         error.status = response.status; // Attach HTTP status code
//         error.data = errorData;         // Attach parsed error data (if available)

//         throw error; // Throw the custom error
//     }

//     // For successful responses, return JSON or text based on content type
//     const contentType = response.headers.get('content-type');
//     if (contentType && contentType.includes('application/json')) {
//         return response.json();
//     } else {
//         return response.text(); // For responses like 204 No Content
//     }
// }


// // loginUser function to authenticate a user
// export const loginUser = async (email, password) => {
//     // Uses makeRequest for consistency
//     const response = await makeRequest(`${API_BASE}/api/token/`, 'POST', { email, password });

//     // If your loginUser also decodes JWT and stores role, add that logic here:
//     // const { access, refresh } = response;
//     // const jwtDecode = (await import('jwt-decode')).default;
//     // try {
//     //     const decodedToken = jwtDecode(access);
//     //     const userRole = decodedToken.role;
//     //     const userId = decodedToken.user_id;
//     //     localStorage.setItem('accessToken', access);
//     //     localStorage.setItem('refreshToken', refresh);
//     //     localStorage.setItem('userRole', userRole);
//     //     localStorage.setItem('userId', userId);
//     //     return { success: true, role: userRole, userId: userId };
//     // } catch (error) {
//     //     console.error("Error decoding JWT token in loginUser:", error);
//     //     throw new Error("Failed to process login token.");
//     // }

//     return response; // Returns the token response directly if no decoding here
// };

// // getUserProfile function to fetch the user's profile
// export const getUserProfile = async (accessToken) => {
//     // Uses makeRequest for consistency
//     return makeRequest(`${API_BASE}/api/users/me/`, 'GET', null, accessToken);
// };


// // This function updates the user profile with the provided data
// export async function updateUserProfile(token, payload) {
//     console.log('🧪 About to PATCH with user:', payload);
//     // Uses makeRequest for consistency
//     return makeRequest(`${API_BASE}/api/users/me/`, 'PATCH', payload, token);
// }


// // This function changes the user's password
// export const changeUserPassword = async (accessToken, data) => {
//     // Uses makeRequest for consistency, removing redundant try/catch and error parsing
//     return makeRequest(`${API_BASE}/api/users/change-password/`, 'PATCH', data, accessToken);
// };


// // Handles user registration.
// export const registerUser = async (userData) => {
//     // Uses makeRequest for consistency
//     const url = `${API_BASE}/api/register/`;
//     return makeRequest(url, 'POST', userData); // No token needed for public registration
// };


// import { API_BASE } from './apiConfig';

// export const createProperty = async (data) => {
//   const response = await fetch(`${API_BASE}/properties`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(data)
//   });
//   return response.json();
// };

// export const updateProperty = async (id, data) => {
//   const response = await fetch(`${API_BASE}/properties/${id}`, {
//     method: 'PATCH',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(data)
//   });
//   return response.json();
// };

// export const uploadPropertyMedia = async (propertyId, formData) => {
//   const response = await fetch(`${API_BASE}/properties/${propertyId}/media`, {
//     method: 'POST',
//     body: formData // No Content-Type header for FormData
//   });
//   return response.json();
// };



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

    // If your loginUser also decodes JWT and stores role, add that logic here:
    // const { access, refresh } = response;
    // const jwtDecode = (await import('jwt-decode')).default;
    // try {
    //     const decodedToken = jwtDecode(access);
    //     const userRole = decodedToken.role;
    //     const userId = decodedToken.user_id;
    //     localStorage.setItem('accessToken', access);
    //     localStorage.setItem('refreshToken', refresh);
    //     localStorage.setItem('userRole', userRole);
    //     localStorage.setItem('userId', userId);
    //     return { success: true, role: userRole, userId: userId };
    // } catch (error) {
    //     console.error("Error decoding JWT token in loginUser:", error);
    //     throw new Error("Failed to process login token.");
    // }

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

/**
 * Submits a new property with associated media (images/videos).
 * @param {FormData} formData - The FormData object containing property data and files.
 * @param {string} token - The user's access token.
 * @returns {Promise<object>} - The response data from the API.
 */
export const createProperty = async (formData, token) => {
    // The makeRequest function now handles FormData correctly.
    // No need to manually set 'Content-Type': 'multipart/form-data' as fetch does it automatically for FormData.
    return makeRequest(`${API_BASE}/api/property/submit/`, 'POST', formData, token);
};

/**
 * Updates an existing property with new data and potentially new media.
 * @param {string} id - The ID of the property to update.
 * @param {FormData} formData - The FormData object containing updated property data and files.
 * @param {string} token - The user's access token.
 * @returns {Promise<object>} - The response data from the API.
 */
// export const updateProperty = async (id, formData, token) => {
//     // Use PATCH method for updating an existing resource.
//     return makeRequest(`${API_BASE}/api/property/${id}/`, 'PATCH', formData, token);
// };


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