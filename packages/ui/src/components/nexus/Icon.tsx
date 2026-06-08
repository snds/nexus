/**
 * L3 PRIMITIVE — Icon. A single Google Material Symbol (Outlined family).
 *
 * House rule: outlined is the default; the FILL axis flips to 1 ONLY for active/selected
 * states. Color is inherited (`currentColor`), so callers tint via text color — never
 * hardcode a hue here.
 *
 * The Material Symbols variable font is loaded once in index.html; this primitive just
 * drives its variation axes (opsz / wght / FILL / GRAD).
 */
import { cn } from "../../lib/utils.js";

export interface IconProps {
  /** Material Symbol name (snake_case), e.g. "search", "campaign", "alternate_email". */
  name: string;
  /** Pixel size — sets font-size and tracks the optical-size axis. Default 20. */
  size?: number;
  /** Active state → FILL axis = 1 (filled). Default outlined. */
  filled?: boolean;
  /** Weight axis 100–700. Default 400. */
  weight?: number;
  /** Grade axis (emphasis), -50…200. Default 0. */
  grade?: number;
  className?: string;
  /** Accessible label. When set, the icon is exposed to AT; otherwise it is decorative. */
  title?: string;
}

export function Icon({ name, size = 20, filled = false, weight = 400, grade = 0, className, title }: IconProps) {
  return (
    <span
      data-slot="icon"
      className={cn("material-symbols-outlined select-none leading-none", className)}
      style={{
        fontSize: size,
        // opsz is clamped to the font's 20–48 range; FILL carries the active state.
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' ${weight}, 'GRAD' ${grade}, 'opsz' ${Math.min(48, Math.max(20, size))}`,
      }}
      {...(title ? { role: "img", "aria-label": title } : { "aria-hidden": true })}
    >
      {name}
    </span>
  );
}
