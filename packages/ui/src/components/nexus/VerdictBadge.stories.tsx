/** VerdictBadge variants — one per severity. Figma property: Verdict. */
import type { Meta, StoryObj } from "../../story-types.js";
import { VerdictBadge } from "./VerdictBadge.js";

const meta: Meta<typeof VerdictBadge> = { title: "Nexus/VerdictBadge", component: VerdictBadge };
export default meta;
type Story = StoryObj<typeof VerdictBadge>;

export const Malicious: Story = { args: { verdict: "malicious" } };
export const Phishing: Story = { args: { verdict: "phishing" } };
export const Suspicious: Story = { args: { verdict: "suspicious" } };
export const Medium: Story = { args: { verdict: "medium" } };
export const Benign: Story = { args: { verdict: "benign" } };
export const Unknown: Story = { args: { verdict: "unknown" } };
