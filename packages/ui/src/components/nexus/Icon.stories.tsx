/** Icon — Material Symbol primitive. Figma property: Filled (active state). */
import type { Meta, StoryObj } from "../../story-types.js";
import { Icon } from "./Icon.js";

const meta: Meta<typeof Icon> = { title: "Components/Iconography/Icon", component: Icon , tags: ["autodocs"] };
export default meta;
type Story = StoryObj<typeof Icon>;

export const Outlined: Story = { args: { name: "hub", size: 24 } };
export const Filled: Story = { args: { name: "hub", size: 24, filled: true } };
export const Labeled: Story = { args: { name: "search", size: 24, title: "Search" } };
