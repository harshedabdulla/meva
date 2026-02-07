import { motion, useInView, useSpring, useMotionValue } from 'framer-motion'
import { useRef, useEffect, useState, type ReactNode } from 'react'

// ============================================
// Glow Card - Simple card with hover effect
// ============================================
interface GlowCardProps {
  children: ReactNode
  className?: string
  glowColor?: string
}

export function GlowCard({ children, className = '' }: GlowCardProps) {
  return (
    <div className={`rounded-2xl border border-[var(--border-1)] bg-[var(--bg-1)] transition-colors hover:border-[var(--border-2)] ${className}`}>
      {children}
    </div>
  )
}

// ============================================
// Text Reveal - Staggered text animation
// ============================================
interface TextRevealProps {
  text: string
  className?: string
  delay?: number
}

export function TextReveal({ text, className = '', delay = 0 }: TextRevealProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const words = text.split(' ')

  return (
    <span ref={ref} className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: delay + i * 0.1 }}
          className="inline-block mr-[0.25em]"
        >
          {word}
        </motion.span>
      ))}
    </span>
  )
}

// ============================================
// Animated Counter - Smooth number animation
// ============================================
interface AnimatedCounterProps {
  value: number
  duration?: number
  prefix?: string
  suffix?: string
  className?: string
}

export function AnimatedCounter({ value, duration = 2, prefix = '', suffix = '', className = '' }: AnimatedCounterProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const motionValue = useMotionValue(0)
  const springValue = useSpring(motionValue, { duration: duration * 1000 })
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    if (isInView) {
      motionValue.set(value)
    }
  }, [isInView, value, motionValue])

  useEffect(() => {
    const unsubscribe = springValue.on('change', (latest) => {
      setDisplayValue(Math.round(latest))
    })
    return unsubscribe
  }, [springValue])

  return (
    <span ref={ref} className={className}>
      {prefix}{displayValue.toLocaleString()}{suffix}
    </span>
  )
}

// ============================================
// Gradient Border Card - Animated gradient border
// ============================================
interface GradientBorderCardProps {
  children: ReactNode
  className?: string
}

export function GradientBorderCard({ children, className = '' }: GradientBorderCardProps) {
  return (
    <div className={`rounded-2xl border border-[var(--border-1)] bg-[var(--bg-1)] ${className}`}>
      {children}
    </div>
  )
}

// ============================================
// Floating Element - Subtle floating animation
// ============================================
interface FloatingElementProps {
  children: ReactNode
  duration?: number
  distance?: number
  className?: string
}

export function FloatingElement({ children, duration = 3, distance = 10, className = '' }: FloatingElementProps) {
  return (
    <motion.div
      className={className}
      animate={{
        y: [-distance / 2, distance / 2, -distance / 2],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  )
}

// ============================================
// Pulse Ring - Animated ring effect
// ============================================
interface PulseRingProps {
  color?: string
  size?: number
  className?: string
}

export function PulseRing({ color = 'var(--border-2)', size = 100, className = '' }: PulseRingProps) {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full border-2"
          style={{ borderColor: color }}
          initial={{ opacity: 0.6, scale: 0.8 }}
          animate={{
            opacity: [0.6, 0],
            scale: [0.8, 1.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.6,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  )
}

// ============================================
// Stagger Container - Staggered children animation
// ============================================
interface StaggerContainerProps {
  children: ReactNode
  className?: string
  staggerDelay?: number
}

export function StaggerContainer({ children, className = '', staggerDelay = 0.1 }: StaggerContainerProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
      }}
    >
      {children}
    </motion.div>
  )
}

// ============================================
// Animated Beam - Connection line animation
// ============================================
interface AnimatedBeamProps {
  className?: string
  direction?: 'horizontal' | 'vertical'
}

export function AnimatedBeam({ className = '', direction = 'horizontal' }: AnimatedBeamProps) {
  const isHorizontal = direction === 'horizontal'

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div
        className={`absolute ${isHorizontal ? 'h-[2px] w-full' : 'w-[2px] h-full'}`}
        style={{ background: 'var(--border-1)' }}
      />
      <motion.div
        className={`absolute ${isHorizontal ? 'h-[2px] w-1/3' : 'w-[2px] h-1/3'}`}
        style={{
          background: 'linear-gradient(90deg, transparent, var(--text-tertiary), transparent)',
        }}
        animate={
          isHorizontal
            ? { x: ['-100%', '400%'] }
            : { y: ['-100%', '400%'] }
        }
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
          repeatDelay: 1,
        }}
      />
    </div>
  )
}

