import { 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Bar
} from 'recharts'

export interface FingerprintHistoryData {
  reporting_date: string
  progress_health: number
  financial_health: number
  schedule_health: number
  milestone_health: number
  issue_pressure: number
  risk_score: number
  risk_level: string
}

interface ProjectTimelineProps {
  data: FingerprintHistoryData[]
}

export default function ProjectTimeline({ data }: ProjectTimelineProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-surface backdrop-blur-md rounded-xl border border-slate-700/50 p-6 shadow-sm h-full flex items-center justify-center">
        <div className="text-slate-400 animate-pulse">Loading fingerprint trajectory...</div>
      </div>
    )
  }

  // Format dates for display
  const chartData = data.map((d, i) => {
    // D02 snapshots are typically monthly, let's just format the date to 'MMM YY'
    const date = new Date(d.reporting_date)
    const formattedDate = !isNaN(date.getTime()) 
      ? date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
      : `M${i+1}`
      
    return {
      ...d,
      displayDate: formattedDate
    }
  })

  return (
    <div className="bg-surface backdrop-blur-md rounded-xl border border-slate-700/50 p-6 shadow-sm h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-slate-100 tracking-wide">FINGERPRINT EVOLUTION (24 MONTHS)</h3>
      </div>
      
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis 
              dataKey="displayDate" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: 'var(--text-slate-400)' }}
              dy={10}
              minTickGap={20}
            />
            <YAxis 
              yAxisId="left" 
              domain={[0, 100]}
              axisLine={false} 
              tickLine={false}
              tick={{ fontSize: 11, fill: 'var(--text-slate-400)' }}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              domain={[0, 100]}
              axisLine={false} 
              tickLine={false}
              tick={{ fontSize: 11, fill: 'var(--text-slate-400)' }}
            />
            <Tooltip
              contentStyle={{ 
                backgroundColor: 'var(--surface)', 
                border: '1px solid var(--border)',
                borderRadius: '8px',
                boxShadow: 'var(--tw-shadow-elevated)',
                fontSize: '13px'
              }}
              labelStyle={{ fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '8px' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
            
            <Bar 
              yAxisId="right"
              dataKey="risk_score" 
              name="Composite Risk"
              fill="#e2e8f0"
              opacity={0.6}
              radius={[4, 4, 0, 0]}
            />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="progress_health" 
              name="Progress Health"
              stroke="#2a9d8f" 
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6 }}
            />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="financial_health" 
              name="Financial Health"
              stroke="#e9c46a" 
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6 }}
            />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="schedule_health" 
              name="Schedule Health"
              stroke="#f4a261" 
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="milestone_health" 
              name="Milestone Health"
              stroke="#e76f51" 
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
              activeDot={{ r: 4 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
