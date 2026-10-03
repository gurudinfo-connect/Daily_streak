import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import styles from './Journey.module.css';
import Walker from './Walker.jsx';
import { ICONS, getRewardIcon } from '../../assets/icons.js';
import useMediaQuery from '../../hooks/useMediaQuery.js';
import { buildPoints, segmentPath } from './journeyLayout.js';
import { formatAmount } from '../../utils/streakInsights';

const STARS = Array.from({ length: 26 }, (_, i) => ({ x: (i * 197) % 1000, y: (i * 61) % 150 + 8, r: 1 + (i % 3) * .5, d: (i % 7) * .6 }));
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
  const lift = vertical ? 48 : 66;
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
  const start = pts[0];

  return (
    <div className={`${styles.stage} ${vertical ? styles.vertical : ''}`}>
      <svg className={styles.svg} viewBox={`0 0 ${w} ${h}`} role="group" aria-label="Road to the vault" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="rjSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#120b2e" /><stop offset="1" stopColor="#3a1b63" /></linearGradient>
        </defs>
        <rect width={w} height={h} fill="url(#rjSky)" rx="18" />
        {!vertical && <>
          {STARS.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.r} className={styles.star} style={{ animationDelay: `${s.d}s` }} />)}
          <circle cx="880" cy="70" r="26" className={styles.moon} />
          <g className={styles.cloud}><ellipse cx="200" cy="70" rx="46" ry="10" /><ellipse cx="228" cy="62" rx="26" ry="9" /></g>
          <path className={styles.hillFar} d={`M0 ${h} L0 270 Q120 200 250 260 T520 240 T780 250 T1000 220 L1000 ${h}Z`} />
          <path className={styles.hillNear} d={`M0 ${h} L0 330 Q170 290 330 330 T650 320 T1000 310 L1000 ${h}Z`} />
          {FLIES.map((f, i) => <circle key={i} cx={f.x} cy={f.y} r="2.5" className={styles.fly} style={{ animationDelay: `${f.d}s` }} />)}
        </>}

        {segs.map((d, i) => (<g key={i}>
          <path d={d} className={styles.roadBase} />
          <path d={d} className={`${styles.road} ${styles[segState(i)]}`} pathLength="100" style={{ '--i': i }} />
        </g>))}

        <g transform={`translate(${start.x} ${start.y})`}>
          <path d="M0 0V-46" className={styles.pole} /><path d="M0 -46h46l12 8-12 8h-46z" className={styles.flag} /><text x="6" y="-32" className={styles.flagText}>Start</text>
        </g>

        {rewards.map((r, i) => {
          const p = pts[i + 1], size = r.isUltimate ? 124 : 82, st = r.status, active = st === 'AVAILABLE';
          const side = vertical ? (p.x < w / 2 ? 'right' : 'left') : 'below';
          const lx = side === 'right' ? 56 : side === 'left' ? -56 : 0;
          const anchor = side === 'right' ? 'start' : side === 'left' ? 'end' : 'middle';
          const ly = side === 'below' ? 30 : -lift;
          const amt = formatAmount(r.reward.currency, r.reward.amount);
          return (
            <g key={r.day} transform={`translate(${p.x} ${p.y})`} role="img" aria-label={`Stop ${r.day}: ${r.reward.title}, ${amt}, ${st.toLowerCase()}`}>
              <path d={`M0 0V${-lift + size / 2 - 6}`} className={styles.pole} />
              <g transform={`translate(0 ${-lift - size / 2 + 12 + (r.isUltimate ? -10 : 0)})`} className={styles.signIn} style={{ animationDelay: `${.25 + i * .12}s` }}>
                {(active || r.isUltimate) && <circle r={size / 2 + 8} className={r.isUltimate ? styles.haloGold : styles.halo} />}
                <circle r={size / 2 - 4} className={`${styles.disc} ${styles['n_' + st]}`} />
                <image href={getRewardIcon(r)} x={-size / 2 + 10} y={-size / 2 + 10} width={size - 20} height={size - 20} className={`${styles.art} ${st === 'LOCKED' ? styles.artLocked : ''} ${active ? styles.artFloat : ''} ${burst === r.day ? styles.artPop : ''}`} />
                {st === 'CLAIMED' && <g transform={`translate(${size / 2 - 12} ${-size / 2 + 12})`}><circle r="11" className={styles.tick} /><path d="M-5 0L-1.5 4L5 -4" className={styles.tickMark} /></g>}
                {st === 'LOCKED' && <g transform={`translate(${size / 2 - 12} ${-size / 2 + 12})`}><circle r="11" className={styles.lockBadge} /><path d="M-4 -1h8v6h-8z M-2.5 -1v-2.5a2.5 2.5 0 015 0V-1" className={styles.lockMark} /></g>}
                {burst === r.day && <>
                  {BURST.map((b, k) => <circle key={k} r="4" className={styles.spark} style={{ '--dx': `${b.dx}px`, '--dy': `${b.dy}px` }} />)}
                  <image href={ICONS.coin} x="-16" y="-16" width="32" height="32" className={styles.flyCoin} />
                  <text className={styles.plus} y="-20">+{amt}</text>
                </>}
              </g>
              <text x={lx} y={ly} textAnchor={anchor} className={styles.dayText}>Stop {r.day}</text>
              <text x={lx} y={ly + 17} textAnchor={anchor} className={styles.amtText}>{amt}</text>
            </g>
          );
        })}

        <g ref={walkerRef} transform={`translate(${start.x} ${start.y})`} className={claiming ? styles.busy : ''}>
          <Walker walking={walking} speed={walking ? .55 : .7} />
        </g>
      </svg>
      <ul className={styles.srOnly}>{rewards.map((r) => <li key={r.day}>Stop {r.day}: {r.reward.title}, {r.status.toLowerCase()}</li>)}</ul>
    </div>
  );
}
export default memo(StreakJourney);
