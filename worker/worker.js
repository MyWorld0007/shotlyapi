// ShotlyAPI Worker — v4.0
// Changes from v3:
// - Free tier replaced with Trial ($1, 7 days, 100 screenshots, one-time)
// - Monthly plans use Razorpay Subscriptions (auto-recurring)
// - Trial uses regular Razorpay Orders (one-time)
// - Trial expiry check on screenshot endpoint
// - Webhook endpoint for subscription recurring payments
// - New D1 columns: trial_started_at, subscription_id, plan_expires_at

const PLANS = {
  trial:   { name: 'Trial',   price: 1,  limit: 100,   type: 'one_time', duration_days: 7 },
  starter: { name: 'Starter', price: 5,  limit: 2000,  type: 'subscription' },
  growth:  { name: 'Growth',  price: 9,  limit: 4000,  type: 'subscription' },
  pro:     { name: 'Pro',     price: 19, limit: 10000, type: 'subscription' },
}

// Map plan key → Razorpay plan_id env variable name
// You will set these in Cloudflare Worker settings after creating plans in Razorpay dashboard
const RZP_PLAN_IDS = {
  starter: 'RZP_PLAN_STARTER',
  growth:  'RZP_PLAN_GROWTH',
  pro:     'RZP_PLAN_PRO',
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
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
  const html = '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#f8fafc;padding:40px 20px;"><div style="background:#fff;border-radius:16px;padding:40px;box-shadow:0 4px 16px rgba(0,0,0,.06);"><div style="display:flex;align-items:center;gap:10px;margin-bottom:32px;"><div style="width:40px;height:40px;background:linear-gradient(135deg,#7c3aed,#2563eb);border-radius:10px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:22px;font-weight:800;">S</div><span style="font-size:22px;font-weight:800;color:#0f172a;">ShotlyAPI</span></div><h1 style="font-size:24px;color:#0f172a;margin:0 0 16px;">Welcome to ShotlyAPI!</h1><p style="font-size:16px;color:#475569;line-height:1.6;margin:0 0 20px;">Your account has been created. Purchase a $1 Trial plan to start capturing screenshots — 100 screenshots for 7 days.</p><div style="background:#f1f5f9;border-radius:12px;padding:20px;margin:24px 0;"><code style="font-size:14px;color:#2563eb;word-break:break-all;">curl "https://api.shotlyapi.in/api/screenshot?url=https://example.com&api_key=YOUR_API_KEY" -o screenshot.png</code></div><a href="https://shotlyapi.in/billing" style="display:inline-block;background:#2563eb;color:#fff;padding:14px 28px;border-radius:8px;font-size:16px;font-weight:600;text-decoration:none;">Buy Trial Plan — $1</a><hr style="border:none;border-top:1px solid #e2e8f0;margin:32px 0;"><p style="font-size:13px;color:#94a3b8;margin:0;">(c) 2026 ShotlyAPI. Built with Cloudflare Workers, D1, and R2.</p></div></div>'
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

// ===== Trial expiry check =====
function isTrialExpired(user) {
  if (user.plan !== 'trial') return false
  if (!user.trial_started_at) return true // No trial start date = expired
  const started = new Date(user.trial_started_at).getTime()
  const sevenDays = 7 * 24 * 60 * 60 * 1000
  return Date.now() > started + sevenDays
}

// ===== Razorpay auth helper =====
function rzpAuthHeader(env) {
  return 'Basic ' + btoa(env.RZP_KEY_ID + ':' + env.RZP_KEY_SECRET)
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
    block_ads: p.get('block_ads') || p.get('block_banners') || null,
    css: p.get('css') || null,
    js: p.get('js') || null,
    custom_html: p.get('custom_html') || null,
    extract_text: p.get('extract_text') || null,
  }
}

