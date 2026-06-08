/**
 * L3 PRIMITIVE — Tooltip. A real (DOM) tooltip, not the browser `title` attribute: a
 * styled floating label that appears on hover/focus of its trigger. CSS-driven (group
 * hover/focus-within) so it needs no JS state, and it's keyboard-accessible.
 *
 * Figma mapping: Tooltip — property { Side }. Wrap any icon-only control.
 */
import type { ReactNode } from "react";
import { cn } from "../../lib/utils.js";

export type TooltipSide = "top" | "bottom" | "left" | "right";

const POS: Record<TooltipSide, string> = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-1.5",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-1.5",
  left: "right-full top-1/2 -translate-y-1/2 mr-1.5",
  right: "left-full top-1/2 -translate-y-1/2 ml-1.5",
};

export interface TooltipProps {
  /** The text shown in the floating label. */
  label: string;
  /** Which side of the trigger to place the label. Default "top". */
  side?: TooltipSide;
  /** The trigger (usually an icon button). */
  children: ReactNode;
  className?: string;
}

export function Tooltip({ label, side = "top", children, className }: TooltipProps) {
  return (
    <span className={cn("group/tt relative inline-flex", className)}>
      {children}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute z-[60] whitespace-nowrap rounded-md border border-[hsl(var(--nx-border))] bg-[hsl(var(--nx-surface-3))] px-2 py-1 text-[11px] font-medium text-[hsl(var(--nx-fg))] shadow-lg",
          "opacity-0 transition-opacity duration-100 group-hover/tt:opacity-100 group-focus-within/tt:opacity-100",
          POS[side],
        )}
      >
        {label}
      </span>
    </span>
  );
}
