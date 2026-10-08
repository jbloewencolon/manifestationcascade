// Canvas animation loop shared by all variants: DPR-aware sizing, eased waiting<->active mix,
// and a throttled static redraw when the visitor prefers reduced motion.
export function startLoop(canvas, ctrl, mixSeconds, draw) {
  const mq = matchMedia("(prefers-reduced-motion: reduce)");
  let raf, last = performance.now(), lastDraw = 0, mix = ctrl.cur && ctrl.cur.active ? 1 : 0;
  const t0 = last;
  const frame = (ts) => {
    raf = requestAnimationFrame(frame);
    const reduce = mq.matches;
    if (reduce && ts - lastDraw < 250) return;
    lastDraw = ts;
    const dpr = Math.min(2, devicePixelRatio || 1), rect = canvas.getBoundingClientRect(), w = rect.width, h = rect.height;
    const pw = Math.round(w * dpr), ph = Math.round(h * dpr);
    const resized = canvas.width !== pw || canvas.height !== ph;
    if (resized) { canvas.width = pw; canvas.height = ph; }
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const s = ctrl.cur, dt = (ts - last) / 1000; last = ts;
    const target = s.active ? 1 : 0;
    mix = reduce ? target : mix + Math.sign(target - mix) * Math.min(Math.abs(target - mix), dt / mixSeconds);
    draw({ ctx, w, h, rect, ts, t0, m: mix, s, reduce, resized, now: ctrl.now() });
  };
  raf = requestAnimationFrame(frame);
  return () => cancelAnimationFrame(raf);
}
