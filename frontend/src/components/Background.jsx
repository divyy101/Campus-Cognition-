import React from 'react';

/**
 * Background — Clean, minimal application background.
 * Uses a high-opacity cinematic space/galaxy video loop.
 */
const Background = () => {
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: -1, backgroundColor: 'var(--bg)' }}
    >
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 0.6 }} // High opacity for cinematic feel
        src="https://videos.pexels.com/video-files/3141208/3141208-hd_1920_1080_25fps.mp4"
      />
      {/* Dark overlay to ensure text contrast in both light and dark modes */}
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60" />

      {/* Subtle ambient gradient — provides depth */}
      <div
        className="absolute top-0 right-0 w-[60%] h-[50%] rounded-full"
        style={{
          background: 'radial-gradient(ellipse at center, var(--accent-soft) 0%, transparent 70%)',
          opacity: 0.4,
          filter: 'blur(80px)',
          mixBlendMode: 'screen'
        }}
      />
    </div>
  );
};

export default Background;
