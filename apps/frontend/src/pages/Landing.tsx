import { useRef, useEffect, useState } from 'react'
import { motion, useScroll, useTransform, useSpring, useInView, AnimatePresence } from 'framer-motion'
import { ArrowRight, Shield, Zap, Users, TrendingUp, ChevronDown, Github, BookOpen, MessageCircle } from 'lucide-react'

// ============================================
// MEVA CRYSTAL - Pure CSS Animated Design
// ============================================

function MevaCrystal() {
  return (
    <div className="relative w-72 h-72 md:w-96 md:h-96">
      {/* Outer glow rings */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full"
          style={{
            border: '1px solid rgba(255, 0, 122, 0.15)',
          }}
          animate={{
            scale: [1, 1.4 + i * 0.15, 1],
            opacity: [0.4, 0, 0.4],
          }}
          transition={{
            duration: 3.5,
            delay: i * 0.6,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      ))}

      {/* Background glow */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <div
          className="w-48 h-48 md:w-64 md:h-64 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255,0,122,0.2) 0%, rgba(255,0,122,0.05) 50%, transparent 70%)',
            filter: 'blur(30px)',
          }}
        />
      </motion.div>

      {/* Central crystal shape */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="relative"
          animate={{ rotateY: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
        >
          {/* Main diamond */}
          <div className="relative w-36 h-36 md:w-48 md:h-48">
            {/* Outer diamond */}
            <motion.div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(135deg, rgba(255,0,122,0.4) 0%, rgba(255,133,192,0.15) 50%, rgba(255,0,122,0.4) 100%)',
                clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                boxShadow: '0 0 80px rgba(255,0,122,0.5), inset 0 0 40px rgba(255,255,255,0.1)',
              }}
              animate={{
                scale: [1, 1.03, 1],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            {/* Inner diamond layer */}
            <motion.div
              className="absolute inset-6"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,0,122,0.2) 50%, rgba(255,255,255,0.1) 100%)',
                clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
              }}
              animate={{
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            {/* Core highlight */}
            <motion.div
              className="absolute inset-12"
              style={{
                background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
                clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
              }}
              animate={{
                opacity: [0.3, 0.7, 0.3],
                scale: [0.9, 1.1, 0.9],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </div>
        </motion.div>
      </div>

      {/* Orbiting particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`orbit-${i}`}
          className="absolute w-2 h-2 rounded-full"
          style={{
            background: i % 2 === 0
              ? 'radial-gradient(circle, rgba(255,0,122,0.8) 0%, rgba(255,0,122,0.4) 100%)'
              : 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 100%)',
            boxShadow: i % 2 === 0
              ? '0 0 10px rgba(255,0,122,0.6)'
              : '0 0 10px rgba(255,255,255,0.6)',
            left: '50%',
            top: '50%',
          }}
          animate={{
            x: [
              Math.cos((i * Math.PI) / 3) * 120,
              Math.cos((i * Math.PI) / 3 + Math.PI) * 120,
              Math.cos((i * Math.PI) / 3) * 120,
            ],
            y: [
              Math.sin((i * Math.PI) / 3) * 120,
              Math.sin((i * Math.PI) / 3 + Math.PI) * 120,
              Math.sin((i * Math.PI) / 3) * 120,
            ],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 8 + i,
            delay: i * 0.5,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}

      {/* Floating sparkles */}
      {[...Array(10)].map((_, i) => (
        <motion.div
          key={`sparkle-${i}`}
          className="absolute w-1 h-1 rounded-full bg-white"
          style={{
            left: `${20 + (i * 7)}%`,
            top: `${15 + (i * 8)}%`,
            boxShadow: '0 0 4px rgba(255,255,255,0.8)',
          }}
          animate={{
            y: [-15, 15, -15],
            x: [-8, 8, -8],
            opacity: [0, 1, 0],
            scale: [0.5, 1.2, 0.5],
          }}
          transition={{
            duration: 2.5 + Math.random() * 2,
            delay: i * 0.25,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

// ============================================
// HERO SECTION - Cinematic opening
// ============================================
function HeroSection({ onEnter }: { onEnter: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start']
  })

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95])
  const y = useTransform(scrollYProgress, [0, 0.5], [0, -50])

  return (
    <motion.section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ opacity, scale, y }}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255,0,122,0.05) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '100px 100px',
        }}
      />

      {/* Content - Two column layout on desktop */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Left: Text content */}
          <div className="flex-1 text-center lg:text-left">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--border-1)] bg-[var(--bg-2)] text-xs tracking-widest uppercase text-[var(--text-tertiary)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--pink-500)] animate-pulse" />
                Uniswap V4 Hook
              </span>
            </motion.div>

            {/* Main headline */}
            <motion.h1
              className="mt-8 text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[0.95]"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
            >
              <span className="block text-[var(--text-primary)]">Don't fight MEV</span>
              <motion.span
                className="block mt-2 bg-gradient-to-r from-[var(--pink-500)] to-[var(--pink-400)] bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.6 }}
              >
                Own it.
              </motion.span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              className="mt-8 text-lg md:text-xl text-[var(--text-secondary)] max-w-xl leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              The first MEV capture and redistribution protocol.
              Tax the bots. Reward the users.
            </motion.p>

            {/* CTA */}
            <motion.div
              className="mt-10 flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
            >
              <button
                onClick={onEnter}
                className="group relative px-8 py-4 bg-[var(--pink-500)] text-white rounded-full font-medium text-sm tracking-wide overflow-hidden transition-all hover:scale-105 hover:shadow-lg hover:shadow-[var(--pink-500)]/25"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Launch App
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
              </button>
              <a
                href="https://github.com/meva-protocol/meva"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 px-6 py-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm transition-colors"
              >
                <div className="w-10 h-10 rounded-full border border-[var(--border-1)] flex items-center justify-center group-hover:border-[var(--border-2)] transition-colors">
                  <Github className="w-4 h-4" />
                </div>
                View on GitHub
              </a>
            </motion.div>
          </div>

          {/* Right: Animated Crystal */}
          <motion.div
            className="flex-1 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.5 }}
          >
            <MevaCrystal />
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-12 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Scroll</span>
          <ChevronDown className="w-5 h-5 text-[var(--text-tertiary)]" />
        </motion.div>
      </motion.div>
    </motion.section>
  )
}

