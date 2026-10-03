// Pure geometry. Positions are layout only — status, amount and day come from the backend rewards[].
export function buildGeo(count, vertical) {
  const total = count + 1; // index 0 = START, 1..count = reward days
  let w, h, pts;
  if (vertical) {
    const step = 150;
    w = 360; h = 90 + (total - 1) * step + 100;
    pts = Array.from({ length: total }, (_, i) => ({ x: i === 0 ? 180 : i % 2 === 1 ? 105 : 255, y: h - 70 - i * step }));
  } else {
    w = 1100; h = 470;
    const left = 100, right = 110;
    pts = Array.from({ length: total }, (_, i) => {
      const t = i / (total - 1);
      const wig = i === 0 || i === total - 1 ? 0 : i % 2 === 1 ? 46 : -46;
      return { x: left + (w - left - right) * t, y: 345 - t * 175 + wig };
    });
  }
  return { w, h, pts, d: smoothPath(pts) };
}

// Catmull-Rom -> cubic Bézier, passes through every node.
export function smoothPath(p) {
  let d = `M${p[0].x} ${p[0].y}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] || p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] || p2;
    d += ` C${p1.x + (p2.x - p0.x) / 6} ${p1.y + (p2.y - p0.y) / 6} ${p2.x - (p3.x - p1.x) / 6} ${p2.y - (p3.y - p1.y) / 6} ${p2.x} ${p2.y}`;
  }
  return d;
}

// Fixed decoration (deterministic so it never reshuffles on re-render).
export const STARS = Array.from({ length: 26 }, (_, i) => ({
  x: (i * 197) % 1000 / 10, y: (i * 89) % 900 / 10, r: 0.8 + (i % 3) * 0.5, d: (i % 7) * 0.6,
}));
