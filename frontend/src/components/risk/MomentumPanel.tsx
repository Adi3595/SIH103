import { useEffect, useState } from 'react'
import axios from 'axios'
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Zap, Activity } from 'lucide-react'
import API_BASE from '../../config/api'

export default function MomentumPanel({ projectId }: { projectId: string }) {
  const [report, setReport] = useState<any>(null)
  
  useEffect(() => {
    axios.get(`${API_BASE}/api/projects/` + projectId + "/momentum")
      .then(res => setReport(res.data))
      .catch(() => {})
  }, [projectId])

  if (!report) return (
    <div className="glass-panel p-6 flex items-center gap-3">
      <Activity size={16} className="text-teal animate-spin" />
      <span className="text-slate-500 text-sm">Computing momentum...</span>
    </div>
  )

  const cls = report.overall_classification
  const scoreChange = report.overall_momentum
  const MomentumIcon = scoreChange > 0 ? TrendingUp : scoreChange < 0 ? TrendingDown : Minus

  const getLightColor = (hex: string) => {
    if (hex === '#e76f51') return '#be123c' 
    if (hex === '#f4a261') return '#c2410c' 
    if (hex === '#e9c46a') return '#b45309' 
    if (hex === '#2a9d8f') return '#0f766e' 
    if (hex === '#94a3b8') return '#475569' 
    return hex
  }
  
  const mainColor = getLightColor(cls.color)

  return (
    <div className="glass-panel overflow-hidden h-full">
      <div className="absolute top-0 left-6 right-6 h-1 rounded-b-md" style={{ backgroundColor: mainColor, opacity: 0.8 }} />
      
      <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100 bg-white/40">
        <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">
          Risk Momentum ({report.window_months}mo)
        </h3>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-white shadow-sm border"
          style={{ color: mainColor, borderColor: mainColor + '40' }}>
          {cls.label === 'ACCELERATING' && <Zap size={10} />}
          {cls.label}
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-100">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Score ?</div>
            <div className="flex items-center gap-2">
              <MomentumIcon size={18} style={{ color: mainColor }} />
              <span className="text-3xl font-black tabular-nums" style={{ color: mainColor }}>
                {scoreChange > 0 ? '+' : ''}{scoreChange}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Verdict</div>
            <div className="text-xs text-slate-600 font-medium max-w-[160px]">{cls.description}</div>
          </div>
        </div>
        
        {report.concerns.length > 0 && (
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Active Concerns</div>
            <div className="space-y-2">
              {report.concerns.map((c: any) => (
                <div key={c.dimension} className="flex items-center justify-between px-4 py-3 rounded-xl bg-white border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={14} className="text-coral-700" />
                    <span className="text-xs font-bold text-slate-700">{c.label} Health</span>
                  </div>
                  <span className="text-xs font-black text-coral-700 tabular-nums bg-coral/10 px-2 py-1 rounded-md">
                    {c.delta.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
