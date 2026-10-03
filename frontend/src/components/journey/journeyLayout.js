// Pure geometry for the roadmap. Positions are layout only — every status,
// amount and day still comes from the backend rewards[] array.
export const DESKTOP = { w: 1000, h: 440 };
export const MOBILE = { w: 360, h: 0 }; // height is computed from node count

export function buildPoints(count, vertical) {
  // index 0 is START, 1..count are reward days
  const total = count + 1;
  if (vertical) {
    const step = 128;
    return {
      w: MOBILE.w,
      h: 70 + (total - 1) * step + 90,
      pts: Array.from({ length: total }, (_, i) => ({ x: i % 2 === 0 ? 120 : 240, y: 60 + (total - 1 - i) * step + 40 })),
    };
  }
  const left = 80;
  const span = DESKTOP.w - left * 2;
  return {
    w: DESKTOP.w,
    h: DESKTOP.h,
    pts: Array.from({ length: total }, (_, i) => ({
      x: left + (span * i) / (total - 1),
      y: DESKTOP.h - 120 - (190 * i) / (total - 1) + (i % 2 === 0 ? 34 : -34),
    })),
  };
}

export function segmentPath(a, b, vertical) {
  if (vertical) {
    const my = (a.y + b.y) / 2;
    return `M${a.x} ${a.y} C${a.x} ${my} ${b.x} ${my} ${b.x} ${b.y}`;
  }
  const mx = (a.x + b.x) / 2;
  return `M${a.x} ${a.y} C${mx} ${a.y} ${mx} ${b.y} ${b.x} ${b.y}`;
}
