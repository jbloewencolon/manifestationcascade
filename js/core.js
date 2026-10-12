// Cascade core: clock state machine, i18n, audio engine, controller.
// Pure ES module; browser globals are only touched inside functions so compute()/fmt() are testable in Node.

import { STRINGS, LANGS } from "./strings.js";
import { get, set, pad, key } from "./util.js";
import { record } from "./api.js";

export const HOUR = 3600000;
const DONE = 10 * 60000; // "complete" state lasts 10 min after the hour
const MED_WINDOW = 10 * 60000; // "I Meditated" appears for the last 10 min of the session

const LANG_ALIAS = { iw: "he" };


export function fmt(ms, withHours) {
  const s = Math.ceil(Math.max(0, ms) / 1000);
  return withHours
    ? pad(Math.floor(s / 3600)) + ":" + pad(Math.floor(s % 3600 / 60)) + ":" + pad(s % 60)
    : pad(Math.floor(s / 60)) + ":" + pad(s % 60);
}

// Local 19:07 on the calendar day containing `ms`. The browser handles DST.
export function startOn(ms) { const d = new Date(ms); d.setHours(19, 7, 0, 0); return d.getTime(); }
function dayShift(ms, n) { const d = new Date(ms); d.setDate(d.getDate() + n); return startOn(d.getTime()); }

// Always derived from absolute timestamps, never from a decrementing counter.
export function compute(now) {
  const st = startOn(now);
  if (now < st) { const pe = dayShift(now, -1) + HOUR; return { state: "waiting", start: st, remaining: st - now, progress: (now - pe) / (st - pe) }; }
  if (now < st + HOUR) return { state: "active", start: st, remaining: st + HOUR - now, progress: (now - st) / HOUR };
  if (now < st + HOUR + DONE) return { state: "complete", start: st, remaining: 0, progress: 1 };
  const nx = dayShift(now, 1);
  return { state: "waiting", start: nx, remaining: nx - now, progress: (now - st - HOUR) / (nx - st - HOUR) };
}

// Order: saved choice, then browser languages, then English. (IP geolocation intentionally not used.)
function detectLang() {
  const saved = get("mc.lang");
  if (saved && STRINGS[saved]) return saved;
  const ls = navigator.languages || [navigator.language || "en"];
  for (const l of ls) {
    let c = (l || "").slice(0, 2).toLowerCase();
    c = LANG_ALIAS[c] || c;
    if (STRINGS[c]) return c;
  }
  return "en";
}

function tzName() { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"; } catch (e) { return "UTC"; } }

const hex = (h) => { h = h.replace("#", ""); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; };
export function mix(a, b, k, al) {
  const x = hex(a), y = hex(b);
  const c = x.map((v, i) => Math.round(v + (y[i] - v) * k));
  return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + (al == null ? 1 : al) + ")";
}

const timeFmt = {};
function startLabelFor(lang, ms) {
  try {
    timeFmt[lang] = timeFmt[lang] || new Intl.DateTimeFormat(lang, { hour: "numeric", minute: "2-digit" });
    return timeFmt[lang].format(new Date(ms));
  } catch (e) { return "7:07"; }
}

// Synthesised ambient audio (no audio files to ship or license). Starts only after a user gesture.
const Sound = {
  ctx: null, master: null, voice: null, bellT: null, pulseT: null, firstT: null, mode: null,
  ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") this.ctx.resume();
    return true;
  },
  setOn(on) {
    if (on && !this.ensure()) return;
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(t);
    this.master.gain.setTargetAtTime(on ? 0.6 : 0, t, on ? 1.2 : 0.3);
  },
  setMode(mode, cfg) {
    if (!this.ctx || !cfg || this.mode === mode) return;
    this.clear();
    this.mode = mode;
    const m = cfg[mode];
    if (!m) return;
    const ctx = this.ctx, t = ctx.currentTime, g = ctx.createGain(), oscs = [], n = m.freqs.length, self = this;
    g.gain.value = 0;
    g.gain.setTargetAtTime(m.gain, t, 2);
    g.connect(this.master);
    m.freqs.forEach((f, i) => {
      const o = ctx.createOscillator(); o.type = m.type || "sine"; o.frequency.value = f; o.detune.value = i % 2 ? 5 : -5;
      const vg = ctx.createGain(); vg.gain.value = 0.7 / n;
      const l = ctx.createOscillator(); l.frequency.value = (m.lfo || 0.06) * (1 + i * 0.37);
      const lg = ctx.createGain(); lg.gain.value = 0.5 / n;
      l.connect(lg); lg.connect(vg.gain); o.connect(vg); vg.connect(g);
      o.start(); l.start(); oscs.push(o, l);
    });
    this.voice = { g, oscs };
    if (m.bell) {
      const strike = () => self.bell(m.bell.freq, m.bell.gain || 0.15);
      this.bellT = setInterval(strike, m.bell.every * 1000);
      this.firstT = setTimeout(strike, 2000);
    }
    if (m.pulse) this.pulseT = setInterval(() => self.thump(m.pulse.gain), 60000 / m.pulse.bpm);
  },
  clear() {
    clearInterval(this.bellT); clearInterval(this.pulseT); clearTimeout(this.firstT); this.mode = null;
    if (this.voice && this.ctx) {
      const v = this.voice, t = this.ctx.currentTime;
      v.g.gain.cancelScheduledValues(t);
      v.g.gain.setTargetAtTime(0, t, 1);
      setTimeout(() => { v.oscs.forEach((o) => { try { o.stop(); } catch (e) { /* already stopped */ } }); v.g.disconnect(); }, 5000);
    }
    this.voice = null;
  },
  // Hard stop for backgrounding: when the page is not visible NOTHING may keep playing or scheduling.
  // Closing the context silences every oscillator and tail at once and frees the audio hardware;
  // it is rebuilt on return (see Controller.resumeSound).
  halt() {
    clearInterval(this.bellT); clearInterval(this.pulseT); clearTimeout(this.firstT);
    const c = this.ctx;
    this.ctx = null; this.master = null; this.voice = null; this.mode = null;
    if (c && c.state !== "closed") Promise.resolve().then(() => c.close()).catch(() => {});
  },
  bell(f, gain) {
    const ctx = this.ctx; if (!ctx) return;
    const t = ctx.currentTime, self = this;
    [[1, 1], [2.76, 0.35], [5.4, 0.15]].forEach((p, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.value = f * p[0];
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(gain * p[1], t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 7 / (i + 1));
      o.connect(g); g.connect(self.master); o.start(t); o.stop(t + 8);
    });
  },
  thump(gain) {
    const ctx = this.ctx; if (!ctx) return;
    const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.value = 52;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
    o.connect(g); g.connect(this.master); o.start(t); o.stop(t + 0.5);
  },
};

