interface ProjectStateBadgeProps { state: string; className?: string }
const stateConfig: any = {
  CRITICAL:     { label: 'CRITICAL',     color: '#be123c', bg: '#ffe4e6', border: '#fecdd3' },
  DETERIORATING:{ label: 'DETERIORATING',color: '#c2410c', bg: '#ffedd5', border: '#fed7aa' },
  STABLE:       { label: 'STABLE',       color: '#475569', bg: '#f1f5f9', border: '#e2e8f0' },
  IMPROVING:    { label: 'IMPROVING',    color: '#0f766e', bg: '#ccfbf1', border: '#99f6e4' },
  COMPLETING:   { label: 'COMPLETING',   color: '#b45309', bg: '#fef3c7', border: '#fde68a' },
}
export default function ProjectStateBadge({ state, className }: ProjectStateBadgeProps) {
  const c = stateConfig[state] ?? stateConfig.STABLE
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${className ?? ''}`}
      style={{ color: c.color, background: c.bg, border: `1px solid ${c.border}` }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.color }} />
      {c.label}
    </span>
  )
}
