import React, { memo } from 'react';
import styles from './Walker.module.css';

// "Courier": a tiny space-courier with a glowing visor, flowing cape, antenna bulb and coin satchel.
// Origin (0,0) = feet. ~100px tall at scale 1; callers scale him down.
function Walker({ walking = true, speed = 0.7 }) {
  return (
    <g className={`${styles.w} ${walking ? styles.go : ''}`} style={{ '--sp': `${speed}s` }}>
      <ellipse cx="0" cy="1" rx="16" ry="3.5" className={styles.shadow} />
      <g className={styles.body}>
        <path className={styles.cape} d="M-6 -62 Q-34 -50 -30 -20 Q-18 -34 -8 -34Z" fill="#ff4f9a" />
        <g transform="translate(0 -34)"><g className={styles.legB}><rect x="-4" width="8" height="30" rx="4" fill="#1e1b5e" /><rect x="-4" y="26" width="13" height="8" rx="4" fill="#ffc24a" /></g></g>
        <g transform="translate(0 -34)"><g className={styles.legA}><rect x="-4" width="8" height="30" rx="4" fill="#2f2c8f" /><rect x="-4" y="26" width="13" height="8" rx="4" fill="#ffd86a" /></g></g>
        <g className={styles.torso}>
          <rect x="-15" y="-56" width="11" height="18" rx="4" fill="#ffc24a" />
          <rect x="-9" y="-64" width="21" height="32" rx="9" fill="#6d4aff" />
          <circle cx="2" cy="-48" r="5" fill="#ffd86a" /><circle cx="2" cy="-48" r="2.4" fill="#c98a12" />
          <g transform="translate(0 -60)"><g className={styles.arm}><rect x="-3.5" width="7" height="22" rx="3.5" fill="#8a6bff" /><circle cy="23" r="4.5" fill="#ffd86a" /></g></g>
          <line x1="2" y1="-90" x2="-3" y2="-101" stroke="#cfc8ff" strokeWidth="2" strokeLinecap="round" />
          <circle cx="-3" cy="-102" r="3.4" className={styles.bulb} />
          <circle cx="3" cy="-78" r="14" fill="#efeaff" />
          <ellipse cx="8" cy="-78" rx="9" ry="7" fill="#0b1230" />
          <ellipse cx="10" cy="-78" rx="6" ry="4.4" className={styles.visor} />
          <circle cx="12" cy="-80" r="1.6" fill="#fff" />
        </g>
      </g>
    </g>
  );
}
export default memo(Walker);
