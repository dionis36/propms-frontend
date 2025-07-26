// src/services/api.js

export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';


async function makeRequest(url, method, data = null, token = null) {
  console.log('🌐 API Request:', url);
  console.trace('📍 Called from:');
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
// export const updateProperty = async (propertyId, payload, token) => {
//   // Use makeRequest for consistency.
//   // The payload (FormData) will be handled correctly by makeRequest.
//   return makeRequest(`${API_BASE}/api/properties/${propertyId}/`, 'PATCH', payload, token);
// };

export const updateProperty = async (propertyId, formData, token) => {
  const url = `${API_BASE}/property/${propertyId}/`;
  
  try {
    console.log('🔄 Updating property:', propertyId);
    
    // Log FormData entries for debugging
    console.group('📝 Update Payload');
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`${key}:`, `File(${value.name}, ${value.size} bytes)`);
      } else {
        console.log(`${key}:`, value);
      }
    }
    console.groupEnd();

    const response = await fetch(url, {
      method: 'PATCH', // Using PATCH for partial updates
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type header - let browser set it with boundary for FormData
      },
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        
        // Handle validation errors
        if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (typeof errorData === 'object') {
          // Format field-specific errors
          const fieldErrors = Object.entries(errorData)
            .map(([field, errors]) => {
              const errorList = Array.isArray(errors) ? errors : [errors];
              return `${field}: ${errorList.join(', ')}`;
            })
            .join('; ');
          errorMessage = fieldErrors || errorMessage;
        }
      } catch (parseError) {
        console.warn('Could not parse error response:', parseError);
      }
      
      const error = new Error(errorMessage);
      error.status = response.status;
      throw error;
    }

    const data = await response.json();
    console.log('✅ Property updated successfully:', data);
    return data;

  } catch (error) {
    console.error('🚨 Update property error:', error);
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your connection and try again.');
    }
    
    throw error;
  }
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
