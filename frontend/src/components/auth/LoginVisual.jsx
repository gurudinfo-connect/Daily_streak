import React from 'react';
import styles from './LoginVisual.module.css';
import { ICONS } from '../../assets/icons.js';
import Walker from '../journey/Walker.jsx';
import BrandLogo from '../BrandLogo.jsx';

// Decorative only: a traveller walks a night road collecting coins. Nothing here is account data.
export default function LoginVisual() {
  return (
    <section className={styles.world} aria-hidden="true">
      <div className={styles.moon} />
      <div className={styles.dots} />
      <div className={styles.brand}><BrandLogo size="md" /></div>

      <div className={styles.scene}>
        <svg className={`${styles.layer} ${styles.far}`} viewBox="0 0 1200 200" preserveAspectRatio="none"><path d="M0 200V120Q150 40 300 110T600 100T900 110T1200 120V200Z" /></svg>
        <svg className={`${styles.layer} ${styles.mid}`} viewBox="0 0 1200 200" preserveAspectRatio="none"><path d="M0 200V140Q120 90 260 140T520 130T780 140T1040 130T1200 140V200Z" /></svg>
        <div className={styles.road}><span /></div>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={styles.pick} style={{ animationDelay: `${i * 2.4}s` }}>
            <img src={ICONS.coin} alt="" width="54" height="44" />
            <b style={{ animationDelay: `${i * 2.4}s` }}>+{[5, 10, 15, 30][i]}</b>
          </div>
        ))}
        <svg className={styles.man} viewBox="-30 -100 60 110"><Walker walking speed={0.6} /></svg>
        <img className={styles.crown} src={ICONS.day7} alt="" width="120" height="120" />
      </div>

      <div className={styles.copy}>
        <h2 className={styles.head}>Keep walking. It pays.</h2>
        <p className={styles.sub}>Seven stops. Bigger drops. One final vault.</p>
        <div className={styles.miles}>{Array.from({ length: 7 }, (_, i) => <span key={i} style={{ '--i': i }} />)}</div>
      </div>
    </section>
  );
}
