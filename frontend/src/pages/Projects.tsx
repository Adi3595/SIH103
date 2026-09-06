import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, ArrowUpRight, Filter, FolderKanban } from 'lucide-react'
import PageContainer from '../components/layout/PageContainer'
import SkeletonTable from '../components/ui/SkeletonLoader'
import ErrorState from '../components/ui/ErrorState'

interface Project {
  internal_project_id: string
  project_name: string
  ministry: string
  sector: string
  state: string
}

const SECTOR_COLORS: Record<string, string> = {
  Railways:  '#0f766e',
  Roads:     '#b45309',
  Power:     '#c2410c',
  Telecom:   '#7c3aed',
  Water:     '#0369a1',
  Petroleum: '#be123c',
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [sectorFilter, setSectorFilter] = useState('ALL')

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/projects?limit=200')
      .then(res => { setProjects(res.data); setLoading(false) })
      .catch(() => { setLoading(false); setError(true) })
  }, [])

  const sectors = ['ALL', ...Array.from(new Set(projects.map(p => p.sector))).sort()]

  const filtered = projects.filter(p => {
    const matchesSearch = p.project_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.internal_project_id?.toLowerCase().includes(search.toLowerCase()) ||
      p.ministry?.toLowerCase().includes(search.toLowerCase())
    const matchesSector = sectorFilter === 'ALL' || p.sector === sectorFilter
    return matchesSearch && matchesSector
  })

  return (
    <PageContainer>
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1.5 h-4 rounded-full bg-teal-500" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">National Infrastructure Portfolio</span>
        </div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">All Projects</h1>
          <FolderKanban size={22} className="text-teal-500" />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, ID, or ministry..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal-400 transition-all shadow-sm"
          />
        </div>
        <div className="relative">
          <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={sectorFilter}
            onChange={e => setSectorFilter(e.target.value)}
            className="pl-8 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal-400 appearance-none cursor-pointer min-w-[160px] transition-all shadow-sm font-medium"
          >
            {sectors.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="text-xs text-slate-400 font-semibold uppercase tracking-widest mb-4">
        Showing {filtered.length} of {projects.length} projects
      </div>

      {loading ? (
        <SkeletonTable rows={10} cols={6} />
      ) : error ? (
        <ErrorState onRetry={() => window.location.reload()} />
      ) : (
        <div className="glass-panel overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-[10px] uppercase tracking-widest text-slate-400 border-b border-slate-100">
                <th className="px-5 py-4 font-bold">Project ID</th>
                <th className="px-5 py-4 font-bold">Name</th>
                <th className="px-5 py-4 font-bold hidden md:table-cell">Ministry</th>
                <th className="px-5 py-4 font-bold hidden sm:table-cell">Sector</th>
                <th className="px-5 py-4 font-bold hidden lg:table-cell">State</th>
                <th className="px-5 py-4 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 100).map((p, i) => {
                const sColor = SECTOR_COLORS[p.sector] || '#0f766e'
                return (
                  <motion.tr
                    key={p.internal_project_id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, delay: Math.min(i * 0.015, 0.3) }}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors group"
                  >
                    <td className="px-5 py-3.5 font-mono text-xs font-bold text-teal-700">{p.internal_project_id}</td>
                    <td className="px-5 py-3.5 text-sm font-medium text-slate-700 max-w-xs truncate">{p.project_name || '—'}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-500 max-w-[180px] truncate hidden md:table-cell">{p.ministry || '—'}</td>
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border"
                        style={{ color: sColor, backgroundColor: `${sColor}10`, borderColor: `${sColor}30` }}>
                        {p.sector || '—'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500 hidden lg:table-cell">{p.state || '—'}</td>
                    <td className="px-5 py-3.5 text-right">
                      <Link to={`/projects/${p.internal_project_id}`}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-teal-700 hover:bg-teal/10 border border-transparent hover:border-teal/20 transition-all">
                        <ArrowUpRight size={15} />
                      </Link>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </PageContainer>
  )
}
