import { ReactNode } from "react"
import { motion } from "framer-motion"

export default function PageContainer({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="p-8 max-w-[1920px] mx-auto w-full"
    >
      {children}
    </motion.div>
  )
}
