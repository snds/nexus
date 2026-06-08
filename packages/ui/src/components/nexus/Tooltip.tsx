/**
 * L3 WRAPPER — Tooltip. Composes the L1 Radix tooltip base (focus + escape + portal +
 * delay + collision handling) and keeps the product API stable: {label, side, children}.
 * Wrap any control; pass a single interactive element as the child (Radix `asChild`).
 *
 * Figma mapping: Tooltip — property { Side }.
 */
import type { ReactNode } from "react";
import { Tooltip as Root, TooltipTrigger, TooltipContent, TooltipProvider } from "../ui/tooltip.js";

export type TooltipSide = "top" | "bottom" | "left" | "right";

export interface TooltipProps {
  /** The floating label text. */
  label: string;
  /** Which side of the trigger to place the label. Default "top". */
  side?: TooltipSide;
  /** The trigger — a single element (Radix clones it via asChild). */
  children: ReactNode;
  /** Extra classes on the content. */
  className?: string;
}

export function Tooltip({ label, side = "top", children, className }: TooltipProps) {
  return (
    <TooltipProvider delayDuration={200} disableHoverableContent>
      <Root>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={side} {...(className ? { className } : {})}>
          {label}
        </TooltipContent>
      </Root>
    </TooltipProvider>
  );
}
