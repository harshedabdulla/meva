import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Book, Zap, Users, ExternalLink,
  ChevronRight, Copy, Check, Play, FileCode, Database,
  AlertTriangle, Lightbulb
} from 'lucide-react'

type Section = 'overview' | 'how-it-works' | 'quick-start' | 'concepts' | 'contracts' | 'api' | 'resources'

const SECTIONS = [
  { id: 'overview', label: 'Overview', icon: Book },
  { id: 'how-it-works', label: 'How It Works', icon: Zap },
  { id: 'quick-start', label: 'Quick Start', icon: Play },
  { id: 'concepts', label: 'Core Concepts', icon: Lightbulb },
  { id: 'contracts', label: 'Smart Contracts', icon: FileCode },
  { id: 'api', label: 'API Reference', icon: Database },
  { id: 'resources', label: 'Resources', icon: ExternalLink },
] as const

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative group">
      <pre className="bg-[var(--bg-2)] border border-[var(--border-1)] rounded-xl p-4 overflow-x-auto text-sm font-mono text-[var(--text-secondary)]">
        <code>{code}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 p-2 rounded-lg bg-[var(--bg-3)] opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {copied ? <Check className="w-4 h-4 text-[var(--text-secondary)]" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  )
}

function InfoBox({ type, children }: { type: 'info' | 'warning' | 'tip'; children: React.ReactNode }) {
  const icons = { info: Lightbulb, warning: AlertTriangle, tip: Check }
  const Icon = icons[type]

  return (
    <div className="flex gap-3 p-4 rounded-xl border border-[var(--border-1)] bg-[var(--bg-2)]">
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5 text-[var(--text-tertiary)]" />
      <div className="text-sm text-[var(--text-secondary)]">{children}</div>
    </div>
  )
}

