// Node — presentational primitive + data-bound adapter + shared shape model.
export { NodeBadge, type NodeBadgeProps } from "./NodeBadge.js";
export { GraphNode, type GraphNodeProps } from "./GraphNode.js";
export { shapeOf, type NodeShape } from "./nodeShape.js";

// Node sub-primitives.
export { VerdictPip, type VerdictPipProps } from "./VerdictPip.js";
export { CountChip, type CountChipProps } from "./CountChip.js";

// Iconography.
export { Icon, type IconProps } from "./Icon.js";
export { ToolButton, type ToolButtonProps } from "./ToolButton.js";
export { Tooltip, type TooltipProps, type TooltipSide } from "./Tooltip.js";
export { Modal, type ModalProps } from "./Modal.js";

// Radix menu/popover primitives — composed directly by app menus (single import surface).
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu.js";
export { Popover, PopoverTrigger, PopoverAnchor, PopoverContent } from "../ui/popover.js";
export { Button, buttonVariants, type ButtonProps } from "../ui/button.js";
export { EntityIcon, ENTITY_SYMBOL, type EntityIconProps } from "./EntityIcon.js";
export { ShapeIcon, type ShapeIconProps } from "./ShapeIcon.js";

// Badges / chips / stats.
export { VerdictBadge, type VerdictBadgeProps } from "./VerdictBadge.js";
export { StatCircle, type StatCircleProps, type StatTone } from "./StatCircle.js";
export { Pill, type PillProps, type PillTone } from "./Pill.js";

// State + flow primitives.
export { StateBlock, type StateBlockProps, type StateKind } from "./StateBlock.js";
export { Stepper, type StepperProps } from "./Stepper.js";

// Composites.
export { GraphLegend, type GraphLegendProps } from "./GraphLegend.js";
