// ShotlyAPI Worker — v2.0 with 12 new screenshot parameters + email + password reset
// Deploy this to your Cloudflare Worker (screenshot-api)

const PLANS = {
  free: { name: 'Free', price: 0, limit: 50 },
  starter: { name: 'Starter', price: 5, limit: 2000 },
  growth: { name: 'Growth', price: 9, limit: 4000 },
  pro: { name: 'Pro', price: 19, limit: 10000 },
}

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

async function sha256(text) {
  const data = new TextEncoder().encode(text)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
}

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
  try { return JSON.parse(atob(parts[1])) } catch { return null }
}

function generateApiKey() {
  const bytes = new Uint8Array(24)
  crypto.getRandomValues(bytes)
  return 'sk_live_' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
}

async function hashPassword(password, salt) {
  return await sha256(password + salt)
}

// ===== Email =====
async function sendEmail(env, to, subject, html) {
  if (!env.RESEND_API_KEY) return { skipped: true }
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + env.RESEND_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'ShotlyAPI <noreply@shotlyapi.in>', to: [to], subject, html }),
  })
  return await response.json()
}

async function sendWelcomeEmail(env, email) {
  const html = '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#f8fafc;padding:40px 20px;"><div style="background:#fff;border-radius:16px;padding:40px;box-shadow:0 4px 16px rgba(0,0,0,.06);"><div style="display:flex;align-items:center;gap:10px;margin-bottom:32px;"><div style="width:40px;height:40px;background:linear-gradient(135deg,#7c3aed,#2563eb);border-radius:10px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:22px;font-weight:800;">S</div><span style="font-size:22px;font-weight:800;color:#0f172a;">ShotlyAPI</span></div><h1 style="font-size:24px;color:#0f172a;margin:0 0 16px;">Welcome to ShotlyAPI!</h1><p style="font-size:16px;color:#475569;line-height:1.6;margin:0 0 20px;">Your account has been created. You now have 50 free screenshots per month.</p><div style="background:#f1f5f9;border-radius:12px;padding:20px;margin:24px 0;"><code style="font-size:14px;color:#2563eb;word-break:break-all;">curl "https://api.shotlyapi.in/api/screenshot?url=https://example.com&api_key=YOUR_API_KEY" -o screenshot.png</code></div><a href="https://shotlyapi.in/dashboard" style="display:inline-block;background:#2563eb;color:#fff;padding:14px 28px;border-radius:8px;font-size:16px;font-weight:600;text-decoration:none;">Go to Dashboard</a><hr style="border:none;border-top:1px solid #e2e8f0;margin:32px 0;"><p style="font-size:13px;color:#94a3b8;margin:0;">(c) 2026 ShotlyAPI. Built with Cloudflare Workers, D1, and R2.</p></div></div>'
  return await sendEmail(env, email, 'Welcome to ShotlyAPI!', html)
}

async function sendPasswordResetEmail(env, email, resetToken) {
  const resetUrl = 'https://shotlyapi.in/reset-password?token=' + resetToken
  const html = '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#f8fafc;padding:40px 20px;"><div style="background:#fff;border-radius:16px;padding:40px;box-shadow:0 4px 16px rgba(0,0,0,.06);"><div style="display:flex;align-items:center;gap:10px;margin-bottom:32px;"><div style="width:40px;height:40px;background:linear-gradient(135deg,#7c3aed,#2563eb);border-radius:10px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:22px;font-weight:800;">S</div><span style="font-size:22px;font-weight:800;color:#0f172a;">ShotlyAPI</span></div><h1 style="font-size:24px;color:#0f172a;margin:0 0 16px;">Reset your password</h1><p style="font-size:16px;color:#475569;line-height:1.6;margin:0 0 24px;">Click the button below to set a new password. This link expires in 1 hour.</p><a href="' + resetUrl + '" style="display:inline-block;background:#2563eb;color:#fff;padding:14px 28px;border-radius:8px;font-size:16px;font-weight:600;text-decoration:none;">Reset Password</a><p style="font-size:14px;color:#64748b;margin:24px 0 0;">If you did not request this, you can safely ignore this email.</p><hr style="border:none;border-top:1px solid #e2e8f0;margin:32px 0;"><p style="font-size:13px;color:#94a3b8;margin:0;">(c) 2026 ShotlyAPI.</p></div></div>'
  return await sendEmail(env, email, 'Reset your ShotlyAPI password', html)
}

