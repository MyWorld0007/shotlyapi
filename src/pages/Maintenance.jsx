import React, { useState, useEffect } from 'react'

const API_URL = 'https://api.shotlyapi.in'

const css = `
@keyframes mgear-cw { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
@keyframes mgear-ccw { from { transform: rotate(0deg) } to { transform: rotate(-360deg) } }
@keyframes mfloat { 0%, 100% { transform: translateY(0px) } 50% { transform: translateY(-14px) } }
@keyframes mpulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.3 } }
@keyframes morb { 0%, 100% { transform: translate(0,0) scale(1); opacity: 0.5 } 50% { transform: translate(30px,-20px) scale(1.1); opacity: 0.8 } }
@keyframes mscan { 0% { left: -35% } 100% { left: 105% } }
`

export default function Maintenance() {
  const [dots, setDots] = useState(1)

  useEffect(() => {
    let active = true
    async function check() {
      try {
        const res = await fetch(`${API_URL}/api/maintenance`)
        const data = await res.json().catch(() => ({}))
        if (active && data && data.maintenance === false) {
          window.location.href = '/'
        }
      } catch (e) {}
    }
    check()
    const id = setInterval(check, 15000)
    return () => { active = false; clearInterval(id) }
  }, [])

  useEffect(() => {
    const id = setInterval(() => setDots(d => (d % 3) + 1), 450)
    return () => clearInterval(id)
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #0f1117 0%, #14161f 50%, #0f1117 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', overflow: 'hidden', fontFamily: 'Outfit, sans-serif', color: '#e4e7ee' }}>
      <style>{css}</style>

      {/* glowing orbs */}
      <div style={{ position: 'absolute', width: '420px', height: '420px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.18), transparent 70%)', top: '-120px', left: '-120px', animation: 'morb 9s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', width: '380px', height: '380px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.14), transparent 70%)', bottom: '-100px', right: '-100px', animation: 'morb 11s ease-in-out infinite reverse' }} />

      <div style={{ maxWidth: '620px', width: '100%', textAlign: 'center', position: 'relative' }}>
        {/* gear cluster */}
        <div style={{ position: 'relative', height: '140px', marginBottom: '8px' }}>
          <div style={{ fontSize: '84px', position: 'absolute', left: 'calc(50% - 46px)', top: '10px', animation: 'mgear-cw 9s linear infinite', display: 'inline-block', filter: 'drop-shadow(0 8px 24px rgba(99,102,241,0.35))' }}>{'\u2699'}</div>
          <div style={{ fontSize: '46px', position: 'absolute', left: 'calc(50% + 30px)', top: '62px', animation: 'mgear-ccw 6s linear infinite', display: 'inline-block', filter: 'drop-shadow(0 4px 12px rgba(139,92,246,0.3))' }}>{'\u2699'}</div>
          <div style={{ fontSize: '40px', position: 'absolute', left: 'calc(50% - 78px)', top: '58px', animation: 'mfloat 3.5s ease-in-out infinite', display: 'inline-block' }}>{'\u{1F916}'}</div>
        </div>

        {/* badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '999px', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', marginBottom: '20px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b', animation: 'mpulse 1.6s ease-in-out infinite' }} />
          <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', color: '#f59e0b' }}>SCHEDULED MAINTENANCE</span>
        </div>

        <h1 style={{ fontSize: '38px', fontWeight: 800, margin: '0 0 14px', lineHeight: 1.2 }}>
          We're making ShotlyAPI{' '}
          <span style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>even faster</span>
        </h1>

        <p style={{ fontSize: '16px', color: '#8b92a5', lineHeight: 1.7, margin: '0 auto 32px', maxWidth: '480px' }}>
          We're briefly offline while we ship an update. Your account, API keys, and usage data are
          all safe — nothing will be lost. We'll be back online shortly.
        </p>

        {/* status card */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px 24px', maxWidth: '440px', margin: '0 auto' }}>
          <div style={{ position: 'relative', height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden', marginBottom: '14px' }}>
            <div style={{ position: 'absolute', top: 0, width: '30%', height: '100%', borderRadius: '3px', background: 'linear-gradient(90deg, transparent, #6366f1, transparent)', animation: 'mscan 2.2s ease-in-out infinite' }} />
          </div>
          <p style={{ margin: 0, fontSize: '13px', color: '#8b92a5' }}>
            {'\u{1F50D}'} Checking status{'.'.repeat(dots)}
          </p>
          <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#565e73' }}>
            This page refreshes automatically the moment we're back.
          </p>
        </div>

        <p style={{ marginTop: '40px', fontSize: '12px', color: '#565e73' }}>{'\u00A9'} 2026 ShotlyAPI — Built with Cloudflare Workers, D1, and R2.</p>
      </div>
    </div>
  )
}
