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

// start server
server.listen(PORT, () => {
  console.log(`[server] listening on port ${PORT}`)
  console.log(`[server] websocket at ws://localhost:${PORT}/ws`)

  // start event indexer
  startIndexer(DEFAULT_CHAIN)
})
