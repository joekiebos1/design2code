import localFont from 'next/font/local'
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Figma2Code',
    template: '%s | Figma2Code',
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
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        />
      </head>
      <body className={`${jioTypeVar.className} antialiased`}>
        {children}
      </body>
    </html>
  )
}
