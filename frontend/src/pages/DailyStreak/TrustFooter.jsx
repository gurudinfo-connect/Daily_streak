import React from 'react';
import styles from './DailyStreak.module.css';
import { ICONS } from '../../assets/icons.js';

export default function TrustFooter() {
  return (
    <div className={styles.trustFooter}>
      <span className={styles.trustLeft}>
        <img className={styles.trustIcon} src={ICONS.trust} alt="" />
        <span>
          Official rewards only on <span className={styles.trustBrand}>VeloopRewards.in</span>
        </span>
      </span>
      <span>Stay active, stay rewarded! ›</span>
    </div>
  );
}
