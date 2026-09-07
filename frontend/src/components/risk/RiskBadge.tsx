interface RiskBadgeProps { level: string; className?: string }

export default function RiskBadge({ level, className }: RiskBadgeProps) {
  const safeLevel = level ? level.toLowerCase() : 'medium'
  const riskClass = `risk-${safeLevel}`

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${riskClass} ${className ?? ''}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {level}
    </span>
  )
}
