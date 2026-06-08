/** StateBlock — empty / error / loading placeholders. Figma property: Kind. */
import type { Meta, StoryObj } from "../../story-types.js";
import { StateBlock } from "./StateBlock.js";

const meta: Meta<typeof StateBlock> = { title: "Nexus/StateBlock", component: StateBlock };
export default meta;
type Story = StoryObj<typeof StateBlock>;

export const Loading: Story = { args: { kind: "loading", title: "Loading graph…" } };
export const Empty: Story = { args: { kind: "empty", title: "No saved graphs yet", message: "Run a search and save the graph to see it here." } };
export const Error: Story = { args: { kind: "error", title: "Couldn’t load the graph", message: "The threat data service is unavailable. Try again.", action: { label: "Retry", onClick: () => {} } } };
