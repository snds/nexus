/**
 * The closed entity vocabulary (discovery §2). This is the spine of the domain.
 * Adding a type is a deliberate model change, not an incidental one.
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
  "email_address",
  "prs_message",
  "scan",
] as const;

export type EntityType = (typeof ENTITY_TYPES)[number];

/** Verdict — its own channel, independent of entity type (architecture §5). */
export const VERDICTS = [
  "malicious",
  "phishing",
  "suspicious",
  "medium",
  "benign",
  "unknown",
] as const;

export type Verdict = (typeof VERDICTS)[number];

export interface Entity {
  readonly id: string;
  readonly type: EntityType;
  /** Human label shown on the node + detail pane. */
  label: string;
  verdict: Verdict;
  /** Reputation score 0–100 (optional; not all types are scored). */
  score?: number;
  firstSeen?: string;
  lastSeen?: string;
  /** Count of users impacted ("N Users — At Risk"). */
  usersAtRisk?: number;
  /** VIP highlight (discovery §7). */
  vip?: boolean;
  /** Recipient/message risk status (VIP flow): at-risk (received, not clicked) vs impacted
   *  (clicked). Impacted outranks at-risk. Rendered as a status marker on the node. */
  status?: "at_risk" | "impacted";
  /** Sender masquerade/imposter: this entity impersonates a trusted sender. */
  imposter?: boolean;
  /** Type-specific body. Kept open so detail panes can vary by type without widening the core. */
  attrs?: Record<string, unknown>;
  /** Total children this node has in the backend graph (its attack-path branch). Drives the
   *  on-node "unexpanded children" count: hidden = childCount − (children already on canvas). */
  childCount?: number;
  /** Backend neighbor breakdown by type, for the detail pane's "Neighbor Nodes" section. */
  neighborCounts?: Readonly<Partial<Record<EntityType, number>>>;
  /** Identity profile — present on user nodes (email_address). Drives the user-centric
   *  detail panel (Summary tab): org context, cloud posture, risk stats, similar users. */
  userProfile?: UserProfile;
}

/** Identity/user context for the user-node traversal flow. */
export interface UserProfile {
  readonly displayName: string;
  readonly title?: string;
  readonly company?: string;
  readonly department?: string;
  readonly location?: string;
  /** Org-risk flag on the location/profile. */
  readonly atRisk?: boolean;
  readonly emails?: readonly string[];
  /** SaaS apps the identity is active in (rendered as pills). */
  readonly cloudServices?: readonly string[];
  /** Headline risk counters (rendered as colored stat circles). */
  readonly stats?: {
    readonly dlpViolations: number;
    readonly suspiciousLogins: number;
    readonly phishingAttempts: number;
  };
  /** Peers with a similar risk/role profile. */
  readonly similarUsers?: readonly { readonly name: string; readonly email: string }[];
}

/** Display metadata per type — maps a type to its token + glyph id (resolved in the UI layer). */
export interface EntityTypeMeta {
  readonly type: EntityType;
  readonly label: string;
  /** CSS token suffix → `--entity-{colorToken}`. Maps the ~14 types onto the legacy color families. */
  readonly colorToken: string;
  /** Icon id resolved by the UI layer (no React here). */
  readonly glyph: string;
  /** Does this type have a dedicated full detail page? (discovery §2.1 vs §2.2) */
  readonly hasDetailPage: boolean;
}

export const ENTITY_META: Record<EntityType, EntityTypeMeta> = {
  actor: { type: "actor", label: "Actor", colorToken: "actor", glyph: "actor", hasDetailPage: true },
  campaign: { type: "campaign", label: "Campaign", colorToken: "campaign", glyph: "campaign", hasDetailPage: true },
  malware: { type: "malware", label: "Malware", colorToken: "malware", glyph: "malware", hasDetailPage: true },
  exploit: { type: "exploit", label: "Exploit", colorToken: "exploit", glyph: "exploit", hasDetailPage: true },
  sid: { type: "sid", label: "Signature ID", colorToken: "sid", glyph: "sid", hasDetailPage: true },
  hash: { type: "hash", label: "File Hash", colorToken: "hash", glyph: "hash", hasDetailPage: true },
  url: { type: "url", label: "URL", colorToken: "url", glyph: "url", hasDetailPage: true },
  domain: { type: "domain", label: "Domain", colorToken: "domain", glyph: "domain", hasDetailPage: true },
  ip: { type: "ip", label: "IP Address", colorToken: "ip", glyph: "ip", hasDetailPage: true },
  hostname: { type: "hostname", label: "Hostname", colorToken: "hostname", glyph: "hostname", hasDetailPage: false },
  filename: { type: "filename", label: "Filename", colorToken: "filename", glyph: "filename", hasDetailPage: false },
  email_address: { type: "email_address", label: "Email Address", colorToken: "email", glyph: "email", hasDetailPage: false },
  prs_message: { type: "prs_message", label: "Message", colorToken: "message", glyph: "message", hasDetailPage: false },
  scan: { type: "scan", label: "Scan", colorToken: "scan", glyph: "scan", hasDetailPage: false },
};
