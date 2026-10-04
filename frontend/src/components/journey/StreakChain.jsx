import React, { memo } from 'react';
import styles from './StreakChain.module.css';
import { ICONS } from '../../assets/icons.js';

// Rolling odometer: every digit is a reel that spins up from 0 to its value.
export const Reel = memo(function Reel({ value }) {
  const digits = String(Math.max(0, value)).split('').map(Number);
  return (
    <span className={styles.reel} role="img" aria-label={String(value)}>
      {digits.map((d, i) => (
        <span key={i} className={styles.slot} aria-hidden="true">
          <span className={styles.col} style={{ '--n': d, animationDelay: `${0.45 + i * 0.12}s` }}>
            {Array.from({ length: d + 1 }, (_, k) => <i key={k}>{k}</i>)}
          </span>
        </span>
      ))}
    </span>
  );
});

// 7 interlocking links that drop in and then ignite one by one.
// `done` / `total` are passed straight from the backend response.
function StreakChain({ total, done }) {
  const step = 78, w = 48 + (total - 1) * step + 100;
  const endX = 36 + Math.max(0, done) * step;
  return (
    <div className={styles.chain}>
      <svg viewBox={`0 0 ${w} 120`} className={styles.svg} role="img" aria-label={`${done} of ${total} links lit`}>
        <line x1="20" y1="60" x2={w - 20} y2="60" className={styles.rail} />
        {Array.from({ length: total }, (_, i) => {
          const on = i < done, cur = i === done;
          const tall = i % 2 === 0;
          const x = 24 + i * step, y = tall ? 34 : 42, h = tall ? 52 : 36;
          return (
            <g key={i} className={styles.drop} style={{ animationDelay: `${i * 0.09}s` }}>
              {on && <rect x={x} y={y} width="100" height={h} rx={h / 2} className={styles.glow} style={{ animationDelay: `${0.95 + i * 0.2}s` }} />}
              <rect x={x} y={y} width="100" height={h} rx={h / 2}
                className={`${styles.link} ${on ? styles.lit : ''} ${cur ? styles.cur : ''}`}
                style={on ? { animationDelay: `${0.95 + i * 0.2}s` } : undefined} />
              <text x={x + 50} y="112" textAnchor="middle" className={`${styles.num} ${on ? styles.numOn : ''}`}>{i + 1 === total ? '★' : `D${i + 1}`}</text>
            </g>
          );
        })}
        {done > 0 && (
          <circle cx="24" cy="60" r="6" className={styles.spark}
            style={{ '--end': `${endX - 24}px`, animationDuration: `${0.35 + done * 0.2}s` }} />
        )}
        <g className={styles.head} style={{ transform: `translate(${(done < total ? 24 + done * step + 50 : 24 + (total - 1) * step + 50)}px, 22px)`, animationDelay: `${0.95 + done * 0.2 + 0.2}s` }}>
          <image href={ICONS.flame} x="-17" y="-34" width="34" height="42" preserveAspectRatio="xMidYMid meet" className={styles.flame} />
        </g>
      </svg>
    </div>
  );
}
export default memo(StreakChain);
