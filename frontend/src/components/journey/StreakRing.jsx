import React, { memo } from 'react';
import styles from './StreakRing.module.css';
import { ICONS } from '../../assets/icons.js';

// 7-segment progress ring. `done` and `total` come from the caller: the
// dashboard passes backend values, the login page passes a decorative preview.
function StreakRing({ total = 7, done = 0, value, label = 'days in', sub, size = 'lg', intro = false, flameSrc = ICONS.flame }) {
  const gap = 2.2;
  const seg = 100 / total - gap;
  return (
    <div className={`${styles.ring} ${styles[size]} ${intro ? styles.intro : ''}`} role="img" aria-label={`${value} ${label}${sub ? `, ${sub}` : ''}`}>
      <svg viewBox="0 0 400 400" className={styles.svg} aria-hidden="true">
        <defs>
          <linearGradient id="vlRingA" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#5ee6d0" /><stop offset="1" stopColor="#ffc24a" /></linearGradient>
        </defs>
        {Array.from({ length: total }, (_, i) => (
          <circle key={i} cx="200" cy="200" r="160" pathLength="100" transform={`rotate(${-90 + (i * 360) / total + 4} 200 200)`}
            className={`${styles.seg} ${i < done ? styles.on : ''} ${i === done ? styles.cur : ''}`}
            strokeDasharray={`${seg} ${100 - seg}`} style={{ '--i': i }} />
        ))}
      </svg>
      <div className={styles.core}>
        <img className={styles.flame} src={flameSrc} alt="" width="84" height="104" />
        <div className={styles.digits}>
          {intro ? <span className={styles.roll}><i>1</i><i>2</i><i>{value}</i></span> : <span>{value}</span>}
        </div>
        <div className={styles.label}>{label}</div>
        {sub && <div className={styles.sub}>{sub}</div>}
      </div>
    </div>
  );
}
export default memo(StreakRing);
