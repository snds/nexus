/**
 * Node SHAPE = entity FAMILY silhouette — the shape channel, derived from the SINGLE source in
 * @nexus/domain (familyOf/shapeOfType). Shared by NodeBadge (renders it), ShapeIcon (legend
 * silhouette), GraphLegend (family headers) and the minimap, so the canvas and legend always
 * match. To change a type's shape, edit its family in @nexus/domain — never here.
 */
import { shapeOfType, type EntityShape, type EntityType } from "@nexus/domain";

export type NodeShape = EntityShape;

/** EntityType → family shape (single source: @nexus/domain). */
export function shapeOf(type: EntityType): NodeShape {
  return shapeOfType(type);
}
