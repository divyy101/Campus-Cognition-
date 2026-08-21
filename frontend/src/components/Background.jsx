import React from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Background — Clean, minimal application background.
 * Uses a high-opacity cinematic space/galaxy video loop, changing based on the route.
 */
const Background = () => {
  const location = useLocation();
  const path = location.pathname.toLowerCase();

  // Determine video based on route
  let videoSrc = "https://videos.pexels.com/video-files/3141208/3141208-hd_1920_1080_25fps.mp4"; // Default: Galaxy/Space

  if (path.includes('study')) {
    // Abstract neural/plexus video for Study Agent
    videoSrc = "https://videos.pexels.com/video-files/3129671/3129671-hd_1920_1080_30fps.mp4";
  } else if (path.includes('code-lab') || path.includes('agent') && !path.includes('internship') && !path.includes('opportunit') && !path.includes('scholarship')) {
    // Hacker / Code stream for Code Lab and other generic agents
    videoSrc = "https://videos.pexels.com/video-files/5377684/5377684-hd_1920_1080_25fps.mp4";
  } else if (path.includes('internship')) {
    // Office / working for Internship
    videoSrc = "https://videos.pexels.com/video-files/3129977/3129977-hd_1920_1080_30fps.mp4";
  } else if (path.includes('opportunit')) {
    // Networking / Global / Tech for Opportunity
    videoSrc = "https://videos.pexels.com/video-files/3163534/3163534-hd_1920_1080_30fps.mp4";
  } else if (path.includes('scholarship')) {
    // Library / Academia for Scholarship
    videoSrc = "https://videos.pexels.com/video-files/2715410/2715410-hd_1920_1080_25fps.mp4";
  }

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: -1, backgroundColor: 'var(--bg)' }}
    >
      <video
        key={videoSrc} // Force re-render of video element when source changes
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
        style={{ opacity: 0.8 }} // Increased opacity for richer cinematic feel as requested
        src={videoSrc}
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
