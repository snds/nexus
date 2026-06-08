/**
 * L3 PRIMITIVE — Text. The system's typography component: a `variant` selects a semantic text
 * style that is composed from the L0 type primitives (size / weight / leading / tracking) and
 * a semantic color `tone`. This is the bridge between raw type tokens and real text in product.
 *
 * Figma mapping: Text — properties { Variant, Tone }. Each variant = one text style.
 */
import type { CSSProperties, ElementType, ReactNode } from "react";
import { cn } from "../../lib/utils.js";

export type TextVariant =
  | "display" | "h1" | "h2" | "h3" | "title"
  | "body" | "body-sm" | "label" | "caption" | "overline" | "code";
export type TextTone = "default" | "muted" | "subtle" | "accent";

interface VariantSpec {
  size: string; weight: string; leading: string; tracking: string;
  el: ElementType; mono?: boolean; upper?: boolean; tone?: TextTone;
}

// variant → L0 type primitives + default element/tone.
const VARIANTS: Record<TextVariant, VariantSpec> = {
  display: { size: "5xl", weight: "bold", leading: "tight", tracking: "tight", el: "h1" },
  h1: { size: "4xl", weight: "bold", leading: "tight", tracking: "tight", el: "h1" },
  h2: { size: "2xl", weight: "semibold", leading: "snug", tracking: "tight", el: "h2" },
  h3: { size: "xl", weight: "semibold", leading: "snug", tracking: "normal", el: "h3" },
  title: { size: "lg", weight: "semibold", leading: "snug", tracking: "normal", el: "h4" },
  body: { size: "base", weight: "regular", leading: "normal", tracking: "normal", el: "p" },
  "body-sm": { size: "sm", weight: "regular", leading: "normal", tracking: "normal", el: "p", tone: "muted" },
  label: { size: "base", weight: "medium", leading: "snug", tracking: "normal", el: "span" },
  caption: { size: "xs", weight: "regular", leading: "normal", tracking: "normal", el: "span", tone: "muted" },
  overline: { size: "2xs", weight: "semibold", leading: "normal", tracking: "wider", el: "span", upper: true, tone: "subtle" },
  code: { size: "sm", weight: "regular", leading: "normal", tracking: "normal", el: "code", mono: true },
};

const TONE_VAR: Record<TextTone, string> = {
  default: "--nx-fg",
  muted: "--nx-fg-muted",
  subtle: "--nx-fg-subtle",
  accent: "--nx-accent",
};

export interface TextProps {
  variant?: TextVariant;
  tone?: TextTone;
  /** Override the rendered element (the variant has a sensible default). */
  as?: ElementType;
  className?: string;
  children: ReactNode;
}

export function Text({ variant = "body", tone, as, className, children }: TextProps) {
  const spec = VARIANTS[variant];
  const Comp = as ?? spec.el;
  const resolvedTone = tone ?? spec.tone ?? "default";
  const style: CSSProperties = {
    fontSize: `var(--nx-text-${spec.size})`,
    fontWeight: `var(--nx-weight-${spec.weight})` as unknown as number,
    lineHeight: `var(--nx-leading-${spec.leading})`,
    letterSpacing: `var(--nx-tracking-${spec.tracking})`,
    color: `var(${TONE_VAR[resolvedTone]})`,
    fontFamily: spec.mono ? "var(--nx-font-mono)" : undefined,
    textTransform: spec.upper ? "uppercase" : undefined,
    margin: 0,
  };
  return (
    <Comp data-slot="text" data-variant={variant} className={cn(className)} style={style}>
      {children}
    </Comp>
  );
}
