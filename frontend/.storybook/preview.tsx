import type { Preview } from "@storybook/react";
import "../src/app/globals.css"
import * as DocBlock from "@storybook/blocks"
import React from "react";
import { initialize, mswLoader } from 'msw-storybook-addon'

// Initialize MSW
initialize()
const preview: Preview = {
  parameters: {
    docs: {
      page: () => (
        <>
          <DocBlock.Title />
          <DocBlock.Description />
          <DocBlock.Primary />
          <DocBlock.Controls />
          <DocBlock.Stories />
        </>
      ),
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    loaders: [mswLoader]
  },
};

export default preview;
