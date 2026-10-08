// "Add to calendar": RFC 5545 .ics built in the browser (no server, no third party).
// Times are floating (no time zone), so the event lands at 19:07 in each person's own calendar zone.
// Repeats daily, one hour long, with a 10 minute reminder.
const CRLF = "\r\n";
const SITE = "https://manifestationcascade.com/";
const p2 = (n) => String(n).padStart(2, "0");
const local = (d) => d.getFullYear() + p2(d.getMonth() + 1) + p2(d.getDate()) + "T" + p2(d.getHours()) + p2(d.getMinutes()) + "00";
const utc = (d) => d.getUTCFullYear() + p2(d.getUTCMonth() + 1) + p2(d.getUTCDate()) + "T" + p2(d.getUTCHours()) + p2(d.getUTCMinutes()) + p2(d.getUTCSeconds()) + "Z";
const esc = (s) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

// RFC 5545 3.1: lines are folded at 75 octets, continuation lines start with one space.
export function fold(line) {
  const enc = new TextEncoder();
  if (enc.encode(line).length <= 75) return line;
  const out = []; let cur = "", bytes = 0;
  for (const ch of line) {
    const b = enc.encode(ch).length;
    if (bytes + b > 75) { out.push(cur); cur = " "; bytes = 1; }
    cur += ch; bytes += b;
  }
  out.push(cur);
  return out.join(CRLF);
}

function span(startMs) {
  const s = new Date(startMs), e = new Date(s);
  e.setHours(20, 7, 0, 0);
  return { s, e };
}

// s: controller snapshot (uses s.theme, s.steps, s.calLabel, s.start)
export function eventText(s) {
  return { title: "Manifestation Cascade: " + s.theme, details: s.steps[0] + "\n" + SITE };
}

export function buildIcs(s, now = Date.now()) {
  const { s: a, e: b } = span(s.start), t = eventText(s);
  const lines = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Manifestation Cascade//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
    "BEGIN:VEVENT", "UID:daily@manifestationcascade.com", "DTSTAMP:" + utc(new Date(now)),
    "DTSTART:" + local(a), "DTEND:" + local(b), "RRULE:FREQ=DAILY",
    "SUMMARY:" + esc(t.title), "DESCRIPTION:" + esc(t.details), "URL:" + SITE,
    "BEGIN:VALARM", "TRIGGER:-PT10M", "ACTION:DISPLAY", "DESCRIPTION:" + esc(t.title), "END:VALARM",
    "END:VEVENT", "END:VCALENDAR",
  ];
  return lines.map(fold).join(CRLF) + CRLF;
}

export function googleUrl(s) {
  const { s: a, e: b } = span(s.start), t = eventText(s);
  const q = new URLSearchParams({ action: "TEMPLATE", text: t.title, details: t.details, dates: local(a) + "/" + local(b), recur: "RRULE:FREQ=DAILY" });
  return "https://calendar.google.com/calendar/render?" + q.toString();
}

export function downloadIcs(s) {
  const url = URL.createObjectURL(new Blob([buildIcs(s)], { type: "text/calendar;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url; a.download = "manifestation-cascade.ics";
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
