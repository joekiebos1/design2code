import localFont from 'next/font/local'
import type { Metadata } from 'next'
import './globals.css'
import './ds-tokens.generated.css'

export const metadata: Metadata = {
  title: {
    default: 'Prompt2Code',
    template: '%s | Prompt2Code',
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={jioTypeVar.variable}>
      <body className={jioTypeVar.className}>
        {children}
      </body>
    </html>
  )
}
