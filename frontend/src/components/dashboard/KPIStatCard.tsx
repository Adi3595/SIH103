import { LucideIcon } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "../../utils/cn"

interface KPIStatCardProps {
  title: string
  value: number | string
  icon: LucideIcon
  trend?: string
  trendValue?: string
  trendUp?: boolean
  trendNeutral?: boolean
  className?: string
  valueClassName?: string
}

export default function KPIStatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  trendUp,
  trendNeutral,
  className,
  valueClassName
}: KPIStatCardProps) {
  return (
    <motion.div 
      whileHover={{ y: -2 }}
      className={cn(
        "bg-surface rounded-xl border border-border p-5 shadow-sm hover:shadow-soft transition-all group",
        className
      )}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">{title}</h3>
        <div className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:text-navy transition-colors">
          <Icon size={18} />
        </div>
      </div>
      
      <div className="flex items-baseline gap-2 mb-3">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className={cn("text-4xl font-black text-navy tracking-tight", valueClassName)}
        >
          {value}
        </motion.div>
      </div>

      {(trend || trendValue) && (
        <div className="flex items-center gap-2 text-xs font-medium">
          {trendValue && (
            <span className={cn(
              "px-1.5 py-0.5 rounded",
              trendNeutral ? "bg-slate-100 text-slate-600" :
              trendUp ? "bg-coral/10 text-coral" : "bg-teal/10 text-teal"
            )}>
              {trendUp && !trendNeutral && "↑ "}{!trendUp && !trendNeutral && "↓ "}{trendValue}
            </span>
          )}
          {trend && <span className="text-muted">{trend}</span>}
        </div>
      )}
    </motion.div>
  )
}
