// app/api/ai-ranking/gemini/route.ts
import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Cache sederhana (dalam production pake Redis)
const cache = new Map<string, { data: any, timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 menit

if (!process.env.GEMINI_API_KEY) {
  throw new Error('Missing GEMINI_API_KEY environment variable')
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// Rate limiting sederhana
const rateLimit = new Map<string, number[]>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 menit
const RATE_LIMIT_MAX = 10 // 10 request per menit

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const windowStart = now - RATE_LIMIT_WINDOW
  
  const requests = rateLimit.get(ip) || []
  const recentRequests = requests.filter(time => time > windowStart)
  
  if (recentRequests.length >= RATE_LIMIT_MAX) {
    return false
  }
  
  recentRequests.push(now)
  rateLimit.set(ip, recentRequests)
  return true
}

// Helper untuk musim Indonesia
function getIndonesianSeason(): string {
  const month = new Date().getMonth()
  if (month >= 10 || month <= 2) return 'rainy' // Nov-Mar
  if (month >= 3 && month <= 5) return 'transition' // Apr-Jun
  return 'dry' // Jul-Oct
}

export async function POST(req: Request) {
  try {
    // Rate limiting
    const ip = req.headers.get('x-forwarded-for') || 'anonymous'
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Too many requests. Please try again later.',
          fallback: true 
        },
        { status: 429 }
      )
    }

    const { products, userData, limit = 3 } = await req.json()

    // Validasi input
    if (!products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Products array is required' },
        { status: 400 }
      )
    }

    // Cek cache
    const cacheKey = JSON.stringify({ 
      productIds: products.map(p => p.id).sort(),
      userGoal: userData?.goal,
      limit 
    })
    
    const cached = cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json({
        ...cached.data,
        cached: true,
        timestamp: new Date().toISOString()
      })
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.2, // Biar lebih konsisten
        maxOutputTokens: 500,
      }
    })

    const prompt = `
You are KOJE24's AI product recommender. You must return ONLY valid JSON.

RULES:
- Scores must be between 1-10 (10 = best match)
- Higher score = better match
- Consider user's goal, time of day, and season
- Be objective and helpful
- Return exactly ${limit} top picks

PRODUCTS:
${JSON.stringify(products.map(p => ({
  id: p.id,
  name: p.name,
  description: p.desc || p.slogan || 'Premium cold-pressed juice',
  category: p.category || 'general'
})), null, 2)}

USER CONTEXT:
${JSON.stringify({
  goal: userData?.goal || 'general health',
  time_of_day: userData?.timeOfDay || new Date().getHours(),
  season: getIndonesianSeason(),
  is_new_user: !userData?.previousPurchases?.length,
  location: userData?.location || 'Indonesia'
}, null, 2)}

RESPONSE FORMAT (STRICT JSON - NO OTHER TEXT):
{
  "scores": {
    "product_id_1": 9,
    "product_id_2": 7,
    "product_id_3": 8
  },
  "top_picks": ["product_id_1", "product_id_3", "product_id_2"],
  "reason": "Brief explanation why these products are recommended"
}

Remember: ONLY return JSON. No markdown. No additional text.
`

    const result = await model.generateContent(prompt)
    const text = result.response.text()

    // Clean response - hapus markdown kalo ada
    const cleanText = text.replace(/```json\n?|\n?```/g, '').trim()
    
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('Raw AI response:', text)
      throw new Error('AI returned invalid JSON format')
    }

    const ranking = JSON.parse(jsonMatch[0])
    
    // Validasi response structure
    if (!ranking.scores || !ranking.top_picks || !ranking.reason) {
      throw new Error('Invalid response structure from AI')
    }

    // Ensure top_picks is array
    if (!Array.isArray(ranking.top_picks)) {
      ranking.top_picks = Object.keys(ranking.scores)
        .sort((a, b) => ranking.scores[b] - ranking.scores[a])
        .slice(0, limit)
    }

    const response = {
      success: true,
      scores: ranking.scores || {},
      topProductIds: ranking.top_picks.slice(0, limit),
      summary: ranking.reason || 'Rekomendasi berdasarkan preferensi Anda',
      timestamp: new Date().toISOString(),
      cached: false
    }

    // Simpan ke cache
    cache.set(cacheKey, {
      data: response,
      timestamp: Date.now()
    })

    return NextResponse.json(response)

  } catch (error: any) {
    console.error('Gemini Error:', error)
    
    // Fallback response
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to get AI ranking',
        fallback: true,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// Optional: Cleanup cache lama (jalanin periodic)
if (process.env.NODE_ENV !== 'production') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, value] of cache.entries()) {
      if (now - value.timestamp > CACHE_TTL) {
        cache.delete(key)
      }
    }
  }, CACHE_TTL)
}