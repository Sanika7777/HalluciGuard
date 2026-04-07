'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

const ease = [0.4, 0, 0.2, 1] as const

export default function CTA() {
  return (
    <section
      style={{
        background: 'rgba(255,255,255,0.02)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        padding: '120px 24px',
        textAlign: 'center',
      }}
    >
      <motion.h2
        className="title-lg"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease }}
        viewport={{ once: true, margin: '-80px' }}
        style={{ marginBottom: '20px' }}
      >
        Ready to ship safer prompts?
      </motion.h2>

      <motion.p
        className="body-lg"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease }}
        viewport={{ once: true, margin: '-80px' }}
        style={{ maxWidth: '440px', margin: '0 auto 40px' }}
      >
        Start detecting hallucination risk in seconds. No signup required.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.2, ease }}
        viewport={{ once: true, margin: '-80px' }}
      >
        <Link href="/diagnose" style={{ textDecoration: 'none' }}>
          <button
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 32px',
              background: 'rgba(126,184,212,0.14)',
              border: '1px solid rgba(126,184,212,0.28)',
              borderRadius: '8px',
              color: '#A8C8E8',
              fontFamily: 'var(--font-ui)',
              fontSize: '15px',
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
            Start analyzing — it&apos;s free
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </Link>
      </motion.div>
    </section>
  )
}
