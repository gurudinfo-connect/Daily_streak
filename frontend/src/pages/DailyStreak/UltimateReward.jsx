import React from 'react';
import v from './Streak.module.css';
import { CrownIcon } from '../../components/icons/VLIcons.jsx';

export default function UltimateReward({ reward }) {
  if (!reward) return null;
  const inr = reward.reward.currency === 'INR';
  return (
    <section className={v.ultimate} aria-label="Ultimate reward">
      <CrownIcon size={96} className={v.ultCrown} />
      <div className={v.ultText}>
        <div className={v.ultLabel}>Ultimate Reward</div>
        <div className={v.ultAmt}>{inr ? `₹${reward.reward.amount}` : `+${reward.reward.amount}`}</div>
        <div className={v.ultSub}>{reward.reward.subtitle || reward.reward.title}</div>
      </div>
      <div className={v.ultUnlock}>Unlock on<strong>Day {reward.day}</strong></div>
    </section>
  );
}
