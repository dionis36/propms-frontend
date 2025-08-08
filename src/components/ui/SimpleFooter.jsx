// --- New file: src/pages/login-register/components/SimpleFooter.jsx ---

import React from 'react';
import { Link } from 'react-router-dom';

const SimpleFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    // The `mt-auto` class pushes the footer to the bottom of the flex container
    <footer className="bg-surface border-t border-border mt-auto py-4">
      <div className="max-w-md mx-auto px-4 text-center">
        {/* Legal Links */}
        <div className="text-xs text-text-secondary">
          <Link to="/privacy" className="hover:text-text-primary transition-colors duration-200">
            Privacy Policy
          </Link>
          <span className="mx-2 text-border"> • </span>
          <Link to="/terms" className="hover:text-text-primary transition-colors duration-200">
            Terms of Service
          </Link>
          <span className="mx-2 text-border"> • </span>
          <Link to="/cookies" className="hover:text-text-primary transition-colors duration-200">
            Cookie Policy
          </Link>
        </div>
        {/* Copyright Section */}
        <div className="mt-2 text-xs text-text-secondary">
          © {currentYear} EstateHub, Inc. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default SimpleFooter;
