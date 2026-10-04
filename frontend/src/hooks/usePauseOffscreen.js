import { useEffect } from 'react';

// Sets data-paused on the element when it is scrolled out of view or the tab is hidden,
// which pauses every CSS animation inside it (see index.css).
export default function usePauseOffscreen(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    let visible = true;
    const apply = () => { el.dataset.paused = String(!visible || document.hidden); };
    const io = typeof IntersectionObserver === 'function' ? new IntersectionObserver(([e]) => { visible = e.isIntersecting; apply(); }) : null;
    io?.observe(el);
    document.addEventListener('visibilitychange', apply);
    apply();
    return () => { io?.disconnect(); document.removeEventListener('visibilitychange', apply); };
  }, [ref]);
}
