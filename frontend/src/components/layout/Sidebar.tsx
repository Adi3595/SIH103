import { useState } from "react"
import { NavLink } from "react-router-dom"
import { LayoutDashboard, FolderKanban, TrendingUp, AlertOctagon, BarChart3, Settings, Map, Upload } from "lucide-react"
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
      className="h-full shrink-0 flex flex-col relative z-20 glass-card mx-3 my-3 border border-border-default"
    >
      {/* Logo area */}
      <div className="relative px-3 flex items-center overflow-hidden transition-all duration-300 dark:bg-transparent" 
           style={{ backgroundColor: 'var(--brand-secondary)', borderBottom: '1px solid var(--border-default)', minHeight: '64px' }}>
        
        {/* Icon (always visible) */}
        <div className="shrink-0 flex items-center justify-center w-10 h-10 overflow-hidden">
          <img
            src="/logo_icon.png"
            alt="Nirikshan Icon"
            className="w-10 h-10 object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] dark:brightness-125"
          />
        </div>

        {/* Brand text revealed on expand */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18 }}
              className="ml-2 flex flex-col justify-center overflow-hidden"
            >
              <img 
                src="/logo_text.png" 
                alt="Nirikshan: Monitor . Predict . Build Better" 
                className="h-9 object-contain object-left drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] dark:brightness-125" 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex-1 py-4 px-3 flex flex-col gap-1 overflow-hidden">
        {navItems.map((item) => (
          <NavLink key={item.label} to={item.to} end={item.end}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
              isActive ? "bg-surface-sunken shadow-sm border border-border-default" : "hover:bg-surface-sunken/50 border border-transparent"
            )}>
            {({ isActive }) => (
              <>
                <div className="shrink-0 transition-all duration-200" style={{ color: isActive ? item.accent : 'var(--text-muted)' }}>
                  <item.icon size={18} />
                </div>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="text-xs font-semibold whitespace-nowrap" style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
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
