import { createConfig, ChainId, getQuote } from '@lifi/sdk'

// Initialize Li.Fi SDK
createConfig({
  integrator: 'meva-protocol',
})

// Supported destination chains for cross-chain claiming
export const SUPPORTED_CHAINS = [
  { id: ChainId.ETH, name: 'Ethereum', symbol: 'ETH', logo: '/chains/ethereum.svg' },
  { id: ChainId.ARB, name: 'Arbitrum', symbol: 'ETH', logo: '/chains/arbitrum.svg' },
  { id: ChainId.OPT, name: 'Optimism', symbol: 'ETH', logo: '/chains/optimism.svg' },
  { id: ChainId.BAS, name: 'Base', symbol: 'ETH', logo: '/chains/base.svg' },
  { id: ChainId.POL, name: 'Polygon', symbol: 'MATIC', logo: '/chains/polygon.svg' },
] as const

// Native token addresses (zero address for ETH/native)
const NATIVE_TOKEN = '0x0000000000000000000000000000000000000000'

export interface CrossChainQuote {
  fromChainId: number
  toChainId: number
  fromAmount: string
  toAmount: string
  toAmountMin: string
  estimatedGas: string
  executionDuration: number
  toolUsed: string
}

export async function getCrossChainQuote(
  fromChainId: number,
  toChainId: number,
  fromAmount: string,
  fromAddress: string
): Promise<CrossChainQuote | null> {
  try {
    const quote = await getQuote({
      fromChain: fromChainId,
      toChain: toChainId,
      fromToken: NATIVE_TOKEN,
      toToken: NATIVE_TOKEN,
      fromAmount,
      fromAddress,
    })

    return {
      fromChainId,
      toChainId,
      fromAmount,
      toAmount: quote.estimate.toAmount,
      toAmountMin: quote.estimate.toAmountMin,
      estimatedGas: quote.estimate.gasCosts?.[0]?.amount || '0',
      executionDuration: quote.estimate.executionDuration,
      toolUsed: quote.toolDetails.name,
    }
  } catch (error) {
    console.error('Failed to get Li.Fi quote:', error)
    return null
  }
}

// Note: In production, this would use executeRoute from @lifi/sdk
// For demo purposes, we show the quote and simulate execution
export async function executeCrossChainTransfer(
  _fromChainId: number,
  _toChainId: number,
  _fromAmount: string,
  _fromAddress: string
): Promise<{ txHash: string } | null> {
  // Demo implementation - in production would integrate with wallet
  console.log('Cross-chain transfer would execute here')
  return { txHash: '0x' + '0'.repeat(64) }
}

export function getChainName(chainId: number): string {
  const chain = SUPPORTED_CHAINS.find(c => c.id === chainId)
  return chain?.name || 'Unknown'
}

export { ChainId }
