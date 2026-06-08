/**
 * GraphThumbnail — a small, deterministic node-graph motif for saved-graph cards. A red
 * campaign hub with colored satellites, laid out from a seed so each card looks distinct.
 */
const ENTITY_TONES = ["malware", "domain", "ip", "actor", "url", "hostname"] as const;

export function GraphThumbnail({ seed = 0, className }: { seed?: number; className?: string }) {
  const n = 5 + (seed % 3); // 5–7 satellites
  const sats = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 + seed * 0.7;
    const r = 22 + ((seed + i) % 3) * 5;
    return {
      x: 50 + Math.cos(a) * r,
      y: 38 + Math.sin(a) * (r * 0.78),
      tone: ENTITY_TONES[(seed + i) % ENTITY_TONES.length]!,
    };
  });

  return (
    <svg viewBox="0 0 100 76" className={className} preserveAspectRatio="xMidYMid meet" aria-hidden>
      <g stroke="var(--nx-border-strong)" strokeWidth="0.6">
        {sats.map((s, i) => (
          <line key={i} x1={50} y1={38} x2={s.x} y2={s.y} />
        ))}
      </g>
      {sats.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={3.4} fill="var(--nx-surface-3)" stroke={`var(--entity-${s.tone})`} strokeWidth="1.2" />
      ))}
      <circle cx={50} cy={38} r={7} fill="var(--entity-campaign)" />
    </svg>
  );
}
