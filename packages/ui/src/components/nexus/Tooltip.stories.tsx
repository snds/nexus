/** Tooltip — real (DOM) hover/focus tooltip wrapping any trigger. Figma property: Side. */
import type { Meta, StoryObj } from "../../story-types.js";
import { Tooltip } from "./Tooltip.js";

const meta: Meta<typeof Tooltip> = { title: "Nexus/Tooltip", component: Tooltip };
export default meta;
type Story = StoryObj<typeof Tooltip>;

const Trigger = (
  <button type="button" aria-label="Anchor" className="grid h-9 w-9 place-items-center rounded-md border border-[hsl(var(--nx-border))] bg-[hsl(var(--nx-surface-2))]">
    ★
  </button>
);

export const Top: Story = { args: { label: "On top", side: "top", children: Trigger } };
export const Right: Story = { args: { label: "On the right", side: "right", children: Trigger } };
export const Bottom: Story = { args: { label: "Below", side: "bottom", children: Trigger } };
