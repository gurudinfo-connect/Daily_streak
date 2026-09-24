import React from 'react';
import styles from './DailyStreak.module.css';
import useMediaQuery from '../../hooks/useMediaQuery.js';
import { ICONS } from '../../assets/icons.js';

export default function HeroBanner() {
  const isMobile = useMediaQuery('(max-width: 600px)');

  // Mobile uses the supplied full-width banner artwork (text is baked in).
  if (isMobile) {
    return (
      <img
        className={styles.heroMobile}
        src={ICONS.mobileHero}
        alt="Login daily and earn bigger rewards! Maintain your streak and unlock exciting rewards every day."
      />
    );
  }

  return (
    <div className={styles.hero}>
      <img className={styles.heroArt} src={ICONS.topLeft} alt="" draggable="false" />
      <div className={styles.heroText}>
        <div className={styles.heroTitle}>
          Login Daily &amp; Earn <span className={styles.heroTitleAccent}>Bigger Rewards!</span>
        </div>
        <div className={styles.heroSubtitle}>
          Maintain your streak and unlock exciting rewards every day.
        </div>
      </div>
      <img className={styles.heroArt} src={ICONS.topRight} alt="" draggable="false" />
    </div>
  );
}
