/** VerdictPip — the on-badge severity dot. Figma property: Verdict. */
import type { Meta, StoryObj } from "../../story-types.js";
import { VerdictPip } from "./VerdictPip.js";

const meta: Meta<typeof VerdictPip> = { title: "Nexus/VerdictPip", component: VerdictPip };
export default meta;
type Story = StoryObj<typeof VerdictPip>;

export const Malicious: Story = { args: { verdict: "malicious" } };
export const Suspicious: Story = { args: { verdict: "suspicious" } };
export const Medium: Story = { args: { verdict: "medium" } };
export const Benign: Story = { args: { verdict: "benign" } };
export const Large: Story = { args: { verdict: "malicious", size: 18 } };
