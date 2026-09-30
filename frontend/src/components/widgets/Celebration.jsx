import React from 'react';
import { Flame, Gift } from 'lucide-react';
import styles from './Widgets.module.css';
import { useOverview } from '../../context/OverviewContext.jsx';

const PIECES = Array.from({ length: 16 }, (_, i) => ({
  left: 8 + ((i * 53) % 84),
  delay: (i % 6) * 0.06,
  dx: ((i % 5) - 2) * 26,
  gold: i % 2 === 0,
}));

// Shown only after the backend confirms a claim (celebration is set by the
// claim response). It never appears on its own.
export default function Celebration() {
  const { celebration } = useOverview();
  if (!celebration) return null;
  const { reward, isUltimate } = celebration;
  const amount = reward.currency === 'INR' ? `₹${reward.amount}` : `${reward.amount} ${reward.currency}`;
  return (
    <div className={styles.toastWrap} role="status" aria-live="polite">
      <div className={styles.toast}>
        <div className={styles.confetti} aria-hidden="true">
          {PIECES.map((p, i) => <i key={i} className={p.gold ? styles.cGold : styles.cViolet} style={{ left: `${p.left}%`, animationDelay: `${p.delay}s`, '--dx': `${p.dx}px` }} />)}
        </div>
        <span className={styles.toastIcon}><Flame size={20} /></span>
        <div>
          <strong>STREAK SAVED! +1 Day Added</strong>
          <span><Gift size={12} /> {isUltimate ? 'Ultimate reward unlocked' : 'Reward unlocked'}: {reward.title} ({amount})</span>
        </div>
      </div>
    </div>
  );
}
