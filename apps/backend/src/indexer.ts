import { createPublicClient, http, parseAbiItem, formatEther, type Address, type Log } from 'viem'
import { sepolia, mainnet } from 'viem/chains'
import { CONTRACTS, RPC_URLS, MEVA_VAULT_ABI, MEVA_HOOK_ABI, BOT_REGISTRY_ABI } from './config.js'

export interface MevCapture {
  id: string
  bot: Address
  confidence: number
  taxRate: number
  taxAmount: string
  txHash: string
  blockNumber: string
  timestamp: number
}

export interface BotInfo {
  address: Address
  isLicensed: boolean
  totalTaxPaid: string
  captureCount: number
}

// in-memory storage (replace with database for production)
const captures: MevCapture[] = []
const bots: Map<Address, BotInfo> = new Map()
let totalCaptured = BigInt(0)
let totalDistributed = BigInt(0)
let currentEpoch = BigInt(0)

// websocket broadcast function (set by main server)
let broadcastFn: ((event: string, data: unknown) => void) | null = null

export function setBroadcast(fn: (event: string, data: unknown) => void) {
  broadcastFn = fn
}

function broadcast(event: string, data: unknown) {
  if (broadcastFn) {
    broadcastFn(event, data)
  }
}

// create clients for each chain
const clients = {
  mainnet: createPublicClient({
    chain: mainnet,
    transport: http(RPC_URLS.mainnet),
  }),
  sepolia: createPublicClient({
    chain: sepolia,
    transport: http(RPC_URLS.sepolia),
  }),
}

export function getClient(chain: 'mainnet' | 'sepolia') {
  return clients[chain]
}

// watch for MevCaptured events
export async function startIndexer(chain: 'mainnet' | 'sepolia' = 'sepolia') {
  const client = clients[chain]
  const contracts = CONTRACTS[chain]

  // skip if contracts not deployed (zero addresses)
  if (contracts.mevaHook === '0x0000000000000000000000000000000000000000') {
    console.log(`[indexer] contracts not deployed on ${chain}, running in demo mode`)
    startDemoMode()
    return
  }

  console.log(`[indexer] watching for events on ${chain}`)

  // watch MevCaptured events from hook
  client.watchEvent({
    address: contracts.mevaHook,
    event: parseAbiItem('event MevCaptured(address indexed bot, uint256 confidence, uint256 taxRate, uint256 taxAmount)'),
    onLogs: (logs) => {
      for (const log of logs) {
        handleMevCaptured(log, chain)
      }
    },
  })

  // watch TaxReceived events from vault
  client.watchEvent({
    address: contracts.mevaVault,
    event: parseAbiItem('event TaxReceived(address indexed bot, address indexed token, uint256 amount)'),
    onLogs: (logs) => {
      for (const log of logs) {
        handleTaxReceived(log, chain)
      }
    },
  })

  // watch BotLicensed events
  client.watchEvent({
    address: contracts.botRegistry,
    event: parseAbiItem('event BotLicensed(address indexed bot, uint256 fee)'),
    onLogs: (logs) => {
      for (const log of logs) {
        handleBotLicensed(log)
      }
    },
  })
}

function handleMevCaptured(log: Log, chain: string) {
  const args = (log as any).args
  const capture: MevCapture = {
    id: `${log.transactionHash}-${log.logIndex}`,
    bot: args.bot,
    confidence: Number(args.confidence),
    taxRate: Number(args.taxRate),
    taxAmount: formatEther(args.taxAmount),
    txHash: log.transactionHash || '',
    blockNumber: (log.blockNumber || BigInt(0)).toString(),
    timestamp: Date.now(),
  }

  captures.unshift(capture)
  if (captures.length > 1000) captures.pop()

  totalCaptured += args.taxAmount

  // update bot stats
  updateBotStats(args.bot, args.taxAmount)

  broadcast('capture', capture)
  console.log(`[indexer] MevCaptured: ${capture.bot} taxed ${capture.taxAmount} ETH`)
}

function handleTaxReceived(log: Log, chain: string) {
  const args = (log as any).args
  console.log(`[indexer] TaxReceived: ${args.bot} paid ${formatEther(args.amount)} tokens`)
}

