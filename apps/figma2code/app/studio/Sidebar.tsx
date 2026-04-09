'use client'

import { useState, useEffect, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const STORAGE_KEY = 'studio-sidebar-collapsed'

const stroke = { strokeWidth: 1.35 as const, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

/** Trophy (lucide-style outline) — Benchmarks */
function IconTrophy() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M6 9H4.5a2.5 2.5 0 010-5H6" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 9h1.5a2.5 2.5 0 000-5H18" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 22h16" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 2H6v7a6 6 0 0012 0V2z" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconJioDesigns() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M3.5 14.5c1.8-1.8 7-7 8.8-8.8a2 2 0 012.8 0l.15.15a2 2 0 010 2.83C14 9.5 7.5 16 5.5 17.5l-3.5 1 1.5-3.5"
        stroke="currentColor"
        {...stroke}
      />
    </svg>
  )
}

function IconJioBlocks() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect x="2.75" y="2.75" width="5" height="5" rx="1" stroke="currentColor" {...stroke} />
      <rect x="10.25" y="2.75" width="5" height="5" rx="1" stroke="currentColor" {...stroke} />
      <rect x="2.75" y="10.25" width="5" height="5" rx="1" stroke="currentColor" {...stroke} />
      <rect x="10.25" y="10.25" width="5" height="5" rx="1" stroke="currentColor" {...stroke} />
    </svg>
  )
}

function IconExperiments() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M6 3.5h6l-1 7a3 3 0 11-4 0l-1-7z" stroke="currentColor" {...stroke} />
      <path d="M7 14.5h4M8 16.5h2" stroke="currentColor" {...stroke} />
    </svg>
  )
}

function IconStoryteller() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M4.5 4.5h9M4.5 7.5h7M4.5 10.5h9M4.5 13.5h5" stroke="currentColor" {...stroke} />
    </svg>
  )
}

function IconPageBuilder() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect x="3" y="3.5" width="12" height="11" rx="1.5" stroke="currentColor" {...stroke} />
      <path d="M3 7.5h12M9 7.5V14.5" stroke="currentColor" {...stroke} />
    </svg>
  )
}

function IconPrototypes() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M4.5 6.5l4.5-3 4.5 3v6l-4.5 3-4.5-3v-6z" stroke="currentColor" {...stroke} />
      <path d="M9 6.5v6" stroke="currentColor" {...stroke} />
    </svg>
  )
}

function IconPresentations() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect x="3" y="4" width="12" height="8" rx="1" stroke="currentColor" {...stroke} />
      <path d="M7 15.5h4M9 12.5v3" stroke="currentColor" {...stroke} />
    </svg>
  )
}

function IconCopywriter() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M4.5 4.5h6l3 3v7.5a1 1 0 01-1 1h-8a1 1 0 01-1-1v-10a1 1 0 011-1z" stroke="currentColor" {...stroke} />
      <path d="M10.5 4.5V8H14" stroke="currentColor" {...stroke} />
      <path d="M6.5 11.5h5M6.5 13.5h3" stroke="currentColor" {...stroke} opacity={0.7} />
    </svg>
  )
}

function IconFigma2cms() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M5 8.5l4 4 4-4M9 3.5v9" stroke="currentColor" {...stroke} />
      <path d="M4 15.5h10" stroke="currentColor" {...stroke} />
    </svg>
  )
}

/** Thin outline padlock — right side of locked rows (reference: Jio Content) */
function IconLockRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M3.5 6.25V4.75a3.25 3.25 0 016.5 0v1.5"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinecap="round"
      />
      <rect x="2.25" y="6.25" width="9.5" height="6.5" rx="1.25" stroke="currentColor" strokeWidth="1.15" />
    </svg>
  )
}

const ICONS: Record<string, () => ReactNode> = {
  benchmarks: () => <IconTrophy />,
  'jio-designs': () => <IconJioDesigns />,
  'jio-blocks': () => <IconJioBlocks />,
  experiments: () => <IconExperiments />,
  storyteller: () => <IconStoryteller />,
  'page-builder': () => <IconPageBuilder />,
  prototypes: () => <IconPrototypes />,
  presentations: () => <IconPresentations />,
  copywriter: () => <IconCopywriter />,
  figma2cms: () => <IconFigma2cms />,
}

type NavItem = {
  id: string
  label: string
  href?: string
  ready: boolean
}

