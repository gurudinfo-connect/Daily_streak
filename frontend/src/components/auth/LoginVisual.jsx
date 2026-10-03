import React from 'react';
import styles from './LoginVisual.module.css';
import { ICONS } from '../../assets/icons.js';
import StreakRing from '../journey/StreakRing.jsx';
import BrandLogo from '../BrandLogo.jsx';

// Decorative preview of the product. The "3 days in" ring is illustration only —
// it is not account data and nothing here is read from or sent to the backend.
export default function LoginVisual() {
  return (
    <section className={styles.world} aria-hidden="true">
      <div className={styles.glow} />
      <div className={styles.dots} />
      <div className={styles.brand}><BrandLogo size="md" /></div>

      <div className={styles.stage}>
        <span className={styles.orbit} />
        <span className={`${styles.orbit} ${styles.orbit2}`}><i /></span>
        <div className={styles.ringBox}><StreakRing intro total={7} done={3} value={3} /></div>
        <img className={`${styles.fl} ${styles.cal}`} src={ICONS.stay} alt="" width="110" height="107" />
        <img className={`${styles.fl} ${styles.gift}`} src={ICONS.exclusive} alt="" width="120" height="94" />
        <img className={`${styles.fl} ${styles.coin}`} src={ICONS.coin} alt="" width="130" height="105" />
        <img className={`${styles.fl} ${styles.crown}`} src={ICONS.topRight} alt="" width="330" height="190" />
      </div>

      <div className={styles.copy}>
        <h2 className={styles.head}>Keep the chain alive.</h2>
        <p className={styles.sub}>Seven days. Bigger drops. One final vault.</p>
        <div className={styles.bar}>{Array.from({ length: 7 }, (_, i) => <span key={i} style={{ '--i': i }} className={i < 4 ? styles.lit : ''} />)}</div>
      </div>
    </section>
  );
}
