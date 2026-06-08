/**
 * L3 PRIMITIVE — StateBlock. The canonical empty / error / loading placeholder: a centered
 * Material Symbol, a title, an optional message, and an optional action. Used for graph
 * load failures, empty search/dashboard, detail-table errors, etc.
 *
 * Figma mapping: `kind` is a single-select variant property.
 */
import { cn } from "../../lib/utils.js";
import { Icon } from "./Icon.js";

export type StateKind = "loading" | "empty" | "error";

const KIND_ICON: Record<StateKind, string> = {
  loading: "progress_activity",
  empty: "inbox",
  error: "error",
};
const KIND_COLOR: Record<StateKind, string> = {
  loading: "hsl(var(--nx-fg-subtle))",
  empty: "hsl(var(--nx-fg-subtle))",
  error: "hsl(var(--severity-malicious))",
};

export interface StateBlockProps {
  kind: StateKind;
  title: string;
  message?: string;
  /** Override the default icon. */
  icon?: string;
  /** Optional primary action. */
  action?: { label: string; onClick: () => void };
  className?: string;
}

export function StateBlock({ kind, title, message, icon, action, className }: StateBlockProps) {
  const name = icon ?? KIND_ICON[kind];
  return (
    <div
      data-slot="state-block"
      data-kind={kind}
      role={kind === "error" ? "alert" : "status"}
      className={cn("grid place-items-center p-8 text-center", className)}
    >
      <div className="flex max-w-xs flex-col items-center gap-2">
        <span style={{ color: KIND_COLOR[kind] }}>
          <Icon name={name} size={40} className={cn(kind === "loading" && "animate-spin")} />
        </span>
        <p className="text-sm font-medium text-[hsl(var(--nx-fg))]">{title}</p>
        {message && <p className="text-xs leading-relaxed text-[hsl(var(--nx-fg-muted))]">{message}</p>}
        {action && (
          <button
            onClick={action.onClick}
            className="mt-2 rounded-md border border-[hsl(var(--nx-border))] bg-[hsl(var(--nx-surface-2))] px-3 py-1.5 text-xs font-medium text-[hsl(var(--nx-fg))] hover:bg-[hsl(var(--nx-surface-3))]"
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}
