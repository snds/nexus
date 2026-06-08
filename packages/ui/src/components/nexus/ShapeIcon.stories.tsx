/** ShapeIcon — family silhouette used in the legend. Figma property: Shape. */
import type { Meta, StoryObj } from "../../story-types.js";
import { ShapeIcon } from "./ShapeIcon.js";

const meta: Meta<typeof ShapeIcon> = { title: "Components/Iconography/ShapeIcon", component: ShapeIcon , tags: ["autodocs"] };
export default meta;
type Story = StoryObj<typeof ShapeIcon>;

export const Circle: Story = { args: { shape: "circle", size: 18 } };
export const Square: Story = { args: { shape: "square", size: 18 } };
export const Diamond: Story = { args: { shape: "diamond", size: 18 } };
export const Hexagon: Story = { args: { shape: "hexagon", size: 18 } };
