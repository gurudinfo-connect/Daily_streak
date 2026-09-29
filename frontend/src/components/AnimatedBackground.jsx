import React from 'react';
import styles from './AnimatedBackground.module.css';

// Deterministic particle field (no randomness => no re-render jitter).
const PARTICLES = Array.from({ length: 26 }, (_, i) => ({
  left: (i * 37) % 100,
  size: 2 + (i % 3),
  dur: 22 + ((i * 7) % 20),
  delay: -((i * 5) % 30),
  gold: i % 3 === 0,
  star: i % 4 === 0,
}));

export default function AnimatedBackground() {
  return (
    <div className={styles.bg} aria-hidden="true">
      <div className={`${styles.blob} ${styles.b1}`} />
      <div className={`${styles.blob} ${styles.b2}`} />
      <div className={`${styles.blob} ${styles.b3}`} />
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className={`${styles.dot} ${p.gold ? styles.gold : ''} ${p.star ? styles.star : ''}`}
          style={{ left: `${p.left}%`, width: p.size, height: p.size, animationDuration: `${p.dur}s`, animationDelay: `${p.delay}s` }}
        />
      ))}
    </div>
  );
}
