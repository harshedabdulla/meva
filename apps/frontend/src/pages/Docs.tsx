import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Book, Zap, Users, ExternalLink,
  ChevronRight, Copy, Check, Play, FileCode, Database,
  AlertTriangle, Lightbulb, Layers, ArrowRight, ArrowDown, Shield,
  TrendingUp, Link2, Globe, Cpu, Wallet, BarChart3,
  RefreshCw, Lock, Network, CircleDollarSign, Shuffle
} from 'lucide-react'
import {
  SpotlightCard,
  StaggerContainer,
  StaggerItem,
  AnimatedCounter,
  GradientBorderCard,
  TextReveal,
  ComparisonRow,
  FlowNode,
} from '../components/ui/AnimatedComponents'

type Section = 'overview' | 'how-it-works' | 'mev-deep-dive' | 'technology' | 'quick-start' | 'contracts' | 'api' | 'resources'

const SECTIONS = [
  { id: 'overview', label: 'Overview', icon: Book },
  { id: 'how-it-works', label: 'How It Works', icon: Zap },
  { id: 'mev-deep-dive', label: 'MEV Deep Dive', icon: TrendingUp },
  { id: 'technology', label: 'Technology Stack', icon: Layers },
  { id: 'quick-start', label: 'Quick Start', icon: Play },
  { id: 'contracts', label: 'Smart Contracts', icon: FileCode },
  { id: 'api', label: 'API Reference', icon: Database },
  { id: 'resources', label: 'Resources', icon: ExternalLink },
] as const

