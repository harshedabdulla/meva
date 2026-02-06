import express from 'express'
import cors from 'cors'
import { WebSocketServer, WebSocket } from 'ws'
import { createServer } from 'http'
import { isAddress } from 'viem'

import { PORT, DEFAULT_CHAIN } from './config.js'
import {
  startIndexer,
  setBroadcast,
  getCaptures,
  getStats,
  getBots,
  getBot,
  getDividends,
} from './indexer.js'
import {
  connectToClearNode,
  createBotSession,
  recordTaxPayment,
  getPendingTaxes,
  settleTaxes,
  settleAllTaxes,
  getYellowStats,
  closeSession,
  getAllPendingPayments,
} from './yellow.js'

const app = express()
const server = createServer(app)

// websocket server
const wss = new WebSocketServer({ server, path: '/ws' })
const clients = new Set<WebSocket>()

wss.on('connection', (ws) => {
  console.log('[ws] client connected')
  clients.add(ws)

  // send recent captures on connect
  const recent = getCaptures(20)
  ws.send(JSON.stringify({ type: 'init', data: recent }))

  ws.on('close', () => {
    console.log('[ws] client disconnected')
    clients.delete(ws)
  })

  ws.on('error', (err) => {
    console.error('[ws] error:', err)
    clients.delete(ws)
  })
})

// broadcast to all connected clients
function broadcast(event: string, data: unknown) {
  const message = JSON.stringify({ type: event, data })
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message)
    }
  }
}

setBroadcast(broadcast)

// middleware
app.use(cors())
app.use(express.json())

// health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() })
})

// get protocol stats
app.get('/api/stats', (_req, res) => {
  const stats = getStats()
  res.json(stats)
})

// get recent captures
app.get('/api/captures', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit as string) || 50, 100)
  const captures = getCaptures(limit)
  res.json(captures)
})

// get all bots (leaderboard)
app.get('/api/bots', (_req, res) => {
  const bots = getBots()
  res.json(bots)
})

// get specific bot info
app.get('/api/bots/:address', (req, res) => {
  const { address } = req.params
  if (!isAddress(address)) {
    return res.status(400).json({ error: 'Invalid address' })
  }
  const bot = getBot(address as `0x${string}`)
  if (!bot) {
    return res.status(404).json({ error: 'Bot not found' })
  }
  res.json(bot)
})

// get user dividends
app.get('/api/dividends/:address', async (req, res) => {
  const { address } = req.params
  const chain = (req.query.chain as 'mainnet' | 'sepolia') || DEFAULT_CHAIN

  if (!isAddress(address)) {
    return res.status(400).json({ error: 'Invalid address' })
  }

  try {
    const dividends = await getDividends(address as `0x${string}`, chain)
    res.json(dividends)
  } catch (err) {
    console.error('[api] dividends error:', err)
    res.status(500).json({ error: 'Failed to fetch dividends' })
  }
})

// ============================================
// Yellow Network State Channel API
// ============================================

// Get Yellow Network status
app.get('/api/yellow/status', (_req, res) => {
  const stats = getYellowStats()
  res.json(stats)
})

// Get all pending off-chain payments
app.get('/api/yellow/pending', (_req, res) => {
  const payments = getAllPendingPayments()
  res.json({
    count: payments.length,
    payments: payments.slice(0, 50).map(p => ({
      ...p,
      amount: p.amount.toString(),
    })),
  })
})

// Create a session for a bot (off-chain tax channel)
app.post('/api/yellow/session', async (req, res) => {
  const { botAddress, initialDeposit } = req.body

  if (!botAddress || !isAddress(botAddress)) {
    return res.status(400).json({ error: 'Invalid bot address' })
  }

  try {
    const deposit = BigInt(initialDeposit || '100000000000000000') // 0.1 ETH default
    const session = await createBotSession(botAddress, deposit)
    res.json({
      sessionId: session.sessionId,
      participants: session.participants,
      createdAt: session.createdAt,
    })
  } catch (err) {
    console.error('[yellow] session creation error:', err)
    res.status(500).json({ error: 'Failed to create session' })
  }
})

