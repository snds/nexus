/**
 * Node SHAPE = entity FAMILY — the second visual-encoding channel. Shared by NodeBadge
 * (renders it), ShapeIcon (legend silhouette), and GraphLegend (family grouping), so the
 * canvas and the legend stay in lockstep.
 *
 * Figma mapping: `family` is a single-select variant property on the Node component set.
 */
import type { EntityType } from "@nexus/domain";

export type NodeShape = "circle" | "square" | "diamond" | "hexagon";

/** EntityType → family shape. Exhaustive (no default) so new types fail the typecheck. */
export function shapeOf(type: EntityType): NodeShape {
  switch (type) {
    case "actor":
    case "campaign":
    case "malware":
      return "circle"; // threat principals
    case "ip":
    case "domain":
    case "hostname":
    case "url":
    case "hash":
    case "filename":
      return "square"; // infrastructure & artifacts
    case "exploit":
    case "sid":
    case "scan":
      return "diamond"; // detections & techniques
    case "email_address":
    case "prs_message":
      return "hexagon"; // messages & identities
  }
}
