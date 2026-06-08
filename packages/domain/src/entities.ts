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

/**
 * Color super-category families (the IDENTITY color channel). Categorical color is reliable to
 * ~8 hues, so the ~14 types collapse to 8 families — color encodes the family (one maximally-
 * distinct hue each), and shape + icon read the specific type within it. Each family's hue is the
 * shared `--entity-{colorToken}` of its members. See DDR DS-2026-006.
 */
export type EntityFamily =
  | "adversary" | "artifact" | "identifier" | "file" | "host" | "web" | "comms" | "meta";

/** Node silhouette — the shape channel. A coarse macro-grouping (4 shapes) that the 8 color
 *  families nest into, so shape and color reinforce one identity (colorblind redundancy). */
export type EntityShape = "circle" | "square" | "diamond" | "hexagon";

export interface EntityFamilyMeta {
  readonly key: EntityFamily;
  readonly label: string;
  /** Radix hue the family's members share (legend swatch + node color). */
  readonly hue: string;
  /** Node silhouette for this family (legend header + canvas node + minimap, one source). */
  readonly shape: EntityShape;
}

/**
 * THE single source for the node language. Both the legend and the canvas/minimap derive a node's
 * shape + color from its family here — so they always match. Ordered for legend display.
 *   shape = macro-class (circle threats · square infrastructure · diamond detections · hexagon comms)
 *   hue   = the family's maximally-distinct color (DDR DS-2026-006)
 */
export const ENTITY_FAMILIES: readonly EntityFamilyMeta[] = [
  { key: "adversary", label: "Adversary", hue: "crimson", shape: "circle" },
  { key: "artifact", label: "Malicious artifact", hue: "plum", shape: "circle" },
  { key: "identifier", label: "Identifier", hue: "orange", shape: "diamond" },
  { key: "file", label: "File", hue: "yellow", shape: "square" },
  { key: "host", label: "Host", hue: "teal", shape: "square" },
  { key: "web", label: "Web", hue: "cyan", shape: "square" },
  { key: "comms", label: "Comms", hue: "iris", shape: "hexagon" },
  { key: "meta", label: "Meta", hue: "gray", shape: "diamond" },
];

const FAMILY_BY_KEY = Object.fromEntries(ENTITY_FAMILIES.map((f) => [f.key, f])) as Record<
  EntityFamily,
  EntityFamilyMeta
>;

/** Family metadata for an entity type — the join everything reads from. */
export function familyOf(type: EntityType): EntityFamilyMeta {
  return FAMILY_BY_KEY[ENTITY_META[type].family];
}
/** Node silhouette for a type (derived from its family — the single source). */
export function shapeOfType(type: EntityType): EntityShape {
  return familyOf(type).shape;
}

/** Display metadata per type — maps a type to its token + glyph id (resolved in the UI layer). */
export interface EntityTypeMeta {
  readonly type: EntityType;
  readonly label: string;
  /** CSS token suffix → `--entity-{colorToken}`. Members of a family share this. */
  readonly colorToken: string;
  /** Color super-category family — the identity color channel (DDR DS-2026-006). */
  readonly family: EntityFamily;
  /** Icon id resolved by the UI layer (no React here). */
  readonly glyph: string;
  /** Does this type have a dedicated full detail page? (discovery §2.1 vs §2.2) */
  readonly hasDetailPage: boolean;
}

export const ENTITY_META: Record<EntityType, EntityTypeMeta> = {
  actor: { type: "actor", label: "Actor", colorToken: "actor", family: "adversary", glyph: "actor", hasDetailPage: true },
  campaign: { type: "campaign", label: "Campaign", colorToken: "campaign", family: "adversary", glyph: "campaign", hasDetailPage: true },
  malware: { type: "malware", label: "Malware", colorToken: "malware", family: "artifact", glyph: "malware", hasDetailPage: true },
  exploit: { type: "exploit", label: "Exploit", colorToken: "exploit", family: "artifact", glyph: "exploit", hasDetailPage: true },
  sid: { type: "sid", label: "Signature ID", colorToken: "sid", family: "identifier", glyph: "sid", hasDetailPage: true },
  hash: { type: "hash", label: "File Hash", colorToken: "hash", family: "identifier", glyph: "hash", hasDetailPage: true },
  url: { type: "url", label: "URL", colorToken: "url", family: "web", glyph: "url", hasDetailPage: true },
  domain: { type: "domain", label: "Domain", colorToken: "domain", family: "web", glyph: "domain", hasDetailPage: true },
  ip: { type: "ip", label: "IP Address", colorToken: "ip", family: "host", glyph: "ip", hasDetailPage: true },
  hostname: { type: "hostname", label: "Hostname", colorToken: "hostname", family: "host", glyph: "hostname", hasDetailPage: false },
  filename: { type: "filename", label: "Filename", colorToken: "filename", family: "file", glyph: "filename", hasDetailPage: false },
  email_address: { type: "email_address", label: "Email Address", colorToken: "email", family: "comms", glyph: "email", hasDetailPage: false },
  prs_message: { type: "prs_message", label: "Message", colorToken: "message", family: "comms", glyph: "message", hasDetailPage: false },
  scan: { type: "scan", label: "Scan", colorToken: "scan", family: "meta", glyph: "scan", hasDetailPage: false },
};
