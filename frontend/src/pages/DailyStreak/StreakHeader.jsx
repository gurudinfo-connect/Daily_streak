import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './DailyStreak.module.css';
import { ICONS } from '../../assets/icons.js';

export default function StreakHeader({ gemBalance }) {
  const navigate = useNavigate();
  return (
    <div className={styles.header}>
      <div className={styles.headerLeft}>
        <button className={styles.backBtn} onClick={() => navigate(-1)} aria-label="Back">
          <ChevronLeft size={20} />
        </button>
        <div className={styles.headerTitle}>
          Daily Streak <img className={styles.flameSm} src={ICONS.flame} alt="" />
        </div>
      </div>
      <div className={styles.gemBadge} title="VES balance">
        <img className={styles.coinSm} src={ICONS.coin} alt="VES" />
        {gemBalance}
      </div>
    </div>
  );
}
