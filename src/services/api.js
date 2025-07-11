// // src/services/api.js
// export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';



// // loginUser function to authenticate a user
// export const loginUser = async (email, password) => {
//   const res = await fetch(`${API_BASE}/api/token/`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ email, password }),
//   });

//   if (!res.ok) {
//     throw new Error('Authentication failed');
//   }

//   return res.json();
// };

// // getUserProfile function to fetch the user's profile
// export const getUserProfile = async (accessToken) => {
//   const res = await fetch(`${API_BASE}/api/users/me/`, {
//     headers: {
//       Authorization: `Bearer ${accessToken}`,
//     },
//   });

//   if (!res.ok) {
//     throw new Error('Failed to fetch user profile');
//   }

//   return res.json();
// };


// // This function updates the user profile with the provided data
// export async function updateUserProfile(token, payload) {
//   console.log('🧪 About to PATCH with user:', payload);

//   const res = await fetch(`${API_BASE}/api/users/me/`, {
//     method: 'PATCH',
//     headers: {
//       'Content-Type': 'application/json',
//       'Authorization': `Bearer ${token}`
//     },
//     body: JSON.stringify(payload)
//   });

//   if (!res.ok) {
//     const errorText = await res.text();
//     throw new Error(errorText || 'Request failed');
//   }

//   return await res.json();
// }


// // This function changes the user's password
// export const changeUserPassword = async (accessToken, data) => {
//   try {
//     const response = await fetch(`${API_BASE}/api/users/change-password/`, {
//       method: 'PATCH',
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: `Bearer ${accessToken}`
//       },
//       body: JSON.stringify(data)
//     });

//     // Check if response is JSON
//     const contentType = response.headers.get('content-type');
//     if (contentType && contentType.includes('application/json')) {
//       const responseData = await response.json();
//       if (!response.ok) {
//         throw new Error(responseData.detail || 'Failed to change password');
//       }
//       return responseData;
//     } else {
//       // Handle non-JSON responses (like HTML error pages)
//       const text = await response.text();
//       throw new Error(`Server returned ${response.status}: ${text.slice(0, 100)}`);
//     }
//   } catch (error) {
//     console.error('Password change error:', error);
//     throw new Error(error.message || 'Failed to change password');
//   }
// };


//  // Handles user registration.
// export const registerUser = async (userData) => {
//     const url = `${API_BASE}/api/register/`; // Your public registration endpoint
//     return makeRequest(url, 'POST', userData); // No token needed for public registration
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
    const headers = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = { // Declared outside conditional block
        method: method,
        headers: headers,
    };

    if (data) {
        config.body = JSON.stringify(data);
    }

    const response = await fetch(url, config);

    if (!response.ok) {
        let errorData;
        let errorMessage = 'Request failed';

        try {
            errorData = await response.json(); // Attempt to parse the response as JSON
            errorMessage = errorData.detail || JSON.stringify(errorData); // Use 'detail' or stringify
        } catch (e) {
            const errorText = await response.text(); // Fallback to raw text if not JSON
            errorMessage = errorText || 'Request failed with no readable body';
        }

        // Create a custom Error object with more context
        const error = new Error(errorMessage);
        error.status = response.status; // Attach HTTP status code
        error.data = errorData;         // Attach parsed error data (if available)

        throw error; // Throw the custom error
    }

    // For successful responses, return JSON or text based on content type
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        return response.json();
    } else {
        return response.text(); // For responses like 204 No Content
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