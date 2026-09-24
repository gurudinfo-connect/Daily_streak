import React from 'react';
import styles from './DailyStreak.module.css';
import { getRewardIcon } from '../../assets/icons.js';

export default function UltimateReward({ reward }) {
  if (!reward) return null;
  return (
    <div className={styles.ultimate}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <img className={styles.ultimateArt} src={getRewardIcon(reward)} alt="Ultimate reward" draggable="false" />
        <div>
          <div className={styles.ultimateLabel}>Ultimate Reward</div>
          <div className={styles.ultimateAmount}>
            {reward.reward.currency === 'INR' ? `₹${reward.reward.amount}` : `+${reward.reward.amount}`}
          </div>
          <div className={styles.ultimateSub}>{reward.reward.subtitle || reward.reward.title}</div>
        </div>
      </div>
      <div className={styles.ultimateUnlock}>
        Unlock on
        <div className={styles.ultimateUnlockDay}>Day {reward.day}</div>
      </div>
    </div>
  );
}
