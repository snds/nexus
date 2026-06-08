/**
 * L3 PRIMITIVE — CountChip. A small numeric chip. On a node it reads as the number of
 * unexpanded children ("+N"); reused anywhere a compact count badge is needed. Renders
 * nothing when count ≤ 0.
 *
 * Figma mapping: `prefix` is a boolean/text property; the count is a text property.
 */
import { cn } from "../../lib/utils.js";

export interface CountChipProps {
  count: number;
  /** Leading glyph, e.g. "+" for "more". Default "+". Pass "" for a bare count. */
  prefix?: string;
  className?: string;
}

export function CountChip({ count, prefix = "+", className }: CountChipProps) {
  if (count <= 0) return null;
  return (
    <span
      data-slot="count-chip"
      className={cn(
        "rounded-full border border-[hsl(var(--nx-border-strong))] bg-[hsl(var(--nx-surface-2))] px-1.5 py-px text-[10px] font-semibold tabular-nums text-[hsl(var(--nx-fg))] shadow-sm",
        className,
      )}
    >
      {prefix}
      {count}
    </span>
  );
}
