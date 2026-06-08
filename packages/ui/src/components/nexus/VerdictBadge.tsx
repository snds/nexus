/**
 * L3 WRAPPER — VerdictBadge. Severity on its OWN channel (architecture §5).
 * Color comes from --severity-* tokens, never from entity color.
 */
import type { Verdict } from "@nexus/domain";
import { cn } from "../../lib/utils.js";

const LABEL: Record<Verdict, string> = {
  malicious: "Malicious",
  phishing: "Phishing",
  suspicious: "Suspicious",
  medium: "Medium",
  benign: "Benign",
  unknown: "Unknown",
};

export interface VerdictBadgeProps {
  verdict: Verdict;
  className?: string;
}

export function VerdictBadge({ verdict, className }: VerdictBadgeProps) {
  return (
    <span
      data-slot="verdict-badge"
      data-verdict={verdict}
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        "ring-1 ring-inset",
        className,
      )}
      style={{
        color: `var(--severity-${verdict})`,
        backgroundColor: `color-mix(in srgb, var(--severity-${verdict}) 12%, transparent)`,
        // ring color via box-shadow-compatible token
        boxShadow: `inset 0 0 0 1px color-mix(in srgb, var(--severity-${verdict}) 35%, transparent)`,
      }}
    >
      {LABEL[verdict]}
    </span>
  );
}