type NavSection = { title: string; items: NavItem[] }

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Inspiration',
    items: [
      { id: 'benchmarks', label: 'Benchmarks', href: '/studio/benchmarks', ready: true },
      { id: 'jio-designs', label: 'Jio Designs', href: '/studio/jio-designs', ready: true },
      { id: 'jio-blocks', label: 'Jio Blocks', href: '/studio/block-inspiration', ready: true },
      { id: 'experiments', label: 'Experiments', ready: false },
    ],
  },
  {
    title: 'Creation',
    items: [
      { id: 'storyteller', label: 'Storyteller', href: '/studio/storytelling-inspiration', ready: true },
      { id: 'page-builder', label: 'Page builder', ready: false },
      { id: 'prototypes', label: 'Prototypes', ready: false },
      { id: 'presentations', label: 'Presentations', ready: false },
      { id: 'copywriter', label: 'Copywriter', ready: false },
    ],
  },
  {
    title: 'Delivery',
    items: [{ id: 'figma2cms', label: 'Figma2CMS', href: '/studio/importer', ready: true }],
  },
]

function ToolIcon({ id }: { id: string }) {
  const render = ICONS[id]
  return <span className="size-[18px] shrink-0 flex items-center justify-center">{render ? render() : null}</span>
}

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'true') setCollapsed(true)
  }, [])

  function toggleCollapse() {
    setCollapsed((prev) => {
      const next = !prev
      localStorage.setItem(STORAGE_KEY, String(next))
      return next
    })
  }

  return (
    <aside
      className={`flex flex-col h-full bg-gray-50 border-r border-gray-200 transition-all duration-200 overflow-hidden ${
        collapsed ? 'w-12' : 'w-56'
      }`}
    >
      <nav className="flex-1 flex flex-col gap-3 px-2 pt-4 overflow-y-auto studio-scrollbar">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <div className="px-2.5 mb-1.5 text-[10px] font-medium uppercase tracking-wider text-[#9CA3AF]">
                {section.title}
              </div>
            )}
            <ul className="flex flex-col gap-0.5 list-none m-0 p-0">
              {section.items.map((item) => {
                const isActive = Boolean(item.href && item.ready && pathname.startsWith(item.href))
                const iconEl = <ToolIcon id={item.id} />

                if (item.ready && item.href) {
                  return (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        title={collapsed ? item.label : undefined}
                        className={`flex items-center gap-2 min-h-[2.25rem] px-2.5 py-2 rounded-lg text-sm tracking-normal no-underline transition-colors ${
                          isActive
                            ? 'bg-primary text-white font-semibold'
                            : 'font-medium text-gray-900 hover:bg-gray-100 hover:text-gray-900'
                        } ${collapsed ? 'justify-center px-1' : ''}`}
                      >
                        <span className={isActive ? 'text-white' : 'text-gray-900'}>{iconEl}</span>
                        {!collapsed && <span className="min-w-0 flex-1 truncate">{item.label}</span>}
                      </Link>
                    </li>
                  )
                }

                return (
                  <li key={item.id}>
                    <span
                      title={item.label}
                      className={`flex items-center gap-2 min-h-[2.25rem] px-2.5 py-2 rounded-lg text-sm font-normal text-[#717171] cursor-not-allowed select-none w-full ${
                        collapsed ? 'justify-between px-1.5' : ''
                      }`}
                      aria-disabled="true"
                    >
                      <span className="text-[#717171] shrink-0">{iconEl}</span>
                      {!collapsed && <span className="min-w-0 flex-1 truncate">{item.label}</span>}
                      <span className="shrink-0 text-[#717171] flex items-center justify-center" aria-hidden>
                        <IconLockRight />
                      </span>
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="px-2.5 py-3 border-t border-gray-200 shrink-0">
        <button
          type="button"
          onClick={toggleCollapse}
          className="flex items-center gap-2 w-full px-2.5 py-2 rounded-lg text-sm tracking-normal font-normal text-[#717171] hover:bg-gray-100 hover:text-gray-900 transition-colors bg-transparent border-none cursor-pointer"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`shrink-0 transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`}
          >
            <path
              d="M11.5 4L6 9l5.5 5"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {!collapsed && <span className="whitespace-nowrap">Collapse</span>}
        </button>
      </div>
    </aside>
  )
}
