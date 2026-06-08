/**
 * L3 PRIMITIVE — ToolButton. The square icon button used for canvas chrome: the top-right
 * graph actions (save / highlight / history / masquerade) AND the bottom-left zoom/fit/lock
 * controls share this one component, so every floating control reads identically.
 *
 * Shows a real <Tooltip> (not the browser title). Figma mapping: Button/Tool —
 * properties { Active }. Always has an accessible label.
 */
import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils.js";
import { Icon } from "./Icon.js";
import { Tooltip, type TooltipSide } from "./Tooltip.js";

export interface ToolButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  /** Material Symbol name. */
  icon: string;
  /** Accessible label — also rendered as the tooltip. Required. */
  label: string;
  /** Which side the tooltip appears on. Default "top". */
  tooltipSide?: TooltipSide;
  /** Active/pressed state → accent treatment + filled glyph. */
  active?: boolean;
  /** Force the glyph fill independent of `active`. */
  filled?: boolean;
}

export function ToolButton({ icon, label, tooltipSide = "top", active, filled, className, ...rest }: ToolButtonProps) {
  return (
    <Tooltip label={label} side={tooltipSide}>
      <button
        type="button"
        aria-label={label}
        aria-pressed={active}
        className={cn(
          "grid h-9 w-9 place-items-center rounded-md border shadow transition-colors",
          active
            ? "border-[hsl(var(--nx-accent)/0.6)] bg-[hsl(var(--nx-accent)/0.18)] text-[hsl(var(--nx-accent))]"
            : "border-[hsl(var(--nx-border))] bg-[hsl(var(--nx-surface-2))] text-[hsl(var(--nx-fg-muted))] hover:bg-[hsl(var(--nx-surface-3))] hover:text-[hsl(var(--nx-fg))]",
          className,
        )}
        {...rest}
      >
        <Icon name={icon} size={20} filled={Boolean(filled ?? active)} />
      </button>
    </Tooltip>
  );
}
