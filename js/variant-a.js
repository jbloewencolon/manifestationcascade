// Variant A: Tidal Rings. Rings expand from the theme; silver by day, gold with stars during the session.
import { mix as cmix } from "./core.js";
import { buildView } from "./view.js";
import { startLoop } from "./loop.js";

const AUDIO = {
  waiting: { freqs: [110, 164.81, 220, 329.63], gain: 0.12, lfo: 0.07, bell: { every: 28, freq: 293.66, gain: 0.08 } },
  active: { freqs: [65.41, 98, 130.81], gain: 0.16, lfo: 0.05, bell: { every: 40, freq: 196, gain: 0.14 } },
};
const stars = Array.from({ length: 80 }, (_, i) => [((i * 9301 + 49297) % 233280) / 233280, ((i * 4096 + 150889) % 714025) / 714025, i]);

export function mount(stage, ctrl) {
  const v = buildView(stage, { numPrefix: "", globe: true, muteX: true });
  const r = v.refs;
  v.bind(ctrl);
  ctrl.setAudio(AUDIO);
  if (!ctrl.cur) ctrl.emit();
  v.update(ctrl.cur, false);
  const unsub = ctrl.on(v.update);

  const stop = startLoop(r.canvas, ctrl, 4, ({ ctx, w, h, rect, ts, m, s, reduce, now }) => {
    const t = reduce ? 6 : ts / 1000;
    const mr = r.mark.getBoundingClientRect();
    const cx = mr.left + mr.width / 2 - rect.left, cy = mr.top + mr.height / 2 - rect.top;
    const R = Math.hypot(Math.max(cx, w - cx), Math.max(cy, h - cy));
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 90);
    g.addColorStop(0, cmix("#C9D6DF", "#E2B95B", m, 0.35 + 0.15 * m));
    g.addColorStop(1, cmix("#C9D6DF", "#E2B95B", m, 0));
    ctx.fillStyle = g; ctx.fillRect(cx - 90, cy - 90, 180, 180);
    const rings = (period, life, color, peak, width) => {
      if (peak <= 0.001) return;
      for (let k = Math.floor((t - life) / period); k <= Math.floor(t / period); k++) {
        const p = (t - k * period) / life; if (p < 0 || p > 1) continue;
        const rad = 30 + Math.pow(p, 0.75) * R * 0.9;
        ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI * 2);
        ctx.strokeStyle = color(peak * Math.pow(Math.sin(Math.PI * p), 1.4)); ctx.lineWidth = width; ctx.stroke();
      }
    };
    rings(3.6, 11, (a) => `rgba(150,172,188,${a})`, (1 - m) * 0.85, 1.1);
    rings(10, 16, (a) => `rgba(226,185,91,${a})`, m * 0.38, 1);
    if (m > 0) stars.forEach(([x, y, i]) => { ctx.fillStyle = `rgba(243,239,232,${m * 0.22 * (0.5 + 0.5 * Math.sin(t * 0.3 + i))})`; ctx.fillRect(x * w, y * h, 1.2, 1.2); });
    if (s.state === "complete" && s.completeAt) {
      const p = (now - s.completeAt) / 7000;
      if (p >= 0 && p <= 1) { ctx.beginPath(); ctx.arc(cx, cy, p * R * 1.1, 0, Math.PI * 2); ctx.strokeStyle = `rgba(226,185,91,${(1 - p) * 0.7})`; ctx.lineWidth = 1.5; ctx.stroke(); }
    }
  });
  return () => { unsub(); stop(); };
}
