import { useEffect, useState } from 'react'
import axios from 'axios'
import {
  Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ComposedChart, Bar, ReferenceLine
} from 'recharts'

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl shadow-xl px-4 py-3 text-xs min-w-[180px]">
      <p className="font-black text-slate-700 mb-2 border-b border-slate-100 pb-1.5">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex justify-between items-center gap-4 py-0.5">
          <span className="flex items-center gap-1.5 text-slate-500 font-semibold">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
            {p.name}
          </span>
          <span className="font-black tabular-nums" style={{ color: p.color }}>
            {p.dataKey === 'risk_score' ? `${p.value?.toFixed(1)}/10` : `${p.value?.toFixed(0)}%`}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function ProjectTimeline({ projectId }: { projectId?: string }) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!projectId) return
    axios.get(`http://127.0.0.1:8000/api/projects/${projectId}/fingerprint/history`)
      .then(res => {
        const raw = res.data as any[]
        const chartData = raw.map((d, i) => {
          const date = new Date(d.reporting_date)
          return {
            ...d,
            displayDate: !isNaN(date.getTime())
              ? date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })
              : `M${i + 1}`
          }
        })
        setData(chartData)
      })
      .finally(() => setLoading(false))
  }, [projectId])

  if (loading) return (
    <div className="h-[300px] flex items-center justify-center">
      <div className="w-6 h-6 border-3 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
    </div>
  )

  if (!data.length) return (
    <div className="h-[300px] flex items-center justify-center text-slate-400 text-sm">
      No historical data available.
    </div>
  )

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis
            dataKey="displayDate" axisLine={false} tickLine={false}
            tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
            dy={8} minTickGap={18}
          />
          <YAxis
            yAxisId="health" domain={[0, 100]} axisLine={false} tickLine={false}
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            tickFormatter={v => `${v}%`}
          />
          <YAxis
            yAxisId="risk" orientation="right" domain={[0, 10]} axisLine={false} tickLine={false}
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            tickFormatter={v => `${v}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: '16px', fontSize: '11px', fontWeight: 600 }} />
          <ReferenceLine yAxisId="health" y={40} stroke="#fda4af" strokeDasharray="4 4" strokeWidth={1.5} />

          <Bar yAxisId="risk" dataKey="risk_score" name="Risk Score" fill="#e0e7ff" opacity={0.7} radius={[3, 3, 0, 0]} />

          <Line yAxisId="health" type="monotone" dataKey="progress_health" name="Progress Health"
            stroke="#0d9488" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#0d9488' }} />
          <Line yAxisId="health" type="monotone" dataKey="financial_health" name="Financial Health"
            stroke="#d97706" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#d97706' }} />
          <Line yAxisId="health" type="monotone" dataKey="schedule_health" name="Schedule Health"
            stroke="#7c3aed" strokeWidth={2} strokeDasharray="5 3" dot={false} activeDot={{ r: 4 }} />
          <Line yAxisId="health" type="monotone" dataKey="milestone_health" name="Milestone Health"
            stroke="#db2777" strokeWidth={2} strokeDasharray="5 3" dot={false} activeDot={{ r: 4 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
