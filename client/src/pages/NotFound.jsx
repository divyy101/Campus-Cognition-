import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 text-center">
      <div>
        <h1 className="text-6xl font-black text-indigo-500">404</h1>
        <h2 className="text-2xl font-bold text-white mt-2">Page Not Found</h2>
        <p className="text-xs text-slate-400 mt-2 max-w-sm">The page you are looking for does not exist or has been moved.</p>
        <Link to="/dashboard" className="inline-block mt-6 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30">
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
