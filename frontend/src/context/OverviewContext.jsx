import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import * as dashboardApi from '../services/dashboardApi';
import * as streakApi from '../services/streakApi';
import friendlyError from '../utils/friendlyError';
import useServerClock from '../hooks/useServerClock';
import CpaDemo from '../pages/DailyStreak/CpaDemo.jsx';
import { ICONS, getRewardIcon } from '../assets/icons.js';
import { getCheckInState } from '../utils/streakInsights';

// One place that loads /dashboard + /daily-streak for the signed-in shell, so
// every page (and the header) reads the same real data. Claiming still goes
// through the existing POST /daily-streak/claim endpoint — nothing new on the
// backend, and the server remains the only authority on eligibility.
const OverviewContext = createContext(null);

export function OverviewProvider({ children }) {
  const { pathname } = useLocation();
  const { sync, now } = useServerClock();
  const [dash, setDash] = useState(null);
  const [streakData, setStreakData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [claiming, setClaiming] = useState(false);
  const [claimPhase, setClaimPhase] = useState(null); // null | 'processing' | 'success'
  const [claimError, setClaimError] = useState('');
  const [celebration, setCelebration] = useState(null);
  const [claimCard, setClaimCard] = useState(null); // artwork for the claim modal
  const claimingRef = useRef(false);
  const firstRun = useRef(true);

  const load = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    setError('');
    try {
      // Sequential on purpose: /daily-streak may reset an expired cycle
      // server-side, and /dashboard should read the state after that.
      const s = await streakApi.getStreak();
      const d = await dashboardApi.getDashboard();
      sync(s.serverTime);
      setStreakData(s);
      setDash(d);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  }, [sync]);

  useEffect(() => { load(); }, [load]);

  // Pages such as the classic Daily Streak screen can claim on their own, so
  // refresh quietly whenever the user navigates.
  useEffect(() => {
    if (firstRun.current) { firstRun.current = false; return; }
    load({ silent: true });
  }, [pathname, load]);

  useEffect(() => {
    if (!celebration) return undefined;
    const id = setTimeout(() => setCelebration(null), 7000);
    return () => clearTimeout(id);
  }, [celebration]);

  const checkIn = useCallback(async () => {
    const { state, card } = getCheckInState(streakData);
    if (state !== 'ready' || claimingRef.current) return false; // no duplicate check-ins
    claimingRef.current = true;
    setClaiming(true);
    setClaimError('');
    setClaimCard(card);
    setClaimPhase('processing');
    const minDisplay = new Promise((resolve) => setTimeout(resolve, 1400)); // same cosmetic wait as Daily Streak
    try {
      const [res] = await Promise.all([streakApi.claimStreak(card.day), minDisplay]);
      sync(res.serverTime);
      setStreakData(res);
      try { setDash(await dashboardApi.getDashboard()); } catch (e) { /* dashboard refresh is best-effort */ }
      setClaimPhase('success');
      setCelebration({ day: card.day, reward: card.reward, isUltimate: card.isUltimate });
      setTimeout(() => setClaimPhase(null), 1100);
      return true;
    } catch (err) {
      setClaimPhase(null);
      setClaimError(err?.response?.data?.message || friendlyError(err, 'Unable to check in right now. Please try again.'));
      load({ silent: true }); // reflect the true backend state after a rejected claim
      return false;
    } finally {
      claimingRef.current = false;
      setClaiming(false);
    }
  }, [streakData, sync, load]);

  return (
    <OverviewContext.Provider
      value={{ dash, streakData, loading, error, reload: load, now, checkIn, claiming, claimError, celebration }}
    >
      {children}
      {claimPhase && <CpaDemo phase={claimPhase} icon={claimCard ? getRewardIcon(claimCard) : ICONS.coin} />}
    </OverviewContext.Provider>
  );
}

export const useOverview = () => useContext(OverviewContext);
