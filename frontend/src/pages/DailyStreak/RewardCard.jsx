import React from 'react';
import { Lock, Check } from 'lucide-react';
import useCountdown from '../../hooks/useCountdown';
import v from './Streak.module.css';
import { CoinIcon, GiftIcon, CrownIcon } from '../../components/icons/VLIcons.jsx';

export default function RewardCard({ card, nowFn, onClaim, onTimerComplete, claiming }) {
  const { day, status, reward, isUltimate } = card;
  const target = card.nextClaimAt ? new Date(card.nextClaimAt) : null;
  const showCountdown = status === 'TODAY' && !!target;
  const { label } = useCountdown(showCountdown ? target : null, nowFn, () => {
    if (showCountdown) onTimerComplete();
  });

  const Icon = isUltimate ? CrownIcon : reward.currency === 'INR' ? GiftIcon : CoinIcon;
  const dim = status === 'LOCKED' || status === 'MISSED';
  const cls = [v.rc, status === 'AVAILABLE' && v.rcActive, status === 'CLAIMED' && v.rcDone, dim && v.rcDim, isUltimate && v.rcGold].filter(Boolean).join(' ');

  return (
    <article className={cls}>
      <span className={`${v.pill} ${status === 'AVAILABLE' ? v.pillGold : ''}`}>{status === 'AVAILABLE' ? 'Today' : `Day ${day}`}</span>
      {status === 'CLAIMED' && <span className={v.tick}><Check size={13} strokeWidth={3} /></span>}
      <div className={v.rcArt}><Icon size={78} /></div>
      <div className={v.rcTitle}>{reward.title}</div>
      <div className={v.rcAmt}>{reward.currency === 'INR' ? `₹${reward.amount}` : `+${reward.amount}`}</div>
      <div className={v.rcSub}>{reward.currency === 'INR' ? reward.subtitle || 'Amazon Gift Card' : `${reward.amount} ${reward.currency}`}</div>

      {status === 'CLAIMED' && <div className={`${v.rcBtn} ${v.btnDone}`}><Check size={14} /> Claimed</div>}
      {status === 'AVAILABLE' && (
        <button className={`${v.rcBtn} ${v.btnClaim}`} disabled={claiming} onClick={() => onClaim(day)}>{claiming ? 'Claiming…' : 'Claim Reward'}</button>
      )}
      {status === 'TODAY' && <div className={`${v.rcBtn} ${v.btnWait}`}>{label}</div>}
      {status === 'LOCKED' && <div className={`${v.rcBtn} ${v.btnLock}`}><Lock size={12} /> Locked</div>}
      {status === 'MISSED' && <div className={`${v.rcBtn} ${v.btnLock}`}>Missed</div>}
    </article>
  );
}
