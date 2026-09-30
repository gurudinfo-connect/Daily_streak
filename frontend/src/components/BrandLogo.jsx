import React from 'react';
import { Flame } from 'lucide-react';
import styles from './BrandLogo.module.css';

// 🔥 VELOop / FIRE STREAK — keeps the existing lucide Flame icon.
export default function BrandLogo({ size = 'md', tagline = false, center = false }) {
  return (
    <span className={`${styles.logo} ${styles[size]} ${center ? styles.center : ''}`}>
      <span className={styles.badge} aria-hidden="true"><Flame className={styles.flame} /></span>
      <span className={styles.text}>
        <span className={styles.name}>VELOop</span>
        <span className={styles.product}>FIRE STREAK</span>
        {tagline && <span className={styles.tag}>Build your streak. Earn your rewards.</span>}
      </span>
    </span>
  );
}