function CodeBlock({ code, language = 'solidity' }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative group">
      <div className="absolute top-3 left-3 text-xs text-[var(--text-tertiary)] font-mono">{language}</div>
      <pre className="bg-[var(--bg-2)] border border-[var(--border-1)] rounded-xl p-4 pt-8 overflow-x-auto text-sm font-mono text-[var(--text-secondary)]">
        <code>{code}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 p-2 rounded-lg bg-[var(--bg-3)] opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label={copied ? 'Copied' : 'Copy code'}
      >
        {copied ? <Check className="w-4 h-4 text-[var(--text-primary)]" /> : <Copy className="w-4 h-4" />}
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

// ============================================
// SECTION: Overview
// ============================================
function OverviewSection() {
  return (
    <div className="space-y-10">
      {/* Hero */}
      <div className="text-center py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <TextReveal text="Welcome to MEVA" />
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
            The first MEV capture and redistribution protocol built on Uniswap V4 hooks.
            Tax extractive bots. Reward users and LPs.
          </p>
        </motion.div>

        <GradientBorderCard className="mt-8 max-w-xl mx-auto">
          <div className="p-6">
            <p className="text-2xl font-medium text-center text-[var(--text-secondary)]">
              "Don't fight MEV — <span className="text-[var(--text-primary)]">own it</span>."
            </p>
          </div>
        </GradientBorderCard>
      </div>

      {/* Stats */}
      <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { value: 50, suffix: '%', label: 'Unlicensed Bot Tax' },
          { value: 10, suffix: '%', label: 'Licensed Bot Tax' },
          { value: 50, suffix: '%', label: 'LP Dividends' },
          { value: 30, suffix: '%', label: 'Victim Rebates' },
        ].map((stat) => (
          <StaggerItem key={stat.label}>
            <SpotlightCard className="p-5 text-center">
              <p className="text-3xl font-bold font-mono">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </p>
              <p className="text-xs text-[var(--text-tertiary)] mt-2">{stat.label}</p>
            </SpotlightCard>
          </StaggerItem>
        ))}
      </StaggerContainer>

      {/* The Problem */}
      <div>
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-[var(--text-tertiary)]" />
          The Problem: MEV Extraction
        </h2>
        <p className="text-[var(--text-secondary)] mb-6">
          Every time you swap tokens on a DEX, sophisticated bots may be watching your pending transaction
          and profiting at your expense. This is called <strong>Maximal Extractable Value (MEV)</strong>.
        </p>

        <SpotlightCard className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-2)]">
              <span className="text-[var(--text-secondary)]">You submit:</span>
              <span className="font-mono">Swap 10 ETH → USDC</span>
            </div>
            <div className="flex justify-center">
              <motion.div
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <AlertTriangle className="w-6 h-6 text-[var(--text-tertiary)]" />
              </motion.div>
            </div>
            <div className="p-4 rounded-lg bg-[var(--bg-2)] border border-[var(--border-1)]">
              <p className="text-sm font-mono text-center text-[var(--text-secondary)]">
                Bot detects your transaction in mempool...
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-3 rounded-lg bg-[var(--bg-2)]">
                <p className="text-[var(--text-tertiary)]">1. Bot buys first</p>
                <p className="font-mono text-[var(--text-secondary)]">Price ↑</p>
              </div>
              <div className="p-3 rounded-lg bg-[var(--bg-2)]">
                <p className="text-[var(--text-tertiary)]">2. Your swap executes</p>
                <p className="font-mono text-[var(--text-secondary)]">Worse rate</p>
              </div>
              <div className="p-3 rounded-lg bg-[var(--bg-2)]">
                <p className="text-[var(--text-tertiary)]">3. Bot sells after</p>
                <p className="font-mono text-[var(--text-secondary)]">Profit!</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-2)]">
              <span className="text-[var(--text-secondary)]">Result:</span>
              <span className="font-mono text-[var(--text-secondary)]">You lost ~$50, bot gained ~$50</span>
            </div>
          </div>
        </SpotlightCard>

        <p className="text-sm text-[var(--text-tertiary)] mt-4">
          This is called a <strong>sandwich attack</strong>. Over <strong>$600M+</strong> has been extracted
          from users via MEV on Ethereum since 2020.
        </p>
      </div>

      {/* The Solution */}
      <div>
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
          <Shield className="w-6 h-6 text-[var(--text-tertiary)]" />
          The Solution: MEVA Protocol
        </h2>
        <p className="text-[var(--text-secondary)] mb-6">
          MEVA is a Uniswap V4 hook that <strong>detects MEV bots in real-time</strong>, applies a dynamic tax,
          and <strong>redistributes captured value</strong> back to those harmed.
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          <ComparisonRow label="User Swap Experience" before="Bot profits" after="User gets rebate" improvement="positive" />
          <ComparisonRow label="LP Returns" before="Only fees" after="Fees + MEV dividends" improvement="positive" />
          <ComparisonRow label="Bot Behavior" before="Extract freely" after="Pay 10-50% tax" improvement="positive" />
          <ComparisonRow label="Market Fairness" before="Adversarial" after="Aligned incentives" improvement="positive" />
        </div>
      </div>

      {/* How it differs */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Why MEVA is Different</h2>
        <StaggerContainer className="grid md:grid-cols-3 gap-4">
          {[
            {
              icon: <Zap className="w-5 h-5" />,
              title: 'Real-time Detection',
              description: 'Analyzes every swap at the hook level before execution. No external oracles needed.',
            },
            {
              icon: <RefreshCw className="w-5 h-5" />,
              title: 'Automatic Redistribution',
              description: '50% to LPs, 30% to sandwich victims, 20% to protocol stakers. Claim anytime.',
            },
            {
              icon: <Lock className="w-5 h-5" />,
              title: 'Permissionless',
              description: 'No governance votes to capture value. The hook enforces fair extraction automatically.',
            },
          ].map((item) => (
            <StaggerItem key={item.title}>
              <SpotlightCard className="p-5 h-full">
                <div className="w-10 h-10 rounded-lg bg-[var(--bg-3)] flex items-center justify-center mb-3 text-[var(--text-secondary)]">
                  {item.icon}
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-[var(--text-secondary)]">{item.description}</p>
              </SpotlightCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </div>
  )
}

// ============================================
// SECTION: How It Works
// ============================================
function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0)

  const steps = [
    {
      title: 'Detection',
      icon: <Cpu className="w-5 h-5" />,
      description: 'Hook analyzes every incoming swap for MEV bot patterns',
      details: [
        { signal: 'Known bot registry', points: '+100', desc: 'Address flagged as bot' },
        { signal: 'High gas price (3x avg)', points: '+35', desc: 'Priority transaction seeker' },
        { signal: 'Contract caller', points: '+25', desc: 'Smart contract execution' },
        { signal: 'Large swap amount', points: '+15', desc: 'Above 10,000 token threshold' },
        { signal: 'Same-block swaps', points: '+20', desc: 'Rapid-fire pattern' },
        { signal: 'High frequency history', points: '+10', desc: '100+ previous swaps' },
      ],
    },
    {
      title: 'Classification',
      icon: <BarChart3 className="w-5 h-5" />,
      description: 'Confidence score determines tax rate',
      details: [
        { range: '80-100', class: 'Confirmed Bot (unlicensed)', tax: '50%' },
        { range: '80-100', class: 'Confirmed Bot (licensed)', tax: '10%' },
        { range: '60-79', class: 'Suspicious Activity', tax: '25%' },
        { range: '0-59', class: 'Normal User', tax: '0.3%' },
      ],
    },
    {
      title: 'Tax Collection',
      icon: <CircleDollarSign className="w-5 h-5" />,
      description: 'Dynamic fee applied via V4 fee override mechanism',
      code: `// MevaHook.sol - beforeSwap
function _beforeSwap(address sender, PoolKey calldata, SwapParams calldata params, bytes calldata)
    internal override returns (bytes4, BeforeSwapDelta, uint24)
{
    (bool isBot, uint256 confidence, string memory reason) =
        analyzeTransaction(sender, params.amountSpecified, tx.gasprice);

    uint24 dynamicFee = isBot
        ? (botRegistry.isLicensed(sender) ? LICENSED_BOT_TAX : UNLICENSED_BOT_TAX)
        : NORMAL_FEE;

    // Apply fee with override flag
    return (this.beforeSwap.selector, BeforeSwapDeltaLibrary.ZERO_DELTA,
            dynamicFee | LPFeeLibrary.OVERRIDE_FEE_FLAG);
}`,
    },
    {
      title: 'Distribution',
      icon: <Shuffle className="w-5 h-5" />,
      description: 'Captured value flows to MevaVault for fair distribution',
      breakdown: [
        { recipient: 'Liquidity Providers', share: 50, color: 'var(--text-primary)' },
        { recipient: 'Sandwich Victims', share: 30, color: 'var(--text-secondary)' },
        { recipient: 'Protocol Stakers', share: 20, color: 'var(--text-tertiary)' },
      ],
    },
    {
      title: 'Claiming',
      icon: <Wallet className="w-5 h-5" />,
      description: 'Users claim accumulated rewards from the vault',
      methods: [
        { method: 'claimLPDividend()', desc: 'For liquidity providers' },
        { method: 'claimRebate()', desc: 'For identified sandwich victims' },
        { method: 'claimStakerReward()', desc: 'For protocol stakers' },
      ],
    },
  ]

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-semibold mb-4">How It Works</h1>
        <p className="text-[var(--text-secondary)]">
          MEVA operates through a 5-step pipeline: detect, classify, tax, distribute, and claim.
        </p>
      </div>

      {/* Step Navigator */}
      <div className="flex flex-wrap gap-2">
        {steps.map((step, i) => (
          <button
            key={step.title}
            onClick={() => setActiveStep(i)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all ${
              activeStep === i
                ? 'bg-[var(--bg-3)] text-[var(--text-primary)] border border-[var(--border-2)]'
                : 'bg-[var(--bg-2)] text-[var(--text-secondary)] hover:bg-[var(--bg-3)]'
            }`}
          >
            <span className="font-mono">{i + 1}</span>
            {step.title}
          </button>
        ))}
      </div>

      {/* Step Content */}
      <motion.div
        key={activeStep}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <SpotlightCard className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-[var(--bg-3)] flex items-center justify-center text-[var(--text-secondary)]">
              {steps[activeStep].icon}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{steps[activeStep].title}</h2>
              <p className="text-sm text-[var(--text-secondary)]">{steps[activeStep].description}</p>
            </div>
          </div>

          {/* Step 0: Detection Signals */}
          {activeStep === 0 && (
            <div className="space-y-2">
              {(steps[0].details as Array<{ signal: string; points: string; desc: string }>)?.map((item) => (
                <motion.div
                  key={item.signal}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-2)] border border-[var(--border-1)]"
                >
                  <div>
                    <p className="text-sm font-medium">{item.signal}</p>
                    <p className="text-xs text-[var(--text-tertiary)]">{item.desc}</p>
                  </div>
                  <span className="font-mono text-sm text-[var(--text-secondary)]">{item.points}</span>
                </motion.div>
              ))}
              <InfoBox type="tip">
                Scores are cumulative. A score of 60+ triggers elevated tax rates.
              </InfoBox>
            </div>
          )}

          {/* Step 1: Classification Table */}
          {activeStep === 1 && (
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
                  {(steps[1].details as Array<{ range: string; class: string; tax: string }>)?.map((row, i) => (
                    <motion.tr
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <td className="p-3 font-mono">{row.range}</td>
                      <td className="p-3">{row.class}</td>
                      <td className="p-3 font-mono font-semibold">{row.tax}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Step 2: Code */}
          {activeStep === 2 && (
            <CodeBlock code={steps[2].code!} language="solidity" />
          )}

          {/* Step 3: Distribution */}
          {activeStep === 3 && (
            <div className="space-y-4">
              <div className="h-8 rounded-full overflow-hidden flex">
                {steps[3].breakdown?.map((item: { recipient: string; share: number; color: string }) => (
                  <motion.div
                    key={item.recipient}
                    initial={{ width: 0 }}
                    animate={{ width: `${item.share}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    style={{ background: item.color }}
                    className="flex items-center justify-center text-xs font-semibold text-white"
                  >
                    {item.share}%
                  </motion.div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-4">
                {steps[3].breakdown?.map((item: { recipient: string; share: number; color: string }) => (
                  <div key={item.recipient} className="text-center">
                    <div className="w-3 h-3 rounded-full mx-auto mb-2" style={{ background: item.color }} />
                    <p className="text-sm font-medium">{item.share}%</p>
                    <p className="text-xs text-[var(--text-tertiary)]">{item.recipient}</p>
                  </div>
                ))}
              </div>
              <InfoBox type="info">
                Distribution happens automatically. The vault tracks pro-rata shares for each recipient type.
              </InfoBox>
            </div>
          )}

          {/* Step 4: Claiming */}
          {activeStep === 4 && (
            <div className="space-y-3">
              {steps[4].methods?.map((m: { method: string; desc: string }) => (
                <div key={m.method} className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-2)] border border-[var(--border-1)]">
                  <code className="text-sm font-mono">{m.method}</code>
                  <span className="text-sm text-[var(--text-tertiary)]">{m.desc}</span>
                </div>
              ))}
              <InfoBox type="tip">
                Use the Cross-Chain page to claim rewards on a different chain via Li.Fi bridge.
              </InfoBox>
            </div>
          )}
        </SpotlightCard>
      </motion.div>

      {/* Flow Diagram */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Complete Flow</h2>
        {/* Desktop: horizontal layout */}
        <div className="hidden md:flex items-center gap-2">
          {steps.map((step, i) => (
            <div key={step.title} className="flex items-center flex-1 min-w-0">
              <FlowNode
                icon={step.icon}
                title={step.title}
                description={step.description}
                isActive={activeStep === i}
                className="w-full"
              />
              {i < steps.length - 1 && (
                <ArrowRight className="w-4 h-4 text-[var(--text-tertiary)] mx-2 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
        {/* Mobile: vertical layout */}
        <div className="md:hidden flex flex-col gap-2">
          {steps.map((step, i) => (
            <div key={step.title}>
              <FlowNode
                icon={step.icon}
                title={step.title}
                description={step.description}
                isActive={activeStep === i}
              />
              {i < steps.length - 1 && (
                <div className="flex justify-center py-2">
                  <ArrowDown className="w-4 h-4 text-[var(--text-tertiary)]" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================
// SECTION: MEV Deep Dive
// ============================================
function MEVDeepDiveSection() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-semibold mb-4">MEV Deep Dive</h1>
        <p className="text-[var(--text-secondary)]">
          A comprehensive guide to Maximal Extractable Value — what it is, how it works, and why it matters.
        </p>
      </div>

      {/* What is MEV */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">What is MEV?</h2>
        <GradientBorderCard>
          <div className="p-6">
            <p className="text-lg">
              <strong>Maximal Extractable Value (MEV)</strong> is the maximum value that can be extracted from
              block production beyond the standard block reward and gas fees by including, excluding, or
              reordering transactions within a block.
            </p>
          </div>
        </GradientBorderCard>

        <div className="mt-6 grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-3">The Old Name: "Miner" Extractable Value</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              Before Ethereum's merge to Proof of Stake, miners could reorder transactions for profit.
              Post-merge, this power transferred to validators and block builders, so the term evolved
              to <strong>Maximal</strong> Extractable Value.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-3">The Scale of MEV</h3>
            <div className="space-y-2">
              <div className="flex justify-between p-3 rounded-lg bg-[var(--bg-2)]">
                <span className="text-[var(--text-tertiary)]">Total Extracted (since 2020)</span>
                <span className="font-mono">$600M+</span>
              </div>
              <div className="flex justify-between p-3 rounded-lg bg-[var(--bg-2)]">
                <span className="text-[var(--text-tertiary)]">Daily MEV (avg)</span>
                <span className="font-mono">$1-5M</span>
              </div>
              <div className="flex justify-between p-3 rounded-lg bg-[var(--bg-2)]">
                <span className="text-[var(--text-tertiary)]">Active MEV Bots</span>
                <span className="font-mono">1,000+</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Types of MEV */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Types of MEV</h2>
        <StaggerContainer className="grid md:grid-cols-2 gap-4">
          {[
            {
              type: 'Sandwich Attack',
              severity: 'High',
              description: 'Bot places orders before AND after your trade, profiting from the price movement your trade causes.',
              example: 'You swap 100 ETH → USDC. Bot front-runs, your trade moves price, bot back-runs. You get ~2% less USDC.',
              victims: 'DEX traders',
            },
            {
              type: 'Arbitrage',
              severity: 'Low',
              description: 'Exploiting price differences between exchanges. Generally considered "good" MEV as it improves price efficiency.',
              example: 'ETH is $2000 on Uniswap, $2010 on Sushiswap. Bot buys on Uni, sells on Sushi, pockets $10.',
              victims: 'None directly',
            },
            {
              type: 'Liquidation',
              severity: 'Medium',
              description: 'Racing to liquidate undercollateralized positions on lending protocols like Aave or Compound.',
              example: 'Your health factor drops below 1. Bots compete to liquidate your position for the liquidation bonus.',
              victims: 'Borrowers',
            },
            {
              type: 'JIT Liquidity',
              severity: 'Medium',
              description: 'Just-In-Time liquidity: adding concentrated liquidity right before a large swap, then removing it after.',
              example: 'Large swap incoming. Bot adds LP in tight range, captures fees, removes LP. Dilutes existing LPs.',
              victims: 'Existing LPs',
            },
            {
              type: 'NFT Sniping',
              severity: 'Medium',
              description: 'Front-running NFT purchases to buy underpriced items before legitimate buyers.',
              example: 'Rare NFT listed at floor price. Bot front-runs your buy, relists higher.',
              victims: 'NFT traders',
            },
            {
              type: 'Time-Bandit Attack',
              severity: 'Critical',
              description: 'Validators reorganizing past blocks to capture MEV opportunities they missed.',
              example: 'Profitable arb 2 blocks ago? Validator re-mines those blocks to include it.',
              victims: 'Network stability',
            },
          ].map((item) => (
            <StaggerItem key={item.type}>
              <SpotlightCard className="p-5 h-full">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold">{item.type}</h3>
                  <span className="text-xs px-2 py-1 rounded-full bg-[var(--bg-3)] text-[var(--text-tertiary)]">
                    {item.severity}
                  </span>
                </div>
                <p className="text-sm text-[var(--text-secondary)] mb-3">{item.description}</p>
                <div className="p-3 rounded-lg bg-[var(--bg-2)] mb-3">
                  <p className="text-xs text-[var(--text-tertiary)]">Example:</p>
                  <p className="text-sm text-[var(--text-secondary)]">{item.example}</p>
                </div>
                <p className="text-xs text-[var(--text-tertiary)]">
                  <strong>Victims:</strong> {item.victims}
                </p>
              </SpotlightCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>

      {/* Sandwich Attack Anatomy */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Anatomy of a Sandwich Attack</h2>
        <SpotlightCard className="p-6">
          <div className="space-y-6">
            {/* Timeline */}
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-[var(--border-1)]" />
              {[
                { time: 'T+0ms', actor: 'You', action: 'Submit swap: 100 ETH → USDC' },
                { time: 'T+50ms', actor: 'Bot', action: 'Detects your tx in mempool' },
                { time: 'T+100ms', actor: 'Bot', action: 'Front-run: Buy USDC with higher gas' },
                { time: 'T+101ms', actor: 'Your tx', action: 'Executes at worse price (slippage)' },
                { time: 'T+102ms', actor: 'Bot', action: 'Back-run: Sell USDC for profit' },
                { time: 'T+200ms', actor: 'Result', action: 'Bot profits ~$50, you lost ~$50' },
              ].map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="relative pl-10 pb-4"
                >
                  <div className="absolute left-2.5 w-3 h-3 rounded-full bg-[var(--text-tertiary)]" />
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-[var(--text-tertiary)] w-16">{step.time}</span>
                    <span className="text-sm font-medium w-16">{step.actor}</span>
                    <span className="text-sm text-[var(--text-secondary)]">{step.action}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            <InfoBox type="warning">
              Sandwich attacks are the most common form of MEV affecting everyday users. MEVA specifically
              targets and taxes this behavior.
            </InfoBox>
          </div>
        </SpotlightCard>
      </div>

      {/* MEV Supply Chain */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">The MEV Supply Chain</h2>
        <p className="text-[var(--text-secondary)] mb-4">
          Understanding how MEV moves through the Ethereum ecosystem:
        </p>
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { role: 'Searchers', desc: 'Find and extract MEV opportunities', icon: <Cpu className="w-5 h-5" /> },
            { role: 'Builders', desc: 'Construct optimal blocks with MEV', icon: <Layers className="w-5 h-5" /> },
            { role: 'Relays', desc: 'Connect builders to validators', icon: <Network className="w-5 h-5" /> },
            { role: 'Validators', desc: 'Propose blocks, earn tips', icon: <Shield className="w-5 h-5" /> },
          ].map((item, i) => (
            <div key={item.role} className="relative">
              <SpotlightCard className="p-4 text-center h-full">
                <div className="w-10 h-10 rounded-full bg-[var(--bg-3)] flex items-center justify-center mx-auto mb-3 text-[var(--text-secondary)]">
                  {item.icon}
                </div>
                <h3 className="font-semibold text-sm">{item.role}</h3>
                <p className="text-xs text-[var(--text-tertiary)] mt-1">{item.desc}</p>
              </SpotlightCard>
              {i < 3 && (
                <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                  <ArrowRight className="w-4 h-4 text-[var(--text-tertiary)]" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* How MEVA Helps */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">How MEVA Addresses MEV</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <SpotlightCard className="p-5">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-[var(--text-tertiary)]" />
              For Users (Victims)
            </h3>
            <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[var(--text-tertiary)] mt-0.5 flex-shrink-0" />
                Receive 30% of captured MEV as rebates
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[var(--text-tertiary)] mt-0.5 flex-shrink-0" />
                Automatic identification of sandwich victims
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[var(--text-tertiary)] mt-0.5 flex-shrink-0" />
                Claim rebates anytime from the vault
              </li>
            </ul>
          </SpotlightCard>

          <SpotlightCard className="p-5">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[var(--text-tertiary)]" />
              For LPs
            </h3>
            <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[var(--text-tertiary)] mt-0.5 flex-shrink-0" />
                Receive 50% of captured MEV as dividends
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[var(--text-tertiary)] mt-0.5 flex-shrink-0" />
                Pro-rata distribution based on liquidity share
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[var(--text-tertiary)] mt-0.5 flex-shrink-0" />
                Compensation for JIT liquidity attacks
              </li>
            </ul>
          </SpotlightCard>

          <SpotlightCard className="p-5">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-[var(--text-tertiary)]" />
              For MEV Bots
            </h3>
            <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
              <li className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 text-[var(--text-tertiary)] mt-0.5 flex-shrink-0" />
                Licensing option: 10% tax vs 50% unlicensed
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 text-[var(--text-tertiary)] mt-0.5 flex-shrink-0" />
                Predictable costs for strategy planning
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 text-[var(--text-tertiary)] mt-0.5 flex-shrink-0" />
                Legitimate status on the bot registry
              </li>
            </ul>
          </SpotlightCard>

          <SpotlightCard className="p-5">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Globe className="w-5 h-5 text-[var(--text-tertiary)]" />
              For the Ecosystem
            </h3>
            <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[var(--text-tertiary)] mt-0.5 flex-shrink-0" />
                Aligns incentives between all parties
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[var(--text-tertiary)] mt-0.5 flex-shrink-0" />
                Reduces adversarial mempool dynamics
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[var(--text-tertiary)] mt-0.5 flex-shrink-0" />
                Creates sustainable MEV market
              </li>
            </ul>
          </SpotlightCard>
        </div>
      </div>
    </div>
  )
}

// ============================================
// SECTION: Technology Stack
// ============================================
function TechnologySection() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-semibold mb-4">Technology Stack</h1>
        <p className="text-[var(--text-secondary)]">
          MEVA is built on cutting-edge DeFi infrastructure. Here's a deep dive into each technology we use.
        </p>
      </div>

      {/* Uniswap V4 */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[var(--bg-3)] flex items-center justify-center">
            <Layers className="w-6 h-6 text-[var(--text-secondary)]" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold">Uniswap V4</h2>
            <p className="text-sm text-[var(--text-secondary)]">The core DEX infrastructure powering MEVA</p>
          </div>
        </div>

        <GradientBorderCard>
          <div className="p-6">
            <h3 className="font-semibold mb-3">What is Uniswap V4?</h3>
            <p className="text-[var(--text-secondary)] mb-4">
              Uniswap V4 is the next evolution of the world's largest decentralized exchange. It introduces
              <strong> Hooks</strong> — smart contracts that can execute custom logic at specific points
              during pool operations like swaps, liquidity changes, and donations.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { feature: 'Singleton Pattern', desc: 'All pools in one contract, reducing gas by ~99%' },
                { feature: 'Hooks', desc: 'Custom logic at 8 different pool lifecycle points' },
                { feature: 'Flash Accounting', desc: 'Net-out token transfers for gas efficiency' },
              ].map((item) => (
                <div key={item.feature} className="p-3 rounded-lg bg-[var(--bg-2)]">
                  <p className="font-medium text-sm">{item.feature}</p>
                  <p className="text-xs text-[var(--text-tertiary)] mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </GradientBorderCard>

        <div>
          <h3 className="font-semibold mb-4">V4 Hook Lifecycle</h3>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            Hooks can execute at these points. MEVA uses <code className="font-semibold">beforeSwap</code> and <code className="font-semibold">afterSwap</code>:
          </p>
          <CodeBlock code={`Pool Operations & Hook Points
─────────────────────────────────────────────────
│ initialize()                                   │
│   ├── beforeInitialize()                       │
│   └── afterInitialize()                        │
│                                                │
│ swap()                                         │
│   ├── beforeSwap()      ← MEVA: Bot detection  │
│   └── afterSwap()       ← MEVA: Record capture │
│                                                │
│ modifyLiquidity()                              │
│   ├── beforeAddLiquidity()                     │
│   ├── afterAddLiquidity()                      │
│   ├── beforeRemoveLiquidity()                  │
│   └── afterRemoveLiquidity()                   │
│                                                │
│ donate()                                       │
│   ├── beforeDonate()                           │
│   └── afterDonate()                            │
─────────────────────────────────────────────────`} language="plaintext" />
        </div>

        <div>
          <h3 className="font-semibold mb-4">How MEVA Uses V4 Hooks</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <SpotlightCard className="p-5">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <code>beforeSwap()</code>
              </h4>
              <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                <li>• Analyze sender address for bot signals</li>
                <li>• Check gas price against rolling average</li>
                <li>• Query BotRegistry for known bots</li>
                <li>• Calculate confidence score (0-100)</li>
                <li>• Return dynamic fee with <code>OVERRIDE_FEE_FLAG</code></li>
              </ul>
            </SpotlightCard>
            <SpotlightCard className="p-5">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <code>afterSwap()</code>
              </h4>
              <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                <li>• Calculate actual tax amount collected</li>
                <li>• Update totalTaxCaptured stats</li>
                <li>• Emit MEVCaptured event</li>
                <li>• Clear pending capture state</li>
                <li>• (Future) Identify potential victims</li>
              </ul>
            </SpotlightCard>
          </div>
        </div>

        <InfoBox type="info">
          <strong>Why V4?</strong> Previous Uniswap versions couldn't modify swap behavior. V4's hooks let us
          intercept swaps, apply custom fees, and enforce MEV taxation without users needing to use special routers.
        </InfoBox>
      </div>

      {/* Yellow Network */}
      <div className="space-y-6 pt-8 border-t border-[var(--border-1)]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[var(--bg-3)] flex items-center justify-center">
            <Network className="w-6 h-6 text-[var(--text-secondary)]" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold">Yellow Network</h2>
            <p className="text-sm text-[var(--text-secondary)]">State channels for off-chain aggregation</p>
          </div>
        </div>

        <GradientBorderCard>
          <div className="p-6">
            <h3 className="font-semibold mb-3">What is Yellow Network?</h3>
            <p className="text-[var(--text-secondary)] mb-4">
              Yellow Network (powered by <strong>Nitrolite</strong>) is a state channel infrastructure that enables
              high-frequency, low-cost transactions off-chain with on-chain settlement guarantees. Think of it as
              a "payment channel on steroids" designed for trading.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { feature: 'State Channels', desc: 'Thousands of txs with one on-chain settlement' },
                { feature: 'Instant Finality', desc: 'Sub-second confirmations for off-chain ops' },
                { feature: 'Trustless', desc: 'Cryptographic guarantees, no custodial risk' },
              ].map((item) => (
                <div key={item.feature} className="p-3 rounded-lg bg-[var(--bg-2)]">
                  <p className="font-medium text-sm">{item.feature}</p>
                  <p className="text-xs text-[var(--text-tertiary)] mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </GradientBorderCard>

        <div>
          <h3 className="font-semibold mb-4">How MEVA Uses Yellow Network</h3>
          <SpotlightCard className="p-6">
            <div className="space-y-4">
              <p className="text-[var(--text-secondary)]">
                Instead of settling every MEV capture on-chain (expensive!), MEVA aggregates captures off-chain
                via Yellow's state channels and settles in batches:
              </p>
              <div className="grid md:grid-cols-4 gap-3">
                {[
                  { step: '1', title: 'Capture', desc: 'MEV tax collected on-chain' },
                  { step: '2', title: 'Aggregate', desc: 'Accumulate in state channel' },
                  { step: '3', title: 'Epoch End', desc: 'Batch period completes' },
                  { step: '4', title: 'Settle', desc: 'Single on-chain settlement' },
                ].map((item) => (
                  <div key={item.step} className="text-center">
                    <div className="w-8 h-8 rounded-full bg-[var(--bg-3)] text-[var(--text-secondary)] font-mono text-sm flex items-center justify-center mx-auto mb-2">
                      {item.step}
                    </div>
                    <p className="font-medium text-sm">{item.title}</p>
                    <p className="text-xs text-[var(--text-tertiary)]">{item.desc}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-2)]">
                <span className="text-sm text-[var(--text-tertiary)]">Gas savings per epoch:</span>
                <span className="font-mono">~95%</span>
              </div>
            </div>
          </SpotlightCard>
        </div>

        <CodeBlock code={`// YellowChannel integration (simplified)
import { Nitrolite } from '@yellow-network/nitrolite-sdk'

const channel = new Nitrolite({
  chainId: 1,
  channelId: 'meva-tax-aggregator'
})

// Aggregate captures off-chain
async function recordCapture(capture: MEVCapture) {
  await channel.updateState({
    totalCaptured: state.totalCaptured + capture.amount,
    captures: [...state.captures, capture]
  })
}

// Settle epoch on-chain
async function settleEpoch() {
  const proof = await channel.generateProof()
  await mevaVault.settleBatch(proof)
}`} language="typescript" />
      </div>

      {/* Li.Fi */}
      <div className="space-y-6 pt-8 border-t border-[var(--border-1)]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[var(--bg-3)] flex items-center justify-center">
            <Link2 className="w-6 h-6 text-[var(--text-secondary)]" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold">Li.Fi</h2>
            <p className="text-sm text-[var(--text-secondary)]">Cross-chain bridge aggregator</p>
          </div>
        </div>

        <GradientBorderCard>
          <div className="p-6">
            <h3 className="font-semibold mb-3">What is Li.Fi?</h3>
            <p className="text-[var(--text-secondary)] mb-4">
              Li.Fi is a cross-chain bridge and DEX aggregator that finds the best route to move assets
              between blockchains. It aggregates bridges like Stargate, Hop, Across, and more to offer
              optimal pricing and speed.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { feature: 'Multi-Bridge', desc: 'Aggregates 15+ bridges for best rates' },
                { feature: 'DEX Integration', desc: 'Swap + bridge in one transaction' },
                { feature: 'Route Optimization', desc: 'Finds cheapest/fastest path automatically' },
              ].map((item) => (
                <div key={item.feature} className="p-3 rounded-lg bg-[var(--bg-2)]">
                  <p className="font-medium text-sm">{item.feature}</p>
                  <p className="text-xs text-[var(--text-tertiary)] mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </GradientBorderCard>

        <div>
          <h3 className="font-semibold mb-4">How MEVA Uses Li.Fi</h3>
          <SpotlightCard className="p-6">
            <p className="text-[var(--text-secondary)] mb-4">
              MEVA enables <strong>cross-chain claiming</strong> — claim your rewards on Ethereum but receive
              them on Arbitrum, Optimism, Base, or Polygon:
            </p>
            <div className="grid md:grid-cols-5 gap-2 mb-4">
              {['Ethereum', 'Arbitrum', 'Optimism', 'Base', 'Polygon'].map((chain) => (
                <div key={chain} className="flex items-center gap-2 p-2 rounded-lg bg-[var(--bg-2)] text-center">
                  <div className="w-2 h-2 rounded-full bg-[var(--text-tertiary)]" />
                  <span className="text-xs">{chain}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">User Flow:</p>
              <ol className="text-sm text-[var(--text-secondary)] space-y-1 list-decimal list-inside">
                <li>Connect wallet on MEVA dashboard</li>
                <li>Navigate to Cross-Chain Claim page</li>
                <li>Select destination chain (e.g., Arbitrum)</li>
                <li>Li.Fi SDK fetches best bridge route</li>
                <li>Approve + execute bridge transaction</li>
                <li>Receive rewards on destination chain</li>
              </ol>
            </div>
          </SpotlightCard>
        </div>

        <CodeBlock code={`// Li.Fi SDK integration
import { getQuote, executeRoute } from '@lifi/sdk'

async function getCrossChainQuote(
  fromChain: number,
  toChain: number,
  amount: string
) {
  const quote = await getQuote({
    fromChain,
    toChain,
    fromToken: MEVA_VAULT_TOKEN,
    toToken: NATIVE_TOKEN,
    fromAmount: amount,
    fromAddress: userAddress,
    toAddress: userAddress,
    integrator: 'meva-protocol'
  })

  return quote // Contains route, fees, estimated time
}

async function executeCrossChainClaim(route: Route) {
  const result = await executeRoute(route, {
    updateCallback: (status) => console.log(status)
  })
  return result
}`} language="typescript" />
      </div>

      {/* Tech Stack Summary */}
      <div className="pt-8 border-t border-[var(--border-1)]">
        <h2 className="text-2xl font-semibold mb-6">Full Stack Overview</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { layer: 'Smart Contracts', tech: 'Solidity, Foundry, Uniswap V4' },
            { layer: 'Off-chain Aggregation', tech: 'Yellow Network (Nitrolite)' },
            { layer: 'Cross-chain', tech: 'Li.Fi SDK' },
            { layer: 'Frontend', tech: 'React 19, Vite 7, Tailwind 4' },
            { layer: 'Web3', tech: 'wagmi 3, viem 2' },
            { layer: 'Testnet', tech: 'Sepolia (ETH), Circle Faucet' },
          ].map((item) => (
            <SpotlightCard key={item.layer} className="p-4">
              <div>
                <p className="font-medium text-sm">{item.layer}</p>
                <p className="text-xs text-[var(--text-tertiary)]">{item.tech}</p>
              </div>
            </SpotlightCard>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================
// SECTION: Quick Start
// ============================================
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
cd meva`} language="bash" />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">2. Run Contract Tests</h2>
        <CodeBlock code={`cd contracts
forge install
forge test`} language="bash" />
        <InfoBox type="tip">Expected output: 61 tests passing</InfoBox>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">3. Start Backend</h2>
        <CodeBlock code={`cd apps/backend
npm install
npm run dev`} language="bash" />
        <p className="text-sm text-[var(--text-tertiary)] mt-2">Server runs at http://localhost:3001</p>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">4. Start Frontend</h2>
        <CodeBlock code={`cd apps/frontend
npm install
npm run dev`} language="bash" />
        <p className="text-sm text-[var(--text-tertiary)] mt-2">Dashboard at http://localhost:5173</p>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Project Structure</h2>
        <CodeBlock code={`meva/
├── contracts/          # Smart contracts (Foundry)
│   ├── src/
│   │   ├── MevaHook.sol       # Uniswap V4 hook
│   │   ├── MevaVault.sol      # Dividend vault
│   │   └── BotRegistry.sol    # Bot tracking
│   └── test/                  # 61 tests
├── apps/
│   ├── frontend/              # React dashboard
│   └── backend/               # Express API + WebSocket
└── docs/                      # Documentation`} language="plaintext" />
      </div>
    </div>
  )
}

// ============================================
// SECTION: Contracts
// ============================================
function ContractsSection() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold mb-4">Smart Contracts</h1>
        <p className="text-[var(--text-secondary)]">Technical reference for MEVA's on-chain components.</p>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Deployed Contracts</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[var(--text-tertiary)] border-b border-[var(--border-1)]">
                <th className="p-3">Contract</th>
                <th className="p-3">Sepolia</th>
                <th className="p-3">Mainnet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-1)] font-mono text-xs">
              <tr>
                <td className="p-3">BotRegistry</td>
                <td className="p-3 text-[var(--text-secondary)]">0x509E6EcDFcdE208aBC2fEc61DCD583E61953Db2f</td>
                <td className="p-3 text-[var(--text-tertiary)]">TBD</td>
              </tr>
              <tr>
                <td className="p-3">MevaVault</td>
                <td className="p-3 text-[var(--text-secondary)]">0x3eb9675947365B89943bA008F217C7C505c460b4</td>
                <td className="p-3 text-[var(--text-tertiary)]">TBD</td>
              </tr>
              <tr>
                <td className="p-3">MevaHook</td>
                <td className="p-3 text-[var(--text-tertiary)]">Pending V4 deployment</td>
                <td className="p-3 text-[var(--text-tertiary)]">TBD</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">MevaHook.sol</h2>
        <p className="text-[var(--text-secondary)] mb-4">The core hook that integrates with Uniswap V4.</p>
        <CodeBlock code={`// Key constants
uint24 public constant UNLICENSED_BOT_TAX = 500000; // 50%
uint24 public constant LICENSED_BOT_TAX = 100000;   // 10%
uint24 public constant SUSPICIOUS_TAX = 250000;     // 25%
uint24 public constant NORMAL_FEE = 3000;           // 0.3%

// Bot detection thresholds
uint256 public constant HIGH_GAS_MULTIPLIER = 3;
uint256 public constant LARGE_SWAP_THRESHOLD = 10000e18;

// Core functions
function analyzeTransaction(address sender, int256 amount, uint256 gasPrice)
    returns (bool isBot, uint256 confidence, string memory reason)

function _beforeSwap(address sender, PoolKey, SwapParams, bytes)
    returns (bytes4, BeforeSwapDelta, uint24 dynamicFee)

function _afterSwap(address sender, PoolKey, SwapParams, BalanceDelta, bytes)
    returns (bytes4, int128)`} language="solidity" />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">MevaVault.sol</h2>
        <p className="text-[var(--text-secondary)] mb-4">Handles dividend collection and distribution.</p>
        <CodeBlock code={`// Distribution shares
uint256 public constant LP_SHARE = 50;      // 50%
uint256 public constant VICTIM_SHARE = 30;  // 30%
uint256 public constant STAKER_SHARE = 20;  // 20%

// Claim functions
function claimLPDividend() external returns (uint256)
function claimRebate() external returns (uint256)
function claimStakerReward() external returns (uint256)

// View functions
function pendingLPDividend(address) view returns (uint256)
function pendingRebate(address) view returns (uint256)
function pendingStakerReward(address) view returns (uint256)
function getStats() view returns (uint256 total, uint256 distributed, uint256 epoch)`} language="solidity" />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">BotRegistry.sol</h2>
        <p className="text-[var(--text-secondary)] mb-4">Tracks known bots and license status.</p>
        <CodeBlock code={`// Registration fee
uint256 public constant LICENSE_FEE = 0.1 ether;

// Query functions
function isKnownBot(address) view returns (bool)
function isLicensed(address) view returns (bool)
function botCount() view returns (uint256)

// Registration
function registerAsLicensed() external payable
function reportBot(address bot) external`} language="solidity" />
      </div>
    </div>
  )
}

// ============================================
// SECTION: API
// ============================================
function ApiSection() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold mb-4">API Reference</h1>
        <p className="text-[var(--text-secondary)]">Backend endpoints and WebSocket events.</p>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Base URL</h2>
        <CodeBlock code="http://localhost:3001" language="plaintext" />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">REST Endpoints</h2>
        <StaggerContainer className="space-y-4">
          {[
            {
              method: 'GET',
              path: '/api/stats',
              desc: 'Protocol statistics',
              response: `{
  "totalCaptured": "125.4532",
  "totalDistributed": "98.2100",
  "currentEpoch": 12,
  "captureCount": 1543,
  "botCount": 47
}`,
            },
            {
              method: 'GET',
              path: '/api/captures?limit=50',
              desc: 'Recent MEV captures',
              response: `[{
  "id": "0xabc...-0",
  "bot": "0x1234...",
  "confidence": 85,
  "taxRate": 5000,
  "taxAmount": "0.2341",
  "txHash": "0xabc...",
  "blockNumber": "18543210"
}]`,
            },
            {
              method: 'GET',
              path: '/api/bots',
              desc: 'Bot leaderboard',
              response: `[{
  "address": "0x1234...",
  "isLicensed": true,
  "totalTaxPaid": "12.4532",
  "captureCount": 342
}]`,
            },
            {
              method: 'GET',
              path: '/api/dividends/:address',
              desc: 'User dividend info',
              response: `{
  "lpDividend": "0.5432",
  "victimRebate": "0.1234",
  "stakerReward": "0.0821"
}`,
            },
          ].map((endpoint) => (
            <StaggerItem key={endpoint.path}>
              <SpotlightCard className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-[var(--bg-3)]">{endpoint.method}</span>
                  <code className="text-sm">{endpoint.path}</code>
                </div>
                <p className="text-sm text-[var(--text-tertiary)] mb-3">{endpoint.desc}</p>
                <CodeBlock code={endpoint.response} language="json" />
              </SpotlightCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">WebSocket</h2>
        <CodeBlock code="ws://localhost:3001/ws" language="plaintext" />
        <div className="mt-4 space-y-3">
          {[
            { event: 'capture', desc: 'New MEV capture detected' },
            { event: 'botLicensed', desc: 'Bot registered for license' },
            { event: 'epochSettled', desc: 'Batch settlement completed' },
          ].map((item) => (
            <div key={item.event} className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-2)] border border-[var(--border-1)]">
              <code className="text-sm font-mono">{item.event}</code>
              <span className="text-sm text-[var(--text-tertiary)]">{item.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================
// SECTION: Resources
// ============================================
function ResourcesSection() {
  const resources = [
    {
      category: 'Learn MEV',
      items: [
        { name: 'Ethereum.org MEV', url: 'https://ethereum.org/developers/docs/mev/', level: 'Beginner' },
        { name: 'Flashbots Writings', url: 'https://writings.flashbots.net/', level: 'Intermediate' },
        { name: 'Flash Boys 2.0 Paper', url: 'https://arxiv.org/abs/1904.05234', level: 'Advanced' },
        { name: 'MEV.wtf', url: 'https://mev.wtf/', level: 'All Levels' },
      ],
    },
    {
      category: 'Uniswap V4',
      items: [
        { name: 'V4 Documentation', url: 'https://docs.uniswap.org/contracts/v4/overview', level: 'Start Here' },
        { name: 'Hooks Concept', url: 'https://docs.uniswap.org/contracts/v4/concepts/hooks', level: 'Core' },
        { name: 'Your First Hook', url: 'https://docs.uniswap.org/contracts/v4/guides/hooks/your-first-hook', level: 'Tutorial' },
        { name: 'V4 Template', url: 'https://github.com/uniswapfoundation/v4-template', level: 'Code' },
      ],
    },
    {
      category: 'Yellow Network',
      items: [
        { name: 'Yellow Docs', url: 'https://docs.yellow.org/', level: 'Start Here' },
        { name: 'Nitrolite SDK', url: 'https://github.com/yellow-network/nitrolite', level: 'Code' },
        { name: 'State Channels 101', url: 'https://docs.yellow.org/concepts/state-channels', level: 'Concept' },
      ],
    },
    {
      category: 'Li.Fi',
      items: [
        { name: 'Li.Fi Documentation', url: 'https://docs.li.fi/', level: 'Start Here' },
        { name: 'SDK Reference', url: 'https://docs.li.fi/integrate-li.fi-sdk/sdk', level: 'Code' },
        { name: 'Supported Chains', url: 'https://docs.li.fi/general-information/supported-chains', level: 'Reference' },
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
        <p className="text-[var(--text-secondary)]">
          Curated resources to learn about MEV, Uniswap V4, and the technologies powering MEVA.
        </p>
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
                <ExternalLink className="w-4 h-4 text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)] transition-colors" />
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
            { name: 'Yellow Network', url: 'https://community.yellow.org/' },
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

// ============================================
// MAIN COMPONENT
// ============================================
export function DocsPage() {
  const [activeSection, setActiveSection] = useState<Section>('overview')

  const renderSection = () => {
    switch (activeSection) {
      case 'overview': return <OverviewSection />
      case 'how-it-works': return <HowItWorksSection />
      case 'mev-deep-dive': return <MEVDeepDiveSection />
      case 'technology': return <TechnologySection />
      case 'quick-start': return <QuickStartSection />
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
                      ? 'bg-[var(--bg-2)] text-[var(--text-primary)] border border-[var(--border-1)]'
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
