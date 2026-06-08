/**
 * Reusable confirmation modal (delete graph, revoke access, save-failed, etc.). `danger`
 * styles the confirm action destructively.
 */
import { useEffect } from "react";
import { Icon } from "@nexus/ui/nexus";

export function ConfirmDialog({
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  onConfirm,
  onClose,
}: {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Enter") onConfirm();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/55 p-4" onClick={onClose}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        className="w-[420px] overflow-hidden rounded-lg border border-[hsl(var(--nx-border))] bg-[hsl(var(--nx-surface-1))] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 p-5">
          {danger && (
            <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[hsl(var(--severity-malicious)/0.15)]">
              <Icon name="warning" size={18} className="text-[hsl(var(--severity-malicious))]" />
            </span>
          )}
          <div>
            <h2 className="text-base font-semibold text-[hsl(var(--nx-fg))]">{title}</h2>
            <p className="mt-1 text-xs leading-relaxed text-[hsl(var(--nx-fg-muted))]">{message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-[hsl(var(--nx-border))] px-5 py-3">
          <button onClick={onClose} className="rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-[hsl(var(--nx-fg-muted))] hover:bg-[hsl(var(--nx-surface-3))]">
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={
              "rounded-md px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-white hover:brightness-110 " +
              (danger ? "bg-[hsl(var(--severity-malicious))]" : "bg-[hsl(var(--nx-accent))]")
            }
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
