import { useState, useEffect, useRef } from 'react';

/**
 * Shared animation loop hook used by circuit lab components.
 * Increments a time counter at ~60fps using requestAnimationFrame.
 */
export function useAnimationLoop(step = 0.02) {
  const [animTime, setAnimTime] = useState(0);
  const animRef = useRef<number>(0);

  useEffect(() => {
    let running = true;
    const loop = () => {
      if (!running) return;
      setAnimTime(t => t + step);
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => {
      running = false;
      cancelAnimationFrame(animRef.current);
    };
  }, [step]);

  return animTime;
}
