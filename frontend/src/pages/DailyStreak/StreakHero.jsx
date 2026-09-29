import React from 'react';
import { Gift, CalendarCheck, Sparkles } from 'lucide-react';
import v from './Streak.module.css';
import { FlameIcon, CoinIcon } from '../../components/icons/VLIcons.jsx';
import useCountdown from '../../hooks/useCountdown';
import useCountUp from '../../hooks/useCountUp.js';
import streakMessage from '../../utils/streakMessage.js';

const R = 74;
const C = 2 * Math.PI * R;

function WaitButton({ target, nowFn, onDone }) {
  const { label } = useCountdown(target, nowFn, onDone);
  return <div className={v.wait}>Next reward in <strong>{label}</strong></div>;
}

export default function StreakHero({ streak, nextReward, wallet, rewards, nowFn, onClaim, onTimerComplete, claimingDay }) {
  const available = rewards.find((r) => r.status === 'AVAILABLE');
  const waiting = rewards.find((r) => r.status === 'TODAY' && r.nextClaimAt);
  const pct = rewards.length ? Math.min(streak.checkedIn / rewards.length, 1) : 0;
  const shown = useCountUp(streak.currentStreak);

  return (
    <section className={v.hero}>
      <div className={v.ringWrap} role="img" aria-label={`${streak.currentStreak} day streak, ${streak.checkedIn} of ${rewards.length} days this cycle`}>
        <svg viewBox="0 0 180 180" className={v.ring}>
          <defs><linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffd75a" /><stop offset="1" stopColor="#8b5cf6" /></linearGradient></defs>
          <circle cx="90" cy="90" r={R} className={v.ringBg} />
          <circle cx="90" cy="90" r={R} className={v.ringFg} style={{ strokeDasharray: C, strokeDashoffset: C * (1 - pct) }} />
        </svg>
        <div className={v.ringCenter}>
          <FlameIcon size={38} className={v.flame} />
          <div className={v.ringNum}>{shown}</div>
          <div className={v.ringLabel}>DAY STREAK</div>
        </div>
      </div>

      <div className={v.heroBody}>
        <span className={v.eyebrow}><Sparkles size={14} /> Daily Streak &amp; Rewards</span>
        <h1 className={v.heroTitle}>Login daily &amp; earn <span>bigger rewards</span></h1>
        <p className={v.heroMsg}>{streakMessage(streak.currentStreak)}</p>
        <div className={v.heroAction}>
          {available ? (
            <button className={v.primary} disabled={claimingDay === available.day} onClick={() => onClaim(available.day)}>
              <Gift size={18} /> {claimingDay === available.day ? 'Claiming…' : `Claim Day ${available.day} reward`}
            </button>
          ) : waiting ? (
            <WaitButton target={new Date(waiting.nextClaimAt)} nowFn={nowFn} onDone={onTimerComplete} />
          ) : (
            <div className={v.wait}>Come back tomorrow for more rewards!</div>
          )}
        </div>
        <div className={v.chips}>
          <div className={v.chip}><Gift size={15} /> <b>{streak.totalRewards}</b> total rewards</div>
          <div className={v.chip}><CalendarCheck size={15} /> <b>{streak.checkedIn}</b> checked in</div>
          <div className={v.chip}><CoinIcon size={16} /> Next: <b>{nextReward ? `+${nextReward.amount} ${nextReward.currency}` : '—'}</b></div>
        </div>
      </div>

      <div className={v.wallet}>
        <CoinIcon size={54} className={v.walletCoin} />
        <div className={v.walletLabel}>Your wallet</div>
        <div className={v.walletNum}>{wallet?.VES ?? 0}</div>
        <div className={v.walletUnit}>VES</div>
      </div>
    </section>
  );
}
