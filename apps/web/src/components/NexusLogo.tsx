/**
 * Nexus Threat Explorer logo — a hub-and-satellite node graph motif, echoing the product:
 * a central focus node linked out to related entities. Accent-tinted; scales cleanly.
 */
export function NexusLogo({ size = 22, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <g stroke="hsl(var(--nx-accent))" strokeWidth="1.4" strokeLinecap="round" opacity="0.7">
        <line x1="12" y1="12" x2="5" y2="6" />
        <line x1="12" y1="12" x2="19" y2="7" />
        <line x1="12" y1="12" x2="6.5" y2="18.5" />
        <line x1="12" y1="12" x2="18" y2="18" />
      </g>
      <circle cx="5" cy="6" r="1.7" fill="hsl(var(--nx-accent) / 0.85)" />
      <circle cx="19" cy="7" r="1.7" fill="hsl(var(--nx-accent) / 0.85)" />
      <circle cx="6.5" cy="18.5" r="1.7" fill="hsl(var(--nx-accent) / 0.85)" />
      <circle cx="18" cy="18" r="1.7" fill="hsl(var(--nx-accent) / 0.85)" />
      <circle cx="12" cy="12" r="3.4" fill="hsl(var(--nx-accent))" />
    </svg>
  );
}
