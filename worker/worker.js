// ShotlyAPI Worker v4.1 - Fixed HMAC-SHA256 signature verification
// Trial: Rs.99 one-time | Starter: Rs.499/mo | Growth: Rs.899/mo | Pro: Rs.1799/mo

const PLANS = {
  trial:   { name: 'Trial',   price: 99,  limit: 100,   type: 'one_time', duration_days: 7 },
  starter: { name: 'Starter', price: 499, limit: 2000,  type: 'subscription' },
  growth:  { name: 'Growth',  price: 899, limit: 4000,  type: 'subscription' },
  pro:     { name: 'Pro',     price: 1799, limit: 10000, type: 'subscription' },
  demo:    { name: 'Demo',    price: 0,    limit: 200,    type: 'demo' },
}

const RZP_PLAN_IDS = {
  starter: 'RZP_PLAN_STARTER',
  growth:  'RZP_PLAN_GROWTH',
  pro:     'RZP_PLAN_PRO',
}

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://shotlyapi.in',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' https://api.shotlyapi.in; font-src 'self'; frame-ancestors 'self' https://dash.cloudflare.com",
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
}

function jsonResponse(data, status, extraHeaders) {
  if (!status) status = 200
  var headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': 'https://shotlyapi.in', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization', 'Access-Control-Allow-Credentials': 'true', 'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' https://api.shotlyapi.in; font-src 'self'; frame-ancestors 'self' https://dash.cloudflare.com", 'Strict-Transport-Security': 'max-age=31536000; includeSubDomains', 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY' }
  if (extraHeaders) { for (var k in extraHeaders) headers[k] = extraHeaders[k] }
  return new Response(JSON.stringify(data), { status: status, headers: headers })
}

function jsonError(status, message) {
  return jsonResponse({ error: message }, status)
}

// Plain SHA-256 (for JWT and passwords - NOT for Razorpay)
async function sha256(text) {
  const data = new TextEncoder().encode(text)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash)).map(function(b) { return b.toString(16).padStart(2, '0') }).join('')
}

// HMAC-SHA256 (for Razorpay signature verification)
async function hmacSha256(message, secret) {
  const keyData = new TextEncoder().encode(secret)
  const msgData = new TextEncoder().encode(message)
  const key = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', key, msgData)
  return Array.from(new Uint8Array(sig)).map(function(b) { return b.toString(16).padStart(2, '0') }).join('')
}

async function makeJWT(payload, secret) {
  const header = { alg: 'HS256', typ: 'JWT' }
  var enc = function(o) { return btoa(JSON.stringify(o)).replace(/=/g, '') }
  var data = enc(header) + '.' + enc(payload)
  var sig = await hmacSha256(data, secret)
  return data + '.' + sig
}

async function verifyJWT(token, secret) {
  var parts = token.split('.')
  if (parts.length !== 3) return null
  var data = parts[0] + '.' + parts[1]
  var sig = await hmacSha256(data, secret)
  if (sig !== parts[2]) return null
  try { return JSON.parse(atob(parts[1])) } catch (e) { return null }
}

function generateApiKey() {
  var bytes = new Uint8Array(24)
  crypto.getRandomValues(bytes)
  return 'sk_live_' + Array.from(bytes).map(function(b) { return b.toString(16).padStart(2, '0') }).join('')
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
}

async function hashPassword(password, salt) {
  return await sha256(password + salt)
}

// PBKDF2 password hashing (100k iterations)
async function hashPasswordPBKDF2(password, salt) {
  var enc = new TextEncoder()
  var keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits'])
  var derived = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: enc.encode(salt), iterations: 100000, hash: 'SHA-256' }, keyMaterial, 256)
  return 'pbkdf2:100000:' + salt + ':' + Array.from(new Uint8Array(derived)).map(function(b) { return b.toString(16).padStart(2, '0') }).join('')
}

// Verify password - supports both PBKDF2 (new) and SHA-256 (legacy)
async function verifyPassword(password, storedHash, salt) {
  if (storedHash && storedHash.indexOf('pbkdf2:') === 0) {
    var parts = storedHash.split(':')
    var iterations = parseInt(parts[1])
    var storedSalt = parts[2]
    var storedDerived = parts[3]
    var enc = new TextEncoder()
    var keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits'])
    var derived = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: enc.encode(storedSalt), iterations: iterations, hash: 'SHA-256' }, keyMaterial, 256)
    var computed = Array.from(new Uint8Array(derived)).map(function(b) { return b.toString(16).padStart(2, '0') }).join('')
    return computed === storedDerived
  } else {
    var legacyHash = await sha256(password + salt)
    return legacyHash === storedHash
  }
}

// API key hashing (SHA-256 is fine for high-entropy keys)
async function hashApiKey(apiKey) {
  return await sha256(apiKey)
}

function apiKeyDisplay(apiKey) {
  if (!apiKey) return 'sk_live_...'
  return apiKey.substring(0, 12) + '...' + apiKey.substring(apiKey.length - 4)
}

// Cookie helpers
function setAuthCookie(token) {
  return 'shotly_token=' + token + '; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800; Domain=.shotlyapi.in'
}

function clearAuthCookie() {
  return 'shotly_token=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0; Domain=.shotlyapi.in'
}

function getCookie(request, name) {
  var cookies = request.headers.get('Cookie') || ''
  var match = cookies.match(new RegExp('(^|;\\s*)' + name + '=([^;]+)'))
  return match ? match[2] : null
}

function getTokenFromRequest(request) {
  var cookieToken = getCookie(request, 'shotly_token')
  if (cookieToken) return cookieToken
  var auth = request.headers.get('Authorization')
  if (auth && auth.indexOf('Bearer ') === 0) return auth.replace('Bearer ', '')
  return null
}

// ===== Email =====
async function sendEmail(env, to, subject, html) {
  if (!env.RESEND_API_KEY) return { skipped: true }
  var response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + env.RESEND_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'ShotlyAPI <noreply@shotlyapi.in>', to: [to], subject: subject, html: html }),
  })
  return await response.json()
}

async function sendWelcomeEmail(env, email) {
  var html = '<div style=\"font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#f8fafc;padding:40px 20px;\"><div style=\"background:#fff;border-radius:16px;padding:40px;box-shadow:0 4px 16px rgba(0,0,0,.06);\"><div style=\"display:flex;align-items:center;gap:10px;margin-bottom:32px;\"><div style=\"width:40px;height:40px;background:linear-gradient(135deg,#7c3aed,#2563eb);border-radius:10px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:22px;font-weight:800;\">S</div><span style=\"font-size:22px;font-weight:800;color:#0f172a;\">ShotlyAPI</span></div><h1 style=\"font-size:24px;color:#0f172a;margin:0 0 16px;\">Welcome to ShotlyAPI!</h1><p style=\"font-size:16px;color:#475569;line-height:1.6;margin:0 0 20px;\">Your account has been created. Purchase a Trial plan to start capturing screenshots.</p><div style=\"background:#f1f5f9;border-radius:12px;padding:20px;margin:24px 0;\"><code style=\"font-size:14px;color:#2563eb;word-break:break-all;\">curl \"https://api.shotlyapi.in/api/screenshot?url=https://example.com&api_key=YOUR_API_KEY\" -o screenshot.png</code></div><a href=\"https://shotlyapi.in/billing\" style=\"display:inline-block;background:#2563eb;color:#fff;padding:14px 28px;border-radius:8px;font-size:16px;font-weight:600;text-decoration:none;\">Buy Trial Plan</a><hr style=\"border:none;border-top:1px solid #e2e8f0;margin:32px 0;\"><p style=\"font-size:13px;color:#94a3b8;margin:0;\">(c) 2026 ShotlyAPI. Built with Cloudflare Workers, D1, and R2.</p></div></div>'
  return await sendEmail(env, email, 'Welcome to ShotlyAPI!', html)
}

