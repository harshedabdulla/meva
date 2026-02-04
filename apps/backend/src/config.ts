// contract addresses (update after deployment)
export const CONTRACTS = {
  mainnet: {
    mevaHook: '0x0000000000000000000000000000000000000000' as const,
    mevaVault: '0x0000000000000000000000000000000000000000' as const,
    botRegistry: '0x0000000000000000000000000000000000000000' as const,
  },
  sepolia: {
    mevaHook: '0x0000000000000000000000000000000000000000' as const,
    mevaVault: '0x0000000000000000000000000000000000000000' as const,
    botRegistry: '0x0000000000000000000000000000000000000000' as const,
  },
} as const

export const RPC_URLS = {
  mainnet: process.env.MAINNET_RPC_URL || 'https://eth.llamarpc.com',
  sepolia: process.env.SEPOLIA_RPC_URL || 'https://rpc.sepolia.org',
} as const

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
    name: 'pendingStakerReward',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'staker', type: 'address' }],
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
  {
    name: 'DividendClaimed',
    type: 'event',
    inputs: [
      { name: 'claimant', type: 'address', indexed: true },
      { name: 'claimType', type: 'uint8', indexed: true },
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
    name: 'botList',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'index', type: 'uint256' }],
    outputs: [{ name: '', type: 'address' }],
  },
  {
    name: 'taxPaidByBot',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'bot', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'LICENSE_FEE',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'BotAdded',
    type: 'event',
    inputs: [{ name: 'bot', type: 'address', indexed: true }],
  },
  {
    name: 'BotLicensed',
    type: 'event',
    inputs: [
      { name: 'bot', type: 'address', indexed: true },
      { name: 'fee', type: 'uint256', indexed: false },
    ],
  },
] as const

export const MEVA_HOOK_ABI = [
  {
    name: 'MevCaptured',
    type: 'event',
    inputs: [
      { name: 'bot', type: 'address', indexed: true },
      { name: 'confidence', type: 'uint256', indexed: false },
      { name: 'taxRate', type: 'uint256', indexed: false },
      { name: 'taxAmount', type: 'uint256', indexed: false },
    ],
  },
  {
    name: 'taxPaidByBot',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'bot', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const

export const PORT = process.env.PORT || 3001
export const DEFAULT_CHAIN = 'sepolia' as const
