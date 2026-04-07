'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

const ease = [0.4, 0, 0.2, 1] as const

export default function LoginPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    // UI-only — no backend auth yet
    setTimeout(() => setLoading(false), 1200)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '11px 14px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: '8px',
    color: 'var(--text-1)',
    fontFamily: 'var(--font-sans)',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.15s ease',
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '100px 24px 60px',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
        style={{
          width: '100%',
          maxWidth: '400px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: '20px',
          padding: '40px 36px',
        }}
      >
        {/* Heading */}
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '32px',
            fontWeight: 400,
            letterSpacing: '-0.02em',
            color: 'var(--text-1)',
            marginBottom: '6px',
          }}
        >
          {mode === 'signin' ? 'Welcome back.' : 'Create account.'}
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            color: 'var(--text-2)',
            marginBottom: '32px',
          }}
        >
          {mode === 'signin'
            ? 'Sign in to continue analyzing prompts.'
            : 'Start detecting hallucination risk today.'}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label
              className="label"
              style={{ display: 'block', marginBottom: '7px' }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={inputStyle}
              onFocus={e => (e.currentTarget.style.borderColor = 'rgba(126,184,212,0.35)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)')}
            />
          </div>

          <div>
            <label
              className="label"
              style={{ display: 'block', marginBottom: '7px' }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={inputStyle}
              onFocus={e => (e.currentTarget.style.borderColor = 'rgba(126,184,212,0.35)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)')}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '8px',
              padding: '12px',
              background: loading ? 'rgba(126,184,212,0.08)' : 'rgba(126,184,212,0.14)',
              border: '1px solid rgba(126,184,212,0.28)',
              borderRadius: '8px',
              color: loading ? 'var(--text-3)' : '#A8C8E8',
              fontFamily: 'var(--font-ui)',
              fontSize: '14px',
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
            onMouseEnter={e => {
              if (loading) return
              const el = e.currentTarget
              el.style.background = 'rgba(126,184,212,0.22)'
              el.style.borderColor = 'rgba(126,184,212,0.45)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget
              el.style.background = loading ? 'rgba(126,184,212,0.08)' : 'rgba(126,184,212,0.14)'
              el.style.borderColor = 'rgba(126,184,212,0.28)'
            }}
          >
            {loading ? (
              <>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
                  <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="20" strokeDashoffset="5" />
                </svg>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                Signing {mode === 'signin' ? 'in' : 'up'}...
              </>
            ) : (
              mode === 'signin' ? 'Sign in' : 'Create account'
            )}
          </button>
        </form>

        {/* Toggle */}
        <p
          style={{
            marginTop: '24px',
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            color: 'var(--text-3)',
            textAlign: 'center',
          }}
        >
          {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent-light)',
              fontFamily: 'var(--font-sans)',
              fontSize: '13px',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </p>

        <div
          style={{
            marginTop: '24px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            paddingTop: '20px',
            textAlign: 'center',
          }}
        >
          <Link
            href="/"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '12px',
              color: 'var(--text-3)',
              textDecoration: 'none',
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={e => ((e.target as HTMLElement).style.color = 'var(--text-2)')}
            onMouseLeave={e => ((e.target as HTMLElement).style.color = 'var(--text-3)')}
          >
            Back to home
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
