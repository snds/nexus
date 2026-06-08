/** Nexus/Text — typography variants composed from the L0 type primitives. */
import type { Meta, StoryObj } from "@storybook/react";
import { Text, type TextVariant } from "./Text.js";

const meta: Meta<typeof Text> = { title: "Components/Typography/Text", component: Text , tags: ["autodocs"] };
export default meta;
type Story = StoryObj<typeof Text>;

const VARIANTS: TextVariant[] = ["display", "h1", "h2", "h3", "title", "body", "body-sm", "label", "caption", "overline", "code"];

export const Body: Story = { args: { variant: "body", children: "The quick brown fox jumps over the lazy dog." } };
export const Heading: Story = { args: { variant: "h2", children: "Section heading" } };

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {VARIANTS.map((v) => (
        <div key={v} style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
          <code style={{ width: 90, flexShrink: 0, fontFamily: "var(--nx-font-mono)", fontSize: 11, color: "hsl(var(--nx-fg-subtle))" }}>{v}</code>
          <Text variant={v}>The quick brown fox</Text>
        </div>
      ))}
    </div>
  ),
};

export const Tones: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <Text tone="default">Default — primary text</Text>
      <Text tone="muted">Muted — secondary text</Text>
      <Text tone="subtle">Subtle — tertiary text</Text>
      <Text tone="accent">Accent — interactive</Text>
    </div>
  ),
};
