import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { ArrowLeft, TrendingUp } from 'lucide-react'
import PageContainer from '../components/layout/PageContainer'
import DigitalFingerprint from '../components/risk/DigitalFingerprint'
import ProjectTimeline from '../components/charts/ProjectTimeline'
import RiskDrivers from '../components/risk/RiskDrivers'
import RiskBadge from '../components/risk/RiskBadge'
import ProjectStateBadge from '../components/risk/ProjectStateBadge'

interface Project {
  internal_project_id: string
  project_name: string
  ministry: string
  sector: string
}

interface Fingerprint {
  project_id: string
  reporting_date: string
  progress_health: number
  financial_health: number
  schedule_health: number
  milestone_health: number
  issue_pressure: number
  risk_score: number
  risk_momentum: number
  risk_level: string
  project_state: string
}

export default function ProjectDetail() {
  const { id } = useParams()
  const [project, setProject] = useState<Project | null>(null)
  const [fingerprint, setFingerprint] = useState<Fingerprint | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      axios.get(`http://127.0.0.1:8000/api/projects/${id}`),
      axios.get(`http://127.0.0.1:8000/api/projects/${id}/fingerprint`)
    ])
    .then(([resProj, resFinger]) => {
      setProject(resProj.data)
      setFingerprint(resFinger.data)
      setLoading(false)
    })
    .catch(err => {
      console.error(err)
      setLoading(false)
    })
  }, [id])

  if (loading || !project || !fingerprint) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-64 text-muted">
          Loading project dossier...
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-navy transition-colors">
          <ArrowLeft size={16} /> Back to Command Center
        </Link>
      </div>
      
      <div className="bg-surface rounded-xl border border-border p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center relative overflow-hidden mb-8">
        <div className="relative z-10 mb-6 md:mb-0">
          <h1 className="text-xs font-bold text-muted uppercase tracking-widest mb-2">PROJECT DOSSIER</h1>
          <h2 className="text-3xl font-black text-navy mb-4 tracking-tight">{project.project_name}</h2>
          <div className="flex flex-wrap gap-2">
            <span className="px-2.5 py-1 bg-slate-100 rounded text-xs font-bold text-slate-600 border border-slate-200 uppercase">
              ID: {project.internal_project_id}
            </span>
            <span className="px-2.5 py-1 bg-slate-100 rounded text-xs font-bold text-slate-600 border border-slate-200 uppercase">
              Ministry: {project.ministry}
            </span>
            <span className="px-2.5 py-1 bg-slate-100 rounded text-xs font-bold text-slate-600 border border-slate-200 uppercase">
              Sector: {project.sector}
            </span>
          </div>
        </div>
        
        <div className="relative z-10 text-left md:text-right bg-slate-50 p-6 rounded-xl border border-border min-w-[220px]">
          <div className="text-xs font-bold text-muted uppercase tracking-widest mb-1">Composite Risk Score</div>
          <div className={`text-6xl font-black tracking-tighter ${
            fingerprint.risk_level === 'HIGH' || fingerprint.risk_level === 'CRITICAL' ? 'text-coral' :
            fingerprint.risk_level === 'MEDIUM' ? 'text-yellow-600' : 'text-teal'
          }`}>
            {fingerprint.risk_score}
          </div>
          
          <div className="flex items-center justify-start md:justify-end gap-2 mt-3">
            <RiskBadge level={fingerprint.risk_level} />
          </div>
          
          <div className="mt-4 pt-4 border-t border-border flex items-center justify-start md:justify-end gap-3">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Momentum</span>
              <span className={`text-sm font-bold flex items-center gap-1 ${fingerprint.risk_momentum > 0 ? 'text-coral' : 'text-teal'}`}>
                {fingerprint.risk_momentum > 0 ? '+' : ''}{fingerprint.risk_momentum}
                {fingerprint.risk_momentum > 0 ? <TrendingUp size={14} /> : <TrendingUp size={14} className="rotate-180" />}
              </span>
            </div>
            <div className="w-px h-8 bg-border mx-1"></div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">State</span>
              <ProjectStateBadge state={fingerprint.project_state} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-1">
          <DigitalFingerprint data={fingerprint} />
        </div>
        <div className="lg:col-span-2">
          <ProjectTimeline data={[]} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
           <RiskDrivers />
        </div>
      </div>

    </PageContainer>
  )
}