async function sendPasswordResetEmail(env, email, resetToken) {
  var resetUrl = 'https://shotlyapi.in/reset-password?token=' + resetToken
  var html = '<div style=\"font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#f8fafc;padding:40px 20px;\"><div style=\"background:#fff;border-radius:16px;padding:40px;box-shadow:0 4px 16px rgba(0,0,0,.06);\"><div style=\"display:flex;align-items:center;gap:10px;margin-bottom:32px;\"><div style=\"width:40px;height:40px;background:linear-gradient(135deg,#7c3aed,#2563eb);border-radius:10px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:22px;font-weight:800;\">S</div><span style=\"font-size:22px;font-weight:800;color:#0f172a;\">ShotlyAPI</span></div><h1 style=\"font-size:24px;color:#0f172a;margin:0 0 16px;\">Reset your password</h1><p style=\"font-size:16px;color:#475569;line-height:1.6;margin:0 0 24px;\">Click the button below to set a new password. This link expires in 1 hour.</p><a href=\"' + resetUrl + '\" style=\"display:inline-block;background:#2563eb;color:#fff;padding:14px 28px;border-radius:8px;font-size:16px;font-weight:600;text-decoration:none;\">Reset Password</a><p style=\"font-size:14px;color:#64748b;margin:24px 0 0;\">If you did not request this, you can safely ignore this email.</p><hr style=\"border:none;border-top:1px solid #e2e8f0;margin:32px 0;\"><p style=\"font-size:13px;color:#94a3b8;margin:0;\">(c) 2026 ShotlyAPI.</p></div></div>'
  return await sendEmail(env, email, 'Reset your ShotlyAPI password', html)
}

async function logUsage(env, apiKey, targetUrl) {
  var hashed = await hashApiKey(apiKey)
  await env.DB.prepare('INSERT INTO usage (api_key, url) VALUES (?, ?)').bind(hashed, targetUrl).run()
}

async function getUserByApiKey(env, apiKey) {
  var hashed = await hashApiKey(apiKey)
  // Try hashed lookup first (new accounts)
  var user = await env.DB.prepare('SELECT * FROM users WHERE api_key_hash = ?').bind(hashed).first()
  if (user) return user
  // Fall back to plaintext lookup (legacy accounts, demo key)
  return await env.DB.prepare('SELECT * FROM users WHERE api_key = ?').bind(apiKey).first()
}

async function getUsageCount(env, apiKey) {
  // Try both hashed and plaintext for backward compat
  var hashed = await hashApiKey(apiKey)
  var result = await env.DB.prepare("SELECT COUNT(*) as count FROM usage WHERE (api_key = ? OR api_key = ?) AND timestamp >= datetime('now', '-30 days')").bind(hashed, apiKey).first()
  return (result && result.count) || 0
}


// ===== Rate Limiting =====
async function checkRateLimit(env, ip, endpoint) {
  var result = await env.DB.prepare(
    "SELECT COUNT(*) as count FROM login_attempts WHERE ip = ? AND endpoint = ? AND timestamp >= datetime('now', '-15 minutes')"
  ).bind(ip, endpoint).first()
  return (result && result.count) || 0
}

async function logAttempt(env, ip, endpoint) {
  await env.DB.prepare("INSERT INTO login_attempts (ip, endpoint) VALUES (?, ?)").bind(ip, endpoint).run()
}

async function cleanupAttempts(env) {
  await env.DB.prepare("DELETE FROM login_attempts WHERE timestamp < datetime('now', '-1 hour')").run()
}

function getClientIP(request) {
  return request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'unknown'
}

function isTrialExpired(user) {
  if (user.plan !== 'trial') return false
  if (!user.trial_started_at) return true
  var started = new Date(user.trial_started_at).getTime()
  var sevenDays = 7 * 24 * 60 * 60 * 1000
  return Date.now() > started + sevenDays
}

function rzpAuthHeader(env) {
  return 'Basic ' + btoa(env.RZP_KEY_ID + ':' + env.RZP_KEY_SECRET)
}

function getScreenshotParams(url) {
  var p = url.searchParams
  return {
    url: p.get('url'), api_key: p.get('api_key'),
    format: p.get('format') || 'png', width: p.get('width') || null, height: p.get('height') || null,
    full_page: p.get('full_page') || null, delay: p.get('delay') || null,
    wait_for_selector: p.get('wait_for_selector') || null, wait_for_event: p.get('wait_for_event') || null,
    selector: p.get('selector') || null, user_agent: p.get('user_agent') || null,
    cookies: p.get('cookies') || null, hide_elements: p.get('hide_elements') || null,
    fresh: p.get('fresh') || null, block_ads: p.get('block_ads') || p.get('block_banners') || null,
    css: p.get('css') || null, js: p.get('js') || null,
    custom_html: p.get('custom_html') || null, extract_text: p.get('extract_text') || null,
  }
}

function buildCacheKey(params) {
  var keyStr = JSON.stringify({ url: params.url, format: params.format, width: params.width, height: params.height, full_page: params.full_page, delay: params.delay, wait_for_selector: params.wait_for_selector, wait_for_event: params.wait_for_event, selector: params.selector, user_agent: params.user_agent, cookies: params.cookies, hide_elements: params.hide_elements, block_ads: params.block_ads, css: params.css, js: params.js, custom_html: params.custom_html, extract_text: params.extract_text })
  var hash = 0
  for (var i = 0; i < keyStr.length; i++) { var char = keyStr.charCodeAt(i); hash = ((hash << 5) - hash) + char; hash = hash & hash }
  return 'screenshots/' + Math.abs(hash).toString(16) + '_' + keyStr.length
}

