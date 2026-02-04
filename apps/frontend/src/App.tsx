import { Layout } from './components/Layout'
import { StatsCards, LiveFeed } from './components/Dashboard'
import { ClaimPanel } from './components/Claim'
import { motion } from 'framer-motion'

function App() {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <span className="badge badge-pink mb-3">Uniswap V4 Hook</span>
          <h1 className="text-3xl font-semibold tracking-tight mb-2">
            <span className="text-[var(--pink-500)]">MEV Redistribution</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-sm max-w-md">
            Capturing MEV from sandwich bots and redistributing value to the community.
          </p>
        </motion.div>

        {/* Stats */}
        <section className="mb-4">
          <StatsCards />
        </section>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3">
            <LiveFeed />
          </div>
          <div className="lg:col-span-2">
            <ClaimPanel />
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default App
