# HalluciGuard — Claude Code Master Context

## What This Is
HalluciGuard is a full-stack ML web app that detects hallucination risk in LLM prompts and responses.
It analyzes prompts word by word, scores risk, and uses Claude API to engineer better prompts.

## Read These First — Always
Before writing any code, read in this order:
1. `CLAUDE.md` — you are reading this
2. `PHASES.md` — find current phase and task
3. `SKILL.md` — design system, patterns, rules

---

## Tech Stack
- **Frontend**: Next.js 15 App Router, TypeScript, Tailwind v4
- **Animations**: Framer Motion + anime.js v4
- **UI**: shadcn/ui (minimal usage)
- **Backend**: FastAPI (Python) — already built, do not modify

---

## Project Structure
```
frontend/
├── CLAUDE.md
├── PHASES.md
├── SKILL.md
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    ← landing page
│   │   ├── globals.css
│   │   ├── diagnose/
│   │   │   └── page.tsx               ← main tool (analyze + engineer)
│   │   ├── login/
│   │   │   └── page.tsx               ← auth page
│   │   └── api/
│   │       ├── predict-prompt/
│   │       │   └── route.ts
│   │       ├── predict-response/
│   │       │   └── route.ts
│   │       ├── engineer-prompt/
│   │       │   └── route.ts
│   │       └── health/
│   │           └── route.ts
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   └── Footer.tsx
│   │   ├── landing/
│   │   │   ├── Hero.tsx
│   │   │   ├── Features.tsx
│   │   │   └── CTA.tsx
│   │   └── diagnose/
│   │       ├── PromptInput.tsx
│   │       ├── RiskGauge.tsx
│   │       ├── ScoreDonut.tsx
│   │       ├── HighlightDisplay.tsx
│   │       └── EngineerPanel.tsx
│   ├── hooks/
│   │   └── useAnalyze.ts
│   └── lib/
│       ├── rateLimit.ts
│       └── sanitize.ts
├── public/
├── next.config.ts
├── tailwind.config.ts
└── .env.local
```

---

## Backend API — Do Not Modify
**Base URL**: `http://localhost:8000`
**Auth**: `X-API-Key: dev-hallucination-key-2026`

### Endpoints
```
GET  /health
POST /predict-prompt       body: { prompt, llm_target }
POST /predict-response     body: { prompt, response }
POST /engineer-prompt      body: { prompt, llm_target, risk_context }
```

### /predict-prompt response shape
```ts
{
  label: string
  confidence: number
  risk_percent: number
  score_breakdown: { ambiguity: number, specificity: number, context: number }
  highlights: Array<{
    word: string
    start: number
    end: number
    risk_score: number
    reason: string
    suggestions: string[]
  }>
  abstention_level: string
  abstention_reason: string
  missing_context: string[]
  why_risky: string[]
  what_to_add: string[]
  llm_specific_warning: string
  llm_target: string
}
```

### /engineer-prompt response shape
```ts
{
  original_prompt: string
  engineered_prompt: string
  improvements: string[]
  estimated_risk_reduction: string
}
```

### Start backend
```bash
cd ~/LLM-dv-project/backend
export $(grep -v '^#' ../.env | grep -v '^$' | xargs)
python3 main.py
```

---

## Environment Variables
```bash
# .env.local — server only, never expose to client
FASTAPI_URL=http://localhost:8000
FASTAPI_KEY=dev-hallucination-key-2026
```

---

## Security Architecture
```
Browser → Next.js /api/* routes (server) → FastAPI backend
```
- `FASTAPI_KEY` lives only in `.env.local`
- All backend calls happen server-side in route handlers
- Rate limiting at API route level per IP
- All user input sanitized before forwarding
- Security headers configured in `next.config.ts`
- Never use `NEXT_PUBLIC_` prefix for any secret

---

## Absolute Rules — Never Break These
1. Never call FastAPI from the browser — always via `/api/*` Next.js routes
2. Never put any secret in a client component or `NEXT_PUBLIC_` variable
3. Never use recharts — anime.js v4 SVG only for all charts
4. Never use `anime({ targets })` — that is v3, it is broken in v4
5. Never use emojis in the UI
6. Never use pure white `#FFFFFF` or pure black `#000000` for text or backgrounds
7. Never use heavy glassmorphism — subtle `rgba` borders only
8. Always read `SKILL.md` before writing any component
9. Always mark tasks complete in `PHASES.md` after finishing them
10. Quality over speed — never ship something that looks wrong
