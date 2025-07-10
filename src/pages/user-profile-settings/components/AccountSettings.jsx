// src/pages/user-profile-settings/components/AccountSettings.jsx
import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import { changeUserPassword } from '../../../services/api';

const AccountSettings = ({ user, onDataChange, accessToken, showToast }) => {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { currentPassword: '', newPassword: '', confirmPassword: '' };

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
      isValid = false;
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
      isValid = false;
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
      isValid = false;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

// AccountSettings.jsx
const handlePasswordSubmit = async (e) => {
  e.preventDefault();
  
  // Client-side validation
  if (!validateForm()) return;
  
  setIsLoading(true);

  try {
    await changeUserPassword(
      accessToken,
      {
        old_password: passwordData.currentPassword,
        new_password: passwordData.newPassword
      }
    );
    
    showToast('Password changed successfully!', 'success');
    setShowPasswordForm(false);
    setPasswordData({ 
      currentPassword: '', 
      newPassword: '', 
      confirmPassword: '' 
    });
    setErrors({ currentPassword: '', newPassword: '', confirmPassword: '' });
  } catch (err) {
    // Handle specific backend errors
    if (err.message.includes('old_password') || err.message.includes('current password')) {
      setErrors(prev => ({ ...prev, currentPassword: 'Invalid current password' }));
    } else if (err.message.includes('new_password')) {
      setErrors(prev => ({ ...prev, newPassword: err.message }));
    } else if (err.message.includes('Server returned')) {
      // Handle HTML/server errors
      showToast('Server error: Please try again later', 'error');
      console.error('Server error details:', err.message);
    } else {
      showToast(err.message || 'Failed to change password', 'error');
    }
    
    // Debugging: Log detailed error info
    console.error('Password change failed:', {
      endpoint: `${BASE_URL}/users/change-password/`,
      method: 'PATCH',
      status: err.message.includes('Server returned') ? 'HTML response' : 'API error',
      error: err.message
    });
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="space-y-6">
      {/* Password Settings */}
      <div className="bg-surface rounded-lg shadow-elevation-1">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-xl font-semibold text-text-primary font-heading">
            Password & Security
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Manage your password and security settings
          </p>
        </div>

        <div className="p-6">
          {!showPasswordForm ? (
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-text-primary">Password</h3>
                <p className="text-text-secondary text-sm">Last changed 3 months ago</p>
              </div>
              <button
                onClick={() => setShowPasswordForm(true)}
                className="bg-primary text-white px-4 py-2 rounded-md font-medium hover:bg-primary-700 transition-colors duration-200"
              >
                Change Password
              </button>
            </div>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {/* Current Password */}
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-text-primary mb-2">
                  Current Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword.current ? "text" : "password"}
                    id="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                    className={`block w-full px-4 py-3 border ${
                      errors.currentPassword ? 'border-error' : 'border-border'
                    } rounded-md shadow-sm focus:border-border-focus focus:ring-2 focus:ring-primary-500 transition-all duration-200`}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-secondary"
                    onClick={() => togglePasswordVisibility('current')}
                  >
                    <Icon name={showPassword.current ? "EyeOff" : "Eye"} />
                  </button>
                </div>
                {errors.currentPassword && (
                  <p className="mt-1 text-sm text-error">{errors.currentPassword}</p>
                )}
              </div>
              
              {/* New Password */}
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-text-primary mb-2">
                  New Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword.new ? "text" : "password"}
                    id="newPassword"
                    value={passwordData.newPassword}
                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                    className={`block w-full px-4 py-3 border ${
                      errors.newPassword ? 'border-error' : 'border-border'
                    } rounded-md shadow-sm focus:border-border-focus focus:ring-2 focus:ring-primary-500 transition-all duration-200`}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-secondary"
                    onClick={() => togglePasswordVisibility('new')}
                  >
                    <Icon name={showPassword.new ? "EyeOff" : "Eye"} />
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="mt-1 text-sm text-error">{errors.newPassword}</p>
                )}
                <p className="mt-1 text-xs text-text-secondary">
                  Must be at least 8 characters
                </p>
              </div>
              
              {/* Confirm New Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-primary mb-2">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword.confirm ? "text" : "password"}
                    id="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                    className={`block w-full px-4 py-3 border ${
                      errors.confirmPassword ? 'border-error' : 'border-border'
                    } rounded-md shadow-sm focus:border-border-focus focus:ring-2 focus:ring-primary-500 transition-all duration-200`}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-secondary"
                    onClick={() => togglePasswordVisibility('confirm')}
                  >
                    <Icon name={showPassword.confirm ? "EyeOff" : "Eye"} />
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-error">{errors.confirmPassword}</p>
                )}
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="bg-primary text-white px-4 py-2 rounded-md font-medium hover:bg-primary-700 transition-colors duration-200 disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <span className="mr-2">Updating...</span>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </span>
                  ) : (
                    'Update Password'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    setShowPassword({ current: false, new: false, confirm: false });
                    setErrors({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                  className="border border-border text-text-secondary px-4 py-2 rounded-md font-medium hover:bg-secondary-100 transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;