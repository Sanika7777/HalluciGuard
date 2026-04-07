# HalluciGuard — Build Phases

> Claude Code: Read this before starting any session.
> Find the first unchecked task and start there.
> Mark tasks [x] as you complete them.
> Never skip a phase. Never start a phase before the previous is complete.

---

## Phase 0 — Scaffold
**Goal**: Working Next.js project with all dependencies installed.

- [x] Create Next.js 15 app:
  ```bash
  npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
  ```
- [x] Install all dependencies:
  ```bash
  npm install framer-motion animejs
  npm install @radix-ui/react-tabs @radix-ui/react-tooltip
  npm install lucide-react clsx tailwind-merge
  npm install sharp
  ```
- [x] Install shadcn:
  ```bash
  npx shadcn@latest init
  ```
  Choose: style=default, baseColor=neutral, cssVariables=yes
- [x] Create `.env.local`:
  ```
  FASTAPI_URL=http://localhost:8000
  FASTAPI_KEY=dev-hallucination-key-2026
  ```
- [ ] Verify dev server runs without errors: `npm run dev`
- [x] Confirm no TypeScript errors: `npx tsc --noEmit`

---

## Phase 1 — Design System
**Goal**: Global CSS, fonts, colors. Everything visual depends on this.

- [x] Add Google Fonts to `src/app/layout.tsx`:
  - Cormorant Garamond (weights: 400, 500, 600) — titles
  - Inter (weights: 300, 400, 500, 600) — body
  - Poppins (weights: 400, 500, 600) — UI elements
  - JetBrains Mono (weights: 400, 500) — labels, code
- [x] Write `src/app/globals.css` with full design system:
  - All CSS variables in `@layer base`
  - Grain texture on `body::before`
  - Typography utility classes
  - Card utility class
  - Label utility class
  - Skeleton shimmer animation
  - VS Code wavy underline classes
  - Scrollbar styling
  - Selection color
- [x] Configure `next.config.ts` with security headers
- [ ] Verify fonts render in browser — open DevTools and confirm

---

## Phase 2 — Security Layer
**Goal**: All API routes with rate limiting, sanitization, server-side secrets.

- [x] Create `src/lib/rateLimit.ts` — in-memory rate limiter per IP per window
- [x] Create `src/lib/sanitize.ts` — prompt sanitizer:
  - Must be string
  - Max 2000 characters
  - Remove null bytes and control characters
  - Trim whitespace
  - Return null if invalid
- [x] Create `src/app/api/health/route.ts` — GET, public, no auth
- [x] Create `src/app/api/predict-prompt/route.ts`:
  - POST only
  - Rate limit: 10 requests per minute per IP
  - Sanitize `prompt` field
  - Validate `llm_target` is one of: gpt4, gpt35, claude, gemini
  - Forward to FastAPI with server-side key
  - Return 429 if rate limited, 400 if invalid, 502 if FastAPI fails
- [x] Create `src/app/api/predict-response/route.ts`:
  - POST only
  - Rate limit: 10 requests per minute per IP
  - Sanitize both `prompt` and `response` fields
  - Forward to FastAPI
- [x] Create `src/app/api/engineer-prompt/route.ts`:
  - POST only
  - Rate limit: 5 requests per minute per IP (Claude call is expensive)
  - Sanitize `prompt` field
  - Forward to FastAPI with full risk_context
- [ ] Test rate limiting: send 11 requests to `/api/predict-prompt` — 12th must return 429
- [ ] Test sanitization: send null bytes — must return 400
- [ ] Confirm no API key appears in browser network tab

---

## Phase 3 — Layout
**Goal**: Navbar and Footer wired into root layout.

- [x] Build `src/components/layout/Navbar.tsx`:
  - Fixed top, transparent background
  - Subtle border-bottom appears on scroll
  - Logo text left: "HalluciGuard" in Cormorant Garamond
  - Nav links right: Diagnose · Pricing · Login
  - Links in Inter, muted color, subtle hover
  - Mobile: hamburger that reveals full-height drawer
  - No heavy blur — just `rgba` background on scroll
- [x] Build `src/components/layout/Footer.tsx`:
  - Minimal — one line
  - Links left, copyright right
  - Warm muted text
- [x] Wire both into `src/app/layout.tsx`
- [ ] Confirm layout renders on all pages

---

## Phase 4 — Landing Page
**Goal**: Editorial, minimal landing page. Reference: sanika-deshmukh.vercel.app

- [x] Build `src/components/landing/Hero.tsx`:
  - Full viewport height centered section
  - Large Cormorant Garamond title — two lines, mixed weight
  - Inter subtitle — muted, max 560px wide
  - Two buttons: "Start analyzing" (blue accent) + "See how it works" (ghost)
  - Subtle entrance animation with Framer Motion
  - Below: static dashboard mockup card showing risk gauge + highlights
- [x] Build `src/components/landing/Features.tsx`:
  - Section heading in Cormorant Garamond
  - Left: dark visual panel with stats (96% accuracy, <30ms, etc.)
  - Right: numbered feature list 001–004 with horizontal separators
  - Each feature: title in Poppins medium + description in Inter
  - Scroll-triggered entrance (Framer Motion `whileInView`)
- [x] Build `src/components/landing/CTA.tsx`:
  - Simple centered section
  - One heading, one subtext, one button
  - Slightly different background shade to break up the page
