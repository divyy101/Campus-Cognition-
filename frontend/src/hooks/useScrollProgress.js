import { useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

export const useScrollProgress = (offset = ["start end", "end start"]) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: offset
  });

  return { ref, scrollYProgress };
};
