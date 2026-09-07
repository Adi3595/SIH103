import { useState } from "react"
import { NavLink } from "react-router-dom"
import { LayoutDashboard, FolderKanban, BrainCircuit, TrendingUp, AlertOctagon, BarChart3, Database, Settings, Map, Upload } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "../../utils/cn"

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard",       to: "/",             end: true,  accent: "#2dd4bf" },
  { icon: FolderKanban,   label: "Projects",         to: "/projects",     end: false, accent: "#2dd4bf" },
  { icon: TrendingUp,     label: "Rising Risk",       to: "/rising",       end: false, accent: "#fb7185" },
  { icon: AlertOctagon,   label: "Priorities",        to: "/priorities",   end: false, accent: "#fb923c" },
  { icon: BarChart3,      label: "Analytics",         to: "/analytics",    end: false, accent: "#2dd4bf" },
  { icon: Map,            label: "Geospatial View",   to: "/map",          end: false, accent: "#0d9488" },
  { icon: Upload,         label: "Data Ingestion",    to: "/ingestion",    end: false, accent: "#0d9488" },
  { icon: Settings,       label: "Settings",          to: "/settings",     end: false, accent: "#94a3b8" },
]

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <motion.aside
      initial={false}
      animate={{ width: isExpanded ? 220 : 64 }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      className="h-full shrink-0 flex flex-col relative z-20 glass-card mx-3 my-3 border border-white/60"
    >
      <div className="relative px-4 py-5 flex items-center gap-3 border-b border-slate-100">
        <div className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center bg-teal text-white shadow-glow-teal">
          <div className="w-3 h-3 bg-white" style={{ clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" }} />
        </div>
        <AnimatePresence>
          {isExpanded && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col">
              <span className="text-xs font-black text-slate-800 tracking-widest uppercase">PAIMANA</span>
              <span className="text-[9px] font-bold text-slate-400 tracking-widest uppercase">AI Engine</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex-1 py-4 px-3 flex flex-col gap-1 overflow-hidden">
        {navItems.map((item) => (
          <NavLink key={item.label} to={item.to} end={item.end}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
              isActive ? "bg-white shadow-sm border border-slate-100" : "hover:bg-slate-50 border border-transparent"
            )}>
            {({ isActive }) => (
              <>
                <div className="shrink-0 transition-all duration-200" style={{ color: isActive ? item.accent : "#94a3b8" }}>
                  <item.icon size={18} />
                </div>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="text-xs font-semibold whitespace-nowrap" style={{ color: isActive ? "#334155" : "#64748b" }}>
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </motion.aside>
  )
}
