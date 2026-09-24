import React, { useEffect, useRef, useState } from 'react';

/** Light count-up in the spirit of React Bits Count Up. No animation library. */
export default function CountUp({ to = 0, duration = 700 }) {
  const target = Number(to);
  const safe = Number.isFinite(target) ? target : 0;
  const [n, setN] = useState(0);
  const shown = useRef(0);

  useEffect(() => {
    const reduce =
      document.documentElement.classList.contains('reduced-motion') ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      shown.current = safe;
      setN(safe);
      return undefined;
    }
    const from = shown.current;
    const start = performance.now();
    let frame = 0;
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - p) ** 3;
      const next = Math.round(from + (safe - from) * eased);
      shown.current = next;
      setN(next);
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [safe, duration]);

  return <span>{n}</span>;
}
