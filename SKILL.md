# HalluciGuard — Frontend Skill Reference

> Claude Code: Read this entire file before writing any UI component.
> Follow every pattern exactly. Never improvise the design system.
> Quality is the only metric that matters.

---

## Design Reference
Aesthetic: https://sanika-deshmukh.vercel.app
- Warm dark background with grain
- Editorial typographic moments
- Generous whitespace — everything breathes
- Restrained, purposeful animations
- Clean, minimal, professional — nothing decorative for its own sake

---

## Color Tokens

```css
/* Backgrounds */
--bg:           #1C1A18   /* warm charcoal — primary background */
--bg-2:         #221F1C   /* slightly lighter warm charcoal */
--bg-3:         #2A2724   /* card/surface background */

/* Text */
--text-1:       #F0EDE8   /* warm off-white — primary text */
--text-2:       #8A8580   /* muted warm grey — secondary */
--text-3:       #4E4B48   /* very muted — labels, hints */

/* Borders */
--border:       rgba(255,255,255,0.07)
--border-2:     rgba(255,255,255,0.11)

/* Accent — sierra/pastel blue */
--accent:       #7EB8D4
--accent-light: #A8C8E8
--accent-dim:   rgba(126,184,212,0.12)
--accent-glow:  rgba(126,184,212,0.18)

/* Risk levels — muted, not harsh */
--risk-high:    #E07070
--risk-med:     #C4A45A
--risk-low:     #6BB8A0

/* Wavy underline colors */
--hl-high:      #E07070
--hl-med:       #C4A45A
--hl-low:       #6BB8A0
```

---

## Typography

### Font Stack
| Role | Font | Weights | When to Use |
|------|------|---------|-------------|
| Titles / Display | Coromant Garamond | 400, 500, 600 | Page titles, section headings, hero text |
| Body | Inter | 300, 400, 500, 600 | Paragraphs, descriptions, general UI text |
| UI Elements | Poppins | 400, 500, 600 | Buttons, nav links, feature titles |
| Labels / Code | JetBrains Mono | 400, 500 | Card labels, captions, code, badges |

### Google Fonts import (in layout.tsx)
```tsx
import { Coromant_Garamond, Inter, Poppins, JetBrains_Mono } from 'next/font/google'

const coromant = Coromant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-coromant',
})
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-poppins',
})
const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
})
```

### Type scale (as CSS variables)
```css
--font-display:  var(--font-coromant), Georgia, serif;
--font-sans:     var(--font-inter), -apple-system, sans-serif;
--font-ui:       var(--font-poppins), sans-serif;
--font-mono:     var(--font-mono), 'Courier New', monospace;
```

### Typography classes (define in globals.css)
```css
.title-xl {
  font-family: var(--font-display);
  font-size: clamp(48px, 6vw, 88px);
  font-weight: 500;
  line-height: 1.05;
  letter-spacing: -0.03em;
  color: var(--text-1);
}
.title-lg {
  font-family: var(--font-display);
  font-size: clamp(32px, 4vw, 56px);
  font-weight: 400;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: var(--text-1);
}
.title-md {
  font-family: var(--font-display);
  font-size: clamp(22px, 2.5vw, 36px);
  font-weight: 400;
  line-height: 1.2;
  letter-spacing: -0.015em;
  color: var(--text-1);
}
.body-lg {
  font-family: var(--font-sans);
  font-size: clamp(16px, 1.5vw, 18px);
  font-weight: 400;
  line-height: 1.7;
  color: var(--text-2);
}
.ui-md {
  font-family: var(--font-ui);
  font-size: 15px;
  font-weight: 500;
  color: var(--text-1);
}
.label {
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-3);
}
.mono-sm {
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 400;
  color: var(--text-2);
}
```

---

## Grain Texture
Apply to `body::before` in `globals.css`:
```css
body {
  background-color: var(--bg);
  position: relative;
}

body::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0.010;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 256px 256px;
}

/* All content must be above the grain */
main, header, footer, nav { position: relative; z-index: 1; }
```

---

## Card Pattern
```tsx
// Subtle card — no heavy glassmorphism
<div style={{
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '16px',
  padding: '24px',
}}>
```

