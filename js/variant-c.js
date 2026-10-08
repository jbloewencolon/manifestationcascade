// Variant C: Ma. A brush-like ring drawn, held and released in an endless cycle around the theme, breathing slowly.
import { mix as cmix } from "./core.js";
import { buildView } from "./view.js";
import { startLoop } from "./loop.js";

const AUDIO = {
  waiting: { freqs: [392], gain: 0.05, lfo: 0.09, bell: { every: 45, freq: 523.25, gain: 0.07 } },
  active: { freqs: [196, 293.66], gain: 0.07, lfo: 0.06, bell: { every: 60, freq: 392, gain: 0.1 } },
};

function grain() {
  const c = document.createElement("canvas"); c.width = c.height = 160;
  const x = c.getContext("2d"), d = x.createImageData(160, 160);
  for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
  x.putImageData(d, 0, 0);
  return c;
}

export function mount(stage, ctrl) {
  const v = buildView(stage, { numPrefix: "", globe: false, muteX: false, ring: true });
  const r = v.refs;
  v.bind(ctrl);
  ctrl.setAudio(AUDIO);
  if (!ctrl.cur) ctrl.emit();
  v.update(ctrl.cur, false);
  const unsub = ctrl.on(v.update);

  const g = grain(); let pat = null;
  const jit = Array.from({ length: 3 }, (_, i) => [(i - 1) * 0.7, (i * 37 % 11) / 11 * Math.PI * 2]);
  // Perpetual cycle: the stroke is drawn, held, fades, then is drawn again from a new starting point
  // (golden-angle steps, so no two cycles look alike). Static full ring under reduced motion / paused.
  const DRAW = 5, HOLD = 5, FADE = 4, CYCLE = DRAW + HOLD + FADE, GOLDEN = 2.399963;
  const stop = startLoop(r.canvas, ctrl, 5, ({ ctx, rect, ts, t0, m, reduce }) => {
    const t = ts / 1000, el = (ts - t0) / 1000, cycle = Math.floor(el / CYCLE), u = el % CYCLE;
    if (!pat) pat = ctx.createPattern(g, "repeat");
    ctx.globalAlpha = 0.045 - 0.02 * m; ctx.fillStyle = pat; ctx.fillRect(0, 0, rect.width, rect.height); ctx.globalAlpha = 1;
    const mr = r.mark.getBoundingClientRect(), cx = mr.left + mr.width / 2 - rect.left, cy = mr.top + mr.height / 2 - rect.top;
    const breath = reduce ? 0 : (0.02 + 0.015 * m) * Math.sin(Math.PI * 2 * t / 10);
    const R = mr.width / 2 * 0.96 * (1 + breath);
    const p = reduce ? 1 : Math.min(1, u / DRAW), ep = 1 - Math.pow(1 - p, 3);
    const fade = reduce ? 1 : u > DRAW + HOLD ? 1 - (u - DRAW - HOLD) / FADE : 1;
    const a0 = -Math.PI / 2 + (reduce ? 0 : cycle * GOLDEN), a1 = a0 + Math.PI * 2 * ep, ink = cmix("#1C1B1A", "#EDE6D8", m);
    ctx.lineCap = "round";
    ctx.shadowColor = ink; ctx.shadowBlur = 8 * m;
    ctx.beginPath(); ctx.arc(cx, cy, R, a0, a1); ctx.strokeStyle = ink; ctx.globalAlpha = 0.85 * fade; ctx.lineWidth = 1.4; ctx.stroke();
    ctx.shadowBlur = 0;
    jit.forEach(([dr, ph]) => { ctx.beginPath(); ctx.arc(cx, cy, R + dr + 0.4 * Math.sin(ph), a0 + 0.02, a1); ctx.globalAlpha = 0.14 * fade; ctx.lineWidth = 0.8; ctx.stroke(); });
    ctx.globalAlpha = fade;
    ctx.beginPath(); ctx.arc(cx + R * Math.cos(a1), cy + R * Math.sin(a1), 4, 0, Math.PI * 2); ctx.fillStyle = "#B5422F"; ctx.fill();
    ctx.globalAlpha = 1;
  });
  return () => { unsub(); stop(); };
}
