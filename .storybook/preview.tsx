import type { Preview } from '@storybook/nextjs-vite'
import React from 'react'
import { DsProvider } from '@marcelinodzn/ds-react'
import { createNavigation, useRouter } from '@storybook/nextjs-vite/navigation.mock'
import '../app/globals.css'

// Initialize mock router so useRouter() works in Storybook (no Next.js router context)
createNavigation({
  push: (href: string) => {
    if (href.startsWith('/')) window.history.pushState({}, '', href)
    else window.location.href = href
  },
  replace: () => {},
  prefetch: () => {},
  back: () => window.history.back(),
  forward: () => window.history.forward(),
  refresh: () => window.location.reload(),
})
useRouter.mockImplementation(() => ({
  push: (href: string) => {
    if (href.startsWith('/')) window.history.pushState({}, '', href)
    else window.location.href = href
  },
  replace: () => {},
  prefetch: () => {},
  back: () => window.history.back(),
  forward: () => window.history.forward(),
  refresh: () => window.location.reload(),
}))

const preview: Preview = {
  parameters: {
    nextjs: {
      appDirectory: true,
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'fullscreen',
    a11y: {
      test: 'off',
    },
  },
  decorators: [
    (Story) => (
      <DsProvider
        platform="Desktop (1440)"
        colorMode="Light"
        density="Default"
        theme="MyJio"
      >
        <Story />
      </DsProvider>
    ),
  ],
}

export default preview
