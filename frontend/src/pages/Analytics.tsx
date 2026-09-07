import { useEffect, useState } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'
import { BarChart3 } from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts'
import PageContainer from '../components/layout/PageContainer'
import { SkeletonCard } from '../components/ui/SkeletonLoader'
import ErrorState from '../components/ui/ErrorState'
import API_BASE from '../config/api'

interface SummaryData {
  total_projects: number
  low_risk: number
  medium_risk: number
  high_risk: number
  critical_risk: number
  rising_risk: number
  top_priorities: any[]
}

const RISK_DIST = [
  { name: 'LOW',      key: 'low_risk',      color: '#0f766e', bg: '#ccfbf1' },
  { name: 'MEDIUM',   key: 'medium_risk',   color: '#b45309', bg: '#fef3c7' },
  { name: 'HIGH',     key: 'high_risk',     color: '#c2410c', bg: '#ffedd5' },
  { name: 'CRITICAL', key: 'critical_risk', color: '#be123c', bg: '#ffe4e6' },
]

export default function Analytics() {
  const [data, setData] = useState<SummaryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    axios.get(`${API_BASE}/api/dashboard/summary`)
      .then(res => { setData(res.data); setLoading(false) })
      .catch(() => { setLoading(false); setError(true) })
  }, [])

  if (loading) {
    return (
      <PageContainer>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-32"><SkeletonCard /></div>)}
        </div>
      </PageContainer>
    )
  }

  if (error || !data) {
    return (
      <PageContainer>
        <ErrorState onRetry={() => window.location.reload()} />
      </PageContainer>
    )
  }

  const riskDistData = RISK_DIST.map(r => ({
    name: r.name,
    value: data[r.key as keyof SummaryData] as number,
    color: r.color,
    bg: r.bg,
    pct: (((data[r.key as keyof SummaryData] as number) / data.total_projects) * 100).toFixed(1),
  }))

  const stateCounts: Record<string, number> = {}
  data.top_priorities.forEach(p => {
    stateCounts[p.project_state] = (stateCounts[p.project_state] || 0) + 1
  })
  const stateData = Object.entries(stateCounts).map(([name, value]) => ({ name, value }))

  const STATE_COLORS = ['#0f766e', '#be123c', '#c2410c', '#b45309', '#475569']

  return (
    <PageContainer>
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1.5 h-4 rounded-full bg-teal-500" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Portfolio Intelligence</span>
        </div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Analytics</h1>
          <BarChart3 size={22} className="text-teal-500" />
        </div>
        <p className="text-sm text-slate-500 mt-1">Portfolio-wide risk and performance breakdown.</p>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {riskDistData.map((d, i) => (
          <motion.div key={d.name}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="bg-white border border-slate-100 rounded-2xl p-5 relative overflow-hidden shadow-sm hover:shadow-md transition-all group"
          >
            <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl" style={{ backgroundColor: d.color }} />
            <div className="absolute top-2 right-2 w-12 h-12 rounded-full opacity-10 group-hover:opacity-20 transition-opacity" style={{ backgroundColor: d.color }} />
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{d.name} RISK</div>
            <div className="text-4xl font-black tabular-nums" style={{ color: d.color }}>{d.value}</div>
            <div className="text-xs text-slate-400 font-medium mt-1">{d.pct}% of portfolio</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Donut chart */}
        <div className="glass-panel p-6">
          <h3 className="font-bold text-slate-700 text-sm tracking-wide uppercase mb-6">Risk Level Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={riskDistData} innerRadius={65} outerRadius={95} paddingAngle={3} dataKey="value" stroke="none">
                  {riskDistData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '13px', background: '#fff', color: '#1e293b', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', color: '#64748b', paddingTop: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar chart */}
        <div className="glass-panel p-6">
          <h3 className="font-bold text-slate-700 text-sm tracking-wide uppercase mb-6">Portfolio Risk Breakdown (%)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskDistData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} unit="%" />
                <Tooltip
                  formatter={(v: any) => [`${v}%`, 'Share']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '13px', background: '#fff', color: '#1e293b', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}
                />
                <Bar dataKey="pct" radius={[6, 6, 0, 0]}>
                  {riskDistData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Project State distribution */}
      <div className="glass-panel p-6 mb-6">
        <h3 className="font-bold text-slate-700 text-sm tracking-wide uppercase mb-6">Project State Distribution (Top Priorities)</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stateData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '13px', background: '#fff', color: '#1e293b', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}
              />
              <Bar dataKey="value" name="Projects" radius={[6, 6, 0, 0]}>
                {stateData.map((_, index) => (
                  <Cell key={index} fill={STATE_COLORS[index % STATE_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-center">
        <p className="text-xs font-bold text-amber-700 uppercase tracking-widest">
          ⚠ Synthetic Data — Not Official PAIMANA/MoSPI Data
        </p>
      </div>
    </PageContainer>
  )
}
