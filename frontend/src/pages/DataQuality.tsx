import { motion } from 'framer-motion'
import { Database, CheckCircle2, AlertTriangle, Clock } from 'lucide-react'
import PageContainer from '../components/layout/PageContainer'

const checks = [
  { label: 'Project Master Records', status: 'PASS', count: 750, icon: CheckCircle2, color: '#2a9d8f' },
  { label: 'Monthly Snapshots', status: 'PASS', count: 18000, icon: CheckCircle2, color: '#2a9d8f' },
  { label: 'Milestone Events', status: 'PASS', count: 6240, icon: CheckCircle2, color: '#2a9d8f' },
  { label: 'Issue Records', status: 'PASS', count: 9300, icon: CheckCircle2, color: '#2a9d8f' },
  { label: 'Missing Reporting Months', status: 'WARN', count: 142, icon: AlertTriangle, color: '#f4a261' },
  { label: 'Null Financial Fields', status: 'WARN', count: 87, icon: AlertTriangle, color: '#f4a261' },
  { label: 'Last Ingestion Run', status: 'INFO', count: null, note: 'Synthetic Dataset v1.0', icon: Clock, color: '#264653' },
]

export default function DataQuality() {
  return (
    <PageContainer>
      <div className="mb-8">
        <h1 className="text-xs font-bold text-muted uppercase tracking-widest mb-1">Data Integrity Monitor</h1>
        <h2 className="text-3xl font-black text-navy tracking-tight flex items-center gap-3">
          DATA QUALITY
          <Database size={24} className="text-teal" />
        </h2>
      </div>

      <div className="bg-yellow/10 border border-yellow/30 rounded-xl p-5 mb-8 flex items-start gap-3">
        <AlertTriangle size={18} className="text-yellow-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-navy mb-0.5">Synthetic Dataset Notice</p>
          <p className="text-xs text-muted">This system currently operates on <strong>SYNTHETIC DATA — NOT OFFICIAL PAIMANA/MoSPI DATA</strong>. The data quality checks below reflect the integrity of the generated dataset used for prototype validation.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {checks.map((c, i) => {
          const Icon = c.icon
          return (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-surface border border-border rounded-xl p-5 flex items-center gap-5 hover:shadow-soft transition-all"
            >
              <div className="p-3 rounded-lg" style={{ backgroundColor: `${c.color}15` }}>
                <Icon size={20} style={{ color: c.color }} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-navy mb-0.5">{c.label}</div>
                {c.note ? (
                  <div className="text-xs text-muted">{c.note}</div>
                ) : (
                  <div className="text-xs text-muted">{c.count?.toLocaleString()} records</div>
                )}
              </div>
              <div className="text-xs font-black uppercase tracking-widest px-2.5 py-1 rounded border"
                style={{ color: c.color, backgroundColor: `${c.color}10`, borderColor: `${c.color}30` }}>
                {c.status}
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
        <h3 className="font-bold text-navy tracking-wide mb-4">DATASET SUMMARY</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Projects', value: '750' },
            { label: 'Reporting Months', value: '24' },
            { label: 'Total Records', value: '18,000' },
            { label: 'Data Completeness', value: '98.7%' },
          ].map(item => (
            <div key={item.label} className="text-center">
              <div className="text-3xl font-black text-navy mb-1">{item.value}</div>
              <div className="text-xs text-muted font-semibold uppercase tracking-wider">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  )
}
