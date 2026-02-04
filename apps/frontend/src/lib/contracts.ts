// contract addresses (update after deployment)
export const CONTRACTS = {
  mainnet: {
    mevaHook: '0x0000000000000000000000000000000000000000',
    mevaVault: '0x0000000000000000000000000000000000000000',
    botRegistry: '0x0000000000000000000000000000000000000000',
  },
  sepolia: {
    mevaHook: '0x0000000000000000000000000000000000000000',
    mevaVault: '0x0000000000000000000000000000000000000000',
    botRegistry: '0x0000000000000000000000000000000000000000',
  },
} as const

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
