import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const res = await fetch(`${process.env.FASTAPI_URL}/health`, {
      signal: AbortSignal.timeout(5_000),
    })
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ status: 'unavailable' }, { status: 503 })
  }
}
