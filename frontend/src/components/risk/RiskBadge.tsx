interface RiskBadgeProps { level: string; className?: string }
const levelConfig: any = {
  LOW:      { label: 'LOW',      color: '#0f766e', bg: '#ccfbf1', border: '#99f6e4' },
  MEDIUM:   { label: 'MEDIUM',   color: '#b45309', bg: '#fef3c7', border: '#fde68a' },
  HIGH:     { label: 'HIGH',     color: '#c2410c', bg: '#ffedd5', border: '#fed7aa' },
  CRITICAL: { label: 'CRITICAL', color: '#be123c', bg: '#ffe4e6', border: '#fecdd3' },
}
export default function RiskBadge({ level, className }: RiskBadgeProps) {
  const c = levelConfig[level] ?? levelConfig.MEDIUM
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${className ?? ''}`}
      style={{ color: c.color, background: c.bg, border: `1px solid ${c.border}` }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.color }} />
      {c.label}
    </span>
  )
}
