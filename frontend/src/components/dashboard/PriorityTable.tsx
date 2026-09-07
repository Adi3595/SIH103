import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import RiskBadge from "../risk/RiskBadge"
import ProjectStateBadge from "../risk/ProjectStateBadge"
import { ArrowUpRight, TrendingUp, TrendingDown, Minus } from "lucide-react"

export default function PriorityTable({ projects }: { projects: any[] }) {
  return (
    <div className="glass-panel overflow-hidden">
      <div className="px-6 py-5 flex items-center justify-between border-b border-border-default bg-surface-card/40">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-4 rounded-full bg-gold" />
          <h3 className="text-xs font-black text-text-primary uppercase tracking-widest">
            Projects Requiring Attention
          </h3>
        </div>
        <span className="text-xs font-bold text-text-secondary bg-surface-card px-2 py-1 rounded-md border border-border-default shadow-sm">{projects.length} projects</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border-default bg-surface-sunken">
              {['#', 'Project ID', 'Risk Level', 'Score', 'Momentum', 'State', ''].map(h => (
                <th key={h} className="px-6 py-3.5 text-[10px] font-bold text-text-muted uppercase tracking-widest">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {projects.map((p, i) => {
              const momentumColor = p.risk_momentum > 5 ? '#fb7185' : p.risk_momentum > 0 ? '#fbbf24' : '#2dd4bf'
              const MomentumIcon = p.risk_momentum > 0 ? TrendingUp : p.risk_momentum < 0 ? TrendingDown : Minus

              return (
                <motion.tr
                  key={p.project_id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.04 }}
                  className="group border-b border-border-default hover:bg-surface-sunken transition-colors duration-150"
                >
                  <td className="px-6 py-4">
                    <span className="text-xs font-black text-text-muted tabular-nums">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono font-bold text-brand-primary text-sm">{p.project_id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <RiskBadge level={p.risk_level} />
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-base font-black text-text-primary tabular-nums">{p.risk_score}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 font-bold text-sm tabular-nums" style={{ color: momentumColor }}>
                      <MomentumIcon size={14} />
                      {p.risk_momentum > 0 ? '+' : ''}{p.risk_momentum}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <ProjectStateBadge state={p.project_state} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link to={`/projects/${p.project_id}`}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-text-muted hover:text-brand-primary hover:bg-brand-primary/10 hover:border-brand-primary/20 transition-all duration-200 border border-transparent">
                      <ArrowUpRight size={16} />
                    </Link>
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
