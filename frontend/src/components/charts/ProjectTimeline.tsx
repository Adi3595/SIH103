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

interface TimelineData {
  month: string
  planned_progress: number
  actual_progress: number
  expenditure: number
  risk_score: number
}

interface ProjectTimelineProps {
  data: TimelineData[]
}

export default function ProjectTimeline({ data }: ProjectTimelineProps) {
  // Mock data for the timeline if not provided from API yet
  const mockData = data?.length > 0 ? data : Array.from({ length: 12 }).map((_, i) => ({
    month: `Month ${i+1}`,
    planned_progress: Math.min(100, i * 8.3),
    actual_progress: Math.min(100, i * 6.5), // Falling behind
    expenditure: Math.min(100, i * 9.2), // Spending faster
    risk_score: 20 + (i * 4) // Risk rising
  }))

  return (
    <div className="bg-surface rounded-xl border border-border p-6 shadow-sm h-full">
      <h3 className="font-bold text-navy tracking-wide mb-6">PROJECT TRAJECTORY</h3>
      
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={mockData}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: 'var(--text-muted)' }}
              dy={10}
            />
            <YAxis 
              yAxisId="left" 
              axisLine={false} 
              tickLine={false}
              tick={{ fontSize: 12, fill: 'var(--text-muted)' }}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              axisLine={false} 
              tickLine={false}
              tick={{ fontSize: 12, fill: 'var(--text-muted)' }}
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
            <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '13px' }} />
            
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="planned_progress" 
              name="Planned Progress %"
              stroke="#cbd5e1" 
              strokeDasharray="5 5"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="actual_progress" 
              name="Actual Progress %"
              stroke="var(--color-primary)" 
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6 }}
            />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="expenditure" 
              name="Expenditure %"
              stroke="var(--color-secondary)" 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            />
            <Bar 
              yAxisId="right"
              dataKey="risk_score" 
              name="Risk Score"
              fill="var(--color-critical)"
              opacity={0.2}
              radius={[4, 4, 0, 0]}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
