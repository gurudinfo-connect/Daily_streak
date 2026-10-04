import React, { memo } from 'react';
import styles from './Journey.module.css';
import { ridge, STARS, FLAKES } from './journeyLayout.js';

const FLAGS = ['#5b8cff', '#f4f1ff', '#ff6b6b', '#4bd18b', '#ffc94d'];

// Everest backdrop: sky, aurora, ridges, the summit massif with its snowcap, flags, clouds and snowfall.
function Scenery({ geo, vertical, lite }) {
  const { w, h, pts } = geo;
  const top = pts[pts.length - 1];
  const ax = top.x, ay = top.y - 112; // apex of the mountain sits just above the summit medallion
  const R = vertical ? 1.2 : 2.4;
  const massif = `M${ax - 520 / R} ${h} L${ax - 300 / R} ${ay + 330} L${ax - 190 / R} ${ay + 250} L${ax - 120 / R} ${ay + 265} L${ax - 60 / R} ${ay + 150} L${ax - 24} ${ay + 128} L${ax} ${ay} L${ax + 30} ${ay + 96} L${ax + 70 / R} ${ay + 150} L${ax + 130 / R} ${ay + 230} L${ax + 250 / R} ${ay + 300} L${ax + 420 / R} ${h}Z`;
  const cap = `M${ax} ${ay} L${ax - 24} ${ay + 128} L${ax - 12} ${ay + 112} L${ax - 4} ${ay + 138} L${ax + 8} ${ay + 108} L${ax + 18} ${ay + 128} L${ax + 30} ${ay + 96}Z`;
  const shade = `M${ax} ${ay} L${ax + 30} ${ay + 96} L${ax + 70 / R} ${ay + 150} L${ax + 130 / R} ${ay + 230} L${ax + 250 / R} ${ay + 300} L${ax + 420 / R} ${h} L${ax + 20} ${h} L${ax + 4} ${ay + 150}Z`;
  const bx = pts[0].x, by = pts[0].y - 78;
  return (
    <g className={styles.decor} aria-hidden="true">
      <defs>
        <linearGradient id="evSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0b0a24" /><stop offset=".6" stopColor="#1d1450" /><stop offset="1" stopColor="#3a1d5e" /></linearGradient>
        <linearGradient id="evRock" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3b3566" /><stop offset="1" stopColor="#0f0d22" /></linearGradient>
        <linearGradient id="evFar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2a2358" stopOpacity=".7" /><stop offset="1" stopColor="#120f2c" stopOpacity=".2" /></linearGradient>
        <radialGradient id="evAurora"><stop offset="0" stopColor="#4fe0c0" stopOpacity=".35" /><stop offset="1" stopColor="#4fe0c0" stopOpacity="0" /></radialGradient>
      </defs>
      <rect width={w} height={h} fill="url(#evSky)" />
      <ellipse cx={w * 0.3} cy={h * 0.16} rx={w * 0.34} ry={h * 0.12} fill="url(#evAurora)" className={styles.aurora} />
      {STARS.map((s, i) => <circle key={i} cx={(s.x / 100) * w} cy={(s.y / 100) * h * 0.55} r={s.r} className={styles.star} style={{ animationDelay: `${s.d}s` }} />)}
      <path d={ridge(w, h, h * 0.72, h * 0.32, vertical ? 60 : 90, 7)} fill="url(#evFar)" />
      <path d={massif} fill="url(#evRock)" />
      <path d={shade} fill="#07061a" opacity=".4" />
      <path d={cap} fill="#e6efff" />
      <path d={ridge(w, h, h * 0.88, h * 0.2, vertical ? 50 : 70, 3)} fill="#0d0b20" opacity=".92" />
      {/* summit flag */}
      <g transform={`translate(${ax} ${ay})`}>
        <line y1="0" y2="-44" stroke="#cfd8f0" strokeWidth="2.5" />
        <path d="M1 -44 L34 -35 L1 -26Z" fill="#ffc94d" className={styles.flagWave} />
      </g>
      {/* prayer flags at base camp */}
      <g transform={`translate(${bx - 70} ${by})`}>
        <path d="M0 0 Q70 26 140 0" fill="none" stroke="#6e6a99" strokeWidth="1.4" />
        {FLAGS.map((c, i) => <path key={i} d={`M${i * 28 + 12} ${Math.sin((i * 28 + 12) / 140 * Math.PI) * 14 + 1} l11 3 l-11 9z`} fill={c} className={styles.prayer} style={{ animationDelay: `${i * 0.25}s` }} />)}
      </g>
      {!lite && (
        <>
          {[0, 1, 2].map((i) => <ellipse key={i} cx={w * (0.18 + i * 0.3)} cy={h * (0.3 + i * 0.12)} rx={vertical ? 60 : 110} ry={vertical ? 12 : 18} className={styles.cloud} style={{ animationDuration: `${22 + i * 7}s`, animationDelay: `${-i * 6}s` }} />)}
          <g style={{ '--fall': `${h}px` }}>
            {FLAKES.map((f, i) => <circle key={i} cx={(f.x / 100) * w} cy="-6" r={f.s} className={styles.flake} style={{ animationDuration: `${f.d}s`, animationDelay: `${f.o}s`, '--dx': `${f.dx}px` }} />)}
          </g>
        </>
      )}
    </g>
  );
}
export default memo(Scenery);
