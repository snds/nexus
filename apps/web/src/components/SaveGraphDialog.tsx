/**
 * "New Saved Graph" modal — replicates the Save-Graph flow: a 48-char-limited name,
 * a live counter, a "Set as private" toggle, and a Save action that's disabled until a
 * name is entered. Esc / backdrop / ✕ dismiss; Enter saves.
 */
import { useEffect, useState } from "react";
import { Icon, Tooltip } from "@nexus/ui/nexus";

const MAX = 48;

export function SaveGraphDialog({
  onSave,
  onClose,
}: {
  onSave: (name: string, isPrivate: boolean) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [isPrivate, setIsPrivate] = useState(true);
  const [phase, setPhase] = useState<"idle" | "saving" | "failed">("idle");
  const [reported, setReported] = useState(false);
  const valid = name.trim().length > 0 && name.length <= MAX;

  const submit = () => {
    if (!valid || phase === "saving") return;
    setPhase("saving");
    // Figurative save. Name "fail" forces the error path so it's demonstrable.
    window.setTimeout(() => {
      if (name.trim().toLowerCase() === "fail") setPhase("failed");
      else onSave(name.trim(), isPrivate);
    }, 700);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Enter") submit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/55 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="New saved graph"
        className="w-[440px] overflow-hidden rounded-lg border border-[hsl(var(--nx-border))] bg-[hsl(var(--nx-surface-1))] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-5 pb-2">
          <h2 className="text-base font-semibold text-[hsl(var(--nx-fg))]">New Saved Graph</h2>
          <Tooltip label="Close" side="left">
            <button onClick={onClose} aria-label="Close" className="grid h-7 w-7 place-items-center rounded text-[hsl(var(--nx-fg-subtle))] hover:bg-[hsl(var(--nx-surface-3))] hover:text-[hsl(var(--nx-fg))]">
              <Icon name="close" size={20} />
            </button>
          </Tooltip>
        </div>

        <div className="px-5 pb-4">
          <p className="mb-4 text-xs leading-relaxed text-[hsl(var(--nx-fg-muted))]">
            Give your graph a name to save it for future reference. Limit the name to {MAX} characters.
          </p>

          <input
            autoFocus
            value={name}
            maxLength={MAX}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter a graph name…"
            aria-label="Graph name"
            className="w-full border-b border-[hsl(var(--nx-border-strong))] bg-transparent pb-1.5 text-sm text-[hsl(var(--nx-fg))] placeholder:text-[hsl(var(--nx-fg-subtle))] focus:border-[hsl(var(--nx-ring))] focus:outline-none"
          />
          <div className="mt-1 text-right text-[10px] tabular-nums text-[hsl(var(--nx-fg-subtle))]">
            {name.length} / {MAX}
          </div>

          <button
            onClick={() => setIsPrivate((v) => !v)}
            className="mt-2 flex items-center gap-2 text-xs text-[hsl(var(--nx-fg-muted))]"
            aria-pressed={isPrivate}
          >
            <Icon
              name={isPrivate ? "check_box" : "check_box_outline_blank"}
              filled={isPrivate}
              size={20}
              className={isPrivate ? "text-[hsl(var(--nx-accent))]" : "text-[hsl(var(--nx-fg-subtle))]"}
            />
            Set as private
          </button>
        </div>

        {/* Failure lives inline in the footer (matches design's Save-failed flow): a terse
            status + a "Send bug report?" affordance on the left, Retry as primary on the right. */}
        <div className="flex items-center justify-between gap-3 border-t border-[hsl(var(--nx-border))] px-5 py-3">
          <div className="min-h-[1.25rem] text-xs">
            {phase === "failed" && (
              <span className="flex items-center gap-2">
                <span className="text-[hsl(var(--severity-malicious))]">Graph save failed.</span>
                {reported ? (
                  <span className="flex items-center gap-1 text-[hsl(var(--nx-fg-muted))]">
                    <Icon name="check" size={13} /> Bug report sent
                  </span>
                ) : (
                  <button onClick={() => setReported(true)} className="text-[hsl(var(--nx-accent))] underline underline-offset-2 hover:brightness-110">
                    Send bug report?
                  </button>
                )}
              </span>
            )}
          </div>
          <button
            disabled={!valid || phase === "saving"}
            onClick={submit}
            className={
              "flex items-center gap-1.5 rounded-md px-4 py-1.5 text-xs font-semibold uppercase tracking-wide " +
              (valid && phase !== "saving"
                ? "bg-[hsl(var(--nx-accent))] text-[hsl(var(--nx-accent-fg))] hover:brightness-110"
                : "cursor-not-allowed bg-[hsl(var(--nx-surface-3))] text-[hsl(var(--nx-fg-subtle))]")
            }
          >
            {phase === "saving" && <Icon name="progress_activity" size={14} className="animate-spin" />}
            {phase === "saving" ? "Saving…" : phase === "failed" ? "Retry" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
