import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000); // Auto close after 4s
    return () => clearTimeout(timer);
  }, [onClose]);

  const base = "fixed bottom-4 right-4 z-50 px-4 py-3 rounded-md shadow-elevation-3 text-sm font-medium flex items-center gap-2 toast-slide-in";
  const typeStyles = {
    success: "bg-success text-white",
    error: "bg-error text-white",
    info: "bg-primary text-white",
    warning: "bg-warning text-white",
  };

  return (
    <div className={`${base} ${typeStyles[type] || typeStyles.info}`}>
      {type === 'success' && '✅'}
      {type === 'error' && '❌'}
      {type === 'info' && 'ℹ️'}
      {type === 'warning' && '⚠️'}
      <span>{message}</span>
    </div>
  );
};

Toast.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['success', 'error', 'info', 'warning']),
  onClose: PropTypes.func.isRequired,
};

export default Toast;
