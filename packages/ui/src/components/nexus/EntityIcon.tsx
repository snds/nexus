/**
 * L3 WRAPPER — EntityIcon. Maps an EntityType to its Material Symbol glyph. Color = entity
 * type (the legacy taxonomy, via --entity-* tokens). Glyph disambiguates within a color
 * family. Backed by the Material Symbols <Icon> primitive (outlined; filled = active).
 */
import type { EntityType } from "@nexus/domain";
import { cn } from "../../lib/utils.js";
import { Icon } from "./Icon.js";

/** EntityType → Material Symbol name. Exported so NodeBadge adapters can resolve a glyph. */
export const ENTITY_SYMBOL: Record<EntityType, string> = {
  actor: "badge",
  campaign: "campaign",
  malware: "coronavirus",
  exploit: "gpp_bad",
  sid: "fingerprint",
  hash: "tag",
  url: "link",
  domain: "language",
  ip: "lan",
  hostname: "dns",
  filename: "description",
  email_address: "alternate_email",
  prs_message: "mail",
  scan: "document_scanner",
};

export interface EntityIconProps {
  type: EntityType;
  size?: number;
  className?: string;
  /** Override the glyph color (full CSS color). Defaults to the entity-type token. */
  color?: string;
  /** Active/selected → filled glyph (house rule: fill only for active states). */
  filled?: boolean;
}

export function EntityIcon({ type, size = 16, className, color, filled }: EntityIconProps) {
  return (
    <span
      className={cn("inline-flex", className)}
      style={{ color: color ?? `hsl(var(--entity-${entityColorToken(type)}))` }}
    >
      <Icon name={ENTITY_SYMBOL[type]} size={size} filled={filled ?? false} />
    </span>
  );
}

/** The ~14 types fold onto the legacy color set; for the scaffold, token suffix == type alias. */
function entityColorToken(type: EntityType): string {
  switch (type) {
    case "email_address":
      return "email";
    case "prs_message":
      return "message";
    default:
      return type;
  }
}
