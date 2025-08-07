// ✅ UPGRADED TOAST SYSTEM
// File: ToastContext.jsx

import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../components/ui/Toast';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', config = {}) => {
    const id = Date.now() + Math.random();
    const toastConfig = {
      id,
      message,
      type,
      duration: config.duration ?? 4000,
      persist: config.persist ?? false,
      position: config.position ?? 'bottom-right',
    };

    setToasts(prev => [...prev, toastConfig]);

    if (!toastConfig.persist) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, toastConfig.duration);
    }
  }, []);

  const removeToast = id => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed inset-0 pointer-events-none z-50">
        {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(pos => (
          <div
            key={pos}
            className={`absolute ${{
              'top-left': 'top-4 left-4',
              'top-right': 'top-4 right-4',
              'bottom-left': 'bottom-4 left-4',
              'bottom-right': 'bottom-4 right-4',
            }[pos]} space-y-2`}
          >
            {toasts.filter(t => t.position === pos).map(toast => (
              <Toast
                key={toast.id}
                message={toast.message}
                type={toast.type}
                duration={toast.duration}
                persist={toast.persist}
                onClose={() => removeToast(toast.id)}
              />
            ))}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);


/* 
====================================================
✅ HOW TO USE (Example)
====================================================

//    a. Import the `useToast` hook:
//       `import { useToast } from '../../contexts/ToastContext'; // Adjust path`
//    b. Get the `showToast` function:
//       `const { showToast } = useToast();`
//    c. Call `showToast()` with your message and an optional type:
//       - `showToast('Success message!', 'success');`  // Green
//       - `showToast('Error message.', 'error');`      // Red
//       - `showToast('Info message.', 'info');`        // Blue (default)
//       - `showToast('Warning message.', 'warning');`  // Yellow


/*
import React from 'react';
import { useToast } from '../../../contexts/ToastContext'; // Adjust path

const MyComponent = () => {
  const { showToast } = useToast();

  const handleClick = () => {
    showToast("Action completed!", "success");
  };

  return (
    <button onClick={handleClick}>
      Perform Action
    </button>
  );
};

export default MyComponent;
*/

// --- Important Notes ---
// - Ensure 'framer-motion' is installed for animations.
// - Verify paths to `ToastContext.jsx` and your `Icon` component.
// - Use toasts for user feedback after actions (e.g., API success/failure).
