/**
 * Accessibility regression harness. Renders EVERY story variant and asserts no axe
 * violations — so a11y is verified per-variant, automatically, in CI. (jsdom can't compute
 * layout, so visual rules like color-contrast return "incomplete" and don't fail here; the
 * structural/ARIA rules — labels, roles, names, aria-* — do.)
 */
import type { ComponentType } from "react";
import { describe, it, expect } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { axe } from "jest-axe";

import * as nodeBadge from "./components/nexus/NodeBadge.stories.js";
import * as verdictBadge from "./components/nexus/VerdictBadge.stories.js";
import * as verdictPip from "./components/nexus/VerdictPip.stories.js";
import * as countChip from "./components/nexus/CountChip.stories.js";
import * as icon from "./components/nexus/Icon.stories.js";
import * as entityIcon from "./components/nexus/EntityIcon.stories.js";
import * as shapeIcon from "./components/nexus/ShapeIcon.stories.js";
import * as statCircle from "./components/nexus/StatCircle.stories.js";
import * as pill from "./components/nexus/Pill.stories.js";
import * as graphLegend from "./components/nexus/GraphLegend.stories.js";
import * as stateBlock from "./components/nexus/StateBlock.stories.js";
import * as stepper from "./components/nexus/Stepper.stories.js";
import * as toolButton from "./components/nexus/ToolButton.stories.js";
import * as tooltip from "./components/nexus/Tooltip.stories.js";

type StoryModule = {
  default: { title: string; component: ComponentType<Record<string, unknown>> };
  [name: string]: unknown;
};

const MODULES: StoryModule[] = [
  nodeBadge,
  verdictBadge,
  verdictPip,
  countChip,
  icon,
  entityIcon,
  shapeIcon,
  statCircle,
  pill,
  graphLegend,
  stateBlock,
  stepper,
  toolButton,
  tooltip,
] as unknown as StoryModule[];

// Page/landmark rules don't apply to isolated component snippets.
const AXE_OPTIONS = {
  rules: {
    region: { enabled: false },
    "landmark-one-main": { enabled: false },
    "page-has-heading-one": { enabled: false },
  },
} as const;

for (const mod of MODULES) {
  const { title, component: Component } = mod.default;
  describe(title, () => {
    for (const [name, value] of Object.entries(mod)) {
      if (name === "default") continue;
      const story = value as { args?: Record<string, unknown> } | undefined;
      if (!story?.args) continue;
      it(`${name} has no a11y violations`, async () => {
        const { container } = render(<Component {...story.args} />);
        expect(await axe(container, AXE_OPTIONS)).toHaveNoViolations();
        cleanup();
      });
    }
  });
}
