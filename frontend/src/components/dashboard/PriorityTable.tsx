import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import RiskBadge from "../risk/RiskBadge"
import ProjectStateBadge from "../risk/ProjectStateBadge"
import { ArrowUpRight } from "lucide-react"
import { cn } from "../../utils/cn"

interface PriorityTableProps {
  projects: any[]
}

export default function PriorityTable({ projects }: PriorityTableProps) {
  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-sm">
      <div className="p-5 border-b border-border bg-slate-50/50">
        <h3 className="font-bold text-navy tracking-wide">PROJECTS REQUIRING ATTENTION</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-xs uppercase tracking-wider text-muted border-b border-border">
              <th className="p-4 font-semibold">Priority</th>
              <th className="p-4 font-semibold">Project</th>
              <th className="p-4 font-semibold">Risk</th>
              <th className="p-4 font-semibold">Momentum</th>
              <th className="p-4 font-semibold">State</th>
              <th className="p-4 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {projects.map((p, i) => (
              <motion.tr 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                key={p.project_id} 
                className="hover:bg-slate-50 transition-colors group"
              >
                <td className="p-4">
                  <span className="text-xs font-bold text-slate-400">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </td>
                <td className="p-4 font-mono font-medium text-navy text-sm">
                  {p.project_id}
                </td>
                <td className="p-4">
                  <RiskBadge level={p.risk_level} />
                </td>
                <td className="p-4">
                  <span className={cn(
                    "text-sm font-bold flex items-center gap-1",
                    p.risk_momentum > 0 ? "text-coral" : "text-teal"
                  )}>
                    {p.risk_momentum > 0 ? '+' : ''}{p.risk_momentum}
                  </span>
                </td>
                <td className="p-4">
                  <ProjectStateBadge state={p.project_state} />
                </td>
                <td className="p-4 text-right">
                  <Link 
                    to={`/projects/${p.project_id}`} 
                    className="inline-flex items-center justify-center p-2 rounded text-slate-400 hover:text-navy hover:bg-slate-200 transition-colors"
                  >
                    <ArrowUpRight size={18} />
                  </Link>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
