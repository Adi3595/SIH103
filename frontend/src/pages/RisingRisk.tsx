import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { TrendingUp, ArrowUpRight, AlertTriangle } from 'lucide-react'
import PageContainer from '../components/layout/PageContainer'
import RiskBadge from '../components/risk/RiskBadge'

interface Fingerprint {
  project_id: string
  risk_score: number
  risk_momentum: number
  risk_level: string
  project_state: string
  progress_health: number
  financial_health: number
}

export default function RisingRisk() {
  const [rising, setRising] = useState<Fingerprint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/dashboard/summary')
      .then(res => {
        // Sort all top priorities by momentum descending
        const sorted = [...res.data.top_priorities].sort((a, b) => b.risk_momentum - a.risk_momentum)
        setRising(sorted)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <PageContainer>
      <div className="mb-8">
        <h1 className="text-xs font-bold text-muted uppercase tracking-widest mb-1">Early Warning System</h1>
        <h2 className="text-3xl font-black text-navy tracking-tight flex items-center gap-3">
          RISING RISK TRACKER
          <span className="text-sm font-bold text-coral bg-coral/10 border border-coral/20 px-2.5 py-1 rounded-full flex items-center gap-1">
            <TrendingUp size={13} /> Momentum Sorted
          </span>
        </h2>
      </div>

      <div className="bg-coral/5 border border-coral/20 rounded-xl p-4 mb-8 flex items-start gap-3">
        <AlertTriangle size={18} className="text-coral shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-navy mb-0.5">Risk Momentum Indicator</p>
          <p className="text-xs text-muted">Projects are ranked by how fast their composite risk score is increasing. A high momentum indicates accelerating deterioration requiring immediate attention.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-muted">Analysing risk vectors...</div>
      ) : (
        <div className="space-y-3">
          {rising.map((p, i) => {
            const momentumPercent = Math.min(100, Math.abs(p.risk_momentum) * 10)
            return (
              <motion.div
                key={p.project_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                className="bg-surface border border-border rounded-xl p-5 flex items-center gap-6 hover:shadow-soft transition-all group"
              >
                <div className="text-2xl font-black text-slate-200 w-10 text-center shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono font-bold text-navy text-sm">{p.project_id}</span>
                    <RiskBadge level={p.risk_level} />
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden w-full max-w-sm">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${momentumPercent}%` }}
                      transition={{ duration: 0.8, delay: 0.2 + i * 0.04 }}
                      className="h-full rounded-full"
                      style={{ background: p.risk_momentum > 10 ? '#e76f51' : p.risk_momentum > 5 ? '#f4a261' : '#e9c46a' }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6 shrink-0">
                  <div className="text-center">
                    <div className="text-xs text-muted font-semibold uppercase tracking-widest mb-1">Risk Score</div>
                    <div className="text-xl font-black text-navy">{p.risk_score}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-muted font-semibold uppercase tracking-widest mb-1">Momentum</div>
                    <div className="text-xl font-black text-coral">+{p.risk_momentum}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-muted font-semibold uppercase tracking-widest mb-1">State</div>
                    <div className="text-sm font-bold text-navy">{p.project_state}</div>
                  </div>
                </div>

                <Link
                  to={`/projects/${p.project_id}`}
                  className="shrink-0 p-2 rounded-lg text-muted hover:text-navy hover:bg-slate-100 transition-colors"
                >
                  <ArrowUpRight size={18} />
                </Link>
              </motion.div>
            )
          })}
        </div>
      )}
    </PageContainer>
  )
}
