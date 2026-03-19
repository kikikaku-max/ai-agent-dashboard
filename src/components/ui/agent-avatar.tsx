import { TEAM_COLORS } from '@/lib/types'

type Team = 'CORE' | 'TECH' | 'CREATIVE' | 'BUSINESS' | 'FINANCE'

const TEAM_GRADIENTS: Record<Team, [string, string]> = {
  CORE: ['#f59e0b', '#d97706'],
  TECH: ['#3b82f6', '#2563eb'],
  CREATIVE: ['#a855f7', '#7c3aed'],
  BUSINESS: ['#10b981', '#059669'],
  FINANCE: ['#ef4444', '#dc2626'],
}

// Each agent has a unique SVG icon path
const AGENT_ICONS: Record<string, { path: string; viewBox?: string }> = {
  secretary: {
    // Clipboard with checkmark
    path: 'M9 2h6a1 1 0 011 1v1h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2V3a1 1 0 011-1zm0 2v1h6V4H9zm-1 6l2.5 3L16 8',
  },
  coder: {
    // Code brackets
    path: 'M7 8l-4 4 4 4M17 8l4 4-4 4M14 4l-4 16',
  },
  sysadmin: {
    // Shield with check
    path: 'M12 2l8 4v6c0 5.25-3.5 9.74-8 11-4.5-1.26-8-5.75-8-11V6l8-4zm-1 10.5l-2.5-2.5L7 11.5l4 4 8-8-1.5-1.5L11 12.5z',
  },
  automation: {
    // Gear/cog
    path: 'M12 15a3 3 0 100-6 3 3 0 000 6zm8-3c0 .34-.03.67-.08 1l2.15 1.68-2 3.46-2.55-.85c-.53.4-1.12.72-1.76.93L15.24 21h-4l-.52-2.78c-.64-.21-1.23-.53-1.76-.93l-2.55.85-2-3.46L6.56 13c-.05-.33-.08-.66-.08-1s.03-.67.08-1L4.41 9.32l2-3.46 2.55.85c.53-.4 1.12-.72 1.76-.93L11.24 3h4l.52 2.78c.64.21 1.23.53 1.76.93l2.55-.85 2 3.46L19.92 11c.05.33.08.66.08 1z',
  },
  'prompt-designer': {
    // Magic wand with sparkles
    path: 'M7.5 5.6L5 7l1.4-2.5L5 2l2.5 1.4L10 2 8.6 4.5 10 7 7.5 5.6zm12 9.8L22 14l-1.4 2.5L22 19l-2.5-1.4L17 19l1.4-2.5L17 14l2.5 1.4zM22 2l-2.5 1.4L17 2l1.4 2.5L17 7l2.5-1.4L22 7l-1.4-2.5L22 2zM4.14 19.86L19.86 4.14',
  },
  'course-designer': {
    // Book with bookmark
    path: 'M4 4a2 2 0 012-2h12a2 2 0 012 2v16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v16h12V4H6zm3 0v8l2.5-2 2.5 2V4',
  },
  'content-creator': {
    // Pen writing on paper
    path: 'M14.5 2.5a2.12 2.12 0 013 3L6 17l-4 1 1-4L14.5 2.5zM12 18h8M3 22h18',
  },
  graphics: {
    // Palette with brush
    path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-1 0-.83.67-1.5 1.5-1.5H16c3.31 0 6-2.69 6-6 0-4.96-4.48-9-10-9zM6.5 13a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm3-4a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm5 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm3 4a1.5 1.5 0 110-3 1.5 1.5 0 010 3z',
  },
  'creative-director': {
    // Lightbulb with rays
    path: 'M9 21h6M12 2a7 7 0 00-4 12.74V17a1 1 0 001 1h6a1 1 0 001-1v-2.26A7 7 0 0012 2zm0 3a4 4 0 013 6.65V14H9v-2.35A4 4 0 0112 5z',
  },
  marketer: {
    // Megaphone/bullhorn
    path: 'M21 10.5c0 1.38-.56 2.63-1.46 3.54L18 12.5V8.5l1.54-1.54C20.44 7.87 21 9.12 21 10.5zM3 9v3a1 1 0 001 1h1l5 5V4L5 9H4a1 1 0 00-1 1zm10-1v5c1.1 0 2-1.12 2-2.5S14.1 8 13 8z',
  },
  strategist: {
    // Target/bullseye
    path: 'M12 2a10 10 0 100 20 10 10 0 000-20zm0 4a6 6 0 100 12 6 6 0 000-12zm0 4a2 2 0 100 4 2 2 0 000-4z',
  },
  journalist: {
    // Newspaper/microphone
    path: 'M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zM7 7h4v4H7V7zm10 10H7v-2h10v2zm0-4H13v-2h4v2zm0-4h-4V7h4v2z',
  },
  accountant: {
    // Calculator
    path: 'M6 2h12a2 2 0 012 2v16a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2zm1 3v3h10V5H7zm0 6h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v6h-2v-6zm-8 4h2v2H7v-2zm4 0h2v2h-2v-2z',
  },
  'gold-trader': {
    // Gold bar / diamond
    path: 'M5 8h14l-2 8H7L5 8zm2-4h10l2 4H5l2-4zm5-2l2 2H10l2-2zM8 20h8',
  },
  'stock-analyst': {
    // Candlestick chart
    path: 'M6 4v4M6 14v6M6 8a2 2 0 012-2h0a2 2 0 012 2v4a2 2 0 01-2 2h0a2 2 0 01-2-2V8zM16 2v6M16 14v4M16 8a2 2 0 012-2h0a2 2 0 012 2v4a2 2 0 01-2 2h0a2 2 0 01-2-2V8z',
  },
}

