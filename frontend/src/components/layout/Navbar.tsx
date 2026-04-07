'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        transition: 'background 0.25s ease, border-color 0.25s ease',
        background: scrolled ? 'rgba(28,26,24,0.88)' : 'transparent',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.07)' : '1px solid transparent',
        backdropFilter: scrolled ? 'blur(8px)' : 'none',
      }}
    >
      <nav
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '22px',
              fontWeight: 500,
              color: 'var(--text-1)',
              letterSpacing: '-0.02em',
            }}
          >
            HalluciGuard
          </span>
        </Link>

        {/* Desktop nav */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '32px',
          }}
          className="nav-desktop"
        >
          {[
            { label: 'Diagnose', href: '/diagnose' },
            { label: 'Pricing', href: '#' },
            { label: 'Login', href: '/login' },
          ].map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '14px',
                fontWeight: 400,
                color: 'var(--text-2)',
                textDecoration: 'none',
                letterSpacing: '0.01em',
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={e => ((e.target as HTMLElement).style.color = 'var(--text-1)')}
              onMouseLeave={e => ((e.target as HTMLElement).style.color = 'var(--text-2)')}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Toggle menu"
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            color: 'var(--text-2)',
          }}
          className="nav-hamburger"
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            {menuOpen ? (
              <>
                <line x1="4" y1="4" x2="18" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="18" y1="4" x2="4" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </>
            ) : (
              <>
                <line x1="3" y1="7" x2="19" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="3" y1="11" x2="19" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="3" y1="15" x2="19" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </>
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <div
          style={{
            position: 'fixed',
            top: '60px',
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(28,26,24,0.97)',
            zIndex: 49,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '40px',
          }}
        >
          {[
            { label: 'Diagnose', href: '/diagnose' },
            { label: 'Pricing', href: '#' },
            { label: 'Login', href: '/login' },
          ].map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              onClick={() => setMenuOpen(false)}
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '32px',
                fontWeight: 400,
                color: 'var(--text-1)',
                textDecoration: 'none',
                letterSpacing: '-0.01em',
              }}
            >
              {label}
            </Link>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .nav-desktop { display: none !important; }
          .nav-hamburger { display: flex !important; }
        }
      `}</style>
    </header>
  )
}
