// App shell: one shared Controller (one visit count, one audio engine) and three swappable design variants.
import { Controller } from "./core.js";

const VARIANTS = {
  a: () => import("./variant-a.js"),
  b: () => import("./variant-b.js"),
  c: () => import("./variant-c.js"),
};
const PREVIEWS = ["waiting", "active", "activeEnd", "complete"];

// ?preview=active fakes the clock for design review; it never records counts.
const q = new URLSearchParams(location.search).get("preview");
const ctrl = new Controller({ preview: PREVIEWS.includes(q) ? q : "live" });
ctrl.emit();

const stage = document.getElementById("stage");
const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
let dispose = null, current = null, token = 0;

async function show(id, fromGesture) {
  if (!VARIANTS[id]) id = "a";
  if (id === current) return;
  const mine = ++token;
  const mod = await VARIANTS[id]();
  if (mine !== token) return; // a newer tab click superseded this one
  if (dispose) dispose();
  current = id;
  document.body.classList.remove("v-a", "v-b", "v-c");
  document.body.classList.add("v-" + id);
  dispose = mod.mount(stage, ctrl);
  tabs.forEach((t) => {
    const on = t.dataset.v === id;
    t.setAttribute("aria-selected", String(on));
    t.tabIndex = on ? 0 : -1;
  });
  if (fromGesture && ctrl.sound) ctrl.applySound(); // a tab click is a user gesture: safe to (re)start audio
}

const fromHash = () => location.hash.slice(1);
tabs.forEach((t, i) => {
  t.addEventListener("click", () => { history.replaceState(null, "", location.pathname + location.search + "#" + t.dataset.v); show(t.dataset.v, true); });
  t.addEventListener("keydown", (e) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (!step && e.key !== "Home" && e.key !== "End") return;
    e.preventDefault();
    const n = e.key === "Home" ? 0 : e.key === "End" ? tabs.length - 1 : (i + step + tabs.length) % tabs.length;
    tabs[n].focus(); tabs[n].click();
  });
});
window.addEventListener("hashchange", () => show(fromHash(), false));
show(fromHash(), false).then(() => requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.remove("boot"))));
