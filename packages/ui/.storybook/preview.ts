import type { Preview } from "@storybook/react";
import "./preview.css";

const preview: Preview = {
  parameters: {
    layout: "padded",
    controls: { expanded: true, matchers: { color: /(background|color)$/i, date: /Date$/i } },
    backgrounds: { disable: true }, // the token bg is applied to the iframe body
    // Canonical sidebar order: Foundations first, then Components by category.
    options: {
      storySort: {
        method: "alphabetical",
        order: [
          "Foundations",
          ["Tokens"],
          "Components",
          [
            "Actions",
            "Inputs",
            "Navigation",
            "Feedback",
            "Data Display",
            "Iconography",
            "Overlays",
            "Typography",
            "Graph",
          ],
          "Patterns",
        ],
      },
    },
  },
  tags: ["autodocs"],
};

export default preview;