function OverviewSection() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold mb-4">Welcome to MEVA</h1>
        <p className="text-lg text-[var(--text-secondary)] mb-6">
          MEV capture and redistribution protocol built on Uniswap V4.
        </p>
        <div className="card-surface p-6 rounded-xl">
          <p className="text-xl font-medium text-center text-[var(--text-secondary)]">
            "Don't fight MEV — <span className="text-[var(--text-primary)]">own it</span>."
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">The Problem</h2>
        <p className="text-[var(--text-secondary)] mb-4">
          Every time you swap tokens, bots may be watching and profiting from your trade:
        </p>
        <CodeBlock code={`You: Swap 10 ETH → USDC

Bot sees your transaction...
  1. Bot buys USDC first (price goes up)
  2. Your swap executes at worse price
  3. Bot sells USDC (profits from your loss)

Result: You lost ~$50, bot gained ~$50`} />
        <p className="text-sm text-[var(--text-tertiary)] mt-3">
          This is called a <strong>sandwich attack</strong>. It happens thousands of times daily.
        </p>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">The Solution</h2>
        <p className="text-[var(--text-secondary)] mb-4">
          MEVA is a Uniswap V4 hook that detects bots, taxes their profits, and redistributes to victims:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card-surface p-4 rounded-xl">
            <p className="text-sm text-[var(--text-tertiary)] mb-2">Without MEVA</p>
            <p className="font-mono text-[var(--text-secondary)]">User Loss → Bot Profit</p>
          </div>
          <div className="card-surface p-4 rounded-xl">
            <p className="text-sm text-[var(--text-tertiary)] mb-2">With MEVA</p>
            <p className="font-mono text-[var(--text-primary)]">User Loss → Bot Taxed → User Rebate</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Key Numbers</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Bot Tax (unlicensed)', value: '50%' },
            { label: 'Bot Tax (licensed)', value: '10%' },
            { label: 'LP Share', value: '50%' },
            { label: 'Victim Rebate', value: '30%' },
          ].map((stat) => (
            <div key={stat.label} className="card-surface p-4 rounded-xl text-center">
              <p className="text-2xl font-semibold font-mono">{stat.value}</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function HowItWorksSection() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold mb-4">How It Works</h1>
        <p className="text-[var(--text-secondary)]">
          MEVA operates in 5 steps: detect, classify, tax, distribute, claim.
        </p>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-[var(--bg-2)] border border-[var(--border-1)] flex items-center justify-center text-sm font-mono">1</span>
          Detection
        </h2>
        <p className="text-[var(--text-secondary)] mb-4">
          When a swap comes in, the hook analyzes multiple signals:
        </p>
        <div className="space-y-2">
          {[
            { signal: 'Known bot registry', points: '+100', desc: 'If address is registered as bot' },
            { signal: 'High gas price', points: '+35', desc: 'Paying 3x average = priority seeker' },
            { signal: 'Contract caller', points: '+25', desc: 'Bots typically use smart contracts' },
            { signal: 'Large swap amount', points: '+15', desc: 'Big trades attract attention' },
            { signal: 'Rapid-fire swaps', points: '+20', desc: 'Multiple swaps in same block' },
            { signal: 'High frequency', points: '+10', desc: 'History of many swaps' },
          ].map((item) => (
            <div key={item.signal} className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-2)] border border-[var(--border-1)]">
              <div>
                <p className="text-sm font-medium">{item.signal}</p>
                <p className="text-xs text-[var(--text-tertiary)]">{item.desc}</p>
              </div>
              <span className="font-mono text-sm text-[var(--text-secondary)]">{item.points}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-[var(--bg-2)] border border-[var(--border-1)] flex items-center justify-center text-sm font-mono">2</span>
          Classification
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[var(--text-tertiary)] border-b border-[var(--border-1)]">
                <th className="p-3">Confidence</th>
                <th className="p-3">Classification</th>
                <th className="p-3">Tax Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-1)]">
              <tr><td className="p-3">80-100</td><td className="p-3">Bot (unlicensed)</td><td className="p-3 font-mono">50%</td></tr>
              <tr><td className="p-3">80-100</td><td className="p-3">Bot (licensed)</td><td className="p-3 font-mono">10%</td></tr>
              <tr><td className="p-3">60-79</td><td className="p-3">Suspicious</td><td className="p-3 font-mono">25%</td></tr>
              <tr><td className="p-3">0-59</td><td className="p-3">Normal user</td><td className="p-3 font-mono">0.3%</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-[var(--bg-2)] border border-[var(--border-1)] flex items-center justify-center text-sm font-mono">3</span>
          Tax Collection
        </h2>
        <p className="text-[var(--text-secondary)] mb-4">
          Tax is applied via Uniswap V4's dynamic fee mechanism — no extra transactions needed.
        </p>
        <CodeBlock code={`// Simplified
function beforeSwap(sender, params) {
    confidence = analyzeTransaction(sender);
    taxRate = getTaxRate(confidence);
    return taxRate; // Applied automatically
}`} />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-[var(--bg-2)] border border-[var(--border-1)] flex items-center justify-center text-sm font-mono">4</span>
          Distribution
        </h2>
        <div className="card-surface p-6 rounded-xl">
          <p className="text-sm text-[var(--text-tertiary)] mb-4">Example: 100 ETH collected</p>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-full bg-[var(--bg-3)] rounded-full h-4 overflow-hidden flex">
                <div className="bg-[var(--text-tertiary)] h-full" style={{ width: '50%' }} />
                <div className="bg-[var(--text-secondary)] h-full" style={{ width: '30%' }} />
                <div className="bg-[var(--text-primary)] h-full" style={{ width: '20%' }} />
              </div>
            </div>
            <div className="flex justify-between text-sm text-[var(--text-secondary)]">
              <span>50 ETH → LPs</span>
              <span>30 ETH → Victims</span>
              <span>20 ETH → Stakers</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-[var(--bg-2)] border border-[var(--border-1)] flex items-center justify-center text-sm font-mono">5</span>
          Claiming
        </h2>
        <p className="text-[var(--text-secondary)]">
          Connect your wallet and claim your share from the dashboard. LPs claim based on liquidity share,
          victims claim identified rebates, stakers claim based on stake.
        </p>
      </div>
    </div>
  )
}

