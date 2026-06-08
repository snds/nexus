/**
 * L4 — the RENDERER ADAPTER. Maps the renderer-independent NexusGraph onto React Flow,
 * and renders the SHARED L3 <GraphNode> (→ <NodeBadge>) inside every node. This file is the
 * entire surface that knows about React Flow — swapping renderers means rewriting only this.
 */
import { Handle, Position, MarkerType, type Node, type Edge, type NodeProps } from "@xyflow/react";
import type { Entity } from "@nexus/domain";
import { GraphNode } from "@nexus/ui/nexus";
import type { NexusGraph } from "./model.js";

// Badge sizes mirror GraphNode's HUB_SIZE / NODE_SIZE — used to anchor edge handles to the
// badge CENTER (not the node container's middle, which sits between badge and label).
const HUB_BADGE = 64;
const NODE_BADGE = 46;

export interface EntityNodeData extends Record<string, unknown> {
  entity: Entity;
  selected: boolean;
  focused: boolean;
  hidden: boolean;
  /** The current root, rendered as the filled hub badge. */
  hub: boolean;
  /** Synthetic group node → aggregate stacked treatment. */
  aggregate: boolean;
  /** Global VIP highlighting toggle. */
  vipEnabled: boolean;
  /** De-emphasized while another path is highlighted. */
  dimmed: boolean;
  /** Children still unexpanded on this node → "+N" chip. */
  hiddenChildren: number;
}

export type EntityFlowNode = Node<EntityNodeData, "entity">;

/** Custom React Flow node — composes the design-system circular GraphNode (the core
 *  constraint: the canvas consumes the shared DS, it is not a walled garden). Handles are
 *  pinned to the badge center so connectors anchor to the node SHAPE, and stay anchored as
 *  the node is dragged. */
export function EntityNode({ data }: NodeProps<EntityFlowNode>) {
  // Badge center from the container top = badge radius (badge is the first, top child).
  const badgeCenterY = (data.hub ? HUB_BADGE : NODE_BADGE) / 2;
  const handle = {
    opacity: 0,
    left: "50%",
    top: badgeCenterY,
    transform: "translate(-50%, -50%)",
  } as const;
  return (
    <>
      <Handle type="target" position={Position.Left} style={handle} />
      <GraphNode
        entity={data.entity}
        hub={data.hub}
        selected={data.selected}
        focused={data.focused}
        hidden={data.hidden}
        aggregate={data.aggregate}
        vipEnabled={data.vipEnabled}
        dimmed={data.dimmed}
        hiddenChildren={data.hiddenChildren}
      />
      <Handle type="source" position={Position.Right} style={handle} />
    </>
  );
}

export const nodeTypes = { entity: EntityNode };

export function toFlow(
  model: NexusGraph,
  rootId?: string,
  vipEnabled = true,
): { nodes: EntityFlowNode[]; edges: Edge[] } {
  const all = model.nodes();
  // Hub = the current root (App-owned, moves on furthest-expand). Falls back to densest
  // degree when no root is supplied. Filled badge treatment.
  const hubId =
    rootId && model.g.hasNode(rootId)
      ? rootId
      : all.length === 0
        ? undefined
        : all.reduce((best, n) => (model.g.degree(n.id) > model.g.degree(best.id) ? n : best), all[0]!).id;

  const nodes: EntityFlowNode[] = all.map((n) => {
    // Tree edges are parent → child, so out-degree = children already on the canvas.
    // hidden = total backend children − those present (clamped ≥ 0).
    const present = model.g.outDegree(n.id);
    const hiddenChildren = Math.max(0, (n.entity.childCount ?? 0) - present);
    return {
      id: n.id,
      type: "entity" as const,
      position: { x: n.state.x ?? 0, y: n.state.y ?? 0 },
      data: {
        entity: n.entity,
        selected: n.state.selected,
        focused: n.state.focused,
        hidden: n.state.hidden,
        hub: n.id === hubId,
        aggregate: n.state.aggregate ?? false,
        vipEnabled,
        dimmed: n.state.dimmed ?? false,
        hiddenChildren,
      },
    };
  });

  // Highlight-path: when any node is dimmed, highlight mode is on. An edge whose BOTH
  // endpoints are lit (not dimmed) is on the highlighted path → accent stroke + width +
  // flow; an edge touching a dimmed node recedes. This draws the eye along the route,
  // matching the design's "Highlight Explorations" model (path pops, context recedes).
  const dimMap = new Map(all.map((n) => [n.id, n.state.dimmed ?? false]));
  const highlightActive = all.some((n) => n.state.dimmed);

  const edges: Edge[] = model.edges().map((r) => {
    const onPath = highlightActive && !dimMap.get(r.source) && !dimMap.get(r.target);
    const receded = highlightActive && !onPath;
    const stroke = onPath ? "hsl(var(--nx-accent))" : "hsl(var(--nx-border-strong))";
    return {
      id: r.id,
      source: r.source,
      target: r.target,
      label: r.kind,
      // Straight connectors (design intent) anchored to node centers.
      type: "straight" as const,
      // Directional relationships (A resolves→ B). Animate only the highlighted path.
      animated: onPath,
      ...(receded ? { style: { opacity: 0.35 } } : {}),
      ...(onPath ? { style: { stroke, strokeWidth: 2.5 } } : {}),
      // Breathing room around the relationship descriptor so it doesn't crowd the line.
      labelShowBg: true,
      labelBgPadding: [8, 4] as [number, number],
      labelBgBorderRadius: 6,
      // Stroke is themed in CSS (.react-flow__edge-path); the marker needs an explicit
      // color, so it reads the same token via a CSS var string.
      markerEnd: { type: MarkerType.ArrowClosed, color: stroke, width: 18, height: 18 },
    };
  });

  return { nodes, edges };
}
