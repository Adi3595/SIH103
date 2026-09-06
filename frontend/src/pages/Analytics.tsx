import { useEffect, useState } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'
import { BarChart3 } from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts'
import PageContainer from '../components/layout/PageContainer'

interface SummaryData {
  total_projects: number
  low_risk: number
  medium_risk: number
  high_risk: number
  critical_risk: number
  rising_risk: number
  top_priorities: any[]
}

const COLORS = ['#2a9d8f', '#e9c46a', '#f4a261', '#e76f51']
const RISK_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

export default function Analytics() {
  const [data, setData] = useState<SummaryData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/dashboard/summary')
      .then(res => { setData(res.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading || !data) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-48 text-muted">Loading analytics...</div>
      </PageContainer>
    )
  }

  const riskDistData = [
    { name: 'LOW', value: data.low_risk, color: '#2a9d8f' },
    { name: 'MEDIUM', value: data.medium_risk, color: '#e9c46a' },
    { name: 'HIGH', value: data.high_risk, color: '#f4a261' },
    { name: 'CRITICAL', value: data.critical_risk, color: '#e76f51' },
  ]

  const riskBarData = riskDistData.map(d => ({ ...d, pct: ((d.value / data.total_projects) * 100).toFixed(1) }))

  // Score distribution buckets from top_priorities
  const scoreBuckets = [
    { range: '0–20', count: 0 },
    { range: '21–40', count: 0 },
    { range: '41–60', count: 0 },
    { range: '61–80', count: 0 },
    { range: '81–100', count: 0 },
  ]
  data.top_priorities.forEach(p => {
    const s = p.risk_score
    if (s <= 20) scoreBuckets[0].count++
    else if (s <= 40) scoreBuckets[1].count++
    else if (s <= 60) scoreBuckets[2].count++
    else if (s <= 80) scoreBuckets[3].count++
    else scoreBuckets[4].count++
  })

  // State breakdown
  const stateCounts: Record<string, number> = {}
  data.top_priorities.forEach(p => {
    stateCounts[p.project_state] = (stateCounts[p.project_state] || 0) + 1
  })
  const stateData = Object.entries(stateCounts).map(([name, value]) => ({ name, value }))

  return (
    <PageContainer>
      <div className="mb-8">
        <h1 className="text-xs font-bold text-muted uppercase tracking-widest mb-1">Portfolio Intelligence</h1>
        <h2 className="text-3xl font-black text-navy tracking-tight flex items-center gap-3">
          ANALYTICS
          <BarChart3 size={24} className="text-teal" />
        </h2>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {riskDistData.map((d, i) => (
          <motion.div
            key={d.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-surface border border-border rounded-xl p-5 relative overflow-hidden"
          >
            <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: d.color }} />
            <div className="text-xs font-bold text-muted uppercase tracking-widest mb-2">{d.name} RISK</div>
            <div className="text-4xl font-black" style={{ color: d.color }}>{d.value}</div>
            <div className="text-xs text-muted mt-1">{((d.value / data.total_projects) * 100).toFixed(1)}% of portfolio</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Risk Distribution Pie */}
        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-navy tracking-wide mb-6">RISK LEVEL DISTRIBUTION</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={riskDistData} innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value" stroke="none">
                  {riskDistData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }} />
                <Legend wrapperStyle={{ fontSize: '13px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk bar % */}
        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-navy tracking-wide mb-6">PORTFOLIO RISK BREAKDOWN (%)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskBarData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} unit="%" />
                <Tooltip formatter={(v: any) => [`${v}%`, 'Share']} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }} />
                <Bar dataKey="pct" radius={[4, 4, 0, 0]}>
                  {riskBarData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Project State Distribution */}
      <div className="bg-surface border border-border rounded-xl p-6 shadow-sm mb-8">
        <h3 className="font-bold text-navy tracking-wide mb-6">PROJECT STATE DISTRIBUTION (TOP PRIORITIES)</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stateData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }} />
              <Bar dataKey="value" name="Projects" fill="#264653" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-navy/5 border border-navy/10 rounded-xl p-5 text-center">
        <p className="text-xs font-bold text-muted uppercase tracking-widest">
          ⚠ SYNTHETIC DATA — NOT OFFICIAL PAIMANA/MoSPI DATA
        </p>
      </div>
    </PageContainer>
  )
}
