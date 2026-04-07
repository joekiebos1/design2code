import localFont from 'next/font/local'
import { draftMode } from 'next/headers'
import { VisualEditing } from 'next-sanity/visual-editing'
import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@design2code/ds'

export const metadata: Metadata = {
  title: {
    default: 'Page Architect',
    template: '%s | Page Architect',
  },
}

const jioTypeVar = localFont({
  src: [
    { path: './fonts/JioTypeVarW05-Regular.woff2', weight: '100 900', style: 'normal' },
    { path: './fonts/JioTypeVarW05-Italic.woff2', weight: '100 900', style: 'italic' },
  ],
  variable: '--font-jiotype',
  display: 'swap',
  preload: true,
})

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isEnabled: draft } = await draftMode()
  return (
    <html lang="en" className={jioTypeVar.variable}>
      <body className={jioTypeVar.className}>
        <Providers>
          {children}
          {draft && <VisualEditing />}
        </Providers>
      </body>
    </html>
  )
}
