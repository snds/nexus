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

export interface Meta<C extends ElementType = ElementType> {
  /** Hierarchy path, e.g. "Components/Graph/NodeBadge". Maps to the Figma page/section. */
  title: string;
  component?: C;
  /** CSF tags, e.g. ['autodocs'] to generate a docs page + prop table from the component types. */
  tags?: string[];
  /** Per-arg control config for the Storybook playground. */
  argTypes?: Record<string, unknown>;
  /** Default args applied to every story in the file. */
  args?: Partial<ComponentProps<C>>;
  parameters?: Record<string, unknown>;
}

export interface StoryObj<C extends ElementType = ElementType> {
  name?: string;
  tags?: string[];
  parameters?: Record<string, unknown>;
  argTypes?: Record<string, unknown>;
  /** Full props for this variant — also consumed by the a11y test harness. */
  args?: ComponentProps<C>;
}
