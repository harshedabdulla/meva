import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi'
import { formatEther } from 'viem'
import { motion } from 'framer-motion'
import { Loader2, Check, Wallet } from 'lucide-react'
import { getContracts, MEVA_VAULT_ABI } from '../../lib/contracts'

interface ClaimRowProps {
  label: string
  description: string
  amount: string
  onClaim: () => void
  isLoading: boolean
  isSuccess: boolean
  disabled: boolean
}

function ClaimRow({ label, description, amount, onClaim, isLoading, isSuccess, disabled }: ClaimRowProps) {
  const hasAmount = parseFloat(amount) > 0
  const buttonLabel = isLoading ? `Claiming ${label}` : isSuccess ? `${label} claimed` : `Claim ${amount}`

  return (
    <div className="flex items-center justify-between py-4 border-b border-[var(--border-1)] last:border-0">
      <div>
        <p className="text-sm font-medium text-[var(--text-primary)]">{label}</p>
        <p className="text-xs text-[var(--text-tertiary)]">{description}</p>
      </div>
      <div className="flex items-center gap-4">
        <p
          className={`text-lg font-semibold font-mono ${hasAmount ? 'text-[var(--green)]' : 'text-[var(--text-tertiary)]'}`}
          aria-label={`${label}: ${amount}`}
        >
          {amount}
        </p>
        <button
          onClick={onClaim}
          disabled={disabled || isLoading || !hasAmount}
          className="btn btn-primary btn-sm min-w-[80px]"
          aria-label={buttonLabel}
          aria-busy={isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
          ) : isSuccess ? (
            <Check className="w-4 h-4" aria-hidden="true" />
          ) : (
            'Claim'
          )}
        </button>
      </div>
    </div>
  )
}

export function ClaimPanel() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const contracts = getContracts(chainId)

  const { data: lpDividend, refetch: refetchLp } = useReadContract({
    address: contracts.mevaVault,
    abi: MEVA_VAULT_ABI,
    functionName: 'pendingLPDividend',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })

  const { data: rebate, refetch: refetchRebate } = useReadContract({
    address: contracts.mevaVault,
    abi: MEVA_VAULT_ABI,
    functionName: 'pendingRebate',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })

  const { writeContract: claimLp, data: lpTxHash, isPending: lpPending } = useWriteContract()
  const { writeContract: claimRebate, data: rebateTxHash, isPending: rebatePending } = useWriteContract()

  const { isSuccess: lpSuccess } = useWaitForTransactionReceipt({ hash: lpTxHash })
  const { isSuccess: rebateSuccess } = useWaitForTransactionReceipt({ hash: rebateTxHash })

  const handleClaimLp = () => {
    claimLp({
      address: contracts.mevaVault,
      abi: MEVA_VAULT_ABI,
      functionName: 'claimLPDividend',
    })
  }

  const handleClaimRebate = () => {
    claimRebate({
      address: contracts.mevaVault,
      abi: MEVA_VAULT_ABI,
      functionName: 'claimRebate',
    })
  }

  if (lpSuccess) refetchLp()
  if (rebateSuccess) refetchRebate()

  const lpAmount = lpDividend ? formatEther(lpDividend) : '0'
  const rebateAmount = rebate ? formatEther(rebate) : '0'
  const totalClaimable = parseFloat(lpAmount) + parseFloat(rebateAmount)

  if (!isConnected) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.25 }}
        className="card p-8 text-center"
      >
        <div className="w-12 h-12 rounded-2xl bg-[var(--bg-2)] flex items-center justify-center mx-auto mb-4">
          <Wallet className="w-5 h-5 text-[var(--text-tertiary)]" />
        </div>
        <p className="text-sm text-[var(--text-secondary)]">Connect wallet to claim</p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.25 }}
      className="card h-[420px] flex flex-col"
      role="region"
      aria-label="Your claimable rewards"
    >
      {/* Header */}
      <div className="p-5 border-b border-[var(--border-1)]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-[var(--text-primary)]">Your Rewards</h2>
          {totalClaimable > 0 && <span className="badge badge-pink">Claimable</span>}
        </div>
        <div className="card-surface p-4">
          <p className="text-xs text-[var(--text-tertiary)] mb-1">Total Available</p>
          <p className="text-2xl font-semibold font-mono text-[var(--pink-500)]">
            {totalClaimable.toFixed(4)} <span className="text-base text-[var(--text-secondary)]">ETH</span>
          </p>
        </div>
      </div>

      {/* Claims */}
      <div className="px-5">
        <ClaimRow
          label="LP Dividends"
          description="50% share for LPs"
          amount={`${parseFloat(lpAmount).toFixed(4)} ETH`}
          onClaim={handleClaimLp}
          isLoading={lpPending}
          isSuccess={lpSuccess}
          disabled={!isConnected}
        />
        <ClaimRow
          label="Victim Rebates"
          description="30% for sandwich victims"
          amount={`${parseFloat(rebateAmount).toFixed(4)} ETH`}
          onClaim={handleClaimRebate}
          isLoading={rebatePending}
          isSuccess={rebateSuccess}
          disabled={!isConnected}
        />
      </div>

      {/* Footer */}
      <div className="mt-auto p-5 pt-3">
        <p className="text-xs text-[var(--text-tertiary)] text-right">
          Distribution: 50% LPs · 30% Victims · 20% Stakers
        </p>
      </div>
    </motion.div>
  )
}
