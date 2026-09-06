import { cva } from "class-variance-authority"
import { AlertCircle, AlertTriangle, Info, CheckCircle2 } from "lucide-react"
import { cn } from "../../utils/cn"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border uppercase tracking-widest whitespace-nowrap",
  {
    variants: {
      variant: {
        LOW: "bg-teal/10 text-teal-700 border-teal/20",
        MEDIUM: "bg-yellow/10 text-yellow-700 border-yellow/30",
        HIGH: "bg-orange/10 text-orange-700 border-orange/30",
        CRITICAL: "bg-coral/10 text-coral-700 border-coral/30",
      },
    },
    defaultVariants: {
      variant: "LOW",
    },
  }
)

export interface RiskBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  level: string
  variant?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | null
}

export default function RiskBadge({ className, variant, level, ...props }: RiskBadgeProps) {
  const activeVariant = variant || (level.toUpperCase() as any)
  
  const Icon = 
    activeVariant === 'CRITICAL' ? AlertCircle :
    activeVariant === 'HIGH' ? AlertTriangle :
    activeVariant === 'MEDIUM' ? Info :
    CheckCircle2

  return (
    <div className={cn(badgeVariants({ variant: activeVariant, className }))} {...props}>
      <Icon size={12} strokeWidth={2.5} />
      {level}
    </div>
  )
}
