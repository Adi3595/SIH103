import { motion } from 'framer-motion'
import { BrainCircuit, FlaskConical, Cpu, Layers } from 'lucide-react'
import PageContainer from '../components/layout/PageContainer'

const features = [
  {
    icon: BrainCircuit,
    title: 'RAG-Powered Document Analysis',
    status: 'PLANNED',
    description: 'Natural language querying over source project documents, DPRs, and CAG reports using a vector retrieval system.',
    color: '#264653',
  },
  {
    icon: Cpu,
    title: 'Prescriptive AI Recommendations',
    status: 'PLANNED',
    description: 'LLM-generated actionable prescriptions for each at-risk project based on its historical fingerprint and peer comparisons.',
    color: '#2a9d8f',
  },
  {
    icon: FlaskConical,
    title: 'Predictive Failure Modelling',
    status: 'PLANNED',
    description: 'ML-based classification to predict which projects will fail to complete on time or within budget in the next 6 months.',
    color: '#f4a261',
  },
  {
    icon: Layers,
    title: 'Sector Benchmarking',
    status: 'PLANNED',
    description: 'Cross-sector comparative intelligence showing which ministries and sectors consistently underperform against targets.',
    color: '#e76f51',
  },
]

export default function Intelligence() {
  return (
    <PageContainer>
      <div className="mb-8">
        <h1 className="text-xs font-bold text-muted uppercase tracking-widest mb-1">Phase 5 — AI Layer</h1>
        <h2 className="text-3xl font-black text-navy tracking-tight flex items-center gap-3">
          RISK INTELLIGENCE
          <BrainCircuit size={24} className="text-teal" />
        </h2>
      </div>

      <div className="bg-teal/5 border border-teal/20 rounded-xl p-5 mb-10 flex items-start gap-3">
        <BrainCircuit size={18} className="text-teal shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-navy mb-0.5">LLM/RAG Layer — Coming in Phase 5</p>
          <p className="text-xs text-muted leading-relaxed">
            The Risk Intelligence module will integrate a Large Language Model with Retrieval-Augmented Generation (RAG) over official project documents. This phase is <strong>pending after the Risk Engine (Phase 4) is fully validated</strong>. The capabilities listed below represent the planned architecture.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((f, i) => {
          const Icon = f.icon
          return (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-surface border border-border rounded-xl p-6 relative overflow-hidden hover:shadow-elevated transition-all"
            >
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] opacity-10 pointer-events-none"
                style={{ backgroundColor: f.color }} />

              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 rounded-lg border" style={{ backgroundColor: `${f.color}10`, borderColor: `${f.color}20` }}>
                  <Icon size={22} style={{ color: f.color }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-navy text-sm">{f.title}</h3>
                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border bg-slate-50 text-muted border-border">
                      {f.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted leading-relaxed">{f.description}</p>
                </div>
              </div>

              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full w-[15%] rounded-full opacity-50" style={{ backgroundColor: f.color }} />
              </div>
              <div className="text-[10px] text-muted font-semibold mt-1.5 text-right">Phase 5 — 15% complete</div>
            </motion.div>
          )
        })}
      </div>
    </PageContainer>
  )
}
