import React, { memo, useEffect, useMemo, useState } from 'react';
import { Lock, Check } from 'lucide-react';
import styles from './Journey.module.css';
import { ICONS, getRewardIcon } from '../../assets/icons.js';
import useMediaQuery from '../../hooks/useMediaQuery.js';
import { buildPoints, segmentPath } from './journeyLayout.js';
import { formatAmount } from '../../utils/streakInsights';

const STATUS_LABEL = { CLAIMED: 'collected', AVAILABLE: 'ready to claim', TODAY: 'next unlock', LOCKED: 'locked', MISSED: 'missed' };
const BURST = Array.from({ length: 10 }, (_, i) => {
  const a = (i / 10) * Math.PI * 2;
  return { dx: Math.round(Math.cos(a) * 46), dy: Math.round(Math.sin(a) * 46), d: (i % 4) * 40 };
});

// The character stands on whichever node the backend says is today's day.
function currentIndex(rewards, currentDay) {
  const i = rewards.findIndex((r) => r.day === currentDay);
  if (i >= 0) return i + 1; // +1: START occupies index 0
  const claimed = rewards.filter((r) => r.status === 'CLAIMED').length;
  return Math.max(0, claimed);
}

function StreakJourney({ streakData, celebration, claiming }) {
  const vertical = useMediaQuery('(max-width: 760px)');
  const rewards = streakData?.rewards || [];
  const { w, h, pts } = useMemo(() => buildPoints(rewards.length, vertical), [rewards.length, vertical]);
  const [burstDay, setBurstDay] = useState(null);

  // Burst only fires after the backend confirmed a claim (celebration is set from the claim response).
  useEffect(() => {
    if (!celebration) return undefined;
    setBurstDay(celebration.day);
    const id = setTimeout(() => setBurstDay(null), 1500);
    return () => clearTimeout(id);
  }, [celebration]);

  if (!rewards.length) return null;
  const charAt = pts[currentIndex(rewards, streakData.streak.currentDay)] || pts[0];
  const segState = (i) => {
    const to = rewards[i]; // segment i runs pts[i] -> pts[i+1] (reward i)
    if (to.status === 'CLAIMED') return 'done';
    if (to.status === 'AVAILABLE' || to.status === 'TODAY') return 'now';
    return 'next';
  };

  return (
    <div className={`${styles.stage} ${vertical ? styles.vertical : ''}`}>
      <svg className={styles.svg} viewBox={`0 0 ${w} ${h}`} role="group" aria-label="Your streak journey" preserveAspectRatio="xMidYMid meet">
        {pts.slice(0, -1).map((p, i) => (
          <path key={i} d={segmentPath(p, pts[i + 1], vertical)} className={`${styles.road} ${styles[segState(i)]}`} />
        ))}

        <g transform={`translate(${pts[0].x} ${pts[0].y})`}>
          <circle r="12" className={styles.startDot} />
          <text y={vertical ? 5 : 32} x={vertical ? 24 : 0} textAnchor={vertical ? 'start' : 'middle'} className={styles.startText}>Start</text>
        </g>

        {rewards.map((r, i) => {
          const p = pts[i + 1];
          const size = r.isUltimate ? 120 : 80;
          const state = r.status;
          const active = state === 'AVAILABLE';
          const labelSide = vertical ? (p.x < w / 2 ? 'right' : 'left') : 'below';
          const lx = labelSide === 'right' ? size / 2 + 12 : labelSide === 'left' ? -size / 2 - 12 : 0;
          const anchor = labelSide === 'right' ? 'start' : labelSide === 'left' ? 'end' : 'middle';
          const ly = labelSide === 'below' ? size / 2 + 22 : -4;
          return (
            <g key={r.day} transform={`translate(${p.x} ${p.y})`} role="img"
              aria-label={`Day ${r.day}: ${r.reward.title}, ${formatAmount(r.reward.currency, r.reward.amount)}, ${STATUS_LABEL[state] || state}`}>
              {(active || r.isUltimate) && <circle r={size / 2 + 8} className={r.isUltimate ? styles.haloGold : styles.halo} />}
              <circle r={size / 2 - 4} className={`${styles.disc} ${styles['n_' + state]} ${r.isUltimate ? styles.discUltimate : ''}`} />
              <image href={getRewardIcon(r)} x={-size / 2 + 10} y={-size / 2 + 10} width={size - 20} height={size - 20}
                preserveAspectRatio="xMidYMid meet" className={`${styles.art} ${state === 'LOCKED' ? styles.artLocked : ''} ${burstDay === r.day ? styles.artPop : ''} ${active ? styles.artFloat : ''}`} />
              {state === 'CLAIMED' && (<g transform={`translate(${size / 2 - 14} ${-size / 2 + 14})`}><circle r="11" className={styles.tick} /><path d="M-5 0 L-1.5 4 L5 -4" className={styles.tickMark} /></g>)}
              {state === 'LOCKED' && (<g transform={`translate(${size / 2 - 14} ${-size / 2 + 14})`}><circle r="11" className={styles.lockBadge} /><path d="M-4 -1h8v6h-8z M-2.5 -1v-2.5a2.5 2.5 0 015 0V-1" className={styles.lockMark} /></g>)}
              <text x={lx} y={ly} textAnchor={anchor} className={styles.dayText}>Day {r.day}</text>
              <text x={lx} y={ly + 17} textAnchor={anchor} className={styles.amtText}>{formatAmount(r.reward.currency, r.reward.amount)}</text>
              {burstDay === r.day && BURST.map((b, k) => (
                <circle key={k} r="4" className={styles.spark} style={{ '--dx': `${b.dx}px`, '--dy': `${b.dy}px`, animationDelay: `${b.d}ms` }} />
              ))}
            </g>
          );
        })}

        <g className={`${styles.char} ${claiming ? styles.charBusy : ''}`} style={{ transform: `translate(${charAt.x}px, ${charAt.y - (vertical ? 62 : 70)}px)` }}>
          <g className={styles.charBob}>
            <ellipse cx="0" cy="62" rx="16" ry="4" className={styles.shadow} />
            <image href={ICONS.flame} x="-24" y="-30" width="48" height="60" preserveAspectRatio="xMidYMid meet" />
          </g>
        </g>
      </svg>
      <ul className={styles.srOnly}>
        {rewards.map((r) => <li key={r.day}>Day {r.day}: {r.reward.title}, {STATUS_LABEL[r.status] || r.status}</li>)}
      </ul>
    </div>
  );
}

export default memo(StreakJourney);
