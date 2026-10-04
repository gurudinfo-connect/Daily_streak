import React, { useRef } from 'react';
import styles from './LoginVisual.module.css';
import { ICONS } from '../../assets/icons.js';
import BrandLogo from '../BrandLogo.jsx';
import useLite from '../../hooks/useLite.js';
import usePauseOffscreen from '../../hooks/usePauseOffscreen.js';

// Purely decorative "climb to the crown" loop. Nothing here is account data,
// and every animation is CSS transform/opacity so it runs on the compositor.
const STEPS = Array.from({ length: 7 }, (_, i) => i);
const SPARKS = Array.from({ length: 10 }, (_, i) => {
  const a = (i / 10) * Math.PI * 2;
  return { x: +(Math.cos(a) * 1.7).toFixed(2), y: +(Math.sin(a) * 1.3 - 0.4).toFixed(2) };
});

export default function LoginVisual() {
  const ref = useRef(null);
  const lite = useLite();
  usePauseOffscreen(ref);
  return (
    <section ref={ref} className={`${styles.world} ${lite ? styles.lite : ''}`} aria-hidden="true">
      <div className={styles.aurora} />
      <div className={styles.beam} />
      <div className={styles.brand}><BrandLogo size="md" /></div>

      <div className={styles.stage}>
        <div className={styles.stairs}>
          {STEPS.map((i) => (
            <div key={i} className={`${styles.step} ${styles['s' + i]}`} style={{ '--i': i }}>
              <span className={styles.num}>{i + 1}</span>
              <img className={`${styles.coin} ${styles['c' + i]}`} src={ICONS.coin} alt="" width="40" height="32" decoding="async" />
            </div>
          ))}
          <div className={styles.crownBox}>
            <img className={styles.crown} src={ICONS.topRight} alt="" width="700" height="406" decoding="async" />
            {SPARKS.map((s, i) => <i key={i} className={styles.spark} style={{ '--sx': s.x, '--sy': s.y }} />)}
          </div>
          <div className={styles.hero}><img src={ICONS.flame} alt="" width="52" height="64" decoding="async" /></div>
        </div>
        {!lite && (
          <>
            <img className={`${styles.fl} ${styles.cal}`} src={ICONS.stay} alt="" width="110" height="107" decoding="async" />
            <img className={`${styles.fl} ${styles.gift}`} src={ICONS.exclusive} alt="" width="120" height="94" decoding="async" />
            <img className={`${styles.fl} ${styles.shield}`} src={ICONS.trust} alt="" width="90" height="75" decoding="async" />
          </>
        )}
      </div>

      <div className={styles.copy}>
        <h2 className={styles.head} aria-label="Climb the streak.">
          {['Climb', 'the', 'streak.'].map((w, i) => <span key={i} className={styles.word}><i style={{ animationDelay: `${0.15 + i * 0.12}s` }}>{w}</i></span>)}
        </h2>
        <p className={styles.sub}>Seven steps. Bigger drops. One crown.</p>
      </div>
    </section>
  );
}
