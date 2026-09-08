import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import axios from "axios"
import { ShieldAlert, TrendingUp, AlertOctagon, CheckCircle2 } from "lucide-react"
import PageContainer from "../components/layout/PageContainer"
import KPIStatCard from "../components/dashboard/KPIStatCard"
import RiskDistribution from "../components/dashboard/RiskDistribution"
import PriorityTable from "../components/dashboard/PriorityTable"
import IntelligenceAlert from "../components/dashboard/IntelligenceAlert"
import { SkeletonCard } from "../components/ui/SkeletonLoader"
import ErrorState from "../components/ui/ErrorState"
import API_BASE from '../config/api'
import { useSEO } from "../hooks/useSEO"

export default function Dashboard() {
  useSEO({
    title: 'Dashboard Overview',
    description: 'Real-time oversight of national infrastructure projects.'
  })

  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    axios.get(`${API_BASE}/api/dashboard/summary`).then((res) => {
      setSummary(res.data)
      setLoading(false)
    }).catch(() => {
      setLoading(false)
      setError(true)
    })
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  }

  return (
    <PageContainer>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-text-primary tracking-tight mb-2">
          Portfolio Intelligence
        </h1>
        <p className="text-sm font-medium text-text-secondary">
          Real-time oversight of national infrastructure projects.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="h-32"><SkeletonCard /></div>
          <div className="h-32"><SkeletonCard /></div>
          <div className="h-32"><SkeletonCard /></div>
          <div className="h-32"><SkeletonCard /></div>
        </div>
      ) : error ? (
        <ErrorState onRetry={() => window.location.reload()} />
      ) : summary ? (
        <motion.div variants={containerVariants as any} initial="hidden" animate="show" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div variants={itemVariants as any}>
              <KPIStatCard title="Total Projects" value={summary.total_projects} subtitle="Active monitoring" icon={CheckCircle2} color="#0f766e" />
            </motion.div>
            <motion.div variants={itemVariants as any}>
              <KPIStatCard title="Critical Risk" value={summary.critical_risk} subtitle="Require immediate action" icon={AlertOctagon} color="#be123c" />
            </motion.div>
            <motion.div variants={itemVariants as any}>
              <KPIStatCard title="High Risk" value={summary.high_risk} subtitle="Nearing thresholds" icon={ShieldAlert} color="#c2410c" />
            </motion.div>
            <motion.div variants={itemVariants as any}>
              <KPIStatCard title="Rising Risk" value={summary.rising_risk} subtitle="Accelerating momentum" icon={TrendingUp} color="#b45309" />
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div variants={itemVariants as any} className="lg:col-span-2">
              <PriorityTable projects={summary.top_priorities} />
            </motion.div>
            <motion.div variants={itemVariants as any} className="space-y-6">
              <IntelligenceAlert project={summary.top_priorities[0]} />
              <div className="glass-panel p-6">
                <RiskDistribution 
                  total={summary.total_projects}
                  data={{
                    low: summary.low_risk,
                    medium: summary.medium_risk,
                    high: summary.high_risk,
                    critical: summary.critical_risk
                  }}
                />
              </div>
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </PageContainer>
  )
}
