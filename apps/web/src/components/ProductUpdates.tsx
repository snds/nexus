/**
 * Product Updates modal — the notifications bell destination. Carousel of release notes
 * (Improvements / Bug Fixes / Known Issues), matching the "Notifications Open" screen.
 */
import { useEffect, useState } from "react";
import { Icon, Tooltip } from "@nexus/ui/nexus";

interface Release {
  date: string;
  improvements: string[];
  bugFixes: string[];
  knownIssues: string[];
}

const RELEASES: Release[] = [
  {
    date: "June 4, 2026",
    improvements: [
      "Search now covers all threats affecting a given email address.",
      "A filter box on the Dashboard lets you narrow saved graphs.",
      "Node grouping combines like-type indicators into a single aggregate node.",
      "Lots of tiny UI bugfixes and polish.",
    ],
    bugFixes: ["Splunk integration is fixed for a small set of customers.", "Usernames are no longer case-sensitive."],
    knownIssues: ["Search queries are not yet adjusted for local time zones; results may vary by window."],
  },
  {
    date: "May 12, 2026",
    improvements: ["Introduced the circular node language with the at-a-glance legend.", "Added per-type full detail pages."],
    bugFixes: ["Resolved a layout jump when expanding the furthest ring."],
    knownIssues: ["Aggregated counts may differ from live totals for very large campaigns."],
  },
];

function Section({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="mb-4">
      <h3 className="mb-1.5 text-xs font-semibold text-[hsl(var(--nx-fg))]">{title}</h3>
      <ul className="ml-4 list-disc space-y-1 text-xs leading-relaxed text-[hsl(var(--nx-fg-muted))]">
        {items.map((t, i) => (
          <li key={i}>{t}</li>
        ))}
      </ul>
    </div>
  );
}

export function ProductUpdates({ onClose }: { onClose: () => void }) {
  const [i, setI] = useState(0);
  const rel = RELEASES[i]!;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/55 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Product updates"
        className="relative flex max-h-[80vh] w-[520px] flex-col overflow-hidden rounded-lg border border-[hsl(var(--nx-border))] bg-[hsl(var(--nx-surface-1))] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-5 pb-2">
          <div>
            <h2 className="text-base font-semibold text-[hsl(var(--nx-fg))]">Product Updates</h2>
            <p className="text-[11px] text-[hsl(var(--nx-fg-subtle))]">{rel.date}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="text-[11px] font-medium text-[hsl(var(--nx-accent))] hover:underline">Show me later</button>
            <Tooltip label="Close" side="left">
              <button onClick={onClose} aria-label="Close" className="grid h-7 w-7 place-items-center rounded text-[hsl(var(--nx-fg-subtle))] hover:bg-[hsl(var(--nx-surface-3))] hover:text-[hsl(var(--nx-fg))]">
                <Icon name="close" size={20} />
              </button>
            </Tooltip>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4">
          <Section title="Improvements" items={rel.improvements} />
          <Section title="Bug Fixes" items={rel.bugFixes} />
          <Section title="Known Issues" items={rel.knownIssues} />
        </div>

        {RELEASES.length > 1 && (
          <div className="flex items-center justify-between border-t border-[hsl(var(--nx-border))] px-5 py-2">
            <Tooltip label="Previous update" side="top">
              <button onClick={() => setI((v) => Math.max(0, v - 1))} disabled={i === 0} aria-label="Previous update" className="grid h-7 w-7 place-items-center rounded text-[hsl(var(--nx-fg-subtle))] hover:text-[hsl(var(--nx-fg))] disabled:opacity-30">
                <Icon name="chevron_left" size={20} />
              </button>
            </Tooltip>
            <div className="flex gap-1.5">
              {RELEASES.map((_, idx) => (
                <span key={idx} className={"h-1.5 w-1.5 rounded-full " + (idx === i ? "bg-[hsl(var(--nx-accent))]" : "bg-[hsl(var(--nx-border-strong))]")} />
              ))}
            </div>
            <Tooltip label="Next update" side="top">
              <button onClick={() => setI((v) => Math.min(RELEASES.length - 1, v + 1))} disabled={i === RELEASES.length - 1} aria-label="Next update" className="grid h-7 w-7 place-items-center rounded text-[hsl(var(--nx-fg-subtle))] hover:text-[hsl(var(--nx-fg))] disabled:opacity-30">
                <Icon name="chevron_right" size={20} />
              </button>
            </Tooltip>
          </div>
        )}
      </div>
    </div>
  );
}