Hover state (add via onMouseEnter/Leave or CSS):
```css
.card:hover {
  border-color: rgba(255,255,255,0.11);
  background: rgba(255,255,255,0.06);
  transform: translateY(-2px);
  transition: all 0.2s ease;
}
```

---

## Button Patterns

### Blue accent button (primary action)
```tsx
<button style={{
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 20px',
  background: 'rgba(126,184,212,0.14)',
  border: '1px solid rgba(126,184,212,0.28)',
  borderRadius: '8px',
  color: '#A8C8E8',
  fontFamily: 'var(--font-ui)',
  fontSize: '14px',
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  letterSpacing: '0.01em',
}}>
  Analyze Risk
</button>
```

### Ghost button (secondary action)
```tsx
<button style={{
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 20px',
  background: 'transparent',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '8px',
  color: 'var(--text-2)',
  fontFamily: 'var(--font-ui)',
  fontSize: '14px',
  fontWeight: 400,
  cursor: 'pointer',
  transition: 'all 0.15s ease',
}}>
  See how it works
</button>
```

---

## anime.js v4 — Critical Patterns

### Import — always v4, never v3
```ts
import { animate, stagger } from 'animejs'
// NEVER: import anime from 'animejs'
// NEVER: anime({ targets: ... })
```

### Animated SVG arc (for RiskGauge)
```tsx
useEffect(() => {
  const obj = { pct: 0, num: 0 }
  animate(obj, {
    pct: riskPercent / 100,
    num: riskPercent,
    duration: 1400,
    easing: 'easeOutExpo',
    onUpdate: () => {
      arcRef.current?.setAttribute('d', arcPath(obj.pct))
      if (numRef.current) numRef.current.textContent = Math.round(obj.num) + '%'
      const np = needlePos(obj.pct)
      needleRef.current?.setAttribute('x2', String(np.x))
      needleRef.current?.setAttribute('y2', String(np.y))
    },
  })
}, [riskPercent])
```

### SVG arc path helper
```ts
const R = 78, CX = 100, CY = 105
const startAngle = -210, sweepAngle = 240
const toRad = (d: number) => (d * Math.PI) / 180

const arcPath = (pct: number): string => {
  const angle = startAngle + sweepAngle * Math.min(pct, 0.9999)
  const sx = CX + R * Math.cos(toRad(startAngle))
  const sy = CY + R * Math.sin(toRad(startAngle))
  const ex = CX + R * Math.cos(toRad(angle))
  const ey = CY + R * Math.sin(toRad(angle))
  const large = sweepAngle * pct > 180 ? 1 : 0
  return `M ${sx} ${sy} A ${R} ${R} 0 ${large} 1 ${ex} ${ey}`
}
```

### Animated SVG donut (for ScoreDonut)
```tsx
useEffect(() => {
  const R = 32
  const circ = 2 * Math.PI * R
  const obj = { v: 0 }
  animate(obj, {
    v: value * 100,
    duration: 1400,
    easing: 'easeOutExpo',
    onUpdate: () => {
      const offset = circ * (1 - obj.v / 100)
      circleRef.current?.setAttribute('stroke-dashoffset', String(offset))
      if (numRef.current) numRef.current.textContent = Math.round(obj.v) + '%'
    },
  })
}, [value])
```

### Stagger entrance
```tsx
useEffect(() => {
  if (!listRef.current) return
  animate(listRef.current.querySelectorAll('.item'), {
    opacity: [0, 1],
    translateY: [12, 0],
    duration: 380,
    delay: stagger(55),
    easing: 'easeOutCubic',
  })
}, [data])
```

---

## VS Code Wavy Underlines
```css
/* In globals.css — wavy line only, never background rectangles */
.hl-high {
  text-decoration: underline wavy var(--hl-high);
  text-underline-offset: 4px;
  cursor: default;
}
.hl-med {
  text-decoration: underline wavy var(--hl-med);
  text-underline-offset: 4px;
  cursor: default;
}
.hl-low {
  text-decoration: underline wavy var(--hl-low);
  text-underline-offset: 4px;
  cursor: default;
}
```

---

## Framer Motion Patterns

