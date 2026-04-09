'use client'

import Image from 'next/image'
import Link from 'next/link'

export function StudioHeader() {
  return (
    <header className="h-14 shrink-0 flex items-center justify-between px-5 border-b border-gray-200 bg-white">
      <Link href="/studio/storytelling-inspiration" className="flex items-center no-underline">
        <Image
          src="/logo.svg"
          alt="Jio Design"
          width={80}
          height={32}
          className="h-8 w-auto"
          priority
        />
      </Link>
    </header>
  )
}