function QuickStartSection() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold mb-4">Quick Start</h1>
        <p className="text-[var(--text-secondary)]">Get MEVA running locally in 5 minutes.</p>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Prerequisites</h2>
        <ul className="space-y-2 text-[var(--text-secondary)]">
          <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[var(--text-tertiary)]" /> Node.js 18+</li>
          <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[var(--text-tertiary)]" /> Git</li>
          <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[var(--text-tertiary)]" /> Foundry (for contracts)</li>
        </ul>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">1. Clone & Install</h2>
        <CodeBlock code={`git clone https://github.com/your-org/meva.git
cd meva`} />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">2. Run Contract Tests</h2>
        <CodeBlock code={`cd contracts
forge install
forge test`} />
        <InfoBox type="tip">Expected output: 61 tests passing</InfoBox>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">3. Start Backend</h2>
        <CodeBlock code={`cd apps/backend
npm install
npm run dev`} />
        <p className="text-sm text-[var(--text-tertiary)] mt-2">Server runs at http://localhost:3001</p>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">4. Start Frontend</h2>
        <CodeBlock code={`cd apps/frontend
npm install
npm run dev`} />
        <p className="text-sm text-[var(--text-tertiary)] mt-2">Dashboard at http://localhost:5173</p>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Project Structure</h2>
        <CodeBlock code={`meva/
├── contracts/          # Smart contracts (Foundry)
│   ├── src/
│   │   ├── MevaHook.sol
│   │   ├── MevaVault.sol
│   │   └── BotRegistry.sol
│   └── test/           # 61 tests
├── apps/
│   ├── frontend/       # React dashboard
│   └── backend/        # Express API + WebSocket
└── docs/               # Documentation`} />
      </div>
    </div>
  )
}

function ConceptsSection() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold mb-4">Core Concepts</h1>
        <p className="text-[var(--text-secondary)]">Understanding the building blocks of MEVA.</p>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">What is MEV?</h2>
        <p className="text-[var(--text-secondary)] mb-4">
          <strong>MEV (Maximal Extractable Value)</strong> is profit extracted by reordering, inserting,
          or censoring transactions within a block.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { type: 'Sandwich', desc: 'Front-run + back-run a swap', impact: 'User gets worse price' },
            { type: 'Arbitrage', desc: 'Exploit price differences', impact: 'Generally neutral' },
            { type: 'Liquidation', desc: 'Liquidate underwater positions', impact: 'Borrower loses collateral' },
            { type: 'JIT Liquidity', desc: 'Add/remove around swaps', impact: 'Existing LPs diluted' },
          ].map((item) => (
            <div key={item.type} className="card-surface p-4 rounded-xl">
              <h3 className="font-semibold mb-1">{item.type}</h3>
              <p className="text-sm text-[var(--text-secondary)]">{item.desc}</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-2">{item.impact}</p>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <InfoBox type="info">
            <strong>$600M+</strong> has been extracted via MEV on Ethereum since 2020.
          </InfoBox>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">What is a Uniswap V4 Hook?</h2>
        <p className="text-[var(--text-secondary)] mb-4">
          Hooks are smart contracts that run at specific points during pool operations:
        </p>
        <CodeBlock code={`Pool Lifecycle
    │
    ├── beforeInitialize()
    ├── afterInitialize()
    │
    ├── beforeSwap()      ← MEVA detects bots here
    ├── afterSwap()       ← MEVA records captures here
    │
    └── beforeDonate() / afterDonate()`} />
        <p className="text-sm text-[var(--text-tertiary)] mt-3">
          MEVA uses <code className="text-[var(--text-primary)]">beforeSwap</code> to analyze and apply dynamic fees.
        </p>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Licensed vs Unlicensed Bots</h2>
        <p className="text-[var(--text-secondary)] mb-4">
          MEVA offers a licensing system for MEV operators:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card-surface p-4 rounded-xl border border-[var(--border-1)]">
            <h3 className="font-semibold mb-2">Unlicensed</h3>
            <p className="text-2xl font-mono mb-2">50% tax</p>
            <p className="text-sm text-[var(--text-tertiary)]">Default for all detected bots</p>
          </div>
          <div className="card-surface p-4 rounded-xl border border-[var(--border-1)]">
            <h3 className="font-semibold mb-2">Licensed</h3>
            <p className="text-2xl font-mono mb-2">10% tax</p>
            <p className="text-sm text-[var(--text-tertiary)]">One-time 0.1 ETH registration</p>
          </div>
        </div>
        <div className="mt-4">
          <InfoBox type="tip">
            Bots benefit from licensing: predictable costs, lower tax, legitimacy.
          </InfoBox>
        </div>
      </div>
    </div>
  )
}

