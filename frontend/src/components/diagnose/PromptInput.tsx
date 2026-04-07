'use client'

import { useRef, useEffect, useState } from 'react'
import type { LlmTarget, Mode } from '@/hooks/useAnalyze'

const LLM_TARGETS: { value: LlmTarget; label: string }[] = [
  { value: 'gpt4', label: 'GPT-4' },
  { value: 'gpt35', label: 'GPT-3.5' },
  { value: 'claude', label: 'Claude' },
  { value: 'gemini', label: 'Gemini' },
]

interface Props {
  onSubmit: (prompt: string, target: LlmTarget, mode: Mode) => void
  loading: boolean
}

export default function PromptInput({ onSubmit, loading }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [value, setValue] = useState('')
  const [mode, setMode] = useState<Mode>('analyze')
  const [llmTarget, setLlmTarget] = useState<LlmTarget>('gpt4')

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 200) + 'px'
  }, [value])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleSubmit = () => {
    const trimmed = value.trim()
    if (!trimmed || loading) return
    onSubmit(trimmed, llmTarget, mode)
  }

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.09)',
        borderRadius: '16px',
        padding: '20px 20px 16px',
        maxWidth: '780px',
        width: '100%',
      }}
    >
      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={loading}
        placeholder="Enter a prompt to analyze..."
        rows={3}
        style={{
          width: '100%',
          background: 'transparent',
          border: 'none',
          outline: 'none',
          resize: 'none',
          fontFamily: 'var(--font-sans)',
          fontSize: '15px',
          lineHeight: 1.65,
          color: 'var(--text-1)',
          overflowY: 'hidden',
          maxHeight: '200px',
          opacity: loading ? 0.5 : 1,
        }}
      />

      {/* Bottom row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '12px',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        {/* Mode + target */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {/* Mode toggle */}
          {([['analyze', 'Analyze Risk'], ['engineer', 'Engineer Prompt']] as const).map(([m, label]) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: '1px solid',
                borderColor: mode === m ? 'rgba(126,184,212,0.35)' : 'rgba(255,255,255,0.07)',
                background: mode === m ? 'rgba(126,184,212,0.12)' : 'transparent',
                color: mode === m ? '#A8C8E8' : 'var(--text-2)',
                fontFamily: 'var(--font-ui)',
                fontSize: '13px',
                fontWeight: mode === m ? 500 : 400,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {label}
            </button>
          ))}

          {/* LLM target */}
          <select
            value={llmTarget}
            onChange={e => setLlmTarget(e.target.value as LlmTarget)}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid rgba(255,255,255,0.07)',
              background: 'rgba(255,255,255,0.04)',
              color: 'var(--text-2)',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            {LLM_TARGETS.map(({ value, label }) => (
              <option key={value} value={value} style={{ background: '#2A2724' }}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading || !value.trim()}
          aria-label="Submit"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            border: '1px solid rgba(126,184,212,0.28)',
            background: loading || !value.trim()
              ? 'rgba(255,255,255,0.04)'
              : 'rgba(126,184,212,0.14)',
            color: loading || !value.trim() ? 'var(--text-3)' : '#A8C8E8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: loading || !value.trim() ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s ease',
            flexShrink: 0,
          }}
        >
          {loading ? (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="20" strokeDashoffset="5" />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}
