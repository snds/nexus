/** EntityIcon — type→glyph, colored by entity token. Figma property: Type, Filled. */
import type { Meta, StoryObj } from "../../story-types.js";
import { EntityIcon } from "./EntityIcon.js";

const meta: Meta<typeof EntityIcon> = { title: "Components/Iconography/EntityIcon", component: EntityIcon , tags: ["autodocs"] };
export default meta;
type Story = StoryObj<typeof EntityIcon>;

export const Actor: Story = { args: { type: "actor", size: 22 } };
export const Campaign: Story = { args: { type: "campaign", size: 22 } };
export const Domain: Story = { args: { type: "domain", size: 22 } };
export const EmailAddress: Story = { args: { type: "email_address", size: 22 } };
export const Filled: Story = { args: { type: "campaign", size: 22, filled: true } };
