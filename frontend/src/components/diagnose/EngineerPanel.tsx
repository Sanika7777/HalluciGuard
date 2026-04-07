'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import type { EngineerResult } from '@/hooks/useAnalyze'

interface Props {
  result: EngineerResult
  onClose: () => void
}

const ease = [0.4, 0, 0.2, 1] as const

export default function EngineerPanel({ result, onClose }: Props) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result.engineered_prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12, scale: 0.97 }}
      transition={{ duration: 0.35, ease }}
      style={{ marginTop: '24px' }}
    >
      <div className="label" style={{ marginBottom: '16px' }}>Engineered Prompt</div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
        }}
        className="engineer-grid"
      >
        {/* Original */}
        <div
          className="card"
          style={{ opacity: 0.6 }}
        >
          <div className="label" style={{ marginBottom: '12px' }}>Original</div>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '14px',
              lineHeight: 1.7,
              color: 'var(--text-2)',
            }}
          >
            {result.original_prompt}
          </p>
        </div>

        {/* Engineered */}
        <div className="card" style={{ borderColor: 'rgba(126,184,212,0.18)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div className="label">Engineered</div>
            <button
              onClick={handleCopy}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                padding: '4px 10px',
                borderRadius: '5px',
                border: '1px solid rgba(126,184,212,0.28)',
                background: copied ? 'rgba(126,184,212,0.14)' : 'transparent',
                color: copied ? '#A8C8E8' : 'var(--text-3)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '14px',
              lineHeight: 1.7,
              color: 'var(--text-1)',
            }}
          >
            {result.engineered_prompt}
          </p>
        </div>
      </div>

      {/* Improvements + risk reduction */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: '12px',
          alignItems: 'start',
          marginTop: '12px',
        }}
        className="engineer-bottom"
      >
        {/* Improvements */}
        <div className="card">
          <div className="label" style={{ marginBottom: '12px' }}>Improvements</div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {result.improvements.map((item, i) => (
              <li
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '13px',
                  lineHeight: 1.6,
                  color: 'var(--text-2)',
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: 'var(--accent)',
                    marginTop: '5px',
                    flexShrink: 0,
                  }}
                />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Estimated risk reduction */}
        <div className="card" style={{ textAlign: 'center', minWidth: '120px' }}>
          <div className="label" style={{ marginBottom: '10px' }}>Risk Reduction</div>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '28px',
              fontWeight: 500,
              color: '#6BB8A0',
              textTransform: 'capitalize',
              letterSpacing: '-0.01em',
            }}
          >
            {result.estimated_risk_reduction}
          </div>
        </div>
      </div>

      {/* Close */}
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '8px',
            padding: '8px 24px',
            color: 'var(--text-2)',
            fontFamily: 'var(--font-ui)',
            fontSize: '13px',
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
          Close
        </button>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .engineer-grid { grid-template-columns: 1fr !important; }
          .engineer-bottom { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </motion.div>
  )
}
