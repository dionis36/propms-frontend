import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../components/ui/Toast';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  const hideToast = () => {
    setToast(null);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
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
