import React from 'react';
import styles from './BrandLogo.module.css';
import fireLogo from '../assets/veloop-fire.png';

// 🔥 VELoop / Daily Streak — brand mark is the supplied fire logo.
export default function BrandLogo({ size = 'md', tagline = false, center = false }) {
  return (
    <span className={`${styles.logo} ${styles[size]} ${center ? styles.center : ''}`}>
      <img className={styles.mark} src={fireLogo} alt="" aria-hidden="true" />
      <span className={styles.text}>
        <span className={styles.name}>VELoop</span>
        <span className={styles.product}>Daily Streak</span>
        {tagline && <span className={styles.tag}>Build your streak. Earn your rewards.</span>}
      </span>
    </span>
  );
}
