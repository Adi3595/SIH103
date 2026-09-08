import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { TrendingUp, ArrowUpRight, Zap, Activity } from 'lucide-react'
import PageContainer from '../components/layout/PageContainer'
import RiskBadge from '../components/risk/RiskBadge'
import SkeletonTable from '../components/ui/SkeletonLoader'
import ErrorState from '../components/ui/ErrorState'
import API_BASE from '../config/api'
import { useSEO } from '../hooks/useSEO'

interface Fingerprint {
  project_id: string
  risk_score: number
  risk_momentum: number
  risk_level: string
  project_state: string
  progress_health: number
  financial_health: number
  schedule_health: number
  milestone_health: number
}

function getMomentumConfig(momentum: number) {
  if (momentum > 10) return { label: 'ACCELERATING', color: '#be123c', bg: '#ffe4e6', border: '#fecdd3' }
  if (momentum > 5)  return { label: 'RISING',        color: '#c2410c', bg: '#ffedd5', border: '#fed7aa' }
  if (momentum > 0)  return { label: 'ELEVATED',      color: '#b45309', bg: '#fef3c7', border: '#fde68a' }
  return                    { label: 'STABLE',         color: '#0f766e', bg: '#ccfbf1', border: '#99f6e4' }
}

function getWeakestDimension(p: Fingerprint) {
  const dims = [
    { label: 'Progress',   value: p.progress_health },
    { label: 'Financial',  value: p.financial_health },
    { label: 'Schedule',   value: p.schedule_health },
    { label: 'Milestones', value: p.milestone_health },
  ]
  return dims.reduce((min, d) => d.value < min.value ? d : min, dims[0])
}

export default function RisingRisk() {
  useSEO({
    title: 'Rising Risk Tracker',
    description: 'Monitor projects with rapidly deteriorating health.'
  })

  const [rising, setRising] = useState<Fingerprint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    axios.get(`${API_BASE}/api/dashboard/summary`)
      .then(res => {
        const sorted = [...res.data.top_priorities].sort((a, b) => b.risk_momentum - a.risk_momentum)
        setRising(sorted)
        setLoading(false)
      })
      .catch(() => { setLoading(false); setError(true) })
  }, [])

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1.5 h-4 rounded-full bg-red-500" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
            Early Warning System
          </span>
        </div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-4">
          Rising Risk Tracker
        </h1>

        {/* Alert banner */}
        <div className="rounded-xl p-4 flex items-start gap-3 bg-red-50 border border-red-100 shadow-sm">
          <Zap size={16} className="text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-slate-800 mb-0.5">Momentum-Sorted Risk Intelligence</p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Projects ranked by how fast their risk score is accelerating — not just their current level.
              A rapidly deteriorating medium-risk project can be more urgent than a stable high-risk one.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <SkeletonTable rows={8} cols={5} />
      ) : error ? (
        <ErrorState onRetry={() => window.location.reload()} />
      ) : (
      <>
      {/* Column headers */}
      <div className="hidden md:grid grid-cols-[40px_1fr_120px_100px_100px_80px_40px] gap-4 px-5 mb-3">
        {['#', 'Project ID + Trajectory', 'Risk Level', 'Score', 'Momentum', 'Weakest', ''].map(h => (
          <div key={h} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{h}</div>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Activity size={20} className="text-teal animate-spin" />
          <span className="ml-3 text-slate-400 text-sm">Analysing risk vectors...</span>
        </div>
      ) : (
        <div className="space-y-2">
          {rising.map((p, i) => {
            const mc = getMomentumConfig(p.risk_momentum)
            const weakest = getWeakestDimension(p)
            const barWidth = Math.min(100, Math.abs(p.risk_momentum) * 8)

            return (
              <motion.div
                key={p.project_id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: i * 0.035 }}
                className="group relative rounded-xl overflow-hidden bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200"
              >
                {/* Left accent bar */}
                <div className="absolute left-0 top-0 bottom-0 w-1 rounded-r" style={{ backgroundColor: mc.color }} />

                <div className="relative pl-5 pr-4 py-4 grid grid-cols-1 md:grid-cols-[40px_1fr_120px_100px_100px_80px_40px] gap-3 md:gap-4 items-center">
                  {/* Rank */}
                  <div className="text-xl font-black text-slate-200 tabular-nums text-center hidden md:block">
                    {String(i + 1).padStart(2, '0')}
                  </div>

                  {/* Project + bar */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-mono font-bold text-slate-700 text-sm">{p.project_id}</span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest"
                        style={{ color: mc.color, background: mc.bg, border: `1px solid ${mc.border}` }}>
                        {mc.label}
                      </span>
                    </div>
                    <div className="h-1.5 w-full max-w-[180px] rounded-full overflow-hidden bg-slate-100">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${barWidth}%` }}
                        transition={{ duration: 1, delay: 0.2 + i * 0.04 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: mc.color }}
                      />
                    </div>
                  </div>

                  {/* Risk badge */}
                  <div className="hidden md:flex"><RiskBadge level={p.risk_level} /></div>

                  {/* Score */}
                  <div className="text-center hidden md:block">
                    <div className="text-xl font-black text-slate-800 tabular-nums">{p.risk_score}</div>
                    <div className="text-[9px] text-slate-400 uppercase">score</div>
                  </div>

                  {/* Momentum */}
                  <div className="text-center hidden md:block">
                    <div className="flex items-center justify-center gap-1 font-black text-lg tabular-nums" style={{ color: mc.color }}>
                      <TrendingUp size={14} />
                      {p.risk_momentum > 0 ? '+' : ''}{p.risk_momentum}
                    </div>
                    <div className="text-[9px] text-slate-400 uppercase">momentum</div>
                  </div>

                  {/* Weakest */}
                  <div className="hidden md:block text-center">
                    <div className="text-xs font-bold text-red-600">{weakest.label}</div>
                    <div className="text-[9px] text-slate-400">{weakest.value.toFixed(0)}/100</div>
                  </div>

                  {/* Link */}
                  <Link to={`/projects/${p.project_id}`}
                    className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-teal-700 hover:bg-teal/10 border border-transparent hover:border-teal/20 transition-all duration-200">
                    <ArrowUpRight size={14} />
                  </Link>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
      </>
      )}
    </PageContainer>
  )
}