// ============================================
// STATS SECTION - Dramatic numbers
// ============================================
function StatsSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const stats = [
    { value: 125, suffix: 'ETH', label: 'Total Captured' },
    { value: 89, suffix: 'ETH', label: 'Redistributed' },
    { value: 1247, suffix: '', label: 'Bots Taxed' },
    { value: 340, suffix: '+', label: 'LPs Rewarded' },
  ]

  return (
    <section ref={ref} className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="text-center"
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: i * 0.1 }}
            >
              <div className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-[var(--text-primary)]">
                <AnimatedNumber value={stat.value} isInView={isInView} />
                <span className="text-[var(--text-tertiary)]">{stat.suffix}</span>
              </div>
              <p className="mt-3 text-sm text-[var(--text-tertiary)] tracking-wide uppercase">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function AnimatedNumber({ value, isInView }: { value: number; isInView: boolean }) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    if (!isInView) return

    const duration = 2000
    const startTime = performance.now()

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 4)

      setDisplayValue(Math.floor(eased * value))

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [isInView, value])

  return <>{displayValue.toLocaleString()}</>
}

// ============================================
// FLOW SECTION - How it works
// ============================================
function FlowSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [activeStep, setActiveStep] = useState(0)

  const steps = [
    {
      icon: Shield,
      title: 'Detect',
      description: 'V4 hook identifies bot transactions in real-time using gas analysis, contract detection, and behavioral patterns.'
    },
    {
      icon: Zap,
      title: 'Tax',
      description: 'Dynamic fee applied via beforeSwap hook. Unlicensed bots pay 50%, licensed pay 10%.'
    },
    {
      icon: TrendingUp,
      title: 'Capture',
      description: 'Extracted value flows to MevaVault smart contract for secure accumulation.'
    },
    {
      icon: Users,
      title: 'Distribute',
      description: '50% to LPs, 30% to sandwich victims, 20% to protocol stakers. Fair redistribution.'
    },
  ]

  useEffect(() => {
    if (!isInView) return
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [isInView, steps.length])

  return (
    <section ref={ref} className="py-32 px-6 relative">
      {/* Background accent */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--border-1)] to-transparent" />
      </div>

      <div className="max-w-6xl mx-auto relative">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight">
            Elegant simplicity
          </h2>
          <p className="mt-4 text-[var(--text-secondary)] max-w-lg mx-auto">
            Four steps to transform MEV from extraction to redistribution.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              className={`relative p-8 rounded-2xl border transition-all duration-500 cursor-pointer ${
                activeStep === i
                  ? 'bg-[var(--bg-2)] border-[var(--border-2)]'
                  : 'bg-[var(--bg-1)] border-[var(--border-1)] hover:border-[var(--border-2)]'
              }`}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: i * 0.1 }}
              onClick={() => setActiveStep(i)}
            >
              {/* Step number */}
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-[var(--bg-1)] border border-[var(--border-1)] flex items-center justify-center text-xs font-mono text-[var(--text-tertiary)]">
                {String(i + 1).padStart(2, '0')}
              </div>

              <step.icon className={`w-8 h-8 mb-6 transition-colors duration-500 ${
                activeStep === i ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'
              }`} />

              <h3 className="text-lg font-semibold mb-3">{step.title}</h3>

              <p className={`text-sm leading-relaxed transition-colors duration-500 ${
                activeStep === i ? 'text-[var(--text-secondary)]' : 'text-[var(--text-tertiary)]'
              }`}>
                {step.description}
              </p>

              {/* Progress bar */}
              {activeStep === i && (
                <motion.div
                  className="absolute bottom-0 left-0 h-0.5 bg-[var(--text-tertiary)]"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 3, ease: 'linear' }}
                />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============================================
