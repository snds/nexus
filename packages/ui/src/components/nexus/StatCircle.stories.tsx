/** StatCircle — ringed KPI. Figma property: Tone. Zero reads neutral on any tone. */
import type { Meta, StoryObj } from "../../story-types.js";
import { StatCircle } from "./StatCircle.js";

const meta: Meta<typeof StatCircle> = { title: "Nexus/StatCircle", component: StatCircle };
export default meta;
type Story = StoryObj<typeof StatCircle>;

export const Clear: Story = { args: { value: 0, label: "DLP Violations", tone: "benign" } };
export const Suspicious: Story = { args: { value: 2, label: "Suspicious Logins", tone: "suspicious" } };
export const Malicious: Story = { args: { value: 5, label: "Phishing Attempts", tone: "malicious" } };
export const Neutral: Story = { args: { value: 12, label: "Messages", tone: "neutral" } };
