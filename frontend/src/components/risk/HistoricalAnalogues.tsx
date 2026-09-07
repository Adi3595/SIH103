import { useEffect, useState } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'
import { Network, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import RiskBadge from './RiskBadge'
import API_BASE from '../../config/api'

export default function HistoricalAnalogues({ projectId }: { projectId: string }) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get(`${API_BASE}/api/projects/` + projectId + "/analogues")
      .then(res => { setData(res.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [projectId])

  if (loading) {
    return (
      <div className="glass-panel p-6 flex flex-col items-center justify-center min-h-[250px]">
        <Network className="text-teal animate-pulse mb-3" size={24} />
        <span className="text-xs font-bold tracking-widest uppercase text-slate-400">Querying Vector Space...</span>
      </div>
    )
  }

  if (!data || data.analogues.length === 0) return null

  return (
    <div className="glass-panel overflow-hidden h-full flex flex-col">
      <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100 bg-white/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal/10 border border-teal/20 flex items-center justify-center text-teal-700">
            <Network size={18} />
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-800 tracking-widest uppercase">HISTORICAL ANALOGUES</h3>
            <p className="text-[9px] text-slate-400 uppercase tracking-widest mt-0.5">KNN Vector Search</p>
          </div>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col gap-4">
        {data.analogues.map((analogue: any, idx: number) => (
          <motion.div key={analogue.project_id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
            className="group relative rounded-xl p-4 bg-white border border-slate-100 hover:shadow-md transition-all duration-300">
            
            <div className="absolute -top-2.5 right-4 px-2 py-0.5 rounded border font-black text-[9px] flex items-center gap-1 bg-white shadow-sm"
              style={{
                borderColor: analogue.similarity_score > 90 ? '#99f6e4' : '#fde68a',
                color: analogue.similarity_score > 90 ? '#0f766e' : '#b45309',
              }}>
              <CheckCircle2 size={10} />
              {analogue.similarity_score}% MATCH
            </div>

            <div className="flex justify-between items-start mb-3">
              <div>
                <Link to={"/projects/" + analogue.project_id} className="font-mono font-bold text-slate-700 hover:text-teal-700 transition-colors text-sm flex items-center gap-2">
                  {analogue.project_id}
                  <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-teal-700" />
                </Link>
                <div className="text-[9px] text-slate-500 uppercase tracking-widest mt-1 line-clamp-1">{analogue.project_name}</div>
              </div>
              <RiskBadge level={analogue.risk_level} />
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="rounded-lg px-3 py-2 bg-slate-50 border border-slate-100">
                <div className="text-[9px] text-slate-400 uppercase tracking-widest mb-1">Sector</div>
                <div className="text-xs font-semibold text-slate-700">{analogue.sector}</div>
              </div>
              <div className="rounded-lg px-3 py-2 bg-slate-50 border border-slate-100">
                <div className="text-[9px] text-slate-400 uppercase tracking-widest mb-1">Base Cost</div>
                <div className="text-xs font-semibold text-slate-700 tabular-nums">?{analogue.original_cost_cr?.toFixed(1)} Cr</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
