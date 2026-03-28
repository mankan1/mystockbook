'use client'

import { useEffect, useRef, useState } from 'react'

interface ESLiveChartProps {
  height?: number
  showVolume?: boolean
  annotation?: string
}

export default function ESLiveChart({
  height = 400,
  showVolume = true,
  annotation,
}: ESLiveChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const [price, setPrice] = useState<number | null>(null)
  const [change, setChange] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let chart: any
    let series: any
    let interval: ReturnType<typeof setInterval>

    async function init() {
      // Dynamically import to avoid SSR issues
      const { createChart, ColorType, CrosshairMode } = await import('lightweight-charts')

      if (!chartRef.current) return

      chart = createChart(chartRef.current, {
        width: chartRef.current.clientWidth,
        height,
        layout: {
          background: { type: ColorType.Solid, color: '#16161a' },
          textColor: '#9a9080',
        },
        grid: {
          vertLines: { color: 'rgba(201,168,76,0.06)' },
          horzLines: { color: 'rgba(201,168,76,0.06)' },
        },
        crosshair: {
          mode: CrosshairMode.Normal,
          vertLine: { color: 'rgba(201,168,76,0.5)', labelBackgroundColor: '#c9a84c' },
          horzLine: { color: 'rgba(201,168,76,0.5)', labelBackgroundColor: '#c9a84c' },
        },
        rightPriceScale: {
          borderColor: 'rgba(201,168,76,0.15)',
          textColor: '#9a9080',
        },
        timeScale: {
          borderColor: 'rgba(201,168,76,0.15)',
          textColor: '#9a9080',
          timeVisible: true,
          secondsVisible: false,
        },
      })

      series = chart.addCandlestickSeries({
        upColor: '#4caf82',
        downColor: '#e05252',
        borderUpColor: '#4caf82',
        borderDownColor: '#e05252',
        wickUpColor: '#4caf82',
        wickDownColor: '#e05252',
      })

      // Fetch initial data
      await fetchAndUpdate()
      setIsLoading(false)

      // Poll every 5s for live price
      interval = setInterval(fetchAndUpdate, 5000)

      // Resize observer
      const ro = new ResizeObserver(() => {
        if (chartRef.current) {
          chart.applyOptions({ width: chartRef.current.clientWidth })
        }
      })
      if (chartRef.current) ro.observe(chartRef.current)

      return () => ro.disconnect()
    }

    async function fetchAndUpdate() {
      try {
        const res = await fetch('/api/es-price')
        if (!res.ok) throw new Error('Feed unavailable')
        const data = await res.json()

        if (data.candles && series) {
          series.setData(data.candles)
          chart?.timeScale().fitContent()
        }

        if (data.price) {
          setPrice(data.price)
          setChange(data.change ?? 0)
        }
      } catch (e) {
        setError('Live feed unavailable — showing cached data')
      }
    }

    init()

    return () => {
      clearInterval(interval)
      chart?.remove()
    }
  }, [height])

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      overflow: 'hidden',
      margin: '2rem 0',
    }}>
      {/* Header bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 1.25rem',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-elevated)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: isLoading ? 'var(--gold-dim)' : '#4caf82',
            display: 'inline-block',
            animation: isLoading ? 'none' : 'pulse-gold 2s infinite',
          }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--gold)' }}>
            /ES · E-MINI S&P 500
          </span>
        </div>
        {price && (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: 600 }}>
              {price.toFixed(2)}
            </span>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.8rem',
              color: change >= 0 ? 'var(--green)' : 'var(--red)',
            }}>
              {change >= 0 ? '+' : ''}{change.toFixed(2)}
            </span>
          </div>
        )}
      </div>

      {/* Chart */}
      <div style={{ position: 'relative' }}>
        {isLoading && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            background: 'var(--bg-card)', zIndex: 10,
          }}>
            <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
              Loading chart...
            </span>
          </div>
        )}
        <div ref={chartRef} style={{ width: '100%' }} />
      </div>

      {/* Annotation / teaching note */}
      {annotation && (
        <div style={{
          padding: '0.875rem 1.25rem',
          borderTop: '1px solid var(--border)',
          background: 'rgba(201,168,76,0.04)',
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'flex-start',
        }}>
          <span style={{ color: 'var(--gold)', fontSize: '0.9rem', flexShrink: 0 }}>📌</span>
          <p style={{
            margin: 0, fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            fontStyle: 'italic',
          }}>
            {annotation}
          </p>
        </div>
      )}

      {error && (
        <div style={{ padding: '0.5rem 1.25rem', fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
          ⚠ {error}
        </div>
      )}
    </div>
  )
}
