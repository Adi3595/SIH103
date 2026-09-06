import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, ArrowUpRight, Filter } from 'lucide-react'
import PageContainer from '../components/layout/PageContainer'
import RiskBadge from '../components/risk/RiskBadge'
import ProjectStateBadge from '../components/risk/ProjectStateBadge'

interface Project {
  internal_project_id: string
  project_name: string
  ministry: string
  sector: string
  state: string
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [sectorFilter, setSectorFilter] = useState('ALL')

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/projects?limit=200')
      .then(res => { setProjects(res.data); setLoading(false) })
      .catch(() => setLoading(false))
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
        <h1 className="text-xs font-bold text-muted uppercase tracking-widest mb-1">National Infrastructure Portfolio</h1>
        <h2 className="text-3xl font-black text-navy tracking-tight">ALL PROJECTS</h2>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search by name, ID, or ministry..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-lg text-sm text-navy placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-all"
          />
        </div>
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <select
            value={sectorFilter}
            onChange={e => setSectorFilter(e.target.value)}
            className="pl-8 pr-4 py-2.5 bg-surface border border-border rounded-lg text-sm text-navy focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal appearance-none cursor-pointer min-w-[160px] transition-all"
          >
            {sectors.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="text-xs text-muted font-semibold uppercase tracking-widest mb-4">
        Showing {filtered.length} of {projects.length} projects
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-muted">Loading projects...</div>
      ) : (
        <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-xs uppercase tracking-wider text-muted border-b border-border">
                <th className="p-4 font-semibold">Project ID</th>
                <th className="p-4 font-semibold">Name</th>
                <th className="p-4 font-semibold">Ministry</th>
                <th className="p-4 font-semibold">Sector</th>
                <th className="p-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.slice(0, 100).map((p, i) => (
                <motion.tr
                  key={p.internal_project_id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: Math.min(i * 0.02, 0.4) }}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  <td className="p-4 font-mono text-xs font-bold text-navy">{p.internal_project_id}</td>
                  <td className="p-4 text-sm font-medium text-slate-700 max-w-xs truncate">{p.project_name || '—'}</td>
                  <td className="p-4 text-xs text-muted max-w-[180px] truncate">{p.ministry || '—'}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 bg-teal/10 text-teal-700 text-xs font-semibold rounded border border-teal/20">
                      {p.sector || '—'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <Link
                      to={`/projects/${p.internal_project_id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-muted hover:text-navy transition-colors p-1.5 rounded hover:bg-slate-100"
                    >
                      <ArrowUpRight size={16} />
                    </Link>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageContainer>
  )
}
