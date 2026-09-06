import { useState } from "react"
import { NavLink } from "react-router-dom"
import { 
  LayoutDashboard, 
  FolderKanban, 
  BrainCircuit, 
  TrendingUp, 
  AlertOctagon, 
  BarChart3, 
  Database, 
  Settings,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "../../utils/cn"

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", to: "/", end: true },
  { icon: FolderKanban, label: "Projects", to: "/projects" },
  { icon: BrainCircuit, label: "Risk Intelligence", to: "/intelligence" },
  { icon: TrendingUp, label: "Rising Risk", to: "/rising" },
  { icon: AlertOctagon, label: "Priorities", to: "/priorities" },
  { icon: BarChart3, label: "Analytics", to: "/analytics" },
  { icon: Database, label: "Data Quality", to: "/data" },
  { icon: Settings, label: "Settings", to: "/settings" },
]

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isExpanded ? 240 : 68 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      className="h-full shrink-0 flex flex-col justify-between relative z-20 shadow-2xl overflow-hidden cursor-default"
      style={{ background: 'linear-gradient(180deg, #2a9d8f 0%, #264653 60%, #1a3340 100%)' }}
    >
      {/* Subtle dot-grid texture */}
      <div 
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '22px 22px' }}
      />

      <div className="relative py-5 flex flex-col gap-0.5 px-2.5">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            end={item.end}
            className={({ isActive }) => cn(
              "flex items-center gap-3.5 px-2.5 py-2.5 rounded-lg transition-all duration-200 group relative overflow-hidden",
              isActive 
                ? "bg-white/15 text-white" 
                : "text-white/50 hover:bg-white/10 hover:text-white"
            )}
          >
            {({ isActive }) => (
              <>
                {/* Coral active accent bar */}
                {isActive && (
                  <motion.div 
                    layoutId="active-nav"
                    className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full"
                    style={{ backgroundColor: '#e76f51' }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}

                {/* Coral radial glow behind active item */}
                {isActive && (
                  <div 
                    className="absolute inset-0 rounded-lg opacity-[0.08] pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse at 10% 50%, #e76f51 0%, transparent 70%)' }}
                  />
                )}

                <item.icon 
                  size={19} 
                  className={cn(
                    "shrink-0 transition-colors duration-200",
                    isActive ? "text-[#e9c46a]" : "text-white/45 group-hover:text-[#e9c46a]"
                  )} 
                />
                
                <AnimatePresence mode="popLayout">
                  {isExpanded && (
                    <motion.span 
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.15 }}
                      className={cn(
                        "font-semibold whitespace-nowrap text-sm tracking-wide leading-none",
                        isActive ? "text-white" : "text-white/65 group-hover:text-white"
                      )}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* Bottom brand mark */}
      <div className="relative p-3 border-t border-white/10 flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="popLayout">
          {isExpanded ? (
            <motion.span
              key="brand-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] whitespace-nowrap"
            >
              SIH 2025 — 26103
            </motion.span>
          ) : (
            <motion.span
              key="brand-short"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="text-[9px] font-black text-white/20 uppercase tracking-widest"
            >
              SIH
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  )
}
