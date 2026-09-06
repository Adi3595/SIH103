import { Link } from "react-router-dom"
import { ArrowRight, AlertTriangle } from "lucide-react"
import { motion } from "framer-motion"
import ProjectStateBadge from "../risk/ProjectStateBadge"

interface IntelligenceAlertProps {
  project: any
}

export default function IntelligenceAlert({ project }: IntelligenceAlertProps) {
  if (!project) return null

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-surface border-l-4 border-coral rounded-r-xl shadow-elevated p-6 relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-coral/5 rounded-full blur-[40px] pointer-events-none transition-all group-hover:bg-coral/10"></div>
      
      <div className="flex items-center gap-2 text-coral font-bold text-xs uppercase tracking-widest mb-4">
        <AlertTriangle size={14} />
        Fastest Deteriorating
      </div>
      
      <h2 className="text-2xl font-black text-navy mb-4 font-mono">{project.project_id}</h2>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <div className="text-xs text-muted font-semibold uppercase tracking-wider mb-1">Risk Score</div>
          <div className="text-2xl font-black text-coral">{project.risk_score}</div>
        </div>
        <div>
          <div className="text-xs text-muted font-semibold uppercase tracking-wider mb-1">Momentum</div>
          <div className="text-2xl font-black text-coral">+{project.risk_momentum}</div>
        </div>
        <div>
          <div className="text-xs text-muted font-semibold uppercase tracking-wider mb-1">State</div>
          <ProjectStateBadge state={project.project_state} className="mt-1" />
        </div>
      </div>
      
      <p className="text-sm text-slate-600 mb-6 font-medium">
        Risk has increased consistently across recent reporting periods. Immediate intervention recommended.
      </p>
      
      <Link 
        to={`/projects/${project.project_id}`}
        className="inline-flex items-center gap-2 text-sm font-bold text-navy hover:text-teal transition-colors"
      >
        VIEW PROJECT <ArrowRight size={16} />
      </Link>
    </motion.div>
  )
}