function ContractsSection() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold mb-4">Smart Contracts</h1>
        <p className="text-[var(--text-secondary)]">Technical reference for MEVA's on-chain components.</p>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Contract Addresses</h2>
        <InfoBox type="warning">Addresses will be updated after deployment.</InfoBox>
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[var(--text-tertiary)] border-b border-[var(--border-1)]">
                <th className="p-3">Contract</th>
                <th className="p-3">Sepolia</th>
                <th className="p-3">Mainnet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-1)] font-mono">
              <tr><td className="p-3">MevaHook</td><td className="p-3 text-[var(--text-tertiary)]">0x...</td><td className="p-3 text-[var(--text-tertiary)]">0x...</td></tr>
              <tr><td className="p-3">MevaVault</td><td className="p-3 text-[var(--text-tertiary)]">0x...</td><td className="p-3 text-[var(--text-tertiary)]">0x...</td></tr>
              <tr><td className="p-3">BotRegistry</td><td className="p-3 text-[var(--text-tertiary)]">0x...</td><td className="p-3 text-[var(--text-tertiary)]">0x...</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">MevaHook.sol</h2>
        <p className="text-[var(--text-secondary)] mb-4">The core hook that integrates with Uniswap V4.</p>
        <h3 className="font-semibold mb-2 text-sm text-[var(--text-tertiary)]">Key Functions</h3>
        <CodeBlock code={`// Analyze transaction for bot signals
function analyzeTransaction(address sender)
    returns (uint256 confidence, bool isBot)

// Calculate tax based on confidence
function calculateTaxRate(uint256 confidence, bool isLicensed)
    returns (uint24 fee)

// Hook callback - applies dynamic fee
function beforeSwap(address, PoolKey, SwapParams, bytes)
    returns (bytes4, BeforeSwapDelta, uint24)`} />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">MevaVault.sol</h2>
        <p className="text-[var(--text-secondary)] mb-4">Handles dividend collection and distribution.</p>
        <h3 className="font-semibold mb-2 text-sm text-[var(--text-tertiary)]">Distribution Constants</h3>
        <CodeBlock code={`uint256 public constant LP_SHARE = 50;      // 50%
uint256 public constant VICTIM_SHARE = 30;  // 30%
uint256 public constant STAKER_SHARE = 20;  // 20%`} />
        <h3 className="font-semibold mb-2 mt-4 text-sm text-[var(--text-tertiary)]">Claim Functions</h3>
        <CodeBlock code={`function claimLPDividend() returns (uint256)
function claimRebate() returns (uint256)
function claimStakerReward() returns (uint256)

function pendingLPDividend(address) view returns (uint256)
function pendingRebate(address) view returns (uint256)
function pendingStakerReward(address) view returns (uint256)`} />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">BotRegistry.sol</h2>
        <p className="text-[var(--text-secondary)] mb-4">Tracks known bots and license status.</p>
        <CodeBlock code={`// Query functions
function isKnownBot(address) view returns (bool)
function isLicensed(address) view returns (bool)

// Registration (0.1 ETH fee)
function registerAsLicensed() payable`} />
      </div>
    </div>
  )
}

