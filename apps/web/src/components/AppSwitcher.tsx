/**
 * App switcher — the grid menu that pivots between Proofpoint-suite apps (Nexus is the
 * current one). Figurative: tiles are presentational.
 */
import { useEffect, useRef, useState } from "react";
import { Icon, Tooltip } from "@nexus/ui/nexus";

const APPS = [
  { name: "Nexus Threat Explorer", icon: "hub", active: true },
  { name: "Targeted Attack Protection", icon: "security" },
  { name: "Email Protection", icon: "mail" },
  { name: "Threat Response", icon: "bolt" },
  { name: "Security Awareness", icon: "school" },
  { name: "Information Protection", icon: "lock" },
];

export function AppSwitcher() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <Tooltip label="Switch apps" side="bottom">
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Switch apps"
          aria-expanded={open}
          className="grid h-9 w-9 place-items-center rounded text-[hsl(var(--nx-fg-muted))] hover:bg-[hsl(var(--nx-surface-3))] hover:text-[hsl(var(--nx-fg))]"
        >
          <Icon name="apps" size={22} filled={open} />
        </button>
      </Tooltip>
      {open && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-50 w-[300px] rounded-lg border border-[hsl(var(--nx-border))] bg-[hsl(var(--nx-surface-1))] p-2 shadow-2xl">
          <p className="px-2 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--nx-fg-subtle))]">Converged Intelligence</p>
          <div className="grid grid-cols-3 gap-1">
            {APPS.map((a) => (
              <button
                key={a.name}
                onClick={() => setOpen(false)}
                className={
                  "flex flex-col items-center gap-1.5 rounded-md p-3 text-center hover:bg-[hsl(var(--nx-surface-3))] " +
                  (a.active ? "text-[hsl(var(--nx-accent))]" : "text-[hsl(var(--nx-fg-muted))]")
                }
              >
                <Icon name={a.icon} size={24} filled={Boolean(a.active)} />
                <span className="text-[10px] leading-tight">{a.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
