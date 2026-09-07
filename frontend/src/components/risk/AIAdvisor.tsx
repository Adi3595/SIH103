import { useEffect, useState } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'
import { Sparkles, Bot } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import API_BASE from '../../config/api'

export default function AIAdvisor({ projectId }: { projectId: string }) {
  const [prescription, setPrescription] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get(`${API_BASE}/api/projects/` + projectId + "/prescription")
      .then(res => { setPrescription(res.data.prescription); setLoading(false) })
      .catch(() => {
        setPrescription("?? Failed to generate prescription.")
        setLoading(false)
      })
  }, [projectId])

  return (
    <div className="glass-panel overflow-hidden border border-teal/20 relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-teal/10 rounded-full blur-[80px] pointer-events-none" />
      
      <div className="px-6 py-4 flex items-center justify-between border-b border-teal/10 bg-teal/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal/20 flex items-center justify-center text-teal-700 shadow-sm">
            <Bot size={16} />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-800 tracking-wide">PAIMANA ADVISOR</h3>
            <p className="text-[10px] text-teal-700 uppercase tracking-widest mt-0.5 flex items-center gap-1">
              <Sparkles size={10} /> Prescriptive Intelligence (Layer 04C)
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 relative z-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 gap-4 opacity-70">
            <div className="w-10 h-10 border-4 border-teal/20 border-t-teal rounded-full animate-spin" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Synthesizing Risk Fingerprint...
            </span>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="prose prose-sm prose-slate max-w-none">
            <ReactMarkdown>{prescription}</ReactMarkdown>
          </motion.div>
        )}
      </div>
    </div>
  )
}
