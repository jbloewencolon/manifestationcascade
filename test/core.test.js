import { test } from "node:test";
import assert from "node:assert/strict";

process.env.TZ = "America/New_York";
const { compute, fmt, startOn, HOUR, STRINGS, LANGS } = await import("../site/js/core.js");
const at = (y, mo, d, h, mi, s = 0) => new Date(y, mo - 1, d, h, mi, s).getTime();

test("before 19:07 -> waiting, counts down to today's 19:07", () => {
  const c = compute(at(2026, 6, 1, 18, 0));
  assert.equal(c.state, "waiting");
  assert.equal(c.remaining, 67 * 60000);
});

test("19:07 sharp -> active with a full hour", () => {
  const c = compute(at(2026, 6, 1, 19, 7));
  assert.equal(c.state, "active");
  assert.equal(c.remaining, HOUR);
});

test("20:07 -> complete, then waiting for tomorrow", () => {
  assert.equal(compute(at(2026, 6, 1, 20, 7)).state, "complete");
  const w = compute(at(2026, 6, 1, 20, 30));
  assert.equal(w.state, "waiting");
  assert.equal(new Date(w.start).getDate(), 2);
  assert.equal(new Date(w.start).getHours(), 19);
  assert.equal(new Date(w.start).getMinutes(), 7);
});

test("DST spring-forward day: session still starts at local 19:07", () => {
  const c = compute(at(2026, 3, 8, 12, 0));
  assert.equal(c.state, "waiting");
  assert.equal(new Date(c.start).getHours(), 19);
  assert.equal(c.remaining, 7 * 3600000 + 7 * 60000 - 0); // 12:00 -> 19:07 wall clock, after the 02:00 jump
});

test("DST fall-back day and month rollover", () => {
  const c = compute(at(2026, 11, 1, 20, 30));
  assert.equal(new Date(c.start).getHours(), 19);
  assert.equal(compute(at(2026, 12, 31, 21, 0)).state, "waiting");
  assert.equal(new Date(compute(at(2026, 12, 31, 21, 0)).start).getFullYear(), 2027);
});

test("progress stays within 0..1 across states", () => {
  for (const h of [0, 6, 12, 18, 19, 19.5, 20, 21, 23]) {
    const p = compute(at(2026, 6, 1, Math.floor(h), (h % 1) * 60)).progress;
    assert.ok(p >= 0 && p <= 1, `h=${h} p=${p}`);
  }
});

test("fmt", () => {
  assert.equal(fmt(3661000, true), "01:01:01");
  assert.equal(fmt(61000), "01:01");
  assert.equal(fmt(-5), "00:00");
});

test("every language has the same string keys and 4 steps", () => {
  const keys = Object.keys(STRINGS.en).sort();
  for (const l of LANGS) {
    assert.deepEqual(Object.keys(STRINGS[l.code]).sort(), keys, l.code);
    assert.equal(STRINGS[l.code].steps.length, 4, l.code);
  }
});
