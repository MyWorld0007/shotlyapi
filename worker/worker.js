// ShotlyAPI Worker — Edge layer with auth, billing, and screenshot proxy
// Deploy this to your Cloudflare Worker

const PLANS = {
  free: { name: 'Free', price: 0, limit: 50 },
  starter: { name: 'Starter', price: 5, limit: 2000 },
  growth: { name: 'Growth', price: 9, limit: 4000 },
  pro: { name: 'Pro', price: 19, limit: 10000 },
}

// ===== CORS Headers =====
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  })
}

function jsonError(status, message) {
  return jsonResponse({ error: message }, status)
}

// ===== Hashing =====
async function sha256(text) {
  const data = new TextEncoder().encode(text)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
}

// ===== JWT (simple, using Web Crypto) =====
async function makeJWT(payload, secret) {
  const header = { alg: 'HS256', typ: 'JWT' }
  const enc = (o) => btoa(JSON.stringify(o)).replace(/=/g, '')
  const data = enc(header) + '.' + enc(payload)
  const sig = await sha256(data + secret)
  return data + '.' + sig
}

async function verifyJWT(token, secret) {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const data = parts[0] + '.' + parts[1]
  const sig = await sha256(data + secret)
  if (sig !== parts[2]) return null
  try {
    return JSON.parse(atob(parts[1]))
  } catch {
    return null
  }
}

// ===== Generate API Key =====
function generateApiKey() {
  const bytes = new Uint8Array(24)
  crypto.getRandomValues(bytes)
  return 'sk_live_' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

// ===== Generate User ID =====
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
}

// ===== Password Hashing =====
async function hashPassword(password, salt) {
  return await sha256(password + salt)
}

// ===== Log Usage =====
async function logUsage(env, apiKey, targetUrl) {
  await env.DB.prepare('INSERT INTO usage (api_key, url) VALUES (?, ?)').bind(apiKey, targetUrl).run()
}

// ===== Get User by API Key =====
async function getUserByApiKey(env, apiKey) {
  const result = await env.DB.prepare('SELECT * FROM users WHERE api_key = ?').bind(apiKey).first()
  return result
}

// ===== Get Usage Count =====
async function getUsageCount(env, apiKey) {
  const result = await env.DB.prepare(
    "SELECT COUNT(*) as count FROM usage WHERE api_key = ? AND timestamp >= datetime('now', '-30 days')"
  ).bind(apiKey).first()
  return result?.count || 0
}

