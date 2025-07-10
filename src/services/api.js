// src/services/api.js
export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';


export const loginUser = async (email, password) => {
  const res = await fetch(`${API_BASE}/api/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    throw new Error('Authentication failed');
  }

  return res.json();
};

export const getUserProfile = async (accessToken) => {
  const res = await fetch(`${API_BASE}/api/users/me/`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch user profile');
  }

  return res.json();
};

// This function updates the user profile with the provided data
export async function updateUserProfile(token, payload) {
  console.log('🧪 About to PATCH with user:', payload);

  const res = await fetch(`${API_BASE}/api/users/me/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || 'Request failed');
  }

  return await res.json();
}


// This function changes the user's password
// services/api.js
export const changeUserPassword = async (accessToken, data) => {
  try {
    const response = await fetch(`${API_BASE}/api/users/change-password/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify(data)
    });

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.detail || 'Failed to change password');
      }
      return responseData;
    } else {
      // Handle non-JSON responses (like HTML error pages)
      const text = await response.text();
      throw new Error(`Server returned ${response.status}: ${text.slice(0, 100)}`);
    }
  } catch (error) {
    console.error('Password change error:', error);
    throw new Error(error.message || 'Failed to change password');
  }
};