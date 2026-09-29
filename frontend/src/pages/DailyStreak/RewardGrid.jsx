import React from 'react';
import v from './Streak.module.css';
import RewardCard from './RewardCard.jsx';

export default function RewardGrid({ rewards, nowFn, onClaim, onTimerComplete, claimingDay }) {
  return (
    <section aria-label="Daily rewards">
      <h2 className={v.h2}>Daily rewards</h2>
      <div className={v.grid}>
        {rewards.map((card) => (
          <RewardCard key={card.day} card={card} nowFn={nowFn} onClaim={onClaim} onTimerComplete={onTimerComplete} claiming={claimingDay === card.day} />
        ))}
      </div>
    </section>
  );
}
