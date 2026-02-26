// app/api/ai-ranking/gemini/route.ts
import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// ===== SIMPLE CACHE =====
const cache = new Map<string, { data: any, timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000

// ===== RATE LIMIT =====
const rateLimit = new Map<string, number[]>()
const RATE_LIMIT_WINDOW = 60 * 1000
const RATE_LIMIT_MAX = 10

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const windowStart = now - RATE_LIMIT_WINDOW

  const requests = rateLimit.get(ip) || []
  const recentRequests = requests.filter(t => t > windowStart)

  if (recentRequests.length >= RATE_LIMIT_MAX) return false

  recentRequests.push(now)
  rateLimit.set(ip, recentRequests)
  return true
}

function getIndonesianSeason(): string {
  const month = new Date().getMonth()
  if (month >= 10 || month <= 2) return 'rainy'
  if (month >= 3 && month <= 5) return 'transition'
  return 'dry'
}

export async function POST(req: Request) {
  try {
    // ✅ ENV CHECK DIPINDAH KE SINI (AMAN BUILD)
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'GEMINI_API_KEY not configured', fallback: true },
        { status: 500 }
      )
    }

    const genAI = new GoogleGenerativeAI(apiKey)

    const ip = req.headers.get('x-forwarded-for') || 'anonymous'
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { success: false, error: 'Too many requests', fallback: true },
        { status: 429 }
      )
    }

    const { products, userData, limit = 3 } = await req.json()

    if (!products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Products array required' },
        { status: 400 }
      )
    }

    const cacheKey = JSON.stringify({
      ids: products.map((p: any) => p.id).sort(),
      goal: userData?.goal,
      limit
    })

    const cached = cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json({ ...cached.data, cached: true })
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 500
      }
    })

    const prompt = `
Return ONLY valid JSON.
Scores 1-10.
Pick top ${limit}.

Products:
${JSON.stringify(products.map((p: any) => ({
  id: p.id,
  name: p.name,
  desc: p.desc || p.slogan || ''
})))}

Context:
${JSON.stringify({
  goal: userData?.goal || 'general health',
  hour: new Date().getHours(),
  season: getIndonesianSeason()
})}

Format:
{
  "scores": { "id": 9 },
  "top_picks": ["id"],
  "reason": "short reason"
}
`

    const result = await model.generateContent(prompt)
    const text = result.response.text()

    const clean = text.replace(/```json|```/g, '').trim()
    const match = clean.match(/\{[\s\S]*\}/)

    if (!match) throw new Error('Invalid AI JSON')

    const ranking = JSON.parse(match[0])

    const response = {
      success: true,
      scores: ranking.scores || {},
      topProductIds: (ranking.top_picks || []).slice(0, limit),
      summary: ranking.reason || '',
      timestamp: new Date().toISOString(),
      cached: false
    }

    cache.set(cacheKey, {
      data: response,
      timestamp: Date.now()
    })

    return NextResponse.json(response)

  } catch (err: any) {
    console.error('Gemini error:', err)

    return NextResponse.json(
      {
        success: false,
        error: err.message || 'AI failed',
        fallback: true
      },
      { status: 500 }
    )
  }
}