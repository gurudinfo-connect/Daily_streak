import React, { useCallback, useEffect, useState } from 'react';
import styles from './DailyStreak.module.css';
import StreakLoader from './StreakLoader.jsx';
import StreakSkeleton from './StreakSkeleton.jsx';
import StreakHero from './StreakHero.jsx';
import Journey from './Journey.jsx';
import Confetti from '../../components/Confetti.jsx';
import friendlyError from '../../utils/friendlyError.js';
import v from './Streak.module.css';
import UltimateReward from './UltimateReward.jsx';
import RewardGrid from './RewardGrid.jsx';
import CpaDemo from './CpaDemo.jsx';
import WhyStreak from './WhyStreak.jsx';
import TrustFooter from './TrustFooter.jsx';
import useServerClock from '../../hooks/useServerClock.js';
import { ICONS, getRewardIcon } from '../../assets/icons.js';
import * as streakApi from '../../services/streakApi.js';

export default function DailyStreakPage() {
  const { sync, now } = useServerClock();
  const [data, setData] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [claimingDay, setClaimingDay] = useState(null);
  const [cpaPhase, setCpaPhase] = useState(null); // null | 'processing' | 'success'

  const applyResponse = useCallback(
    (res) => {
      sync(res.serverTime);
      setData(res);
    },
    [sync]
  );

  const loadFull = useCallback(async () => {
    try {
      const res = await streakApi.getStreak();
      applyResponse(res);
      setError('');
    } catch (err) {
      setError(friendlyError(err));
    }
  }, [applyResponse]);

  const refreshStatusOnly = useCallback(async () => {
    // Used when the visible countdown hits zero — always re-confirm with the
    // backend instead of assuming the reward is now claimable.
    setRefreshing(true);
    try {
      const res = await streakApi.getStreak();
      applyResponse(res);
    } catch (err) {
      // silent — next user action will surface any real error
    } finally {
      setRefreshing(false);
    }
  }, [applyResponse]);

  useEffect(() => {
    loadFull().finally(() => setInitialLoading(false));
  }, [loadFull]);

  const handleClaim = useCallback(
    async (day) => {
      setClaimingDay(day);
      setCpaPhase('processing');
      setError('');

      // Purely cosmetic delay so the CPA/ad placeholder is visible; the
      // actual reward is only ever granted by the awaited API call below.
      const minDisplay = new Promise((resolve) => setTimeout(resolve, 1400));

      try {
        const [res] = await Promise.all([streakApi.claimStreak(day), minDisplay]);
        applyResponse(res);
        setCpaPhase('success');
        setTimeout(() => {
          setCpaPhase(null);
          setClaimingDay(null);
        }, 1100);
      } catch (err) {
        setCpaPhase(null);
        setClaimingDay(null);
        setError(err?.response ? "This reward can't be claimed right now. Please try again." : friendlyError(err));
        // Refresh so the UI reflects the true backend state after a rejected claim
        loadFull();
      }
    },
    [applyResponse, loadFull]
  );

  if (initialLoading) return <StreakLoader />;
  if (!data && error) {
    return (
      <div className={v.page}>
        <div className={styles.errorBanner}>{error} <button className={v.retry} onClick={loadFull}>Try Again</button></div>
      </div>
    );
  }
  if (!data) return <StreakSkeleton />;

  const { streak, nextReward, wallet, rewards } = data;
  const ultimateCard = rewards.find((r) => r.isUltimate);
  const gemBalance = wallet?.VES ?? 0;
  const claimingCard = rewards.find((r) => r.day === claimingDay);

  return (
    <div className={v.page}>
      {error && <div className={styles.errorBanner} role="alert">{error}</div>}

      <StreakHero
        streak={streak}
        nextReward={nextReward}
        wallet={wallet}
        rewards={rewards}
        nowFn={now}
        onClaim={handleClaim}
        onTimerComplete={refreshStatusOnly}
        claimingDay={claimingDay}
      />
      <Journey rewards={rewards} />
      <UltimateReward reward={ultimateCard} />
      <RewardGrid
        rewards={rewards}
        nowFn={now}
        onClaim={handleClaim}
        onTimerComplete={refreshStatusOnly}
        claimingDay={claimingDay}
      />

      <WhyStreak />
      <TrustFooter />

      {cpaPhase && <CpaDemo phase={cpaPhase} icon={claimingCard ? getRewardIcon(claimingCard) : ICONS.coin} />}
      {cpaPhase === 'success' && <Confetti />}
    </div>
  );
}
