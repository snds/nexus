/**
 * L3 — ShapeIcon. The family silhouette used in the legend header (shape = family channel,
 * see GraphNode). Outline-only; color comes from `currentColor`, so callers tint via text
 * color. Geometry mirrors the node badges so the legend and canvas read as one system.
 */
import type { ReactElement } from "react";
import type { NodeShape } from "./nodeShape.js";

// React 18 + tsc: type the map as ReactElement rather than JSX.Element (which is a global
// namespace here, not a `react` export). Keeps this portable across React 18/19 types.
const SHAPE_GEOMETRY: Record<NodeShape, ReactElement> = {
  circle: <circle cx={50} cy={50} r={42} />,
  square: <rect x={10} y={10} width={80} height={80} rx={16} />,
  diamond: <polygon points="50,6 94,50 50,94 6,50" />,
  hexagon: <polygon points="27,5 73,5 96,50 73,95 27,95 4,50" />,
};

export interface ShapeIconProps {
  shape: NodeShape;
  size?: number;
  className?: string;
}

export function ShapeIcon({ shape, size = 14, className }: ShapeIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth={10}
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {SHAPE_GEOMETRY[shape]}
    </svg>
  );
}
