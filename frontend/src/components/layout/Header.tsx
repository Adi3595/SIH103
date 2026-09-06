import { ShieldCheck } from "lucide-react"

export default function Header() {
  return (
    <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-6 shrink-0 shadow-sm z-10 relative">
      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-bold text-navy tracking-wide">SIH26103</span>
            <span className="w-1 h-1 rounded-full bg-border"></span>
            <span className="font-semibold text-navy/70 uppercase tracking-widest text-xs">Project Intelligence</span>
          </div>
          <span className="text-xs text-muted font-medium">Infrastructure Monitoring Command Center</span>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-2 bg-yellow/10 border border-yellow/20 px-3 py-1 rounded text-xs font-semibold text-yellow-700">
          SYNTHETIC DATA — NOT OFFICIAL PAIMANA/MoSPI DATA
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-teal">
          <ShieldCheck size={16} />
          <span>SYSTEM OPERATIONAL</span>
        </div>
      </div>
    </header>
  )
}
