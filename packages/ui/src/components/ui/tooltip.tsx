/**
 * L1 BASE — shadcn/Radix Tooltip. REGENERABLE. Restyle via the wrapper (components/nexus)
 * or the token bridge; don't hand-edit beyond the token-themed defaults below.
 * Generated equivalent of: npx shadcn@latest add tooltip
 */
import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "../../lib/utils.js";

const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 6, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      data-slot="tooltip-content"
      className={cn(
        "z-[60] overflow-hidden rounded-md border border-[var(--nx-border)] bg-[var(--nx-surface-3)] px-2 py-1 text-[11px] font-medium text-[var(--nx-fg)] shadow-lg",
        className,
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
