/**
 * L3 PRIMITIVE — VerdictPip. The severity dot shown on a node badge. Severity lives on its
 * OWN channel (architecture §5), never reusing entity color.
 *
 * Figma mapping: `verdict` is a single-select variant property.
 */
import type { Verdict } from "@nexus/domain";
import { cn } from "../../lib/utils.js";

export interface VerdictPipProps {
  verdict: Verdict;
  /** Diameter in px. Default 12. */
  size?: number;
  /** Border color (defaults to the app background, so the pip reads on any badge). */
  ringColor?: string;
  className?: string;
}

export function VerdictPip({ verdict, size = 12, ringColor = "var(--nx-bg)", className }: VerdictPipProps) {
  return (
    <span
      data-slot="verdict-pip"
      data-verdict={verdict}
      title={verdict}
      className={cn("inline-block rounded-full border-2", className)}
      style={{ width: size, height: size, background: `var(--severity-${verdict})`, borderColor: ringColor }}
    />
  );
}
