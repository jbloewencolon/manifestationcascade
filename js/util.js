// Tiny shared helpers: safe localStorage access and the local-date key used to dedupe per session.
export function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
export function set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage unavailable: degrade silently */ } }
export const pad = (n) => String(n).padStart(2, "0");
// Local calendar date (YYYY-MM-DD) of a timestamp.
export function key(ms) { const d = new Date(ms); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
