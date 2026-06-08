/**
 * L3 WRAPPER — Modal. Composes the L1 Radix Dialog base so every product modal gets a real
 * focus trap, Escape, scroll-lock, focus restore, and aria-modal for free. Apps render their
 * own header/body/footer as children; `label` is the accessible name (Radix requires a title).
 *
 * Mounted-when-open is the app pattern (parent renders conditionally), so `open` defaults true
 * and `onClose` fires on Escape / overlay / programmatic close.
 */
import type { ReactNode } from "react";
import { cn } from "../../lib/utils.js";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog.js";

export interface ModalProps {
  onClose: () => void;
  /** Accessible name for the dialog (rendered visually-hidden; show your own header too). */
  label: string;
  open?: boolean;
  /** Width/層 overrides for the content container. */
  className?: string;
  children: ReactNode;
}

export function Modal({ onClose, label, open = true, className, children }: ModalProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className={cn("w-[440px]", className)}>
        <DialogTitle className="sr-only">{label}</DialogTitle>
        {children}
      </DialogContent>
    </Dialog>
  );
}
