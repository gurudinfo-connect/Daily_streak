import React from 'react';
import { Lock } from 'lucide-react';
import styles from './FinalVault.module.css';
import { ICONS } from '../../assets/icons.js';
import { formatAmount } from '../../utils/streakInsights';

// Everything shown comes from the backend rewards[] / streak objects. No eligibility is computed here.
export default function FinalVault({ streakData }) {
  const card = streakData.rewards.find((r) => r.isUltimate);
  if (!card) return null;
  const total = streakData.streak.totalRewards;
  const done = streakData.streak.checkedIn;
  const left = Math.max(0, total - done);
  const state = card.status; // CLAIMED | AVAILABLE | TODAY | LOCKED
  const locked = state === 'LOCKED';
  return (
    <section className={`${styles.vault} ${locked ? styles.dim : ''}`} aria-label="Grand prize">
      <div className={styles.stage}>
        <span className={styles.halo} aria-hidden="true" />
        <img className={styles.art} src={ICONS.day7} alt="" width="360" height="293" loading="lazy" decoding="async" />
        <img className={styles.gift} src={ICONS.exclusive} alt="" width="86" height="67" loading="lazy" decoding="async" />
      </div>
      <div className={styles.info}>
        <p className={styles.kicker}>Day {card.day} · destination</p>
        <h2 className={styles.title}>Grand prize</h2>
        <p className={styles.amt}>{formatAmount(card.reward.currency, card.reward.amount)}</p>
        <p className={styles.sub}>{card.reward.subtitle || card.reward.title}</p>
        <div className={styles.progress}>
          <strong>{state === 'CLAIMED' ? 'Collected' : left}</strong>
          {state !== 'CLAIMED' && <span>day{left === 1 ? '' : 's'} to go</span>}
        </div>
        <div className={styles.dots} role="img" aria-label={`${done} of ${total} days complete`}>
          {Array.from({ length: total }, (_, i) => <i key={i} className={i < done ? styles.on : ''} />)}
        </div>
        <p className={styles.note}>
          {state === 'CLAIMED' && 'Vault opened this cycle.'}
          {state === 'AVAILABLE' && 'Your vault is ready. Claim it from Today’s reward.'}
          {state === 'TODAY' && 'Your vault unlocks at the next check-in.'}
          {locked && <><Lock size={13} /> Keep the chain unbroken to open it on Day {card.day}.</>}
        </p>
      </div>
    </section>
  );
}
