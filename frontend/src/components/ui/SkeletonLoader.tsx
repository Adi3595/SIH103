import { motion } from 'framer-motion'

export default function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number, cols?: number }) {
  return (
    <div className="glass-panel overflow-hidden">
      <div className="w-full bg-surface-sunken/80 border-b border-border-default flex p-4">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="flex-1 px-4">
            <div className="h-3 w-16 bg-border-default/80 rounded animate-pulse" />
          </div>
        ))}
      </div>
      <div>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex border-b border-border-default/50 p-4">
            {Array.from({ length: cols }).map((_, colIndex) => (
              <div key={colIndex} className="flex-1 px-4 flex items-center">
                <motion.div 
                  initial={{ opacity: 0.3 }}
                  animate={{ opacity: 0.7 }}
                  transition={{ repeat: Infinity, repeatType: "reverse", duration: 1, delay: (rowIndex * 0.1) + (colIndex * 0.05) }}
                  className={`h-4 bg-border-default rounded w-${colIndex === 0 ? '20' : colIndex === 1 ? '3/4' : '1/2'}`} 
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="glass-panel p-6 h-full flex flex-col justify-between">
      <div className="flex justify-between items-start mb-6">
        <motion.div 
          initial={{ opacity: 0.3 }} animate={{ opacity: 0.7 }} transition={{ repeat: Infinity, repeatType: "reverse", duration: 1 }}
          className="h-4 w-24 bg-border-default rounded" 
        />
        <div className="h-8 w-8 bg-surface-sunken rounded-lg animate-pulse" />
      </div>
      <div>
        <motion.div 
          initial={{ opacity: 0.3 }} animate={{ opacity: 0.7 }} transition={{ repeat: Infinity, repeatType: "reverse", duration: 1, delay: 0.2 }}
          className="h-10 w-32 bg-border-default rounded mb-2" 
        />
        <div className="h-3 w-48 bg-surface-sunken rounded animate-pulse" />
      </div>
    </div>
  )
}
