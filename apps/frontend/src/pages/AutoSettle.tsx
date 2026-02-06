import { motion } from 'framer-motion'
import { YellowChannel } from '../components/Dashboard'

export function AutoSettlePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-semibold tracking-tight mb-2">
          Auto-Settle
        </h1>
        <p className="text-[var(--text-secondary)] text-sm">
          Yellow Network integration for off-chain tax aggregation and batch settlement.
        </p>
      </motion.div>

      <YellowChannel />
    </div>
  )
}
