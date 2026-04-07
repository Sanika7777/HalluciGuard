'use client'

import { useState, useCallback } from 'react'

export type LlmTarget = 'gpt4' | 'gpt35' | 'claude' | 'gemini'
export type Mode = 'analyze' | 'engineer'

export interface Highlight {
  word: string
  start: number
  end: number
  risk_score: number
  reason: string
  suggestions: string[]
}

export interface ScoreBreakdown {
  ambiguity: number
  specificity: number
  context: number
}

export interface AnalyzeResult {
  label: string
  confidence: number
  risk_percent: number
  score_breakdown: ScoreBreakdown
  highlights: Highlight[]
  abstention_level: string
  abstention_reason: string
  missing_context: string[]
  why_risky: string[]
  what_to_add: string[]
  llm_specific_warning: string
  llm_target: string
}

export interface EngineerResult {
  original_prompt: string
  engineered_prompt: string
  improvements: string[]
  estimated_risk_reduction: string
}

export function useAnalyze() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analyzeResult, setAnalyzeResult] = useState<AnalyzeResult | null>(null)
  const [engineerResult, setEngineerResult] = useState<EngineerResult | null>(null)
  const [submittedPrompt, setSubmittedPrompt] = useState<string | null>(null)

  const analyze = useCallback(async (prompt: string, llmTarget: LlmTarget) => {
    setLoading(true)
    setError(null)
    setAnalyzeResult(null)
    setEngineerResult(null)
    setSubmittedPrompt(prompt)

    try {
      const res = await fetch('/api/predict-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, llm_target: llmTarget }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Analysis failed')
        return
      }
      setAnalyzeResult(data)
    } catch {
      setError('Failed to connect to the analysis service')
    } finally {
      setLoading(false)
    }
  }, [])

  const engineer = useCallback(async (prompt: string, llmTarget: LlmTarget, riskContext: Partial<AnalyzeResult>) => {
    setLoading(true)
    setError(null)
    setEngineerResult(null)

    try {
      const res = await fetch('/api/engineer-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, llm_target: llmTarget, risk_context: riskContext }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Engineering failed')
        return
      }
      setEngineerResult(data)
    } catch {
      setError('Failed to connect to the engineering service')
    } finally {
      setLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setAnalyzeResult(null)
    setEngineerResult(null)
    setError(null)
    setSubmittedPrompt(null)
  }, [])

  return { loading, error, analyzeResult, engineerResult, submittedPrompt, analyze, engineer, reset }
}
