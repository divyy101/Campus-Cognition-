import React from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import ProductShowcase from './ProductShowcase';

const AuthLayout = ({ children, title, subtitle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isLogin = location.pathname === '/login';

  return (
    <div className="min-h-[100dvh] flex w-full bg-transparent text-[var(--text-primary)]">
      
      {/* Left Panel: Authentication (40% Desktop, 100% Mobile) */}
      <div className="w-full lg:w-[40%] flex flex-col items-center justify-center relative z-10 px-6 sm:px-12 py-10 overflow-y-auto custom-scrollbar bg-[var(--surface-elevated)] backdrop-blur-2xl border-r border-[var(--border)]">
        
        <div className="w-full max-w-[420px] relative z-10 flex flex-col gap-8">
          
          {/* Logo & Header */}
          <div className="flex flex-col gap-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="w-12 h-12 rounded-xl bg-[var(--accent-soft)] flex items-center justify-center border border-[var(--border)]"
            >
              <Sparkles className="w-6 h-6 text-[var(--accent)]" />
            </motion.div>
            
            <div>
              <motion.h1 
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="cc-h1 mb-2"
              >
                Welcome back,<br/>
                <span className="font-bold text-[var(--accent)]">Creative.</span>
              </motion.h1>
              <motion.p 
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="cc-body text-[var(--text-secondary)]"
              >
                Continue your journey with Campus Cognition.
              </motion.p>
            </div>
          </div>

          {/* Segmented Control (Tabs) */}
          <motion.div 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex p-1 rounded-xl bg-[var(--surface-sunken)] border border-[var(--border)] w-full"
          >
            <button
              onClick={() => navigate('/login')}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all relative ${isLogin ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
            >
              {isLogin && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute inset-0 bg-[var(--surface)] rounded-lg shadow-sm border border-[var(--border)]"
                />
              )}
              <span className="relative z-10">Sign In</span>
            </button>
            <button
              onClick={() => navigate('/register')}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all relative ${!isLogin ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
            >
              {!isLogin && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute inset-0 bg-[var(--surface)] rounded-lg shadow-sm border border-[var(--border)]"
                />
              )}
              <span className="relative z-10">Sign Up</span>
            </button>
          </motion.div>

          {/* Form Content */}
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {children}
          </motion.div>

        </div>
      </div>

      {/* Right Panel: Product Showcase (60% Desktop, Hidden Mobile) */}
      <ProductShowcase />
      
    </div>
  );
};

export default AuthLayout;
