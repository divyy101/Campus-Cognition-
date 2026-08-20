import React from 'react';

/**
 * Background — Clean, minimal application background.
 * Uses solid --bg color with optional subtle ambient gradient.
 * No videos, no parallax, no particles, no noise.
 */
const Background = () => {
  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: -1, backgroundColor: 'var(--bg)' }}
    >
      {/* Subtle ambient gradient — nearly invisible, provides depth */}
      <div
        className="absolute top-0 right-0 w-[60%] h-[50%] rounded-full"
        style={{
          background: 'radial-gradient(ellipse at center, var(--accent-soft) 0%, transparent 70%)',
          opacity: 0.4,
          filter: 'blur(80px)',
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-[40%] h-[40%] rounded-full"
        style={{
          background: 'radial-gradient(ellipse at center, var(--accent-soft) 0%, transparent 70%)',
          opacity: 0.2,
          filter: 'blur(60px)',
        }}
      />
    </div>
  );
};

export default Background;
