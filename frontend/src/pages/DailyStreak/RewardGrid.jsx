import React from 'react';
import styles from './DailyStreak.module.css';
import RewardCard from './RewardCard.jsx';

export default function RewardGrid({ rewards, nowFn, onClaim, onTimerComplete, claimingDay }) {
  return (
    <div className={styles.grid}>
      {rewards.map((card) => (
        <RewardCard
          key={card.day}
          card={card}
          nowFn={nowFn}
          onClaim={onClaim}
          onTimerComplete={onTimerComplete}
          claiming={claimingDay === card.day}
        />
      ))}
    </div>
  );
}
