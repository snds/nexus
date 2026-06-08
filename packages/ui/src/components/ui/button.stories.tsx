/** Base/Button — the shadcn/Radix button base (variants + sizes). */
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button.js";

const meta: Meta<typeof Button> = { title: "Base/Button", component: Button };
export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = { args: { children: "Button" } };
export const Destructive: Story = { args: { variant: "destructive", children: "Delete" } };
export const Outline: Story = { args: { variant: "outline", children: "Outline" } };
export const Secondary: Story = { args: { variant: "secondary", children: "Secondary" } };
export const Ghost: Story = { args: { variant: "ghost", children: "Ghost" } };
export const Link: Story = { args: { variant: "link", children: "Link" } };

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button>Default</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button size="sm">Small</Button>
        <Button size="default">Default</Button>
        <Button size="lg">Large</Button>
      </div>
    </div>
  ),
};
