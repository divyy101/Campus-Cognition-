import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-[100dvh] bg-[var(--bg)] text-[var(--text-primary)] flex items-center justify-center p-4 text-center">
      <div className="cc-card p-12 max-w-md w-full border border-[var(--border)]">
        <h1 className="text-8xl font-black text-[var(--accent)] mb-2">404</h1>
        <h2 className="cc-h2 mb-4 text-[var(--text-primary)]">Page Not Found</h2>
        <p className="cc-body text-[var(--text-secondary)] mb-8">
          The intelligence pathway you are looking for does not exist or has been relocated.
        </p>
        <Link to="/dashboard" className="cc-btn inline-flex px-8 py-3 w-full justify-center">
          Return to Core
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
