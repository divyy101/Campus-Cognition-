import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const Background = ({ location }) => {
  let page = location?.pathname?.substring(1).split('/')[0] || 'dashboard';
  if (!page) page = 'dashboard';

  // State for subtle mouse parallax
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Normalize mouse position between -1 and 1
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Generate stable random positions for particles
  const particles = React.useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 1.5 + 0.5,
      duration: Math.random() * 15 + 20,
      delay: Math.random() * -20,
    }));
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1] bg-[var(--bg-main)] transition-colors duration-1000 ease-in-out">
      
      {/* Deep Environment Lighting Layer */}
      <motion.div 
        className="absolute inset-0"
        animate={{ 
          x: mousePos.x * -5,
          y: mousePos.y * -5
        }}
        transition={{ type: 'tween', ease: 'easeOut', duration: 4 }}
      >
        {/* Very subtle environmental light sources */}
        <div className="absolute top-[5%] right-[15%] w-[45%] h-[55%] bg-[var(--accent)] opacity-[0.03] blur-[180px] rounded-full mix-blend-screen transition-colors duration-1000" />
        <div className="absolute bottom-[5%] left-[10%] w-[50%] h-[40%] bg-[var(--accent-secondary)] opacity-[0.02] blur-[150px] rounded-full mix-blend-screen transition-colors duration-1000" />
      </motion.div>

      {/* Abstract Intelligence Network (SVG) */}
      <motion.div 
        className="absolute inset-0 opacity-[0.05]"
        animate={{ 
          x: mousePos.x * -10,
          y: mousePos.y * -10
        }}
        transition={{ type: 'tween', ease: 'easeOut', duration: 3 }}
      >
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="120" height="120" patternUnits="userSpaceOnUse">
              <path d="M 120 0 L 0 0 0 120" fill="none" stroke="var(--text-secondary)" strokeWidth="0.5" />
              <circle cx="0" cy="0" r="1.5" fill="var(--accent)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </motion.div>

      {/* Mid Layer - Very Subtle Particles */}
      <motion.div 
        className="absolute inset-0"
        animate={{ 
          x: mousePos.x * -15,
          y: mousePos.y * -15
        }}
        transition={{ type: 'tween', ease: 'easeOut', duration: 2.5 }}
      >
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full bg-[var(--accent)]"
            style={{
              top: p.top,
              left: p.left,
              width: p.size,
              height: p.size,
              opacity: 0.15,
              animation: `float ${p.duration}s ease-in-out infinite alternate`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </motion.div>
      
      {/* Noise Texture for Cinematic Feel */}
      <div className="absolute inset-0 opacity-[0.02] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMSkiLz48L3N2Zz4=')] bg-[length:4px_4px] mix-blend-overlay" />
      
      {/* Soft Vignette */}
      <div className="absolute inset-0 shadow-[inset_0_0_200px_var(--bg-main)]" />
    </div>
  );
};

export default Background;
