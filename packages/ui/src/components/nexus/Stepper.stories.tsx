/** Stepper — wizard progress. */
import type { Meta, StoryObj } from "../../story-types.js";
import { Stepper } from "./Stepper.js";

const meta: Meta<typeof Stepper> = { title: "Components/Navigation/Stepper", component: Stepper , tags: ["autodocs"] };
export default meta;
type Story = StoryObj<typeof Stepper>;

const steps = ["Start", "Configure", "Finish"];
export const Start: Story = { args: { steps, current: 0 } };
export const Configure: Story = { args: { steps, current: 1 } };
export const Finish: Story = { args: { steps, current: 2 } };
