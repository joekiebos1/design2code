import type { Metadata } from 'next'
import { Sidebar } from './Sidebar'
import { StudioHeader } from './StudioHeader'

export const metadata: Metadata = {
  title: 'Studio',
}

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-sans h-screen flex flex-col overflow-hidden bg-white">
      <StudioHeader />
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <Sidebar />
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  )
}
