// Variant B: Meridian. A dot-matrix world map with the 19:07 line sweeping westward; "YOU" marks the visitor.
import { mix as cmix } from "./core.js";
import { buildView } from "./view.js";
import { startLoop } from "./loop.js";

const PAL = {
  waiting: { fg: "#E8EAED", dot: "#2A2F3A", band: "#8FA3B8" },
  active: { fg: "#FFF4E6", dot: "#3A2C22", band: "#F0A35E" },
};
const AUDIO = {
  waiting: { freqs: [55, 82.41, 164.81, 329.63], type: "sine", gain: 0.1, lfo: 0.04 },
  active: { freqs: [49, 73.42, 98, 146.83], type: "triangle", gain: 0.1, lfo: 0.03, pulse: { bpm: 58, gain: 0.12 } },
};
// Rough latitude per IANA region, only to place the "YOU" dot on the map. No finer location is used.
const LAT = { America: 38, Europe: 49, Africa: 4, Asia: 32, Australia: -30, Pacific: -14, Atlantic: 30, Indian: -10, Antarctica: -70 };
const MW = 1440, MH = 560;

let landPromise; // land mask is fetched once and kept across tab switches
function loadLand() {
  landPromise = landPromise || Promise.all([
    new Promise((res, rej) => {
      if (window.topojson) return res();
      const s = document.createElement("script");
      s.src = "vendor/topojson-client.min.js"; s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    }),
    fetch("vendor/land-110m.json").then((r) => r.json()),
  ]).then(([, topo]) => {
    const geo = window.topojson.feature(topo, topo.objects.land);
    const c = document.createElement("canvas"); c.width = MW; c.height = MH;
    const x = c.getContext("2d"); x.fillStyle = "#000";
    const P = ([lon, lat]) => [(lon + 180) / 360 * MW, (80 - lat) / 140 * MH];
    const poly = (rings) => { x.beginPath(); rings.forEach((ring) => ring.forEach((pt, i) => { const [a, b] = P(pt); i ? x.lineTo(a, b) : x.moveTo(a, b); })); x.fill("evenodd"); };
    (geo.features || [geo]).forEach((f) => { const g = f.geometry || f; if (g.type === "Polygon") poly(g.coordinates); else if (g.type === "MultiPolygon") g.coordinates.forEach(poly); });
    return { data: x.getImageData(0, 0, MW, MH).data };
  }).catch(() => "none");
  return landPromise;
}

export function mount(stage, ctrl) {
  const v = buildView(stage, { numPrefix: "0", globe: true, muteX: true, tz: true, progress: true });
  const r = v.refs;
  v.bind(ctrl);
  ctrl.setAudio(AUDIO);
  if (!ctrl.cur) ctrl.emit();
  v.update(ctrl.cur, false);
  const unsub = ctrl.on(v.update);

  let mask = null, dots = null, dead = false;
  loadLand().then((m) => { if (!dead) { mask = m; dots = null; } });

  const wrap = (d) => ((d + 540) % 360) - 180;
  const buildDots = (w, h) => {
    const mapW = Math.max(w, h * 360 / 140 * 0.95), mapH = mapW * 140 / 360, x0 = (w - mapW) / 2, y0 = (h - mapH) / 2 + h * 0.02;
    const step = Math.max(7, mapW / 210), list = [];
    for (let y = y0 + step / 2; y < y0 + mapH; y += step) for (let x = x0 + step / 2; x < x0 + mapW; x += step) {
      if (x < -step || x > w + step || y < -step || y > h + step) continue;
      const lon = (x - x0) / mapW * 360 - 180, lat = 80 - (y - y0) / mapH * 140;
      let land = true;
      if (mask && mask !== "none") {
        const px = Math.min(MW - 1, Math.max(0, Math.floor((lon + 180) / 360 * MW))), py = Math.min(MH - 1, Math.max(0, Math.floor((80 - lat) / 140 * MH)));
        land = mask.data[(py * MW + px) * 4 + 3] > 0;
      } else if (!mask) land = false;
      if (land) list.push([x, y, lon]);
    }
    dots = { list, w, h, step, x0, y0, mapW, mapH };
  };

  const stop = startLoop(r.canvas, ctrl, 4, ({ ctx, w, h, ts, m, s, reduce, resized }) => {
    if (resized) dots = null;
    if (!dots || dots.w !== w || dots.h !== h) buildDots(w, h);
    const t = reduce ? 0 : ts / 1000, D = dots;
    const utcH = (s.now % 86400000) / 3600000;
    const L = wrap((19 + 7 / 60 - utcH) * 15);
    const lonX = (lon) => D.x0 + (lon + 180) / 360 * D.mapW;
    const dotC = cmix(PAL.waiting.dot, PAL.active.dot, m), bandHex = m > 0.5 ? PAL.active.band : PAL.waiting.band;
    const bx = lonX(L), bw = D.mapW * 15 / 360;
    for (const off of [-D.mapW, 0, D.mapW]) {
      const g = ctx.createLinearGradient(bx + off, 0, bx + off + bw, 0);
      g.addColorStop(0, cmix(PAL.waiting.band, PAL.active.band, m, 0.14)); g.addColorStop(1, cmix(PAL.waiting.band, PAL.active.band, m, 0));
      ctx.fillStyle = g; ctx.fillRect(bx + off, 0, bw, h);
      ctx.fillStyle = cmix(PAL.waiting.band, PAL.active.band, m, 0.55); ctx.fillRect(bx + off, 0, 1, h);
    }
    const rad = D.step * 0.2;
    for (const [x, y, lon] of D.list) {
      const d = wrap(lon - L);
      let k = d >= 0 && d <= 15 ? 1 - d / 15 * 0.75 : d < 0 && d > -4 ? (1 + d / 4) * 0.3 : 0;
      if (k > 0 && !reduce) k *= 0.85 + 0.15 * Math.sin(t * 0.8 + y * 0.05);
      ctx.fillStyle = k > 0 ? cmix(m > 0.5 ? PAL.active.dot : PAL.waiting.dot, bandHex, k * 0.85) : dotC;
      ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
    ctx.font = "11px 'IBM Plex Mono', monospace"; ctx.fillStyle = cmix(PAL.waiting.band, PAL.active.band, m, 0.9);
    const lx = ((bx % w) + w) % w; ctx.fillText("19:07", lx + 6, h - 18);
    const offDeg = -new Date(s.now).getTimezoneOffset() / 4, region = (s.tz || "").split("/")[0];
    const lat = LAT[region] != null ? LAT[region] : 20, yx = lonX(offDeg), yy = D.y0 + (80 - lat) / 140 * D.mapH;
    ctx.fillStyle = cmix(PAL.waiting.fg, PAL.active.fg, m, 0.18); ctx.fillRect(yx, 0, 1, h);
    ctx.beginPath(); ctx.arc(yx, yy, 3.5, 0, Math.PI * 2); ctx.fillStyle = cmix(PAL.waiting.fg, PAL.active.fg, m); ctx.fill();
    ctx.fillText("YOU", yx + 8, yy - 8);
    if (m > 0 && !reduce) for (let k = 0; k < 3; k++) { const p = ((t / 6 + k / 3) % 1); ctx.beginPath(); ctx.arc(yx, yy, 4 + p * 120, 0, Math.PI * 2); ctx.strokeStyle = `rgba(240,163,94,${m * 0.45 * (1 - p)})`; ctx.lineWidth = 1; ctx.stroke(); }
  });
  return () => { dead = true; unsub(); stop(); };
}
