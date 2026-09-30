import React from 'react';
import styles from './AnimatedBackground.module.css';

// Deterministic layers (no randomness => no re-render jitter, SSR-safe).
const DUST = Array.from({ length: 22 }, (_, i) => ({
  left: (i * 37 + 7) % 100,
  size: 2 + (i % 3),
  dur: 26 + ((i * 7) % 22),
  delay: -((i * 5) % 34),
  gold: i % 4 === 0,
}));

const SPARKS = Array.from({ length: 9 }, (_, i) => ({
  left: 6 + ((i * 11) % 88),
  dur: 11 + ((i * 3) % 9),
  delay: -((i * 4) % 17),
  drift: (i % 2 ? 1 : -1) * (14 + (i % 4) * 8),
}));

const GLOW_DOTS = Array.from({ length: 10 }, (_, i) => ({
  left: (i * 23 + 11) % 96,
  top: (i * 31 + 9) % 92,
  size: 4 + (i % 3) * 2,
  dur: 5 + (i % 5),
  delay: -(i % 6),
  gold: i % 3 === 0,
}));

export default function AnimatedBackground() {
  return (
    <div className={styles.bg} aria-hidden="true">
      <div className={styles.glow} />
      <div className={`${styles.blob} ${styles.b1}`} />
      <div className={`${styles.blob} ${styles.b2}`} />
      <div className={`${styles.blob} ${styles.b3}`} />
      <div className={`${styles.wave} ${styles.w1}`} />
      <div className={`${styles.wave} ${styles.w2}`} />
      <span className={`${styles.shape} ${styles.ring}`} style={{ top: '14%', left: '62%' }} />
      <span className={`${styles.shape} ${styles.diamond}`} style={{ top: '68%', left: '8%' }} />
      <span className={`${styles.shape} ${styles.ring} ${styles.small}`} style={{ top: '82%', left: '74%' }} />

      {GLOW_DOTS.map((d, i) => (
        <span
          key={`g${i}`}
          className={`${styles.glowDot} ${d.gold ? styles.gold : ''}`}
          style={{ left: `${d.left}%`, top: `${d.top}%`, width: d.size, height: d.size, animationDuration: `${d.dur}s`, animationDelay: `${d.delay}s` }}
        />
      ))}
      {DUST.map((p, i) => (
        <span
          key={`d${i}`}
          className={`${styles.dust} ${p.gold ? styles.gold : ''}`}
          style={{ left: `${p.left}%`, width: p.size, height: p.size, animationDuration: `${p.dur}s`, animationDelay: `${p.delay}s` }}
        />
      ))}
      {SPARKS.map((s, i) => (
        <span
          key={`s${i}`}
          className={styles.spark}
          style={{ left: `${s.left}%`, animationDuration: `${s.dur}s`, animationDelay: `${s.delay}s`, '--drift': `${s.drift}px` }}
        />
      ))}
    </div>
  );
}
