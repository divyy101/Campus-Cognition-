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
    <div className="min-h-screen flex w-full bg-white dark:bg-[#070B14] transition-colors duration-500 overflow-hidden">
      
      {/* Left Panel: Authentication (40% Desktop, 100% Mobile) */}
      <div className="w-full lg:w-[40%] flex flex-col items-center justify-center relative z-10 px-6 sm:px-12 py-10 overflow-y-auto custom-scrollbar">
        
        {/* Subtle Ambient Glow for Auth Panel (Mobile only) */}
        <div className="absolute inset-0 pointer-events-none lg:hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full" />
        </div>

        <div className="w-full max-w-[420px] relative z-10 flex flex-col gap-8">
          
          {/* Logo & Header */}
          <div className="flex flex-col gap-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="w-12 h-12 rounded-xl bg-slate-900 dark:bg-white flex items-center justify-center shadow-lg"
            >
              <Sparkles className="w-6 h-6 text-white dark:text-slate-900" />
            </motion.div>
            
            <div>
              <motion.h1 
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-2xl sm:text-3xl font-light text-slate-800 dark:text-slate-200 tracking-tight leading-snug"
              >
                Welcome back,<br/>
                <span className="font-bold text-slate-900 dark:text-white">Creative.</span>
              </motion.h1>
              <motion.p 
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium"
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
            className="flex p-1 rounded-xl bg-slate-100 dark:bg-[#111827] border border-slate-200 dark:border-[#263247] w-full"
          >
            <button
              onClick={() => navigate('/login')}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all relative ${isLogin ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              {isLogin && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white dark:bg-[#1e293b] rounded-lg shadow-sm border border-slate-200/50 dark:border-white/5"
                />
              )}
              <span className="relative z-10">Sign In</span>
            </button>
            <button
              onClick={() => navigate('/register')}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all relative ${!isLogin ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              {!isLogin && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white dark:bg-[#1e293b] rounded-lg shadow-sm border border-slate-200/50 dark:border-white/5"
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
