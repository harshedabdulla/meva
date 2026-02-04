import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, ExternalLink, Shield, ShieldOff } from 'lucide-react'

interface BotInfo {
  address: string
  isLicensed: boolean
  totalTaxPaid: string
  captureCount: number
}

// demo data (replace with API call)
const DEMO_BOTS: BotInfo[] = [
  { address: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', isLicensed: true, totalTaxPaid: '12.4532', captureCount: 342 },
  { address: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45', isLicensed: false, totalTaxPaid: '8.2145', captureCount: 156 },
  { address: '0x1111111254EEB25477B68fb85Ed929f73A960582', isLicensed: true, totalTaxPaid: '6.8901', captureCount: 98 },
  { address: '0xdef1c0ded9bec7f1a1670819833240f027b25eff', isLicensed: false, totalTaxPaid: '4.5672', captureCount: 67 },
  { address: '0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad', isLicensed: true, totalTaxPaid: '3.2198', captureCount: 45 },
  { address: '0xe592427a0aece92de3edee1f18e0157c05861564', isLicensed: false, totalTaxPaid: '2.1456', captureCount: 31 },
  { address: '0xc36442b4a4522e871399cd717abdd847ab11fe88', isLicensed: true, totalTaxPaid: '1.8934', captureCount: 28 },
  { address: '0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f', isLicensed: false, totalTaxPaid: '1.2345', captureCount: 19 },
]

export function BotLeaderboard() {
  const [bots, setBots] = useState<BotInfo[]>(DEMO_BOTS)
  const [showAll, setShowAll] = useState(false)

  // Try to fetch from API (falls back to demo data)
  useEffect(() => {
    const fetchBots = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/bots')
        if (res.ok) {
          const data = await res.json()
          if (data.length > 0) {
            setBots(data)
          }
        }
      } catch {
        // keep demo data
      }
    }
    fetchBots()
  }, [])

  const displayedBots = showAll ? bots : bots.slice(0, 5)
  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`

  const getRankStyle = (index: number) => {
    if (index === 0) return 'bg-[#FFD700] text-black' // gold
    if (index === 1) return 'bg-[#C0C0C0] text-black' // silver
    if (index === 2) return 'bg-[#CD7F32] text-white' // bronze
    return 'bg-[var(--bg-2)] text-[var(--text-tertiary)]'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.4 }}
      className="card overflow-hidden"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-[var(--border-1)] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[rgba(255,215,0,0.1)] flex items-center justify-center">
            <Trophy className="w-4 h-4 text-[#FFD700]" />
          </div>
          <div>
            <h2 className="font-semibold text-[var(--text-primary)]">Bot Leaderboard</h2>
            <p className="text-xs text-[var(--text-tertiary)]">Top MEV bots by tax paid</p>
          </div>
        </div>
        <span className="badge">{bots.length} bots</span>
      </div>

      {/* Table Header */}
      <div className="px-5 py-2 border-b border-[var(--border-1)] grid grid-cols-12 gap-2 text-xs text-[var(--text-tertiary)]">
        <div className="col-span-1">#</div>
        <div className="col-span-5">Address</div>
        <div className="col-span-2 text-right">Status</div>
        <div className="col-span-2 text-right">Captures</div>
        <div className="col-span-2 text-right">Tax Paid</div>
      </div>

      {/* Leaderboard */}
      <div className="divide-y divide-[var(--border-1)]">
        <AnimatePresence initial={false}>
          {displayedBots.map((bot, index) => (
            <motion.div
              key={bot.address}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="px-5 py-3 grid grid-cols-12 gap-2 items-center hover:bg-[var(--bg-2)]/50 transition-colors"
            >
              {/* Rank */}
              <div className="col-span-1">
                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-xs font-semibold ${getRankStyle(index)}`}>
                  {index + 1}
                </span>
              </div>

              {/* Address */}
              <div className="col-span-5 flex items-center gap-2">
                <span className="font-mono text-sm text-[var(--text-primary)]">
                  {formatAddress(bot.address)}
                </span>
                <a
                  href={`https://sepolia.etherscan.io/address/${bot.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* License Status */}
              <div className="col-span-2 flex justify-end">
                {bot.isLicensed ? (
                  <span className="badge badge-green text-[10px] py-0.5 px-1.5">
                    <Shield className="w-3 h-3" />
                    Licensed
                  </span>
                ) : (
                  <span className="badge text-[10px] py-0.5 px-1.5">
                    <ShieldOff className="w-3 h-3" />
                    Unlicensed
                  </span>
                )}
              </div>

              {/* Capture Count */}
              <div className="col-span-2 text-right">
                <span className="text-sm text-[var(--text-secondary)] font-mono">
                  {bot.captureCount}
                </span>
              </div>

              {/* Tax Paid */}
              <div className="col-span-2 text-right">
                <span className="text-sm font-semibold font-mono text-[var(--pink-500)]">
                  {parseFloat(bot.totalTaxPaid).toFixed(2)} <span className="text-xs text-[var(--text-tertiary)]">ETH</span>
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Show More/Less */}
      {bots.length > 5 && (
        <div className="p-3 border-t border-[var(--border-1)]">
          <button
            onClick={() => setShowAll(!showAll)}
            className="btn btn-secondary btn-sm w-full"
          >
            {showAll ? 'Show Less' : `Show All (${bots.length})`}
          </button>
        </div>
      )}
    </motion.div>
  )
}
