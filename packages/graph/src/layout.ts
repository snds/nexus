/**
 * L4 — layout pass. Pluggable: the scaffold ships a deterministic radial-TREE layout
 * (synchronous, dependency-free) so the canvas renders immediately and expansion reads
 * as concentric rings around the root. Swap for elkjs / d3-force behind this signature.
 */
import type { NexusGraph } from "./model.js";

export interface LayoutOptions {
  centerId?: string;
  /** Per-depth ring spacing (px). */
  radius?: number;
}

/**
 * BFS hop-distance from `rootId`, written to each node's `state.depth` (edges treated as
 * undirected). Drives the "expand up to 3 levels" gate and the recenter-on-furthest rule.
 * Disconnected nodes are left at Infinity.
 */
export function assignDepths(model: NexusGraph, rootId: string): void {
  if (!model.g.hasNode(rootId)) return;
  for (const { id } of model.nodes()) model.setState(id, { depth: Number.POSITIVE_INFINITY });
  model.setState(rootId, { depth: 0 });

  const seen = new Set<string>([rootId]);
  let frontier = [rootId];
  let d = 0;
  while (frontier.length > 0) {
    const next: string[] = [];
    for (const node of frontier) {
      for (const nb of model.g.neighbors(node)) {
        if (!seen.has(nb)) {
          seen.add(nb);
          model.setState(nb, { depth: d + 1 });
          next.push(nb);
        }
      }
    }
    frontier = next;
    d += 1;
  }
}

/**
 * Radial tree: root at origin, each node on the ring for its hop-depth, children fanned
 * into their parent's angular slice (classic Reingold-style radial). Falls back to a
 * single ring when the graph is a star. `centerId` defaults to the densest-degree node.
 */
export function radialLayout(model: NexusGraph, opts: LayoutOptions = {}): void {
  const nodes = model.nodes();
  if (nodes.length === 0) return;

  const center =
    opts.centerId && model.g.hasNode(opts.centerId)
      ? opts.centerId
      : nodes.reduce((best, n) => (model.g.degree(n.id) > model.g.degree(best.id) ? n : best), nodes[0]!).id;

  const ringGap = opts.radius ?? 190;

  // Build a BFS spanning tree from the center over undirected adjacency.
  const children = new Map<string, string[]>([[center, []]]);
  const seen = new Set<string>([center]);
  let frontier = [center];
  while (frontier.length > 0) {
    const next: string[] = [];
    for (const node of frontier) {
      for (const nb of model.g.neighbors(node)) {
        if (!seen.has(nb)) {
          seen.add(nb);
          children.set(nb, []);
          children.get(node)!.push(nb);
          next.push(nb);
        }
      }
    }
    frontier = next;
  }

  // Leaf counts size each subtree's angular slice.
  const leaves = new Map<string, number>();
  const countLeaves = (id: string): number => {
    const ch = children.get(id) ?? [];
    if (ch.length === 0) {
      leaves.set(id, 1);
      return 1;
    }
    const sum = ch.reduce((s, c) => s + countLeaves(c), 0);
    leaves.set(id, sum);
    return sum;
  };
  const total = countLeaves(center);
  const slice = (2 * Math.PI) / Math.max(total, 1);

  let cursor = 0;
  let maxDepth = 0;
  const place = (id: string, depth: number): void => {
    maxDepth = Math.max(maxDepth, depth);
    const ch = children.get(id) ?? [];
    let angle: number;
    if (ch.length === 0) {
      angle = (cursor + 0.5) * slice;
      cursor += 1;
    } else {
      const start = cursor;
      for (const c of ch) place(c, depth + 1);
      angle = ((start + cursor) / 2) * slice;
    }
    const r = depth * ringGap;
    // r === 0 is the root; pin it to exact origin (avoids -0 from cos/sin).
    if (r === 0) model.setState(id, { x: 0, y: 0 });
    else model.setState(id, { x: Math.cos(angle) * r, y: Math.sin(angle) * r });
  };
  place(center, 0);

  // Disconnected nodes (not reachable from center) ring the outside so nothing stacks at origin.
  const orphans = nodes.filter((n) => !seen.has(n.id));
  const orphanR = (maxDepth + 1) * ringGap;
  orphans.forEach((n, i) => {
    const a = (i / Math.max(orphans.length, 1)) * 2 * Math.PI;
    model.setState(n.id, { x: Math.cos(a) * orphanR, y: Math.sin(a) * orphanR });
  });
}
