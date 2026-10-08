// Variant C: Ma. A single brush-like ring drawn once around the theme, breathing slowly during the session.
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
  const stop = startLoop(r.canvas, ctrl, 5, ({ ctx, rect, ts, t0, m, reduce }) => {
    const t = ts / 1000;
    if (!pat) pat = ctx.createPattern(g, "repeat");
    ctx.globalAlpha = 0.045 - 0.02 * m; ctx.fillStyle = pat; ctx.fillRect(0, 0, rect.width, rect.height); ctx.globalAlpha = 1;
    const mr = r.mark.getBoundingClientRect(), cx = mr.left + mr.width / 2 - rect.left, cy = mr.top + mr.height / 2 - rect.top;
    const breath = reduce ? 0 : m * 0.035 * Math.sin(Math.PI * 2 * t / 10);
    const R = mr.width / 2 * 0.96 * (1 + breath);
    const p = reduce ? 1 : Math.min(1, (ts - t0) / 4500), ep = 1 - Math.pow(1 - p, 3);
    const a0 = -Math.PI / 2, a1 = a0 + Math.PI * 2 * ep, ink = cmix("#1C1B1A", "#EDE6D8", m);
    ctx.lineCap = "round";
    ctx.shadowColor = ink; ctx.shadowBlur = 8 * m;
    ctx.beginPath(); ctx.arc(cx, cy, R, a0, a1); ctx.strokeStyle = ink; ctx.globalAlpha = 0.85; ctx.lineWidth = 1.4; ctx.stroke();
    ctx.shadowBlur = 0;
    jit.forEach(([dr, ph]) => { ctx.beginPath(); ctx.arc(cx, cy, R + dr + 0.4 * Math.sin(ph), a0 + 0.02, a1); ctx.globalAlpha = 0.14; ctx.lineWidth = 0.8; ctx.stroke(); });
    ctx.globalAlpha = 1;
    ctx.beginPath(); ctx.arc(cx, cy - R, 4, 0, Math.PI * 2); ctx.fillStyle = "#B5422F"; ctx.fill();
  });
  return () => { unsub(); stop(); };
}
