import { motion } from 'framer-motion'
import { BrainCircuit, FlaskConical, Cpu, Layers, CheckCircle2 } from 'lucide-react'
import PageContainer from '../components/layout/PageContainer'

const features = [
  {
    icon: BrainCircuit,
    title: 'RAG-Powered Document Analysis',
    status: 'PLANNED',
    statusColor: '#94a3b8',
    description: 'Natural language querying over source project documents, DPRs, and CAG reports using a vector retrieval system.',
    color: '#0f766e',
    progress: 5,
  },
  {
    icon: Cpu,
    title: 'Prescriptive AI Recommendations',
    status: 'LIVE',
    statusColor: '#0f766e',
    description: 'LLM-generated actionable prescriptions for each at-risk project based on its historical fingerprint, KNN analogues, and momentum data via OpenRouter.',
    color: '#2dd4bf',
    progress: 80,
  },
  {
    icon: FlaskConical,
    title: 'Predictive Failure Modelling',
    status: 'TRAINED',
    statusColor: '#b45309',
    description: 'Four Random Forest classifiers trained on 18,000 rows predict Cost Overrun, Schedule Delay, Milestone Failure and Escalation Risk.',
    color: '#b45309',
    progress: 70,
  },
  {
    icon: Layers,
    title: 'Sector Benchmarking',
    status: 'PLANNED',
    statusColor: '#94a3b8',
    description: 'Cross-sector comparative intelligence showing which ministries and sectors consistently underperform against portfolio targets.',
    color: '#c2410c',
    progress: 0,
  },
]

export default function Intelligence() {
  return (
    <PageContainer>
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1.5 h-4 rounded-full bg-teal-500" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Phase 5 — AI Layer</span>
        </div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Risk Intelligence</h1>
          <BrainCircuit size={22} className="text-teal-500" />
        </div>
        <p className="text-sm text-slate-500 mt-1">Intelligent layers powering predictive and prescriptive risk analysis.</p>
      </div>

      <div className="bg-teal-50 border border-teal-100 rounded-xl p-5 mb-8 flex items-start gap-3">
        <BrainCircuit size={18} className="text-teal-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-slate-700 mb-0.5">AI Engine Status</p>
          <p className="text-xs text-slate-500 leading-relaxed">
            Prescriptive Intelligence (Layer 04C) is now live via OpenRouter. Predictive models (Layer 04A) have been trained.
            Set your <code className="text-xs bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono">OPENROUTER_API_KEY</code> in the backend <code className="text-xs bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono">.env</code> file to activate LLM prescriptions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {features.map((f, i) => {
          const Icon = f.icon
          return (
            <motion.div key={f.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white border border-slate-100 rounded-2xl p-6 relative overflow-hidden shadow-sm hover:shadow-md transition-all group"
            >
              {/* Corner glow */}
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none"
                style={{ backgroundColor: f.color }} />

              <div className="flex items-start gap-4 mb-5">
                <div className="p-3 rounded-xl border" style={{ backgroundColor: `${f.color}10`, borderColor: `${f.color}20` }}>
                  <Icon size={22} style={{ color: f.color }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-bold text-slate-800 text-sm">{f.title}</h3>
                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border"
                      style={{ color: f.statusColor, backgroundColor: `${f.statusColor}10`, borderColor: `${f.statusColor}30` }}>
                      {f.status === 'LIVE' && <CheckCircle2 size={8} className="inline mr-0.5" />}
                      {f.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{f.description}</p>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  <span>Progress</span>
                  <span style={{ color: f.color }}>{f.progress}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${f.progress}%` }}
                    transition={{ duration: 1, delay: i * 0.1 + 0.3 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: f.color }}
                  />
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </PageContainer>
  )
}
