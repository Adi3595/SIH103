import { useEffect, useState } from 'react'
import axios from 'axios'
import { FolderKanban, ShieldAlert, AlertTriangle, TrendingUp } from 'lucide-react'
import PageContainer from '../components/layout/PageContainer'
import KPIStatCard from '../components/dashboard/KPIStatCard'
import RiskDistribution from '../components/dashboard/RiskDistribution'
import IntelligenceAlert from '../components/dashboard/IntelligenceAlert'
import PriorityTable from '../components/dashboard/PriorityTable'

interface Fingerprint {
  project_id: string
  risk_score: number
  risk_momentum: number
  risk_level: string
  project_state: string
  progress_health: number
  financial_health: number
}

interface SummaryData {
  total_projects: number
  low_risk: number
  medium_risk: number
  high_risk: number
  critical_risk: number
  rising_risk: number
  top_priorities: Fingerprint[]
}

export default function Dashboard() {
  const [data, setData] = useState<SummaryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/dashboard/summary')
      .then(res => {
        setData(res.data)
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-64 text-muted animate-pulse">
          Loading intelligence...
        </div>
      </PageContainer>
    )
  }

  if (error || !data) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <div className="text-coral font-bold text-lg">⚠ Backend Unreachable</div>
          <p className="text-muted text-sm text-center max-w-md">
            Could not connect to <code className="bg-slate-100 px-1.5 py-0.5 rounded text-navy font-mono text-xs">http://127.0.0.1:8000</code>. 
            Please ensure the FastAPI server is running.
          </p>
          <button onClick={() => { setError(false); setLoading(true); axios.get('http://127.0.0.1:8000/api/dashboard/summary').then(res => { setData(res.data); setLoading(false) }).catch(() => { setError(true); setLoading(false) }) }} className="px-4 py-2 bg-navy text-white text-sm font-bold rounded-lg hover:bg-navy-light transition-colors">
            Retry Connection
          </button>
        </div>
      </PageContainer>
    )
  }

  const fastestDeteriorating = data.top_priorities.length > 0 ? data.top_priorities[0] : null
  const prioritiesQueue = data.top_priorities.slice(1, 10)

  return (
    <PageContainer>
      <div className="mb-8">
        <h1 className="text-sm font-bold text-muted uppercase tracking-widest mb-1">Portfolio Monitoring Overview</h1>
        <h2 className="text-3xl font-black text-navy tracking-tight">PROJECT INTELLIGENCE</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPIStatCard 
          title="Total Monitored" 
          value={data.total_projects} 
          icon={FolderKanban} 
        />
        <KPIStatCard 
          title="Critical Risk" 
          value={data.critical_risk} 
          icon={ShieldAlert}
          valueClassName="text-coral"
        />
        <KPIStatCard 
          title="High Risk" 
          value={data.high_risk} 
          icon={AlertTriangle}
          valueClassName="text-orange"
        />
        <KPIStatCard 
          title="Rising Risk" 
          value={data.rising_risk} 
          icon={TrendingUp}
          valueClassName="text-coral"
          trend="projects accelerating in risk"
          trendValue="Attention Needed"
          trendUp={true}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-1">
          <RiskDistribution 
            data={{
              low: data.low_risk,
              medium: data.medium_risk,
              high: data.high_risk,
              critical: data.critical_risk
            }}
            total={data.total_projects}
          />
        </div>
        <div className="lg:col-span-2">
          {fastestDeteriorating && <IntelligenceAlert project={fastestDeteriorating} />}
        </div>
      </div>

      <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <PriorityTable projects={prioritiesQueue} />
      </div>
    </PageContainer>
  )
}
