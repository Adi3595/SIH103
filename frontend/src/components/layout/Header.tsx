import { Search, Bell, Menu } from "lucide-react"

export default function Header() {
  return (
    <header className="h-16 flex items-center justify-between px-8 bg-white/50 backdrop-blur-xl border-b border-white/60 sticky top-0 z-20">
      <div className="flex items-center gap-4 flex-1">
        <button className="text-slate-400 hover:text-teal transition-colors">
          <Menu size={20} />
        </button>
        <div className="relative max-w-md w-full group">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal transition-colors" />
          <input
            type="text"
            placeholder="Search projects by ID, location, or sector..."
            className="w-full bg-white/60 border border-slate-200 text-slate-800 text-sm rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-teal/50 focus:ring-2 focus:ring-teal/20 transition-all shadow-sm placeholder:text-slate-400"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal/10 border border-teal/20 text-teal-700 text-xs font-bold shadow-sm">
          <div className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse" />
          System Online
        </div>
        
        <button className="relative text-slate-400 hover:text-slate-800 transition-colors">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-coral border-2 border-white" />
        </button>
        
        <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal to-teal-700 flex items-center justify-center text-white font-bold text-xs shadow-sm">
            AD
          </div>
          <div className="hidden md:block">
            <div className="text-sm font-bold text-slate-800">Admin User</div>
            <div className="text-xs text-slate-500 font-medium">Command Center</div>
          </div>
        </div>
      </div>
    </header>
  )
}
