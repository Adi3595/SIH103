interface ProjectStateBadgeProps { state: string; className?: string }

const stateConfig: any = {
  CRITICAL:     { label: 'CRITICAL',      className: 'risk-critical' },
  DETERIORATING:{ label: 'DETERIORATING', className: 'risk-high' },
  STABLE:       { label: 'STABLE',        className: 'bg-surface-sunken text-text-secondary border border-border-default' },
  IMPROVING:    { label: 'IMPROVING',     className: 'risk-low' },
  COMPLETING:   { label: 'COMPLETING',    className: 'risk-medium' },
}

export default function ProjectStateBadge({ state, className }: ProjectStateBadgeProps) {
  const c = stateConfig[state] ?? stateConfig.STABLE
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${c.className} ${className ?? ''}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {c.label}
    </span>
  )
}
