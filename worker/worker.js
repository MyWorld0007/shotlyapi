// ShotlyAPI Worker v4.1 - Fixed HMAC-SHA256 signature verification
// Trial: Rs.99 one-time | Starter: Rs.499/mo | Growth: Rs.899/mo | Pro: Rs.1799/mo

const PLANS = {
  trial:   { name: 'Trial',   price: 99,  limit: 100,   type: 'one_time', duration_days: 7 },
  starter: { name: 'Starter', price: 499, limit: 2000,  type: 'subscription' },
  growth:  { name: 'Growth',  price: 899, limit: 4000,  type: 'subscription' },
  pro:     { name: 'Pro',     price: 1799, limit: 10000, type: 'subscription' },
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
}

function jsonResponse(data, status) {
  if (!status) status = 200
  return new Response(JSON.stringify(data), { status: status, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': 'https://shotlyapi.in', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization', 'Strict-Transport-Security': 'max-age=31536000; includeSubDomains', 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY' } })
}

function js