export class Controller {
  constructor(opts = {}) {
    this.opts = opts;
    this.lang = detectLang();
    this.sound = get("mc.sound") === "1";
    this.still = get("mc.still") === "1"; // user-chosen "pause animation" (WCAG 2.2.2)
    this.offset = 0;
    this.preview = "live";
    this.joined = {};
    this.subs = [];
    this.tz = tzName();
    this.last = null;
    this.wake = null;
    this.completeAt = null;
    this.setPreview(opts.preview, true);
    this.iv = setInterval(() => this.emit(), 250);
    this._vis = () => {
      if (document.visibilityState === "visible") { this.emit(); if (this.last === "active") this.lockScreen(true); this.resumeSound(); }
      else this.pauseSound(); // user switched app / tab, locked the screen, etc.
    };
    this._hide = () => this.pauseSound();
    document.addEventListener("visibilitychange", this._vis);
    window.addEventListener("pagehide", this._hide);
    document.addEventListener("freeze", this._hide);
    if (get("mc.visit") !== key(Date.now())) { set("mc.visit", key(Date.now())); this.rec("visit"); }
    if (this.sound) this.armGesture(); // browsers block autoplay: resume the saved "sound on" choice at the first gesture
  }
  armGesture() {
    if (this._arm) return;
    this._arm = () => {
      document.removeEventListener("pointerdown", this._arm, true);
      document.removeEventListener("keydown", this._arm, true);
      this._arm = null;
      if (this.sound && document.visibilityState === "visible") this.applySound();
    };
    document.addEventListener("pointerdown", this._arm, true);
    document.addEventListener("keydown", this._arm, true);
  }
  pauseSound() { Sound.halt(); } // the saved preference (this.sound) is kept, so sound comes back with the page
  resumeSound() {
    if (!this.sound || document.visibilityState !== "visible") return;
    this.applySound();
    // Some mobile browsers refuse to start audio without a fresh tap: retry on the next gesture.
    setTimeout(() => { if (this.sound && (!Sound.ctx || Sound.ctx.state !== "running")) this.armGesture(); }, 400);
  }
  // Preview modes (?preview=...) fake the clock for design review and never record counts.
  rec(kind) { if (this.preview === "live") record(kind, this.tz); }
  on(fn) { this.subs.push(fn); return () => { const i = this.subs.indexOf(fn); if (i >= 0) this.subs.splice(i, 1); }; }
  now() { return Date.now() + this.offset; }
  setPreview(p, silent) {
    p = p || "live";
    if (p === this.preview && !silent) return;
    this.preview = p;
    this.joined = {};
    const real = Date.now(), st = startOn(real);
    const tg = { waiting: st - (2 * 3600 + 13 * 60 + 40) * 1000, active: st + 14 * 60000, activeEnd: st + HOUR - 6 * 60000, complete: st + HOUR + 1000 }[p];
    this.offset = tg == null ? 0 : tg - real;
    if (!silent) this.emit();
  }
  compute() {
    const now = this.now(), c = compute(now);
    if (c.state === "active") {
      if (this.joined[c.start] == null) this.joined[c.start] = now - c.start;
      c.joinedAt = this.joined[c.start];
    }
    c.now = now;
    return c;
  }
  emit() {
    const c = this.compute();
    if (c.state !== this.last) {
      if (c.state === "complete") this.completeAt = c.now;
      const first = this.last === null;
      this.last = c.state;
      if (this.sound) Sound.setMode(c.state === "waiting" ? "waiting" : "active", this.opts.audio);
      this.lockScreen(c.state === "active");
      this.changed = !first;
    } else this.changed = false;
    this.cur = this.snap(c);
    this.subs.forEach((f) => f(this.cur, this.changed));
  }
  lockScreen(on) {
    if (on && navigator.wakeLock && !this.wake) {
      navigator.wakeLock.request("screen").then((l) => { this.wake = l; l.addEventListener("release", () => { if (this.wake === l) this.wake = null; }); }).catch(() => {});
    } else if (!on && this.wake) {
      this.wake.release().catch(() => {});
      this.wake = null;
    }
  }
  setLang(c) { if (!STRINGS[c]) return; this.lang = c; set("mc.lang", c); this.emit(); }
  setAudio(cfg) { this.opts.audio = cfg; Sound.mode = null; if (this.sound) Sound.setMode(this.last === "waiting" ? "waiting" : "active", cfg); }
  toggleMotion() { this.still = !this.still; set("mc.still", this.still ? "1" : "0"); this.emit(); }
  toggleSound() { this.sound = !this.sound; set("mc.sound", this.sound ? "1" : "0"); this.applySound(); this.emit(); }
  applySound() {
    if (this.sound && document.visibilityState !== "visible") return;
    Sound.setOn(this.sound);
    if (this.sound) { Sound.mode = null; Sound.setMode(this.last === "waiting" ? "waiting" : "active", this.opts.audio); }
  }
  commit() { const c = this.compute(); set("mc.commit", key(c.start)); this.rec("commitment"); this.emit(); }
  meditate() { const c = this.compute(); if (get("mc.med") === key(c.start)) return; set("mc.med", key(c.start)); this.rec("meditation"); this.emit(); }
  destroy() {
    clearInterval(this.iv);
    document.removeEventListener("visibilitychange", this._vis);
    window.removeEventListener("pagehide", this._hide);
    document.removeEventListener("freeze", this._hide);
    this.subs = [];
    Sound.clear(); Sound.setOn(false); this.lockScreen(false);
  }
  snap(c) {
    c = c || this.compute();
    const t = STRINGS[this.lang] || STRINGS.en;
    const L = LANGS.find((l) => l.code === this.lang) || LANGS[0];
    const startLabel = startLabelFor(this.lang, c.start);
    const off = -new Date(c.now).getTimezoneOffset();
    const utc = "UTC" + (off < 0 ? "−" : "+") + Math.floor(Math.abs(off) / 60) + (Math.abs(off) % 60 ? ":" + pad(Math.abs(off) % 60) : "");
    const lateMin = c.state === "active" && c.joinedAt > 60000 ? Math.floor(c.joinedAt / 60000) : 0;
    const medWin = (c.state === "active" && c.remaining <= MED_WINDOW) || c.state === "complete";
    const medDone = get("mc.med") === key(c.start), committed = get("mc.commit") === key(c.start), w = c.state === "waiting";
    let label, count, sub;
    if (w) { label = t.before; count = fmt(c.remaining, true); sub = startLabel + " · " + this.tz; }
    else if (c.state === "active") { label = t.during; count = fmt(c.remaining); sub = lateMin ? t.late.replace("{m}", lateMin) : t.steps[2]; }
    else { label = t.doneT; count = "00:00"; sub = t.doneB; }
    return {
      state: c.state, active: c.state !== "waiting", now: c.now, completeAt: this.completeAt,
      lang: this.lang, dir: L.dir, langName: L.name, theme: t.theme,
      countLabel: label, count, sub, steps: t.steps, privacy: t.privacy, safe: t.safe, langAria: t.langAria, soundAria: t.soundAria, motionAria: t.motionAria, skip: t.skip, motionOff: this.still,
      aboutTitle: t.aboutTitle, story: t.story.map((x) => x.replace("{theme}", t.theme)), doTitle: t.doTitle, doBody: t.doBody, calLabel: t.calLabel, start: c.start,
      commitLabel: t.commit, committedLabel: t.committed, medLabel: t.med, medDoneLabel: t.medDone,
      showCommit: w && !committed, showCommitted: w && committed, showMed: medWin && !medDone, showMedDone: medWin && medDone,
      showSteps: w, progress: Math.max(0, Math.min(1, c.progress)), tz: this.tz, utc, sound: this.sound,
    };
  }
}
