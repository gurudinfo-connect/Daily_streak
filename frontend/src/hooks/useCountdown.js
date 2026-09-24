import { useEffect, useState } from 'react';

// Purely visual. Recomputes remaining time every second from a target Date
// and a "now()" function that is itself anchored to server time.
export default function useCountdown(targetDate, nowFn, onComplete) {
  const [remainingMs, setRemainingMs] = useState(() =>
    targetDate ? Math.max(0, targetDate.getTime() - nowFn().getTime()) : 0
  );

  useEffect(() => {
    if (!targetDate) {
      setRemainingMs(0);
      return;
    }
    let done = false;
    const tick = () => {
      const remaining = targetDate.getTime() - nowFn().getTime();
      if (remaining <= 0) {
        setRemainingMs(0);
        if (!done) {
          done = true;
          onComplete && onComplete();
        }
        return;
      }
      setRemainingMs(remaining);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetDate?.getTime()]);

  const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000));
  const hh = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const mm = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const ss = String(totalSeconds % 60).padStart(2, '0');

  return { remainingMs, label: `${hh}:${mm}:${ss}` };
}