async function logUsage(env, apiKey, targetUrl) {
  await env.DB.prepare('INSERT INTO usage (api_key, url) VALUES (?, ?)').bind(apiKey, targetUrl).run()
}

async function getUserByApiKey(env, apiKey) {
  return await env.DB.prepare('SELECT * FROM users WHERE api_key = ?').bind(apiKey).first()
}

async function getUsageCount(env, apiKey) {
  const result = await env.DB.prepare(
    "SELECT COUNT(*) as count FROM usage WHERE api_key = ? AND timestamp >= datetime('now', '-30 days')"
  ).bind(apiKey).first()
  return result?.count || 0
}

// ===== Screenshot params =====
function getScreenshotParams(url) {
  const p = url.searchParams
  return {
    url: p.get('url'),
    api_key: p.get('api_key'),
    format: p.get('format') || 'png',
    width: p.get('width') || null,
    height: p.get('height') || null,
    full_page: p.get('full_page') || null,
    delay: p.get('delay') || null,
    wait_for_selector: p.get('wait_for_selector') || null,
    wait_for_event: p.get('wait_for_event') || null,
    selector: p.get('selector') || null,
    user_agent: p.get('user_agent') || null,
    cookies: p.get('cookies') || null,
    hide_elements: p.get('hide_elements') || null,
    fresh: p.get('fresh') || null,
  }
}

