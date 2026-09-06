import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import axios from 'axios'
import { ArrowLeft, Building2, MapPin, Activity, Calendar } from 'lucide-react'
import PageContainer from '../components/layout/PageContainer'
import DigitalFingerprint from '../components/risk/DigitalFingerprint'
import ProjectTimeline from '../components/charts/ProjectTimeline'
import RiskDrivers from '../components/risk/RiskDrivers'
import RiskBadge from '../components/risk/RiskBadge'
import ProjectStateBadge from '../components/risk/ProjectStateBadge'
import MomentumPanel from '../components/risk/MomentumPanel'
import HistoricalAnalogues from '../components/risk/HistoricalAnalogues'
import AIAdvisor from '../components/risk/AIAdvisor'
import PredictiveML from '../components/risk/PredictiveML'
import { SkeletonCard } from '../components/ui/SkeletonLoader'
import ErrorState from '../components/ui/ErrorState'

export default function ProjectDetail() {
  const { id } = useParams()
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/projects/" + id).then(res => {
      setProject(res.data)
      setLoading(false)
    }).catch(() => {
      setLoading(false)
      setError(true)
    })
  }, [id])

  if (loading) {
    return (
      <PageContainer>
        <div className="h-[60vh]">
          <SkeletonCard />
        </div>
      </PageContainer>
    )
  }

  if (error || !project) {
    return (
      <PageContainer>
        <ErrorState onRetry={() => window.location.reload()} />
      </PageContainer>
    )
  }

  const getHeaderTheme = () => {
    switch(project.risk_level) {
      case 'CRITICAL': return { bg: 'bg-coral-50', border: 'border-coral/20', text: 'text-coral-700' }
      case 'HIGH': return { bg: 'bg-orange-50', border: 'border-orange/20', text: 'text-orange-700' }
      case 'MEDIUM': return { bg: 'bg-amber-50', border: 'border-amber/20', text: 'text-amber-700' }
      default: return { bg: 'bg-teal-50', border: 'border-teal/20', text: 'text-teal-700' }
    }
  }

  const theme = getHeaderTheme()

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  }

  return (
    <PageContainer>
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
        
        {/* Header Section */}
        <motion.div variants={itemVariants} className={"glass-panel overflow-hidden " + theme.border}>
          <div className={"p-8 " + theme.bg}>
            <div className="flex items-start justify-between">
              <div>
                <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-4 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                  <ArrowLeft size={16} /> BACK TO COMMAND CENTER
                </Link>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                    {project.project_name}
                  </h1>
                  <RiskBadge level={project.risk_level} className="scale-110 ml-2 shadow-sm" />
                  <ProjectStateBadge state={project.project_state} className="scale-110 shadow-sm" />
                </div>
                <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
                  <span className="font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-sm">{project.project_id}</span>
                  <span className="flex items-center gap-1.5"><Building2 size={14}/> {project.agency}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                  <span className="flex items-center gap-1.5"><MapPin size={14}/> {project.state}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                  <span>{project.sector}</span>
                </div>
              </div>
              
              {/* Risk Score Highlight */}
              <div className={"px-6 py-4 rounded-2xl flex flex-col items-end border shadow-sm bg-white " + theme.border}>
                <div className={"text-[10px] font-bold uppercase tracking-widest mb-1 " + theme.text}>Overall Risk Score</div>
                <div className="flex items-baseline gap-2">
                  <div className={"text-5xl font-black tabular-nums " + theme.text}>
                    {project.risk_score}
                  </div>
                  <div className="text-sm font-bold text-slate-400">/ 10</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Stats Bar */}
          <div className="bg-white/60 border-t border-slate-100 px-8 py-4 grid grid-cols-4 gap-6 backdrop-blur-md">
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Cost</div>
              <div className="text-lg font-black text-slate-800 tabular-nums">?{project.revised_cost_cr} Cr</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Completion Target</div>
              <div className="text-lg font-black text-slate-800 tabular-nums flex items-center gap-1.5"><Calendar size={14} className="text-slate-400"/> {project.revised_end_date}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Project Type</div>
              <div className="text-lg font-black text-slate-800">{project.project_type}</div>
            </div>
          </div>
        </motion.div>

        {/* AI Advisor - Prescriptive Intelligence */}
        <motion.div variants={itemVariants}>
          <AIAdvisor projectId={id!} />
        </motion.div>

        {/* Predictive ML Models */}
        <motion.div variants={itemVariants}>
          <PredictiveML projectId={id!} />
        </motion.div>

        {/* Digital Fingerprint & Timeline */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 relative">
            <DigitalFingerprint fingerprint={project.fingerprint} />
          </div>
          <div className="lg:col-span-2 relative glass-panel p-6">
            <ProjectTimeline />
          </div>
        </motion.div>

        {/* Momentum + Historical Analogues */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="relative">
            <MomentumPanel projectId={id!} />
          </div>
          <div className="relative">
            <HistoricalAnalogues projectId={id!} />
          </div>
        </motion.div>

        {/* Risk Drivers */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          <div>
            <RiskDrivers />
          </div>
        </motion.div>

      </motion.div>
    </PageContainer>
  )
}
