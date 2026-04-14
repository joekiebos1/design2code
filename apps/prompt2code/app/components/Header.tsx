import Image from 'next/image'

export function Header() {
  return (
    <header className="h-14 shrink-0 flex items-center px-5 border-b border-gray-200 bg-white">
      <Image
        src="/logo.svg"
        alt="Jio Design"
        width={80}
        height={32}
        className="h-8 w-auto"
        priority
      />
    </header>
  )
}
