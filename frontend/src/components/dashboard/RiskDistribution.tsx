import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

const COLORS = {
  LOW: '#2a9d8f',
  MEDIUM: '#e9c46a',
  HIGH: '#f4a261',
  CRITICAL: '#e76f51',
}

interface RiskDistributionProps {
  data: {
    low: number
    medium: number
    high: number
    critical: number
  }
  total: number
}

export default function RiskDistribution({ data, total }: RiskDistributionProps) {
  const chartData = [
    { name: 'LOW', value: data.low },
    { name: 'MEDIUM', value: data.medium },
    { name: 'HIGH', value: data.high },
    { name: 'CRITICAL', value: data.critical },
  ]

  return (
    <div className="bg-surface rounded-xl border border-border p-5 shadow-sm h-full flex flex-col">
      <h3 className="font-bold text-navy tracking-wide mb-4">PORTFOLIO RISK DISTRIBUTION</h3>
      
      <div className="flex-1 relative min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              innerRadius={70}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
              isAnimationActive={true}
              animationDuration={800}
              animationEasing="ease-out"
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[entry.name as keyof typeof COLORS]} 
                  className="hover:opacity-80 transition-opacity cursor-pointer outline-none"
                />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--surface)', 
                border: '1px solid var(--border)',
                borderRadius: '8px',
                boxShadow: 'var(--tw-shadow-elevated)',
                fontWeight: 'bold',
                fontFamily: 'var(--font-sans)',
              }}
              itemStyle={{ color: 'var(--text-main)' }}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-4xl font-black text-navy">{total}</span>
          <span className="text-xs font-bold text-muted uppercase tracking-widest mt-1">Projects</span>
        </div>
      </div>
    </div>
  )
}
