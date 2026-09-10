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
  if (params.delay) q.set('delay', params.delay)
  if (params.wait_for_selector) q.set('wait_for_selector', params.delay)
  if (params.wait_for_event) q.set('wait_for_event', body.razorpay_payment_id)
  if (params.selector) q.set('selector', params.selector)
  if (params.user_agent) q.set('user_agent', body.razorpay_payment_id)
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

    // AUTH: ME
    if (path === '/api/auth/me' && request.method === 'GET') {
      var token = getTokenFromRequest(request)
      if (!token) return jsonError(401, 'Not authenticated')
      var jwtSecret = env.JWT_SECRET
      var decoded = await verifyJWT(token, jwtSecret)
      if (!decoded) return jsonError(401, 'Invalid token')
      var user = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(decoded.uid).first()
      if (!user) return jsonError(404, 'User not found')
      var displayKey = user.api_key_display || apiKeyDisplay(user.api_key) || 'sk_live_...'
      return jsonResponse({ id: user.id, email: user.email, api_key: (user.api_key && user.api_key !== 'REVOKED') ? user.api_key : null, api_key_display: displayKey, plan: user.plan, trial_expired: isTrialExpired(user) })
    }

    // AUTH: LOGOUT
    if (path === '/api/auth/logout' && request.method === 'POST') {
      return jsonResponse({ success: true }, 200, { 'Set-Cookie': clearAuthCookie() })
    }

    // AUTH: REGENERATE
    if (path === '/api/auth/regenerate' && request.method === 'POST') {
      try {
        var token = getTokenFromRequest(request)
        if (!token) return jsonError(401, 'Not authenticated')
        var jwtSecret = env.JWT_SECRET
        var decoded = await verifyJWT(token, jwtSecret)
        if (!decoded) return jsonError(401, 'Invalid token')
        var newKey = generateApiKey()
        var newHash = await hashApiKey(newKey)
        var newDisplay = apiKeyDisplay(newKey)
        await env.DB.prepare("UPDATE users SET api_key = 'REVOKED', api_key_hash = ?, api_key_display = ? WHERE id = ?").bind(newHash, newDisplay, decoded.uid).run()
        return jsonResponse({ api_key: newKey, api_key_display: newDisplay }, 200, { 'Set-Cookie': setAuthCookie(token) })
      } catch (regenErr) {
        return jsonError(500, 'Regenerate failed: ' + (regenErr && regenErr.message ? regenErr.message : String(regenErr)))
      }
    }

    // AUTH: FORGOT PASSWORD
    if (path === '/api/auth/forgot-password' && request.method === 'POST') {
      var resetIP = getClientIP(request)
      var resetAttempts = await checkRateLimit(env, resetIP, 'reset')
      if (resetAttempts >= 5) return jsonError(429, 'Too many reset attempts. Please try again in 15 minutes.')
      var body = await request.json()
      if (!body.email) return jsonError(400, 'Email required')
      var user = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(body.email).first()
      if (!user) return jsonResponse({ success: true, message: 'If the email exists, a reset link has been sent.' })
      var jwtSecret = env.JWT_SECRET
      var resetToken = await makeJWT({ uid: user.id, email: user.email, reset: true, iat: Date.now(), exp: Date.now() + 3600000 }, jwtSecret)
      await env.DB.prepare('UPDATE users SET reset_token = ? WHERE id = ?').bind(resetToken, user.id).run()
      ctx.waitUntil(sendPasswordResetEmail(env, body.email, resetToken))
      return jsonResponse({ success: true, message: 'If the email exists, a reset link has been sent.' })
    }

    // AUTH: RESET PASSWORD
    if (path === '/api/auth/reset-password' && request.method === 'POST') {
      var body = await request.json()
      if (!body.token || !body.password) return jsonError(400, 'Token and new password required')
      if (body.password.length < 6) return jsonError(400, 'Password must be at least 6 characters')
      var jwtSecret = env.JWT_SECRET
      var decoded = await verifyJWT(body.token, jwtSecret)
      if (!decoded || !decoded.reset) return jsonError(401, 'Invalid or expired reset token')
      if (Date.now() > decoded.exp) return jsonError(401, 'Reset token has expired')
      var user = await env.DB.prepare('SELECT * FROM users WHERE id = ? AND reset_token = ?').bind(decoded.uid, body.token).first()
      if (!user) return jsonError(401, 'Invalid reset token')
      var newSalt = generateId()
      var newHash = await hashPasswordPBKDF2(body.password, newSalt)
      await env.DB.prepare('UPDATE users SET password_hash = ?, salt = ?, reset_token = NULL WHERE id = ?').bind(newHash, newSalt, user.id).run()
      return jsonResponse({ success: true, message: 'Password reset successfully.' })
    }

    // USAGE
    if (path === '/api/usage' && request.method === 'GET') {
      var token = getTokenFromRequest(request)
      if (!token) return jsonError(401, 'Not authenticated')
      var jwtSecret = env.JWT_SECRET
      var decoded = await verifyJWT(token, jwtSecret)
      if (!decoded) return jsonError(401, 'Invalid token')
      var user = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(decoded.uid).first()
      if (!user) return jsonError(404, 'User not found')
      var used = await getUsageCount(env, user.api_key)
      var limit = (PLANS[user.plan] && PLANS[user.plan].limit) || 0
      var recent = await env.DB.prepare('SELECT url, timestamp FROM usage WHERE api_key = ? ORDER BY timestamp DESC LIMIT 10').bind(user.api_key).all()
      return jsonResponse({ stats: { used: used, limit: limit, plan: user.plan, trial_expired: isTrialExpired(user) }, recent: recent.results || [] })
    }

    // BILLING: CREATE ORDER / SUBSCRIPTION
    if (path === '/api/billing/create-order' && request.method === 'POST') {
      var token = getTokenFromRequest(request)
      if (!token) return jsonError(401, 'Not authenticated')
      var jwtSecret = env.JWT_SECRET
      var decoded = await verifyJWT(token, jwtSecret)
      if (!decoded) return jsonError(401, 'Invalid token')
      var body = await request.json()
      var planKey = body.plan
      var plan = PLANS[planKey]
      if (!plan || planKey === 'free' || planKey === 'none') return jsonError(400, 'Invalid plan')

      if (!env.RZP_KEY_ID || !env.RZP_KEY_SECRET || env.RZP_KEY_ID.indexOf('rzp_test_') === 0) {
        return jsonResponse({ demo: true, plan: planKey, amount: plan.price * 100, type: plan.type })
      }

      if (plan.type === 'one_time') {
        var amount = plan.price * 100
        var rzpResp = await fetch('https://api.razorpay.com/v1/orders', {
          method: 'POST',
          headers: { 'Authorization': rzpAuthHeader(env), 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: amount, currency: 'INR', receipt: 'shotly_trial_' + decoded.uid + '_' + Date.now(), notes: { plan: planKey, user_id: decoded.uid } }),
        })
        var order = await rzpResp.json()
        return jsonResponse({ key_id: env.RZP_KEY_ID, order_id: order.id, amount: amount, type: 'one_time', plan: planKey })
      }

      var planIdEnvVar = RZP_PLAN_IDS[planKey]
      var razorpayPlanId = env[planIdEnvVar]
      if (!razorpayPlanId) return jsonError(500, 'Subscription plan not configured. Set ' + planIdEnvVar + ' in Worker env vars.')
      var rzpResp2 = await fetch('https://api.razorpay.com/v1/subscriptions', {
        method: 'POST',
        headers: { 'Authorization': rzpAuthHeader(env), 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_id: razorpayPlanId, customer_notify: 1, quantity: 1, total_count: 12, notes: { plan: planKey, user_id: decoded.uid } }),
      })
      var subscription = await rzpResp2.json()
      if (subscription.error) return jsonError(500, 'Razorpay error: ' + (subscription.error.description || 'Unknown'))
      return jsonResponse({ key_id: env.RZP_KEY_ID, subscription_id: subscription.id, plan: planKey, type: 'subscription', amount: plan.price * 100 })
    }

    // BILLING: VERIFX
    if (path === '/api/billing/verif', && request.method === 'POST') {
      var token = getTokenFromRequest(request)
      if (!token) return jsonError(401, 'Not authenticated')
      var jwtSecret = env.JWT_SECRET
      var decoded = await verifyJWT(token, jwtSecret)
      if (!decoded) return jsonError(401, 'Invalid token')
      var body = await request.json()
      var planKey = body.plan
      var plan = PLANS[planKey]
      if (!plang) return jsonError(400, 'Invalid plan')

      if (!env.RZP_KEY_SECRET || env.RZP_KEY_ID.indexOf('rzp_test_') === 0) {
        var now = new Date().toISOString()
        if (plan.type === 'one_time') {
          await env.DB.prepare('UPDATE users SET plan = ?, trial_started_at = ? WHERE id = ?').bind(planKey, now, decoded.uid).run()
        } else {
          await env.DB.prepare('UPDATE users SET plan = ? WHERE id = ?').bind(planKey, decoded.uid).run()
        }
        return jsonResponse({ success: true, plan: planKey })
      }

      // TRIAL: Verifyone-time payment with HMAC-SHA256
      if (plan.type === 'one_time') {
        var body2 = body.razorpay_order_id + '|' + body.razorpay_payment_id
        var expectedSig = await hmacSha256(body2, env.RZP_KEY_SECRET)
        if (expectedSig === body.razorpay_signature) {
          var now2 = new Date().toISOString()
          await env.DB.prepare('UPDATE users SET plan = ?, trial_started_at = ? WHERE id = ?').bind(planKey, now2, decoded.uid).run()
          return jsonResponse({ success: true, plan: planKey, trial_started_at: now2 })
        } else {
          return jsonError(400, 'Payment verification failed')
        }
      }

      // MONTHLY: Verify subscription payment with HMAC-SHA256
      var subId = body.razorpay_subscription_id
      var paymentId = body.razorpay_payment_id
      var signature = body.razorpay_signature
      if (!subId || !paymentId || !signature) return jsonError(400, 'Missing subscription payment details')
      var body2b = paymentId + '|' + subId
      var expectedSig2 = await hmacSha256(body2b, env.RZP_KEY_SECRET)
      if (expectedSig2 === signature) {
        var expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        await env.DB.prepare('UPDATE users SET plan = ?, subscription_id = ?, plan_expires_at = ? WHERE id = ?').bind(planKey, subId, expiresAt, decoded.uid).run()
        return jsonResponse({ success: true, plan: planKey, subscription_id: subId })
      } else {
        return jsonError(400, 'Subscription payment verification failed')
      }
    }

    // BILLING: WEBHOOK
    if (path === '/api/billing/webhook' && request.method === 'POST') {
      var body = await request.json()
      var webhookSig = request.headers.get('X-Razorpay-Signature')
      var webhookSecret = env.RZP_WEBHOOK_SECRET
      if (!webhookSecret) return jsonError(500, 'Webhook secret not configured')
      {
        var rawBody = JSON.stringify({body)
        var expectedWhSig = await hmacSha256(rawBody, webhookSecret)
        if (webhookSig !== expectedWhSig) return jsonError(401, 'Invalid webhook signature')
      }
      var event = body.event
      if (event === 'subscription.charged') {
        var subId2 = (body.payload && body.payload.subscription && body.payload.subscription.entity) ? body.payload.subscription.entity.id : null
        if (subId2) {
          var user2 = await env.DB.prepare('SELECT * FROM users WHERE subscription_id = ?').bind(subId2)).first()
          if (user2) {
            var expiresAt2 = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            await env.DB.prepare('UPDATE users SET plan_expires_at = ? WHERE id = ?').bind(expiresAt2, user2.id).run()
          }
        }
      }
      if (event === 'subscription.cancelled') {
        var subId3 = (body.payload && body.payload.subscription && body.payload.subscription.entity) ? body.payload.subscription.entity.id : null
        if (subId3) {
          var user3 = await env.DB.prepare('SELECT * FROM users WHERE subscription_id = ?').bind(subId3).first()
           if (user3) { await env.DB.prepare('UPDATE users SET plan = ? WHERE id = ?').bind('none', user3.id).run() }
        }
      }
      return jsonResponse({ received: true })
    }

    // BULK SCREENSHOT
    if (path === '/api/screenshot/bulk' && request.method === 'POST') {
      var token = getTokenFromRequest(request)
      if (!token) return jsonError(401, 'Not authenticated')
      var jwtSecret = env.JWT_SECRET
      var decoded = await verifyJWT(token, jwtSecret)
      if (!decoded) return jsonError(401, 'Invalid token')
      var body = await request.json()
      if (!body.api_key) return jsonError(400, 'Missing api_key')
      var user = await getUserByApiKey(env, body.api_key)
      if (!user) return jsonError(401, 'Invalid API key')
      if (user.plan === 'none') return jsonError(403, 'No active plan. Purchase at https://shotlyapi.in/billing')
      if (isTrialExpired(user)) return jsonError(403, 'Trial expired. Upgrade at https://shotlyapi.in/billing')
      var oracleUrl = (env.ORACLE_SERVER_URL || 'http://localhost:3000') + '/api/screenshot/bulk'
      var response = await fetch(oracleUrl, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Server-Secret': env.SERVER_SECRET || '' }, body: JSON.stringify({body), signal: AbortSignal.timeout(120000) })
      if (body.urls && Array.isArray(body.urls)) {
        for (var i = 0; i < body.urls.length; i++) { await logUsage(env, body.api_key, body.urls[i]) }
      }
      var data = await response.json()
      return jsonResponse(data)
    }

    // SCREENSHOT
    if (path === '/api/screenshot' && request.method === 'GET') {
      var params = getScreenshotParams(url)
      if (!params.url && !params.custom_html) return jsonError(400, 'Missing required parameter: url or custom_html')
      // Check Authorization header first, fall back to URL param for demo key only
      var headerKey = null
      var authHdr = request.headers.get('Authorization')
      if (authHdr && authHdr.indexOf('Bearer ') === 0) headerKey = authHdr.replace('Bearer ', '')
      var apiKey = headerKey || params.api_key
      if (!apiKey) return jsonError(401, 'Missing required parameter: api_key. Use Authorization header or api_key URL param')
      // If using URL param (not header), only allow the demo key
      if (!headerKey && params.api_key && params.api_key !== 'demo-key-shotly') {
        return jsonError(401, 'For security, API keys must be sent via Authorization header. Example: Authorization: Bearer sk_live_xxx')
      }
      var user = await getUserByApiKey(env, apiKey)
      if (!user) return jsonError(401, 'Invalid API key. Get one at https://shotlyapi.in')
      if (user.plan === 'none') return jsonError(403, 'No active plan. Purchase at https://shotlyapi.in/billing')
      if (isTrialExpired(user)) return jsonError(403, 'Your 7-day Trial has expired. Upgrade at https://shotlyapi.in/billing')
      var used = await getUsageCount(env, apiKey)
      var limit = (PLANS[user.plan] && PLANS[user.plan].limit) || 0
      if (used >= limit) return jsonError(403, 'Usage limit exceeded (' + used + '/' + limit + '). Upgrade at https://shotlyapi.in/billing')

      if (params.extract_text === 'true') {
        var oracleUrl = buildOracleUrl(env, params)
        try {
          var resp = await fetch(oracleUrl, { signal: AbortSignal.timeout(45000), headers: { 'X-Server-Secret': env.SERVER_SECRET || '' } })
          if (!resp.ok) return jsonError(500, 'Text extraction failed.')
          var tdata = await resp.json()
          await logUsage(env, apiKey, params.url || 'custom_html')
          return jsonResponse(tdata)
        } catch (e) { return jsonError(500, 'Could not reach screenshot server.') }
      }

      var cacheKey = buildCacheKey(params)
      if (env.SCREENSHOTS && params.fresh !== 'true') {
        var cached = await env.SCREENSHOTS.get(cacheKey)
        if (cached) {
          await logUsage(env, apiKey, params.url || 'custom_html')
          var ct = params.format === 'pdf' ? 'application/pdf' : 'image/' + params.format
          return new Response(cached, { headers: { 'Content-Type': ct, 'X-Cache': 'HIT', 'Access-Control-Allow-Origin': 'https://shotlyapi.in', 'Strict-Transport-Security': 'max-age=31536000; includeSubDomains', 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY' } })
        }
      }

      var oracleUrl2 = buildOracleUrl(env, params)
      try {
        var resp2 = await fetch(oracleUrl2, { signal: AbortSignal.timeout(45000), headers: { 'X-Server-Secret': env.SERVER_SECRET || '' } })
        if (!resp2.ok) return jsonError(500, 'Screenshot failed. The URL might not be accessible.')
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