function handleBotLicensed(log: Log) {
  const args = (log as any).args
  const bot = bots.get(args.bot)
  if (bot) {
    bot.isLicensed = true
  } else {
    bots.set(args.bot, {
      address: args.bot,
      isLicensed: true,
      totalTaxPaid: '0',
      captureCount: 0,
    })
  }
  broadcast('botLicensed', { bot: args.bot })
  console.log(`[indexer] BotLicensed: ${args.bot}`)
}

function updateBotStats(botAddress: Address, taxAmount: bigint) {
  const existing = bots.get(botAddress)
  if (existing) {
    existing.totalTaxPaid = formatEther(BigInt(Math.floor(parseFloat(existing.totalTaxPaid) * 1e18)) + taxAmount)
    existing.captureCount++
  } else {
    bots.set(botAddress, {
      address: botAddress,
      isLicensed: false,
      totalTaxPaid: formatEther(taxAmount),
      captureCount: 1,
    })
  }
}

// demo mode: generate fake events for testing
function startDemoMode() {
  console.log('[indexer] starting demo mode - generating fake captures')

  const demoAddresses: Address[] = [
    '0x1234567890123456789012345678901234567890',
    '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
    '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
    '0xcafebabecafebabecafebabecafebabecafebabe',
    '0xfeedfacefeedfacefeedfacefeedfacefeedface',
  ]

  setInterval(() => {
    const bot = demoAddresses[Math.floor(Math.random() * demoAddresses.length)]
    const confidence = 60 + Math.floor(Math.random() * 40)
    const taxRate = confidence >= 80 ? 5000 : confidence >= 60 ? 2500 : 1000
    const taxAmount = (0.01 + Math.random() * 0.5).toFixed(4)

    const capture: MevCapture = {
      id: `demo-${Date.now()}`,
      bot,
      confidence,
      taxRate,
      taxAmount,
      txHash: `0x${Math.random().toString(16).slice(2).padEnd(64, '0')}`,
      blockNumber: (Math.floor(Math.random() * 1000000) + 18000000).toString(),
      timestamp: Date.now(),
    }

    captures.unshift(capture)
    if (captures.length > 1000) captures.pop()

    totalCaptured += BigInt(Math.floor(parseFloat(taxAmount) * 1e18))
    updateBotStats(bot, BigInt(Math.floor(parseFloat(taxAmount) * 1e18)))

    broadcast('capture', capture)
  }, 5000 + Math.random() * 10000)
}

// api helpers
export function getCaptures(limit = 50): MevCapture[] {
  return captures.slice(0, limit)
}

export function getStats() {
  return {
    totalCaptured: formatEther(totalCaptured),
    totalDistributed: formatEther(totalDistributed),
    currentEpoch: Number(currentEpoch),
    captureCount: captures.length,
    botCount: bots.size,
  }
}

export function getBots(): BotInfo[] {
  return Array.from(bots.values()).sort((a, b) => parseFloat(b.totalTaxPaid) - parseFloat(a.totalTaxPaid))
}

export function getBot(address: Address): BotInfo | undefined {
  return bots.get(address)
}

export async function getDividends(address: Address, chain: 'mainnet' | 'sepolia' = 'sepolia') {
  const client = clients[chain]
  const contracts = CONTRACTS[chain]

  // if not deployed, return demo data
  if (contracts.mevaVault === '0x0000000000000000000000000000000000000000') {
    return {
      lpDividend: (Math.random() * 0.5).toFixed(4),
      victimRebate: (Math.random() * 0.1).toFixed(4),
      stakerReward: (Math.random() * 0.2).toFixed(4),
    }
  }

  const [lpDividend, victimRebate, stakerReward] = await Promise.all([
    client.readContract({
      address: contracts.mevaVault,
      abi: MEVA_VAULT_ABI,
      functionName: 'pendingLPDividend',
      args: [address],
    }),
    client.readContract({
      address: contracts.mevaVault,
      abi: MEVA_VAULT_ABI,
      functionName: 'pendingRebate',
      args: [address],
    }),
    client.readContract({
      address: contracts.mevaVault,
      abi: MEVA_VAULT_ABI,
      functionName: 'pendingStakerReward',
      args: [address],
    }),
  ])

  return {
    lpDividend: formatEther(lpDividend as bigint),
    victimRebate: formatEther(victimRebate as bigint),
    stakerReward: formatEther(stakerReward as bigint),
  }
}