// ===== Main Handler =====
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    const path = url.pathname

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    // ===== Health Check =====
    if (path === '/health') {
      return jsonResponse({ status: 'ok', timestamp: new Date().toISOString() })
    }

    // ===== API Root =====
    if (path === '/' || path === '/api') {
      return jsonResponse({
        name: 'ShotlyAPI',
        endpoints: {
          screenshot: '/api/screenshot?url=...&api_key=...',
          health: '/health',
          auth: '/api/auth/signup, /api/auth/login',
          usage: '/api/usage',
          billing: '/api/billing/create-order, /api/billing/verify',
        },
        docs: 'https://shotlyapi.in/docs',
      })
    }

    // ===== AUTH ROUTES =====
    if (path === '/api/auth/signup' && request.method === 'POST') {
      const body = await request.json()
      const { email, password } = body
      if (!email || !password) return jsonError(400, 'Email and password required')
      if (password.length < 6) return jsonError(400, 'Password must be at least 6 characters')

      const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first()
      if (existing) return jsonError(409, 'Email already registered')

      const salt = generateId()
      const hashedPw = await hashPassword(password, salt)
      const apiKey = generateApiKey()
      const userId = generateId()
      const jwtSecret = env.JWT_SECRET || 'shotly-secret-change-me'
      const token = await makeJWT({ uid: userId, email, iat: Date.now() }, jwtSecret)

      await env.DB.prepare(
        'INSERT INTO users (id, email, password_hash, salt, api_key, plan, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
      ).bind(userId, email, hashedPw, salt, apiKey, 'free', new Date().toISOString()).run()

      return jsonResponse({ token, api_key: apiKey, email })
    }

    if (path === '/api/auth/login' && request.method === 'POST') {
      const body = await request.json()
      const { email, password } = body
      if (!email || !password) return jsonError(400, 'Email and password required')

      const user = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first()
      if (!user) return jsonError(401, 'Invalid email or password')

      const hashedPw = await hashPassword(password, user.salt)
      if (hashedPw !== user.password_hash) return jsonError(401, 'Invalid email or password')

      const jwtSecret = env.JWT_SECRET || 'shotly-secret-change-me'
      const token = await makeJWT({ uid: user.id, email: user.email, iat: Date.now() }, jwtSecret)

      return jsonResponse({ token, api_key: user.api_key, email: user.email })
    }

    if (path === '/api/auth/me' && request.method === 'GET') {
      const auth = request.headers.get('Authorization')
      if (!auth || !auth.startsWith('Bearer ')) return jsonError(401, 'Not authenticated')
      const token = auth.replace('Bearer ', '')
      const jwtSecret = env.JWT_SECRET || 'shotly-secret-change-me'
      const decoded = await verifyJWT(token, jwtSecret)
      if (!decoded) return jsonError(401, 'Invalid token')

      const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(decoded.uid).first()
      if (!user) return jsonError(404, 'User not found')

      return jsonResponse({ id: user.id, email: user.email, api_key: user.api_key, plan: user.plan })
    }

    if (path === '/api/auth/regenerate' && request.method === 'POST') {
      const auth = request.headers.get('Authorization')
      if (!auth || !auth.startsWith('Bearer ')) return jsonError(401, 'Not authenticated')
      const token = auth.replace('Bearer ', '')
      const jwtSecret = env.JWT_SECRET || 'shotly-secret-change-me'
      const decoded = await verifyJWT(token, jwtSecret)
      if (!decoded) return jsonError(401, 'Invalid token')

      const newApiKey = generateApiKey()
      await env.DB.prepare('UPDATE users SET api_key = ? WHERE id = ?').bind(newApiKey, decoded.uid).run()

      return jsonResponse({ api_key: newApiKey })
    }

    // ===== USAGE ROUTES =====
    if (path === '/api/usage' && request.method === 'GET') {
      const auth = request.headers.get('Authorization')
      if (!auth || !auth.startsWith('Bearer ')) return jsonError(401, 'Not authenticated')
      const token = auth.replace('Bearer ', '')
      const jwtSecret = env.JWT_SECRET || 'shotly-secret-change-me'
      const decoded = await verifyJWT(token, jwtSecret)
      if (!decoded) return jsonError(401, 'Invalid token')

      const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(decoded.uid).first()
      if (!user) return jsonError(404, 'User not found')

      const used = await getUsageCount(env, user.api_key)
      const limit = PLANS[user.plan]?.limit || 50

      const recent = await env.DB.prepare(
        'SELECT url, timestamp FROM usage WHERE api_key = ? ORDER BY timestamp DESC LIMIT 10'
      ).bind(user.api_key).all()

      return jsonResponse({
        stats: { used, limit, plan: user.plan },
        recent: recent.results || [],
      })
    }

    // ===== BILLING ROUTES =====
    if (path === '/api/billing/create-order' && request.method === 'POST') {
      const auth = request.headers.get('Authorization')
      if (!auth || !auth.startsWith('Bearer ')) return jsonError(401, 'Not authenticated')
      const token = auth.replace('Bearer ', '')
      const jwtSecret = env.JWT_SECRET || 'shotly-secret-change-me'
      const decoded = await verifyJWT(token, jwtSecret)
      if (!decoded) return jsonError(401, 'Invalid token')

      const body = await request.json()
      const planKey = body.plan
      const plan = PLANS[planKey]
      if (!plan || planKey === 'free') return jsonError(400, 'Invalid plan')

      // Demo mode: if no Razorpay keys, return demo response
      if (!env.RZP_KEY_ID || !env.RZP_KEY_SECRET || env.RZP_KEY_ID.startsWith('rzp_test_')) {
        return jsonResponse({ demo: true, plan: planKey, amount: plan.price * 100 })
      }

      // Create Razorpay order
      const amount = plan.price * 100
      const authHeader = btoa(env.RZP_KEY_ID + ':' + env.RZP_KEY_SECRET)

      const rzpResponse = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency: 'USD',
          receipt: 'shotly_' + decoded.uid + '_' + Date.now(),
        }),
      })

      const order = await rzpResponse.json()
      return jsonResponse({
        key_id: env.RZP_KEY_ID,
        order_id: order.id,
        amount,
      })
    }

    if (path === '/api/billing/verify' && request.method === 'POST') {
      const auth = request.headers.get('Authorization')
      if (!auth || !auth.startsWith('Bearer ')) return jsonError(401, 'Not authenticated')
      const token = auth.replace('Bearer ', '')
      const jwtSecret = env.JWT_SECRET || 'shotly-secret-change-me'
      const decoded = await verifyJWT(token, jwtSecret)
      if (!decoded) return jsonError(401, 'Invalid token')

      const body = await request.json()

      // Demo mode: skip verification, just update plan
      if (!env.RZP_KEY_SECRET || env.RZP_KEY_ID.startsWith('rzp_test_')) {
        await env.DB.prepare('UPDATE users SET plan = ? WHERE id = ?').bind(body.plan, decoded.uid).run()
        return jsonResponse({ success: true, plan: body.plan })
      }

      // Verify Razorpay payment signature
      const body2 = body.razorpay_order_id + '|' + body.razorpay_payment_id
      const expectedSig = await sha256(body2 + env.RZP_KEY_SECRET)

      if (expectedSig === body.razorpay_signature) {
        await env.DB.prepare('UPDATE users SET plan = ? WHERE id = ?').bind(body.plan, decoded.uid).run()
        return jsonResponse({ success: true, plan: body.plan })
      } else {
        return jsonError(400, 'Payment verification failed')
      }
    }

    // ===== SCREENSHOT ENDPOINT =====
    if (path === '/api/screenshot' && request.method === 'GET') {
      const targetUrl = url.searchParams.get('url')
      const apiKey = url.searchParams.get('api_key')

      if (!targetUrl) return jsonError(400, 'Missing required parameter: url')
      if (!apiKey) return jsonError(401, 'Missing required parameter: api_key')

      // Validate API key
      const user = await getUserByApiKey(env, apiKey)
      if (!user) return jsonError(401, 'Invalid API key. Get one at our website.')

      // Check usage limit
      const used = await getUsageCount(env, apiKey)
      const limit = PLANS[user.plan]?.limit || 50
      if (used >= limit) {
        return jsonError(403, `Usage limit exceeded (${used}/${limit}). Upgrade your plan at https://shotlyapi.in/billing`)
      }

      // Check R2 cache first
      const cacheKey = 'screenshots/' + await sha256(targetUrl)
      if (env.SCREENSHOTS) {
        const cached = await env.SCREENSHOTS.get(cacheKey)
        if (cached) {
          await logUsage(env, apiKey, targetUrl)
          return new Response(cached, {
            headers: { 'Content-Type': 'image/png', 'X-Cache': 'HIT', ...corsHeaders },
          })
        }
      }

      // Proxy to Oracle server
      const oracleUrl = (env.ORACLE_SERVER_URL || 'http://localhost:3000') + '/api/screenshot?url=' + encodeURIComponent(targetUrl)

      try {
        const response = await fetch(oracleUrl, { signal: AbortSignal.timeout(30000) })

        if (!response.ok) {
          return jsonError(500, 'Screenshot failed. The URL might not be accessible.')
        }

        const imageBuffer = await response.arrayBuffer()

        // Save to R2 cache (7-day TTL handled by lifecycle rule)
        if (env.SCREENSHOTS) {
          await env.SCREENSHOTS.put(cacheKey, imageBuffer, {
            customMetadata: { url: targetUrl, created: new Date().toISOString() },
          })
        }

        // Log usage
        await logUsage(env, apiKey, targetUrl)

        return new Response(imageBuffer, {
          headers: { 'Content-Type': 'image/png', 'X-Cache': 'MISS', ...corsHeaders },
        })
      } catch (err) {
        return jsonError(500, 'Could not reach screenshot server. It might be starting up. Try again in a few seconds.')
      }
    }

    // ===== 404 =====
    return jsonError(404, 'Not found. Check the docs at https://shotlyapi.in/docs')
  },
}
