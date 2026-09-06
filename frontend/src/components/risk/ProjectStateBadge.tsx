import { cva } from "class-variance-authority"
import { TrendingUp, TrendingDown, Minus, ShieldAlert, CheckCircle2 } from "lucide-react"
import { cn } from "../../utils/cn"

const stateVariants = cva(
  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border uppercase tracking-widest whitespace-nowrap",
  {
    variants: {
      state: {
        STABLE: "bg-slate-100 text-slate-700 border-slate-200",
        IMPROVING: "bg-teal/10 text-teal-700 border-teal/20",
        DETERIORATING: "bg-orange/10 text-orange-700 border-orange/30",
        CRITICAL: "bg-coral/10 text-coral-700 border-coral/30",
        COMPLETING: "bg-navy/10 text-navy-light border-navy/20",
      },
    },
    defaultVariants: {
      state: "STABLE",
    },
  }
)

export interface ProjectStateBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  state: string
}

export default function ProjectStateBadge({ className, state, ...props }: ProjectStateBadgeProps) {
  const activeState = (state.toUpperCase() as any)
  
  const Icon = 
    activeState === 'CRITICAL' ? ShieldAlert :
    activeState === 'DETERIORATING' ? TrendingUp :
    activeState === 'IMPROVING' ? TrendingDown :
    activeState === 'COMPLETING' ? CheckCircle2 :
    Minus

  return (
    <div className={cn(stateVariants({ state: activeState, className }))} {...props}>
      <Icon size={12} strokeWidth={2.5} />
      {state}
    </div>
  )
}
