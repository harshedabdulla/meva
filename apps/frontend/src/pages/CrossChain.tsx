import { motion } from 'framer-motion'
import { CrossChainClaim } from '../components/CrossChain'

export function CrossChainPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <span className="badge badge-blue mb-3">Li.Fi Powered</span>
        <h1 className="text-2xl font-semibold tracking-tight mb-2">
          Cross-Chain Claiming
        </h1>
        <p className="text-[var(--text-secondary)] text-sm">
          Claim your MEV redistribution rewards on any supported chain.
          Li.Fi automatically finds the best bridge route.
        </p>
      </motion.div>

      <CrossChainClaim />

      {/* Info Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="mt-6 card p-5"
      >
        <h3 className="font-semibold text-[var(--text-primary)] mb-3">How it works</h3>
        <ol className="space-y-3 text-sm text-[var(--text-secondary)]">
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--bg-2)] flex items-center justify-center text-xs font-medium">1</span>
            <span>Your claimable rewards are calculated from LP dividends and victim rebates</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--bg-2)] flex items-center justify-center text-xs font-medium">2</span>
            <span>Select your destination chain (Arbitrum, Optimism, Base, Polygon)</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--bg-2)] flex items-center justify-center text-xs font-medium">3</span>
            <span>Li.Fi finds the optimal bridge route with best fees and speed</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--bg-2)] flex items-center justify-center text-xs font-medium">4</span>
            <span>One-click claim and bridge - receive funds on your chosen chain</span>
          </li>
        </ol>
      </motion.div>
    </div>
  )
}
