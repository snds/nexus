/**
 * Splunk Login dialog (figurative) — gates the "Check for clicks by users (Splunk Query)"
 * transform. Replicates the connect flow: credentials → submit → query runs and results
 * join the graph. No real integration; this expresses the flow.
 */
import { useState } from "react";
import { Icon, Tooltip, Modal } from "@nexus/ui/nexus";

export function SplunkLoginDialog({ onSubmit, onClose }: { onSubmit: () => void; onClose: () => void }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [connecting, setConnecting] = useState(false);
  const valid = user.trim().length > 0 && pass.trim().length > 0;

  const submit = () => {
    if (!valid || connecting) return;
    setConnecting(true);
    // figurative handshake
    window.setTimeout(onSubmit, 800);
  };

  return (
    <Modal onClose={onClose} label="Splunk login" className="w-[460px]">
        <div className="flex items-start justify-between p-5 pb-2">
          <h2 className="flex items-center gap-2 text-base font-semibold text-[var(--nx-fg)]">
            <Icon name="cloud_sync" size={20} className="text-[var(--nx-accent)]" /> Splunk Login
          </h2>
          <Tooltip label="Close" side="left">
            <button onClick={onClose} aria-label="Close" className="grid h-7 w-7 place-items-center rounded text-[var(--nx-fg-subtle)] hover:bg-[var(--nx-surface-3)] hover:text-[var(--nx-fg)]">
              <Icon name="close" size={20} />
            </button>
          </Tooltip>
        </div>

        <div className="px-5 pb-4">
          <p className="mb-4 text-xs leading-relaxed text-[var(--nx-fg-muted)]">
            Enter your Splunk credentials to continue. Your login is passed to Splunk directly and is not stored on
            Nexus services.
          </p>

          <input
            autoFocus
            value={user}
            onChange={(e) => setUser(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Username"
            aria-label="Splunk username"
            disabled={connecting}
            className="mb-4 w-full border-b border-[var(--nx-border-strong)] bg-transparent pb-1.5 text-sm text-[var(--nx-fg)] placeholder:text-[var(--nx-fg-subtle)] focus:border-[var(--nx-ring)] focus:outline-none disabled:opacity-50"
          />
          <input
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Password"
            aria-label="Splunk password"
            disabled={connecting}
            className="w-full border-b border-[var(--nx-border-strong)] bg-transparent pb-1.5 text-sm text-[var(--nx-fg)] placeholder:text-[var(--nx-fg-subtle)] focus:border-[var(--nx-ring)] focus:outline-none disabled:opacity-50"
          />
          <p className="mt-2 flex items-center gap-1.5 text-[11px] text-[var(--nx-fg-subtle)]">
            <Icon name="lock" size={13} /> 256-bit encrypted
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-[var(--nx-border)] px-5 py-3">
          <button onClick={onClose} className="rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--nx-fg-muted)] hover:bg-[var(--nx-surface-3)]">
            Cancel
          </button>
          <button
            disabled={!valid || connecting}
            onClick={submit}
            className={
              "flex items-center gap-1.5 rounded-md px-4 py-1.5 text-xs font-semibold uppercase tracking-wide " +
              (valid && !connecting
                ? "bg-[var(--nx-accent)] text-[var(--nx-accent-fg)] hover:brightness-110"
                : "cursor-not-allowed bg-[var(--nx-surface-3)] text-[var(--nx-fg-subtle)]")
            }
          >
            {connecting && <Icon name="progress_activity" size={14} className="animate-spin" />}
            {connecting ? "Connecting…" : "Submit"}
          </button>
        </div>
    </Modal>
  );
}
