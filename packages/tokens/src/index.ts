/**
 * JS-accessible token references. Components reference CSS vars via these helpers
 * so the var names live in exactly one place.
 */

export const ENTITY_TYPES = [
  "actor",
  "campaign",
  "malware",
  "exploit",
  "sid",
  "hash",
  "url",
  "domain",
  "ip",
  "hostname",
  "filename",
  "email",
  "message",
  "scan",
] as const;

export type EntityToken = (typeof ENTITY_TYPES)[number];

export const SEVERITY_LEVELS = [
  "malicious",
  "phishing",
  "suspicious",
  "medium",
  "benign",
  "unknown",
] as const;

export type SeverityToken = (typeof SEVERITY_LEVELS)[number];

/** `var(--entity-ip)` — use in inline styles or cva when a dynamic token is needed. */
export const entityColor = (t: EntityToken): string => `var(--entity-${t})`;
export const severityColor = (s: SeverityToken): string => `var(--severity-${s})`;
