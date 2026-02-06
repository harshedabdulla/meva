import { useState, useEffect } from 'react'
import { useAccount, useChainId, useReadContract } from 'wagmi'
import { formatEther, parseEther } from 'viem'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Loader2, Check, AlertCircle, Zap, ChevronDown } from 'lucide-react'
import { getContracts, MEVA_VAULT_ABI } from '../../lib/contracts'
import { SUPPORTED_CHAINS, getCrossChainQuote, type CrossChainQuote, ChainId } from '../../lib/lifi'

export function CrossChainClaim() {
  const { address, isConnected } = useAccount()
  const currentChainId = useChainId()
  const contracts = getContracts(currentChainId)

  const [destinationChain, setDestinationChain] = useState(ChainId.ARB)
  const [showChainSelect, setShowChainSelect] = useState(false)
  const [quote, setQuote] = useState<CrossChainQuote | null>(null)
  const [isLoadingQuote, setIsLoadingQuote] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const [txSuccess, setTxSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get user's pending claims
  const { data: lpDividend } = useReadContract({
    address: contracts.mevaVault,
    abi: MEVA_VAULT_ABI,
    functionName: 'pendingLPDividend',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })

  const { data: rebate } = useReadContract({
    address: contracts.mevaVault,
    abi: MEVA_VAULT_ABI,
    functionName: 'pendingRebate',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })

  const lpAmount = lpDividend ? formatEther(lpDividend) : '0'
  const rebateAmount = rebate ? formatEther(rebate) : '0'
  const totalClaimable = parseFloat(lpAmount) + parseFloat(rebateAmount)

  // Fetch quote when destination chain or amount changes
  useEffect(() => {
    if (!address || totalClaimable <= 0 || destinationChain === currentChainId) {
      setQuote(null)
      return
    }

    const fetchQuote = async () => {
      setIsLoadingQuote(true)
      setError(null)
      try {
        const amountWei = parseEther(totalClaimable.toString()).toString()
        const q = await getCrossChainQuote(
          currentChainId,
          destinationChain,
          amountWei,
          address
        )
        setQuote(q)
      } catch {
        setError('Failed to fetch quote')
      } finally {
        setIsLoadingQuote(false)
      }
    }

    const debounce = setTimeout(fetchQuote, 500)
    return () => clearTimeout(debounce)
  }, [address, totalClaimable, destinationChain, currentChainId])

  const handleClaimAndBridge = async () => {
    if (!quote || !address) return

    setIsExecuting(true)
    setError(null)

    try {
      // In a real implementation, this would:
      // 1. Call claimLPDividend and claimRebate on the vault
      // 2. Execute the Li.Fi cross-chain transfer
      // For demo, we'll simulate the flow
      await new Promise(resolve => setTimeout(resolve, 2000))
      setTxSuccess(true)
      setTimeout(() => setTxSuccess(false), 5000)
    } catch (err) {
      setError('Transaction failed')
      console.error(err)
    } finally {
      setIsExecuting(false)
    }
  }

  const selectedChain = SUPPORTED_CHAINS.find(c => c.id === destinationChain)
  const sourceChainName = currentChainId === 11155111 ? 'Sepolia' : 'Ethereum'

  if (!isConnected) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6 text-center"
      >
        <div className="w-12 h-12 rounded-2xl bg-[var(--bg-2)] flex items-center justify-center mx-auto mb-4">
          <Zap className="w-5 h-5 text-[var(--text-tertiary)]" />
        </div>
        <p className="text-sm text-[var(--text-secondary)]">Connect wallet for cross-chain claiming</p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="card"
      role="region"
      aria-label="Cross-chain claim"
    >
      {/* Header */}
      <div className="p-5 border-b border-[var(--border-1)]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-[rgba(76,130,251,0.1)] flex items-center justify-center">
            <Zap className="w-5 h-5 text-[var(--blue)]" />
          </div>
          <div>
            <h2 className="font-semibold text-[var(--text-primary)]">Cross-Chain Claim</h2>
            <p className="text-xs text-[var(--text-tertiary)]">Claim rewards on any chain via Li.Fi</p>
          </div>
        </div>

        {/* Amount */}
        <div className="card-surface p-4 rounded-xl">
          <p className="text-xs text-[var(--text-tertiary)] mb-1">Available to Claim</p>
          <p className="text-2xl font-semibold font-mono text-[var(--pink-500)]">
            {totalClaimable.toFixed(4)} <span className="text-base text-[var(--text-secondary)]">ETH</span>
          </p>
        </div>
      </div>

      {/* Chain Selection */}
      <div className="p-5 border-b border-[var(--border-1)]">
        <p className="text-xs text-[var(--text-tertiary)] mb-3">Bridge Route</p>

        <div className="flex items-center gap-3">
          {/* Source Chain */}
          <div className="flex-1 card-surface p-3 rounded-xl">
            <p className="text-xs text-[var(--text-tertiary)] mb-1">From</p>
            <p className="text-sm font-medium text-[var(--text-primary)]">{sourceChainName}</p>
          </div>

          <ArrowRight className="w-5 h-5 text-[var(--text-tertiary)]" aria-hidden="true" />

          {/* Destination Chain */}
          <div className="flex-1 relative">
            <button
              onClick={() => setShowChainSelect(!showChainSelect)}
              className="w-full card-surface p-3 rounded-xl text-left hover:border-[var(--border-2)] transition-colors"
              aria-expanded={showChainSelect}
              aria-haspopup="listbox"
            >
              <p className="text-xs text-[var(--text-tertiary)] mb-1">To</p>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  {selectedChain?.name || 'Select'}
                </p>
                <ChevronDown className="w-4 h-4 text-[var(--text-tertiary)]" aria-hidden="true" />
              </div>
            </button>

            <AnimatePresence>
              {showChainSelect && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowChainSelect(false)}
                    aria-hidden="true"
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute top-full left-0 right-0 mt-2 card-elevated p-2 z-20"
                    role="listbox"
                  >
                    {SUPPORTED_CHAINS.filter(c => c.id !== currentChainId).map((chain) => (
                      <button
                        key={chain.id}
                        onClick={() => {
                          setDestinationChain(chain.id)
                          setShowChainSelect(false)
                        }}
                        role="option"
                        aria-selected={chain.id === destinationChain}
                        className={`w-full px-3 py-2.5 text-left text-sm rounded-xl transition-colors flex items-center gap-2 ${
                          chain.id === destinationChain
                            ? 'bg-[var(--blue)]/10 text-[var(--blue)]'
                            : 'hover:bg-[var(--bg-2)] text-[var(--text-secondary)]'
                        }`}
                      >
                        {chain.name}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Quote Details */}
      <div className="p-5 border-b border-[var(--border-1)]">
        <p className="text-xs text-[var(--text-tertiary)] mb-3">Bridge Quote</p>

        {isLoadingQuote ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-[var(--text-tertiary)]" />
            <span className="ml-2 text-sm text-[var(--text-tertiary)]">Fetching best route...</span>
          </div>
        ) : quote ? (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-tertiary)]">You'll receive</span>
              <span className="font-mono text-[var(--green)]">
                ~{parseFloat(formatEther(BigInt(quote.toAmount))).toFixed(4)} ETH
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-tertiary)]">Bridge fee</span>
              <span className="font-mono text-[var(--text-secondary)]">
                ~{(totalClaimable - parseFloat(formatEther(BigInt(quote.toAmount)))).toFixed(4)} ETH
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-tertiary)]">Est. time</span>
              <span className="text-[var(--text-secondary)]">
                ~{Math.ceil(quote.executionDuration / 60)} min
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-tertiary)]">Via</span>
              <span className="badge badge-blue text-xs">{quote.toolUsed}</span>
            </div>
          </div>
        ) : totalClaimable > 0 ? (
          <p className="text-sm text-[var(--text-tertiary)] text-center py-4">
            Select a destination chain to see quote
          </p>
        ) : (
          <p className="text-sm text-[var(--text-tertiary)] text-center py-4">
            No rewards available to claim
          </p>
        )}
      </div>

      {/* Action */}
      <div className="p-5">
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-[rgba(255,95,82,0.1)] border border-[rgba(255,95,82,0.2)] mb-4">
            <AlertCircle className="w-4 h-4 text-[var(--red)]" />
            <p className="text-xs text-[var(--red)]">{error}</p>
          </div>
        )}

        {txSuccess && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-[rgba(33,201,94,0.1)] border border-[rgba(33,201,94,0.2)] mb-4">
            <Check className="w-4 h-4 text-[var(--green)]" />
            <p className="text-xs text-[var(--green)]">Successfully claimed and bridged!</p>
          </div>
        )}

        <button
          onClick={handleClaimAndBridge}
          disabled={!quote || isExecuting || totalClaimable <= 0}
          className="btn btn-primary w-full"
          aria-busy={isExecuting}
        >
          {isExecuting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              Claiming & Bridging...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" aria-hidden="true" />
              Claim & Bridge to {selectedChain?.name}
            </>
          )}
        </button>

        <p className="text-xs text-[var(--text-tertiary)] text-center mt-3">
          Powered by Li.Fi cross-chain aggregator
        </p>
      </div>
    </motion.div>
  )
}
