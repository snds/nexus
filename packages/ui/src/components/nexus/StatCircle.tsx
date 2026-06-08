/**
 * L3 PRIMITIVE — StatCircle. A circular metric: a big number ringed in a severity tone,
 * with a caption. Used for user risk stats (DLP / logins / phishing) and similar KPIs.
 * A zero value reads as neutral regardless of tone.
 *
 * Figma mapping: `tone` is a single-select variant property; value + label are text props.
 */
import { cn } from "../../lib/utils.js";

export type StatTone = "benign" | "suspicious" | "malicious" | "neutral";

const TONE_VAR: Record<StatTone, string> = {
  benign: "--severity-benign",
  suspicious: "--severity-suspicious",
  malicious: "--severity-malicious",
  neutral: "--nx-fg-subtle",
};

export interface StatCircleProps {
  value: number;
  label: string;
  tone?: StatTone;
  /** Diameter in px. Default 48. */
  size?: number;
  className?: string;
}

export function StatCircle({ value, label, tone = "neutral", size = 48, className }: StatCircleProps) {
  // A count of zero is "all clear" → render neutral even on a severity tone.
  const color = value === 0 ? "var(--nx-fg-subtle)" : `var(${TONE_VAR[tone]})`;
  return (
    <div data-slot="stat-circle" className={cn("flex flex-col items-center gap-1 text-center", className)}>
      <span
        className="grid place-items-center rounded-full border-2 text-base font-bold tabular-nums"
        style={{ width: size, height: size, borderColor: color, color }}
      >
        {value}
      </span>
      <span className="text-[9px] uppercase leading-tight tracking-wide text-[var(--nx-fg-subtle)]">{label}</span>
    </div>
  );
}
