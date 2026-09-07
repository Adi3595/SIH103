import { Link } from 'react-router-dom'
import { ArrowRight, Zap, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import ProjectStateBadge from '../risk/ProjectStateBadge'

export default function IntelligenceAlert({ project }: { project: any }) {
  if (!project) return null
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      className="glass-card p-6 relative h-full flex flex-col bg-gradient-to-br from-surface-card to-coral/5 border border-coral/20 shadow-[0_8px_30px_rgb(251,113,133,0.1)]"
    >
      <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full bg-coral/10 border border-coral/20 self-start">
        <Zap size={12} className="text-coral" />
        <span className="text-[10px] font-black text-coral uppercase tracking-widest">Fastest Deteriorating</span>
        <span className="w-1.5 h-1.5 rounded-full bg-coral animate-pulse ml-1" />
      </div>

      <h2 className="text-3xl font-black text-text-primary font-mono mb-6">{project.project_id}</h2>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Risk Score', value: project.risk_score, color: '#be123c' },
          { label: 'Momentum', value: `+${project.risk_momentum ?? 0}`, color: '#be123c' },
          { label: 'Progress', value: `${project.progress_health ?? 0}%`, color: '#b45309' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-surface-page rounded-xl p-3 shadow-sm border border-border-default">
            <div className="text-[9px] font-bold text-text-muted uppercase tracking-widest mb-1">{label}</div>
            <div className="text-xl font-black tabular-nums" style={{ color }}>{value}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-5">
        <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">State:</span>
        <ProjectStateBadge state={project.project_state} />
      </div>

      <div className="flex items-start gap-2 p-3 rounded-lg mb-6 bg-coral/5 border border-coral/10">
        <TrendingUp size={14} className="text-coral shrink-0 mt-0.5" />
        <p className="text-xs text-text-secondary font-medium leading-relaxed">
          Risk score has increased consistently. Accelerating deterioration across multiple dimensions detected.
        </p>
      </div>

      <div className="mt-auto">
        <Link to={`/projects/${project.project_id}`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-surface-page text-coral border border-border-default shadow-sm hover:shadow-md hover:bg-coral/10 transition-all w-full justify-center">
          VIEW FULL DOSSIER <ArrowRight size={16} />
        </Link>
      </div>
    </motion.div>
  )
}
