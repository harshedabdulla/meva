import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface DataPoint {
  epoch: number
  lpDividends: number
  victimRebates: number
  stakerRewards: number
}

// demo data (replace with API call)
const DEMO_DATA: DataPoint[] = Array.from({ length: 14 }, (_, i) => ({
  epoch: i + 1,
  lpDividends: 0.5 + Math.random() * 2,
  victimRebates: 0.3 + Math.random() * 1.2,
  stakerRewards: 0.2 + Math.random() * 0.8,
}))

type TimeRange = '7d' | '14d' | '30d'

export function DividendChart() {
  const [timeRange, setTimeRange] = useState<TimeRange>('14d')
  const [hoveredBar, setHoveredBar] = useState<number | null>(null)

  const data = useMemo(() => {
    const days = timeRange === '7d' ? 7 : timeRange === '14d' ? 14 : 30
    return DEMO_DATA.slice(-days)
  }, [timeRange])

  const maxValue = useMemo(() => {
    return Math.max(...data.map((d) => d.lpDividends + d.victimRebates + d.stakerRewards))
  }, [data])

  const totals = useMemo(() => {
    return data.reduce(
      (acc, d) => ({
        lp: acc.lp + d.lpDividends,
        victim: acc.victim + d.victimRebates,
        staker: acc.staker + d.stakerRewards,
      }),
      { lp: 0, victim: 0, staker: 0 }
    )
  }, [data])

  const totalDistributed = totals.lp + totals.victim + totals.staker
  const previousTotal = totalDistributed * (0.8 + Math.random() * 0.3) // demo comparison
  const changePercent = ((totalDistributed - previousTotal) / previousTotal) * 100
  const isPositive = changePercent >= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
      className="card overflow-hidden"
    >
      {/* Header */}
      <div className="p-5 border-b border-[var(--border-1)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-[var(--text-primary)]">Distribution History</h2>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">Dividends by epoch</p>
          </div>
          <div className="flex gap-1">
            {(['7d', '14d', '30d'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`btn btn-sm ${timeRange === range ? 'btn-primary' : 'btn-secondary'}`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-3xl font-semibold font-mono text-[var(--text-primary)]">
              {totalDistributed.toFixed(2)} <span className="text-base text-[var(--text-secondary)]">ETH</span>
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              {isPositive ? (
                <TrendingUp className="w-3.5 h-3.5 text-[var(--green)]" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 text-[var(--red)]" />
              )}
              <span className={`text-xs font-medium ${isPositive ? 'text-[var(--green)]' : 'text-[var(--red)]'}`}>
                {isPositive ? '+' : ''}{changePercent.toFixed(1)}%
              </span>
              <span className="text-xs text-[var(--text-tertiary)]">vs previous period</span>
            </div>
          </div>
          <div className="flex gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-[var(--pink-500)]" />
              <span className="text-[var(--text-secondary)]">LPs</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-[var(--blue)]" />
              <span className="text-[var(--text-secondary)]">Victims</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-[var(--green)]" />
              <span className="text-[var(--text-secondary)]">Stakers</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-5">
        <div className="flex items-end gap-1.5 h-[180px]">
          {data.map((point, index) => {
            const total = point.lpDividends + point.victimRebates + point.stakerRewards
            const heightPercent = (total / maxValue) * 100
            const lpHeight = (point.lpDividends / total) * 100
            const victimHeight = (point.victimRebates / total) * 100
            const stakerHeight = (point.stakerRewards / total) * 100
            const isHovered = hoveredBar === index

            return (
              <div
                key={point.epoch}
                className="flex-1 flex flex-col justify-end relative"
                onMouseEnter={() => setHoveredBar(index)}
                onMouseLeave={() => setHoveredBar(null)}
              >
                {/* Tooltip */}
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-10"
                  >
                    <div className="card-elevated px-3 py-2 text-xs whitespace-nowrap">
                      <p className="font-medium text-[var(--text-primary)] mb-1">Epoch #{point.epoch}</p>
                      <p className="text-[var(--text-secondary)]">
                        Total: <span className="font-mono text-[var(--text-primary)]">{total.toFixed(3)} ETH</span>
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Stacked Bar */}
                <div
                  className={`w-full rounded-t-md overflow-hidden transition-all duration-200 cursor-pointer ${
                    isHovered ? 'opacity-100' : 'opacity-80'
                  }`}
                  style={{ height: `${heightPercent}%`, minHeight: '4px' }}
                >
                  <div className="h-full flex flex-col-reverse">
                    <div
                      className="bg-[var(--pink-500)] transition-all"
                      style={{ height: `${lpHeight}%` }}
                    />
                    <div
                      className="bg-[var(--blue)] transition-all"
                      style={{ height: `${victimHeight}%` }}
                    />
                    <div
                      className="bg-[var(--green)] transition-all"
                      style={{ height: `${stakerHeight}%` }}
                    />
                  </div>
                </div>

                {/* Label */}
                <p className="text-[10px] text-[var(--text-tertiary)] text-center mt-2 font-mono">
                  {point.epoch}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}
