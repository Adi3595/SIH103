import { motion } from 'framer-motion'
import { Settings as SettingsIcon, Server, Shield, Bell, Palette, Info } from 'lucide-react'
import PageContainer from '../components/layout/PageContainer'

const sections = [
  {
    icon: Server,
    title: 'Backend Configuration',
    items: [
      { label: 'API Endpoint', value: 'http://127.0.0.1:8000', type: 'text' },
      { label: 'Database', value: 'SQLite — sih26103.db', type: 'readonly' },
      { label: 'Risk Engine Version', value: 'v1.0 — Rule-Based', type: 'readonly' },
    ]
  },
  {
    icon: Bell,
    title: 'Alert Thresholds',
    items: [
      { label: 'Critical Risk Score', value: '70', type: 'number' },
      { label: 'High Risk Score', value: '50', type: 'number' },
      { label: 'Rising Momentum Threshold', value: '5', type: 'number' },
    ]
  },
  {
    icon: Palette,
    title: 'Interface',
    items: [
      { label: 'Colour Palette', value: 'SIH26103 Official', type: 'readonly' },
      { label: 'Font', value: 'Scoutie Sans', type: 'readonly' },
    ]
  },
]

export default function Settings() {
  return (
    <PageContainer>
      <div className="mb-8">
        <h1 className="text-xs font-bold text-muted uppercase tracking-widest mb-1">System Configuration</h1>
        <h2 className="text-3xl font-black text-navy tracking-tight flex items-center gap-3">
          SETTINGS
          <SettingsIcon size={24} className="text-muted" />
        </h2>
      </div>

      <div className="bg-navy/5 border border-navy/10 rounded-xl p-4 mb-8 flex items-start gap-3">
        <Info size={16} className="text-navy shrink-0 mt-0.5" />
        <p className="text-xs text-muted">
          These settings control the behaviour of the SIH26103 prototype. Changes to thresholds affect how projects are classified. In a production deployment, these would be persisted to a config database.
        </p>
      </div>

      <div className="space-y-6">
        {sections.map((section, si) => {
          const Icon = section.icon
          return (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: si * 0.1 }}
              className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm"
            >
              <div className="px-6 py-4 border-b border-border bg-slate-50/50 flex items-center gap-3">
                <Icon size={16} className="text-muted" />
                <h3 className="font-bold text-navy tracking-wide text-sm uppercase">{section.title}</h3>
              </div>
              <div className="divide-y divide-border">
                {section.items.map(item => (
                  <div key={item.label} className="px-6 py-4 flex items-center justify-between gap-8">
                    <label className="text-sm font-semibold text-slate-700 shrink-0">{item.label}</label>
                    {item.type === 'readonly' ? (
                      <span className="text-sm text-muted font-mono bg-slate-50 border border-border px-3 py-1.5 rounded">{item.value}</span>
                    ) : item.type === 'number' ? (
                      <input
                        type="number"
                        defaultValue={item.value}
                        className="w-28 text-sm text-right font-mono bg-surface border border-border px-3 py-1.5 rounded text-navy focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-all"
                      />
                    ) : (
                      <input
                        type="text"
                        defaultValue={item.value}
                        className="w-64 text-sm font-mono bg-surface border border-border px-3 py-1.5 rounded text-navy focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-all"
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
        <button className="px-6 py-2.5 bg-navy text-white text-sm font-bold rounded-lg hover:bg-navy-light transition-colors flex items-center gap-2">
          <Shield size={15} /> Save Configuration
        </button>
      </div>
    </PageContainer>
  )
}
