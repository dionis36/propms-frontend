// File: Toast.jsx

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  Info,
  AlertTriangle,
  X,
} from 'lucide-react';

const typeStyles = {
  success: {
    bg: 'bg-green-500',
    Icon: CheckCircle,
  },
  error: {
    bg: 'bg-red-500',
    Icon: XCircle,
  },
  info: {
    bg: 'bg-blue-500',
    Icon: Info,
  },
  warning: {
    bg: 'bg-yellow-500',
    Icon: AlertTriangle,
  },
};

const Toast = ({
  message,
  type = 'info',
  onClose,
  duration = 4000,
  persist = false,
}) => {
  useEffect(() => {
    if (!persist) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [onClose, duration, persist]);

  const { bg, Icon } = typeStyles[type] || typeStyles.info;

  return (
    <AnimatePresence>
      <motion.div
        className={`w-[350px] pointer-events-auto flex items-center justify-between gap-2 px-4 py-3 rounded-md shadow-lg text-white ${bg}`}
        role="alert"
        aria-live="polite"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-2">
          <Icon size={20} />
          <span>{message}</span>
        </div>
        <button onClick={onClose} aria-label="Close" className="ml-2">
          <X size={16} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

Toast.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['success', 'error', 'info', 'warning']),
  onClose: PropTypes.func.isRequired,
  duration: PropTypes.number,
  persist: PropTypes.bool,
};

export default Toast;
