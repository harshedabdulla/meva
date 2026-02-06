import { motion } from 'framer-motion'
import { BotLeaderboard } from '../components/Dashboard'

export function LeaderboardPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-semibold tracking-tight mb-2">
          Bot Leaderboard
        </h1>
        <p className="text-[var(--text-secondary)] text-sm">
          Rankings of MEV bots by total tax contributions to the protocol.
        </p>
      </motion.div>

      <BotLeaderboard />
    </div>
  )
}
