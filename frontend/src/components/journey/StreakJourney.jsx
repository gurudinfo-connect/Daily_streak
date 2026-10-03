import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import styles from './Journey.module.css';
import Walker from './Walker.jsx';
import { ICONS, getRewardIcon } from '../../assets/icons.js';
import useMediaQuery from '../../hooks/useMediaQuery.js';
import { buildPoints, segmentPath } from './journeyLayout.js';
import { formatAmount } from '../../utils/streakInsights';

const STARS = Array.from({ length: 40 }, (_, i) => ({ x: (i * 197) % 1000, y: (i * 61) % 420 + 8, r: 1 + (i % 3) * .5, d: (i % 7) * .6 }));
const FLIES = Array.from({ length: 9 }, (_, i) => ({ x: 60 + i * 110, y: 250 + (i % 4) * 36, d: i * .7 }));
const BURST = Array.from({ length: 10 }, (_, i) => { const a = (i / 10) * Math.PI * 2; return { dx: Math.round(Math.cos(a) * 50), dy: Math.round(Math.sin(a) * 50) }; });
const ease = (t) => (t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

function targetIndex(rewards, day) {
  const i = rewards.findIndex((r) => r.day === day);
  return i >= 0 ? i + 1 : Math.max(0, rewards.filter((r) => r.status === 'CLAIMED').length);
}

function StreakJourney({ streakData, celebration, claiming }) {
  const vertical = useMediaQuery('(max-width: 760px)');
  const rewards = streakData?.rewards || [];
  const { w, h, pts } = useMemo(() => buildPoints(rewards.length, vertical), [rewards.length, vertical]);
  
  const segs = useMemo(() => pts.slice(0, -1).map((p, i) => segmentPath(p, pts[i + 1], vertical)), [pts, vertical]);
  const lens = useRef([]); const walkerRef = useRef(null); const at = useRef(0); const raf = useRef(0);
  const [walking, setWalking] = useState(false);
  const [burst, setBurst] = useState(null);
  const idx = rewards.length ? targetIndex(rewards, streakData.streak.currentDay) : 0;

  // Measure each road segment, then walk the man along the real curve (start -> today's stop).
  useEffect(() => {
    if (!rewards.length) return undefined;
    const ns = 'http://www.w3.org/2000/svg';
    const L = segs.map((d) => { const p = document.createElementNS(ns, 'path'); p.setAttribute('d', d); return p; });
    lens.current = L.map((p) => p.getTotalLength());
    const cum = (i) => lens.current.slice(0, i).reduce((a, b) => a + b, 0);
    const place = (len) => {
      let k = 0, rem = len;
      while (k < L.length - 1 && rem > lens.current[k]) { rem -= lens.current[k]; k++; }
      const pt = L[k].getPointAtLength(Math.min(rem, lens.current[k]));
      walkerRef.current?.setAttribute('transform', `translate(${pt.x} ${pt.y})`);
    };
    const from = at.current, to = cum(idx), dist = Math.abs(to - from);
    if (!dist) { place(to); return undefined; }
    const dur = Math.min(4200, 900 + dist * 4), t0 = performance.now();
    setWalking(true);
    const tick = (now) => {
      const t = Math.min(1, (now - t0) / dur);
      at.current = from + (to - from) * ease(t); place(at.current);
      if (t < 1) raf.current = requestAnimationFrame(tick); else setWalking(false);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [segs, idx, rewards.length]);

  // Pickup animation only after the backend confirmed the claim.
  useEffect(() => {
    if (!celebration) return undefined;
    setBurst(celebration.day);
    const id = setTimeout(() => setBurst(null), 2000);
    return () => clearTimeout(id);
  }, [celebration]);

  if (!rewards.length) return null;
  const segState = (i) => { const s = rewards[i].status; return s === 'CLAIMED' ? 'done' : s === 'AVAILABLE' || s === 'TODAY' ? 'now' : 'next'; };
  const pad = (n) => String(n).padStart(2, '0');

  return (
    <div className={`${styles.stage} ${vertical ? styles.vertical : ''}`}>
      <svg className={styles.svg} viewBox={`0 0 ${w} ${h}`} role="group" aria-label="Road to the vault" preserveAspectRatio="xMidYMid meet">
        {STARS.map((s, i) => <circle key={i} cx={(s.x * w) / 1000} cy={Math.min(s.y, h - 6)} r={s.r} className={styles.star} style={{ animationDelay: `${s.d}s` }} />)}
        {segs.map((d, i) => <path key={i} d={d} className={`${styles.road} ${styles[segState(i)]}`} />)}

        {rewards.map((r, i) => {
          const p = pts[i + 1], size = r.isUltimate ? 128 : 84, st = r.status, active = st === 'AVAILABLE' || st === 'TODAY';
          const side = vertical ? (p.x < w / 2 ? 'right' : 'left') : 'below';
          const lx = side === 'right' ? size / 2 + 12 : side === 'left' ? -size / 2 - 12 : 0;
          const anchor = side === 'right' ? 'start' : side === 'left' ? 'end' : 'middle';
          const ly = side === 'below' ? size / 2 + 24 : -2;
          const amt = formatAmount(r.reward.currency, r.reward.amount);
          return (
            <g key={r.day} transform={`translate(${p.x} ${p.y})`} role="img" aria-label={`Stop ${r.day}: ${r.reward.title}, ${amt}, ${st.toLowerCase()}`}>
              <g className={styles.signIn} style={{ animationDelay: `${.2 + i * .12}s` }}>
                {(active || r.isUltimate) && <circle r={size / 2 + 10} className={r.isUltimate ? styles.haloGold : styles.halo} />}
                <circle r={size / 2 - 2} className={`${styles.disc} ${styles['n_' + st]}`} />
                <image href={getRewardIcon(r)} x={-size / 2 + 8} y={-size / 2 + 8} width={size - 16} height={size - 16} className={`${styles.art} ${st === 'LOCKED' ? styles.artLocked : ''} ${active ? styles.artFloat : ''} ${burst === r.day ? styles.artPop : ''}`} />
                {st === 'CLAIMED' && <g transform={`translate(${size / 2 - 10} ${-size / 2 + 12})`}><circle r="11" className={styles.tick} /><path d="M-5 0L-1.5 4L5 -4" className={styles.tickMark} /></g>}
                {st === 'LOCKED' && <g transform={`translate(${size / 2 - 10} ${size / 2 - 14})`}><circle r="11" className={styles.lockBadge} /><path d="M-4 -1h8v6h-8z M-2.5 -1v-2.5a2.5 2.5 0 015 0V-1" className={styles.lockMark} /></g>}
                {burst === r.day && <>
                  {BURST.map((b, k) => <circle key={k} r="4" className={styles.spark} style={{ '--dx': `${b.dx}px`, '--dy': `${b.dy}px` }} />)}
                  <text className={styles.plus} y="-30">+{amt}</text>
                </>}
              </g>
              <text x={lx} y={ly} textAnchor={anchor} className={styles.dayText}>STOP {pad(r.day)}</text>
              {st === 'TODAY' || active ? <g transform={`translate(${lx + (anchor === 'middle' ? 46 : 0)} ${ly - 11})`}><rect x="0" y="-9" width="46" height="17" rx="8.5" className={styles.pill} /><text x="23" y="3.5" textAnchor="middle" className={styles.pillText}>TODAY</text></g> : null}
              <text x={lx} y={ly + 20} textAnchor={anchor} className={styles.amtText}>{amt}</text>
            </g>
          );
        })}

        <g ref={walkerRef} transform={`translate(${pts[0].x} ${pts[0].y})`} className={claiming ? styles.busy : ''}>
          <g className={styles.hop} style={{ transform: `translateY(${walking ? -4 : -(vertical ? 46 : 50)}px)` }}>
            <g transform="scale(.5)"><Walker walking={walking} speed={walking ? .5 : .8} /></g>
          </g>
        </g>
      </svg>
      <ul className={styles.srOnly}>{rewards.map((r) => <li key={r.day}>Stop {r.day}: {r.reward.title}, {r.status.toLowerCase()}</li>)}</ul>
    </div>
  );
}
export default memo(StreakJourney);
