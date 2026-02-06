/**
 * Yellow Network Integration for MEVA Protocol
 *
 * Uses Nitrolite state channels for off-chain tax aggregation.
 * Instead of settling every MEV tax on-chain, we:
 * 1. Track taxes off-chain in state channels
 * 2. Aggregate multiple transactions
 * 3. Settle to MevaVault once per epoch (or on demand)
 *
 * Benefits:
 * - Instant tax tracking (no gas per capture)
 * - Batch settlements save 90%+ on gas
 * - Real-time balance updates
 */

import { YELLOW_CONFIG } from './config.js'

// Types for Yellow Network integration
export interface TaxPayment {
  botAddress: string
  amount: bigint
  timestamp: number
  txHash?: string
}

export interface ChannelState {
  botAddress: string
  totalTaxOwed: bigint
  totalTaxPaid: bigint
  pendingPayments: TaxPayment[]
  lastSettlement: number
  channelId?: string
}

export interface YellowSession {
  sessionId: string
  participants: string[]
  allocations: Map<string, bigint>
  isActive: boolean
  createdAt: number
}

// In-memory state for demo (would be persisted in production)
const channelStates = new Map<string, ChannelState>()
const activeSessions = new Map<string, YellowSession>()

let wsConnection: WebSocket | null = null
let isConnected = false

/**
 * Connect to Yellow Network ClearNode
 */
export async function connectToClearNode(): Promise<boolean> {
  const url = YELLOW_CONFIG.useSandbox ? YELLOW_CONFIG.sandboxUrl : YELLOW_CONFIG.clearNodeUrl

  return new Promise((resolve) => {
    try {
      console.log('[yellow] connecting to ClearNode:', url)

      // Note: In browser/Node.js, you'd use the actual WebSocket
      // For demo, we simulate the connection
      wsConnection = new WebSocket(url)

      wsConnection.onopen = () => {
        console.log('[yellow] connected to ClearNode')
        isConnected = true
        resolve(true)
      }

      wsConnection.onmessage = (event) => {
        handleClearNodeMessage(JSON.parse(event.data.toString()))
      }

      wsConnection.onerror = (error) => {
        console.error('[yellow] connection error:', error)
        isConnected = false
        resolve(false)
      }

      wsConnection.onclose = () => {
        console.log('[yellow] disconnected from ClearNode')
        isConnected = false
      }
    } catch (error) {
      console.error('[yellow] failed to connect:', error)
      // For demo purposes, simulate connection
      isConnected = true
      console.log('[yellow] running in demo mode (simulated)')
      resolve(true)
    }
  })
}

/**
 * Handle incoming messages from ClearNode
 */
function handleClearNodeMessage(message: { type: string; data: unknown }) {
  switch (message.type) {
    case 'session_created':
      console.log('[yellow] session created:', message.data)
      break
    case 'payment':
      console.log('[yellow] payment received:', message.data)
      break
    case 'settlement':
      console.log('[yellow] settlement confirmed:', message.data)
      break
    case 'error':
      console.error('[yellow] error:', message.data)
      break
    default:
      console.log('[yellow] unknown message:', message)
  }
}

/**
 * Create a session for a bot to pay taxes off-chain
 */
export async function createBotSession(botAddress: string, initialDeposit: bigint): Promise<YellowSession> {
  const sessionId = `meva-${botAddress}-${Date.now()}`

  const session: YellowSession = {
    sessionId,
    participants: [botAddress, 'meva-vault'], // Bot and MEVA Vault
    allocations: new Map([
      [botAddress, initialDeposit],
      ['meva-vault', BigInt(0)],
    ]),
    isActive: true,
    createdAt: Date.now(),
  }

  activeSessions.set(sessionId, session)

  // Initialize channel state for this bot
  if (!channelStates.has(botAddress)) {
    channelStates.set(botAddress, {
      botAddress,
      totalTaxOwed: BigInt(0),
      totalTaxPaid: BigInt(0),
      pendingPayments: [],
      lastSettlement: Date.now(),
    })
  }

  console.log('[yellow] created session for bot:', botAddress)

  // In production, this would send a message to ClearNode
  // await sendToClearNode({ type: 'create_session', data: session })

  return session
}

/**
 * Record a tax payment off-chain (instant, no gas)
 */
