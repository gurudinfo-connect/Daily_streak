import { useCallback, useRef } from 'react';

// Tracks the offset between the backend's serverTime and this device's
// clock. Every countdown in the app is computed as (target - (Date.now() +
// offset)) instead of trusting the device clock directly, so changing your
// phone/PC time does nothing to the displayed countdown or claim eligibility
// — the backend re-checks server time again anyway when Claim is pressed.
export default function useServerClock() {
  const offsetRef = useRef(0);

  const sync = useCallback((serverTimeIso) => {
    const serverMs = new Date(serverTimeIso).getTime();
    offsetRef.current = serverMs - Date.now();
  }, []);

  const now = useCallback(() => new Date(Date.now() + offsetRef.current), []);

  return { sync, now };
}
