import { motion } from "framer-motion"
import { LucideIcon } from "lucide-react"

export default function KPIStatCard({ title, value, subtitle, icon: Icon, color, delay }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay }}
      className="glass-card p-6 relative overflow-hidden group hover:shadow-lg transition-all duration-300"
    >
      <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-700 pointer-events-none" style={{ backgroundColor: color }} />
      <div className="flex justify-between items-start mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white shadow-sm border border-slate-100" style={{ color }}>
          <Icon size={20} />
        </div>
      </div>
      <div>
        <h3 className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-1">{title}</h3>
        <div className="text-3xl font-black text-slate-800 tabular-nums">{value}</div>
        <p className="text-slate-400 text-xs font-medium mt-2">{subtitle}</p>
      </div>
    </motion.div>
  )
}
