import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Zap, ArrowDownToLine, Clock, CheckCircle, Loader2, Wifi, WifiOff } from 'lucide-react'

interface YellowStats {
  isConnected: boolean
  activeChannels: number
  activeSessions: number
  totalPendingTax: string
  totalSettledTax: string
  pendingPayments: number
}

interface PendingPayment {
  botAddress: string
  amount: string
  timestamp: number
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export function YellowChannel() {
  const [stats, setStats] = useState<YellowStats | null>(null)
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([])
  const [isSettling, setIsSettling] = useState(false)
  const [lastSettlement, setLastSettlement] = useState<string | null>(null)

  // Fetch Yellow Network stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsRes, pendingRes] = await Promise.all([
          fetch(`${API_URL}/api/yellow/status`),
          fetch(`${API_URL}/api/yellow/pending`),
        ])

        if (statsRes.ok) {
          const data = await statsRes.json()
          setStats(data)
        }

        if (pendingRes.ok) {
          const data = await pendingRes.json()
          setPendingPayments(data.payments || [])
        }
      } catch (err) {
        console.error('Failed to fetch Yellow stats:', err)
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 5000)
    return () => clearInterval(interval)
  }, [])

  // Settle all pending taxes
  const handleSettleAll = async () => {
    setIsSettling(true)
    try {
      const res = await fetch(`${API_URL}/api/yellow/settle-all`, {
        method: 'POST',
      })

      if (res.ok) {
        const data = await res.json()
        setLastSettlement(`Settled ${formatEth(data.totalSettled)} from ${data.botCount} bots`)

        // Refresh stats
        const statsRes = await fetch(`${API_URL}/api/yellow/status`)
        if (statsRes.ok) {
          setStats(await statsRes.json())
        }
      }
    } catch (err) {
      console.error('Settlement failed:', err)
    } finally {
      setIsSettling(false)
    }
  }

  const formatEth = (wei: string) => {
    const eth = Number(wei) / 1e18
    return `${eth.toFixed(4)} ETH`
  }

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp
    if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    return `${Math.floor(diff / 3600000)}h ago`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.4 }}
      className="card"
    >
      {/* Header */}
      <div className="p-5 border-b border-[var(--border-1)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[rgba(255,199,0,0.1)] flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#FFC700]" />
            </div>
            <div>
              <h2 className="font-semibold text-[var(--text-primary)]">Yellow Network</h2>
              <p className="text-xs text-[var(--text-tertiary)]">Off-chain tax aggregation</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {stats?.isConnected ? (
              <span className="flex items-center gap-1.5 text-xs text-[var(--green)]">
                <Wifi className="w-3 h-3" />
                Connected
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)]">
                <WifiOff className="w-3 h-3" />
                Demo Mode
              </span>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="card-surface p-3 rounded-xl text-center">
            <p className="text-lg font-semibold font-mono text-[#FFC700]">
              {stats ? formatEth(stats.totalPendingTax) : '0 ETH'}
            </p>
            <p className="text-xs text-[var(--text-tertiary)]">Pending</p>
          </div>
          <div className="card-surface p-3 rounded-xl text-center">
            <p className="text-lg font-semibold font-mono text-[var(--green)]">
              {stats ? formatEth(stats.totalSettledTax) : '0 ETH'}
            </p>
            <p className="text-xs text-[var(--text-tertiary)]">Settled</p>
          </div>
          <div className="card-surface p-3 rounded-xl text-center">
            <p className="text-lg font-semibold font-mono text-[var(--text-primary)]">
              {stats?.activeChannels || 0}
            </p>
            <p className="text-xs text-[var(--text-tertiary)]">Channels</p>
          </div>
        </div>
      </div>

      {/* Pending Payments */}
      <div className="p-5 border-b border-[var(--border-1)]">
        <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3">
          Recent Off-Chain Payments
        </h3>
        {pendingPayments.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-[var(--text-secondary)] mb-1">No pending payments</p>
            <p className="text-xs text-[var(--text-tertiary)]">Off-chain payments will appear here</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {pendingPayments.slice(0, 5).map((payment) => (
              <div
                key={`${payment.botAddress}-${payment.timestamp}`}
                className="flex items-center justify-between py-2 px-3 rounded-lg bg-[var(--bg-2)]"
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 text-[var(--text-tertiary)]" />
                  <span className="text-xs font-mono text-[var(--text-secondary)]">
                    {formatAddress(payment.botAddress)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-[#FFC700]">
                    +{formatEth(payment.amount)}
                  </span>
                  <span className="text-xs text-[var(--text-tertiary)]">
                    {formatTime(payment.timestamp)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Settlement */}
      <div className="p-5">
        {lastSettlement && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-[rgba(33,201,94,0.1)] border border-[rgba(33,201,94,0.2)] mb-4">
            <CheckCircle className="w-4 h-4 text-[var(--green)]" />
            <p className="text-xs text-[var(--green)]">{lastSettlement}</p>
          </div>
        )}

        <button
          onClick={handleSettleAll}
          disabled={isSettling || !stats || stats.pendingPayments === 0}
          className="btn btn-primary w-full"
        >
          {isSettling ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Settling on-chain...
            </>
          ) : (
            <>
              <ArrowDownToLine className="w-4 h-4" />
              Settle to Vault ({stats?.pendingPayments || 0} payments)
            </>
          )}
        </button>

        <p className="text-xs text-[var(--text-tertiary)] text-center mt-3">
          Batches off-chain taxes into single on-chain settlement
        </p>
      </div>
    </motion.div>
  )
}
