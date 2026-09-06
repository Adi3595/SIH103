import { AlertTriangle, RefreshCcw } from 'lucide-react'
import { motion } from 'framer-motion'

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
}

export default function ErrorState({ 
  title = "Failed to load data", 
  message = "There was a problem communicating with the server. Please ensure the backend is running.",
  onRetry
}: ErrorStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-8 flex flex-col items-center justify-center text-center h-64 bg-red-50/20 border-red-100"
    >
      <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mb-4 text-red-600 shadow-sm border border-red-200">
        <AlertTriangle size={24} />
      </div>
      <h3 className="text-lg font-black text-slate-800 tracking-tight mb-2">{title}</h3>
      <p className="text-sm text-slate-500 max-w-md mb-6">{message}</p>
      
      {onRetry && (
        <button 
          onClick={onRetry}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:text-teal-600 hover:border-teal-200 hover:bg-teal-50 transition-all shadow-sm"
        >
          <RefreshCcw size={14} /> Try Again
        </button>
      )}
    </motion.div>
  )
}
