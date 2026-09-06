import { useEffect, useState, useMemo } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps'
import { scaleLinear } from 'd3-scale'
import { Tooltip } from 'react-tooltip'
import { Map, Activity, TrendingUp, FolderKanban, AlertOctagon } from 'lucide-react'
import PageContainer from '../components/layout/PageContainer'

const INDIA_TOPO = '/india_states.json'

interface StateStats {
  state: string
  project_count: number
  total_cost_cr: number
  avg_risk_score: number
  critical_projects: number
}

// Maps GeoJSON state name → DB state name
const GEO_TO_DB: Record<string, string> = {
  'Andhra Pradesh':         'Andhra Pradesh',
  'Arunanchal Pradesh':     'Arunachal Pradesh',
  'Assam':                  'Assam',
  'Bihar':                  'Bihar',
  'Chhattisgarh':           'Chhattisgarh',
  'Goa':                    'Goa',
  'Gujarat':                'Gujarat',
  'Haryana':                'Haryana',
  'Himachal Pradesh':       'Himachal Pradesh',
  'Jharkhand':              'Jharkhand',
  'Karnataka':              'Karnataka',
  'Kerala':                 'Kerala',
  'Madhya Pradesh':         'Madhya Pradesh',
  'Maharashtra':            'Maharashtra',
  'Manipur':                'Manipur',
  'Meghalaya':              'Meghalaya',
  'Mizoram':                'Mizoram',
  'Nagaland':               'Nagaland',
  'Odisha':                 'Odisha',
  'Punjab':                 'Punjab',
  'Rajasthan':              'Rajasthan',
  'Sikkim':                 'Sikkim',
  'Tamil Nadu':             'Tamil Nadu',
  'Telangana':              'Telangana',
  'Tripura':                'Tripura',
  'Uttar Pradesh':          'Uttar Pradesh',
  'Uttarakhand':            'Uttarakhand',
  'West Bengal':            'West Bengal',
  'NCT of Delhi':           'Delhi',
}

const SECTORS = ['ALL', 'Roads and Highways', 'Railways', 'Power', 'Petroleum', 'Coal', 'Urban Infrastructure']

