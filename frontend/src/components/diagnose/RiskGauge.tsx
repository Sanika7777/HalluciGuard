'use client'

import { useEffect, useRef } from 'react'
import { animate } from 'animejs'

interface Props {
  riskPercent: number
  confidence: number
  label: string
}

const R = 78, CX = 100, CY = 105
const startAngle = -210, sweepAngle = 240
const toRad = (d: number) => (d * Math.PI) / 180

function arcPath(pct: number): string {
  const angle = startAngle + sweepAngle * Math.min(pct, 0.9999)
  const sx = CX + R * Math.cos(toRad(startAngle))
  const sy = CY + R * Math.sin(toRad(startAngle))
  const ex = CX + R * Math.cos(toRad(angle))
  const ey = CY + R * Math.sin(toRad(angle))
  const large = sweepAngle * pct > 180 ? 1 : 0
  return `M ${sx} ${sy} A ${R} ${R} 0 ${large} 1 ${ex} ${ey}`
}

function riskColor(pct: number): string {
  if (pct >= 66) return '#E07070'
  if (pct >= 33) return '#C4A45A'
  return '#6BB8A0'
}

function riskGlow(pct: number): string {
  if (pct >= 66) return 'rgba(224,112,112,0.45)'
  if (pct >= 33) return 'rgba(196,164,90,0.45)'
  return 'rgba(107,184,160,0.45)'
}

export default function RiskGauge({ riskPercent, confidence, label }: Props) {
  const arcRef = useRef<SVGPathElement>(null)
  const numRef = useRef<SVGTextElement>(null)
  const glowRef = useRef<SVGPathElement>(null)

  const color = riskColor(riskPercent)
  const glow = riskGlow(riskPercent)

  useEffect(() => {
    const obj = { pct: 0, num: 0 }
    animate(obj, {
      pct: riskPercent / 100,
      num: riskPercent,
      duration: 1400,
      easing: 'easeOutExpo',
      onUpdate: () => {
        const d = arcPath(obj.pct)
        arcRef.current?.setAttribute('d', d)
        glowRef.current?.setAttribute('d', d)
        if (numRef.current) numRef.current.textContent = Math.round(obj.num) + '%'
      },
    })
  }, [riskPercent])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div className="label" style={{ marginBottom: '8px', alignSelf: 'flex-start' }}>Risk Score</div>
      <svg width="200" height="160" viewBox="0 0 200 160" style={{ overflow: 'visible' }}>
        {/* Glow filter */}
        <defs>
          <filter id="arc-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Track */}
        <path
          d={arcPath(0.9999)}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="9"
          strokeLinecap="round"
        />

        {/* Glow layer */}
        <path
          ref={glowRef}
          d={arcPath(0)}
          fill="none"
          stroke={glow}
          strokeWidth="9"
          strokeLinecap="round"
          filter="url(#arc-glow)"
        />

        {/* Main arc */}
        <path
          ref={arcRef}
          d={arcPath(0)}
          fill="none"
          stroke={color}
          strokeWidth="9"
          strokeLinecap="round"
        />

        {/* Percentage */}
        <text
          ref={numRef}
          x={CX}
          y={CY - 8}
          textAnchor="middle"
          fill="var(--text-1)"
          fontSize="32"
          fontWeight="500"
          fontFamily="var(--font-display)"
          letterSpacing="-1"
        >
          0%
        </text>

        {/* Confidence */}
        <text
          x={CX}
          y={CY + 14}
          textAnchor="middle"
          fill="var(--text-3)"
          fontSize="10"
          fontFamily="var(--font-mono)"
          letterSpacing="1"
        >
          {Math.round(confidence * 100)}% CONF
        </text>
      </svg>

      {/* Risk label badge */}
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          fontWeight: 500,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color,
          border: `1px solid ${color}44`,
          background: `${color}14`,
          borderRadius: '4px',
          padding: '3px 10px',
          marginTop: '4px',
        }}
      >
        {label}
      </span>
    </div>
  )
}