function ApiSection() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold mb-4">API Reference</h1>
        <p className="text-[var(--text-secondary)]">Backend endpoints and WebSocket events.</p>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Base URL</h2>
        <CodeBlock code="http://localhost:3001" />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">REST Endpoints</h2>

        <div className="space-y-4">
          <div className="card-surface p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[var(--bg-3)]">GET</span>
              <code className="text-sm">/api/stats</code>
            </div>
            <p className="text-sm text-[var(--text-tertiary)] mb-3">Protocol statistics</p>
            <CodeBlock code={`{
  "totalCaptured": "125.4532",
  "totalDistributed": "98.2100",
  "currentEpoch": 12,
  "captureCount": 1543,
  "botCount": 47
}`} />
          </div>

          <div className="card-surface p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[var(--bg-3)]">GET</span>
              <code className="text-sm">/api/captures?limit=50</code>
            </div>
            <p className="text-sm text-[var(--text-tertiary)] mb-3">Recent MEV captures</p>
            <CodeBlock code={`[{
  "id": "0xabc...-0",
  "bot": "0x1234...",
  "confidence": 85,
  "taxRate": 5000,
  "taxAmount": "0.2341",
  "txHash": "0xabc...",
  "blockNumber": "18543210",
  "timestamp": 1738765432000
}]`} />
          </div>

          <div className="card-surface p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[var(--bg-3)]">GET</span>
              <code className="text-sm">/api/bots</code>
            </div>
            <p className="text-sm text-[var(--text-tertiary)] mb-3">Bot leaderboard</p>
            <CodeBlock code={`[{
  "address": "0x1234...",
  "isLicensed": true,
  "totalTaxPaid": "12.4532",
  "captureCount": 342
}]`} />
          </div>

          <div className="card-surface p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[var(--bg-3)]">GET</span>
              <code className="text-sm">/api/dividends/:address</code>
            </div>
            <p className="text-sm text-[var(--text-tertiary)] mb-3">User dividend info</p>
            <CodeBlock code={`{
  "lpDividend": "0.5432",
  "victimRebate": "0.1234",
  "stakerReward": "0.0821"
}`} />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">WebSocket</h2>
        <CodeBlock code="ws://localhost:3001/ws" />
        <p className="text-[var(--text-secondary)] my-4">Events:</p>
        <div className="space-y-4">
          <div className="card-surface p-4 rounded-xl">
            <code className="text-sm font-mono">capture</code>
            <p className="text-sm text-[var(--text-tertiary)] mt-1">New MEV capture detected</p>
          </div>
          <div className="card-surface p-4 rounded-xl">
            <code className="text-sm font-mono">botLicensed</code>
            <p className="text-sm text-[var(--text-tertiary)] mt-1">Bot registered for license</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function ResourcesSection() {
  const resources = [
    {
      category: 'Learn MEV',
      items: [
        { name: 'Ethereum.org MEV', url: 'https://ethereum.org/developers/docs/mev/', level: 'Beginner' },
        { name: 'Chainlink Explainer', url: 'https://chain.link/education-hub/maximal-extractable-value-mev', level: 'Beginner' },
        { name: 'Flashbots Writings', url: 'https://writings.flashbots.net/', level: 'Intermediate' },
        { name: 'Flash Boys 2.0', url: 'https://arxiv.org/abs/1904.05234', level: 'Advanced' },
      ],
    },
    {
      category: 'Learn Solidity',
      items: [
        { name: 'CryptoZombies', url: 'https://cryptozombies.io/', level: 'Beginner' },
        { name: 'Cyfrin Updraft', url: 'https://updraft.cyfrin.io/', level: 'Beginner' },
        { name: 'Alchemy University', url: 'https://www.alchemy.com/university', level: 'Intermediate' },
      ],
    },
    {
      category: 'Uniswap V4',
      items: [
        { name: 'V4 Overview', url: 'https://docs.uniswap.org/contracts/v4/overview', level: 'Beginner' },
        { name: 'Hooks Concept', url: 'https://docs.uniswap.org/contracts/v4/concepts/hooks', level: 'Beginner' },
        { name: 'Your First Hook', url: 'https://docs.uniswap.org/contracts/v4/guides/hooks/your-first-hook', level: 'Intermediate' },
        { name: 'Awesome V4 Hooks', url: 'https://github.com/johnsonstephan/awesome-uniswap-v4-hooks', level: 'All' },
      ],
    },
    {
      category: 'Tools',
      items: [
        { name: 'EigenPhi', url: 'https://eigenphi.io/', level: 'MEV Analysis' },
        { name: 'Flashbots Explorer', url: 'https://explore.flashbots.net/', level: 'MEV Dashboard' },
        { name: 'Foundry', url: 'https://getfoundry.sh/', level: 'Dev Tool' },
        { name: 'Tenderly', url: 'https://tenderly.co/', level: 'Simulation' },
      ],
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold mb-4">Resources</h1>
        <p className="text-[var(--text-secondary)]">Curated resources to learn more about MEV, Uniswap V4, and smart contract development.</p>
      </div>

      {resources.map((section) => (
        <div key={section.category}>
          <h2 className="text-xl font-semibold mb-4">{section.category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {section.items.map((item) => (
              <a
                key={item.name}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="card-surface p-4 rounded-xl hover:border-[var(--border-2)] transition-colors flex items-center justify-between group"
              >
                <div>
                  <p className="font-medium group-hover:text-[var(--text-primary)] transition-colors">{item.name}</p>
                  <p className="text-xs text-[var(--text-tertiary)]">{item.level}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-[var(--text-tertiary)]" />
              </a>
            ))}
          </div>
        </div>
      ))}

      <div>
        <h2 className="text-xl font-semibold mb-4">Communities</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { name: 'Flashbots Discord', url: 'https://discord.gg/flashbots' },
            { name: 'Uniswap Discord', url: 'https://discord.gg/uniswap' },
            { name: 'Ethereum R&D', url: 'https://discord.gg/ethereum' },
          ].map((item) => (
            <a
              key={item.name}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="card-surface p-4 rounded-xl hover:border-[var(--border-2)] transition-colors flex items-center gap-3 group"
            >
              <Users className="w-5 h-5 text-[var(--text-tertiary)]" />
              <span className="text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">{item.name}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

export function DocsPage() {
  const [activeSection, setActiveSection] = useState<Section>('overview')

  const renderSection = () => {
    switch (activeSection) {
      case 'overview': return <OverviewSection />
      case 'how-it-works': return <HowItWorksSection />
      case 'quick-start': return <QuickStartSection />
      case 'concepts': return <ConceptsSection />
      case 'contracts': return <ContractsSection />
      case 'api': return <ApiSection />
      case 'resources': return <ResourcesSection />
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <nav className="sticky top-24 space-y-1">
            {SECTIONS.map((section) => {
              const Icon = section.icon
              const isActive = activeSection === section.id
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id as Section)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors text-left ${
                    isActive
                      ? 'bg-[var(--bg-2)] text-[var(--text-primary)]'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-2)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {section.label}
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                </button>
              )
            })}
          </nav>
        </aside>

        {/* Mobile nav */}
        <div className="lg:hidden mb-6 w-full">
          <select
            value={activeSection}
            onChange={(e) => setActiveSection(e.target.value as Section)}
            className="input w-full"
          >
            {SECTIONS.map((section) => (
              <option key={section.id} value={section.id}>{section.label}</option>
            ))}
          </select>
        </div>

        {/* Content */}
        <motion.main
          key={activeSection}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex-1 min-w-0"
        >
          {renderSection()}
        </motion.main>
      </div>
    </div>
  )
}
