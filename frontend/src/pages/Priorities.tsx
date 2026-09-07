import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertOctagon, ArrowUpRight, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import PageContainer from '../components/layout/PageContainer'
import RiskBadge from '../components/risk/RiskBadge'
import ProjectStateBadge from '../components/risk/ProjectStateBadge'
import { SkeletonCard } from '../components/ui/SkeletonLoader'
import ErrorState from '../components/ui/ErrorState'
import API_BASE from '../config/api'

interface Fingerprint {
  project_id: string
  risk_score: number
  risk_momentum: number
  risk_level: string
  project_state: string
  progress_health: number
  financial_health: number
}

const GROUP_CONFIG = [
  { key: 'CRITICAL', label: 'Critical — Immediate Action Required', accent: '#be123c', bg: '#ffe4e6', border: '#fecdd3' },
  { key: 'HIGH',     label: 'High — Urgent Review Needed',          accent: '#c2410c', bg: '#ffedd5', border: '#fed7aa' },
  { key: 'OTHER',    label: 'Medium — Monitor Closely',             accent: '#b45309', bg: '#fef3c7', border: '#fde68a' },
]

function ProjectCard({ p, i, accent }: { p: Fingerprint, i: number, accent: string }) {
  const MIcon = p.risk_momentum > 0 ? TrendingUp : p.risk_momentum < 0 ? TrendingDown : Minus
  const mColor = p.risk_momentum > 0 ? '#be123c' : p.risk_momentum < 0 ? '#0f766e' : '#64748b'

  return (
    <motion.div
      key={p.project_id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: i * 0.05 }}
      className="bg-white border rounded-2xl p-5 hover:shadow-lg transition-all group relative overflow-hidden"
      style={{ borderColor: '#e2e8f0' }}
    >
      {/* Top accent */}
      <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl" style={{ backgroundColor: accent }} />

      <div className="flex justify-between items-start mb-4 mt-1">
        <div>
          <div className="font-mono text-xs font-bold text-slate-400 mb-2">{p.project_id}</div>
          <div className="flex items-center gap-2 flex-wrap">
            <RiskBadge level={p.risk_level} />
            <ProjectStateBadge state={p.project_state} />
          </div>
        </div>
        <Link to={`/projects/${p.project_id}`}
          className="p-1.5 rounded-lg text-slate-400 hover:text-teal-700 hover:bg-teal/10 border border-transparent hover:border-teal/20 transition-all">
          <ArrowUpRight size={16} />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Risk Score</div>
          <div className="text-2xl font-black tabular-nums" style={{ color: accent }}>{p.risk_score}</div>
        </div>
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Momentum</div>
          <div className="flex items-center gap-1.5 text-2xl font-black tabular-nums" style={{ color: mColor }}>
            <MIcon size={16} />
            {p.risk_momentum > 0 ? '+' : ''}{p.risk_momentum}
          </div>
        </div>
      </div>

      {/* Mini health bars */}
      <div className="mt-4 space-y-2">
        {[
          { label: 'Progress', val: p.progress_health, color: '#0f766e' },
          { label: 'Financial', val: p.financial_health, color: '#b45309' },
        ].map(dim => (
          <div key={dim.label}>
            <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">
              <span>{dim.label}</span><span>{dim.val}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${dim.val}%` }} transition={{ duration: 0.8, delay: i * 0.05 }}
                className="h-full rounded-full" style={{ backgroundColor: dim.color }} />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

export default function Priorities() {
  const [priorities, setPriorities] = useState<Fingerprint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    axios.get(`${API_BASE}/api/dashboard/summary`)
      .then(res => {
        setPriorities(res.data.top_priorities || [])
        setLoading(false)
      })
      .catch(() => { setLoading(false); setError(true) })
  }, [])

  const groups = {
    CRITICAL: priorities.filter(p => p.risk_level === 'CRITICAL'),
    HIGH:     priorities.filter(p => p.risk_level === 'HIGH'),
    OTHER:    priorities.filter(p => !['CRITICAL', 'HIGH'].includes(p.risk_level)),
  }

  return (
    <PageContainer>
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1.5 h-4 rounded-full bg-red-500" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Intervention Command</span>
        </div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Priority Queue</h1>
          <AlertOctagon size={22} className="text-red-500" />
        </div>
        <p className="text-sm text-slate-500 mt-1">Projects requiring immediate executive attention, grouped by criticality.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-40"><SkeletonCard /></div>)}
        </div>
      ) : error ? (
        <ErrorState onRetry={() => window.location.reload()} />
      ) : (
        <>
          {GROUP_CONFIG.map(cfg => {
            const items = groups[cfg.key as keyof typeof groups]
            if (!items.length) return null
            return (
              <div key={cfg.key} className="mb-8">
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cfg.accent }} />
                  <h3 className="font-bold text-sm text-slate-600 uppercase tracking-widest">{cfg.label}</h3>
                  <span className="text-xs font-black px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: cfg.bg, color: cfg.accent, border: `1px solid ${cfg.border}` }}>
                    {items.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {items.map((p, i) => (
                    <ProjectCard key={p.project_id} p={p} i={i} accent={cfg.accent} />
                  ))}
                </div>
              </div>
            )
          })}
        </>
      )}
    </PageContainer>
  )
}