function buildCacheKey(params) {
  const keyStr = JSON.stringify({
    url: params.url, format: params.format, width: params.width, height: params.height,
    full_page: params.full_page, delay: params.delay, wait_for_selector: params.wait_for_selector,
    wait_for_event: params.wait_for_event, selector: params.selector, user_agent: params.user_agent,
    cookies: params.cookies, hide_elements: params.hide_elements, block_ads: params.block_ads,
    css: params.css, js: params.js, custom_html: params.custom_html, extract_text: params.extract_text,
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
  if (params.url) q.set('url', params.url)
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
  if (params.block_ads) q.set('block_ads', params.block_ads)
  if (params.css) q.set('css', params.css)
  if (params.js) q.set('js', params.js)
  if (params.custom_html) q.set('custom_html', params.custom_html)
  if (params.extract_text) q.set('extract_text', params.extract_text)
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
        version: '4.0',
        endpoints: {
          screenshot: '/api/screenshot?url=...&api_key=...&format=png&full_page=true&width=1440&height=900&block_ads=true&css=...&js=...&custom_html=...&extract_text=true',
          bulk: 'POST /api/screenshot/bulk',
          pdf: '/api/screenshot?url=...&api_key=...&format=pdf',
          health: '/health',
          auth: '/api/auth/signup, /api/auth/login, /api/auth/forgot-password, /api/auth/reset-password',
          usage: '/api/usage',
          billing: '/api/billing/create-order, /api/billing/verify, /api/billing/webhook',
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
          block_ads: 'true - block ads, cookie banners, chat widgets',
          css: 'custom CSS to inject into the page',
          js: 'custom JavaScript to execute on the page',
          custom_html: 'raw HTML to render instead of navigating to a URL',
          extract_text: 'true - return page text content instead of image',
          fresh: 'true - bypass cache and force fresh capture',
        },
        plans: {
          trial:   '$1 one-time, 100 screenshots, 7 days',
          starter: '$5/month, 2000 screenshots',
          growth:  '$9/month, 4000 screenshots',
          pro:     '$19/month, 10000 screenshots',
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

      // New users start with plan='none' — they must buy at least a Trial to use the API
      await env.DB.prepare(
        'INSERT INTO users (id, email, password_hash, salt, api_key, plan, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
      ).bind(userId, email, hashedPw, salt, apiKey, 'none', new Date().toISOString()).run()

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

      // Include trial expiry info if applicable
      const trialExpired = isTrialExpired(user)
      return jsonResponse({
        id: user.id,
        email: user.email,
        api_key: user.api_key,
        plan: user.plan,
        trial_expired: trialExpired,
        trial_started_at: user.trial_started_at || null,
        subscription_id: user.subscription_id || null,
      })
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
      const limit = PLANS[user.plan]?.limit || 0
      const recent = await env.DB.prepare(
        'SELECT url, timestamp FROM usage WHERE api_key = ? ORDER BY timestamp DESC LIMIT 10'
      ).bind(user.api_key).all()

      const trialExpired = isTrialExpired(user)

      return jsonResponse({
        stats: { used, limit, plan: user.plan, trial_expired: trialExpired },
        recent: recent.results || [],
      })
    }

    // ===== BILLING: CREATE ORDER / SUBSCRIPTION =====
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
      if (!plan || planKey === 'free' || planKey === 'none') return jsonError(400, 'Invalid plan')

      // Demo mode (no live keys)
      if (!env.RZP_KEY_ID || !env.RZP_KEY_SECRET || env.RZP_KEY_ID.startsWith('rzp_test_')) {
        return jsonResponse({ demo: true, plan: planKey, amount: plan.price * 100, type: plan.type })
      }

      // ===== TRIAL: One-time order (no subscription) =====
      if (plan.type === 'one_time') {
        const amount = plan.price * 100 // $1 = 100 cents
        const rzpResponse = await fetch('https://api.razorpay.com/v1/orders', {
          method: 'POST',
          headers: { 'Authorization': rzpAuthHeader(env), 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount,
            currency: 'USD',
            receipt: 'shotly_trial_' + decoded.uid + '_' + Date.now(),
            notes: { plan: planKey, user_id: decoded.uid },
          }),
        })
        const order = await rzpResponse.json()
        return jsonResponse({
          key_id: env.RZP_KEY_ID,
          order_id: order.id,
          amount,
          type: 'one_time',
          plan: planKey,
        })
      }

      // ===== MONTHLY PLANS: Create Razorpay Subscription =====
      const planIdEnvVar = RZP_PLAN_IDS[planKey]
      const razorpayPlanId = env[planIdEnvVar]

      if (!razorpayPlanId) {
        return jsonError(500, 'Subscription plan not configured. Set ' + planIdEnvVar + ' in Worker env vars.')
      }

      // Create subscription via Razorpay API
      const rzpResponse = await fetch('https://api.razorpay.com/v1/subscriptions', {
        method: 'POST',
        headers: { 'Authorization': rzpAuthHeader(env), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan_id: razorpayPlanId,
          customer_notify: 1,
          quantity: 1,
          total_count: 12, // 12 monthly billing cycles (1 year)
          notes: {
            plan: planKey,
            user_id: decoded.uid,
          },
        }),
      })
      const subscription = await rzpResponse.json()

      if (subscription.error) {
        return jsonError(500, 'Razorpay subscription error: ' + (subscription.error.description || 'Unknown error'))
      }

      return jsonResponse({
        key_id: env.RZP_KEY_ID,
        subscription_id: subscription.id,
        plan: planKey,
        type: 'subscription',
        amount: plan.price * 100,
      })
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
      const planKey = body.plan
      const plan = PLANS[planKey]
      if (!plan) return jsonError(400, 'Invalid plan')

      // Demo mode
      if (!env.RZP_KEY_SECRET || env.RZP_KEY_ID.startsWith('rzp_test_')) {
        const now = new Date().toISOString()
        if (plan.type === 'one_time') {
          await env.DB.prepare('UPDATE users SET plan = ?, trial_started_at = ? WHERE id = ?')
            .bind(planKey, now, decoded.uid).run()
        } else {
          await env.DB.prepare('UPDATE users SET plan = ? WHERE id = ?')
            .bind(planKey, decoded.uid).run()
        }
        return jsonResponse({ success: true, plan: planKey })
      }

      // ===== TRIAL: Verify one-time order payment =====
      if (plan.type === 'one_time') {
        const body2 = body.razorpay_order_id + '|' + body.razorpay_payment_id
        const expectedSig = await sha256(body2 + env.RZP_KEY_SECRET)

        if (expectedSig === body.razorpay_signature) {
          const now = new Date().toISOString()
          await env.DB.prepare('UPDATE users SET plan = ?, trial_started_at = ? WHERE id = ?')
            .bind(planKey, now, decoded.uid).run()
          return jsonResponse({ success: true, plan: planKey, trial_started_at: now })
        } else {
          return jsonError(400, 'Payment verification failed')
        }
      }

      // ===== MONTHLY: Verify subscription payment =====
      const subId = body.razorpay_subscription_id
      const paymentId = body.razorpay_payment_id
      const signature = body.razorpay_signature

      if (!subId || !paymentId || !signature) {
        return jsonError(400, 'Missing subscription payment details')
      }

      const body2 = paymentId + '|' + subId
      const expectedSig = await sha256(body2 + env.RZP_KEY_SECRET)

      if (expectedSig === signature) {
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        await env.DB.prepare('UPDATE users SET plan = ?, subscription_id = ?, plan_expires_at = ? WHERE id = ?')
          .bind(planKey, subId, expiresAt, decoded.uid).run()
        return jsonResponse({ success: true, plan: planKey, subscription_id: subId })
      } else {
        return jsonError(400, 'Subscription payment verification failed')
      }
    }

    // ===== BILLING: WEBHOOK (for recurring subscription payments) =====
    if (path === '/api/billing/webhook' && request.method === 'POST') {
      const body = await request.json()

      // Verify webhook signature
      const webhookSignature = request.headers.get('X-Razorpay-Signature')
      const webhookSecret = env.RZP_WEBHOOK_SECRET

      if (webhookSecret) {
        const rawBody = JSON.stringify(body)
        const expectedSig = await sha256(rawBody + webhookSecret)
        if (webhookSignature !== expectedSig) {
          return jsonError(401, 'Invalid webhook signature')
        }
      }

      const event = body.event
      const payment = body.payload?.payment?.entity

      // subscription.charged = successful recurring payment
      if (event === 'subscription.charged' && payment) {
        const subscriptionId = body.payload?.subscription?.entity?.id

        if (subscriptionId) {
          const user = await env.DB.prepare('SELECT * FROM users WHERE subscription_id = ?').bind(subscriptionId).first()
          if (user) {
            const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            await env.DB.prepare('UPDATE users SET plan_expires_at = ? WHERE id = ?')
              .bind(expiresAt, user.id).run()
          }
        }
      }

      // subscription.cancelled = user cancelled their subscription
      if (event === 'subscription.cancelled') {
        const subscriptionId = body.payload?.subscription?.entity?.id
        if (subscriptionId) {
          const user = await env.DB.prepare('SELECT * FROM users WHERE subscription_id = ?').bind(subscriptionId).first()
          if (user) {
            await env.DB.prepare('UPDATE users SET plan = ? WHERE id = ?')
              .bind('none', user.id).run()
          }
        }
      }

      return jsonResponse({ received: true })
    }

    // ===== BULK SCREENSHOT =====
    if (path === '/api/screenshot/bulk' && request.method === 'POST') {
      const auth = request.headers.get('Authorization')
      if (!auth || !auth.startsWith('Bearer ')) return jsonError(401, 'Not authenticated')
      const token = auth.replace('Bearer ', '')
      const jwtSecret = env.JWT_SECRET || 'shotly-secret-change-me'
      const decoded = await verifyJWT(token, jwtSecret)
      if (!decoded) return jsonError(401, 'Invalid token')

      const body = await request.json()
      const apiKey = body.api_key
      if (!apiKey) return jsonError(400, 'Missing api_key')

      const user = await getUserByApiKey(env, apiKey)
      if (!user) return jsonError(401, 'Invalid API key')

      // Check plan status
      if (user.plan === 'none') return jsonError(403, 'No active plan. Purchase a plan at https://shotlyapi.in/billing')
      if (isTrialExpired(user)) return jsonError(403, 'Trial expired. Upgrade at https://shotlyapi.in/billing')

      const oracleUrl = (env.ORACLE_SERVER_URL || 'http://localhost:3000') + '/api/screenshot/bulk'
      const response = await fetch(oracleUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(120000),
      })

      if (body.urls && Array.isArray(body.urls)) {
        for (const u of body.urls) {
          await logUsage(env, apiKey, u)
        }
      }

      const data = await response.json()
      return jsonResponse(data)
    }

    // ===== SCREENSHOT v4.0 =====
    if (path === '/api/screenshot' && request.method === 'GET') {
      const params = getScreenshotParams(url)

      if (!params.url && !params.custom_html) return jsonError(400, 'Missing required parameter: url or custom_html')
      if (!params.api_key) return jsonError(401, 'Missing required parameter: api_key')

      const user = await getUserByApiKey(env, params.api_key)
      if (!user) return jsonError(401, 'Invalid API key. Get one at https://shotlyapi.in')

      // ===== Plan checks =====
      if (user.plan === 'none') {
        return jsonError(403, 'No active plan. Purchase a plan at https://shotlyapi.in/billing')
      }
      if (isTrialExpired(user)) {
        return jsonError(403, 'Your 7-day Trial has expired. Upgrade to a paid plan at https://shotlyapi.in/billing')
      }

      const used = await getUsageCount(env, params.api_key)
      const limit = PLANS[user.plan]?.limit || 0
      if (used >= limit) {
        return jsonError(403, 'Usage limit exceeded (' + used + '/' + limit + '). Upgrade at https://shotlyapi.in/billing')
      }

      // Text extraction doesn't need caching
      if (params.extract_text === 'true') {
        const oracleUrl = buildOracleUrl(env, params)
        try {
          const response = await fetch(oracleUrl, { signal: AbortSignal.timeout(45000) })
          if (!response.ok) return jsonError(500, 'Text extraction failed.')
          const data = await response.json()
          await logUsage(env, params.api_key, params.url || 'custom_html')
          return jsonResponse(data)
        } catch (err) {
          return jsonError(500, 'Could not reach screenshot server.')
        }
      }

      const cacheKey = buildCacheKey(params)

      // Check cache (unless fresh=true)
      if (env.SCREENSHOTS && params.fresh !== 'true') {
        const cached = await env.SCREENSHOTS.get(cacheKey)
        if (cached) {
          await logUsage(env, params.api_key, params.url || 'custom_html')
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
            customMetadata: { url: params.url || 'custom_html', created: new Date().toISOString() },
          })
        }

        await logUsage(env, params.api_key, params.url || 'custom_html')

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
