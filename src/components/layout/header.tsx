'use client'

import { usePathname } from 'next/navigation'
import { Activity } from 'lucide-react'

const pageTitles: Record<string, string> = {
  '/command-center': 'ศูนย์บัญชาการ',
  '/agents': 'ทีม AI Agents',
  '/missions': 'ภารกิจ',
  '/workspace': 'พื้นที่ทำงาน',
  '/skills': 'ทักษะ',
}

export function Header() {
  const pathname = usePathname()
  const title = Object.entries(pageTitles).find(([path]) =>
    pathname.startsWith(path)
  )?.[1] || 'Dashboard'

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 backdrop-blur px-6">
      <h2 className="text-xl font-bold">{title}</h2>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Activity className="h-4 w-4 text-green-500" />
        <span>ระบบทำงานปกติ</span>
      </div>
    </header>
  )
}