export default function MapView() {
  const [data, setData] = useState<StateStats[]>([])
  const [loading, setLoading] = useState(true)
  const [sector, setSector] = useState('ALL')
  const [metric, setMetric] = useState<'project_count' | 'avg_risk_score' | 'critical_projects'>('project_count')
  const [hovered, setHovered] = useState<StateStats | null>(null)
  const [tooltipContent, setTooltipContent] = useState('')

  useEffect(() => {
    setLoading(true)
    axios.get(`http://127.0.0.1:8000/api/projects/geospatial?sector=${sector}`)
      .then(res => { setData(res.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [sector])

  const maxVal = useMemo(() => {
    if (!data.length) return 1
    return Math.max(...data.map(d => d[metric]))
  }, [data, metric])

  const colorScale = scaleLinear<string>()
    .domain([0, maxVal])
    .range(metric === 'avg_risk_score' ? ['#fef9c3', '#be123c'] :
           metric === 'critical_projects' ? ['#fef2f2', '#be123c'] :
           ['#f0fdfa', '#0d9488'])

  const METRIC_LABELS: Record<string, string> = {
    project_count: 'Project Count',
    avg_risk_score: 'Avg Risk Score',
    critical_projects: 'Critical Projects',
  }

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-4 rounded-full bg-teal-500" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Geospatial Intelligence</span>
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            India Project Map
            <Map className="text-teal-600" size={28} />
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Hover over any state to see live project statistics.
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Sector</label>
            <select value={sector} onChange={e => setSector(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 shadow-sm focus:ring-2 focus:ring-teal-500 focus:outline-none min-w-[160px]">
              {SECTORS.map(s => <option key={s} value={s}>{s === 'ALL' ? 'All Sectors' : s}</option>)}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Color By</label>
            <select value={metric} onChange={e => setMetric(e.target.value as any)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 shadow-sm focus:ring-2 focus:ring-teal-500 focus:outline-none min-w-[160px]">
              <option value="project_count">Project Count</option>
              <option value="avg_risk_score">Avg Risk Score</option>
              <option value="critical_projects">Critical Projects</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Map Panel */}
        <div className="lg:col-span-3 glass-panel p-4 relative min-h-[600px] overflow-hidden">
          {loading && (
            <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-sm flex items-center justify-center rounded-2xl">
              <Activity className="animate-spin text-teal-600" size={32} />
            </div>
          )}

          <ComposableMap
            projection="geoMercator"
            projectionConfig={{ scale: 900, center: [82, 22] }}
            width={700}
            height={600}
            style={{ width: '100%', height: '100%' }}
          >
            <ZoomableGroup zoom={1} center={[82, 22]} minZoom={0.8} maxZoom={4}>
              <Geographies geography={INDIA_TOPO}>
                {({ geographies }) =>
                  geographies.map(geo => {
                    const geoName: string = geo.properties.name
                    const dbName = GEO_TO_DB[geoName] || geoName
                    const stateData = data.find(d => d.state === dbName)
                    const val = stateData ? stateData[metric] : 0
                    const fill = stateData && val > 0 ? colorScale(val) : '#f1f5f9'

                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={fill}
                        stroke="#e2e8f0"
                        strokeWidth={0.5}
                        style={{
                          default: { outline: 'none', transition: 'fill 0.3s ease' },
                          hover:   { fill: '#0f766e', outline: 'none', cursor: 'pointer' },
                          pressed: { outline: 'none' },
                        }}
                        data-tooltip-id="india-map-tip"
                        data-tooltip-html={tooltipContent}
                        onMouseEnter={() => {
                          setHovered(stateData || null)
                          if (stateData) {
                            setTooltipContent(
                              `<div style="font-weight:800;font-size:14px;margin-bottom:4px">${stateData.state}</div>
                               <div style="font-size:12px">🗂 Projects: <b>${stateData.project_count}</b></div>
                               <div style="font-size:12px">💰 Total Cost: <b>₹${stateData.total_cost_cr.toLocaleString('en-IN')} Cr</b></div>
                               <div style="font-size:12px">⚡ Avg Risk: <b>${stateData.avg_risk_score}/10</b></div>
                               <div style="font-size:12px;color:#fca5a5">🔴 Critical: <b>${stateData.critical_projects}</b></div>`
                            )
                          } else {
                            setTooltipContent(
                              `<div style="font-weight:800;font-size:14px">${geoName}</div><div style="font-size:12px;opacity:0.6">No projects mapped</div>`
                            )
                          }
                        }}
                        onMouseLeave={() => { setHovered(null); setTooltipContent('') }}
                      />
                    )
                  })
                }
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>

          <Tooltip
            id="india-map-tip"
            className="!bg-slate-800 !text-white !rounded-2xl !shadow-2xl !border !border-slate-700"
            style={{ padding: '12px 16px', pointerEvents: 'none' }}
          />

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-xl border border-slate-200 shadow-md">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
              {METRIC_LABELS[metric]}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">Low</span>
              <div className="w-28 h-2 rounded-full"
                style={{
                  background: metric === 'project_count'
                    ? 'linear-gradient(to right, #f0fdfa, #0d9488)'
                    : 'linear-gradient(to right, #fef9c3, #be123c)'
                }}
              />
              <span className="text-xs font-bold text-slate-400">High</span>
            </div>
          </div>

          {/* Zoom hint */}
          <div className="absolute bottom-4 right-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Scroll to zoom · Drag to pan
          </div>
        </div>

        {/* Stats Panel */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {hovered ? (
              <motion.div key={hovered.state} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }} className="glass-panel p-5">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Hovered State
                </div>
                <h2 className="text-xl font-black text-slate-800 mb-4">{hovered.state}</h2>

                {[
                  { icon: FolderKanban, label: 'Projects', value: hovered.project_count, color: '#0d9488' },
                  { icon: TrendingUp,   label: 'Avg Risk Score', value: `${hovered.avg_risk_score}/10`, color: '#b45309' },
                  { icon: AlertOctagon, label: 'Critical Projects', value: hovered.critical_projects, color: '#be123c' },
                ].map(s => (
                  <div key={s.label} className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${s.color}15` }}>
                      <s.icon size={16} style={{ color: s.color }} />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</div>
                      <div className="text-lg font-black text-slate-800">{s.value}</div>
                    </div>
                  </div>
                ))}

                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Cost</div>
                  <div className="text-2xl font-black text-teal-700">
                    ₹{hovered.total_cost_cr.toLocaleString('en-IN')} Cr
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="glass-panel p-6 flex flex-col items-center justify-center text-center min-h-[200px]">
                <Map size={32} className="text-slate-300 mb-3" />
                <div className="text-sm font-bold text-slate-400">Hover over a state</div>
                <div className="text-xs text-slate-300 mt-1">to see project statistics</div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Portfolio Summary */}
          <div className="glass-panel p-5">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Portfolio Summary</div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-500">States with projects</span>
                <span className="text-sm font-black text-slate-800">{data.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-500">Total projects</span>
                <span className="text-sm font-black text-slate-800">{data.reduce((a, b) => a + b.project_count, 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-500">Total cost</span>
                <span className="text-sm font-black text-teal-700">
                  ₹{data.reduce((a, b) => a + b.total_cost_cr, 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })} Cr
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-500">Critical projects</span>
                <span className="text-sm font-black text-red-600">{data.reduce((a, b) => a + b.critical_projects, 0)}</span>
              </div>
            </div>
          </div>

          {/* Top States */}
          <div className="glass-panel p-5">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Top States</div>
            <div className="space-y-2">
              {[...data].sort((a, b) => b[metric] - a[metric]).slice(0, 5).map((s, i) => (
                <div key={s.state} className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-300 w-4">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-600 mb-0.5">
                      <span>{s.state}</span>
                      <span className="font-black text-slate-800">{s[metric]}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(s[metric] / maxVal) * 100}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: metric === 'project_count' ? '#0d9488' : '#be123c' }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
