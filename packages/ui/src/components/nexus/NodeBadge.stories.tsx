/**
 * NodeBadge variant matrix — the Figma "Node" component set.
 * Properties: Family · Role · Verdict · Selected · Focused · Hidden · VIP (+ count).
 */
import type { Meta, StoryObj } from "../../story-types.js";
import { NodeBadge } from "./NodeBadge.js";

const meta: Meta<typeof NodeBadge> = { title: "Components/Graph/NodeBadge", component: NodeBadge , tags: ["autodocs"] };
export default meta;
type Story = StoryObj<typeof NodeBadge>;

// ── Family (shape = family) ───────────────────────────────────────────────────
export const CircleThreat: Story = {
  args: { family: "circle", colorToken: "malware", glyph: "coronavirus", label: "Zloader", sublabel: "Malware", verdict: "malicious" },
};
export const SquareInfrastructure: Story = {
  args: { family: "square", colorToken: "domain", glyph: "language", label: "theguloen.com", sublabel: "Domain", verdict: "suspicious" },
};
export const DiamondDetection: Story = {
  args: { family: "diamond", colorToken: "exploit", glyph: "gpp_bad", label: "CVE-2021-40444", sublabel: "Exploit", verdict: "malicious" },
};
export const HexagonMessage: Story = {
  args: { family: "hexagon", colorToken: "email", glyph: "alternate_email", label: "rcastle@acme.com", sublabel: "Email Address", verdict: "medium" },
};

// ── Role ──────────────────────────────────────────────────────────────────────
export const Hub: Story = {
  args: { family: "circle", role: "hub", colorToken: "campaign", glyph: "campaign", label: "Zloader Botnet 18", sublabel: "Campaign", verdict: "malicious" },
};

// ── States ────────────────────────────────────────────────────────────────────
export const Selected: Story = {
  args: { family: "circle", colorToken: "malware", glyph: "coronavirus", label: "Zloader", sublabel: "Malware", verdict: "malicious", selected: true },
};
export const Focused: Story = {
  args: { family: "circle", colorToken: "malware", glyph: "coronavirus", label: "Zloader", sublabel: "Malware", verdict: "malicious", focused: true },
};
export const Hidden: Story = {
  args: { family: "circle", colorToken: "malware", glyph: "coronavirus", label: "Zloader", sublabel: "Malware", verdict: "malicious", hidden: true },
};
export const HexagonSelected: Story = {
  args: { family: "hexagon", colorToken: "email", glyph: "alternate_email", label: "rcastle@acme.com", sublabel: "Email Address", verdict: "medium", selected: true },
};

// ── Flags / count ─────────────────────────────────────────────────────────────
export const WithUnexpandedChildren: Story = {
  args: { family: "circle", colorToken: "actor", glyph: "badge", label: "TA511", sublabel: "Actor", verdict: "malicious", hiddenChildren: 2 },
};
export const Vip: Story = {
  args: { family: "hexagon", colorToken: "email", glyph: "alternate_email", label: "rcastle@acme.com", sublabel: "Email Address", verdict: "medium", vip: true },
};
export const NoVerdictPip: Story = {
  args: { family: "square", colorToken: "hash", glyph: "tag", label: "7d47c926…b5010", sublabel: "File Hash" },
};
export const Aggregate: Story = {
  args: { family: "square", colorToken: "ip", glyph: "lan", label: "12 IP Addresses", verdict: "suspicious", aggregate: true },
};
export const Impacted: Story = {
  args: { family: "hexagon", colorToken: "email", glyph: "alternate_email", label: "rcastle@acme.com", sublabel: "Email Address", verdict: "medium", vip: true, status: "impacted" },
};
export const AtRisk: Story = {
  args: { family: "hexagon", colorToken: "email", glyph: "alternate_email", label: "jsmith@acme.com", sublabel: "Email Address", verdict: "medium", status: "at_risk" },
};
export const Imposter: Story = {
  args: { family: "square", colorToken: "domain", glyph: "language", label: "bad.domain.com", sublabel: "Domain", verdict: "suspicious", imposter: true },
};
