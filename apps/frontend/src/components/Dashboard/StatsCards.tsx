import { useReadContract } from 'wagmi'
import { formatEther } from 'viem'
import { CONTRACTS, MEVA_VAULT_ABI } from '../../lib/contracts'
import { motion } from 'framer-motion'

interface StatCardProps {
  label: string
  value: string
  subvalue?: string
  delay?: number
}

function StatCard({ label, value, subvalue, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="card p-5"
    >
      <p className="text-sm text-[var(--text-secondary)] mb-2">{label}</p>
      <p className="text-2xl font-semibold text-[var(--text-primary)] font-mono">
        {value}
      </p>
      {subvalue && (
        <p className="text-xs text-[var(--text-tertiary)] mt-1">{subvalue}</p>
      )}
    </motion.div>
  )
}

function StatCardSkeleton() {
  return (
    <div className="card p-5">
      <div className="h-4 w-20 rounded bg-[var(--bg-2)] mb-3" />
      <div className="h-7 w-28 rounded bg-[var(--bg-2)]" />
    </div>
  )
}

export function StatsCards() {
  const { data: stats, isLoading } = useReadContract({
    address: CONTRACTS.sepolia.mevaVault as `0x${string}`,
    abi: MEVA_VAULT_ABI,
    functionName: 'getStats',
  })

  const totalCollected = stats?.[0] ? formatEther(stats[0]) : '0'
  const totalDistributed = stats?.[1] ? formatEther(stats[1]) : '0'
  const currentEpoch = stats?.[2]?.toString() || '1'

  const pendingAmount = stats?.[0] && stats?.[1]
    ? formatEther(stats[0] - stats[1])
    : '0'

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCard
        label="Total Captured"
        value={`${parseFloat(totalCollected).toFixed(4)} ETH`}
        subvalue="All time"
        delay={0}
      />
      <StatCard
        label="Distributed"
        value={`${parseFloat(totalDistributed).toFixed(4)} ETH`}
        subvalue="Paid out"
        delay={0.05}
      />
      <StatCard
        label="Pending"
        value={`${parseFloat(pendingAmount).toFixed(4)} ETH`}
        subvalue="Claimable"
        delay={0.1}
      />
      <StatCard
        label="Epoch"
        value={`#${currentEpoch}`}
        subvalue="Current cycle"
        delay={0.15}
      />
    </div>
  )
}
