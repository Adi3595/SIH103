import { Search, Bell, Menu, Moon, Sun } from "lucide-react"
import { useState, useEffect } from "react"

export default function Header() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Check initial theme
    if (document.documentElement.getAttribute('data-theme') === 'dark') {
      setIsDark(true)
    }
  }, [])

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.removeAttribute('data-theme')
      setIsDark(false)
    } else {
      document.documentElement.setAttribute('data-theme', 'dark')
      setIsDark(true)
    }
  }

  return (
    <header className="h-16 flex items-center justify-between px-8 bg-surface-card/80 backdrop-blur-xl border-b border-border-default sticky top-0 z-20 transition-colors">
      {/* Left: Nav Toggle & Search */}
      <div className="flex items-center gap-4 flex-1">
        <button className="flex items-center justify-center p-2 -ml-2 text-text-muted hover:text-brand-primary transition-colors rounded-lg">
          <Menu size={20} />
        </button>
        
        <div className="relative max-w-md w-full group">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-primary transition-colors" />
          <input
            type="text"
            placeholder="Search projects by ID, location, or sector..."
            className="w-full bg-surface-sunken border border-border-default text-text-primary text-sm rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-brand-primary/50 focus:ring-2 focus:ring-brand-primary/20 transition-all shadow-sm placeholder:text-text-muted"
          />
        </div>
      </div>
      
      {/* Right: Actions */}
      <div className="flex items-center justify-end gap-6 flex-1">
        <button 
          onClick={toggleTheme}
          className="text-text-muted hover:text-text-primary transition-colors"
          aria-label="Toggle Theme"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <button className="relative text-text-muted hover:text-text-primary transition-colors">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-coral border-2 border-surface-card" />
        </button>
      </div>
    </header>
  )
}
