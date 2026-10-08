import { test } from "node:test";
import assert from "node:assert/strict";

process.env.TZ = "America/Toronto";
const { buildIcs, googleUrl, fold } = await import("../js/calendar.js");
const snap = { theme: "End the War", steps: ["At 7:07 pm, find a quiet place; begin, please."], start: new Date(2026, 9, 9, 19, 7).getTime() };

test("ics has the required structure, CRLF endings and a daily rule", () => {
  const ics = buildIcs(snap, Date.UTC(2026, 9, 8, 12, 0, 0));
  assert.ok(ics.startsWith("BEGIN:VCALENDAR\r\n") && ics.endsWith("END:VCALENDAR\r\n"));
  assert.ok(!/[^\r]\n/.test(ics), "bare LF found");
  for (const l of ["VERSION:2.0", "BEGIN:VEVENT", "END:VEVENT", "RRULE:FREQ=DAILY", "DTSTAMP:20261008T120000Z", "TRIGGER:-PT10M"]) assert.ok(ics.includes(l), l);
});

test("event uses floating local time 19:07-20:07 (each person's own 7:07 pm)", () => {
  const ics = buildIcs(snap);
  assert.match(ics, /DTSTART:20261009T190700\r\n/);
  assert.match(ics, /DTEND:20261009T200700\r\n/);
  assert.ok(!/DTSTART[^\r]*Z/.test(ics) && !/TZID/.test(ics));
});

test("text is escaped and every line is at most 75 octets", () => {
  const ics = buildIcs(snap);
  assert.match(ics.replace(/\r\n /g, ""), /DESCRIPTION:At 7:07 pm\\, find a quiet place\\; begin\\, please\.\\nhttps/);
  for (const l of ics.split("\r\n")) assert.ok(new TextEncoder().encode(l).length <= 75, l);
});

test("fold never splits a multi-byte character", () => {
  const out = fold("SUMMARY:" + "العربية".repeat(12));
  for (const l of out.split("\r\n")) assert.ok(new TextEncoder().encode(l).length <= 75);
  assert.equal(out.split("\r\n").map((l, i) => (i ? l.slice(1) : l)).join(""), "SUMMARY:" + "العربية".repeat(12));
});

test("google link carries the same local times and daily recurrence", () => {
  const u = new URL(googleUrl(snap));
  assert.equal(u.hostname, "calendar.google.com");
  assert.equal(u.searchParams.get("dates"), "20261009T190700/20261009T200700");
  assert.equal(u.searchParams.get("recur"), "RRULE:FREQ=DAILY");
});
