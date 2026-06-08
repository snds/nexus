import type { Preview } from "@storybook/react";
import "./preview.css";

const preview: Preview = {
  parameters: {
    layout: "padded",
    controls: { expanded: true, matchers: { color: /(background|color)$/i, date: /Date$/i } },
    backgrounds: { disable: true }, // the token bg is applied to the iframe body
  },
};

export default preview;
