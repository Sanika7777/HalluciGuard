'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAnalyze } from '@/hooks/useAnalyze'
import type { LlmTarget, Mode } from '@/hooks/useAnalyze'
import PromptInput from '@/components/diagnose/PromptInput'
import RiskGauge from '@/components/diagnose/RiskGauge'
import ScoreDonut from '@/components/diagnose/ScoreDonut'
import HighlightDisplay from '@/components/diagnose/HighlightDisplay'
import EngineerPanel from '@/components/diagnose/EngineerPanel'

const ease = [0.4, 0, 0.2, 1] as const

function ResultCard({
  children,
  delay = 0,
  style,
}: {
  children: React.ReactNode
  delay?: number
  style?: React.CSSProperties
}) {
  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease }}
      style={style}
    >
      {children}
    </motion.div>
  )
}

// Skeleton cards
function SkeletonGrid() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '10px' }} className="bento-row-1">
        <div className="card" style={{ height: '200px' }}>
          <div className="skeleton" style={{ height: '16px', width: '80px', marginBottom: '20px' }} />
          <div className="skeleton" style={{ width: '140px', height: '140px', borderRadius: '50%', margin: '0 auto' }} />
        </div>
        <div className="card">
          <div className="skeleton" style={{ height: '12px', width: '100px', marginBottom: '20px' }} />
          {[90, 75, 85, 70].map((w, i) => (
            <div key={i} className="skeleton" style={{ height: '14px', width: `${w}%`, marginBottom: '12px' }} />
          ))}
        </div>
      </div>
      <div className="card" style={{ height: '100px' }}>
        <div className="skeleton" style={{ height: '12px', width: '120px', marginBottom: '16px' }} />
        <div className="skeleton" style={{ height: '20px', width: '100%' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }} className="bento-row-3">
        {[0, 1, 2].map(i => (
          <div key={i} className="card" style={{ height: '140px' }}>
            <div className="skeleton" style={{ height: '12px', width: '80px', marginBottom: '20px' }} />
            <div className="skeleton" style={{ height: '80px', borderRadius: '8px' }} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function DiagnosePage() {
  const { loading, error, analyzeResult, engineerResult, submittedPrompt, analyze, engineer, reset } = useAnalyze()
  const [showEngineer, setShowEngineer] = useState(false)
  const [lastTarget, setLastTarget] = useState<LlmTarget>('gpt4')

  const handleSubmit = (prompt: string, target: LlmTarget, mode: Mode) => {
    setLastTarget(target)
    setShowEngineer(false)
    if (mode === 'engineer' && analyzeResult) {
      engineer(prompt, target, analyzeResult)
    } else {
      analyze(prompt, target)
    }
  }

  const handleEngineerClick = () => {
    if (!analyzeResult || !submittedPrompt) return
    setShowEngineer(true)
    engineer(submittedPrompt, lastTarget, analyzeResult)
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '100px 24px 80px',
        maxWidth: '960px',
        margin: '0 auto',
      }}
    >
      {/* Heading — exits when prompt submitted */}
      <AnimatePresence>
        {!submittedPrompt && (
          <motion.h1
            className="title-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            transition={{ duration: 0.4, ease }}
            style={{ marginBottom: '32px' }}
          >
            What are we working with today?
          </motion.h1>
        )}
      </AnimatePresence>

      {/* Submitted prompt pill */}
      <AnimatePresence>
        {submittedPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '20px',
              padding: '10px 16px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '10px',
              maxWidth: '780px',
            }}
          >
            <span className="label" style={{ flexShrink: 0 }}>Prompt</span>
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '13px',
                color: 'var(--text-2)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1,
              }}
            >
              {submittedPrompt}
            </span>
            <button
              onClick={reset}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--text-3)',
                background: 'none',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '5px',
                padding: '3px 10px',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={e => ((e.currentTarget).style.color = 'var(--text-2)')}
              onMouseLeave={e => ((e.currentTarget).style.color = 'var(--text-3)')}
            >
              New
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <PromptInput onSubmit={handleSubmit} loading={loading} />

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            marginTop: '16px',
            padding: '12px 16px',
            background: 'rgba(224,112,112,0.08)',
            border: '1px solid rgba(224,112,112,0.2)',
            borderRadius: '8px',
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            color: '#E07070',
            maxWidth: '780px',
          }}
        >
          {error}
        </motion.div>
      )}

      {/* Skeleton while loading */}
      {loading && !analyzeResult && (
        <div style={{ marginTop: '24px' }}>
          <SkeletonGrid />
        </div>
      )}

      {/* Results grid */}
      {analyzeResult && (
        <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>

          {/* Row 1: Risk Gauge + Why Risky */}
          <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '10px' }} className="bento-row-1">
            <ResultCard delay={0}>
              <RiskGauge
                riskPercent={analyzeResult.risk_percent}
                confidence={analyzeResult.confidence}
                label={analyzeResult.label}
              />
            </ResultCard>

            <ResultCard delay={0.06}>
              <div className="label" style={{ marginBottom: '14px' }}>Why It&apos;s Risky</div>
              {analyzeResult.why_risky.length > 0 ? (
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {analyzeResult.why_risky.map((item, i) => (
                    <li
                      key={i}
                      style={{
                        display: 'flex',
                        gap: '10px',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '13px',
                        lineHeight: 1.6,
                        color: 'var(--text-2)',
                      }}
                    >
                      <span style={{ color: 'var(--risk-high)', flexShrink: 0 }}>—</span>
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--text-3)' }}>
                  No specific risks identified.
                </p>
              )}

              {analyzeResult.llm_specific_warning && (
                <div
                  style={{
                    marginTop: '16px',
                    padding: '10px 14px',
                    background: 'rgba(196,164,90,0.08)',
                    border: '1px solid rgba(196,164,90,0.2)',
                    borderRadius: '8px',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '12px',
                    color: '#C4A45A',
                    lineHeight: 1.6,
                  }}
                >
                  <span className="label" style={{ color: '#C4A45A', marginRight: '6px' }}>
                    {analyzeResult.llm_target.toUpperCase()}
                  </span>
                  {analyzeResult.llm_specific_warning}
                </div>
              )}
            </ResultCard>
          </div>

          {/* Row 2: Highlights */}
          <ResultCard delay={0.12}>
            <HighlightDisplay
              prompt={submittedPrompt!}
              highlights={analyzeResult.highlights}
            />
          </ResultCard>

          {/* Row 3: Score donuts + Missing Context + What to Add */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }} className="bento-row-3">
            <ResultCard delay={0.18}>
              <div className="label" style={{ marginBottom: '16px' }}>Score Breakdown</div>
              <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                <ScoreDonut value={analyzeResult.score_breakdown.ambiguity} label="Ambiguity" color="#E07070" />
                <ScoreDonut value={analyzeResult.score_breakdown.specificity} label="Specificity" color="#C4A45A" />
                <ScoreDonut value={analyzeResult.score_breakdown.context} label="Context" color="#7EB8D4" />
              </div>
            </ResultCard>

            <ResultCard delay={0.22}>
              <div className="label" style={{ marginBottom: '14px' }}>Missing Context</div>
              {analyzeResult.missing_context.length > 0 ? (
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '7px' }}>
                  {analyzeResult.missing_context.map((item, i) => (
                    <li
                      key={i}
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: '13px',
                        lineHeight: 1.55,
                        color: 'var(--text-2)',
                        paddingLeft: '12px',
                        position: 'relative',
                      }}
                    >
                      <span style={{ position: 'absolute', left: 0, color: 'var(--text-3)' }}>›</span>
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--text-3)' }}>
                  No missing context detected.
                </p>
              )}
            </ResultCard>

            <ResultCard delay={0.26}>
              <div className="label" style={{ marginBottom: '14px' }}>What to Add</div>
              {analyzeResult.what_to_add.length > 0 ? (
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '7px' }}>
                  {analyzeResult.what_to_add.map((item, i) => (
                    <li
                      key={i}
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: '13px',
                        lineHeight: 1.55,
                        color: 'var(--text-2)',
                        paddingLeft: '12px',
                        position: 'relative',
                      }}
                    >
                      <span style={{ position: 'absolute', left: 0, color: 'var(--accent)' }}>+</span>
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--text-3)' }}>
                  Prompt looks complete.
                </p>
              )}
            </ResultCard>
          </div>

          {/* Row 4: Abstention + LLM Warning */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px' }} className="bento-row-4">
            <ResultCard delay={0.3}>
              <div className="label" style={{ marginBottom: '14px' }}>Abstention Level</div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '22px',
                  fontWeight: 400,
                  color: 'var(--text-1)',
                  letterSpacing: '-0.01em',
                  textTransform: 'capitalize',
                  marginBottom: '8px',
                }}
              >
                {analyzeResult.abstention_level.replace(/_/g, ' ')}
              </div>
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '12px',
                  lineHeight: 1.6,
                  color: 'var(--text-2)',
                }}
              >
                {analyzeResult.abstention_reason}
              </p>
            </ResultCard>

            <ResultCard delay={0.34}>
              <div className="label" style={{ marginBottom: '14px' }}>
                LLM Warning — {analyzeResult.llm_target.toUpperCase()}
              </div>
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '13px',
                  lineHeight: 1.7,
                  color: 'var(--text-2)',
                }}
              >
                {analyzeResult.llm_specific_warning || 'No specific warnings for this LLM target.'}
              </p>
            </ResultCard>
          </div>

          {/* Engineer button */}
          <ResultCard delay={0.38} style={{ textAlign: 'center', padding: '20px' }}>
            <button
              onClick={handleEngineerClick}
              disabled={loading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 28px',
                background: 'rgba(126,184,212,0.14)',
                border: '1px solid rgba(126,184,212,0.28)',
                borderRadius: '8px',
                color: '#A8C8E8',
                fontFamily: 'var(--font-ui)',
                fontSize: '14px',
                fontWeight: 500,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
                transition: 'all 0.15s ease',
                letterSpacing: '0.01em',
              }}
              onMouseEnter={e => {
                if (loading) return
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
              Engineer This Prompt
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </ResultCard>
        </div>
      )}

      {/* Engineer panel */}
      <AnimatePresence>
        {engineerResult && showEngineer && (
          <EngineerPanel result={engineerResult} onClose={() => setShowEngineer(false)} />
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 640px) {
          .bento-row-1 { grid-template-columns: 1fr !important; }
          .bento-row-3 { grid-template-columns: 1fr !important; }
          .bento-row-4 { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
