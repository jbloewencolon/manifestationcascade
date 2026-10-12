// Sends participation events. PLACEHOLDER until the serverless endpoint exists (see endpoint-plan.md and trackers-plan.md):
// for now it only keeps aggregates on this device. Phase 3 replaces the body with a POST that fails silently.
import { get, set, key } from "./util.js";

// kind: "visit" | "commitment" | "meditation". Aggregates only: date | time zone | kind.
export function record(kind, tz) {
  let agg = {};
  try { agg = JSON.parse(get("mc.counts") || "{}"); } catch (e) { agg = {}; }
  const k = key(Date.now()) + "|" + tz + "|" + kind;
  agg[k] = (agg[k] || 0) + 1;
  set("mc.counts", JSON.stringify(agg));
}
