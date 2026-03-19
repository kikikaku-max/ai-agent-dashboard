'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Target,
  FolderOpen,
  Zap,
  Bot,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/command-center', label: 'ศูนย์บัญชาการ', icon: LayoutDashboard },
  { href: '/agents', label: 'ทีม AI Agents', icon: Users },
  { href: '/missions', label: 'ภารกิจ', icon: Target },
  { href: '/workspace', label: 'พื้นที่ทำงาน', icon: FolderOpen },
  { href: '/skills', label: 'ทักษะ', icon: Zap },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-border px-6">
        <Bot className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-lg font-bold text-foreground">AI Team</h1>
          <p className="text-xs text-muted-foreground">KikiTrades Dashboard</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-1 p-4">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-border p-4">
        <p className="text-xs text-muted-foreground text-center">
          AI Agent Dashboard v0.1
        </p>
      </div>
    </aside>
  )
}
