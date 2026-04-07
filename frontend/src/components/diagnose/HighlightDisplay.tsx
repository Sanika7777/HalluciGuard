'use client'

import { useState } from 'react'
import type { Highlight } from '@/hooks/useAnalyze'

interface Props {
  prompt: string
  highlights: Highlight[]
}

function riskClass(score: number): string {
  if (score >= 0.66) return 'hl-high'
  if (score >= 0.33) return 'hl-med'
  return 'hl-low'
}

function riskColor(score: number): string {
  if (score >= 0.66) return '#E07070'
  if (score >= 0.33) return '#C4A45A'
  return '#6BB8A0'
}

interface TooltipState {
  highlight: Highlight
  x: number
  y: number
}

export default function HighlightDisplay({ prompt, highlights }: Props) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  // Build segments: interleave plain text and highlighted words
  const segments: Array<{ text: string; highlight?: Highlight }> = []
  let cursor = 0
  const sorted = [...highlights].sort((a, b) => a.start - b.start)

  for (const h of sorted) {
    if (h.start > cursor) {
      segments.push({ text: prompt.slice(cursor, h.start) })
    }
    segments.push({ text: prompt.slice(h.start, h.end), highlight: h })
    cursor = h.end
  }
  if (cursor < prompt.length) {
    segments.push({ text: prompt.slice(cursor) })
  }

  return (
    <div>
      <div className="label" style={{ marginBottom: '14px' }}>Risk Highlights</div>

      {/* Highlighted text */}
      <p
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '15px',
          lineHeight: 1.75,
          color: 'var(--text-1)',
          position: 'relative',
        }}
      >
        {segments.map((seg, i) =>
          seg.highlight ? (
            <span
              key={i}
              className={riskClass(seg.highlight.risk_score)}
              style={{ position: 'relative', cursor: 'help' }}
              onMouseEnter={e => {
                const rect = e.currentTarget.getBoundingClientRect()
                setTooltip({
                  highlight: seg.highlight!,
                  x: rect.left + rect.width / 2,
                  y: rect.bottom + 8,
                })
              }}
              onMouseLeave={() => setTooltip(null)}
            >
              {seg.text}
            </span>
          ) : (
            <span key={i}>{seg.text}</span>
          )
        )}
      </p>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '20px', marginTop: '16px' }}>
        {[
          { color: '#E07070', label: 'High risk' },
          { color: '#C4A45A', label: 'Medium risk' },
          { color: '#6BB8A0', label: 'Low risk' },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, display: 'block', flexShrink: 0 }} />
            <span className="mono-sm">{label}</span>
          </div>
        ))}
      </div>

      {/* Tooltip — fixed position */}
      {tooltip && (
        <div
          style={{
            position: 'fixed',
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translateX(-50%)',
            zIndex: 100,
            maxWidth: '280px',
            background: 'rgba(34,31,28,0.97)',
            border: '1px solid rgba(255,255,255,0.11)',
            borderRadius: '10px',
            padding: '14px',
            pointerEvents: 'none',
            animation: 'tooltipIn 0.15s ease',
          }}
        >
          <style>{`
            @keyframes tooltipIn {
              from { opacity: 0; transform: translateX(-50%) scale(0.96); }
              to   { opacity: 1; transform: translateX(-50%) scale(1); }
            }
          `}</style>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--text-1)',
              }}
            >
              &quot;{tooltip.highlight.word}&quot;
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                padding: '2px 7px',
                borderRadius: '4px',
                background: `${riskColor(tooltip.highlight.risk_score)}20`,
                border: `1px solid ${riskColor(tooltip.highlight.risk_score)}44`,
                color: riskColor(tooltip.highlight.risk_score),
              }}
            >
              {Math.round(tooltip.highlight.risk_score * 100)}%
            </span>
          </div>

          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '12px',
              lineHeight: 1.6,
              color: 'var(--text-2)',
              marginBottom: '10px',
            }}
          >
            {tooltip.highlight.reason}
          </p>

          {tooltip.highlight.suggestions.length > 0 && (
            <div>
              <div className="label" style={{ marginBottom: '6px' }}>Suggestions</div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {tooltip.highlight.suggestions.map((s, i) => (
                  <li
                    key={i}
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '12px',
                      color: 'var(--accent-light)',
                      paddingLeft: '12px',
                      position: 'relative',
                    }}
                  >
                    <span style={{ position: 'absolute', left: 0, color: 'var(--accent)' }}>›</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
