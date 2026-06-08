/**
 * Reusable confirmation modal (delete graph, revoke access, etc.). Composes the DS `Modal`
 * (Radix Dialog → focus trap, Escape, scroll-lock, focus restore). `danger` styles the
 * confirm action destructively.
 */
import { Icon, Modal } from "@nexus/ui/nexus";

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
  return (
    <Modal onClose={onClose} label={title} className="w-[420px]">
      <div className="flex items-start gap-3 p-5">
        {danger && (
          <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[color-mix(in_srgb,var(--severity-malicious)_15%,transparent)]">
            <Icon name="warning" size={20} className="text-[var(--severity-malicious)]" />
          </span>
        )}
        <div>
          <h2 className="text-base font-semibold text-[var(--nx-fg)]">{title}</h2>
          <p className="mt-1 text-xs leading-relaxed text-[var(--nx-fg-muted)]">{message}</p>
        </div>
      </div>
      <div className="flex justify-end gap-2 border-t border-[var(--nx-border)] px-5 py-3">
        <button onClick={onClose} className="rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--nx-fg-muted)] hover:bg-[var(--nx-surface-3)]">
          {cancelLabel}
        </button>
        <button
          autoFocus
          onClick={onConfirm}
          className={
            "rounded-md px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--nx-accent-fg)] hover:brightness-110 " +
            (danger ? "bg-[var(--severity-malicious)]" : "bg-[var(--nx-accent)]")
          }
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
