import React from 'react';
import styles from './DailyStreak.module.css';
import { ICONS } from '../../assets/icons.js';

export default function StreakStats({ totalRewards, checkedIn, nextReward }) {
  return (
    <div className={styles.statsRow}>
      <div className={styles.statCard}>
        <div className={styles.statLabel}><img className={styles.statIcon} src={ICONS.exclusive} alt="" /> Total Rewards</div>
        <div className={styles.statValue}>{totalRewards}</div>
      </div>
      <div className={styles.statCard}>
        <div className={styles.statLabel}><img className={styles.statIcon} src={ICONS.stay} alt="" /> Checked In</div>
        <div className={styles.statValue}>{checkedIn}</div>
      </div>
      <div className={styles.statCard}>
        <div className={styles.statLabel}><img className={styles.statIcon} src={ICONS.coin} alt="" /> Next Reward</div>
        <div className={styles.statValue}>
          {nextReward ? `+${nextReward.amount} ${nextReward.currency}` : '—'}
        </div>
      </div>
    </div>
  );
}
