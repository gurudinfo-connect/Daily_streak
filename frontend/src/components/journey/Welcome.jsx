import React, { memo, useRef } from 'react';
import styles from './Welcome.module.css';
import { ICONS } from '../../assets/icons.js';

// The day number is a glass vessel. Gold liquid rises to (day / total), coins drop in and ripple.
function Welcome({ name, day, total, chain, banked, next, message }) {
  const ref = useRef(null);
  const frac = Math.min(1, Math.max(0, day / total));
  const lvl = Math.round(212 - 190 * frac);
  const d = String(day).padStart(2, '0');
  const move = (e) => {
    const r = ref.current.getBoundingClientRect();
    ref.current.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
    ref.current.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
  };
  const wave = 'M0 0Q42.5 -16 85 0T170 0T255 0T340 0T425 0T510 0T595 0T680 0V400H0Z';
  return (
    <section ref={ref} onMouseMove={move} className={styles.scene} aria-label="Welcome">
      <div className={styles.aurora} />
      <div className={styles.copy}>
        <h1 className={styles.h} aria-label={`Welcome back, ${name}.`}>
          {`Welcome back, ${name}.`.split('').map((c, i) => <span key={i} aria-hidden="true" style={{ animationDelay: `${.15 + i * .04}s` }}>{c === ' ' ? '\u00a0' : c}</span>)}
        </h1>
        <p className={styles.msg}>{message}</p>
        <ol className={styles.pips} aria-label={`Stop ${day} of ${total}`}>
          {Array.from({ length: total }, (_, i) => <li key={i} className={i < day - 1 ? styles.done : i === day - 1 ? styles.now : ''} style={{ animationDelay: `${1.6 + i * .12}s` }} />)}
        </ol>
        <dl className={styles.facts}>
          <div><dt>Streak</dt><dd>{chain} days</dd></div>
          <div><dt>Backpack</dt><dd>{banked} VES</dd></div>
          {next && <div><dt>Next drop</dt><dd className={styles.gold}>{next}</dd></div>}
        </dl>
      </div>
      <div className={styles.vessel}>
        <svg viewBox="0 0 360 250" className={styles.svg} role="img" aria-label={`Stop ${d} of ${total}`}>
          <defs>
            <linearGradient id="wvGold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffe27a" /><stop offset="1" stopColor="#ff9a1f" /></linearGradient>
            <clipPath id="wvClip"><text x="4" y="222" className={styles.num}>{d}</text></clipPath>
          </defs>
          <text x="4" y="222" className={styles.outline}>{d}</text>
          <g clipPath="url(#wvClip)">
            <rect width="360" height="250" fill="rgba(255,255,255,.05)" />
            <g className={styles.liq} style={{ '--lvl': `${lvl}px` }}>
              <path d={wave} className={styles.waveB} />
              <path d={wave} className={styles.waveA} />
              {[40, 95, 150, 215, 270, 310].map((x, i) => <circle key={x} cx={x} cy={150} r={3 + (i % 3)} className={styles.bub} style={{ animationDelay: `${i * .6}s` }} />)}
            </g>
          </g>
          {[70, 160, 240].map((x, i) => <image key={x} href={ICONS.coin} x={x - 18} y="-30" width="36" height="30" className={styles.coin} style={{ '--lvl': `${lvl}px`, animationDelay: `${.9 + i * .55}s` }} />)}
        </svg>
        <span className={styles.of}>of {String(total).padStart(2, '0')} stops</span>
      </div>
    </section>
  );
}
export default memo(Welcome);
