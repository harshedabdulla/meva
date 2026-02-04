import { useWatchContractEvent } from 'wagmi'
import { formatEther } from 'viem'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink } from 'lucide-react'
import { CONTRACTS, MEVA_VAULT_ABI } from '../../lib/contracts'

interface MevCapture {
  id: string
  bot: string
  amount: bigint
  timestamp: number
  txHash?: string
}

const DEMO_CAPTURES: MevCapture[] = [
  { id: '1', bot: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', amount: BigInt('50000000000000000'), timestamp: Date.now() - 5000 },
  { id: '2', bot: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45', amount: BigInt('120000000000000000'), timestamp: Date.now() - 15000 },
  { id: '3', bot: '0x1111111254EEB25477B68fb85Ed929f73A960582', amount: BigInt('80000000000000000'), timestamp: Date.now() - 30000 },
]

export function LiveFeed() {
  const [captures, setCaptures] = useState<MevCapture[]>(DEMO_CAPTURES)
  const [isLive, setIsLive] = useState(true)

  useWatchContractEvent({
    address: CONTRACTS.sepolia.mevaVault as `0x${string}`,
    abi: MEVA_VAULT_ABI,
    eventName: 'TaxReceived',
    onLogs(logs) {
      logs.forEach((log) => {
        const newCapture: MevCapture = {
          id: `${log.transactionHash}-${log.logIndex}`,
          bot: (log as unknown as { args: { bot: string } }).args.bot,
          amount: (log as unknown as { args: { amount: bigint } }).args.amount,
          timestamp: Date.now(),
          txHash: log.transactionHash,
        }
        setCaptures((prev) => [newCapture, ...prev.slice(0, 19)])
      })
    },
  })

  useEffect(() => {
    if (!isLive) return
    const interval = setInterval(() => {
      const bots = [
        '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
        '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45',
        '0x1111111254EEB25477B68fb85Ed929f73A960582',
      ]
      const randomBot = bots[Math.floor(Math.random() * bots.length)]
      const randomAmount = BigInt(Math.floor(Math.random() * 200000000000000000) + 10000000000000000)
      setCaptures((prev) => [{
        id: `demo-${Date.now()}`,
        bot: randomBot,
        amount: randomAmount,
        timestamp: Date.now(),
      }, ...prev.slice(0, 19)])
    }, 5000 + Math.random() * 5000)
    return () => clearInterval(interval)
  }, [isLive])

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`
  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp
    if (diff < 60000) return `${Math.floor(diff / 1000)}s`
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`
    return `${Math.floor(diff / 3600000)}h`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="card overflow-hidden h-[420px] flex flex-col"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-[var(--border-1)] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="font-semibold text-[var(--text-primary)]">Live Captures</h2>
          <div className="flex items-center gap-2">
            <div className={`live-dot ${!isLive && 'opacity-30'}`} />
            <span className="text-xs text-[var(--text-tertiary)]">{isLive ? 'Live' : 'Paused'}</span>
          </div>
        </div>
        <button onClick={() => setIsLive(!isLive)} className="btn btn-secondary btn-sm">
          {isLive ? 'Pause' : 'Resume'}
        </button>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence initial={false}>
          {captures.map((capture, index) => (
            <motion.div
              key={capture.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="px-5 py-3 border-b border-[var(--border-1)] hover:bg-[var(--bg-2)]/50 transition-colors"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[var(--bg-2)] flex items-center justify-center text-xs font-mono text-[var(--text-tertiary)]">
                    {index === 0 && <div className="w-2 h-2 rounded-full bg-[var(--pink-500)]" />}
                    {index !== 0 && formatTime(capture.timestamp)}
                  </div>
                  <p className="text-sm font-mono text-[var(--text-primary)] truncate">
                    {formatAddress(capture.bot)}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <p className="text-sm font-semibold text-[var(--green)] font-mono">
                    +{parseFloat(formatEther(capture.amount)).toFixed(4)}
                  </p>
                  {capture.txHash && (
                    <a
                      href={`https://sepolia.etherscan.io/tx/${capture.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