// FEATURES SECTION - Premium cards with hover
// ============================================
function FeaturesSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const features = [
    {
      title: 'Uniswap V4 Native',
      description: 'Built directly into the swap lifecycle. No external contracts, no latency, no front-running risk.',
      visual: 'hook',
    },
    {
      title: 'Yellow Network',
      description: 'Off-chain state channels aggregate taxes in real-time, settling batches on-chain for 99% gas reduction.',
      visual: 'channels',
    },
    {
      title: 'Li.Fi Cross-Chain',
      description: 'Claim your rewards on any chain. Automatic bridge routing finds the optimal path.',
      visual: 'bridge',
    },
  ]

  return (
    <section ref={ref} className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight">
            Built for performance
          </h2>
          <p className="mt-4 text-[var(--text-secondary)] max-w-lg mx-auto">
            Enterprise-grade infrastructure meets DeFi innovation.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <FeatureCard
              key={feature.title}
              feature={feature}
              index={i}
              isInView={isInView}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function FeatureCard({
  feature,
  index,
  isInView
}: {
  feature: { title: string; description: string; visual: string }
  index: number
  isInView: boolean
}) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      className="group relative aspect-[4/5] rounded-2xl border border-[var(--border-1)] bg-[var(--bg-1)] overflow-hidden cursor-pointer"
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: index * 0.1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -8 }}
    >
      {/* Visual area */}
      <div className="absolute inset-0 flex items-center justify-center">
        <FeatureVisual type={feature.visual} isActive={isHovered} />
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-1)] via-transparent to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-8">
        <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          {feature.description}
        </p>
      </div>

      {/* Hover border glow */}
      <motion.div
        className="absolute inset-0 rounded-2xl border border-[var(--border-2)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  )
}

