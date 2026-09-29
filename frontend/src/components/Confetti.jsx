import React from 'react';
import styles from './Confetti.module.css';

const COLORS = ['#ffc62e', '#8b5cf6', '#ffd75a', '#6c3bff', '#fff'];
const PIECES = Array.from({ length: 36 }, (_, i) => ({
  left: (i * 29) % 100, delay: (i % 9) * 0.07, dur: 1.6 + (i % 5) * 0.25, color: COLORS[i % 5], rot: (i * 47) % 360,
}));

// Lightweight CSS confetti, mounted only when a reward has genuinely just been granted.
export default function Confetti() {
  return (
    <div className={styles.wrap} aria-hidden="true">
      {PIECES.map((p, i) => (
        <i key={i} style={{ left: `${p.left}%`, background: p.color, animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s`, '--r': `${p.rot}deg` }} />
      ))}
    </div>
  );
}
