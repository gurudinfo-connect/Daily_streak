import React, { useCallback, useEffect, useState } from 'react';
import styles from './DailyStreak.module.css';
import StreakLoader from './StreakLoader.jsx';
import StreakSkeleton from './StreakSkeleton.jsx';
import StreakHeader from './StreakHeader.jsx';
import HeroBanner from './HeroBanner.jsx';
import StreakStats from './StreakStats.jsx';
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
      setError(err?.response?.data?.message || 'Unable to load your streak. Please try again.');
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
        setError(err?.response?.data?.message || 'Unable to process your reward. Please try again.');
        // Refresh so the UI reflects the true backend state after a rejected claim
        loadFull();
      }
    },
    [applyResponse, loadFull]
  );

  if (initialLoading) return <StreakLoader />;
  if (!data && error) {
    return (
      <div className={styles.page}>
        <div className={styles.errorBanner}>{error}</div>
      </div>
    );
  }
  if (!data) return <StreakSkeleton />;

  const { streak, nextReward, wallet, rewards } = data;
  const ultimateCard = rewards.find((r) => r.isUltimate);
  const gemBalance = wallet?.VES ?? 0;
  const claimingCard = rewards.find((r) => r.day === claimingDay);

  return (
    <div className={styles.page}>
      <StreakHeader gemBalance={gemBalance} />
      <HeroBanner />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <span className={styles.streakLine}><img className={styles.flameSm} src={ICONS.flame} alt="" /> {streak.currentStreak} Day Streak</span>
        <span style={{ color: 'var(--vl-text-dim)', fontSize: '0.8rem' }}>Keep it going!</span>
      </div>

      {error && <div className={styles.errorBanner}>{error}</div>}

      <StreakStats totalRewards={streak.totalRewards} checkedIn={streak.checkedIn} nextReward={nextReward} />
      <UltimateReward reward={ultimateCard} />

      <div className={styles.comeback}>✦ Come back tomorrow for more rewards! ✦</div>

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
    </div>
  );
}
