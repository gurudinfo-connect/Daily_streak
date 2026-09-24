import React from 'react';
import { Lock, Check } from 'lucide-react';
import useCountdown from '../../hooks/useCountdown';
import styles from './DailyStreak.module.css';
import { getRewardIcon } from '../../assets/icons.js';

export default function RewardCard({ card, nowFn, onClaim, onTimerComplete, claiming }) {
  const { day, status, reward, isUltimate } = card;
  const target = card.nextClaimAt ? new Date(card.nextClaimAt) : null;
  const showCountdown = status === 'TODAY' && !!target;

  const { label } = useCountdown(showCountdown ? target : null, nowFn, () => {
    if (showCountdown) onTimerComplete();
  });

  const cardClass = [
    styles.card,
    status === 'AVAILABLE' && styles.cardToday,
    status === 'CLAIMED' && styles.cardClaimed,
    isUltimate && styles.cardToday,
  ]
    .filter(Boolean)
    .join(' ');

  const badge =
    status === 'CLAIMED' ? (
      <span className={`${styles.cardBadge} ${styles.cardBadgeClaimed}`}>Day {day}</span>
    ) : status === 'AVAILABLE' ? (
      <span className={`${styles.cardBadge} ${styles.cardBadgeToday}`}>Today</span>
    ) : isUltimate ? (
      <span className={`${styles.cardBadge} ${styles.cardBadgeToday}`}>VIP</span>
    ) : (
      <span className={styles.cardBadge}>Day {day}</span>
    );

  return (
    <div className={cardClass}>
      {badge}
      <div className={`${styles.cardAsset} ${status === 'LOCKED' || status === 'MISSED' ? styles.assetDim : ''} ${status === 'AVAILABLE' ? styles.assetActive : ''}`}>
        <img src={getRewardIcon(card)} alt={`Day ${day} reward`} loading="lazy" draggable="false" />
        {status === 'CLAIMED' && <span className={styles.assetCheck}><Check size={12} strokeWidth={3} /></span>}
      </div>
      <div>
        <div className={styles.cardTitle}>{reward.title}</div>
        <div className={styles.cardAmount}>
          {reward.currency === 'INR' ? `₹${reward.amount}` : `+${reward.amount}`}
        </div>
        <div className={styles.cardCurrency}>
          {reward.currency === 'INR' ? reward.subtitle || 'Amazon Gift Card' : `${reward.amount} ${reward.currency}`}
        </div>
      </div>

      {status === 'CLAIMED' && (
        <div className={`${styles.cardAction} ${styles.actionClaimed}`}>
          <Check size={14} style={{ marginRight: 4 }} /> Claimed
        </div>
      )}

      {status === 'AVAILABLE' && (
        <button
          className={`${styles.cardAction} ${styles.actionClaim}`}
          disabled={claiming}
          onClick={() => onClaim(day)}
        >
          {claiming ? 'Claiming…' : 'Claim Reward'}
        </button>
      )}

      {status === 'TODAY' && (
        <div className={`${styles.cardAction} ${styles.actionCountdown}`}>{label}</div>
      )}

      {status === 'LOCKED' && (
        <div className={`${styles.cardAction} ${styles.actionLocked}`}>
          <Lock size={12} style={{ marginRight: 4 }} /> Locked
        </div>
      )}

      {status === 'MISSED' && (
        <div className={`${styles.cardAction} ${styles.actionLocked}`}>Missed</div>
      )}
    </div>
  );
}
