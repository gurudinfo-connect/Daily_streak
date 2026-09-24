import React from 'react';
import styles from './DailyStreak.module.css';
import { ICONS } from '../../assets/icons.js';

export default function StreakLoader() {
  return (
    <div className={styles.loaderWrap}>
      <img className={styles.loaderIcon} src={ICONS.coin} alt="" />
      <div className={styles.loaderText}>Loading your streak…</div>
    </div>
  );
}
