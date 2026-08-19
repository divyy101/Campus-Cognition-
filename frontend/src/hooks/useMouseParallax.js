import { useState, useEffect } from 'react';
import { useSpring } from 'framer-motion';

export const useMouseParallax = (stiffness = 50, damping = 20) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const springX = useSpring(0, { stiffness, damping });
  const springY = useSpring(0, { stiffness, damping });

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Normalize mouse position between -1 and 1
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePos({ x, y });
      springX.set(x);
      springY.set(y);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [springX, springY]);

  return { x: springX, y: springY, rawX: mousePos.x, rawY: mousePos.y };
};
