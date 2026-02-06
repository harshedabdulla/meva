import { useState } from 'react'
import { Layout } from './components/Layout'
import { StatsCards, LiveFeed, DividendChart, RegisterBot } from './components/Dashboard'
import { ClaimPanel } from './components/Claim'
import { DocsPage, LeaderboardPage, AutoSettlePage, CrossChainPage } from './pages'
import { motion, AnimatePresence } from 'framer-motion'

type Page = 'dashboard' | 'docs' | 'leaderboard' | 'auto-settle' | 'cross-chain'

function Dashboard() {
  return (
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

      {/* Main grid - Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-4">
        <div className="lg:col-span-3">
          <LiveFeed />
        </div>
        <div className="lg:col-span-2">
          <ClaimPanel />
        </div>
      </div>

      {/* Main grid - Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <DividendChart />
        </div>
        <div>
          <RegisterBot />
        </div>
      </div>
    </div>
  )
}

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 }
}

const pageTransition = {
  duration: 0.2
}

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard')

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />
      case 'leaderboard':
        return <LeaderboardPage />
      case 'auto-settle':
        return <AutoSettlePage />
      case 'cross-chain':
        return <CrossChainPage />
      case 'docs':
        return <DocsPage />
      default:
        return <Dashboard />
    }
  }

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageVariants}
          transition={pageTransition}
        >
          {renderPage()}
        </motion.div>
      </AnimatePresence>
    </Layout>
  )
}

export default App
