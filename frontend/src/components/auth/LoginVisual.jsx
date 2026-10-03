import React from 'react';
import styles from './LoginVisual.module.css';
import { ICONS } from '../../assets/icons.js';

// Decorative only: a small, static preview of the journey. No streak or reward
// numbers are shown here, so nothing can disagree with the backend.
const NODES = [
  { x: 14, y: 70, art: ICONS.coin, s: 56 },
  { x: 36, y: 44, art: ICONS.day5, s: 64 },
  { x: 60, y: 62, art: ICONS.day4, s: 70 },
  { x: 84, y: 30, art: ICONS.day7, s: 96 },
];

export default function LoginVisual() {
  return (
    <section className={styles.world} aria-hidden="true">
      <div className={styles.stars} />
      <p className={styles.line}>Show up daily.<br />Walk away with rewards.</p>
      <div className={styles.map}>
        <svg className={styles.road} viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M14 70 C25 70 25 44 36 44 S50 62 60 62 S74 30 84 30" />
        </svg>
        {NODES.map((n, i) => (
          <img key={i} className={styles.node} src={n.art} alt="" decoding="async" loading={i === 0 ? 'eager' : 'lazy'}
            style={{ left: `${n.x}%`, top: `${n.y}%`, width: n.s, height: n.s, animationDelay: `${i * -0.7}s` }} />
        ))}
        <img className={styles.runner} src={ICONS.flame} alt="" width="46" height="58" />
      </div>
      <img className={styles.mobileHero} src={ICONS.mobileHero} alt="" decoding="async" />
    </section>
  );
}
