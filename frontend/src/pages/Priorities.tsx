import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertOctagon, ArrowUpRight, ShieldAlert } from 'lucide-react'
import PageContainer from '../components/layout/PageContainer'
import RiskBadge from '../components/risk/RiskBadge'
import ProjectStateBadge from '../components/risk/ProjectStateBadge'

interface Fingerprint {
  project_id: string
  risk_score: number
  risk_momentum: number
  risk_level: string
  project_state: string
  progress_health: number
  financial_health: number
}

export default function Priorities() {
  const [priorities, setPriorities] = useState<Fingerprint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/dashboard/summary')
      .then(res => {
        setPriorities(res.data.top_priorities || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const critical = priorities.filter(p => p.risk_level === 'CRITICAL')
  const high = priorities.filter(p => p.risk_level === 'HIGH')
  const rest = priorities.filter(p => !['CRITICAL', 'HIGH'].includes(p.risk_level))

  const Group = ({ title, items, accent }: { title: string, items: Fingerprint[], accent: string }) => (
    items.length > 0 ? (
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: accent }} />
          <h3 className="font-bold text-sm text-muted uppercase tracking-widest">{title}</h3>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">{items.length}</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map((p, i) => (
            <motion.div
              key={p.project_id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="bg-surface border border-border rounded-xl p-5 hover:shadow-elevated transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-0.5" style={{ backgroundColor: accent }} />
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="font-mono text-xs font-bold text-muted mb-1">{p.project_id}</div>
                  <div className="flex items-center gap-2">
                    <RiskBadge level={p.risk_level} />
                    <ProjectStateBadge state={p.project_state} />
                  </div>
                </div>
                <Link
                  to={`/projects/${p.project_id}`}
                  className="p-1.5 rounded text-muted hover:text-navy hover:bg-slate-100 transition-colors"
                >
                  <ArrowUpRight size={16} />
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                <div>
                  <div className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Risk Score</div>
                  <div className="text-2xl font-black" style={{ color: accent }}>{p.risk_score}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Momentum</div>
                  <div className="text-2xl font-black" style={{ color: p.risk_momentum > 0 ? '#e76f51' : '#2a9d8f' }}>
                    {p.risk_momentum > 0 ? '+' : ''}{p.risk_momentum}
                  </div>
                </div>
              </div>

              {/* Mini health bars */}
              <div className="mt-4 space-y-1.5">
                <div>
                  <div className="flex justify-between text-[10px] text-muted font-semibold mb-0.5">
                    <span>Progress Health</span><span>{p.progress_health}</span>
                  </div>
                  <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-teal rounded-full" style={{ width: `${p.progress_health}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] text-muted font-semibold mb-0.5">
                    <span>Financial Health</span><span>{p.financial_health}</span>
                  </div>
                  <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow rounded-full" style={{ width: `${p.financial_health}%` }} />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    ) : null
  )

  return (
    <PageContainer>
      <div className="mb-8">
        <h1 className="text-xs font-bold text-muted uppercase tracking-widest mb-1">Intervention Command</h1>
        <h2 className="text-3xl font-black text-navy tracking-tight flex items-center gap-3">
          PRIORITY QUEUE
          <AlertOctagon size={24} className="text-coral" />
        </h2>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-muted">Computing priorities...</div>
      ) : (
        <>
          <Group title="Critical — Immediate Action Required" items={critical} accent="#e76f51" />
          <Group title="High — Urgent Review Needed" items={high} accent="#f4a261" />
          <Group title="Medium — Monitor Closely" items={rest} accent="#e9c46a" />
        </>
      )}
    </PageContainer>
  )
}