interface AgentAvatarProps {
  agentId: string
  team: Team
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const SIZES = {
  sm: { container: 32, icon: 14, stroke: 1.8 },
  md: { container: 40, icon: 18, stroke: 1.6 },
  lg: { container: 56, icon: 24, stroke: 1.5 },
  xl: { container: 72, icon: 32, stroke: 1.4 },
}

export function AgentAvatar({ agentId, team, size = 'md', className = '' }: AgentAvatarProps) {
  const s = SIZES[size]
  const [color1, color2] = TEAM_GRADIENTS[team] || TEAM_GRADIENTS.CORE
  const icon = AGENT_ICONS[agentId]
  const gradientId = `grad-${agentId}-${size}`

  return (
    <svg
      width={s.container}
      height={s.container}
      viewBox={`0 0 ${s.container} ${s.container}`}
      className={`shrink-0 ${className}`}
      style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color1} />
          <stop offset="100%" stopColor={color2} />
        </linearGradient>
        <radialGradient id={`${gradientId}-glow`}>
          <stop offset="0%" stopColor={color1} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color1} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Outer glow */}
      <circle cx={s.container / 2} cy={s.container / 2} r={s.container / 2} fill={`url(#${gradientId}-glow)`} />

      {/* Background circle */}
      <circle
        cx={s.container / 2}
        cy={s.container / 2}
        r={s.container / 2 - 1}
        fill={`url(#${gradientId})`}
        opacity="0.9"
      />

      {/* Inner highlight */}
      <circle
        cx={s.container / 2}
        cy={s.container / 2 - s.container * 0.12}
        r={s.container / 2 - 4}
        fill="white"
        opacity="0.08"
      />

      {/* Icon */}
      {icon && (
        <g transform={`translate(${(s.container - s.icon) / 2}, ${(s.container - s.icon) / 2}) scale(${s.icon / 24})`}>
          <path
            d={icon.path}
            fill="none"
            stroke="white"
            strokeWidth={s.stroke}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.95"
          />
        </g>
      )}

      {/* Subtle border */}
      <circle
        cx={s.container / 2}
        cy={s.container / 2}
        r={s.container / 2 - 1}
        fill="none"
        stroke="white"
        strokeWidth="0.5"
        opacity="0.2"
      />
    </svg>
  )
}
