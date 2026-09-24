import React from 'react';
import styles from './DailyStreak.module.css';
import { ICONS } from '../../assets/icons.js';

const ITEMS = [
  { icon: ICONS.stay, title: 'Stay Active', desc: 'Keep your streak alive & earn more!' },
  { icon: ICONS.bigger, title: 'Bigger Streak', desc: 'More consecutive logins, bigger rewards!' },
  { icon: ICONS.exclusive, title: 'Exclusive Rewards', desc: 'Get coins, gift cards & special bonuses!' },
  { icon: ICONS.trust, title: "Don't Miss Out", desc: 'Come back every day & unlock all rewards!' },
];

export default function WhyStreak() {
  return (
    <div className={styles.whyGrid}>
      {ITEMS.map((item) => (
        <div key={item.title} className={styles.whyCard}>
          <img className={styles.whyIcon} src={item.icon} alt="" loading="lazy" draggable="false" />
          <div className={styles.whyTitle}>{item.title}</div>
          <div className={styles.whyDesc}>{item.desc}</div>
        </div>
      ))}
    </div>
  );
}
