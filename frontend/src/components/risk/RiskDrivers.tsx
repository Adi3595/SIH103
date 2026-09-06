import { motion } from "framer-motion"

export default function RiskDrivers() {
  const drivers = [
    {
      id: 1,
      title: "Schedule Progress Gap",
      contribution: "+24%",
      description: "Physical progress is significantly behind expected schedule.",
      value: 85
    },
    {
      id: 2,
      title: "Financial-Physical Divergence",
      contribution: "+18%",
      description: "Expenditure is substantially ahead of physical progress.",
      value: 65
    },
    {
      id: 3,
      title: "Delay Momentum",
      contribution: "+15%",
      description: "Project delay has increased across recent reporting periods.",
      value: 45
    }
  ]

  return (
    <div className="bg-surface backdrop-blur-md rounded-xl border border-slate-700/50 p-6 shadow-sm">
      <h3 className="font-bold text-slate-100 tracking-wide mb-6">WHY IS THIS PROJECT AT RISK?</h3>
      
      <div className="space-y-6">
        {drivers.map((driver, index) => (
          <div key={driver.id} className="relative">
            <div className="flex justify-between items-start mb-2">
              <div className="flex gap-3">
                <span className="text-slate-400 font-bold font-mono text-sm opacity-50 mt-0.5">
                  0{index + 1}
                </span>
                <div>
                  <h4 className="font-bold text-slate-100 text-sm">{driver.title}</h4>
                  <p className="text-xs text-slate-400 mt-1">{driver.description}</p>
                </div>
              </div>
              <span className="font-black text-coral">{driver.contribution}</span>
            </div>
            
            <div className="ml-7 h-1.5 w-full bg-slate-800/50 rounded-full overflow-hidden mt-3">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${driver.value}%` }}
                transition={{ duration: 0.8, delay: 0.2 + (index * 0.1), ease: "easeOut" }}
                className="h-full bg-coral rounded-full"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
