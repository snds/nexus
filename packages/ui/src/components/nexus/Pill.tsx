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
          ? "border-[color-mix(in_srgb,var(--nx-accent)_50%,transparent)] bg-[color-mix(in_srgb,var(--nx-accent)_12%,transparent)] text-[var(--nx-accent)]"
          : "border-[var(--nx-border)] bg-[var(--nx-surface-2)] text-[var(--nx-fg-muted)]",
        className,
      )}
    >
      {children}
    </span>
  );
}