function buildCacheKey(params) {
  const keyStr = JSON.stringify({
    url: params.url,
    format: params.format,
    width: params.width,
    height: params.height,
    full_page: params.full_page,
    delay: params.delay,
    wait_for_selector: params.wait_for_selector,
    wait_for_event: params.wait_for_event,
    selector: params.selector,
    user_agent: params.user_agent,
    cookies: params.cookies,
    hide_elements: params.hide_elements,
  })
  let hash = 0
  for (let i = 0; i < keyStr.length; i++) {
    const char = keyStr.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return 'screenshots/' + Math.abs(hash).toString(16) + '_' + keyStr.length
}

function buildOracleUrl(env, params) {
  const baseUrl = (env.ORACLE_SERVER_URL || 'http://localhost:3000') + '/api/screenshot'
  const q = new URLSearchParams()
  q.set('url', params.url)
  if (params.format && params.format !== 'png') q.set('format', params.format)
  if (params.width) q.set('width', params.width)
  if (params.height) q.set('height', params.height)
  if (params.full_page) q.set('full_page', params.full_page)
  if (params.delay) q.set('delay', params.delay)
  if (params.wait_for_selector) q.set('wait_for_selector', params.wait_for_selector)
  if (params.wait_for_event) q.set('wait_for_event', params.wait_for_event)
  if (params.selector) q.set('selector', params.selector)
  if (params.user_agent) q.set('user_agent', params.user_agent)
  if (params.cookies) q.set('cookies', params.cookies)
  if (params.hide_elements) q.set('hide_elements', params.hide_elements)
  return baseUrl + '?' + q.toString()
}

// ===== Main Handler =====
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    const path = url.pathname

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    if (path === '/health') {
      return jsonResponse({ status: 'ok', timestamp: new Date().toISOString() })
    }

    if (path === '/' || path === '/api') {
      return jsonResponse({
        name: 'ShotlyAPI',
        version: '2.0',
        endpoints: {
          screenshot: '/api/screenshot?url=...&api_key=...&format=png&width=1440&height=900&full_page=true&delay=2000&wait_for_selector=.hero&wait_for_event=networkidle&selector=.pricing&user_agent=...&cookies=...&hide_elements=.ad-banner&fresh=true',
          pdf: '/api/screenshot?url=...&api_key=...&format=pdf',
          health: '/health',
          auth: '/api/auth/signup, /api/auth/login, /api/auth/forgot-password, /api/auth/reset-password',
          usage: '/api/usage',
          billing: '/api/billing/create-order, /api/billing/verify',
        },
        parameters: {
          format: 'png (default), jpeg, webp, pdf',
          width: 'viewport width in px (default: 1920)',
          height: 'viewport height in px (default: 1080)',
          full_page: 'true/false - capture full scrollable page',
          delay: 'milliseconds to wait after page load',
          wait_for_selector: 'CSS selector to wait for before capture',
          wait_for_event: 'networkidle - wait for network to be idle',
          selector: 'CSS selector - capture only this element',
          user_agent: 'custom User-Agent string',
          cookies: 'JSON array of cookie objects',
          hide_elements: 'CSS selectors to hide (comma-separated)',
          fresh: 'true - bypass cache and force fresh capture',
        },
        docs: 'https://shotlyapi.in/docs',
      })
    }

    // ===== AUTH: SIGNUP =====
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

      ctx.waitUntil(sendWelcomeEmail(env, email))
      return jsonResponse({ token, api_key: apiKey, email })
    }

    // ===== AUTH: LOGIN =====
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

    // ===== AUTH: ME =====
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

    // ===== AUTH: REGENERATE KEY =====
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

    // ===== AUTH: FORGOT PASSWORD =====
    if (path === '/api/auth/forgot-password' && request.method === 'POST') {
      const body = await request.json()
      const { email } = body
      if (!email) return jsonError(400, 'Email required')

      const user = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first()
      if (!user) return jsonResponse({ success: true, message: 'If the email exists, a reset link has been sent.' })

      const jwtSecret = env.JWT_SECRET || 'shotly-secret-change-me'
      const resetToken = await makeJWT({ uid: user.id, email: user.email, reset: true, iat: Date.now(), exp: Date.now() + 3600000 }, jwtSecret)
      await env.DB.prepare('UPDATE users SET reset_token = ? WHERE id = ?').bind(resetToken, user.id).run()
      ctx.waitUntil(sendPasswordResetEmail(env, email, resetToken))
      return jsonResponse({ success: true, message: 'If the email exists, a reset link has been sent.' })
    }

    // ===== AUTH: RESET PASSWORD =====
    if (path === '/api/auth/reset-password' && request.method === 'POST') {
      const body = await request.json()
      const { token, password } = body
      if (!token || !password) return jsonError(400, 'Token and new password required')
      if (password.length < 6) return jsonError(400, 'Password must be at least 6 characters')

      const jwtSecret = env.JWT_SECRET || 'shotly-secret-change-me'
      const decoded = await verifyJWT(token, jwtSecret)
      if (!decoded || !decoded.reset) return jsonError(401, 'Invalid or expired reset token')
      if (Date.now() > decoded.exp) return jsonError(401, 'Reset token has expired')

      const user = await env.DB.prepare('SELECT * FROM users WHERE id = ? AND reset_token = ?').bind(decoded.uid, token).first()
      if (!user) return jsonError(401, 'Invalid reset token')

      const newSalt = generateId()
      const newHash = await hashPassword(password, newSalt)
      await env.DB.prepare('UPDATE users SET password_hash = ?, salt = ?, reset_token = NULL WHERE id = ?').bind(newHash, newSalt, user.id).run()
      return jsonResponse({ success: true, message: 'Password reset successfully. You can now log in.' })
    }

    // ===== USAGE =====
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

      return jsonResponse({ stats: { used, limit, plan: user.plan }, recent: recent.results || [] })
    }

    // ===== BILLING: CREATE ORDER =====
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

      if (!env.RZP_KEY_ID || !env.RZP_KEY_SECRET || env.RZP_KEY_ID.startsWith('rzp_test_')) {
        return jsonResponse({ demo: true, plan: planKey, amount: plan.price * 100 })
      }

      const amount = plan.price * 100
      const authHeader = btoa(env.RZP_KEY_ID + ':' + env.RZP_KEY_SECRET)
      const rzpResponse = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: { 'Authorization': 'Basic ' + authHeader, 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currency: 'USD', receipt: 'shotly_' + decoded.uid + '_' + Date.now() }),
      })
      const order = await rzpResponse.json()
      return jsonResponse({ key_id: env.RZP_KEY_ID, order_id: order.id, amount })
    }

    // ===== BILLING: VERIFY =====
    if (path === '/api/billing/verify' && request.method === 'POST') {
      const auth = request.headers.get('Authorization')
      if (!auth || !auth.startsWith('Bearer ')) return jsonError(401, 'Not authenticated')
      const token = auth.replace('Bearer ', '')
      const jwtSecret = env.JWT_SECRET || 'shotly-secret-change-me'
      const decoded = await verifyJWT(token, jwtSecret)
      if (!decoded) return jsonError(401, 'Invalid token')

      const body = await request.json()
      if (!env.RZP_KEY_SECRET || env.RZP_KEY_ID.startsWith('rzp_test_')) {
        await env.DB.prepare('UPDATE users SET plan = ? WHERE id = ?').bind(body.plan, decoded.uid).run()
        return jsonResponse({ success: true, plan: body.plan })
      }

      const body2 = body.razorpay_order_id + '|' + body.razorpay_payment_id
      const expectedSig = await sha256(body2 + env.RZP_KEY_SECRET)
      if (expectedSig === body.razorpay_signature) {
        await env.DB.prepare('UPDATE users SET plan = ? WHERE id = ?').bind(body.plan, decoded.uid).run()
        return jsonResponse({ success: true, plan: body.plan })
      } else {
        return jsonError(400, 'Payment verification failed')
      }
    }

    // ===== SCREENSHOT (v2.0 with 12 new params) =====
    if (path === '/api/screenshot' && request.method === 'GET') {
      const params = getScreenshotParams(url)

      if (!params.url) return jsonError(400, 'Missing required parameter: url')
      if (!params.api_key) return jsonError(401, 'Missing required parameter: api_key')

      const user = await getUserByApiKey(env, params.api_key)
      if (!user) return jsonError(401, 'Invalid API key. Get one at https://shotlyapi.in')

      const used = await getUsageCount(env, params.api_key)
      const limit = PLANS[user.plan]?.limit || 50
      if (used >= limit) {
        return jsonError(403, 'Usage limit exceeded (' + used + '/' + limit + '). Upgrade at https://shotlyapi.in/billing')
      }

      const cacheKey = buildCacheKey(params)

      // Check cache (unless fresh=true)
      if (env.SCREENSHOTS && params.fresh !== 'true') {
        const cached = await env.SCREENSHOTS.get(cacheKey)
        if (cached) {
          await logUsage(env, params.api_key, params.url)
          const contentType = params.format === 'pdf' ? 'application/pdf' : 'image/' + params.format
          return new Response(cached, {
            headers: { 'Content-Type': contentType, 'X-Cache': 'HIT', ...corsHeaders },
          })
        }
      }

      const oracleUrl = buildOracleUrl(env, params)

      try {
        const response = await fetch(oracleUrl, { signal: AbortSignal.timeout(45000) })

        if (!response.ok) {
          return jsonError(500, 'Screenshot failed. The URL might not be accessible.')
        }

        const imageBuffer = await response.arrayBuffer()

        if (env.SCREENSHOTS) {
          await env.SCREENSHOTS.put(cacheKey, imageBuffer, {
            customMetadata: { url: params.url, created: new Date().toISOString() },
          })
        }

        await logUsage(env, params.api_key, params.url)

        const contentType = params.format === 'pdf' ? 'application/pdf' : 'image/' + params.format
        return new Response(imageBuffer, {
          headers: { 'Content-Type': contentType, 'X-Cache': 'MISS', ...corsHeaders },
        })
      } catch (err) {
        return jsonError(500, 'Could not reach screenshot server. It might be starting up. Try again in a few seconds.')
      }
    }

    return jsonError(404, 'Not found. Check the docs at https://shotlyapi.in/docs')
  },
}
