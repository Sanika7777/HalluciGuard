'use client'

import { motion } from 'framer-motion'

const FEATURES = [
  {
    num: '001',
    title: 'Word-level risk analysis',
    desc: 'Every token in your prompt is scored for hallucination risk — ambiguity, missing context, and specificity gaps.',
  },
  {
    num: '002',
    title: 'Abstention prediction',
    desc: 'Knows when a model will refuse, hedge, or fabricate. Surfaces the exact reason before you send.',
  },
  {
    num: '003',
    title: 'Model-specific warnings',
    desc: 'Different LLMs hallucinate differently. Get warnings tuned to GPT-4, Claude, Gemini, and more.',
  },
  {
    num: '004',
    title: 'Prompt engineering',
    desc: 'One click rewrites your prompt using Claude — with a side-by-side diff and estimated risk reduction.',
  },
]

const STATS = [
  { value: '96%', label: 'Detection accuracy' },
  { value: '<30ms', label: 'Analysis time' },
  { value: '4', label: 'LLM targets' },
  { value: '∞', label: 'Prompts analyzed' },
]

const ease = [0.4, 0, 0.2, 1] as const

export default function Features() {
  return (
    <section
      id="features"
      style={{
        padding: '120px 24px',
        maxWidth: '1200px',
        margin: '0 auto',
      }}
    >
      {/* Heading */}
      <motion.h2
        className="title-lg"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease }}
        viewport={{ once: true, margin: '-80px' }}
        style={{ marginBottom: '64px', maxWidth: '480px' }}
      >
        Everything you need to trust your LLM output.
      </motion.h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '48px',
          alignItems: 'start',
        }}
        className="features-grid"
      >
        {/* Left: dark visual panel */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease }}
          viewport={{ once: true, margin: '-80px' }}
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '20px',
            padding: '48px 40px',
          }}
        >
          <div className="label" style={{ marginBottom: '40px' }}>By the numbers</div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '40px',
            }}
          >
            {STATS.map(({ value, label }) => (
              <div key={label}>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(32px, 4vw, 48px)',
                    fontWeight: 400,
                    color: 'var(--accent-light)',
                    lineHeight: 1,
                    marginBottom: '8px',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {value}
                </div>
                <div className="mono-sm">{label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right: numbered feature list */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {FEATURES.map(({ num, title, desc }, i) => (
            <motion.div
              key={num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.08, ease }}
              viewport={{ once: true, margin: '-60px' }}
              style={{
                borderTop: '1px solid rgba(255,255,255,0.07)',
                padding: '28px 0',
              }}
            >
              <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                <span
                  className="label"
                  style={{ color: 'var(--accent)', marginTop: '2px', flexShrink: 0 }}
                >
                  {num}
                </span>
                <div>
                  <div
                    className="ui-md"
                    style={{ marginBottom: '8px' }}
                  >
                    {title}
                  </div>
                  <p
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '14px',
                      lineHeight: 1.65,
                      color: 'var(--text-2)',
                    }}
                  >
                    {desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }} />
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .features-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}
