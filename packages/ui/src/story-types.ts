/**
 * Minimal CSF3-compatible story shims so `*.stories.tsx` files typecheck and document
 * variant matrices WITHOUT pulling in a full Storybook install. They are the source of
 * truth for the Figma component sets (each named export = one variant).
 *
 * Adopting Storybook later is a one-line swap: replace
 *   import type { Meta, StoryObj } from "../story-types.js";
 * with
 *   import type { Meta, StoryObj } from "@storybook/react";
 * The shapes match CSF3 (default `meta` + named `StoryObj` exports with `args`).
 */
import type { ComponentProps, ElementType } from "react";

export interface Meta<C extends ElementType> {
  /** Hierarchy path, e.g. "Nexus/NodeBadge". Maps to the Figma page/section. */
  title: string;
  component: C;
}

export interface StoryObj<C extends ElementType> {
  name?: string;
  /** Full props for this variant — also consumed by the a11y test harness. */
  args: ComponentProps<C>;
}