export async function recordTaxPayment(
  botAddress: string,
  amount: bigint,
  txHash?: string
): Promise<TaxPayment> {
  const payment: TaxPayment = {
    botAddress,
    amount,
    timestamp: Date.now(),
    txHash,
  }

  // Update channel state
  let state = channelStates.get(botAddress)
  if (!state) {
    state = {
      botAddress,
      totalTaxOwed: BigInt(0),
      totalTaxPaid: BigInt(0),
      pendingPayments: [],
      lastSettlement: Date.now(),
    }
    channelStates.set(botAddress, state)
  }

  state.totalTaxOwed += amount
  state.pendingPayments.push(payment)

  console.log(`[yellow] recorded tax payment: ${botAddress} owes ${amount}`)

  // In production, this would update the state channel
  // await updateChannelState(botAddress, state)

  return payment
}

/**
 * Get pending taxes for a bot (off-chain balance)
 */
export function getPendingTaxes(botAddress: string): bigint {
  const state = channelStates.get(botAddress)
  return state ? state.totalTaxOwed - state.totalTaxPaid : BigInt(0)
}

/**
 * Get all pending payments for settlement
 */
export function getAllPendingPayments(): TaxPayment[] {
  const allPayments: TaxPayment[] = []
  for (const state of channelStates.values()) {
    allPayments.push(...state.pendingPayments)
  }
  return allPayments.sort((a, b) => b.timestamp - a.timestamp)
}

/**
 * Settle taxes on-chain (batch settlement)
 * Called at epoch end or when bot wants to withdraw
 */
export async function settleTaxes(botAddress: string): Promise<{
  botAddress: string
  amount: bigint
  txHash: string | null
}> {
  const state = channelStates.get(botAddress)
  if (!state || state.pendingPayments.length === 0) {
    return { botAddress, amount: BigInt(0), txHash: null }
  }

  const totalToSettle = state.totalTaxOwed - state.totalTaxPaid

  console.log(`[yellow] settling ${totalToSettle} for bot ${botAddress}`)

  // In production, this would:
  // 1. Close the state channel cooperatively
  // 2. Submit the final state to MevaVault contract
  // 3. Clear the pending payments

  // Simulate settlement
  state.totalTaxPaid = state.totalTaxOwed
  state.pendingPayments = []
  state.lastSettlement = Date.now()

  // Return mock transaction hash for demo
  const mockTxHash = `0x${Date.now().toString(16)}${'0'.repeat(48)}`

  return {
    botAddress,
    amount: totalToSettle,
    txHash: mockTxHash,
  }
}

/**
 * Settle all pending taxes (epoch settlement)
 */
export async function settleAllTaxes(): Promise<{
  totalSettled: bigint
  botCount: number
  settlements: Array<{ botAddress: string; amount: bigint }>
}> {
  const settlements: Array<{ botAddress: string; amount: bigint }> = []
  let totalSettled = BigInt(0)

  for (const [botAddress, state] of channelStates.entries()) {
    const pending = state.totalTaxOwed - state.totalTaxPaid
    if (pending > BigInt(0)) {
      const result = await settleTaxes(botAddress)
      settlements.push({ botAddress, amount: result.amount })
      totalSettled += result.amount
    }
  }

  console.log(`[yellow] epoch settlement: ${settlements.length} bots, ${totalSettled} total`)

  return {
    totalSettled,
    botCount: settlements.length,
    settlements,
  }
}

/**
 * Get Yellow Network status and stats
 */
export function getYellowStats() {
  let totalPending = BigInt(0)
  let totalSettled = BigInt(0)
  let activeChannels = 0

  for (const state of channelStates.values()) {
    totalPending += state.totalTaxOwed - state.totalTaxPaid
    totalSettled += state.totalTaxPaid
    if (state.pendingPayments.length > 0) {
      activeChannels++
    }
  }

  return {
    isConnected,
    activeChannels,
    activeSessions: activeSessions.size,
    totalPendingTax: totalPending.toString(),
    totalSettledTax: totalSettled.toString(),
    pendingPayments: getAllPendingPayments().length,
  }
}

/**
 * Close a bot's session and settle remaining balance
 */
export async function closeSession(botAddress: string): Promise<void> {
  // Settle any remaining taxes
  await settleTaxes(botAddress)

  // Find and close the session
  for (const [sessionId, session] of activeSessions.entries()) {
    if (session.participants.includes(botAddress)) {
      session.isActive = false
      activeSessions.delete(sessionId)
      console.log(`[yellow] closed session ${sessionId} for bot ${botAddress}`)
    }
  }
}

// Export connection status
export const isYellowConnected = () => isConnected
