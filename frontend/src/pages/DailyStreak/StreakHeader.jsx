import React from 'react';
import styles from './DailyStreak.module.css';
import { ICONS } from '../../assets/icons.js';

// Logout and dashboard navigation now live in the shared app shell.
export default function StreakHeader({ gemBalance }) {
  return (
    <div className={styles.header}>
      <div className={styles.headerLeft}>
        <div className={styles.headerTitle}>
          My Streak <img className={styles.flameSm} src={ICONS.flame} alt="" />
        </div>
      </div>
      <div className={styles.gemBadge} title="VES balance">
        <img className={styles.coinSm} src={ICONS.coin} alt="VES" />
        {gemBalance}
      </div>
    </div>
  );
}
