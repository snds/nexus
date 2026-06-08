/** CountChip — compact numeric chip ("+N"). */
import type { Meta, StoryObj } from "../../story-types.js";
import { CountChip } from "./CountChip.js";

const meta: Meta<typeof CountChip> = { title: "Components/Data Display/CountChip", component: CountChip , tags: ["autodocs"] };
export default meta;
type Story = StoryObj<typeof CountChip>;

export const One: Story = { args: { count: 1 } };
export const Many: Story = { args: { count: 23 } };
export const Bare: Story = { args: { count: 5, prefix: "" } };
