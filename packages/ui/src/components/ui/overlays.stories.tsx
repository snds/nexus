/** Base/Overlays — the Radix-backed overlay primitives (Dialog, DropdownMenu, Popover,
 *  Tooltip), themed via the token bridge. Interactive — open them in the preview. */
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button.js";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogClose } from "./dialog.js";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "./dropdown-menu.js";
import { Popover, PopoverTrigger, PopoverContent } from "./popover.js";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "./tooltip.js";

const meta: Meta = { title: "Components/Overlays/Base Overlays" , tags: ["autodocs"] };
export default meta;
type Story = StoryObj;

export const DialogStory: Story = {
  name: "Dialog",
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open dialog</Button>
      </DialogTrigger>
      <DialogContent className="w-[420px] p-5">
        <DialogTitle>Delete saved graph?</DialogTitle>
        <DialogDescription className="mt-1">
          Radix Dialog — focus trap, Escape, scroll-lock and aria handled for you.
        </DialogDescription>
        <div className="mt-4 flex justify-end gap-2">
          <DialogClose asChild>
            <Button variant="ghost" size="sm">Cancel</Button>
          </DialogClose>
          <Button variant="destructive" size="sm">Delete</Button>
        </div>
      </DialogContent>
    </Dialog>
  ),
};

export const DropdownMenuStory: Story = {
  name: "DropdownMenu",
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Open menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem>Open</DropdownMenuItem>
        <DropdownMenuItem>Duplicate</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-[hsl(var(--severity-malicious))]">Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const PopoverStory: Story = {
  name: "Popover",
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open popover</Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4">
        <p className="text-sm font-medium text-[hsl(var(--nx-fg))]">Popover</p>
        <p className="mt-1 text-xs text-[hsl(var(--nx-fg-muted))]">Anchored, collision-aware floating surface (Radix Popover).</p>
      </PopoverContent>
    </Popover>
  ),
};

export const TooltipStory: Story = {
  name: "Tooltip",
  render: () => (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Hover me</Button>
        </TooltipTrigger>
        <TooltipContent side="top">A real DOM tooltip</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};
