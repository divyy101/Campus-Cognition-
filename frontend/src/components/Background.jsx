import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Background = ({ location }) => {
  let page = location?.pathname?.substring(1).split('/')[0] || 'dashboard';
  if (!page) page = 'dashboard';

  // Define unique background configurations for each page
  const configs = {
    dashboard: (
      <motion.div
        key="dashboard-bg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
        className="absolute inset-0"
      >
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-[var(--accent)] opacity-20 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[var(--accent-secondary)] opacity-20 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute top-[40%] left-[20%] w-[40%] h-[40%] bg-purple-500 opacity-10 blur-[120px] rounded-full mix-blend-screen" />
      </motion.div>
    ),
    study: (
      <motion.div
        key="study-bg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
        className="absolute inset-0"
      >
        <div className="absolute top-[10%] left-[10%] w-[40%] h-[40%] bg-[var(--accent)] opacity-15 blur-[120px] rounded-full" />
        <div className="absolute bottom-[10%] right-[10%] w-[50%] h-[50%] bg-[var(--accent-secondary)] opacity-15 blur-[140px] rounded-full" />
        
        {/* Animated Connecting Lines (CSS/SVG) */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at center, var(--accent) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </motion.div>
    ),
    'code-lab': (
      <motion.div
        key="code-bg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
        className="absolute inset-0"
      >
        <div className="absolute top-0 right-1/4 w-[30%] h-[100%] bg-[var(--accent)] opacity-[0.03] blur-[80px] transform -skew-x-12" />
        <div className="absolute bottom-0 left-1/4 w-[30%] h-[100%] bg-[var(--text-primary)] opacity-[0.03] blur-[80px] transform skew-x-12" />
        
        {/* Terminal Grid */}
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)] bg-[size:30px_30px] dark:bg-[linear-gradient(rgba(0,255,65,1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,65,1)_1px,transparent_1px)]" />
      </motion.div>
    ),
    internships: (
      <motion.div
        key="internship-bg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
        className="absolute inset-0"
      >
        <div className="absolute top-[-20%] left-[20%] w-[70%] h-[70%] bg-[var(--accent)] opacity-20 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[20%] w-[60%] h-[60%] bg-[var(--accent-secondary)] opacity-15 blur-[150px] rounded-full mix-blend-screen" />
      </motion.div>
    ),
    scholarships: (
      <motion.div
        key="scholarship-bg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
        className="absolute inset-0"
      >
        <div className="absolute top-1/4 left-1/4 w-[50%] h-[50%] bg-[var(--accent)] opacity-20 blur-[160px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-[40%] h-[40%] bg-[var(--accent-secondary)] opacity-15 blur-[120px] rounded-full" />
        {/* Soft Golden Particles / Stars (CSS approximation) */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,var(--accent)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </motion.div>
    ),
    opportunities: (
      <motion.div
        key="opportunity-bg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
        className="absolute inset-0"
      >
        <div className="absolute top-[0%] left-[0%] w-[100%] h-[50%] bg-gradient-to-b from-[var(--accent)]/10 to-transparent blur-[60px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[var(--accent-secondary)] opacity-15 blur-[130px] rounded-full" />
      </motion.div>
    ),
    profile: (
      <motion.div
        key="profile-bg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
        className="absolute inset-0"
      >
        <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] bg-[var(--accent)] opacity-10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[var(--accent-secondary)] opacity-10 blur-[130px] rounded-full" />
      </motion.div>
    ),
    activity: (
      <motion.div
        key="activity-bg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
        className="absolute inset-0"
      >
        <div className="absolute top-[20%] left-[-10%] w-[40%] h-[60%] bg-[var(--accent)] opacity-15 blur-[120px] rounded-[100px] transform rotate-45" />
        <div className="absolute bottom-[20%] right-[-10%] w-[40%] h-[60%] bg-[var(--accent-secondary)] opacity-15 blur-[120px] rounded-[100px] transform -rotate-45" />
      </motion.div>
    ),
    login: (
      <motion.div
        key="login-bg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
        className="absolute inset-0"
      >
        <div className="absolute top-0 right-0 w-[100%] h-[100%] bg-gradient-to-bl from-[var(--accent)]/20 via-[var(--accent-secondary)]/10 to-transparent blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[80%] h-[80%] bg-[var(--accent-secondary)] opacity-20 blur-[150px] rounded-full mix-blend-screen" />
      </motion.div>
    ),
    register: (
      <motion.div
        key="register-bg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
        className="absolute inset-0"
      >
        <div className="absolute top-0 left-0 w-[100%] h-[100%] bg-gradient-to-br from-[var(--accent)]/20 via-[var(--accent-secondary)]/10 to-transparent blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-[80%] h-[80%] bg-[var(--accent-secondary)] opacity-20 blur-[150px] rounded-full mix-blend-screen" />
      </motion.div>
    ),
  };

  const currentBg = configs[page] || configs['dashboard'];

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1] bg-[var(--bg-main)] transition-colors duration-700 ease-in-out">
      <AnimatePresence mode="wait">
        {currentBg}
      </AnimatePresence>

      {/* Global Subtle Noise/Texture Overlay for Cinematic Feel */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMTUwLDE1MCwxNTAsMC4wMikiLz48L3N2Zz4=')] bg-[length:24px_24px] opacity-100" />
    </div>
  );
};

export default Background;
