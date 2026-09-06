import { motion } from 'framer-motion'
import { Settings as SettingsIcon, Server, Shield, Bell, Palette, Info, Key } from 'lucide-react'
import PageContainer from '../components/layout/PageContainer'

const sections = [
  {
    icon: Server,
    title: 'Backend Configuration',
    color: '#0f766e',
    items: [
      { label: 'API Endpoint', value: 'http://127.0.0.1:8000', type: 'text' },
      { label: 'Database', value: 'SQLite — sih26103.db', type: 'readonly' },
      { label: 'Risk Engine', value: 'v1.0 — Hybrid Rule+ML', type: 'readonly' },
    ]
  },
  {
    icon: Key,
    title: 'AI Configuration',
    color: '#7c3aed',
    items: [
      { label: 'LLM Provider', value: 'OpenRouter (meta-llama/llama-3-8b-instruct:free)', type: 'readonly' },
      { label: 'API Key', value: 'Set in backend/.env → OPENROUTER_API_KEY', type: 'readonly' },
    ]
  },
  {
    icon: Bell,
    title: 'Alert Thresholds',
    color: '#c2410c',
    items: [
      { label: 'Critical Risk Score', value: '70', type: 'number' },
      { label: 'High Risk Score', value: '50', type: 'number' },
      { label: 'Rising Momentum Threshold', value: '5', type: 'number' },
    ]
  },
  {
    icon: Palette,
    title: 'Interface',
    color: '#b45309',
    items: [
      { label: 'Colour Palette', value: 'Milky Matte Light Mode', type: 'readonly' },
      { label: 'Font', value: 'Inter + JetBrains Mono', type: 'readonly' },
      { label: 'Theme', value: 'Glassmorphism (Light)', type: 'readonly' },
    ]
  },
]

export default function Settings() {
  return (
    <PageContainer>
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1.5 h-4 rounded-full bg-slate-400" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">System Configuration</span>
        </div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Settings</h1>
          <SettingsIcon size={22} className="text-slate-400" />
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-8 flex items-start gap-3">
        <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700 leading-relaxed">
          These settings control the behaviour of the PAIMANA prototype. In production, thresholds and AI configuration would be persisted to a config database and managed through a secure admin panel.
        </p>
      </div>

      <div className="space-y-5">
        {sections.map((section, si) => {
          const Icon = section.icon
          return (
            <motion.div key={section.title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: si * 0.08 }}
              className="glass-panel overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-white/40">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center border"
                  style={{ backgroundColor: `${section.color}10`, borderColor: `${section.color}20` }}>
                  <Icon size={15} style={{ color: section.color }} />
                </div>
                <h3 className="font-bold text-slate-700 tracking-wide text-sm uppercase">{section.title}</h3>
              </div>
              <div className="divide-y divide-slate-50">
                {section.items.map(item => (
                  <div key={item.label} className="px-6 py-4 flex items-center justify-between gap-8">
                    <label className="text-sm font-semibold text-slate-600 shrink-0">{item.label}</label>
                    {item.type === 'readonly' ? (
                      <span className="text-sm text-slate-500 font-mono bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-right">{item.value}</span>
                    ) : item.type === 'number' ? (
                      <input
                        type="number"
                        defaultValue={item.value}
                        className="w-28 text-sm text-right font-mono bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal-400 transition-all shadow-sm"
                      />
                    ) : (
                      <input
                        type="text"
                        defaultValue={item.value}
                        className="w-72 text-sm font-mono bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal-400 transition-all shadow-sm"
                      />
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="mt-8 flex justify-end">
        <button className="px-6 py-2.5 bg-teal-600 text-white text-sm font-bold rounded-xl hover:bg-teal-700 transition-colors flex items-center gap-2 shadow-sm hover:shadow-md">
          <Shield size={15} /> Save Configuration
        </button>
      </div>
    </PageContainer>
  )
}
