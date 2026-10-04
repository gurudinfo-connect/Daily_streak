// True on devices where decorative, always-running animation should be skipped.
export const isLite = (() => {
  if (typeof window === 'undefined') return false;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const weak = (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 2;
  return reduce || weak;
})();
export default function useLite() { return isLite; }
