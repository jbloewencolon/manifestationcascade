// Shared page structure for all three variants. Variants differ in CSS, canvas art and a few options.
// Everything is built with createElement/textContent (no innerHTML) so the strict CSP and XSS posture hold.
import { LANGS } from "./core.js";

const NS = "http://www.w3.org/2000/svg";

function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}

function svg(size, vb, strokeW, shapes) {
  const s = document.createElementNS(NS, "svg");
  s.setAttribute("width", size); s.setAttribute("height", size); s.setAttribute("viewBox", vb);
  s.setAttribute("fill", "none"); s.setAttribute("stroke", "currentColor"); s.setAttribute("stroke-width", strokeW);
  s.setAttribute("aria-hidden", "true");
  const refs = {};
  shapes.forEach(([tag, attrs, name]) => {
    const n = document.createElementNS(NS, tag);
    Object.keys(attrs).forEach((k) => n.setAttribute(k, attrs[k]));
    s.appendChild(n);
    if (name) refs[name] = n;
  });
  return { svg: s, refs };
}

const setText = (n, v) => { if (n.textContent !== v) n.textContent = v; };

// opts: { numPrefix: "" | "0", globe: bool, muteX: bool, tz: bool, progress: bool, ring: bool }
export function buildView(stage, opts) {
  const r = {};
  r.canvas = el("canvas"); r.canvas.setAttribute("aria-hidden", "true");

  // Header: language picker + sound toggle
  const header = el("header", "hdr");
  const langLabel = el("label", "lang");
  if (opts.globe) {
    langLabel.appendChild(svg(16, "0 0 16 16", "1.1", [["circle", { cx: 8, cy: 8, r: 6.5 }], ["ellipse", { cx: 8, cy: 8, rx: 2.8, ry: 6.5 }], ["path", { d: "M1.5 8h13" }]]).svg);
  } else {
    const g = el("span", "lang-glyph", "A/文"); g.setAttribute("aria-hidden", "true"); langLabel.appendChild(g);
  }
  r.langName = el("span", "lang-name");
  r.select = el("select");
  r.select.setAttribute("aria-label", "Language");
  LANGS.forEach((l) => { const o = el("option", null, l.name); o.value = l.code; r.select.appendChild(o); });
  langLabel.append(r.langName, r.select);

  const right = el("div", "hdr-right");
  if (opts.tz) { r.tz = el("span", "tz"); r.tz.dir = "ltr"; right.appendChild(r.tz); }
  r.soundBtn = el("button", "sound"); r.soundBtn.type = "button"; r.soundBtn.setAttribute("aria-label", "Sound");
  const ico = svg(18, "0 0 20 20", "1.2", [
    ["path", { d: "M3 8v4h3l4 3V5L6 8H3z" }],
    ["path", { d: opts.muteX ? "M13 7.5a3.5 3.5 0 0 1 0 5M15 5.5a6.5 6.5 0 0 1 0 9" : "M13 7.5a3.5 3.5 0 0 1 0 5" }, "waves"],
    ...(opts.muteX ? [["path", { d: "M13 8l4 4M17 8l-4 4" }, "mute"]] : []),
  ]);
  r.waves = ico.refs.waves; r.mute = ico.refs.mute;
  r.soundBtn.appendChild(ico.svg);
  right.appendChild(r.soundBtn);
  header.append(langLabel, right);

  // Main
  const main = el("main", "main");
  r.theme = el("h1", "theme");
  if (opts.ring) { r.mark = el("div", "mark"); r.mark.appendChild(r.theme); main.appendChild(r.mark); }
  else { r.mark = r.theme; main.appendChild(r.theme); }
  r.label = el("p", "label");
  r.count = el("p", "count"); r.count.setAttribute("role", "timer"); r.count.dir = "ltr";
  main.append(r.label, r.count);
  if (opts.progress) { const bar = el("div", "bar"); bar.dir = "ltr"; r.fill = el("div", "bar-fill"); bar.appendChild(r.fill); main.appendChild(bar); }
  r.sub = el("p", "sub");
  const acts = el("div", "actions");
  r.commit = el("button", "btn"); r.commit.type = "button";
  r.committed = el("p", "note");
  r.med = el("button", "btn btn-med"); r.med.type = "button";
  r.medDone = el("p", "note note-med");
  acts.append(r.commit, r.committed, r.med, r.medDone);
  main.append(r.sub, acts);

  // Footer
  const footer = el("footer", "ftr");
  r.steps = el("ol", "steps");
  r.stepEls = [0, 1, 2, 3].map((i) => {
    const li = el("li");
    const n = el("span", "n", opts.numPrefix + (i + 1)); n.setAttribute("aria-hidden", "true");
    const t = el("span", "t");
    li.append(n, t); r.steps.appendChild(li);
    return t;
  });
  r.safe = el("p", "safe");
  const row = el("div", "row");
  r.privacy = el("span");
  r.aboutBtn = el("button", "about-btn"); r.aboutBtn.type = "button"; r.aboutBtn.setAttribute("aria-expanded", "false");
  row.append(r.privacy, r.aboutBtn);
  r.aboutBody = el("p", "about-body"); r.aboutBody.hidden = true; r.aboutBody.id = "about-body";
  r.aboutBtn.setAttribute("aria-controls", "about-body");
  footer.append(r.steps, r.safe, row, r.aboutBody);

  r.status = el("p", "sr-only"); r.status.setAttribute("role", "status");

  stage.replaceChildren(r.canvas, header, main, footer, r.status);

  return {
    refs: r,
    bind(ctrl) {
      r.select.addEventListener("change", () => ctrl.setLang(r.select.value));
      r.soundBtn.addEventListener("click", () => ctrl.toggleSound());
      r.commit.addEventListener("click", () => ctrl.commit());
      r.med.addEventListener("click", () => ctrl.meditate());
      r.aboutBtn.addEventListener("click", () => {
        r.aboutBody.hidden = !r.aboutBody.hidden;
        r.aboutBtn.setAttribute("aria-expanded", String(!r.aboutBody.hidden));
      });
    },
    update(s, changed) {
      if (stage.lang !== s.lang) stage.lang = s.lang;
      if (stage.dir !== s.dir) stage.dir = s.dir;
      document.body.classList.toggle("is-active", s.active);
      setText(r.langName, s.langName);
      if (r.select.value !== s.lang) r.select.value = s.lang;
      if (r.tz) setText(r.tz, s.tz + " · " + s.utc);
      r.soundBtn.setAttribute("aria-pressed", String(s.sound));
      r.waves.toggleAttribute("hidden", !s.sound);
      if (r.mute) r.mute.toggleAttribute("hidden", s.sound);
      setText(r.theme, s.theme);
      setText(r.label, s.countLabel);
      setText(r.count, s.count);
      if (r.fill) { const w = (s.progress * 100).toFixed(2) + "%"; if (r.fill.style.width !== w) r.fill.style.width = w; }
      setText(r.sub, s.sub);
      setText(r.commit, s.commitLabel); r.commit.hidden = !s.showCommit;
      setText(r.committed, s.committedLabel); r.committed.hidden = !s.showCommitted;
      setText(r.med, s.medLabel); r.med.hidden = !s.showMed;
      setText(r.medDone, s.medDoneLabel); r.medDone.hidden = !s.showMedDone;
      r.steps.hidden = !s.showSteps;
      r.stepEls.forEach((n, i) => setText(n, s.steps[i]));
      setText(r.safe, s.safe);
      setText(r.privacy, s.privacy);
      setText(r.aboutBtn, s.about);
      setText(r.aboutBody, s.aboutBody);
      if (changed) setText(r.status, s.countLabel + ". " + s.sub);
    },
  };
}
