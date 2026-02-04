import { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { parseEther } from 'viem'
import { motion } from 'framer-motion'
import { Bot, Check, Loader2, AlertCircle, Shield } from 'lucide-react'
import { CONTRACTS, BOT_REGISTRY_ABI } from '../../lib/contracts'

export function RegisterBot() {
  const { address, isConnected } = useAccount()
  const [showConfirm, setShowConfirm] = useState(false)

  const { data: licenseFee } = useReadContract({
    address: CONTRACTS.sepolia.botRegistry as `0x${string}`,
    abi: BOT_REGISTRY_ABI,
    functionName: 'LICENSE_FEE',
  })

  const { data: isLicensed, refetch: refetchLicense } = useReadContract({
    address: CONTRACTS.sepolia.botRegistry as `0x${string}`,
    abi: BOT_REGISTRY_ABI,
    functionName: 'isLicensed',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })

  const { data: isKnownBot } = useReadContract({
    address: CONTRACTS.sepolia.botRegistry as `0x${string}`,
    abi: BOT_REGISTRY_ABI,
    functionName: 'isKnownBot',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })

  const { writeContract, data: txHash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash })

  const handleRegister = () => {
    if (!showConfirm) {
      setShowConfirm(true)
      return
    }

    writeContract({
      address: CONTRACTS.sepolia.botRegistry as `0x${string}`,
      abi: BOT_REGISTRY_ABI,
      functionName: 'registerAsLicensed',
      value: licenseFee || parseEther('0.1'),
    })
    setShowConfirm(false)
  }

  if (isSuccess) {
    refetchLicense()
  }

  const fee = licenseFee ? Number(licenseFee) / 1e18 : 0.1

  // Already licensed
  if (isLicensed) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.35 }}
        className="card p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-[rgba(33,201,94,0.1)] flex items-center justify-center">
            <Shield className="w-5 h-5 text-[var(--green)]" />
          </div>
          <div>
            <h2 className="font-semibold text-[var(--text-primary)]">Licensed Bot</h2>
            <p className="text-xs text-[var(--text-tertiary)]">Reduced tax rate active</p>
          </div>
        </div>
        <div className="card-surface p-4">
          <div className="flex items-center gap-2 mb-2">
            <Check className="w-4 h-4 text-[var(--green)]" />
            <span className="text-sm text-[var(--green)] font-medium">License Active</span>
          </div>
          <p className="text-xs text-[var(--text-tertiary)]">
            Your bot address is licensed. You pay only 10% tax instead of 50% on detected MEV.
          </p>
        </div>
        <div className="mt-4 p-3 rounded-xl bg-[var(--bg-2)]">
          <div className="flex justify-between text-xs">
            <span className="text-[var(--text-tertiary)]">Your Tax Rate</span>
            <span className="font-mono text-[var(--green)]">10%</span>
          </div>
          <div className="flex justify-between text-xs mt-2">
            <span className="text-[var(--text-tertiary)]">Unlicensed Rate</span>
            <span className="font-mono text-[var(--text-secondary)]">50%</span>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.35 }}
      className="card p-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-2xl bg-[var(--bg-2)] flex items-center justify-center">
          <Bot className="w-5 h-5 text-[var(--pink-500)]" />
        </div>
        <div>
          <h2 className="font-semibold text-[var(--text-primary)]">Bot License</h2>
          <p className="text-xs text-[var(--text-tertiary)]">Register for reduced tax</p>
        </div>
      </div>

      {/* Info card */}
      <div className="card-surface p-4 mb-4">
        <p className="text-sm text-[var(--text-secondary)] mb-3">
          Licensed bots pay a reduced tax rate on MEV captures. Register your bot address to lower your operating costs.
        </p>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--text-tertiary)]">Unlicensed Tax</span>
            <span className="font-mono text-[var(--red)]">50%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--text-tertiary)]">Licensed Tax</span>
            <span className="font-mono text-[var(--green)]">10%</span>
          </div>
          <div className="flex justify-between text-sm pt-2 border-t border-[var(--border-1)]">
            <span className="text-[var(--text-tertiary)]">License Fee</span>
            <span className="font-mono text-[var(--pink-500)]">{fee} ETH</span>
          </div>
        </div>
      </div>

      {/* Known bot notice */}
      {isKnownBot && !isLicensed && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-[rgba(255,137,52,0.1)] border border-[rgba(255,137,52,0.2)] mb-4">
          <AlertCircle className="w-4 h-4 text-[var(--orange)] flex-shrink-0 mt-0.5" />
          <p className="text-xs text-[var(--orange)]">
            Your address is flagged as a known bot. Register to reduce your tax rate from 50% to 10%.
          </p>
        </div>
      )}

      {/* Confirm dialog */}
      {showConfirm && (
        <div className="p-3 rounded-xl bg-[var(--bg-2)] border border-[var(--border-2)] mb-4">
          <p className="text-sm text-[var(--text-secondary)] mb-2">
            Confirm registration for <span className="font-mono text-[var(--text-primary)]">{fee} ETH</span>?
          </p>
          <div className="flex gap-2">
            <button onClick={handleRegister} className="btn btn-primary btn-sm flex-1">
              Confirm
            </button>
            <button onClick={() => setShowConfirm(false)} className="btn btn-secondary btn-sm flex-1">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-[rgba(255,95,82,0.1)] border border-[rgba(255,95,82,0.2)] mb-4">
          <AlertCircle className="w-4 h-4 text-[var(--red)] flex-shrink-0 mt-0.5" />
          <p className="text-xs text-[var(--red)]">{error.message.slice(0, 100)}</p>
        </div>
      )}

      {/* Success */}
      {isSuccess && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-[rgba(33,201,94,0.1)] border border-[rgba(33,201,94,0.2)] mb-4">
          <Check className="w-4 h-4 text-[var(--green)]" />
          <p className="text-xs text-[var(--green)]">License registered successfully!</p>
        </div>
      )}

      {/* Button */}
      {!isConnected ? (
        <p className="text-sm text-[var(--text-tertiary)] text-center py-3">
          Connect wallet to register
        </p>
      ) : (
        <button
          onClick={handleRegister}
          disabled={isPending || isConfirming || showConfirm}
          className="btn btn-primary w-full"
        >
          {isPending || isConfirming ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {isConfirming ? 'Confirming...' : 'Registering...'}
            </>
          ) : (
            <>
              <Shield className="w-4 h-4" />
              Register License ({fee} ETH)
            </>
          )}
        </button>
      )}
    </motion.div>
  )
}
