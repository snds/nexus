/**
 * L4 — the in-memory graph MODEL, wrapping graphology. This is renderer-independent
 * on purpose (architecture §3): if scale ever demands WebGL, the renderer swaps and
 * THIS stays. The model owns topology + per-node UI state (selected/hidden/focused).
 */
import Graph from "graphology";
import type { Entity, GraphFragment, Relationship } from "@nexus/domain";

export interface NodeState {
  selected: boolean;
  hidden: boolean;
  focused: boolean;
  /** Aggregate count if this node represents a "+N" group. */
  aggregateCount?: number;
  /** True when this node is a synthetic group (combined like-type nodes) → aggregate visual. */
  aggregate?: boolean;
  /** Pinned by the user (excluded from auto-relayout intent; shows a pin marker). */
  pinned?: boolean;
  /** De-emphasized while another path is highlighted (highlight-path mode). */
  dimmed?: boolean;
  /** Hops from the current root, filled by `assignDepths`. Drives expand gating + recenter. */
  depth?: number;
  /** Layout position, filled by the layout pass. */
  x?: number;
  y?: number;
}

type NodeAttrs = { entity: Entity; state: NodeState };
type EdgeAttrs = { rel: Relationship };

export class NexusGraph {
  /** Underlying graphology instance — multi + directed to model the heterogeneous multigraph. */
  readonly g = new Graph<NodeAttrs, EdgeAttrs>({ multi: true, type: "directed", allowSelfLoops: false });

  addFragment(fragment: GraphFragment): void {
    for (const e of fragment.entities) this.upsertEntity(e);
    for (const r of fragment.relationships) this.upsertRelationship(r);
  }

  upsertEntity(entity: Entity): void {
    if (this.g.hasNode(entity.id)) {
      this.g.mergeNodeAttributes(entity.id, { entity });
    } else {
      this.g.addNode(entity.id, {
        entity,
        state: { selected: false, hidden: false, focused: false },
      });
    }
  }

  upsertRelationship(rel: Relationship): void {
    if (!this.g.hasNode(rel.source) || !this.g.hasNode(rel.target)) return;
    if (this.g.hasEdge(rel.id)) return;
    this.g.addEdgeWithKey(rel.id, rel.source, rel.target, { rel });
  }

  setState(id: string, patch: Partial<NodeState>): void {
    if (!this.g.hasNode(id)) return;
    const cur = this.g.getNodeAttribute(id, "state");
    this.g.setNodeAttribute(id, "state", { ...cur, ...patch });
  }

  /** Remove a node (and its incident edges) — used by collapse / ungroup. */
  removeNode(id: string): void {
    if (this.g.hasNode(id)) this.g.dropNode(id);
  }

  /** Descendant ids of `id` in the current tree — neighbors reachable only by going deeper.
   *  Drives collapse (remove a node's expanded subtree). Requires depths to be assigned. */
  descendants(id: string): string[] {
    if (!this.g.hasNode(id)) return [];
    const depthOf = (n: string) => this.g.getNodeAttribute(n, "state").depth ?? 0;
    const out: string[] = [];
    const seen = new Set<string>([id]);
    let frontier = [id];
    while (frontier.length > 0) {
      const next: string[] = [];
      for (const node of frontier) {
        const d = depthOf(node);
        for (const nb of this.g.neighbors(node)) {
          if (seen.has(nb)) continue;
          if (depthOf(nb) > d) {
            seen.add(nb);
            out.push(nb);
            next.push(nb);
          }
        }
      }
      frontier = next;
    }
    return out;
  }

  /** Ancestor ids from `id` up to the root — neighbors that are progressively shallower. */
  ancestors(id: string): string[] {
    if (!this.g.hasNode(id)) return [];
    const depthOf = (n: string) => this.g.getNodeAttribute(n, "state").depth ?? 0;
    const out: string[] = [];
    let cur = id;
    let guard = 0;
    while (depthOf(cur) > 0 && guard++ < 64) {
      const parent = this.g.neighbors(cur).find((nb) => depthOf(nb) === depthOf(cur) - 1);
      if (!parent) break;
      out.push(parent);
      cur = parent;
    }
    return out;
  }

  clearSelection(): void {
    this.g.forEachNode((id, attrs) => {
      if (attrs.state.selected) this.setState(id, { selected: false });
    });
  }

  selected(): Entity[] {
    const out: Entity[] = [];
    this.g.forEachNode((_id, attrs) => {
      if (attrs.state.selected) out.push(attrs.entity);
    });
    return out;
  }

  nodes(): { id: string; entity: Entity; state: NodeState }[] {
    return this.g.mapNodes((id, attrs) => ({ id, entity: attrs.entity, state: attrs.state }));
  }

  edges(): Relationship[] {
    return this.g.mapEdges((_id, attrs) => attrs.rel);
  }

  get order(): number {
    return this.g.order;
  }
}
