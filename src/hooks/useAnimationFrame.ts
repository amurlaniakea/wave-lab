import { useEffect, useRef } from 'react';

export function useAnimationFrame(callback: (dt: number) => void, active = true) {
  const requestRef = useRef<number>(0);
  const previousTimeRef = useRef<number>(0);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!active) return;

    const animate = (time: number) => {
      if (previousTimeRef.current !== 0) {
        const dt = Math.min((time - previousTimeRef.current) / 1000, 0.05);
        callbackRef.current(dt);
      }
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(requestRef.current);
      previousTimeRef.current = 0;
    };
  }, [active]);
}
