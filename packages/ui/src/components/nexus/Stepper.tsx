/**
 * L3 PRIMITIVE — Stepper. Horizontal numbered progress for wizards (e.g. Splunk setup:
 * Start → Configure → Finish). Completed steps fill accent, the current step is solid,
 * upcoming steps are muted; connectors fill as you advance.
 *
 * Figma mapping: per-step state (done | current | upcoming) maps to a variant property.
 */
import { cn } from "../../lib/utils.js";
import { Icon } from "./Icon.js";

export interface StepperProps {
  steps: string[];
  /** Zero-based index of the current step. */
  current: number;
  className?: string;
}

export function Stepper({ steps, current, className }: StepperProps) {
  return (
    <ol className={cn("flex items-center", className)} data-slot="stepper">
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={label} className={cn("flex items-center", i < steps.length - 1 && "flex-1")}>
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  "grid h-9 w-9 place-items-center rounded-full text-sm font-semibold",
                  done && "bg-[hsl(var(--nx-accent))] text-[hsl(var(--nx-accent-fg))]",
                  active && "bg-[hsl(var(--nx-surface-3))] text-[hsl(var(--nx-fg))] ring-2 ring-[hsl(var(--nx-accent))]",
                  !done && !active && "bg-[hsl(var(--nx-surface-2))] text-[hsl(var(--nx-fg-subtle))]",
                )}
                aria-current={active ? "step" : undefined}
              >
                {done ? <Icon name="check" size={18} filled /> : i + 1}
              </span>
              <span className={cn("text-[10px] uppercase tracking-wide", active ? "text-[hsl(var(--nx-fg))]" : "text-[hsl(var(--nx-fg-subtle))]")}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <span className={cn("mx-2 mb-5 h-0.5 flex-1", done ? "bg-[hsl(var(--nx-accent))]" : "bg-[hsl(var(--nx-border))]")} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
