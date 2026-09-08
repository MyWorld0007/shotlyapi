import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { useTheme, ThemeToggle } from '../lib/ThemeToggle'

const API_URL = 'https://api.shotlyapi.in'

const PLAN_LABELS = {
  none: 'No Active Plan',
  trial: 'Trial',
  starter: 'Starter',
  growth: 'Growth',
  pro: 'Pro',
}

const PLAN_LIMITS = {
  none: 0,
  trial: 100,
  starter: 2000,
  growth: 4000,
  pro: 10000,
}

export default function Dashboard() {
  const { user, logout, loading } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ used: 0, limit: 0, plan: 'none' })
  const [recent, setRecent] = useState([])
  const [copied, setCopied] = useState(false)
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    if (!loading && !user) navigate('/login')
  }, [loading, user, navigate])

  useEffect(() => {
    if (user) {
      fetch(`${API_URL}/api/usage`, {
        headers: { 'Authorization': 'Bearer ' + user.token }
      })
        .then(r => r.json())
        .then(data => {
          if (data.stats) setStats(data.stats)
          if (data.recent) setRecent(data.recent)
        })
        .catch(() => {})
    }
  }, [user])

  function copyKey() {
    navigator.clipboard.writeText(user?.api_key || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function regenerateKey() {
    if (!confirm('Are you sure? Your old API key will stop working immediately.')) return
    fetch(`${API_URL}/api/auth/regenerate`, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + user.token }
    })
      .then(r => r.json())
      .then(data => {
        if (data.api_key) {
          window.location.reload()
        }
      })
  }

  if (loading || !user) return <div className="auth-page"><p>Loading...</p></div>

  var planLabel = PLAN_LABELS[stats.plan] || 'No Active Plan'
  var planLimit = stats.limit || PLAN_LIMITS[stats.plan] || 0
  var hasPlan = stats.plan && stats.plan !== 'none'
  var pct = hasPlan ? Math.min(100, (stats.used / planLimit) * 100) : 0

  return (
    <>
      <nav>
        <div className="container nav-inner">
          <Link to="/" className="logo">
            <img src="/logo.svg" alt="ShotlyAPI" style={{width: '32px', height: '32px', borderRadius: '8px'}} />
            ShotlyAPI
          </Link>
          <div className="nav-links">
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/billing">Billing</Link>
            <Link to="/docs">Docs</Link>
            <button onClick={() => { logout(); navigate('/') }} className="btn btn-outline btn-sm">Sign Out</button>
          </div>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      </nav>

      <div className="dashboard">
        <div className="container">
          <div className="dash-grid">
            <div className="dash-sidebar">
              <h3>Menu</h3>
              <Link to="/dashboard" className="active">Overview</Link>
              <Link to="/billing">Billing</Link>
              <Link to="/docs">API Docs</Link>
            </div>
            <div className="dash-content">
              <h2>Dashboard</h2>
              <p>Welcome back, {user.email}</p>

              {/* No Active Plan Banner */}
              {!hasPlan && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(59,130,246,0.15))',
                  border: '1px solid rgba(168,85,247,0.3)',
                  borderRadius: '12px',
                  padding: '24px',
                  marginBottom: '24px',
                  textAlign: 'center'
                }}>
                  <h3 style={{ marginBottom: '8px', fontSize: '20px' }}>No Active Plan</h3>
                  <p style={{ color: 'var(--text-mute)', marginBottom: '16px' }}>
                    You need an active plan to take screenshots. Get started with a Trial for Rs.99 or choose a monthly plan.
                  </p>
                  <Link to="/billing" className="btn btn-primary">Buy a Plan</Link>
                </div>
              )}

              {/* Trial Expired Banner */}
              {hasPlan && stats.plan === 'trial' && stats.trial_expired && (
                <div style={{
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: '12px',
                  padding: '24px',
                  marginBottom: '24px',
                  textAlign: 'center'
                }}>
                  <h3 style={{ marginBottom: '8px', fontSize: '20px', color: '#ef4444' }}>Trial Expired</h3>
                  <p style={{ color: 'var(--text-mute)', marginBottom: '16px' }}>
                    Your Trial plan has expired. Upgrade to a paid plan to continue taking screenshots.
                  </p>
                  <Link to="/billing" className="btn btn-primary">Upgrade Now</Link>
                </div>
              )}

              <div className="usage-grid">
                <div className="usage-card">
                  <div className="label">Screenshots Used</div>
                  <div className="value">{stats.used} / {hasPlan ? planLimit : 0}</div>
                  {hasPlan && (
                    <div className="usage-bar"><div className="usage-bar-fill" style={{ width: pct + '%' }}></div></div>
                  )}
                </div>
                <div className="usage-card">
                  <div className="label">Current Plan</div>
                  <div className="value" style={{ textTransform: 'capitalize' }}>{planLabel}</div>
                  {hasPlan ? (
                    <div className="sub"><Link to="/billing">Upgrade plan</Link></div>
                  ) : (
                    <div className="sub"><Link to="/billing">Buy a plan</Link></div>
                  )}
                </div>
                <div className="usage-card">
                  <div className="label">Remaining</div>
                  <div className="value">{hasPlan ? (planLimit - stats.used) : 0}</div>
                  <div className="sub">{stats.plan === 'trial' ? 'trial screenshots' : 'screenshots this month'}</div>
                </div>
              </div>

              {/* Trial Info */}
              {hasPlan && stats.plan === 'trial' && !stats.trial_expired && stats.trial_expires_at && (
                <div style={{
                  background: 'rgba(34,197,94,0.1)',
                  border: '1px solid rgba(34,197,94,0.3)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  marginBottom: '24px',
                  fontSize: '14px'
                }}>
                  <strong>Trial active</strong> — Expires on {stats.trial_expires_at}. 
                  You have {planLimit - stats.used} screenshots remaining.
                </div>
              )}

              <h3 style={{ marginBottom: '12px', fontSize: '18px' }}>Your API Key</h3>
              <div className="api-key-card">
                <div className="api-key-label">API Key</div>
                <div className="api-key-value">
                  <code>{user.api_key}</code>
                  <button className="btn btn-outline btn-sm" onClick={copyKey}>{copied ? 'Copied!' : 'Copy'}</button>
                </div>
                <button className="btn btn-danger btn-sm" style={{ marginTop: '12px' }} onClick={regenerateKey}>
                  Regenerate Key
                </button>
              </div>

              <h3 style={{ marginBottom: '12px', fontSize: '18px', marginTop: '28px' }}>Recent Screenshots</h3>
              {recent.length === 0 ? (
                <p style={{ color: 'var(--text-mute)' }}>No screenshots taken yet. Try the API to see usage here.</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <th style={{ textAlign: 'left', padding: '8px', fontSize: '14px' }}>URL</th>
                      <th style={{ textAlign: 'left', padding: '8px', fontSize: '14px' }}>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((r, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '8px', fontSize: '14px', fontFamily: 'var(--mono)' }}>{r.url}</td>
                        <td style={{ padding: '8px', fontSize: '14px', color: 'var(--text-dim)' }}>{r.timestamp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
