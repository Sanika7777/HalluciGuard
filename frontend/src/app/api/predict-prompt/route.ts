import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rateLimit'
import { sanitizePrompt } from '@/lib/sanitize'

const VALID_LLM_TARGETS = new Set(['gpt4', 'gpt35', 'claude', 'gemini'])

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? '127.0.0.1'

  if (!rateLimit(ip, 10, 60_000)) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment.' },
      { status: 429 }
    )
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const prompt = sanitizePrompt((body as Record<string, unknown>).prompt)
  if (!prompt) {
    return NextResponse.json({ error: 'Invalid prompt' }, { status: 400 })
  }

  const llmTarget = (body as Record<string, unknown>).llm_target ?? 'gpt4'
  if (!VALID_LLM_TARGETS.has(String(llmTarget))) {
    return NextResponse.json({ error: 'Invalid llm_target' }, { status: 400 })
  }

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
