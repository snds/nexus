/** GraphLegend — dynamic legend keyed off present types/verdicts. Figma property: Collapsed. */
import type { Meta, StoryObj } from "../../story-types.js";
import { GraphLegend } from "./GraphLegend.js";

const meta: Meta<typeof GraphLegend> = { title: "Components/Graph/GraphLegend", component: GraphLegend , tags: ["autodocs"] };
export default meta;
type Story = StoryObj<typeof GraphLegend>;

const present = {
  types: ["actor", "campaign", "malware", "domain", "ip", "exploit", "email_address"] as const,
  verdicts: ["malicious", "suspicious", "medium"] as const,
};

export const Expanded: Story = { args: { types: [...present.types], verdicts: [...present.verdicts] } };
export const Collapsed: Story = { args: { types: [...present.types], verdicts: [...present.verdicts], defaultCollapsed: true } };