// Record an off-chain tax payment
app.post('/api/yellow/tax', async (req, res) => {
  const { botAddress, amount, txHash } = req.body

  if (!botAddress || !isAddress(botAddress)) {
    return res.status(400).json({ error: 'Invalid bot address' })
  }

  if (!amount) {
    return res.status(400).json({ error: 'Amount required' })
  }

  try {
    const payment = await recordTaxPayment(botAddress, BigInt(amount), txHash)

    // Broadcast to connected clients
    broadcast('yellowTax', {
      botAddress: payment.botAddress,
      amount: payment.amount.toString(),
      timestamp: payment.timestamp,
    })

    res.json({
      success: true,
      payment: {
        ...payment,
        amount: payment.amount.toString(),
      },
    })
  } catch (err) {
    console.error('[yellow] tax recording error:', err)
    res.status(500).json({ error: 'Failed to record tax' })
  }
})

// Get pending taxes for a specific bot
app.get('/api/yellow/pending/:address', (req, res) => {
  const { address } = req.params

  if (!isAddress(address)) {
    return res.status(400).json({ error: 'Invalid address' })
  }

  const pending = getPendingTaxes(address)
  res.json({
    botAddress: address,
    pendingTax: pending.toString(),
  })
})

// Settle taxes for a specific bot (on-chain)
app.post('/api/yellow/settle/:address', async (req, res) => {
  const { address } = req.params

  if (!isAddress(address)) {
    return res.status(400).json({ error: 'Invalid address' })
  }

  try {
    const result = await settleTaxes(address)

    // Broadcast settlement
    broadcast('yellowSettlement', {
      botAddress: result.botAddress,
      amount: result.amount.toString(),
      txHash: result.txHash,
    })

    res.json({
      success: true,
      botAddress: result.botAddress,
      amount: result.amount.toString(),
      txHash: result.txHash,
    })
  } catch (err) {
    console.error('[yellow] settlement error:', err)
    res.status(500).json({ error: 'Failed to settle taxes' })
  }
})

// Settle all pending taxes (epoch settlement)
app.post('/api/yellow/settle-all', async (_req, res) => {
  try {
    const result = await settleAllTaxes()

    // Broadcast epoch settlement
    broadcast('yellowEpochSettlement', {
      totalSettled: result.totalSettled.toString(),
      botCount: result.botCount,
    })

    res.json({
      success: true,
      totalSettled: result.totalSettled.toString(),
      botCount: result.botCount,
      settlements: result.settlements.map(s => ({
        ...s,
        amount: s.amount.toString(),
      })),
    })
  } catch (err) {
    console.error('[yellow] epoch settlement error:', err)
    res.status(500).json({ error: 'Failed to settle all taxes' })
  }
})

// Close a bot's session
app.post('/api/yellow/close/:address', async (req, res) => {
  const { address } = req.params

  if (!isAddress(address)) {
    return res.status(400).json({ error: 'Invalid address' })
  }

  try {
    await closeSession(address)
    res.json({ success: true, message: 'Session closed' })
  } catch (err) {
    console.error('[yellow] close session error:', err)
    res.status(500).json({ error: 'Failed to close session' })
  }
})

// Demo endpoint: simulate random tax payments (for testing)
app.post('/api/yellow/demo', async (_req, res) => {
  const demoAddresses = [
    '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45',
    '0x1111111254EEB25477B68fb85Ed929f73A960582',
  ]

  const payments = []
  for (let i = 0; i < 3; i++) {
    const bot = demoAddresses[Math.floor(Math.random() * demoAddresses.length)]
    const amount = BigInt(Math.floor(Math.random() * 100000000000000000) + 10000000000000000) // 0.01-0.11 ETH

    const payment = await recordTaxPayment(bot, amount)
    payments.push({
      botAddress: payment.botAddress,
      amount: payment.amount.toString(),
      timestamp: payment.timestamp,
    })

    // Broadcast to connected clients
    broadcast('yellowTax', {
      botAddress: payment.botAddress,
      amount: payment.amount.toString(),
      timestamp: payment.timestamp,
    })
  }

  console.log('[yellow] demo: added', payments.length, 'simulated tax payments')
  res.json({ success: true, payments })
})

// start server
server.listen(PORT, async () => {
  console.log(`[server] listening on port ${PORT}`)
  console.log(`[server] websocket at ws://localhost:${PORT}/ws`)

  // start event indexer
  startIndexer(DEFAULT_CHAIN)

  // connect to Yellow Network (state channels)
  console.log('[server] connecting to Yellow Network...')
  const yellowConnected = await connectToClearNode()
  if (yellowConnected) {
    console.log('[server] Yellow Network connected - off-chain tax aggregation enabled')
  } else {
    console.log('[server] Yellow Network offline - running in demo mode')
  }
})
