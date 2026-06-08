/** ToolButton — square icon control (canvas chrome). Figma property: Active. */
import type { Meta, StoryObj } from "../../story-types.js";
import { ToolButton } from "./ToolButton.js";

const meta: Meta<typeof ToolButton> = { title: "Components/Actions/ToolButton", component: ToolButton , tags: ["autodocs"] };
export default meta;
type Story = StoryObj<typeof ToolButton>;

export const Default: Story = { args: { icon: "save", label: "Save graph" } };
export const Active: Story = { args: { icon: "route", label: "Highlight attack path", active: true } };
export const TooltipLeft: Story = { args: { icon: "history", label: "Graph history", tooltipSide: "left" } };
