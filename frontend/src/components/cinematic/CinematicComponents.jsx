import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useMouseParallax } from '../../hooks/useMouseParallax';
import { useScrollProgress } from '../../hooks/useScrollProgress';

export const CinematicReveal = ({ children, delay = 0, duration = 0.8, direction = 'up', className = '' }) => {
  const initialY = direction === 'up' ? 20 : direction === 'down' ? -20 : 0;
  const initialX = direction === 'left' ? 20 : direction === 'right' ? -20 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: initialY, x: initialX }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const ParallaxLayer = ({ children, speed = 1, className = '', zIndex = 0 }) => {
  const { x, y } = useMouseParallax(50, 30);
  const xOffset = useTransform(x, [-1, 1], [-20 * speed, 20 * speed]);
  const yOffset = useTransform(y, [-1, 1], [-20 * speed, 20 * speed]);

  return (
    <motion.div
      style={{ x: xOffset, y: yOffset, zIndex }}
      className={`absolute inset-0 pointer-events-none ${className}`}
    >
      {children}
    </motion.div>
  );
};

export const FloatingVisual = ({ src, alt, speed = 'slow', className = '', style = {} }) => {
  const floatClass = speed === 'slow' ? 'animate-float-slow' : speed === 'medium' ? 'animate-float-medium' : 'animate-float-fast';
  
  return (
    <div className={`relative pointer-events-none ${className}`} style={style}>
      <motion.img 
        src={src} 
        alt={alt}
        className={`w-full h-full object-cover object-center rounded-3xl ${floatClass}`}
        style={{ backgroundSize: 'cover', backgroundPosition: 'center' }}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />
    </div>
  );
};

export const ScrollSection = ({ children, className = '' }) => {
  const { ref, scrollYProgress } = useScrollProgress(["start end", "end start"]);
  
  // Keep y movement subtle so content stays in viewport
  const yOffset = useTransform(scrollYProgress, [0, 1], [20, -20]);
  // Never go fully transparent — min opacity 0.4 keeps content and buttons always visible
  const opacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0.4, 1, 1, 0.6]);

  return (
    <motion.div ref={ref} style={{ y: yOffset, opacity }} className={className}>
      {children}
    </motion.div>
  );
};


export const AgentStatusIndicator = ({ status = 'active', type = 'study' }) => {
  let colorVar = 'var(--accent)';
  if (type === 'study') colorVar = 'var(--cinematic-gold)';
  if (type === 'code') colorVar = 'var(--cinematic-cyan)';
  if (type === 'opportunity') colorVar = 'var(--cinematic-coral)';

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex items-center justify-center w-3 h-3">
        {status === 'active' && (
          <>
            <motion.div 
              className="absolute inset-0 rounded-full"
              style={{ backgroundColor: colorVar }}
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="w-1.5 h-1.5 rounded-full z-10" style={{ backgroundColor: colorVar }} />
          </>
        )}
        {status === 'analyzing' && (
          <motion.div 
            className="w-3 h-3 border-2 border-transparent rounded-full border-t-current"
            style={{ color: colorVar }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        )}
        {status === 'searching' && (
          <motion.div 
            className="w-2 h-2 rounded-sm rotate-45"
            style={{ backgroundColor: colorVar }}
            animate={{ scale: [1, 1.4, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">
        {status}
      </span>
    </div>
  );
};
