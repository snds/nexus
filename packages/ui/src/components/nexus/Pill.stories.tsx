/** Pill — compact rounded tag. Figma property: Tone. */
import type { Meta, StoryObj } from "../../story-types.js";
import { Pill } from "./Pill.js";

const meta: Meta<typeof Pill> = { title: "Components/Data Display/Pill", component: Pill , tags: ["autodocs"] };
export default meta;
type Story = StoryObj<typeof Pill>;

export const Neutral: Story = { args: { children: "Office 365" } };
export const Accent: Story = { args: { children: "VIP", tone: "accent" } };