function FeatureVisual({ type, isActive }: { type: string; isActive: boolean }) {
  if (type === 'hook') {
    return (
      <div className="relative w-32 h-32">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border border-[var(--border-1)]"
            animate={{
              scale: isActive ? [1, 1.5, 1] : 1,
              opacity: isActive ? [0.5, 0, 0.5] : 0.3,
            }}
            transition={{
              duration: 2,
              delay: i * 0.3,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
        ))}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 rounded-full bg-[var(--text-tertiary)]" />
        </div>
      </div>
    )
  }

  if (type === 'channels') {
    return (
      <div className="relative w-48 h-32">
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="absolute h-px bg-[var(--border-1)]"
            style={{
              top: `${20 + i * 15}%`,
              left: '10%',
              right: '10%',
            }}
            animate={{
              scaleX: isActive ? [0, 1, 0] : 0.5,
              opacity: isActive ? [0, 1, 0] : 0.3,
            }}
            transition={{
              duration: 1.5,
              delay: i * 0.2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    )
  }

  if (type === 'bridge') {
    return (
      <div className="relative w-48 h-32 flex items-center justify-between px-8">
        <motion.div
          className="w-8 h-8 rounded-lg border border-[var(--border-1)]"
          animate={{ scale: isActive ? [1, 1.1, 1] : 1 }}
          transition={{ duration: 1, repeat: Infinity }}
        />
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-px"
          style={{ background: 'var(--border-1)' }}
        >
          <motion.div
            className="absolute h-full w-4 bg-[var(--text-tertiary)]"
            animate={{ x: isActive ? [-20, 40, -20] : 0 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
        <motion.div
          className="w-8 h-8 rounded-lg border border-[var(--border-1)]"
          animate={{ scale: isActive ? [1, 1.1, 1] : 1 }}
          transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
        />
      </div>
    )
  }

  return null
}

// ============================================
// CODE SECTION - Technical showcase
// ============================================
function CodeSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [activeTab, setActiveTab] = useState(0)

  const tabs = [
    { name: 'Detection', code: `// MevaHook.sol
function analyzeTransaction(
    address sender,
    int256 amount,
    uint256 gasPrice
) internal view returns (
    bool isBot,
    uint256 confidence,
    string memory reason
) {
    // Gas analysis
    if (gasPrice > averageGasPrice * 3) {
        return (true, 90, "High gas");
    }

    // Registry check
    if (botRegistry.isKnownBot(sender)) {
        return (true, 100, "Known bot");
    }

    // Behavioral analysis
    if (isContractCall && amount > threshold) {
        return (true, 75, "Pattern match");
    }
}` },
    { name: 'Fee Override', code: `// Dynamic fee application
function _beforeSwap(
    address sender,
    PoolKey calldata key,
    SwapParams calldata params
) internal override returns (
    bytes4, BeforeSwapDelta, uint24
) {
    (bool isBot, uint256 confidence,) =
        analyzeTransaction(sender, params.amount);

    uint24 fee = isBot
        ? (botRegistry.isLicensed(sender)
            ? 100000  // 10% licensed
            : 500000) // 50% unlicensed
        : 3000;       // 0.3% normal

    return (
        this.beforeSwap.selector,
        BeforeSwapDeltaLibrary.ZERO_DELTA,
        fee | LPFeeLibrary.OVERRIDE_FEE_FLAG
    );
}` },
    { name: 'Distribution', code: `// MevaVault.sol
function distribute(uint256 epoch) external {
    uint256 captured = epochCaptures[epoch];
    require(captured > 0, "Nothing to distribute");

    // 50% to LPs
    uint256 lpShare = captured * 50 / 100;
    lpDividends += lpShare;

    // 30% to victims
    uint256 victimShare = captured * 30 / 100;
    victimRebates += victimShare;

    // 20% to stakers
    uint256 stakerShare = captured * 20 / 100;
    stakerRewards += stakerShare;

    emit Distributed(epoch, lpShare, victimShare, stakerShare);
}` },
  ]

  return (
    <section ref={ref} className="py-32 px-6 relative overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight">
            Under the hood
          </h2>
          <p className="mt-4 text-[var(--text-secondary)] max-w-lg mx-auto">
            Clean, auditable Solidity. Every line serves a purpose.
          </p>
        </motion.div>

        <motion.div
          className="rounded-2xl border border-[var(--border-1)] bg-[var(--bg-1)] overflow-hidden"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Tabs */}
          <div className="flex border-b border-[var(--border-1)]">
            {tabs.map((tab, i) => (
              <button
                key={tab.name}
                className={`px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === i
                    ? 'text-[var(--text-primary)] border-b-2 border-[var(--text-primary)] -mb-px'
                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                }`}
                onClick={() => setActiveTab(i)}
              >
                {tab.name}
              </button>
            ))}
          </div>

          {/* Code display */}
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.pre
                key={activeTab}
                className="p-6 overflow-x-auto text-sm font-mono text-[var(--text-secondary)] leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <code>{tabs[activeTab].code}</code>
              </motion.pre>
            </AnimatePresence>

            {/* Line highlight effect */}
            <motion.div
              className="absolute left-0 w-full h-6 bg-[var(--bg-2)] opacity-0 pointer-events-none"
              style={{ top: '20%' }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ============================================
// CTA SECTION - Final push
// ============================================
function CTASection({ onEnter }: { onEnter: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section ref={ref} className="py-32 px-6 relative">
      {/* Ambient glow */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.02) 0%, transparent 70%)',
        }}
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="max-w-3xl mx-auto text-center relative"
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-4xl md:text-6xl font-semibold tracking-tight leading-tight">
          Ready to reclaim
          <br />
          <span className="text-[var(--text-tertiary)]">what's yours?</span>
        </h2>

        <p className="mt-6 text-lg text-[var(--text-secondary)] max-w-md mx-auto">
          Join the protocol that turns MEV extraction into community rewards.
        </p>

        <motion.button
          onClick={onEnter}
          className="mt-12 group relative px-10 py-5 bg-[var(--text-primary)] text-[var(--bg-1)] rounded-full font-medium tracking-wide overflow-hidden"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="relative z-10 flex items-center gap-3">
            Enter Dashboard
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </span>
        </motion.button>

        <p className="mt-8 text-xs text-[var(--text-tertiary)]">
          Deployed on Sepolia Testnet
        </p>
      </motion.div>
    </section>
  )
}

// ============================================
// MAIN LANDING PAGE
// ============================================
export function LandingPage({ onEnter }: { onEnter: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ container: containerRef })
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })

  return (
    <div ref={containerRef} className="h-screen overflow-y-auto overflow-x-hidden">
      {/* Progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-px bg-[var(--text-tertiary)] origin-left z-50"
        style={{ scaleX }}
      />

      {/* Sections */}
      <HeroSection onEnter={onEnter} />
      <StatsSection />
      <FlowSection />
      <FeaturesSection />
      <CodeSection />
      <CTASection onEnter={onEnter} />

      {/* Footer */}
      <footer className="py-16 px-6 border-t border-[var(--border-1)]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <rect width="32" height="32" rx="8" fill="url(#footer-logo-gradient)"/>
                  <path d="M10 16L14 12L18 16L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10 20L14 16L18 20L22 16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <defs>
                    <linearGradient id="footer-logo-gradient" x1="0" y1="0" x2="32" y2="32">
                      <stop stopColor="#FF007A"/>
                      <stop offset="1" stopColor="#FF85C0"/>
                    </linearGradient>
                  </defs>
                </svg>
                <span className="text-xl font-semibold">MEVA</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--bg-2)] text-[var(--text-tertiary)]">v1.0</span>
              </div>
              <p className="text-sm text-[var(--text-tertiary)] max-w-xs leading-relaxed">
                The first MEV capture and redistribution protocol built on Uniswap V4.
                Turning extraction into rewards.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-medium text-sm mb-4 text-[var(--text-secondary)]">Resources</h4>
              <ul className="space-y-3 text-sm text-[var(--text-tertiary)]">
                <li>
                  <button onClick={onEnter} className="hover:text-[var(--text-secondary)] transition-colors flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Documentation
                  </button>
                </li>
                <li>
                  <a href="https://github.com/meva-protocol/meva" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--text-secondary)] transition-colors flex items-center gap-2">
                    <Github className="w-4 h-4" />
                    GitHub
                  </a>
                </li>
              </ul>
            </div>

            {/* Community */}
            <div>
              <h4 className="font-medium text-sm mb-4 text-[var(--text-secondary)]">Community</h4>
              <ul className="space-y-3 text-sm text-[var(--text-tertiary)]">
                <li>
                  <a href="https://discord.gg/meva" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--text-secondary)] transition-colors flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Discord
                  </a>
                </li>
                <li>
                  <a href="https://twitter.com/mevaprotocol" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--text-secondary)] transition-colors flex items-center gap-2">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    Twitter
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-[var(--border-1)] flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[var(--text-tertiary)]">
              MIT License. Built with Uniswap V4, Yellow Network & Li.Fi
            </p>
            <p className="text-xs text-[var(--text-tertiary)]">
              Deployed on Sepolia Testnet
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
