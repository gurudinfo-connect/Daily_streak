import React, { memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Lock, Check } from 'lucide-react';
import styles from './Journey.module.css';
import { ICONS, getRewardIcon } from '../../assets/icons.js';
import useMediaQuery from '../../hooks/useMediaQuery.js';
import { buildGeo, STARS } from './journeyLayout.js';
import { formatAmount } from '../../utils/streakInsights';

const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const BURST = Array.from({ length: 12 }, (_, i) => {
  const a = (i / 12) * Math.PI * 2;
  return { dx: Math.round(Math.cos(a) * 62), dy: Math.round(Math.sin(a) * 62), d: (i % 4) * 35 };
});

const statusText = (r) => ({
  CLAIMED: 'Collected',
  AVAILABLE: 'Ready to claim now',
  TODAY: 'Unlocks at your next check-in',
}[r.status] || `Opens after Day ${r.day - 1}`);

// The character always stands on the day the backend says is current.
function currentIndex(rewards, currentDay) {
  const i = rewards.findIndex((r) => r.day === currentDay);
  return i >= 0 ? i + 1 : Math.max(0, rewards.filter((r) => r.status === 'CLAIMED').length);
}

function StreakJourney({ streakData, celebration, claiming }) {
  const vertical = useMediaQuery('(max-width: 760px)');
  const rewards = streakData?.rewards || [];
  const geo = useMemo(() => buildGeo(rewards.length, vertical), [rewards.length, vertical]);
  const pathRef = useRef(null);
  const charRef = useRef(null);
  const trailRef = useRef(null);
  const glowRef = useRef(null);
  const nodeEls = useRef({});
  const posRef = useRef(null);
  const rafRef = useRef(0);
  const [m, setM] = useState(null); // measured distances along the road
  const [picked, setPicked] = useState(null);
  const [burstDay, setBurstDay] = useState(null);
  const idx = rewards.length ? currentIndex(rewards, streakData.streak.currentDay) : 0;

  // Measure where each node sits along the single road path (once per layout).
  useLayoutEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const total = path.getTotalLength();
    const nodes = [0];
    let from = 0;
    for (let i = 1; i < geo.pts.length; i++) {
      let best = from, bd = Infinity;
      for (let L = from; L <= total; L += 3) {
        const p = path.getPointAtLength(L);
        const dd = (p.x - geo.pts[i].x) ** 2 + (p.y - geo.pts[i].y) ** 2;
        if (dd < bd) { bd = dd; best = L; } else if (dd > bd + 4000) break;
      }
      nodes.push(best); from = best;
    }
    posRef.current = null;
    setM({ total, nodes });
  }, [geo]);

  // Walk the character with requestAnimationFrame (transform written directly, no React renders).
  useEffect(() => {
    if (!m) return undefined;
    const path = pathRef.current, char = charRef.current, trail = trailRef.current, glow = glowRef.current;
    const target = Math.max(0, m.nodes[Math.min(idx, m.nodes.length - 1)] - (idx === 0 ? 0 : (rewards[idx - 1]?.isUltimate ? 104 : 88)));
    const draw = (d) => {
      const p = path.getPointAtLength(d);
      char.setAttribute('transform', `translate(${p.x} ${p.y})`);
      const dash = `${d} ${m.total + 10}`;
      trail.setAttribute('stroke-dasharray', dash); glow.setAttribute('stroke-dasharray', dash);
    };
    const from = posRef.current ?? 0;
    if (reduced() || Math.abs(target - from) < 1) { posRef.current = target; draw(target); return undefined; }
    const first = posRef.current === null;
    const dur = first ? 1900 : 1200;
    const t0 = performance.now() + (first ? 700 : 150); // let the nodes pop in first on load
    char.classList.add(styles.walking);
    const tick = (now) => {
      const t = Math.min(1, Math.max(0, (now - t0) / dur));
      const d = from + (target - from) * ease(t);
      posRef.current = d; draw(d);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
      else { char.classList.remove(styles.walking); char.classList.add(styles.settle); setTimeout(() => char.classList.remove(styles.settle), 600); }
    };
    draw(from);
    rafRef.current = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(rafRef.current); char.classList.remove(styles.walking); };
  }, [m, idx]);

  // Celebration only runs after the backend confirmed the claim (celebration comes from the claim response).
  useEffect(() => {
    if (!celebration) return undefined;
    setBurstDay(celebration.day);
    const off = setTimeout(() => setBurstDay(null), 1500);
    let anims = [];
    const src = nodeEls.current[celebration.day]?.getBoundingClientRect();
    const dst = document.querySelector('[data-wallet]')?.getBoundingClientRect();
    if (src && dst && !reduced() && typeof Element.prototype.animate === 'function') {
      const icon = celebration.reward?.currency === 'INR' ? ICONS.day5 : ICONS.coin;
      anims = [0, 1, 2].map((k) => {
        const img = document.createElement('img');
        img.src = icon; img.alt = ''; img.setAttribute('aria-hidden', 'true');
        Object.assign(img.style, { position: 'fixed', zIndex: 200, pointerEvents: 'none', width: '34px', height: '34px', objectFit: 'contain', left: `${src.left + src.width / 2 - 17}px`, top: `${src.top + src.height / 2 - 17}px` });
        document.body.appendChild(img);
        const dx = dst.left + dst.width / 2 - (src.left + src.width / 2), dy = dst.top + dst.height / 2 - (src.top + src.height / 2);
        const a = img.animate([
          { transform: 'translate(0,0) scale(.6)', opacity: 0 },
          { transform: `translate(${dx * 0.25}px,${dy * 0.25 - 60}px) scale(1.3)`, opacity: 1, offset: 0.3 },
          { transform: `translate(${dx}px,${dy}px) scale(.45)`, opacity: 0.3 },
        ], { duration: 1000, delay: 250 + k * 110, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'both' });
        a.onfinish = () => img.remove();
        return { a, img };
      });
    }
    return () => { clearTimeout(off); anims.forEach(({ a, img }) => { a.cancel(); img.remove(); }); };
  }, [celebration]);

  if (!rewards.length) return null;
  const current = rewards[Math.max(0, idx - 1)];
  const shown = rewards.find((r) => r.day === picked) || current;
  const doneCount = rewards.filter((r) => r.status === 'CLAIMED').length;

  return (
    <div className={`${styles.stage} ${vertical ? styles.vertical : ''}`}>
      <div className={styles.head}>
        <span className={styles.count}><b>{String(doneCount).padStart(2, '0')}</b> of {String(rewards.length).padStart(2, '0')} secured</span>
      </div>
      <svg className={styles.svg} viewBox={`0 0 ${geo.w} ${geo.h}`} role="group" aria-label="Reward road" preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id="vlGlow"><stop offset="0" stopColor="#ffc94d" stopOpacity=".35" /><stop offset="1" stopColor="#ffc94d" stopOpacity="0" /></radialGradient>
          <linearGradient id="vlHill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2a1658" stopOpacity=".55" /><stop offset="1" stopColor="#0a0814" stopOpacity="0" /></linearGradient>
        </defs>

        <g className={styles.decor} aria-hidden="true">
          {!vertical && <><path d={`M0 ${geo.h} L0 ${geo.h - 90} L170 ${geo.h - 170} L320 ${geo.h - 100} L520 ${geo.h - 200} L760 ${geo.h - 90} L930 ${geo.h - 150} L${geo.w} ${geo.h - 80} L${geo.w} ${geo.h}Z`} fill="url(#vlHill)" />
            <g className={styles.planet}><circle cx="150" cy="80" r="26" fill="#3b2275" /><ellipse cx="150" cy="80" rx="46" ry="9" fill="none" stroke="#6b4bd0" strokeWidth="2" transform="rotate(-18 150 80)" /></g></>}
          {STARS.map((s, i) => (
            <circle key={i} cx={(s.x / 100) * geo.w} cy={(s.y / 100) * geo.h} r={s.r} className={styles.star} style={{ animationDelay: `${s.d}s` }} />
          ))}
        </g>

        {/* road: base reveals, energy flows forward, gold fills behind the character */}
        <path d={geo.d} className={styles.roadEdge} pathLength="1" />
        <path d={geo.d} className={styles.roadBed} pathLength="1" />
        <path ref={pathRef} d={geo.d} className={styles.energy} />
        <path ref={glowRef} d={geo.d} className={styles.trailGlow} strokeDasharray="0 99999" />
        <path ref={trailRef} d={geo.d} className={styles.trail} strokeDasharray="0 99999" />

        <g transform={`translate(${geo.pts[0].x} ${geo.pts[0].y})`}>
          <circle r="14" className={styles.startDot} />
          <text y={vertical ? 5 : 38} x={vertical ? 26 : 0} textAnchor={vertical ? 'start' : 'middle'} className={styles.dayText}>START</text>
        </g>

        {rewards.map((r, i) => {
          const p = geo.pts[i + 1];
          const size = r.isUltimate ? 150 : vertical ? 96 : 104;
          const st = r.status;
          const hot = st === 'AVAILABLE';
          const side = vertical ? (p.x < geo.w / 2 ? 'r' : 'l') : 'b';
          const lx = side === 'r' ? size / 2 + 14 : side === 'l' ? -size / 2 - 14 : 0;
          const anchor = side === 'r' ? 'start' : side === 'l' ? 'end' : 'middle';
          const ly = side === 'b' ? size / 2 + 26 : -2;
          const label = `Day ${r.day}: ${r.reward.title}, ${formatAmount(r.reward.currency, r.reward.amount)}, ${statusText(r)}`;
          return (
            <g key={r.day} transform={`translate(${p.x} ${p.y})`}>
              <g className={styles.pop} style={{ animationDelay: `${0.15 + i * 0.12}s` }}>
                <g ref={(el) => { nodeEls.current[r.day] = el; }} role="button" tabIndex={0} aria-label={label} aria-pressed={shown.day === r.day}
                  className={`${styles.node} ${shown.day === r.day ? styles.picked : ''}`}
                  onClick={() => setPicked(r.day)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setPicked(r.day); } }}>
                  {(st === 'CLAIMED' || hot || r.isUltimate) && <circle r={size * 0.95} fill="url(#vlGlow)" className={st === 'LOCKED' ? styles.dimGlow : ''} />}
                  {r.isUltimate && <circle r={size / 2 + 12} className={styles.rays} />}
                  {hot && <circle r={size / 2 + 6} className={styles.halo} />}
                  <circle r={size / 2 - 3} className={`${styles.disc} ${styles['n_' + st]}`} />
                  <g className={`${styles.floatArt} ${st === 'LOCKED' ? styles.slow : ''}`}>
                    <image href={getRewardIcon(r)} x={-size / 2 + 8} y={-size / 2 + 8} width={size - 16} height={size - 16} preserveAspectRatio="xMidYMid meet"
                      className={`${st === 'LOCKED' ? styles.artLocked : ''} ${burstDay === r.day ? styles.artPop : ''}`} />
                  </g>
                  {st === 'CLAIMED' && <g transform={`translate(${size / 2 - 12} ${-size / 2 + 12})`}><circle r="13" className={styles.tick} /><path d="M-5.5 0 L-1.5 4.5 L6 -4.5" className={styles.tickMark} /></g>}
                  {st === 'LOCKED' && <g transform={`translate(${size / 2 - 12} ${-size / 2 + 12})`}><circle r="13" className={styles.lockBadge} /><path d="M-4.5 -1h9v7h-9z M-3 -1v-3a3 3 0 016 0V-1" className={styles.lockMark} /></g>}
                  <text x={lx} y={ly} textAnchor={anchor} className={styles.dayText}>DAY {String(r.day).padStart(2, '0')}</text>
                  <text x={lx} y={ly + 22} textAnchor={anchor} className={styles.amtText}>{formatAmount(r.reward.currency, r.reward.amount)}</text>
                  {hot && (
                    <g transform={`translate(0 ${-size / 2 - 22})`} className={styles.chipBounce}>
                      <rect x="-30" y="-12" width="60" height="22" rx="11" className={styles.chip} /><text y="4" textAnchor="middle" className={styles.chipText}>TODAY</text>
                    </g>
                  )}
                  {burstDay === r.day && BURST.map((b, k) => <circle key={k} r="5" className={styles.spark} style={{ '--dx': `${b.dx}px`, '--dy': `${b.dy}px`, animationDelay: `${b.d}ms` }} />)}
                </g>
              </g>
            </g>
          );
        })}

        <g ref={charRef} className={`${styles.char} ${claiming ? styles.busy : ''}`} transform={`translate(${geo.pts[0].x} ${geo.pts[0].y})`}>
          <ellipse cy="2" rx="18" ry="5" className={styles.shadow} />
          <g className={styles.bob}><image href={ICONS.flame} x="-26" y="-74" width="52" height="64" preserveAspectRatio="xMidYMid meet" /></g>
        </g>
      </svg>

      <div className={styles.detail} aria-live="polite">
        <img src={getRewardIcon(shown)} alt="" width="84" height="84" decoding="async" className={shown.status === 'LOCKED' ? styles.dimImg : ''} />
        <div>
          <p className={styles.dKick}>Day {String(shown.day).padStart(2, '0')} · {statusText(shown)}</p>
          <p className={styles.dAmt}>{formatAmount(shown.reward.currency, shown.reward.amount)}</p>
          {shown.reward.title !== formatAmount(shown.reward.currency, shown.reward.amount) && <p className={styles.dTitle}>{shown.reward.title}</p>}
        </div>
        <span className={`${styles.dBadge} ${styles['b_' + shown.status]}`}>{shown.status === 'CLAIMED' ? <><Check size={14} /> Collected</> : shown.status === 'LOCKED' ? <><Lock size={14} /> Locked</> : 'Up next'}</span>
      </div>
      <ul className={styles.srOnly}>{rewards.map((r) => <li key={r.day}>Day {r.day}: {r.reward.title}, {statusText(r)}</li>)}</ul>
    </div>
  );
}

export default memo(StreakJourney);
