/**
 * Integration PORTS (architecture §1, §6). The domain + graph talk ONLY to these
 * interfaces. TAP / Splunk / PTR / threat-intel SDKs live in `packages/integrations`
 * as ADAPTERS that implement these. No vendor types leak above this line.
 */

import type { Entity } from "./entities.js";
import type { Relationship } from "./relationships.js";

export interface GraphFragment {
  entities: Entity[];
  relationships: Relationship[];
}

export interface ExpandOptions {
  /** Number of edges to traverse (toolbar = 1, context menu = 1 or 2). */
  depth?: number;
  /** Restrict to neighbor types ("By type…"). */
  types?: string[];
}

/** TAP — the threat-data substrate. Search, expand neighbors, run server-side transforms. */
export interface ThreatDataPort {
  search(query: string): Promise<Entity[]>;
  getEntity(id: string): Promise<Entity | null>;
  expand(entityId: string, opts?: ExpandOptions): Promise<GraphFragment>;
  transform(transformId: string, entityId: string): Promise<GraphFragment>;
}

/** Splunk — query the customer's SIEM for click/login activity, build graphs from results. */
export interface SplunkPort {
  query(queryId: string, entityIds: string[]): Promise<GraphFragment>;
}

/** PTR (Proofpoint Threat Response) — remediation hand-off. */
export interface RemediationPort {
  addIndicators(entityIds: string[]): Promise<void>;
}

/** Threat-intel enrichment. */
export interface ThreatIntelPort {
  enrich(entityIds: string[]): Promise<void>;
}

export interface Ports {
  tap: ThreatDataPort;
  splunk: SplunkPort;
  ptr: RemediationPort;
  threatIntel: ThreatIntelPort;
}
