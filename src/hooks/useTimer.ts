import { useEffect, useRef, useState } from 'react';

/**
 * A simple count-up timer that ticks every second.
 * Pausing stops accumulation; resetting sets elapsed back to 0.
 */
export function useTimer(paused: boolean) {
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (paused) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [paused]);

  /** Resets the timer to 0. */
  const reset = () => setElapsed(0);

  return { elapsed, reset };
}
