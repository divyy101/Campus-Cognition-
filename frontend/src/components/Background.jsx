import React from 'react';
import { motion } from 'framer-motion';
import { useMouseParallax } from '../hooks/useMouseParallax';

const Background = ({ location }) => {
  let page = location?.pathname?.substring(1).split('/')[0] || 'dashboard';
  if (!page) page = 'dashboard';

  // Use the new reusable parallax hook
  const { rawX, rawY } = useMouseParallax(50, 30);

  // Asset selection based on page
  let atmosphericImage = '/visuals/dashboard-atmosphere.jpg';
  if (page === 'study') atmosphericImage = '/visuals/study-visual.jpg';
  if (page === 'code') atmosphericImage = '/visuals/code-visual.jpg';
  if (page === 'opportunity' || page === 'internship' || page === 'scholarship') atmosphericImage = '/visuals/opportunity-visual.jpg';
  if (page === 'dashboard' || page === 'login' || page === 'register') atmosphericImage = '/visuals/dashboard-atmosphere.jpg';

  // Generate stable random positions for particles (Layer 3)
  const particles = React.useMemo(() => {
    return Array.from({ length: 5 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 15 + 20,
      delay: Math.random() * -20,
    }));
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1] bg-[var(--bg-main)] transition-colors duration-1000 ease-in-out">
      
      {/* LAYER 1: Base Atmosphere (Gradient/Light/Noise) */}
      <motion.div 
        className="absolute inset-0 opacity-40 mix-blend-screen"
        animate={{ 
          x: rawX * -3,
          y: rawY * -3
        }}
        transition={{ type: 'tween', ease: 'easeOut', duration: 4 }}
      >
        <div className="absolute top-[5%] right-[15%] w-[45%] h-[55%] bg-[var(--accent)] opacity-[0.06] blur-[180px] rounded-full transition-colors duration-1000" />
        <div className="absolute bottom-[5%] left-[10%] w-[50%] h-[40%] bg-[var(--accent-secondary)] opacity-[0.04] blur-[150px] rounded-full transition-colors duration-1000" />
      </motion.div>

      {/* LAYER 2: Generated Visual (Atmospheric Depth) */}
      <motion.div 
        className="absolute inset-0 opacity-[0.05] mix-blend-screen transition-opacity duration-1000"
        animate={{ 
          x: rawX * -8,
          y: rawY * -8,
          scale: [1, 1.02, 1]
        }}
        transition={{ 
          scale: { duration: 20, repeat: Infinity, ease: 'easeInOut' },
          x: { type: 'tween', ease: 'easeOut', duration: 3.5 },
          y: { type: 'tween', ease: 'easeOut', duration: 3.5 }
        }}
      >
        <img 
          src={atmosphericImage} 
          alt="Atmosphere" 
          className="w-full h-full object-cover object-center" 
        />
        {/* Deep fade for edges */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-main)] via-transparent to-[var(--bg-main)] opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-main)] via-transparent to-[var(--bg-main)] opacity-80" />
      </motion.div>

      {/* LAYER 3: Dynamic Network & Particles */}
      <motion.div 
        className="absolute inset-0 opacity-[0.08]"
        animate={{ 
          x: rawX * -12,
          y: rawY * -12
        }}
        transition={{ type: 'tween', ease: 'easeOut', duration: 3 }}
      >
        {/* Network Grid */}
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="120" height="120" patternUnits="userSpaceOnUse">
              <path d="M 120 0 L 0 0 0 120" fill="none" stroke="var(--text-secondary)" strokeWidth="0.5" />
              <circle cx="0" cy="0" r="1.5" fill="var(--accent)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Particles */}
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full bg-[var(--accent)]"
            style={{
              top: p.top,
              left: p.left,
              width: p.size,
              height: p.size,
              opacity: 0.3,
              animation: `float ${p.duration}s ease-in-out infinite alternate`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </motion.div>
      
      {/* LAYER 4: Noise Texture + Vignette for Cinematic Feel */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMSkiLz48L3N2Zz4=')] bg-[length:4px_4px] mix-blend-overlay" />
      <div className="absolute inset-0 shadow-[inset_0_0_200px_var(--bg-main)]" />
    </div>
  );
};

export default Background;
