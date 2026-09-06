import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import axios from 'axios'
import {
  ArrowLeft, Building2, MapPin, Calendar, DollarSign,
  TrendingUp, AlertTriangle, CheckCircle2, Clock,
  Layers, Target, BarChart2, Fingerprint, Sparkles, Zap
} from 'lucide-react'
import PageContainer from '../components/layout/PageContainer'
import ProjectTimeline from '../components/charts/ProjectTimeline'
import RiskBadge from '../components/risk/RiskBadge'
import ProjectStateBadge from '../components/risk/ProjectStateBadge'
import MomentumPanel from '../components/risk/MomentumPanel'
import HistoricalAnalogues from '../components/risk/HistoricalAnalogues'
import AIAdvisor from '../components/risk/AIAdvisor'
import PredictiveML from '../components/risk/PredictiveML'
import ProjectChat from '../components/risk/ProjectChat'
import { SkeletonCard } from '../components/ui/SkeletonLoader'
import ErrorState from '../components/ui/ErrorState'

// ── helpers ─────────────────────────────────────────────────────────────────
function fmt(n: number | undefined | null, unit = 'Cr') {
  if (n == null) return '—'
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K ${unit}`
  return `₹${n.toFixed(0)} ${unit}`
}
function fmtDate(d: string | null | undefined) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}
function daysFromNow(d: string | null | undefined): { label: string; overdue: boolean } {
  if (!d) return { label: '—', overdue: false }
  const diff = Math.round((new Date(d).getTime() - Date.now()) / 86400000)
  if (diff < 0) return { label: `${Math.abs(diff)}d overdue`, overdue: true }
  return { label: `${diff}d remaining`, overdue: false }
}
function healthColor(v: number) {
  if (v < 40) return { fill: '#be123c', bg: '#ffe4e6', text: 'text-rose-700' }
  if (v < 70) return { fill: '#b45309', bg: '#fef3c7', text: 'text-amber-700' }
  return { fill: '#0f766e', bg: '#ccfbf1', text: 'text-teal-700' }
}
function riskTheme(level: string) {
  switch (level) {
    case 'CRITICAL': return { bar: 'from-rose-500 to-red-600', glow: 'shadow-rose-200', badge: 'bg-rose-50 border-rose-200 text-rose-700', accent: '#be123c' }
    case 'HIGH':     return { bar: 'from-orange-400 to-amber-500', glow: 'shadow-amber-200', badge: 'bg-amber-50 border-amber-200 text-amber-700', accent: '#b45309' }
    case 'MEDIUM':   return { bar: 'from-yellow-400 to-amber-400', glow: 'shadow-yellow-200', badge: 'bg-yellow-50 border-yellow-200 text-yellow-700', accent: '#a16207' }
    default:         return { bar: 'from-teal-400 to-teal-600', glow: 'shadow-teal-200', badge: 'bg-teal-50 border-teal-200 text-teal-700', accent: '#0f766e' }
  }
}

// ── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, accent = false, warning = false }: any) {
  return (
    <div className={`glass-panel px-5 py-4 flex items-start gap-3.5 ${accent ? 'border-teal-200/60' : ''} ${warning ? 'border-rose-200/60' : ''}`}>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${warning ? 'bg-rose-100 text-rose-600' : accent ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-600'}`}>
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
        <p className={`text-base font-black mt-0.5 truncate ${warning ? 'text-rose-700' : 'text-slate-800'}`}>{value}</p>
        {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

// ── Health dimension bar ─────────────────────────────────────────────────────
function DimBar({ label, val, delay = 0 }: { label: string; val: number; delay?: number }) {
  const c = healthColor(val)
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">{label}</span>
        <span className="text-xs font-black tabular-nums" style={{ color: c.fill }}>{val?.toFixed(0) ?? '—'}%</span>
      </div>
      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }} animate={{ width: `${val}%` }}
          transition={{ duration: 0.9, delay, ease: 'easeOut' }}
          className="h-full rounded-full" style={{ backgroundColor: c.fill }}
        />
      </div>
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────
export default function ProjectDetail() {
  const { id } = useParams()
  const [project, setProject] = useState<any>(null)
  const [fp, setFp]           = useState<any>(null)   // fingerprint
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(false)

  useEffect(() => {
    setLoading(true); setError(false)
    Promise.all([
      axios.get(`http://127.0.0.1:8000/api/projects/${id}`),
      axios.get(`http://127.0.0.1:8000/api/projects/${id}/fingerprint`),
    ]).then(([p, f]) => {
      setProject(p.data)
      setFp(f.data)
      setLoading(false)
    }).catch(() => { setLoading(false); setError(true) })
  }, [id])

  if (loading) return (
    <PageContainer>
      <div className="space-y-6">
        <SkeletonCard />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <SkeletonCard />
      </div>
    </PageContainer>
  )

  if (error || !project) return (
    <PageContainer>
      <ErrorState onRetry={() => window.location.reload()} />
    </PageContainer>
  )

  const theme = riskTheme(fp?.risk_level ?? 'LOW')
  const deadline = daysFromNow(project.revised_end_date)
  const costOverrun = project.revised_cost_cr && project.original_cost_cr
    ? ((project.revised_cost_cr - project.original_cost_cr) / project.original_cost_cr * 100).toFixed(1)
    : null

  const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } }
  const item    = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } }

  return (
    <PageContainer>
      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-5 pb-24">

        {/* ── HERO HEADER ─────────────────────────────────────────────────── */}
        <motion.div variants={item} className="glass-panel overflow-hidden">
          {/* Top gradient accent strip */}
          <div className={`h-1.5 w-full bg-gradient-to-r ${theme.bar}`} />

          <div className="p-6 sm:p-8">
            {/* Back link */}
            <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-teal-700 transition-colors mb-5 bg-slate-100 hover:bg-teal-50 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-teal-200">
              <ArrowLeft size={13} /> BACK TO COMMAND CENTER
            </Link>

            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              {/* Left: name + meta */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2.5 mb-3">
                  <RiskBadge level={fp?.risk_level ?? 'LOW'} />
                  <ProjectStateBadge state={fp?.project_state ?? project.project_type} />
                  <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {project.internal_project_id}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight leading-tight mb-3">
                  {project.project_name}
                </h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
                  <span className="flex items-center gap-1.5 font-semibold"><Building2 size={13} className="text-slate-400" />{project.ministry ?? '—'}</span>
                  <span className="hidden sm:block w-px h-4 bg-slate-200" />
                  <span className="flex items-center gap-1.5"><MapPin size={13} className="text-slate-400" />{project.state ?? '—'}</span>
                  <span className="hidden sm:block w-px h-4 bg-slate-200" />
                  <span className="flex items-center gap-1.5"><Layers size={13} className="text-slate-400" />{project.sector ?? '—'}</span>
                  <span className="hidden sm:block w-px h-4 bg-slate-200" />
                  <span className="flex items-center gap-1.5"><Target size={13} className="text-slate-400" />{project.project_type ?? '—'}</span>
                </div>
              </div>

              {/* Right: Risk Score dial */}
              {fp && (
                <div className={`shrink-0 bg-white rounded-2xl border px-7 py-5 text-center shadow-md ${theme.glow} border-slate-200`}>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Risk Score</p>
                  <p className={`text-6xl font-black tabular-nums leading-none`} style={{ color: theme.accent }}>
                    {fp.risk_score?.toFixed(1)}
                  </p>
                  <p className="text-xs text-slate-400 font-semibold mt-1">out of 10.0</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── STAT CARDS GRID ──────────────────────────────────────────────── */}
        <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatCard icon={DollarSign} label="Original Budget"
            value={fmt(project.original_cost_cr)} sub="Approved cost" />
          <StatCard icon={TrendingUp} label="Revised Budget"
            value={fmt(project.revised_cost_cr)}
            sub={costOverrun ? `+${costOverrun}% from original` : undefined}
            warning={!!costOverrun && parseFloat(costOverrun) > 10} />
          <StatCard icon={Calendar} label="Original Deadline"
            value={fmtDate(project.original_end_date)} sub="Initial target" />
          <StatCard icon={Clock} label="Revised Deadline"
            value={fmtDate(project.revised_end_date)}
            sub={deadline.label} warning={deadline.overdue} />
          <StatCard icon={Calendar} label="Project Start"
            value={fmtDate(project.start_date)} sub={`Approved: ${fmtDate(project.approval_date)}`} />
        </motion.div>

        {/* ── DIGITAL FINGERPRINT + AI ADVISOR ────────────────────────────── */}
        <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Digital Fingerprint panel */}
          {fp && (
            <div className="lg:col-span-2 glass-panel overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-teal-50/60 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-teal-100 flex items-center justify-center text-teal-700 border border-teal-200">
                  <Fingerprint size={15} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">Digital Fingerprint</h3>
                  <p className="text-[10px] text-teal-700 font-bold uppercase tracking-widest">Layer 01 · Health Dimensions</p>
                </div>
              </div>
              <div className="p-5 space-y-5">
                <DimBar label="Progress Health"   val={fp.progress_health}   delay={0} />
                <DimBar label="Financial Health"  val={fp.financial_health}  delay={0.1} />
                <DimBar label="Schedule Health"   val={fp.schedule_health}   delay={0.2} />
                <DimBar label="Milestone Health"  val={fp.milestone_health}  delay={0.3} />

                <div className="pt-4 border-t border-slate-100">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Issue Pressure</p>
                  <div className="flex items-center gap-3">
                    <div className="h-2.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }} animate={{ width: `${(fp.issue_pressure / 10) * 100}%` }}
                        transition={{ duration: 0.9, delay: 0.4 }}
                        className="h-full rounded-full bg-gradient-to-r from-amber-400 to-rose-500"
                      />
                    </div>
                    <span className="text-sm font-black text-slate-700 tabular-nums w-10 text-right">{fp.issue_pressure?.toFixed(1)}/10</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  {[
                    { label: 'Risk Momentum', val: fp.risk_momentum?.toFixed(2) },
                    { label: 'Reporting Date', val: fp.reporting_date ? new Date(fp.reporting_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—' },
                  ].map(m => (
                    <div key={m.label} className="bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{m.label}</p>
                      <p className="text-sm font-black text-slate-700 mt-0.5">{m.val}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* AI Advisor */}
          <div className="lg:col-span-3">
            <AIAdvisor projectId={id!} />
          </div>
        </motion.div>

        {/* ── PREDICTIVE ML ─────────────────────────────────────────────────── */}
        <motion.div variants={item}>
          <PredictiveML projectId={id!} />
        </motion.div>

        {/* ── MOMENTUM + ANALOGUES ─────────────────────────────────────────── */}
        <motion.div variants={item} className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <MomentumPanel projectId={id!} />
          <HistoricalAnalogues projectId={id!} />
        </motion.div>

        {/* ── TIMELINE ─────────────────────────────────────────────────────── */}
        <motion.div variants={item} className="glass-panel p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
              <BarChart2 size={15} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">Project Timeline</h3>
              <p className="text-[10px] text-purple-700 font-bold uppercase tracking-widest">Risk Score Trend · Last 24 Months</p>
            </div>
          </div>
          <ProjectTimeline projectId={id!} />
        </motion.div>

        {/* ── PROJECT METADATA TABLE ────────────────────────────────────────── */}
        <motion.div variants={item} className="glass-panel overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
              <Zap size={15} />
            </div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">Full Project Record</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {[
              ['Project ID', project.internal_project_id],
              ['Project Code', project.project_code ?? '—'],
              ['OCMS Code', project.legacy_ocms_code ?? '—'],
              ['PMGID', project.pmgid ?? '—'],
              ['Ministry', project.ministry ?? '—'],
              ['Agency / PMU', project.agency ?? '—'],
              ['Sector', project.sector ?? '—'],
              ['State', project.state ?? '—'],
              ['Project Type', project.project_type ?? '—'],
              ['Approval Date', fmtDate(project.approval_date)],
              ['Start Date', fmtDate(project.start_date)],
              ['Original End Date', fmtDate(project.original_end_date)],
              ['Revised End Date', fmtDate(project.revised_end_date)],
              ['Original Cost', fmt(project.original_cost_cr)],
              ['Revised Cost', fmt(project.revised_cost_cr)],
            ].map(([k, v]) => (
              <div key={k} className="grid grid-cols-2 sm:grid-cols-3 px-5 py-3 hover:bg-slate-50/80 transition-colors">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{k}</span>
                <span className="text-sm font-semibold text-slate-800 col-span-1 sm:col-span-2 font-mono">{v}</span>
              </div>
            ))}
          </div>
        </motion.div>

      </motion.div>

      {/* ── FLOATING CHAT ─────────────────────────────────────────────────── */}
      <ProjectChat projectId={id!} projectName={project.project_name} />
    </PageContainer>
  )
}
