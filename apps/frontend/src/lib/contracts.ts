// contract addresses - update after deployment
// run: forge script script/Deploy.s.sol --rpc-url sepolia --broadcast --verify
export const CONTRACTS = {
  // Ethereum mainnet (chain id: 1)
  1: {
    mevaHook: '0x0000000000000000000000000000000000000000' as `0x${string}`,
    mevaVault: '0x0000000000000000000000000000000000000000' as `0x${string}`,
    botRegistry: '0x0000000000000000000000000000000000000000' as `0x${string}`,
    usdc: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' as `0x${string}`,
    poolManager: '0x000000000004444c5dc75cB358380D2e3dE08A90' as `0x${string}`,
  },
  // Sepolia testnet (chain id: 11155111) - DEPLOYED
  11155111: {
    mevaHook: '0x0000000000000000000000000000000000000000' as `0x${string}`, // TODO: deploy with CREATE2
    mevaVault: '0x3eb9675947365B89943bA008F217C7C505c460b4' as `0x${string}`,
    botRegistry: '0x509E6EcDFcdE208aBC2fEc61DCD583E61953Db2f' as `0x${string}`,
    usdc: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238' as `0x${string}`,
    poolManager: '0xE03A1074c86CFeDd5C142C4F04F1a1536e203543' as `0x${string}`,
  },
} as const

export type SupportedChainId = keyof typeof CONTRACTS

export function getContracts(chainId: number) {
  if (chainId in CONTRACTS) {
    return CONTRACTS[chainId as SupportedChainId]
  }
  // Default to Sepolia for demo
  return CONTRACTS[11155111]
}

// abis (minimal for now)
export const MEVA_VAULT_ABI = [
  {
    name: 'claimLPDividend',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [{ name: 'amount', type: 'uint256' }],
  },
  {
    name: 'claimRebate',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [{ name: 'amount', type: 'uint256' }],
  },
  {
    name: 'pendingLPDividend',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'lp', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'pendingRebate',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'victim', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'getStats',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      { name: 'totalCollected', type: 'uint256' },
      { name: 'totalDistributed', type: 'uint256' },
      { name: 'currentEpoch', type: 'uint256' },
    ],
  },
  {
    name: 'TaxReceived',
    type: 'event',
    inputs: [
      { name: 'bot', type: 'address', indexed: true },
      { name: 'token', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
    ],
  },
] as const

export const BOT_REGISTRY_ABI = [
  {
    name: 'registerAsLicensed',
    type: 'function',
    stateMutability: 'payable',
    inputs: [],
    outputs: [],
  },
  {
    name: 'isKnownBot',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'bot', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'isLicensed',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'bot', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'botCount',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'LICENSE_FEE',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const