// ============================================
// Spotlight Card - Hover spotlight effect
// ============================================
interface SpotlightCardProps {
  children: ReactNode
  className?: string
}

export function SpotlightCard({ children, className = '' }: SpotlightCardProps) {
  return (
    <div className={`rounded-2xl border border-[var(--border-1)] bg-[var(--bg-1)] transition-colors hover:border-[var(--border-2)] ${className}`}>
      {children}
    </div>
  )
}

// ============================================
// Typing Effect - Typewriter animation
// ============================================
interface TypingEffectProps {
  text: string
  className?: string
  speed?: number
  delay?: number
}

export function TypingEffect({ text, className = '', speed = 50, delay = 0 }: TypingEffectProps) {
  const [displayText, setDisplayText] = useState('')
  const [started, setStarted] = useState(false)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (isInView && !started) {
      const timeout = setTimeout(() => setStarted(true), delay)
      return () => clearTimeout(timeout)
    }
  }, [isInView, delay, started])

  useEffect(() => {
    if (!started) return

    let i = 0
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayText(text.slice(0, i + 1))
        i++
      } else {
        clearInterval(interval)
      }
    }, speed)

    return () => clearInterval(interval)
  }, [started, text, speed])

  return (
    <span ref={ref} className={className}>
      {displayText}
      {started && displayText.length < text.length && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          |
        </motion.span>
      )}
    </span>
  )
}

// ============================================
// Flow Diagram Node - For process visualization
// ============================================
interface FlowNodeProps {
  icon: ReactNode
  title: string
  description: string
  isActive?: boolean
  className?: string
}

export function FlowNode({ icon, title, description, isActive = false, className = '' }: FlowNodeProps) {
  return (
    <motion.div
      className={`relative p-4 rounded-xl border transition-all ${
        isActive
          ? 'bg-[var(--bg-2)] border-[var(--border-2)]'
          : 'bg-[var(--bg-1)] border-[var(--border-1)] hover:border-[var(--border-2)]'
      } ${className}`}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${isActive ? 'bg-[var(--bg-3)] text-[var(--text-secondary)]' : 'bg-[var(--bg-3)] text-[var(--text-tertiary)]'}`}>
          {icon}
        </div>
        <div>
          <h4 className="font-semibold text-sm">{title}</h4>
          <p className="text-xs text-[var(--text-tertiary)] mt-1">{description}</p>
        </div>
      </div>
    </motion.div>
  )
}

// ============================================
// Tech Logo Card - For technology showcase
// ============================================
interface TechLogoCardProps {
  name: string
  description: string
  logo: ReactNode
  color?: string
  href?: string
  className?: string
}

export function TechLogoCard({ name, description, logo, href, className = '' }: TechLogoCardProps) {
  const content = (
    <motion.div
      className={`relative p-6 rounded-2xl border border-[var(--border-1)] bg-[var(--bg-1)] overflow-hidden group ${className}`}
      whileHover={{ borderColor: 'var(--border-2)', y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[var(--bg-3)]">
            {logo}
          </div>
          <h3 className="text-lg font-semibold">{name}</h3>
        </div>
        <p className="text-sm text-[var(--text-secondary)]">{description}</p>
      </div>
    </motion.div>
  )

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block">
        {content}
      </a>
    )
  }

  return content
}

// ============================================
// Comparison Table Row - Animated comparison
// ============================================
interface ComparisonRowProps {
  label: string
  before: string
  after: string
  improvement?: 'positive' | 'negative' | 'neutral'
}

export function ComparisonRow({ label, before, after }: ComparisonRowProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      className="flex items-center gap-4 p-3 rounded-xl bg-[var(--bg-2)] border border-[var(--border-1)]"
    >
      <div className="flex-1">
        <p className="text-sm text-[var(--text-tertiary)]">{label}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-[var(--text-tertiary)] line-through opacity-60">{before}</span>
        <motion.span
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : {}}
          transition={{ delay: 0.3 }}
        >
          →
        </motion.span>
        <span className="text-sm font-mono font-semibold text-[var(--text-primary)]">{after}</span>
      </div>
    </motion.div>
  )
}
