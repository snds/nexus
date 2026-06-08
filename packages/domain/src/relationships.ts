/**
 * The graph is a heterogeneous multigraph: any entity may link to any other,
 * and an edge means "observed associated with" (discovery §2.4).
 */

import type { EntityType } from "./entities.js";

/** Canonical relationship kinds seen in the flows (discovery §2.4). Open-ended by design. */
export type RelationshipKind =
  | "runs" // actor → campaign
  | "delivers" // campaign → malware
  | "uses" // malware → exploit
  | "targets" // campaign → recipient
  | "contacts" // malware/hash → infra (C2)
  | "detected_by" // hash → sid
  | "carries" // message → hash/url
  | "sent_from" // message → sender ip
  | "associated"; // generic fallback

export interface Relationship {
  readonly id: string;
  readonly source: string; // Entity.id
  readonly target: string; // Entity.id
  readonly kind: RelationshipKind;
  /** Directionality hint for layout/labeling; undirected edges set this false. */
  readonly directed?: boolean;
}

/** A neighbor bucket as shown in the "Neighbor Nodes / By type…" panel (discovery §4.4). */
export interface NeighborBucket {
  readonly type: EntityType;
  readonly count: number;
  /** True when the real count exceeds what's loaded (the "+N" aggregate signal). */
  readonly aggregate: boolean;
}
