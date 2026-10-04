import React, { memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Lock, Check } from 'lucide-react';
import styles from './Journey.module.css';
import { ICONS, getRewardIcon } from '../../assets/icons.js';
import useMediaQuery from '../../hooks/useMediaQuery.js';
import { buildGeo, campName, altitude, fmtM } from './journeyLayout.js';
import Scenery from './Scenery.jsx';
import { formatAmount } from '../../utils/streakInsights';
import useLite from '../../hooks/useLite.js';
import usePauseOffscreen from '../../hooks/usePauseOffscreen.js';

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
  const canvasRef = useRef(null);
  const stageRef = useRef(null);
  const scaleRef = useRef(1);
  const lite = useLite();
  usePauseOffscreen(stageRef);
  const nodeEls = useRef({});
  const posRef = useRef(null);
  const rafRef = useRef(0);
  const [m, setM] = useState(null); // measured distances along the road
  const [picked, setPicked] = useState(null);
  const [burstDay, setBurstDay] = useState(null);
  const idx = rewards.length ? currentIndex(rewards, streakData.streak.currentDay) : 0;

  // px-per-viewBox-unit, kept in a CSS variable so overlay layers scale with the map.
  useLayoutEffect(() => {
    const el = canvasRef.current;
    if (!el) return undefined;
    const apply = () => {
      const sc = el.clientWidth / geo.w;
      scaleRef.current = sc;
      el.style.setProperty('--s', String(sc));
      if (posRef.current !== null && pathRef.current && charRef.current) {
        const p = pathRef.current.getPointAtLength(posRef.current);
        charRef.current.style.transform = `translate3d(${p.x * sc}px, ${p.y * sc}px, 0)`;
      }
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, [geo.w]);

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
    const target = Math.max(0, m.nodes[Math.min(idx, m.nodes.length - 1)] - (idx === 0 ? 0 : (rewards[idx - 1]?.isUltimate ? (vertical ? 118 : 104) : (vertical ? 100 : 88))));
    const draw = (d) => {
      const p = path.getPointAtLength(d);
      char.style.opacity = '1';
      char.style.transform = `translate3d(${p.x * scaleRef.current}px, ${p.y * scaleRef.current}px, 0)`;
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
  }, [m, idx, vertical]);

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
    <div ref={stageRef} className={`${styles.stage} ${vertical ? styles.vertical : ''}`}>
      <div className={styles.head}>
        <span className={styles.elev}><i aria-hidden="true">▲</i> {idx > 0 ? `${campName(idx - 1, rewards.length)} · ${fmtM(altitude(idx - 1, rewards.length))}` : 'Trailhead · 2,860 m'}</span>
        <span className={styles.count}><b>{String(doneCount).padStart(2, '0')}</b> of {String(rewards.length).padStart(2, '0')} secured</span>
      </div>
      <div ref={canvasRef} className={styles.canvas} style={{ aspectRatio: `${geo.w} / ${geo.h}` }}>
            <svg className={styles.svg} viewBox={`0 0 ${geo.w} ${geo.h}`} role="group" aria-label="Reward road" preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id="vlGlow"><stop offset="0" stopColor="#ffc94d" stopOpacity=".35" /><stop offset="1" stopColor="#ffc94d" stopOpacity="0" /></radialGradient>
          <linearGradient id="vlHill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2a1658" stopOpacity=".55" /><stop offset="1" stopColor="#0a0814" stopOpacity="0" /></linearGradient>
        </defs>

        <Scenery geo={geo} vertical={vertical} lite={lite} />

        {/* trail: rope-line reveals, footsteps flow upward, gold fills behind the climber */}
        <path d={geo.d} className={styles.roadEdge} pathLength="1" />
        <path d={geo.d} className={styles.roadBed} pathLength="1" />
        <path ref={pathRef} d={geo.d} className={`${styles.energy} ${lite ? '' : styles.flowing}`} />
        <path ref={glowRef} d={geo.d} className={styles.trailGlow} strokeDasharray="0 99999" />
        <path ref={trailRef} d={geo.d} className={styles.trail} strokeDasharray="0 99999" />

        <g transform={`translate(${geo.pts[0].x} ${geo.pts[0].y})`}>
          <circle r="14" className={styles.startDot} />
          <text y={vertical ? 5 : 38} x={vertical ? 26 : 0} textAnchor={vertical ? 'start' : 'middle'} className={styles.dayText}>TRAILHEAD</text>
        </g>

        {rewards.map((r, i) => {
          const p = geo.pts[i + 1];
          const size = r.isUltimate ? 150 : vertical ? 96 : 104;
          const st = r.status;
          const hot = st === 'AVAILABLE';
          const side = vertical ? (p.x < geo.w / 2 ? 'r' : 'l') : 'b';
          const lx = side === 'r' ? size / 2 + 14 : side === 'l' ? -size / 2 - 34 : 0;
          const anchor = side === 'r' ? 'start' : side === 'l' ? 'end' : 'middle';
          const ly = side === 'b' ? size / 2 + 26 : -16;
          const label = `Day ${r.day}: ${r.reward.title}, ${formatAmount(r.reward.currency, r.reward.amount)}, ${statusText(r)}`;
          return (
            <g key={r.day} transform={`translate(${p.x} ${p.y})`}>
              <g className={styles.pop} style={{ animationDelay: `${0.15 + i * 0.12}s` }}>
                <g ref={(el) => { nodeEls.current[r.day] = el; }} role="button" tabIndex={0} aria-label={label} aria-pressed={shown.day === r.day}
                  className={`${styles.node} ${shown.day === r.day ? styles.picked : ''}`}
                  onClick={() => setPicked(r.day)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setPicked(r.day); } }}>
                  {(st === 'CLAIMED' || hot || r.isUltimate) && <circle r={size * 0.95} fill="url(#vlGlow)" className={st === 'LOCKED' ? styles.dimGlow : ''} />}
                  {r.isUltimate && <circle r={size / 2 + 12} className={styles.rays} />}
                  <circle r={size / 2 - 3} className={`${styles.disc} ${styles['n_' + st]}`} />
                  <g className={styles.floatArt}>
                    <image href={getRewardIcon(r)} x={-size / 2 + 8} y={-size / 2 + 8} width={size - 16} height={size - 16} preserveAspectRatio="xMidYMid meet"
                      className={`${st === 'LOCKED' ? styles.artLocked : ''} ${burstDay === r.day ? styles.artPop : ''}`} />
                  </g>
                  {st === 'CLAIMED' && <g transform={`translate(${size / 2 - 12} ${-size / 2 + 12})`}><circle r="13" className={styles.tick} /><path d="M-5.5 0 L-1.5 4.5 L6 -4.5" className={styles.tickMark} /></g>}
                  {st === 'LOCKED' && <g transform={`translate(${size / 2 - 12} ${-size / 2 + 12})`}><circle r="13" className={styles.lockBadge} /><path d="M-4.5 -1h9v7h-9z M-3 -1v-3a3 3 0 016 0V-1" className={styles.lockMark} /></g>}
                  <text x={lx} y={ly} textAnchor={anchor} className={styles.dayText}>DAY {String(r.day).padStart(2, '0')}</text>
                  <text x={lx} y={ly + 22} textAnchor={anchor} className={styles.amtText}>{formatAmount(r.reward.currency, r.reward.amount)}</text>
                  <text x={lx} y={ly + 40} textAnchor={anchor} className={styles.campText}>{campName(i, rewards.length).toUpperCase()} · {fmtM(altitude(i, rewards.length))}</text>
                  {hot && (
                    <g transform={`translate(0 ${-size / 2 - 22})`} >
                      <rect x="-30" y="-12" width="60" height="22" rx="11" className={styles.chip} /><text y="4" textAnchor="middle" className={styles.chipText}>TODAY</text>
                    </g>
                  )}
                  {burstDay === r.day && BURST.map((b, k) => <circle key={k} r="5" className={styles.spark} style={{ '--dx': `${b.dx}px`, '--dy': `${b.dy}px`, animationDelay: `${b.d}ms` }} />)}
                </g>
              </g>
            </g>
          );
        })}

      </svg>
      <div className={styles.overlay} aria-hidden="true">
        {rewards.map((r, i) => r.status === 'AVAILABLE' && (
          <span key={r.day} className={styles.haloWrap} style={{ left: `${(geo.pts[i + 1].x / geo.w) * 100}%`, top: `${(geo.pts[i + 1].y / geo.h) * 100}%`, '--hs': `${(r.isUltimate ? 150 : vertical ? 96 : 104) + 14}` }}>
            <i className={styles.haloRing} />
          </span>
        ))}
        <div ref={charRef} className={`${styles.char} ${claiming ? styles.busy : ''}`} style={{ opacity: 0 }}>
          <div className={styles.bob}><img src={ICONS.flame} alt="" decoding="async" /></div>
        </div>
      </div>
      </div>

      <div className={styles.detail} aria-live="polite">
        <img src={getRewardIcon(shown)} alt="" width="84" height="84" decoding="async" className={shown.status === 'LOCKED' ? styles.dimImg : ''} />
        <div>
          <p className={styles.dKick}>Day {String(shown.day).padStart(2, '0')} · {campName(shown.day - 1, rewards.length)} · {fmtM(altitude(shown.day - 1, rewards.length))}</p>
          <p className={styles.dStatus}>{statusText(shown)}</p>
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
