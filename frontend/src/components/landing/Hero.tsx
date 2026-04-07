'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function Hero() {
  const ease = [0.4, 0, 0.2, 1] as const

  return (
    <section
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '120px 24px 80px',
        textAlign: 'center',
      }}
    >
      {/* Label */}
      <motion.span
        className="label"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease }}
        style={{ marginBottom: '32px', display: 'block' }}
      >
        ML-powered hallucination detection
      </motion.span>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.1, ease }}
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(48px, 6vw, 88px)',
          fontWeight: 500,
          lineHeight: 1.05,
          letterSpacing: '-0.03em',
          color: 'var(--text-1)',
          maxWidth: '880px',
          marginBottom: '12px',
        }}
      >
        Know when your LLM
      </motion.h1>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.18, ease }}
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(48px, 6vw, 88px)',
          fontWeight: 400,
          fontStyle: 'italic',
          lineHeight: 1.05,
          letterSpacing: '-0.03em',
          color: 'var(--text-2)',
          maxWidth: '880px',
          marginBottom: '36px',
        }}
      >
        is about to hallucinate.
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        className="body-lg"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.28, ease }}
        style={{ maxWidth: '560px', marginBottom: '48px' }}
      >
        HalluciGuard analyzes your prompts word by word, scores hallucination
        risk, and rewrites them to be safer — before you send a single token.
      </motion.p>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.38, ease }}
        style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}
      >
        <Link href="/diagnose" style={{ textDecoration: 'none' }}>
          <button
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              background: 'rgba(126,184,212,0.14)',
              border: '1px solid rgba(126,184,212,0.28)',
              borderRadius: '8px',
              color: '#A8C8E8',
              fontFamily: 'var(--font-ui)',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              letterSpacing: '0.01em',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget
              el.style.background = 'rgba(126,184,212,0.22)'
              el.style.borderColor = 'rgba(126,184,212,0.45)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget
              el.style.background = 'rgba(126,184,212,0.14)'
              el.style.borderColor = 'rgba(126,184,212,0.28)'
            }}
          >
            Start analyzing
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </Link>

        <a href="#features" style={{ textDecoration: 'none' }}>
          <button
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '8px',
              color: 'var(--text-2)',
              fontFamily: 'var(--font-ui)',
              fontSize: '14px',
              fontWeight: 400,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget
              el.style.borderColor = 'rgba(255,255,255,0.14)'
              el.style.color = 'var(--text-1)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget
              el.style.borderColor = 'rgba(255,255,255,0.07)'
              el.style.color = 'var(--text-2)'
            }}
          >
            See how it works
          </button>
        </a>
      </motion.div>

      {/* Dashboard mockup */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, delay: 0.55, ease }}
        style={{
          marginTop: '80px',
          width: '100%',
          maxWidth: '780px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '20px',
          padding: '32px',
          display: 'flex',
          gap: '24px',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
        }}
      >
        {/* Mini gauge mockup */}
        <div style={{ flex: '0 0 auto' }}>
          <div className="label" style={{ marginBottom: '12px' }}>Risk Score</div>
          <svg width="130" height="100" viewBox="0 0 130 100">
            {/* Track arc */}
            <path
              d="M 17 87 A 52 52 0 1 1 113 87"
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="8"
              strokeLinecap="round"
            />
            {/* Risk arc (74%) */}
            <path
              d="M 17 87 A 52 52 0 1 1 99.7 45.2"
              fill="none"
              stroke="#E07070"
              strokeWidth="8"
              strokeLinecap="round"
              style={{ filter: 'drop-shadow(0 0 6px rgba(224,112,112,0.5))' }}
            />
            <text x="65" y="68" textAnchor="middle" fill="#F0EDE8" fontSize="22" fontWeight="500" fontFamily="var(--font-display)">74%</text>
            <text x="65" y="82" textAnchor="middle" fill="#8A8580" fontSize="9" fontFamily="var(--font-mono)">HIGH RISK</text>
          </svg>
        </div>

        {/* Mini highlights mockup */}
        <div style={{ flex: 1, minWidth: '200px' }}>
          <div className="label" style={{ marginBottom: '12px' }}>Risk Highlights</div>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '14px',
              lineHeight: 1.75,
              color: 'var(--text-1)',
            }}
          >
            Tell me{' '}
            <span className="hl-high">everything</span>{' '}
            about the{' '}
            <span className="hl-med">best</span>{' '}
            way to{' '}
            <span className="hl-high">always</span>{' '}
            get the{' '}
            <span className="hl-low">correct</span>{' '}
            answer from GPT-4.
          </p>
          <div style={{ marginTop: '16px', display: 'flex', gap: '16px' }}>
            {[
              { color: '#E07070', label: 'High' },
              { color: '#C4A45A', label: 'Medium' },
              { color: '#6BB8A0', label: 'Low' },
            ].map(({ color, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, display: 'block' }} />
                <span className="mono-sm">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  )
}
