'use client'

import { useEffect, useRef } from 'react'
import { animate } from 'animejs'

interface Props {
  value: number   // 0–1
  label: string
  color: string
}

const RADIUS = 32
const CIRC = 2 * Math.PI * RADIUS

export default function ScoreDonut({ value, label, color }: Props) {
  const circleRef = useRef<SVGCircleElement>(null)
  const numRef = useRef<SVGTextElement>(null)

  useEffect(() => {
    const obj = { v: 0 }
    animate(obj, {
      v: value * 100,
      duration: 1400,
      easing: 'easeOutExpo',
      onUpdate: () => {
        const offset = CIRC * (1 - obj.v / 100)
        circleRef.current?.setAttribute('stroke-dashoffset', String(offset))
        if (numRef.current) numRef.current.textContent = Math.round(obj.v) + '%'
      },
    })
  }, [value])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
      <svg width="80" height="80" viewBox="0 0 80 80">
        {/* Track */}
        <circle
          cx="40" cy="40" r={RADIUS}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="7"
        />
        {/* Progress */}
        <circle
          ref={circleRef}
          cx="40" cy="40" r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={CIRC}
          style={{ transform: 'rotate(-90deg)', transformOrigin: '40px 40px' }}
        />
        {/* Value */}
        <text
          ref={numRef}
          x="40" y="44"
          textAnchor="middle"
          fill="var(--text-1)"
          fontSize="14"
          fontWeight="500"
          fontFamily="var(--font-display)"
        >
          0%
        </text>
      </svg>
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--text-3)',
        }}
      >
        {label}
      </span>
    </div>
  )
}
