import React, { memo } from 'react';
import styles from './Welcome.module.css';
import Walker from './Walker.jsx';

// Sunrise welcome: the sun climbs, the man walks in, plants a signpost whose flip-board shows the day.
function Flap({ value }) {
  return <span className={styles.flap}><i>{value}</i><b key={value}>{value}</b></span>;
}

function Welcome({ name, day, total, chain, banked, next, message }) {
  const d = String(day).padStart(2, '0');
  return (
    <section className={styles.scene} aria-label="Welcome">
      <div className={styles.sun} />
      {Array.from({ length: 14 }, (_, i) => <span key={i} className={styles.star} style={{ left: `${(i * 37) % 96 + 2}%`, top: `${(i * 23) % 40 + 4}%`, animationDelay: `${i * .3}s` }} />)}
      <svg className={styles.hills} viewBox="0 0 800 200" preserveAspectRatio="none" aria-hidden="true">
        <path className={styles.h1} d="M0 200V110Q100 40 220 100T450 80T700 90T800 70V200Z" />
        <path className={styles.h2} d="M0 200V150Q150 110 300 150T600 140T800 130V200Z" />
      </svg>
      <div className={styles.ground}><span className={styles.dash} /></div>
      <div className={styles.copy}>
        <p className={styles.kicker}>Base camp</p>
        <h1 className={styles.h}>Welcome back, {name}.</h1>
        <p className={styles.msg}>{message}</p>
        <dl className={styles.facts}>
          <div><dt>Streak</dt><dd>{chain} days</dd></div>
          <div><dt>Backpack</dt><dd>{banked} VES</dd></div>
          {next && <div><dt>Next drop</dt><dd className={styles.gold}>{next}</dd></div>}
        </dl>
      </div>
      <div className={styles.sign}>
        <div className={styles.board} role="img" aria-label={`Stop ${d} of ${total}`}>
          <span className={styles.stop}>Stop</span>
          <Flap value={d[0]} /><Flap value={d[1]} />
          <span className={styles.of}>of {total}</span>
        </div>
        <i className={styles.post} />
      </div>
      <svg className={styles.man} viewBox="-30 -100 60 110" aria-hidden="true"><Walker walking speed={0.6} /></svg>
    </section>
  );
}
export default memo(Welcome);
