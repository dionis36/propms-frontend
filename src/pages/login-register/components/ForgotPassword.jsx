import React, { useState } from 'react';
import Button from 'components/ui/Button';
import Input from 'components/ui/Input';
import Icon from 'components/AppIcon';

const ForgotPassword = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Email is required');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Mock API call for password reset
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSent(true);
    } catch (error) {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="Mail" size={32} className="text-success" />
        </div>
        <h2 className="text-2xl font-semibold text-text-primary mb-2">
          Check your email
        </h2>
        <p className="text-text-secondary mb-6">
          We've sent a password reset link to <strong>{email}</strong>
        </p>
        <div className="space-y-3">
          <Button variant="primary" fullWidth onClick={onBack}>
            Back to Sign In
          </Button>
          <Button 
            variant="outline" 
            fullWidth 
            onClick={() => {
              setSent(false);
              setEmail('');
            }}
          >
            Try different email
          </Button>
        </div>
        <p className="text-xs text-text-secondary mt-6">
          Didn't receive the email? Check your spam folder or try again in a few minutes.
        </p>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center text-text-secondary hover:text-text-primary mb-6 transition-colors"
      >
        <Icon name="ArrowLeft" size={20} className="mr-2" />
        Back to Sign In
      </button>

      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="Lock" size={32} className="text-primary" />
        </div>
        <h2 className="text-2xl font-semibold text-text-primary mb-2">
          Forgot your password?
        </h2>
        <p className="text-text-secondary">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-error-100 border border-error-500 rounded-md">
            <div className="flex items-center">
              <Icon name="AlertCircle" size={20} className="text-error mr-3" />
              <p className="text-sm text-error">{error}</p>
            </div>
          </div>
        )}

        <div>
          <label htmlFor="reset-email" className="block text-sm font-medium text-text-primary mb-2">
            Email Address
          </label>
          <Input
            id="reset-email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            placeholder="Enter your email"
            className={error ? 'border-error-500 focus:ring-error-500' : ''}
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={loading}
          disabled={loading}
        >
          Send Reset Link
        </Button>
      </form>
    </div>
  );
};

export default ForgotPassword;