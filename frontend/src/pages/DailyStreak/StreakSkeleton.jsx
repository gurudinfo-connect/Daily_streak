import React from 'react';
import styles from './DailyStreak.module.css';

export default function StreakSkeleton() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.skeletonBlock} style={{ width: 160, height: 38 }} />
        <div className={styles.skeletonBlock} style={{ width: 90, height: 38, borderRadius: 999 }} />
      </div>
      <div className={styles.skeletonBlock} style={{ height: 110, marginBottom: 18 }} />
      <div className={styles.statsRow}>
        {[1, 2, 3].map((i) => (
          <div key={i} className={styles.skeletonBlock} style={{ height: 70 }} />
        ))}
      </div>
      <div className={styles.skeletonBlock} style={{ height: 140, marginBottom: 18 }} />
      <div className={styles.grid}>
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className={styles.skeletonBlock} style={{ height: 190 }} />
        ))}
      </div>
    </div>
  );
}
