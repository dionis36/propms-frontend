import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'components/ui/Button';
import Input from 'components/ui/Input';
import Icon from 'components/AppIcon';
import { useAuth } from '../../../contexts/AuthContext';
import { registerUser } from '../../../services/api';
import { useToast } from '../../../contexts/ToastContext'; // Adjust path

const AuthForm = ({ mode, onForgotPassword }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    whatsappNumber: '',
    role: 'TENANT',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const [fieldErrors, setFieldErrors] = useState({}); 
  const { showToast } = useToast();

  const phoneInputRef = useRef(null);
  const whatsappInputRef = useRef(null);

  // Format phone number input
  const formatPhoneInput = (value) => {
    // Remove all non-digit characters
    let digits = value.replace(/\D/g, '');
    
    // Trim to 10 digits max (09XXXXXXXX)
    if (digits.length > 10) {
      digits = digits.substring(0, 10);
    }
    
    // Apply formatting: 0XXX XXX XXX
    let formatted = '';
    for (let i = 0; i < digits.length; i++) {
      if (i === 4 || i === 7) {
        formatted += ' ';
      }
      formatted += digits[i];
    }
    
    return formatted;
  };

  // Handle phone input change
  const handlePhoneChange = (e, fieldName) => {
    const { value } = e.target;
    const cursorPosition = e.target.selectionStart;
    
    // Format the input
    const formattedValue = formatPhoneInput(value);
    
    // Update state
    setFormData(prev => ({
      ...prev,
      [fieldName]: formattedValue
    }));
    
    // Adjust cursor position after state update
    setTimeout(() => {
      const input = fieldName === 'phone' ? phoneInputRef.current : whatsappInputRef.current;
      if (!input) return;
      
      // Calculate new cursor position
      let newCursorPos = cursorPosition;
      
      // If we added a space before cursor, move cursor forward
      if (formattedValue.length > value.length && 
          (cursorPosition === 5 || cursorPosition === 9)) {
        newCursorPos++;
      }
      // If we removed a space before cursor, move cursor back
      else if (formattedValue.length < value.length && 
               (cursorPosition === 4 || cursorPosition === 8)) {
        newCursorPos--;
      }
      
      input.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Handle phone key down
  const handlePhoneKeyDown = (e, fieldName) => {
    const { key } = e;
    const { value } = e.target;
    const selectionStart = e.target.selectionStart;
    const selectionEnd = e.target.selectionEnd;
    
    // Handle backspace and delete around spaces
    if (key === 'Backspace') {
      // If backspacing at a space position
      if ((selectionStart === 5 || selectionStart === 9) && selectionStart === selectionEnd) {
        e.preventDefault();
        const newValue = value.substring(0, selectionStart - 1) + value.substring(selectionStart);
        setFormData(prev => ({
          ...prev,
          [fieldName]: newValue
        }));
        setTimeout(() => {
          const input = fieldName === 'phone' ? phoneInputRef.current : whatsappInputRef.current;
          if (input) input.setSelectionRange(selectionStart - 1, selectionStart - 1);
        }, 0);
      }
    } else if (key === 'Delete') {
      // If deleting at a space position
      if ((selectionStart === 4 || selectionStart === 8) && selectionStart === selectionEnd) {
        e.preventDefault();
        const newValue = value.substring(0, selectionStart) + value.substring(selectionStart + 1);
        setFormData(prev => ({
          ...prev,
          [fieldName]: newValue
        }));
        setTimeout(() => {
          const input = fieldName === 'phone' ? phoneInputRef.current : whatsappInputRef.current;
          if (input) input.setSelectionRange(selectionStart, selectionStart);
        }, 0);
      }
    }
  };

  // Handle phone paste
  const handlePhonePaste = (e, fieldName) => {
    e.preventDefault();
    const pasteData = (e.clipboardData || window.clipboardData).getData('text');
    const currentVal = formData[fieldName];
    const selectionStart = e.target.selectionStart;
    const selectionEnd = e.target.selectionEnd;
    
    // Get current raw digits
    const currentDigits = currentVal.replace(/\s/g, '');
    
    // Get pasted raw digits
    const pastedDigits = pasteData.replace(/\D/g, '');
    
    // Calculate new raw digits
    const newRawDigits = 
      currentDigits.substring(0, selectionStart - Math.floor(selectionStart / 5)) + 
      pastedDigits + 
      currentDigits.substring(selectionEnd - Math.floor(selectionEnd / 5), currentDigits.length);
    
    // Format new value
    const formattedValue = formatPhoneInput(newRawDigits.substring(0, 10));
    
    // Update state
    setFormData(prev => ({
      ...prev,
      [fieldName]: formattedValue
    }));
    
    // Adjust cursor position
    setTimeout(() => {
      const input = fieldName === 'phone' ? phoneInputRef.current : whatsappInputRef.current;
      if (input) {
        const newCursorPos = selectionStart + pastedDigits.length;
        input.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  // Validate Tanzanian phone number format
  const validateTzPhone = (phone) => {
    if (!phone) return false;
    
    // Remove formatting spaces
    const digits = phone.replace(/\s/g, '');
    
    // Check for 10 digits starting with 06 or 07
    return /^(06|07)\d{8}$/.test(digits);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Clear specific field error when user starts typing again
    if (fieldErrors[name]) {
      setFieldErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        delete newErrors[name];
        return newErrors;
      });
    }
    // Clear general errors on input change
    setErrors({});

    // Special handling for role change: Convert to UPPERCASE for backend consistency
    if (name === 'role') {
      setFormData(prev => ({
        ...prev,
        [name]: value.toUpperCase()
      }));
      return;
    }

    // For all other fields
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (mode === 'register') {
      if (!formData.firstName) {
        newErrors.firstName = 'First name is required';
      }
      if (!formData.lastName) {
        newErrors.lastName = 'Last name is required';
      }

      if (!formData.phone) {
        newErrors.phone = 'Phone number is required';
      } else if (!validateTzPhone(formData.phone)) {
        newErrors.phone = 'Invalid phone number. Format: 07XX XXX XXX or 06XX XXX XXX';
      }

      // WhatsApp number validation for brokers (check against UPPERCASE role)
      if (formData.role === 'BROKER') {
        if (!formData.whatsappNumber) {
          newErrors.whatsappNumber = 'WhatsApp number is required for brokers';
        } else if (!validateTzPhone(formData.whatsappNumber)) {
          newErrors.whatsappNumber = 'Invalid WhatsApp number. Format: 07XX XXX XXX or 06XX XXX XXX';
        }
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Function to handle role-based dashboard redirection
  const redirectToDashboard = (userRole) => {
    switch (userRole.toUpperCase()) {
      case 'TENANT':
        navigate('/tenant-dashboard');
        break;
      case 'BROKER':
        navigate('/broker-dashboard');
        break;
      default:
        navigate('/dashboard'); // Fallback dashboard
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setErrors({});
    setFieldErrors({});

    try {
      if (mode === 'login') {
        const success = await login(
          formData.email,
          formData.password,
          formData.rememberMe,
          navigate
        );
        
        if (success) {
          // Custom toast here - login success
          showToast("Logged In, Welcome Back👌", "success");
        } else {
          // Custom toast here - login failure
          showToast("Invalid email or password. Please try again.", "error");
          setErrors({
            submit: 'Invalid email or password. Please try again.'
          });
        }
      } else { // mode === 'register'
        // Prepare data for backend - always include whatsappNumber field
        const payload = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone.replace(/\s/g, ''), // Clean phone number
          role: formData.role, // Already uppercase from handleInputChange
          // Always include whatsappNumber - empty for tenants, populated for brokers
          whatsappNumber: formData.role === 'BROKER' 
            ? formData.whatsappNumber.replace(/\s/g, '') 
            : '' // Empty string for tenants
        };

        // Call the registerUser API function
        const responseData = await registerUser(payload);
        
        // Custom toast here - registration success
        showToast("Registration successful!", "success");

        setErrors({
          success: responseData.message || 'Registration successful!'
        });

        // Clear form after successful registration
        setFormData({
          email: '',
          password: '',
          confirmPassword: '',
          firstName: '',
          lastName: '',
          phone: '',
          whatsappNumber: '',
          role: 'TENANT',
          rememberMe: false
        });

        // Redirect to role-based dashboard after successful registration
        setTimeout(() => {
          redirectToDashboard(formData.role);
        }, 1500); // Small delay to show success message
      }
    } catch (error) {
      console.error("AuthForm Submission Error:", error);
      
      if (error.status === 400 && error.data) {
        // Backend validation errors (e.g., email/phone exists, invalid format)
        const backendErrors = {};
        for (const [field, message] of Object.entries(error.data)) {
          // Map backend field names (snake_case) to frontend names (camelCase)
          let frontendField = field;
          if (field === 'first_name') frontendField = 'firstName';
          else if (field === 'last_name') frontendField = 'lastName';
          else if (field === 'phone_number') frontendField = 'phone';
          else if (field === 'whatsapp_number') frontendField = 'whatsappNumber';

          backendErrors[frontendField] = Array.isArray(message) ? message[0] : message;
        }
        setFieldErrors(backendErrors);
        
        if (error.data.detail) {
          // Custom toast here - backend detail error
          showToast(error.data.detail, "error");
          setErrors({ submit: error.data.detail });
        } else if (Object.keys(error.data).length > 0) {
          // Custom toast here - form validation errors
          showToast('Please correct the errors in the form.', "error");
          setErrors({ submit: 'Please correct the errors in the form.' });
        } else {
          // Custom toast here - unknown registration error
          showToast('Registration failed. An unknown error occurred.', "error");
          setErrors({ submit: 'Registration failed. An unknown error occurred.' });
        }
      } else {
        // Network errors or other unexpected errors
        const errorMessage = error.message || 'Registration failed. Please check your details and try again.';
        // Custom toast here - network/unexpected error
        showToast(errorMessage, "error");
        setErrors({
          submit: errorMessage
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Success Message */}
      {errors.success && (
        <div className="p-3 rounded-md bg-success-50 border border-success-200">
          <p className="text-sm text-success-700">{errors.success}</p>
        </div>
      )}

      {/* General Submit Error Message */}
      {errors.submit && (
        <div className="p-3 rounded-md bg-error-50 border border-error-200">
          <p className="text-sm text-error-700">{errors.submit}</p>
        </div>
      )}

      {/* Registration Fields */}
      {mode === 'register' && (
        <>
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-text-primary mb-2">
              First Name
            </label>
            <Input
              id="firstName"
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="Enter your first name"
              className={fieldErrors.firstName ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : 'border-border focus:ring-primary-500 focus:border-primary-500'} 
              disabled={loading}
            />
            {fieldErrors.firstName && ( 
              <p className="mt-1 text-sm text-error-600">{fieldErrors.firstName}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-text-primary mb-2">
              Last Name
            </label>
            <Input
              id="lastName"
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder="Enter your last name"
              className={fieldErrors.lastName ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : 'border-border focus:ring-primary-500 focus:border-primary-500'} 
              disabled={loading}
            />
            {fieldErrors.lastName && ( 
              <p className="mt-1 text-sm text-error-600">{fieldErrors.lastName}</p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-text-primary mb-2">
              Phone Number
            </label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handlePhoneChange(e, 'phone')}
              onKeyDown={(e) => handlePhoneKeyDown(e, 'phone')}
              onPaste={(e) => handlePhonePaste(e, 'phone')}
              placeholder="07XX XXX XXX"
              className={fieldErrors.phone ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : 'border-border focus:ring-primary-500 focus:border-primary-500'} 
              disabled={loading}
              ref={phoneInputRef}
            />
            {fieldErrors.phone && (
              <p className="mt-1 text-sm text-error-600">{fieldErrors.phone}</p>
            )}
          </div>

          {/* WhatsApp Number Field for Brokers */}
          {formData.role === 'BROKER' && ( 
            <div>
              <label htmlFor="whatsappNumber" className="block text-sm font-medium text-text-primary mb-2">
                WhatsApp Number
              </label>
              <Input
                id="whatsappNumber"
                name="whatsappNumber"
                type="tel"
                value={formData.whatsappNumber}
                onChange={(e) => handlePhoneChange(e, 'whatsappNumber')}
                onKeyDown={(e) => handlePhoneKeyDown(e, 'whatsappNumber')}
                onPaste={(e) => handlePhonePaste(e, 'whatsappNumber')}
                placeholder="07XX XXX XXX"
                className={fieldErrors.whatsappNumber ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : 'border-border focus:ring-primary-500 focus:border-primary-500'} 
                disabled={loading}
                ref={whatsappInputRef}
              />
              {fieldErrors.whatsappNumber && ( 
                <p className="mt-1 text-sm text-error-600">{fieldErrors.whatsappNumber}</p>
              )}
            </div>
          )}
        </>
      )}

      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
          Email Address
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="Enter your email"
          className={fieldErrors.email ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : 'border-border focus:ring-primary-500 focus:border-primary-500'} 
          disabled={loading}
        />
        {fieldErrors.email && (
          <p className="mt-1 text-sm text-error-600">{fieldErrors.email}</p>
        )}
      </div>

      {/* Password Field */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-2">
          Password
        </label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Enter your password"
            className={`pr-10 ${fieldErrors.password ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : 'border-border focus:ring-primary-500 focus:border-primary-500'}`} 
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-secondary hover:text-text-primary"
            disabled={loading}
          >
            <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={20} />
          </button>
        </div>
        {fieldErrors.password && ( 
          <p className="mt-1 text-sm text-error-600">{fieldErrors.password}</p>
        )}
      </div>

      {/* Confirm Password Field */}
      {mode === 'register' && (
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-primary mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm your password"
              className={`pr-10 ${fieldErrors.confirmPassword ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : 'border-border focus:ring-primary-500 focus:border-primary-500'}`} 
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-secondary hover:text-text-primary"
              disabled={loading}
            >
              <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={20} />
            </button>
          </div>
          {fieldErrors.confirmPassword && ( 
            <p className="mt-1 text-sm text-error-600">{fieldErrors.confirmPassword}</p>
          )}
        </div>
      )}

      {/* Registration Role Selection */}
      {mode === 'register' && (
        <div>
          <label className="block text-sm font-medium text-text-primary mb-3">
            Account Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="relative flex cursor-pointer">
              <Input
                type="radio"
                name="role"
                value="TENANT" 
                checked={formData.role === 'TENANT'} 
                onChange={handleInputChange}
                className="sr-only"
                disabled={loading}
              />
              <div className={`flex-1 p-3 rounded-md border-2 text-center transition-all ${
                formData.role === 'TENANT' 
                  ? 'border-primary bg-primary-50 text-primary' 
                  : 'border-border text-text-secondary hover:border-secondary-300'
              }`}>
                <Icon name="User" size={20} className="mx-auto mb-1" />
                <span className="text-sm font-medium">Tenant</span>
              </div>
            </label>
            <label className="relative flex cursor-pointer">
              <Input
                type="radio"
                name="role"
                value="BROKER" 
                checked={formData.role === 'BROKER'} 
                onChange={handleInputChange}
                className="sr-only"
                disabled={loading}
              />
              <div className={`flex-1 p-3 rounded-md border-2 text-center transition-all ${
                formData.role === 'BROKER' 
                  ? 'border-primary bg-primary-50 text-primary' 
                  : 'border-border text-text-secondary hover:border-secondary-300'
              }`}>
                <Icon name="Briefcase" size={20} className="mx-auto mb-1" />
                <span className="text-sm font-medium">Broker</span>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* Remember Me & Forgot Password */}
      {mode === 'login' && (
        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <Input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleInputChange}
              disabled={loading}
            />
            <span className="ml-2 text-sm text-text-secondary">Remember me</span>
          </label>
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-sm text-primary hover:underline"
            disabled={loading}
          >
            Forgot password?
          </button>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        loading={loading}
        disabled={loading}
      >
        {mode === 'login' ? 'Sign In' : 'Create Account'}
      </Button>
    </form>
  );
};

export default AuthForm;