### Page entrance
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
/>
```

### Scroll reveal (use `once: true` always)
```tsx
<motion.div
  initial={{ opacity: 0, y: 32 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
  viewport={{ once: true, margin: '-80px' }}
/>
```

### Exit animation
```tsx
<AnimatePresence>
  {show && (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12, scale: 0.97 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    />
  )}
</AnimatePresence>
```

---

## Security Patterns

### Rate limiter
```ts
// src/lib/rateLimit.ts
const store = new Map<string, { count: number; resetAt: number }>()

export function rateLimit(
  ip: string,
  limit: number,
  windowMs: number
): boolean {
  const now = Date.now()
  const entry = store.get(ip)
  if (!entry || now > entry.resetAt) {
    store.set(ip, { count: 1, resetAt: now + windowMs })
    return true // allowed
  }
  if (entry.count >= limit) return false // blocked
  entry.count++
  return true // allowed
}
```

### Input sanitizer
```ts
// src/lib/sanitize.ts
export function sanitizePrompt(input: unknown): string | null {
  if (typeof input !== 'string') return null
  const trimmed = input.trim()
  if (trimmed.length === 0 || trimmed.length > 2000) return null
  // Strip null bytes and non-printable control chars
  return trimmed
    .replace(/\x00/g, '')
    .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
}
```

### API route template
```ts
// src/app/api/predict-prompt/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rateLimit'
import { sanitizePrompt } from '@/lib/sanitize'

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? '127.0.0.1'

  if (!rateLimit(ip, 10, 60_000)) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment.' },
      { status: 429 }
    )
  }

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const prompt = sanitizePrompt((body as Record<string, unknown>).prompt)
  if (!prompt) {
    return NextResponse.json({ error: 'Invalid prompt' }, { status: 400 })
  }

  const llmTarget = (body as Record<string, unknown>).llm_target ?? 'gpt4'

  try {
    const res = await fetch(`${process.env.FASTAPI_URL}/predict-prompt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.FASTAPI_KEY!,
      },
      body: JSON.stringify({ prompt, llm_target: llmTarget }),
      signal: AbortSignal.timeout(30_000),
    })
    const data = await res.json()
    if (!res.ok) {
      return NextResponse.json(
        { error: data.detail ?? 'Backend error' },
        { status: 502 }
      )
    }
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
}
```

### Security headers (next.config.ts)
```ts
import type { NextConfig } from 'next'

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control',  value: 'on' },
  { key: 'X-Frame-Options',         value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options',  value: 'nosniff' },
  { key: 'Referrer-Policy',         value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy',      value: 'camera=(), microphone=(), geolocation=()' },
]

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }]
  },
}

export default nextConfig
```

---

## Skeleton Animation
```css
/* In globals.css */
@keyframes shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position:  400px 0; }
}

.skeleton {
  background: linear-gradient(
    90deg,
    rgba(255,255,255,0.04) 25%,
    rgba(255,255,255,0.08) 50%,
    rgba(255,255,255,0.04) 75%
  );
  background-size: 800px 100%;
  animation: shimmer 1.6s infinite linear;
  border-radius: 12px;
}
```

---

## Bento Grid Structure
```
┌─────────────────┬──────────────────────────────┐
│  Risk Gauge     │  Why It's Risky              │
│  280px fixed    │  flex 1                      │
├─────────────────┴──────────────────────────────┤
│  Risk Highlights — full width                  │
├────────────────┬────────────────┬──────────────┤
│  Score Donuts  │ Missing Context│  What to Add │
│  1fr           │ 1fr            │  1fr         │
├────────────────┴──┬─────────────────────────────┤
│  Abstention Level │  LLM Warning               │
│  1fr              │  2fr                       │
└───────────────────┴────────────────────────────┘
           Engineer This Prompt → button
```

Implementation:
```tsx
<div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
  <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '10px' }}>
  <div style={{ /* full width card */ }}>
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px' }}>
</div>
```

---

## Absolute Don'ts
- Never use `recharts` or any charting library — anime.js SVG only
- Never expose secrets via `NEXT_PUBLIC_` prefix
- Never call FastAPI from client code — only from `/api/*` routes
- Never use `anime({ targets })` — v3 syntax, broken in v4
- Never use emojis in the UI
- Never use `#000000` or `#FFFFFF` — use warm charcoal and warm off-white
- Never use heavy blur/glassmorphism — subtle rgba borders only
- Never use background rectangles for text highlights — wavy underlines only
- Never ship without reading PHASES.md first
