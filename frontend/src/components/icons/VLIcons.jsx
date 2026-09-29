import React, { useId } from 'react';

// Polished, gradient-filled icon set used across the rewards UI.
const Svg = ({ size = 48, children, className }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden="true" focusable="false">{children}</svg>
);
const Grad = ({ id, a, b, vertical = true }) => (
  <linearGradient id={id} x1="0" y1="0" x2={vertical ? 0 : 1} y2={vertical ? 1 : 1}>
    <stop offset="0" stopColor={a} /><stop offset="1" stopColor={b} />
  </linearGradient>
);

export function FlameIcon(props) {
  const id = useId();
  return (
    <Svg {...props}>
      <defs><Grad id={`${id}a`} a="#ffd75a" b="#ff6a1a" /><Grad id={`${id}b`} a="#fff4b8" b="#ffb52e" /></defs>
      <path d="M25 3c1 8 12 12 12 24a13 13 0 0 1-26 0c0-5 3-9 6-11 0 5 2 7 5 7-2-8 0-15 3-20z" fill={`url(#${id}a)`} />
      <path d="M24 24c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-6 1 2 2 3 3 3-1-4-1-6 0-9z" fill={`url(#${id}b)`} />
    </Svg>
  );
}

export function CoinIcon(props) {
  const id = useId();
  return (
    <Svg {...props}>
      <defs><Grad id={id} a="#ffe27a" b="#f2a100" /></defs>
      <circle cx="24" cy="24" r="20" fill={`url(#${id})`} />
      <circle cx="24" cy="24" r="15.5" fill="none" stroke="#b97600" strokeOpacity=".55" strokeWidth="2" />
      <path d="M16.5 17.5l7.5 15 7.5-15" fill="none" stroke="#9a5f00" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 15a17 17 0 0 1 13-9" fill="none" stroke="#fff" strokeOpacity=".6" strokeWidth="2.5" strokeLinecap="round" />
    </Svg>
  );
}

export function GiftIcon(props) {
  const id = useId();
  return (
    <Svg {...props}>
      <defs><Grad id={id} a="#9d6bff" b="#5a2bd6" /></defs>
      <rect x="6" y="19" width="36" height="24" rx="4" fill={`url(#${id})`} />
      <rect x="4" y="13" width="40" height="9" rx="3" fill="#8b5cf6" />
      <rect x="21" y="13" width="6" height="30" fill="#ffd75a" />
      <path d="M24 13c-6 0-11-2-9-6s8-1 9 6zM24 13c6 0 11-2 9-6s-8-1-9 6z" fill="#ffc62e" />
    </Svg>
  );
}

export function CrownIcon(props) {
  const id = useId();
  return (
    <Svg {...props}>
      <defs><Grad id={id} a="#ffe27a" b="#f2a100" /></defs>
      <path d="M6 16l9 9 9-15 9 15 9-9-4 22H10z" fill={`url(#${id})`} />
      <rect x="10" y="38" width="28" height="5" rx="2" fill="#c98500" />
      <circle cx="24" cy="30" r="3" fill="#8b5cf6" /><circle cx="14" cy="32" r="2" fill="#ff6a9e" /><circle cx="34" cy="32" r="2" fill="#3ddcff" />
    </Svg>
  );
}

export function TrophyIcon(props) {
  const id = useId();
  return (
    <Svg {...props}>
      <defs><Grad id={id} a="#ffe27a" b="#f2a100" /></defs>
      <path d="M14 6h20v12a10 10 0 0 1-20 0z" fill={`url(#${id})`} />
      <path d="M14 10H6c0 8 3 11 8 11M34 10h8c0 8-3 11-8 11" fill="none" stroke="#f2a100" strokeWidth="3" />
      <rect x="21" y="27" width="6" height="8" fill="#e09400" /><rect x="14" y="35" width="20" height="6" rx="2" fill="#c98500" />
    </Svg>
  );
}
