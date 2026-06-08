/**
 * Date-range selector — the "Showing last 7 days" control. Dropdown of preset windows
 * (+ a custom option). Figurative; selection updates the label only.
 */
import { useEffect, useRef, useState } from "react";
import { Icon } from "@nexus/ui/nexus";

const RANGES = ["Last 24 hours", "Last 7 days", "Last 30 days", "Last 90 days", "Custom range…"];

export function DateSelector() {
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState("Last 7 days");
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    // Capture phase + pointerdown so the dismiss fires even when the click lands on the
    // graph canvas (React Flow stops pointer propagation in the bubble phase).
    const onDown = (e: PointerEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener("pointerdown", onDown, true);
    return () => document.removeEventListener("pointerdown", onDown, true);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex h-9 items-center gap-1.5 rounded-md border border-[hsl(var(--nx-border))] bg-[hsl(var(--nx-surface-2))] px-2.5 text-xs text-[hsl(var(--nx-fg-muted))] shadow hover:bg-[hsl(var(--nx-surface-3))]"
      >
        <Icon name="calendar_today" size={20} />
        Showing {range.toLowerCase()}
        <Icon name="arrow_drop_down" size={20} className="text-[hsl(var(--nx-fg-subtle))]" />
      </button>
      {open && (
        <ul role="listbox" className="absolute left-0 top-[calc(100%+4px)] z-50 w-44 overflow-hidden rounded-md border border-[hsl(var(--nx-border))] bg-[hsl(var(--nx-surface-2))] py-1 shadow-2xl">
          {RANGES.map((r) => (
            <li key={r}>
              <button
                role="option"
                aria-selected={r === range}
                onClick={() => { setRange(r); setOpen(false); }}
                className={
                  "flex w-full items-center justify-between px-3 py-1.5 text-left text-xs hover:bg-[hsl(var(--nx-surface-3))] " +
                  (r === range ? "text-[hsl(var(--nx-fg))]" : "text-[hsl(var(--nx-fg-muted))]")
                }
              >
                {r}
                {r === range && <Icon name="check" size={14} className="text-[hsl(var(--nx-accent))]" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
