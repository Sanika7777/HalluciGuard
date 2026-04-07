'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid rgba(255,255,255,0.07)',
        padding: '24px',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', gap: '24px' }}>
          {[
            { label: 'Privacy', href: '#' },
            { label: 'Terms', href: '#' },
            { label: 'Docs', href: '#' },
          ].map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '13px',
                color: 'var(--text-3)',
                textDecoration: 'none',
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={e => ((e.target as HTMLElement).style.color = 'var(--text-2)')}
              onMouseLeave={e => ((e.target as HTMLElement).style.color = 'var(--text-3)')}
            >
              {label}
            </Link>
          ))}
        </div>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: 'var(--text-3)',
          }}
        >
          2026 HalluciGuard
        </span>
      </div>
    </footer>
  )
}
