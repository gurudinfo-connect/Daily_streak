import React, { memo } from 'react';
import styles from './Walker.module.css';

// A small traveller drawn in SVG. Origin (0,0) is the feet; the figure stands ~74px tall.
// `walking` swings the limbs; when false he stands and breathes.
function Walker({ walking = true, speed = 0.7 }) {
  return (
    <g className={`${styles.w} ${walking ? styles.go : ''}`} style={{ '--sp': `${speed}s` }}>
      <ellipse cx="0" cy="1" rx="17" ry="4" className={styles.shadow} />
      <g className={styles.body}>
        <g transform="translate(0 -34)"><g className={styles.legB}><rect x="-4" y="0" width="8" height="32" rx="4" fill="#3b2a8f" /><rect x="-4" y="28" width="13" height="6" rx="3" fill="#1a1238" /></g></g>
        <g transform="translate(0 -34)"><g className={styles.legA}><rect x="-4" y="0" width="8" height="32" rx="4" fill="#5a43d6" /><rect x="-4" y="28" width="13" height="6" rx="3" fill="#2a1d5e" /></g></g>
        <g className={styles.torso}>
          <rect x="-17" y="-62" width="14" height="30" rx="6" fill="#ffb02e" />
          <rect x="-9" y="-64" width="20" height="32" rx="8" fill="#ffc24a" />
          <g transform="translate(0 -58)"><g className={styles.arm}><rect x="-3.5" y="0" width="7" height="24" rx="3.5" fill="#f1a61f" /><circle cx="0" cy="25" r="4" fill="#f2c9a0" /></g></g>
          <circle cx="3" cy="-76" r="11" fill="#f2c9a0" />
          <path d="M-8 -78 a11 11 0 0 1 22 -2 q-6 -6 -22 2z" fill="#2a1d5e" />
          <rect x="4" y="-80" width="9" height="3" rx="1.5" fill="#6d4aff" />
          <circle cx="8" cy="-75" r="1.4" fill="#20140a" />
        </g>
      </g>
    </g>
  );
}
export default memo(Walker);
