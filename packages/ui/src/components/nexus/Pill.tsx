/**
 * L3 PRIMITIVE — Pill. A compact rounded tag (e.g. active cloud services, attribute tags).
 *
 * Figma mapping: `tone` is a single-select variant property.
 */
import type { ReactNode } from "react";
import { cn } from "../../lib/utils.js";

export type PillTone = "neutral" | "accent";

export interface PillProps {
  children: ReactNode;
  tone?: PillTone;
  className?: string;
}

export function Pill({ children, tone = "neutral", className }: PillProps) {
  return (
    <span
      data-slot="pill"
      data-tone={tone}
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px]",
        tone === "accent"
          ? "border-[hsl(var(--nx-accent)/0.5)] bg-[hsl(var(--nx-accent)/0.12)] text-[hsl(var(--nx-accent))]"
          : "border-[hsl(var(--nx-border))] bg-[hsl(var(--nx-surface-2))] text-[hsl(var(--nx-fg-muted))]",
        className,
      )}
    >
      {children}
    </span>
  );
}
