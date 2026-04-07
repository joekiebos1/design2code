import type { StorybookConfig } from '@storybook/nextjs-vite';

const config: StorybookConfig = {
  // Blocks only — no DS components, tokens, or shared UI. See .cursor/rules/blocks-lab-production.mdc
  "stories": [
    "../app/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs"
  ],
  "framework": "@storybook/nextjs-vite",
  "staticDirs": [
    "../public"
  ]
};
export default config;