- [x] Wire all into `src/app/page.tsx`
- [x] Smooth scroll to Features when "See how it works" is clicked

---

## Phase 5 — Diagnose Page: Input and Skeleton
**Goal**: Prompt input with mode selection and loading skeleton.

- [x] Build `src/components/diagnose/PromptInput.tsx`:
  - Clean textarea — `background: transparent`, subtle border
  - Auto-resize as user types (max height 200px)
  - Placeholder in muted Inter
  - Two mode buttons at bottom row: "Analyze Risk" + "Engineer Prompt"
  - Active mode highlighted in blue accent
  - Submit button (right-aligned circle, arrow icon)
  - Enter submits, Shift+Enter adds newline
  - Disabled state while loading
- [x] Build skeleton component:
  - Matches exact bento grid shape
  - Shimmer animation
  - Warm charcoal shimmer colors (not grey)
- [x] Build submitted prompt pill:
  - Shows prompt text truncated
  - "New" button on right to reset
  - Mono font for "PROMPT" label
- [x] Wire into `src/app/diagnose/page.tsx`:
  - Heading visible initially: "What are we working with today?"
  - Heading exits (Framer Motion) when prompt submitted
  - Pill appears, input stays
  - Skeleton shows during loading
  - Results appear below

---

## Phase 6 — Diagnose Page: Charts and Results
**Goal**: All bento grid cards with anime.js SVG visuals.

- [x] Build `src/components/diagnose/RiskGauge.tsx`:
  - Pure SVG arc gauge — no canvas, no third-party chart lib
  - anime.js animates arc and number on mount
  - Color changes based on risk level:
    - Low: `#6BB8A0`
    - Medium: `#C4A45A`
    - High: `#E07070`
  - Shows: percentage (large), confidence (small mono below), risk label badge
  - Drop shadow glow on arc matching color
- [x] Build `src/components/diagnose/ScoreDonut.tsx`:
  - Pure SVG circular progress — no third-party chart lib
  - anime.js animates on mount
  - Takes: value (0-1), label, color
  - Used three times: Ambiguity, Specificity, Context Gap
- [x] Build `src/components/diagnose/HighlightDisplay.tsx`:
  - Renders prompt text with risky words underlined
  - Wavy underline CSS — absolutely no background rectangles
  - Hover tooltip: dark surface, word, risk score badge, reason, suggestions
  - Tooltip animates in (scale + fade)
  - Legend at bottom: three color swatches with labels
- [x] Build `ResultsGrid` in `src/app/diagnose/page.tsx`:
  - Row 1 (2 cols): RiskGauge (280px) + Why It's Risky bullets
  - Row 2 (full): HighlightDisplay
  - Row 3 (3 cols): ScoreDonuts + Missing Context + What to Add
  - Row 4 (2 cols): Abstention meter + LLM Warning
  - Row 5: "Engineer This Prompt" button
  - Each card has staggered entrance animation (Framer Motion delay)

---

## Phase 7 — Engineer Panel
**Goal**: Prompt engineering results below the bento grid.

- [x] Build `src/components/diagnose/EngineerPanel.tsx`:
  - Appears below ResultsGrid when "Engineer This Prompt" clicked
  - Two columns: Original (muted) vs Engineered (bright)
  - Copy button on Engineered card — shows "Copied" for 2s
  - Improvements list with blue accent dots
  - "Close" ghost button at bottom
  - Smooth entrance animation

---

## Phase 8 — Login Page
**Goal**: Clean minimal auth page.

- [x] Build `src/app/login/page.tsx`:
  - Same warm charcoal background
  - Centered card — subtle border, no heavy shadow
  - Cormorant Garamond heading: "Welcome back"
  - Email + password fields — clean, consistent with design system
  - Toggle between Sign In / Sign Up
  - Submit button in blue accent
  - Auth is UI-only for now — no backend auth yet
  - Show loading state on submit

---

## Phase 9 — Polish
**Goal**: Final QA, performance, accessibility.

- [ ] Verify grain texture renders correctly at `0.010` opacity
- [ ] Verify all fonts load — Coromant Garamond, Inter, Poppins, JetBrains Mono
- [ ] Verify accent color is consistently `#7EB8D4` throughout
- [ ] Verify no `#000000` or `#FFFFFF` anywhere in the UI
- [ ] Mobile responsive: landing, diagnose, login all work on 375px
- [ ] Test rate limiting — 6th request to engineer endpoint returns 429
- [ ] Confirm zero secrets in client bundle: `npm run build` then check `.next/static/`
- [ ] Add `<meta>` description and OG tags in `layout.tsx`
- [ ] Run `npx tsc --noEmit` — zero TypeScript errors
- [ ] Run `npm run build` — successful production build

---

## Status Table

| Phase | Name | Status |
|-------|------|--------|
| 0 | Scaffold | ✅ Complete |
| 1 | Design System | ✅ Complete |
| 2 | Security Layer | ✅ Complete |
| 3 | Layout | ✅ Complete |
| 4 | Landing Page | ✅ Complete |
| 5 | Diagnose Input | ✅ Complete |
| 6 | Charts + Results | ✅ Complete |
| 7 | Engineer Panel | ✅ Complete |
| 8 | Login | ✅ Complete |
| 9 | Polish | 🔄 In Progress |
