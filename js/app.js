// App shell: one shared Controller (one visit count, one audio engine) and the Tidal Rings scene.
import { Controller } from "./core.js";
import { mount } from "./scene.js";

const PREVIEWS = ["waiting", "active", "activeEnd", "complete"];

// ?preview=active fakes the clock for design review; it never records counts.
const q = new URLSearchParams(location.search).get("preview");
const ctrl = new Controller({ preview: PREVIEWS.includes(q) ? q : "live" });
ctrl.emit();

mount(document.getElementById("stage"), ctrl);

// Skip link: focus <main> (handled in JS so the URL does not change).
const skip = document.getElementById("skip");
skip.addEventListener("click", (e) => { e.preventDefault(); const mn = document.querySelector("main"); mn.tabIndex = -1; mn.focus(); });
ctrl.on((s) => { if (skip.textContent !== s.skip) { skip.textContent = s.skip; skip.lang = s.lang; skip.dir = s.dir; } });

// No palette fade on first paint: drop the .boot class after two frames.
requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.remove("boot")));