function buildOracleUrl(env, params) {
  var baseUrl = (env.ORACLE_SERVER_URL || 'http://localhost:3000') + '/api/screenshot'
  var q = new URLSearchParams()
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

export default {
  async fetch(request, env, ctx) {
    var url = new URL(request.url)
    var path = url.pathname
    if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })
    if (path === '/health') return jsonResponse({ status: 'ok', timestamp: new Date().toISOString() })
    if (path === '/' || path === '/api') return jsonResponse({ name: 'ShotlyAPI', version: '4.1', docs: 'https://shotlyapi.in/docs' })

    // AUTH: SIGNUP
    if (path === '/api/auth/signup' && request.method === 'POST') {
      var clientIP = getClientIP(request)
      var signupAttempts = await checkRateLimit(env, clientIP, 'signup')
      if (signupAttempts >= 5) return jsonError(429, 'Too many signup attempts. Please try again in 15 minutes.')
      ctx.waitUntil(cleanupAttempts(env))
      var body = await request.json()
      if (!body.email || !body.password) return jsonError(400, 'Email and password required')
      if (body.password.length < 6) return jsonError(400, 'Password must be at least 6 characters')
      var existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(body.email).first()
      if (existing) { ctx.waitUntil(logAttempt(env, clientIP, 'signup')); return jsonError(409, 'Email already registered') }
      var salt = generateId()
      var hashedPw = await hashPasswordPBKDF2(body.password, salt)
      var apiKey = generateApiKey()
      var apiKeyHash = await hashApiKey(apiKey)
      var apiKeyDisplayVal = apiKeyDisplay(apiKey)
      var userId = generateId()
      var jwtSecret = env.JWT_SECRET
      var token = await makeJWT({ uid: userId, email: body.email, iat: Date.now() }, jwtSecret)
      await env.DB.prepare('INSERT INTO users (id, email, password_hash, salt, api_key, api_key_hash, api_key_display, plan, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').bind(userId, body.email, hashedPw, salt, apiKey, apiKeyHash, apiKeyDisplayVal, 'none', new Date().toISOString()).run()
      ctx.waitUntil(sendWelcomeEmail(env, body.email))
      return jsonResponse({ token: token, api_key: apiKey, api_key_display: apiKeyDisplayVal, email: body.email }, 200, { 'Set-Cookie': setAuthCookie(token) })
    }

    // AUTH: LOGIN
    if (path === '/api/auth/login' && request.method === 'POST') {
      var clientIP = getClientIP(request)
      var attempts = await checkRateLimit(env, clientIP, 'login')
      if (attempts >= 10) return jsonError(429, 'Too many login attempts. Please try again in 15 minutes.')
      ctx.waitUntil(cleanupAttempts(env))
      var body = await request.json()
      if (!body.email || !body.password) return jsonError(400, 'Email and password required')
      var user = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(body.email).first()
      if (!user) { ctx.waitUntil(logAttempt(env, clientIP, 'login')); return jsonError(401, 'Invalid email or password') }
      var isValid = await verifyPassword(body.password, user.password_hash, user.salt)
      if (!isValid) { ctx.waitUntil(logAttempt(env, clientIP, 'login')); return jsonError(401, 'Invalid email or password') }
      // Migrate old SHA-256 hash to PBKDF2 on successful login
      if (user.password_hash && user.password_hash.indexOf('pbkdf2:') !== 0) {
        var newSalt = generateId()
        var newHash = await hashPasswordPBKDF2(body.password, newSalt)
        await env.DB.prepare('UPDATE users SET password_hash = ?, salt = ? WHERE id = ?').bind(newHash, newSalt, user.id).run()
      }
      var jwtSecret = env.JWT_SECRET
      var token = await makeJWT({ uid: user.id, email: user.email, iat: Date.now() }, jwtSecret)
      var displayKey = user.api_key_display || apiKeyDisplay(user.api_key) || 'sk_live_...'
      return jsonResponse({ token: token, api_key: (user.api_key && user.api_key !== 'REVOKED') ? user.api_key : null, api_key_display: displayKey, email: user.email, plan: user.plan, trial_started_at: user.trial_started_at, plan_expires_at: user.plan_expires_at }, 200, { 'Set-Cookie': setAuthCookie(token) })
    }

    // AUTH: MBˆYˆ
]OOH	ËØ\KØ]]ÛYIÈ	‰ˆ™\]Y\İ›Y]ÙOOH	ÑÑU	ÊHÂˆ˜\ˆÚÙ[ˆHÙ]ÚÙ[‘œ›ÛT™\]Y\İ
™\]Y\İ
BˆYˆ
]ÚÙ[ŠH™]\›ˆœÛÛ‘\œ›ÜŠK	Ó›İ]][XØ]Y	ÊBˆ˜\ˆİÙXÜ™]H[‹’•ÕÔÑPÔ‘Uˆ˜\ˆXÛÙYH]ØZ]™\šYR•Õ
ÚÙ[‹İÙXÜ™]
BˆYˆ
YXÛÙY
H™]\›ˆœÛÛ‘\œ›ÜŠK	Ò[˜[YÚÙ[‰ÊBˆ˜\ˆ\Ù\ˆH]ØZ][‹‘‹œ™\\™J	ÔÑSPÕ
ˆ”“ÓH\Ù\œÈÒT‘HYHÉÊK˜š[™
XÛÙYZY
K™š\œİ

BˆYˆ
]\Ù\ŠH™]\›ˆœÛÛ‘\œ›ÜŠ	Õ\Ù\ˆ›İ›İ[™	ÊBˆ˜\ˆ\Ü^RÙ^HH\Ù\‹˜\WÚÙ^WÙ\Ü^H\RÙ^Q\Ü^J\Ù\‹˜\WÚÙ^JH	ÜÚ×Û]™WË‹‹‰Âˆ™]\›ˆœÛÛ”™\ÜÛœÙJÈYˆ\Ù\‹šY[XZ[ˆ\Ù\‹™[XZ[\WÚÙ^Nˆ
\Ù\‹˜\WÚÙ^H	‰ˆ\Ù\‹˜\WÚÙ^HOOH	Ô‘U“ÒÑQ	ÊHÈ\Ù\‹˜\WÚÙ^Hˆ[\WÚÙ^WÙ\Ü^Nˆ\Ü^RÙ^K[ˆ\Ù\‹œ[‹šX[Ù^\™Yˆ\ÕšX[^\™Y
\Ù\ŠHJBˆB‚ˆËÈUUˆÑÓÕUˆYˆ
]OOH	ËØ\KØ]]ÛÙÛİ]	È	‰ˆ™\]Y\İ›Y]ÙOOH	ÔÔÕ	ÊHÂˆ™]\›ˆœÛÛ”™\ÜÛœÙJÈİXØÙ\ÜÎˆYHKŒÈ	ÔÙ]PÛÛÚÚÚYIÎˆÛX\]]ÛÛÚÚYJ
HJBˆB‚ˆËÈUUˆ‘QÑS‘TUBˆYˆ
]OOH	ËØ\KØ]]Ü™YÙ[™\˜]IÈ	‰ˆ™\]Y\İ›Y]ÙOOH	ÔÔÕ	ÊHÂˆHÂˆ˜\ˆÚÙ[ˆHÙ]ÚÙ[‘œ›ÛT™\]Y\İ
™\]Y\İ
BˆYˆ
]ÚÙ[ŠH™]\›ˆœÛÛ‘\œ›ÜŠK	Ó›İ]][XØ]Y	ÊBˆ˜\ˆİÙXÜ™]H[‹’•ÕÔÑPÔ‘Uˆ˜\ˆXÛÙYH]ØZ]™\šYR•Õ
ÚÙ[‹İÙXÜ™]
BˆYˆ
YXÛÙY
H™]\›ˆœÛÛ‘\œ›ÜŠK	Ò[˜[YÚÙ[‰ÊBˆ˜\ˆ™]ÒÙ^HHÙ[™\˜]P\RÙ^J
Bˆ˜\ˆ™]Ò\ÚH]ØZ]\Ú\RÙ^J™]ÒÙ^JBˆ˜\ˆ™]Ñ\Ü^HH\RÙ^Q\Ü^J™]ÒÙ^JBˆ]ØZ][‹‘‹œ™\\™J•TUH\Ù\œÈÑU\WÚÙ^HH	ÔQU“ÒÑQ	Ë\WÚÙ^WÚ\ÚHË\WÚÙ^WÙ\Ü^HHÈÒT‘HYHÈŠK˜š[™
™]Ò\Ú™]Ñ\Ü^KXÛÙYZY
Kœ[Š
Bˆ™]\›ˆœÛÛ”™\ÜÛœÙJÈ\WÚÙ^Nˆ™]ÒÙ^K\WÚÙ^WÙ\Ü^Nˆ™]Ñ\Ü^HKŒÈ	ÔÙ]PÛÛÚÚYIÎˆÙ]]]ÛÛÚÚYJÚÙ[ŠHJBˆHØ]Ú
™YÙ[‘\œŠHÂˆ™]\›ˆœÛÛ‘\œ›ÜŠL	Ô™YÙ[™\˜]H˜Z[Yˆ	È
È
™YÙ[‘\œˆ	‰ˆ™YÙ[‘\œ‹›Y\ÜØYÙHÈ™YÙ[‘\œ‹›Y\ÜØYÙHˆİš[™Ê™YÙ[‘\œŠJJBˆBˆB‚ˆËÈUUˆ“Ô‘ÓÕTÔÕÓÔ‘ˆYˆ
]OOH	ËØ\KØ]]Ù›Ü™Ûİ\\ÜİÛÜ™	È	‰ˆ™\]Y\İ›Y]ÙOOH	ÔÔÕ	ÊHÂˆ˜\ˆ™\Ù]THÙ]ÛY[T
™\]Y\İ
Bˆ˜\ˆ™\Ù]][\ÈH]ØZ]ÚXÚÔ˜]S[Z]
[‹™\Ù]T	Ü™\Ù]	ÊBˆYˆ
™\Ù]][\ÈHJH™]\›ˆœÛÛ‘\œ›ÜŠK	ÕÛÈX[H™\Ù]][\ËˆX\ÙHHYØZ[ˆ[ˆMHZ[]\Ë‰ÊBˆ˜\ˆ›ÙHH]ØZ]™\]Y\İšœÛÛŠ
BˆYˆ
X›ÙK™[XZ[
H™]\›ˆœÛÛ‘\œ›ÜŠ	Ñ[XZ[™\]Z\™Y	ÊBˆ˜\ˆ\Ù\ˆH]ØZ][‹‘‹œ™\\™J	ÔÑSPÕ
ˆ”“ÓH\Ù\œÈÒT‘H[XZ[HÉÊK˜š[™
›ÙK™[XZ[
K™š\œİ

BˆYˆ
]\Ù\ŠH™]\›ˆœÛÛ”™\ÜÛœÙJÈİXØÙ\ÜÎˆYKY\ÜØYÙNˆ	ÒYˆH[XZ[^\İËH™\Ù][šÈ\È™Y[ˆÙ[‰ÈJBˆ˜\ˆİÙXÜ™]H[‹’•ÕÔÑPÔ‘Uˆ˜\ˆ™\Ù]ÚÙ[ˆH]ØZ]XZÙR•Õ
ÈZYˆ\Ù\‹šY[XZ[ˆ\Ù\‹™[XZ[™\Ù]ˆYKX]ˆ]K››İÊ
K^ˆ]K››İÊ
H
ÈÍŒKİÙXÜ™]
Bˆ]ØZ][‹‘‹œ™\\™J	ÕTUH\Ù\œÈÑU™\Ù]İÚÙ[ˆHÈÒT‘HYHÉÊK˜š[™
™\Ù]ÚÙ[‹\Ù\‹šY
Kœ[Š
BˆİØZ][[
Ù[™\ÜİÛÜ™™\Ù][XZ[
[‹›ÙK™[XZ[™\Ù]ÚÙ[ŠJBˆ™]\›ˆœÛÛ”™\ÜÛœÙJÈİXØÙ\ÜÎˆYKY\ÜØYÙNˆ	ÒYˆH[XZ[^\İËH™\Ù][šÈ\È™Y[ˆÙ[‰ÈJBˆB‚ˆËÈUUˆ‘TÑUTÔÕÓÔ‘ˆYˆ
]OOH	ËØ\KØ]]Ü™\Ù]\\ÜİÛÜ™	È	‰ˆ™\]Y\İ›Y]ÙOOH	ÔÔÕ	ÊHÂˆ˜\ˆ›ÙHH]ØZ]™\]Y\İšœÛÛŠ
BˆYˆ
X›ÙKÚÙ[ˆX›ÙKœ\ÜİÛÜ™
H™]\›ˆœÛÛ‘\œ›ÜŠ	ÕÚÙ[ˆ[™™]È\ÜİÛÜ™™\]Z\™Y	ÊBˆYˆ
›ÙKœ\ÜİÛÜ™›[™İŠH™]\›ˆœÛÛ‘\œ›ÜŠ	Ô\ÜİÛÜ™]\İ™H]X\İˆÚ\˜Xİ\œÉÊBˆ˜\ˆİÙXÜ™]H[‹’•ÕÔÑPÔ‘Uˆ˜\ˆXÛÙYH]ØZ]™\šYR•Õ
›ÙKÚÙ[‹İÙXÜ™]
BˆYˆ
YXÛÙYYXÛÙYœ™\Ù]
H™]\›ˆœÛÛ‘\œ›ÜŠK	Ò[˜[YÜˆ^\™Y™\Ù]ÚÙ[‰ÊBˆYˆ
]K››İÊ
HˆXÛÙY™^
H™]\›ˆœÛÛ‘\œ›ÜŠK	Ô™\Ù]ÚÙ[ˆ\È^\™Y	ÊBˆ˜\ˆ\Ù\ˆH]ØZ][‹‘‹œ™\\™J	ÔÑSPÕ
ˆ”“ÓH\Ù\œÈÒT‘HYHÈS‘™\Ù]İÚÙ[ˆHÉÊK˜š[™
XÛÙYZY›ÙKÚÙ[ŠK™š\œİ

BˆYˆ
]\Ù\ŠH™]\›ˆœÛÛ‘\œ›ÜŠK	Ò[˜[Y™\Ù]ÚÙ[‰ÊBˆ˜\ˆ™]ÔØ[HÙ[™\˜]RY

Bˆ˜\ˆ™]Ò\ÚH]ØZ]\Ú\ÜİÛÜ™’ÑŒŠ›ÙKœ\ÜİÛÜ™™]ÔØ[
Bˆ]ØZ][‹‘‹œ™\\™J	ÕTUH\Ù\œÈÑU\ÜİÛÜ™Ú\ÚHËØ[HË™\Ù]İÚÙ[ˆH•SÒT‘HYHÉÊK˜š[™
™]Ò\Ú™]ÔØ[\Ù\‹šY
Kœ[Š
Bˆ™]\›ˆœÛÛ”™\ÜÛœÙJÈİXØÙ\ÜÎˆYKY\ÜØYÙNˆ	Ô\ÜİÛÜ™™\Ù]İXØÙ\ÜÙ[K‰ÈJBˆB‚ˆËÈTĞQÑBˆYˆ
]OOH	ËØ\Kİ\ØYÙIÈ	‰ˆ™\]Y\İ›Y]ÙOOH	ÑÑU	ÊHÂˆ˜\ˆÚÙ[ˆHÙ]ÚÙ[‘œ›ÛT™\]Y\İ
™\]Y\İ
BˆYˆ
]ÚÙ[ŠH™]\›ˆœÛÛ‘\œ›ÜŠK	Ó›İ]][XØ]Y	ÊBˆ˜\ˆİÙXÜ™]H[‹’•ÕÔÑPÔ‘Uˆ˜\ˆXÛÙYH]ØZ]™\šYR•Õ
ÚÙ[‹İÙXÜ™]
BˆYˆ
YXÛÙY
H™]\›ˆœÛÛ‘\œ›ÜŠK	Ò[˜[YÚÙ[‰ÊBˆ˜\ˆ\Ù\ˆH]ØZ][‹‘‹œ™\\™J	ÔÑSPÕ
ˆ”“ÓH\Ù\œÈÒT‘HYHÉÊK˜š[™
XÛÙYZY
K™š\œİ

BˆYˆ
]\Ù\ŠH™]\›ˆœÛÛ‘\œ›ÜŠ	Õ\Ù\ˆ›İ›İ[™	ÊBˆ˜\ˆ\ÙYH]ØZ]Ù]\ØYÙPÛİ[
[‹\Ù\‹˜\WÚÙ^JBˆ˜\ˆ[Z]H
S”Öİ\Ù\‹œ[—H	‰ˆS”Öİ\Ù\‹œ[—K›[Z]
Hˆ˜\ˆ™XÙ[H]ØZ][‹‘‹œ™\\™J	ÔÑSPÕ\›[Y\İ[\”“ÓH\ØYÙHÒT‘H\WÚÙ^HHÈÔ‘Tˆ–H[Y\İ[\TĞÈSRUL	ÊK˜š[™
\Ù\‹˜\WÚÙ^JK˜[

Bˆ™]\›ˆœÛÛ”™\ÜÛœÙJÈİ]ÎˆÈ\ÙYˆ\ÙY[Z]ˆ[Z][ˆ\Ù\‹œ[‹šX[Ù^\™Yˆ\ÕšX[^\™Y
\Ù\ŠHK™XÙ[ˆ™XÙ[œ™\İ[È×HJBˆB‚ˆËÈ’SS‘ÎˆÔ‘PUHÔ‘TˆÈÕP”ĞÔ’TSÓ‚ˆYˆ
]OOH	ËØ\KØš[[™ËØÜ™X]K[Ü™\‰È	‰ˆ™\]Y\İ›Y]ÙOOH	ÔÔÕ	ÊHÂˆ˜\ˆÚÙ[ˆHÙ]ÚÙ[‘œ›ÛT™\]Y\İ
™\]Y\İ
BˆYˆ
]ÚÙ[ŠH™]\›ˆœÛÛ‘\œ›ÜŠK	Ó›İ]][XØ]Y	ÊBˆ˜\ˆİÙXÜ™]H[‹’•ÕÔÑPÔ‘Uˆ˜\ˆXÛÙYH]ØZ]™\šYR•Õ
ÚÙ[‹İÙXÜ™]
BˆYˆ
YXÛÙY
H™]\›ˆœÛÛ‘\œ›ÜŠK	Ò[˜[YÚÙ[‰ÊBˆ˜\ˆ›ÙHH]ØZ]™\]Y\İšœÛÛŠ
Bˆ˜\ˆ[’Ù^HH›ÙKœ[‚ˆ˜\ˆ[ˆHS”ÖÜ[’Ù^WBˆYˆ
\[ˆ[’Ù^HOOH	Ùœ™YIÈ[’Ù^HOOH	Û›Û™IÊH™]\›ˆœÛÛ‘\œ›ÜŠ	Ò[˜[Y[‰ÊB‚ˆYˆ
Y[‹”–”ÒÑVWÒQY[‹”–”ÒÑVWÔÑPÔ‘U[‹”–”ÒÑVWÒQš[™^ÙŠ	Üœİ\İÉÊHOOH
HÂˆ™]\›ˆœÛÛ”™\ÜÛœÙJÈ[[ÎˆYK[ˆ[’Ù^K[[İ[ˆ[‹œšXÙH
ˆL\Nˆ[‹\HJBˆB‚ˆYˆ
[‹\HOOH	ÛÛ™Wİ[YIÊHÂˆ˜\ˆ[[İ[H[‹œšXÙH
ˆLˆ˜\ˆœ™\ÜH]ØZ]™]Ú
	ÚÎ‹ËØ\Kœ˜^›Üœ^K˜ÛÛKİŒKÛÜ™\œÉËÂˆY]Ùˆ	ÔÔÕ	ËˆXY\œÎˆÈ	Ğ]]Üš^˜][Û‰Îˆœ]]XY\Š[ŠK	ĞÛÛ[U\IÎˆ	Ø\XØ][Û‹ÚœÛÛ‰ÈKˆ›ÙNˆ”ÓÓ‹œİš[™ÚYJÈ[[İ[ˆ[[İ[İ\œ™[˜ŞNˆ	ÒS”‰Ë™XÙZ\ˆ	ÜÚİWİšX[ÉÈ
ÈXÛÙYZY
È	×ÉÈ
È]K››İÊ
K›İ\ÎˆÈ[ˆ[’Ù^K\Ù\—ÚYˆXÛÙYZYHJKˆJBˆ˜\ˆÜ™\ˆH]ØZ]œ™\ÜšœÛÛŠ
Bˆ™]\›ˆœÛÛ”™\ÜÛœÙJÈÙ^WÚYˆ[‹”–”ÒÑVWÒQÜ™\—ÚYˆÜ™\‹šY[[İ[ˆ[[İ[\Nˆ	ÛÛ™Wİ[YIË[ˆ[’Ù^HJBˆB‚ˆ˜\ˆ[’Y[•˜\ˆH–”ÔS—ÒQÖÜ[’Ù^WBˆ˜\ˆ˜^›Üœ^T[’YH[–Ü[’Y[•˜\—BˆYˆ
\˜^›Üœ^T[’Y
H™]\›ˆœÛÛ‘\œ›ÜŠL	ÔİXœØÜš\[Ûˆ[ˆ›İÛÛ™šYİ\™YˆÙ]	È
È[’Y[•˜\ˆ
È	È[ˆÛÜšÙ\ˆ[ˆ˜\œË‰ÊBˆ˜\ˆœ™\ÜˆH]ØZ]™]Ú
	ÚÎ‹ËØ\Kœ˜^›Üœ^K˜ÛÛKİŒKÜİXœØÜš\[ÛœÉËˆY]Ùˆ	ÔÔÕ	ËˆXY\œÎˆÈ	Ğ]]Üš^˜][Û‰Îˆœ]]XY\Š[ŠK	ĞÛÛ[U\IÎˆ	Ø\XØ][Û‹ÚœÛÛ‰ÈKˆ›ÙNˆ”ÓÓ‹œİš[™ÚYJÈ[—ÚYˆ˜^›Üœ^T[’Yİ\İÛY\—Û›İYNˆK]X[]NˆKİ[ØÛİ[ˆL‹›İ\ÎˆÈ[ˆ[’Ù^K\Ù\—ÚYˆXÛÙYZYHJKˆJBˆ˜\ˆİXœØÜš\[ÛˆH]ØZ]œ™\Ü‹šœÛÛŠ
BˆYˆ
İXœØÜš\[Û‹™\œ›ÜŠH™]\›ˆœÛÛ‘\œ›ÜŠL	Ô˜^›Üœ^H\œ›Üˆ	È
È
İXœØÜš\[Û‹™\œ›Ü‹™\ØÜš\[Ûˆ	Õ[šÛ›İÛ‰ÊJBˆ™]\›ˆœÛÛ”™\ÜÛœÙJÈÙ^WÚYˆ[‹”–”ÒÑVWÒQİXœØÜš\[Û—ÚYˆİXœØÜš\[Û‹šY[ˆ[’Ù^K\Nˆ	ÜİXœØÜš\[Û‰Ë[[İ[ˆ[‹œšXÙH
ˆLJBˆB‚ˆËÈ’SS‘Îˆ‘T’Q–BˆYˆ
]OOH	ËØ\KØš[[™Ëİ™\šYIÈ	‰ˆ™\]Y\İ›Y]ÙOOH	ÔÔÕ	ÊHÂˆ˜\ˆÚÙ[ˆHÙ]ÚÙ[‘œ›ÛT™\]Y\İ
™\]Y\İ
BˆYˆ
]ÚÙ[ŠH™]\›ˆœÛÛ‘\œ›ÜŠK	Ó›İ]][XØ]Y	ÊBˆ˜\ˆİÙXÜ™]H[‹’•ÕÔÑPÔ‘Uˆ˜\ˆXÛÙYH]ØZ]™\šYR•Õ
ÚÙ[‹İÙXÜ™]
BˆYˆ
YXÛÙY
H™]\›ˆœÛÛ‘\œ›ÜŠK	Ò[˜[YÚÙ[‰ÊBˆ˜\ˆ›ÙHH]ØZ]™\]Y\İšœÛÛŠ
Bˆ˜\ˆ[’Ù^HH›ÙKœ[‚ˆ˜\ˆ[ˆHS”ÖÜ[’Ù^WBˆYˆ
\[ŠH™]\›ˆœÛÛ‘\œ›ÜŠ	Ò[˜[Y[‰ÊB‚ˆYˆ
Y[‹”–”ÒÑVWÔÑPÔ‘U[‹”–”ÒÑVWÒQš[™^ÙŠ	Üœİ\İÉÊHOOH
HÂˆ˜\ˆ›İÈH™]È]J
KÒTÓÔİš[™Ê
BˆYˆ
[‹\HOOH	ÛÛ™Wİ[YIÊHÂˆ]ØZ][‹‘‹œ™\\™J	ÕTUH\Ù\œÈÑU[ˆHËšX[Üİ\YØ]HÈÒT‘HYHÉÊK˜š[™
[’Ù^K›İËXÛÙYZY
Kœ[Š
BˆH[ÙHÂˆ]ØZ][‹‘‹œ™\\™J	ÕTUH\Ù\œÈÑU[ˆHÈÒT‘HYHÉÊK˜š[™
[’Ù^KXÛÙYZY
Kœ[Š
BˆBˆ™]\›ˆœÛÛ”™\ÜÛœÙJÈİXØÙ\ÜÎˆYK[ˆ[’Ù^HJBˆB‚ˆËÈ’PSˆ™\šY[Û™K][YH^[Y[Ú]PPËTÒLM‚ˆYˆ
[‹\HOOH	ÛÛ™Wİ[YIÊHÂˆ˜\ˆ›ÙLˆH›ÙKœ˜^›Üœ^WÛÜ™\—ÚY
È	ß	È
È›ÙKœ˜^›Üœ^WÜ^[Y[ÚYˆ˜\ˆ^XİYÚYÈH]ØZ]XXÔÚLMŠ›ÙL‹[‹”–”ÒÑVWÔÑPÔ‘U
BˆYˆ
^XİYÚYÈOOH›ÙKœ˜^›Üœ^WÜÚYÛ˜]\™JHÂˆ˜\ˆ›İÌˆH™]È]J
KÒTÓÔİš[™Ê
Bˆ]ØZ][‹‘‹œ™\\™J	ÕTUH\Ù\œÈÑU[ˆHËšX[Üİ\YØ]HÈÒT‘HYHÉÊK˜š[™
[’Ù^K›İÌ‹XÛÙYZY
Kœ[Š
Bˆ™]\›ˆœÛÛ”™\ÜÛœÙJÈİXØÙ\ÜÎˆYK[ˆ[’Ù^KšX[Üİ\YØ]ˆ›İÌˆJBˆH[ÙHÂˆ™]\›ˆœÛÛ‘\œ›ÜŠ	Ô^[Y[™\šYšXØ][Ûˆ˜Z[Y	ÊBˆBˆB‚ˆËÈSÓ•Nˆ™\šYHİXœØÜš\[Ûˆ^[Y[Ú]PPËTÒLM‚ˆ˜\ˆİX’YH›ÙKœ˜^›Üœ^WÜİXœØÜš\[Û—ÚYˆ˜\ˆ^[Y[YH›ÙKœ˜^›Üœ^WÜ^[Y[ÚYˆ˜\ˆÚYÛ˜]\™HH›ÙKœ˜^›Üœ^WÜÚYÛ˜]\™BˆYˆ
\İX’Y\^[Y[Y\ÚYÛ˜]\™JH™]\›ˆœÛÛ‘\œ›ÜŠ	ÓZ\ÜÚ[™ÈİXœØÜš\[Ûˆ^[Y[]Z[ÉÊBˆ˜\ˆ›ÙL˜ˆH^[Y[Y
È	ß	È
ÈİX’Yˆ˜\ˆ^XİYÚYÌˆH]ØZ]XXÔÚLMŠ›ÙL˜‹[‹”–”ÒÑVWÔÑPÔ‘U
BˆYˆ
^XİYÚYÌˆOOHÚYÛ˜]\™JHÂˆ˜\ˆ^\™\Ğ]H™]È]J]K››İÊ
H
ÈÌ
ˆ
ˆŒ
ˆŒ
ˆL
KÒTÓÔİš[™Ê
Bˆ]ØZ][‹‘‹œ™\\™J	ÕTUH\Ù\œÈÑU[ˆHËİXœØÜš\[Û—ÚYHË[›—Ù^\™\×Ø]HÈÒT‘HYHÉÊK˜š[™
[’Ù^KİX’Y^\™\Ğ]XÛÙYZY
Kœ[Š
Bˆ™]\›ˆœÛÛ”™\ÜÛœÙJÈİXØÙ\ÜÎˆYK[ˆ[’Ù^KİXœØÜš\[Û—ÚYˆİX’YJBˆH[ÙHÂˆ™]\›ˆœÛÛ‘\œ›ÜŠ	ÔİXœØÜš\[Ûˆ^[Y[™\šYšXØ][Ûˆ˜Z[Y	ÊBˆBˆB‚ˆËÈ’SS‘ÎˆÑP’ÓÒÂˆYˆ
]OOH	ËØ\KØš[[™ËİÙXšÛÚÉÈ	‰ˆ™\]Y\İ›Y]ÙOOH	ÔÔÕ	ÊHÂˆ˜\ˆ›ÙHH]ØZ]™\]Y\İšœÛÛŠ
Bˆ˜\ˆÙXšÛÚÔÚYÈH™\]Y\İšXY\œË™Ù]
	ÖT˜^›Üœ^KTÚYÛ˜]\™IÊBˆ˜\ˆÙXšÛÚÔÙXÜ™]H[‹”–”ÕÑP’ÓÒ×ÔÑPÔ‘UˆYˆ
]ÙXšÛÚÔÙXÜ™]
H™]\›ˆœÛÛ‘\œ›ÜŠL	ÕÙXšÛÚÈÙXÜ™]›İÛÛ™šYİ\™Y	ÊBˆÂˆ˜\ˆ˜]Ğ›ÙHH”ÓÓ‹œİš[™ÚYJ›ÙJBˆ˜\ˆ^XİYÚÚYÈH]ØZ]XXÔÚLMŠ˜]Ğ›ÙKÙXšÛÚÔÙXÜ™]
BˆYˆ
ÙXšÛÚÔÚYÈOOH^XİYÚÚYÊH™]\›ˆœÛÛ‘\œ›ÜŠK	Ò[˜[YÙXšÛÚÈÚYÛ˜]\™IÊBˆBˆ˜\ˆ]™[H›ÙK™]™[ˆYˆ
]™[OOH	ÜİXœØÜš\[Û‹˜Ú\™ÙY	ÊHÂˆ˜\ˆİX’YˆH
›ÙKœ^[ØY	‰ˆ›ÙKœ^[ØYœİXœØÜš\[Ûˆ	‰ˆ›ÙKœ^[ØYœİXœØÜš\[Û‹™[]JHÈ›ÙKœ^[ØYœİXœØÜš\[Û‹™[]KšYˆ[ˆYˆ
İX’YŠHÂˆ˜\ˆ\Ù\ŒˆH]ØZ][‹‘‹œ™\\™J	ÔÑSPÕ
ˆ”“ÓH\Ù\œÈÒT‘HİXœØÜš\[Û—ÚYHÉÊK˜š[™
İX’YŠK™š\œİ

BˆYˆ
\Ù\ŒŠHÂˆ˜\ˆ^\™\Ğ]ˆH™]È]J]K››İÊ
H
ÈÌ
ˆ
ˆŒ
ˆŒ
ˆL
KÒTÓÔİš[™Ê
Bˆ]ØZ][‹‘‹œ™\\™J	ÕTUH\Ù\œÈÑU[—Ù^\™\×Ø]HÈÒT‘HYHÉÊK˜š[™
^\™\Ğ]‹\Ù\Œ‹šY
Kœ[Š
BˆBˆBˆBˆYˆ
]™[OOH	ÜİXœØÜš\[Û‹˜Ø[˜Ù[Y	ÊHÂˆ˜\ˆİX’YÈH
›ÙKœ^[ØY	‰ˆ›ÙKœ^[ØYœİXœØÜš\[Ûˆ	‰ˆ›ÙKœ^[ØYœİXœØÜš\[Û‹™[]JHÈ›ÙKœ^[ØYœİXœØÜš\[Û‹™[]KšYˆ[ˆYˆ
İX’YÊHÂˆ˜\ˆ\Ù\ŒÈH]ØZ][‹‘‹œ™\\™J	ÔÑSPÕ
ˆ”“ÓH\Ù\œÈÒT‘HİXœØÜš\[Û—ÚYHÉÊK˜š[™
İX’YÊK™š\œİ

BˆYˆ
\Ù\ŒÊHÈ]ØZ][‹‘‹œ™\\™J	ÕTUH\Ù\œÈÑU[ˆHÈÒT‘HYHÉÊK˜š[™
	Û›Û™IË\Ù\ŒËšY
Kœ[Š
HBˆBˆ™]\›ˆœÛÛ”™\ÜÛœÙJÈ™XÙZ]™YˆYHJBˆB‚ˆËÈ•SÈĞÔ‘QS”ÒÕˆYˆ
]OOH	ËØ\KÜØÜ™Y[œÚİØ[ÉÈ	‰ˆ™\]Y\İ›Y]ÙOOH	ÔÔÕ	ÊHÂˆ˜\ˆÚÙ[ˆHÙ]ÚÙ[‘œ›ÛT™\]Y\İ
™\]Y\İ
BˆYˆ
]ÚÙ[ŠH™]\›ˆœÛÛ‘\œ›ÜŠK	Ó›İ]][XØ]Y	ÊBˆ˜\ˆİÙXÜ™]H[‹’•ÕÔÑPÔ‘Uˆ˜\ˆXÛÙYH]ØZ]™\šYR•Õ
ÚÙ[‹İÙXÜ™]
BˆYˆ
YXÛÙY
H™]\›ˆœÛÛ‘\œ›ÜŠK	Ò[˜[YÚÙ[‰ÊBˆ˜\ˆ›ÙHH]ØZ]™\]Y\İšœÛÛŠ
BˆYˆ
X›ÙK˜\WÚÙ^JH™]\›ˆœÛÛ‘\œ›ÜŠ	ÓZ\ÜÚ[™È\WÚÙ^IÊBˆ˜\ˆ\Ù\ˆH]ØZ]Ù]\Ù\P\RÙ^J[‹›ÙK˜\WÚÙ^JBˆYˆ
]\Ù\ŠH™]\›ˆœÛÛ‘\œ›ÜŠK	Ò[˜[YTHÙ^IÊBˆYˆ
\Ù\‹œ[ˆOOH	Û›Û™IÊH™]\›ˆœÛÛ‘\œ›ÜŠË	Ó›ÈXİ]™H[‹ˆ\˜Ú\ÙH]Î‹ËÜÚİX\Kš[‹Øš[[™ÉÊBˆYˆ
\ÕšX[^\™Y
\Ù\ŠJH™]\›ˆœÛÛ‘\œ›ÜŠË	ÕšX[^\™Yˆ\Ü˜YH]Î‹ËÜÚİX\Kš[‹Øš[[™ÉÊBˆ˜\ˆÜ˜XÛU\›H
[‹“ÔPÓWÔÑT•‘T—ÕT“	Ú‹ËÛØØ[ÜİŒÌ	ÊH
È	ËØ\KÜØÜ™Y[œÚİØ[ÉÂˆ˜\ˆ™\ÜÛœÙHH]ØZ]™]Ú
Ü˜XÛU\›ÈY]Ùˆ	ÔÔÕ	ËXY\œÎˆÈ	ĞÛÛ[U\IÎˆ	Ø\XØ][Û‹ÚœÛÛ‰Ë	ÖTÙ\™\‹TÙXÜ™]	Îˆ[‹”ÑT•‘T—ÔÑPÔ‘U	ÉÈK›ÙNˆ”ÓÓ‹œİš[™ÚYJ›ÙJKÚYÛ˜[ˆX›ÜÚYÛ˜[[Y[İ]
LŒ
HJBˆYˆ
›ÙK\›È	‰ˆ\œ˜^Kš\Ğ\œ˜^J›ÙK\›ÊJHÈ›Üˆ
˜\ˆHHÈH›ÙK\›Ë›[™İÈJÊÊHÈ]ØZ]ÙÕ\ØYÙJ[‹›ÙK˜\WÚÙ^K›ÙK\›ÖÚWJHHBˆ˜\ˆ]HH]ØZ]™\ÜÛœÙKšœÛÛŠ
Bˆ™]\›ˆœÛÛ”™\ÜÛœÙJ]JBˆB‚ˆËÈĞÔ‘QS”ÒÕˆYˆ
]OOH	ËØ\KÜØÜ™Y[œÚİ	È	‰ˆ™\]Y\İ›Y]ÙOOH	ÑÑU	ÊHÂˆ˜\ˆ\˜[\ÈHÙ]ØÜ™Y[œÚİ\˜[\Ê\›
BˆYˆ
\\˜[\Ë\›	‰ˆ\\˜[\Ë˜İ\İÛWÚ[
H™]\›ˆœÛÛ‘\œ›ÜŠ	ÓZ\ÜÚ[™È™\]Z\™Y\˜[Y]\ˆ\›Üˆİ\İÛWÚ[	ÊBˆËÈÚXÚÈ]]Üš^˜][ÛˆXY\ˆš\œİ˜[˜XÚÈÈT“\˜[H›Üˆ[[ÈÙ^HÛ›Bˆ˜\ˆXY\’Ù^HH[ˆ˜\ˆ]]ˆH™\]Y\İšXY\œË™Ù]
	Ğ]]Üš^˜][Û‰ÊBˆYˆ
]]ˆ	‰ˆ]]‹š[™^ÙŠ	Ğ™X\™\ˆ	ÊHOOH
HXY\’Ù^HH]]‹œ™\XÙJ	Ğ™X\™\ˆ	Ë	ÉÊBˆ˜\ˆ\RÙ^HHXY\’Ù^H\˜[\Ë˜\WÚÙ^BˆYˆ
X\RÙ^JH™]\›ˆœÛÛ‘\œ›ÜŠK	ÓZ\ÜÚ[™È™\]Z\™Y\˜[Y]\ˆ\WÚÙ^Kˆ\ÙH]]Üš^˜][ÛˆXY\ˆÜˆ\WÚÙ^HT“\˜[IÊBˆËÈYˆ\Ú[™ÈT“\˜[H
›İXY\ŠKÛ›H[İÈH[[ÈÙ^BˆYˆ
ZXY\’Ù^H	‰ˆ\˜[\Ë˜\WÚÙ^H	‰ˆ\˜[\Ë˜\WÚÙ^HOOH	Ù[[ËZÙ^K\ÚİIÊHÂˆ™]\›ˆœÛÛ‘\œ›ÜŠK	Ñ›ÜˆÙXİ\š]KTHÙ^\È]\İ™HÙ[šXH]]Üš^˜][ÛˆXY\‹ˆ^[\Nˆ]]Üš^˜][Ûˆ™X\™\ˆÚ×Û]™WŞ	ÊBˆBˆ˜\ˆ\Ù\ˆH]ØZ]Ù]\Ù\P\RÙ^J[‹\RÙ^JBˆYˆ
]\Ù\ŠH™]\›ˆœÛÛ‘\œ›ÜŠK	Ò[˜[YTHÙ^KˆÙ]Û™H]Î‹ËÜÚİX\Kš[‰ÊBˆYˆ
\Ù\‹œ[ˆOOH	Û›Û™IÊH™]\›ˆœÛÛ‘\œ›ÜŠË	Ó›ÈXİ]™H[‹ˆ\˜Ú\ÙH]Î‹ËÜÚİX\Kš[‹Øš[[™ÉÊBˆYˆ
\ÕšX[^\™Y
\Ù\ŠJH™]\›ˆœÛÛ‘\œ›ÜŠË	Ö[İ\ˆËY^HšX[\È^\™Yˆ\Ü˜YH]Î‹ËÜÚİX\Kš[‹Øš[[™ÉÊBˆ˜\ˆ\ÙYH]ØZ]Ù]\ØYÙPÛİ[
[‹\RÙ^JBˆ˜\ˆ[Z]H
S”Öİ\Ù\‹œ[—H	‰ˆS”Öİ\Ù\‹œ[—K›[Z]
HˆYˆ
\ÙYH[Z]
H™]\›ˆœÛÛ‘\œ›ÜŠË	Õ\ØYÙH[Z]^ÙYYY
	È
È\ÙY
È	ËÉÈ
È[Z]
È	ÊKˆ\Ü˜YH]Î‹ËÜÚİX\Kš[‹Øš[[™ÉÊB‚ˆYˆ
\˜[\Ë™^˜Xİİ^OOH	İYIÊHÂˆ˜\ˆÜ˜XÛU\›HZ[Ü˜XÛU\›
[‹\˜[\ÊBˆHÂˆ˜\ˆ™\ÜH]ØZ]™]Ú
Ü˜XÛU\›ÈÚYÛ˜[ˆX›ÜÚYÛ˜[[Y[İ]
L
KXY\œÎˆÈ	ÖTÙ\™\‹TÙXÜ™]	Îˆ[‹”ÑT•‘T—ÔÑPÔ‘U	ÉÈHJBˆYˆ
\™\Ü›ÚÊH™]\›ˆœÛÛ‘\œ›ÜŠL	Õ^^˜Xİ[Ûˆ˜Z[Y‰ÊBˆ˜\ˆ]HH]ØZ]™\ÜšœÛÛŠ
Bˆ]ØZ]ÙÕ\ØYÙJ[‹\RÙ^K\˜[\Ë\›	Øİ\İÛWÚ[	ÊBˆ™]\›ˆœÛÛ”™\ÜÛœÙJ]JBˆHØ]Ú
JHÈ™]\›ˆœÛÛ‘\œ›ÜŠL	ĞÛİ[›İ™XXÚØÜ™Y[œÚİÙ\™\‹‰ÊHBˆB‚ˆ˜\ˆØXÚRÙ^HHZ[ØXÚRÙ^J\˜[\ÊBˆYˆ
[‹”ĞÔ‘QS”ÒÕÈ	‰ˆ\˜[\Ë™œ™\ÚOOH	İYIÊHÂˆ˜\ˆØXÚYH]ØZ][‹”ĞÔ‘QS”ÒÕË™Ù]
ØXÚRÙ^JBˆYˆ
ØXÚY
HÂˆ]ØZ]ÙÕ\ØYÙJ[‹\RÙ^K\˜[\Ë\›	Øİ\İÛWÚ[	ÊBˆ˜\ˆİH\˜[\Ë™›Ü›X]OOH	Ü‰ÈÈ	Ø\XØ][Û‹Ü‰Èˆ	Ú[XYÙKÉÈ
È\˜[\Ë™›Ü›X]ˆ™]\›ˆ™]È™\ÜÛœÙJØXÚYÈXY\œÎˆÈ	ĞÛÛ[U\IÎˆİ	ÖPØXÚIÎˆ	ÒU	Ë	ĞXØÙ\ÜËPÛÛ›ÛP[İËSÜšYÚ[‰Îˆ	ÚÎ‹ËÜÚİX\Kš[‰Ë	ÔİšXİU˜[œÜÜTÙXİ\š]IÎˆ	ÛX^XYÙOLÌMLÍŒÈ[˜ÛYTİX‘ÛXZ[œÉË	ÖPÛÛ[U\KSÜ[ÛœÉÎˆ	Û›ÜÛšY™‰Ë	ÖQœ˜[YKSÜ[ÛœÉÎˆ	ÑS–IÈHJBˆBˆB‚ˆ˜\ˆÜ˜XÛU\›ˆHZ[Ü˜XÛU\›
[‹\˜[\ÊBˆHÂˆ˜\ˆ™\ÜˆH]ØZ]™]Ú
Ü˜XÛU\›‹ÈÚYÛ˜[ˆX›ÜÚYÛ˜[[Y[İ]
L
KXY\œÎˆÈ	ÖTÙ\™\‹TÙXÜ™]	Îˆ[‹”ÑT•‘T—ÔÑPÔ‘U	ÉÈHJBˆYˆ
\™\Ü‹›ÚÊH™]\›ˆœÛÛ‘\œ›ÜŠL	ÔØÜ™Y[œÚİ˜Z[YˆHT“(might not be accessible.')
        var imageBuffer = await resp2.arrayBuffer()
        if (env.SCREENSHOTS) { await env.SCREENSHOTS.put(cacheKey, imageBuffer, { customMetadata: { url: params.url || 'custom_html', created: new Date().toISOString() } }) }
        await logUsage(env, apiKey, params.url || 'custom_html')
        var ct2 = params.format === 'pdf' ? 'application/pdf' : 'image/' + params.format
        return new Response(imageBuffer, { headers: { 'Content-Type': ct2, 'X-Cache': 'MISS', 'Access-Control-Allow-Origin': 'https://shotlyapi.in', 'Strict-Transport-Security': 'max-age=31536000; includeSubDomains', 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY' } })
      } catch (e) {
        return jsonError(500, 'Could not reach screenshot server. Try again in a few seconds.')
      }
    }

    return jsonError(404, 'Not found. Check docs at https://shotlyapi.in/docs')
  },
}

