import { motion } from "framer-motion"
import { Fingerprint } from "lucide-react"

export default function DigitalFingerprint({ fingerprint }: { fingerprint: any }) {
  if (!fingerprint) return null
  
  const dims = [
    { key: 'progress_health', label: 'Progress Health', val: fingerprint.progress_health },
    { key: 'financial_health', label: 'Financial Health', val: fingerprint.financial_health },
    { key: 'schedule_health', label: 'Schedule Health', val: fingerprint.schedule_health },
    { key: 'milestone_health', label: 'Milestone Health', val: fingerprint.milestone_health },
  ]
  
  return (
    <div className="glass-panel h-full flex flex-col p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-teal/10 border border-teal/20 flex items-center justify-center text-teal-700">
          <Fingerprint size={20} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800 tracking-wide">DIGITAL FINGERPRINT</h3>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">Real-time Dimension State</p>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col justify-around gap-4">
        {dims.map((dim, i) => {
          let color = '#0f766e' // teal-700
          if (dim.val < 40) { color = '#be123c' }
          else if (dim.val < 70) { color = '#b45309' }
          
          return (
            <div key={dim.key}>
              <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest mb-1.5">
                <span className="text-slate-600">{dim.label}</span>
                <span style={{ color }}>{dim.val}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden shadow-inner">
                <motion.div initial={{ width: 0 }} animate={{ width: dim.val + "%" }} transition={{ duration: 1, delay: i * 0.1 }}
                  className="h-full rounded-full" style={{ backgroundColor: color }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
