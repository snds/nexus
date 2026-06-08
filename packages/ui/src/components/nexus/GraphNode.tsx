/**
 * L3 ADAPTER — GraphNode. Binds a domain Entity to the presentational <NodeBadge>: derives
 * the family (shape), color token, glyph, and verdict from the entity, and forwards the
 * interaction state. The canvas renders THIS, proving the core constraint — the node tool
 * consumes the design system, it is not a walled garden (architecture §1).
 *
 * A `display:contents` wrapper carries the graph-layer data attributes (entity type, shape,
 * state) without adding a box, so selectors/automation keep working while NodeBadge stays
 * domain-agnostic and Figma-mappable.
 */
import type { Entity } from "@nexus/domain";
import { ENTITY_META } from "@nexus/domain";
import { NodeBadge } from "./NodeBadge.js";
import { ENTITY_SYMBOL } from "./EntityIcon.js";
import { shapeOf, type NodeShape } from "./nodeShape.js";

// Re-export so existing consumers (legend, adapter) keep their import path stable.
export { shapeOf, type NodeShape };

export interface GraphNodeProps {
  entity: Entity;
  /** The graph's root/focus node — rendered as the filled hub badge. */
  hub?: boolean;
  selected?: boolean;
  focused?: boolean;
  hidden?: boolean;
  /** Synthetic group node (combined like-type nodes) → aggregate stacked treatment. */
  aggregate?: boolean;
  /** Global VIP highlighting toggle — when false, the VIP marker is suppressed. */
  vipEnabled?: boolean;
  /** De-emphasized while another path is highlighted (highlight-path mode). */
  dimmed?: boolean;
  /** Unexpanded children remaining on this node → "+N" chip. */
  hiddenChildren?: number;
  className?: string;
}

export function GraphNode({ entity, hub, selected, focused, hidden, aggregate, vipEnabled, dimmed, hiddenChildren, className }: GraphNodeProps) {
  const meta = ENTITY_META[entity.type];
  const family = shapeOf(entity.type);
  // Highlight-path: off-path nodes recede to ~50% (still legible — analysts keep peripheral
  // context) rather than near-vanishing. The lit path pops because the rest is quieted.
  const badgeClass = [className, dimmed ? "opacity-50 transition-opacity" : null].filter(Boolean).join(" ") || undefined;
  return (
    <div
      className="contents"
      data-slot="graph-node"
      data-entity-type={entity.type}
      data-shape={family}
      data-hub={hub || undefined}
      data-selected={selected || undefined}
      data-aggregate={aggregate || undefined}
      data-hidden-children={hiddenChildren || undefined}
    >
      <NodeBadge
        family={family}
        role={hub ? "hub" : "neighbor"}
        colorToken={meta.colorToken}
        glyph={ENTITY_SYMBOL[entity.type]}
        label={entity.label}
        {...(aggregate ? {} : { sublabel: meta.label })}
        verdict={entity.verdict}
        {...(selected !== undefined ? { selected } : {})}
        {...(focused !== undefined ? { focused } : {})}
        {...(hidden !== undefined ? { hidden } : {})}
        {...(aggregate !== undefined ? { aggregate } : {})}
        {...(vipEnabled !== false && entity.vip ? { vip: true } : {})}
        {...(entity.status !== undefined ? { status: entity.status } : {})}
        {...(entity.imposter !== undefined ? { imposter: entity.imposter } : {})}
        {...(hiddenChildren !== undefined ? { hiddenChildren } : {})}
        {...(badgeClass !== undefined ? { className: badgeClass } : {})}
      />
    </div>
  );
}
