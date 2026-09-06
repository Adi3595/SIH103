import { Activity, DollarSign, Calendar, Target, AlertTriangle, LucideIcon } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "../../utils/cn"

interface FingerprintData {
  progress_health: number
  financial_health: number
  schedule_health: number
  milestone_health: number
  issue_pressure: number
}

interface DigitalFingerprintProps {
  data: FingerprintData
}

export default function DigitalFingerprint({ data }: DigitalFingerprintProps) {
  return (
    <div className="bg-surface rounded-xl border border-border p-6 shadow-sm">
      <h3 className="font-bold text-navy tracking-wide mb-6">DIGITAL FINGERPRINT</h3>
      
      <div className="space-y-6">
        <HealthBar 
          label="Progress Health" 
          value={data.progress_health} 
          icon={Activity} 
          delay={0.1}
        />
        <HealthBar 
          label="Financial Health" 
          value={data.financial_health} 
          icon={DollarSign} 
          delay={0.2}
        />
        <HealthBar 
          label="Schedule Health" 
          value={data.schedule_health} 
          icon={Calendar} 
          delay={0.3}
        />
        <HealthBar 
          label="Milestone Health" 
          value={data.milestone_health} 
          icon={Target} 
          delay={0.4}
        />
        <HealthBar 
          label="Issue Pressure" 
          value={data.issue_pressure} 
          icon={AlertTriangle} 
          delay={0.5}
          inverse
        />
      </div>
      
      <div className="mt-6 pt-4 border-t border-border flex justify-between text-xs text-muted font-medium">
        <span>Higher health is better</span>
        <span>Higher issue pressure is worse</span>
      </div>
    </div>
  )
}

function HealthBar({ 
  label, 
  value, 
  icon: Icon, 
  inverse = false,
  delay = 0 
}: { 
  label: string, 
  value: number, 
  icon: LucideIcon,
  inverse?: boolean,
  delay?: number
}) {
  // Determine color based on whether higher is better (inverse = false) or higher is worse (inverse = true)
  let isGood = inverse ? value < 30 : value > 70
  let isWarning = inverse ? (value >= 30 && value < 70) : (value >= 40 && value <= 70)
  
  const colorClass = isGood ? "bg-teal text-teal" : isWarning ? "bg-yellow text-yellow-700" : "bg-coral text-coral"

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-navy">
          <Icon size={16} className="text-muted" />
          {label}
        </div>
        <div className={cn("text-sm font-black", colorClass.split(' ')[1])}>
          {value} <span className="text-muted font-normal text-xs">/ 100</span>
        </div>
      </div>
      
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, delay, ease: "easeOut" }}
          className={cn("h-full rounded-full", colorClass.split(' ')[0])}
        />
      </div>
    </div>
  )
}
