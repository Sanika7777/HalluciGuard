# HalluciGuard Frontend Skill

## Stack
React 19 + Vite 8, Tailwind v3, anime.js v4, framer-motion, Three.js

## Design Principles
- **Quality over speed** — never ship slop
- **Dark theme only** — Apple graphite `#1C1C1E` background
- **Premium feel** — frosted glass cards, lime accent, smooth animations
- **No hardcoded overrides** — respect component styles

## Key Patterns

### Frosted Glass Card
```jsx
function Card({ children, padding = '28px', delay = 0 }) {
  const ref = useRef(null)
  const onMouseMove = useCallback(e => {
    const rect = ref.current.getBoundingClientRect()
    ref.current.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`)
    ref.current.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`)
  }, [])
  return (
    <motion.div ref={ref} onMouseMove={onMouseMove} className="card"
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4,0,0.2,1], delay }}
      style={{ padding }}>
      {children}
    </motion.div>
  )
}
```

### anime.js v4 (NOT v3)
```js
import { animate, createTimeline, stagger } from 'animejs'

// Animate object properties
const obj = { val: 0 }
animate(obj, {
  val: 100,
  duration: 1500,
  easing: 'easeOutExpo',
  onUpdate: () => { ref.current.textContent = Math.round(obj.val) }
})

// Stagger list items
animate(listRef.current.querySelectorAll('.item'), {
  opacity: [0, 1], translateX: [-16, 0],
  duration: 400, delay: stagger(70), easing: 'easeOutCubic'
})
```

### SVG Arc Path Helper
```js
const R = 78, CX = 100, CY = 105
const startAngle = -210, sweepAngle = 240
const toRad = d => (d * Math.PI) / 180

const arcPath = pct => {
  const angle = startAngle + sweepAngle * Math.min(pct, 0.9999)
  const sx = CX + R * Math.cos(toRad(startAngle))
  const sy = CY + R * Math.sin(toRad(startAngle))
  const ex = CX + R * Math.cos(toRad(angle))
  const ey = CY + R * Math.sin(toRad(angle))
  const large = sweepAngle * pct > 180 ? 1 : 0
  return `M ${sx} ${sy} A ${R} ${R} 0 ${large} 1 ${ex} ${ey}`
}
```

### VS Code Wavy Underline Highlights
```jsx
// In CSS:
.hl-high   { text-decoration: underline wavy #F44747; text-underline-offset: 4px; }
.hl-medium { text-decoration: underline wavy #CCA700; text-underline-offset: 4px; }
.hl-low    { text-decoration: underline wavy #4EC9B0; text-underline-offset: 4px; }

// In JSX — NO background rectangles:
<span className="hl-high">{word}</span>
```

### DottedSurface Setup
```jsx
// App.jsx — must have ThemeProvider, NO StrictMode
import { ThemeProvider } from 'next-themes'
import { DottedSurface } from '@/components/ui/dotted-surface'

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} forcedTheme="dark">
      <DottedSurface />   {/* Only ONE instance */}
      <div aria-hidden style={{ position:'fixed', inset:0, zIndex:-1, pointerEvents:'none',
        background:'radial-gradient(ellipse at 50% 40%, rgba(163,230,53,0.04) 0%, transparent 60%)',
        filter:'blur(40px)' }} />
      ...
    </ThemeProvider>
  )
}

// main.jsx — NO StrictMode
createRoot(document.getElementById('root')).render(<App />)
```

### useApi Hook Pattern
```js
// Calls go to Vite proxy → FastAPI
// VITE_API_URL=http://localhost:8000
// VITE_API_KEY=dev-hallucination-key-2026
export function useAnalyzePrompt() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const analyze = useCallback(async (prompt, llmTarget = 'gpt4') => {
    setLoading(true); setData(null); setError(null)
    try {
      const res = await fetch(`${API_BASE}/predict-prompt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY },
        body: JSON.stringify({ prompt, llm_target: llmTarget })
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error)
      setData(result); return result
    } catch (e) { setError(e.message); return null }
    finally { setLoading(false) }
  }, [])
  return { data, loading, error, analyze }
}
```

## Component Colors
| Purpose | Color |
|---------|-------|
| High risk | `#F44747` |
| Medium risk | `#CCA700` |
| Low risk / accent | `#A3E635` |
| Info / teal | `#4EC9B0` |
| Text primary | `#FFFFFF` |
| Text secondary | `#AEAEB2` |
| Text muted | `#636366` |
| Card border | `rgba(255,255,255,0.10)` |

## Common Mistakes to Avoid
- Never use `anime({ targets })` — that's v3. Use `animate(element, {})`
- Never add `<StrictMode>` — breaks DottedSurface (double canvas)
- Never add `<DottedSurface />` twice in App.jsx
- Never hardcode `border-radius` on shadcn components — use their Tailwind classes
- Never use `recharts` — use anime.js SVG for all charts
- Never use `background: white` in dark mode — use `rgba(255,255,255,0.05)` max
- Never add `@import "shadcn/tailwind.css"` to globals — causes var override conflicts
- Always wrap `:root` variables in `@layer base { }` in Tailwind v3

## Bento Grid CSS
```css
.bento-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
```
Use inline `style={{ display:'grid', gridTemplateColumns:'...', gap:'10px' }}` for custom layouts.

## shadcn Installation
Always run from inside `frontend/`:
```bash
cd ~/LLM-dv-project/frontend
npx shadcn@latest add https://21st.dev/r/component-url
```
After install — check if component uses `document.createElement` at module level.
If yes — wrap in `useEffect(() => { ... }, [])`.

## Framer Motion Page Transitions
```jsx
<AnimatePresence>
  {show && (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4, ease: [0.4,0,0.2,1] }}
    >
      {children}
    </motion.div>
  )}
</AnimatePresence>
```
